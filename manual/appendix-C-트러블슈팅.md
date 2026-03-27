# 부록 C — 트러블슈팅 가이드

> 가장 흔하게 발생하는 문제 10가지와 해결 방법을 정리합니다.

---

## 1. Gateway가 시작되지 않는다

### 원인
- **포트 충돌**: 기본 포트(18789)를 다른 프로세스가 점유 중
- **설정 파일 오류**: `openclaw.json`에 JSON 문법 에러 존재
- **API 키 미설정**: 필수 환경변수(`ANTHROPIC_API_KEY` 등)가 설정되지 않음

### 진단

```bash
# 포트 충돌 확인
lsof -i :18789

# 전체 진단 실행
openclaw doctor
```

`openclaw doctor`는 설정 파일 문법, API 키 유효성, 포트 상태를 한 번에 점검합니다.

### 해결

```bash
# 방법 1: 포트 변경 (openclaw.json)
{
  "gateway": {
    "port": 18790
  }
}

# 방법 2: 자동 수정 시도
openclaw doctor --fix

# 방법 3: 기존 프로세스 종료 후 재시작
kill $(lsof -t -i :18789)
openclaw gateway start
```

---

## 2. 텔레그램에서 응답이 없다

### 원인
- **봇 토큰 오류**: 토큰이 잘못되었거나 만료됨
- **프라이버시 설정**: 봇이 그룹 메시지를 읽을 수 없는 상태
- **그룹 관리자 미설정**: 봇이 그룹의 관리자로 지정되지 않음

### 진단

```bash
# Gateway 로그에서 텔레그램 관련 에러 확인
tail -f ~/.openclaw/logs/gateway.log | grep -i telegram

# 봇 토큰 유효성 테스트
curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe
```

로그에 `401 Unauthorized`가 보이면 토큰 문제, `403 Forbidden`이면 권한 문제입니다.

### 해결

1. **프라이버시 설정 변경**: BotFather에서 `/setprivacy` 명령 후 `Disable` 선택
2. **봇을 관리자로 추가**: 그룹 설정 → 관리자 → 봇 추가
3. **토큰 재발급**: BotFather에서 `/revoke` → `/newbot`으로 새 토큰 발급 후 `.env` 업데이트

---

## 3. Slack에서 응답이 없다

### 원인
- **Socket Mode 미활성화**: Slack App에서 Socket Mode가 꺼져 있음
- **이벤트 구독 누락**: 필요한 이벤트(`message.channels`, `app_mention` 등)가 구독되지 않음
- **채널 미초대**: 봇이 해당 채널에 초대되지 않음

### 진단

1. [Slack App 설정 페이지](https://api.slack.com/apps)에서 **Connections** 탭 확인 → 연결 상태가 "Connected"인지 확인
2. **Event Subscriptions** 탭에서 구독된 이벤트 목록 확인
3. Gateway 로그 확인:

```bash
tail -f ~/.openclaw/logs/gateway.log | grep -i slack
```

### 해결

```bash
# 1. Socket Mode 활성화
# Slack App 설정 → Socket Mode → Enable Socket Mode 토글 ON

# 2. 이벤트 구독 추가
# Event Subscriptions → Subscribe to bot events → 추가:
#   - message.channels
#   - message.groups
#   - message.im
#   - app_mention

# 3. 채널에 봇 초대
/invite @봇이름
```

---

## 4. "API Key is invalid" 에러

### 원인
- **키 복사 시 공백/줄바꿈 포함**: 키 앞뒤에 보이지 않는 문자가 포함됨
- **키 만료**: API 키가 비활성화되었거나 삭제됨
- **잔액 부족**: 크레딧이 소진되어 키가 비활성 상태

### 해결

```bash
# 1. .env 파일에서 키 앞뒤 공백/줄바꿈 확인
cat -A .env | grep API_KEY
# 끝에 ^M(캐리지 리턴)이나 공백이 보이면 제거

# 2. 키 유효성 직접 테스트
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "content-type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":10,"messages":[{"role":"user","content":"hi"}]}'
```

3. [console.anthropic.com](https://console.anthropic.com)에서 확인:
   - API Keys 탭 → 키 상태가 Active인지 확인
   - Billing 탭 → 잔액 확인 및 충전

4. 키를 새로 복사하여 `.env`에 붙여넣기 (따옴표 없이):

```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxx
```

---

## 5. 하트비트가 실행되지 않는다

### 원인
- **activeHours 범위 밖**: 현재 시간이 설정된 활성 시간 범위에 해당하지 않음
- **HEARTBEAT.md 없음**: 워크스페이스에 HEARTBEAT.md 파일이 존재하지 않음
- **Gateway 중지 상태**: Gateway 프로세스가 실행되고 있지 않음

### 진단

```bash
# 등록된 크론/하트비트 목록 확인
openclaw cron list

# 현재 시간과 activeHours 비교
date +"%H:%M"
cat openclaw.json | grep -A 5 activeHours

# Gateway 상태 확인
openclaw gateway status
```

### 해결

1. **activeHours 범위 조정** (`openclaw.json`):

```json
{
  "heartbeat": {
    "activeHours": {
      "start": "08:00",
      "end": "22:00",
      "timezone": "Asia/Seoul"
    }
  }
}
```

2. **HEARTBEAT.md 생성**: 워크스페이스 루트에 HEARTBEAT.md 파일을 생성하고 하트비트 지시 내용 작성

3. **Gateway 재시작**:

```bash
openclaw gateway start
```

---

## 6. 에이전트가 메모리를 잊어버린다

### 원인
- **세션 초기화**: idle timeout(기본 30분)이 경과하여 세션이 리셋됨
- **컴팩션으로 정보 손실**: 컨텍스트 윈도우 초과 시 자동 컴팩션이 발생하며 세부 정보가 유실됨

### 해결

1. **중요한 정보는 명시적으로 메모리에 기록 요청**:

```
"이 내용을 메모리에 기록해줘: 김대표 선호 보고 형식은 3줄 요약 + 표 형식"
```

2. **MEMORY.md에 핵심 정보를 직접 추가**:

```markdown
# MEMORY.md

## 고객 선호도
- 김대표: 보고서는 3줄 요약 + 표 형식 선호
- 이팀장: Slack DM보다 채널 멘션 선호

## 업무 규칙
- 보고서는 항상 PDF로 변환 후 발송
- 정산은 매월 25일까지 완료
```

3. **idle timeout 조정** (`openclaw.json`):

```json
{
  "session": {
    "idleTimeoutMinutes": 60
  }
}
```

---

## 7. 에이전트가 다른 에이전트에게 메시지를 보내지 못한다

### 원인
- **agentToAgent 비활성화**: `openclaw.json`에서 `agentToAgent.enabled`가 `false`로 설정됨
- **allow 목록에 미포함**: 대상 에이전트가 허용 목록에 없음

### 진단

```bash
# openclaw.json에서 agentToAgent 설정 확인
cat openclaw.json | grep -A 10 agentToAgent
```

### 해결

`openclaw.json`에서 `tools.agentToAgent` 설정을 확인하고 수정합니다:

```json
{
  "tools": {
    "agentToAgent": {
      "enabled": true,
      "allow": [
        "growth-agent",
        "ops-agent",
        "cs-agent"
      ]
    }
  }
}
```

- `enabled`를 `true`로 변경
- `allow` 배열에 통신 대상 에이전트의 이름을 추가
- 양방향 통신이 필요하면 **양쪽 에이전트 모두**에서 상대를 allow에 추가

---

## 8. 토큰 비용이 예상보다 높다

### 원인
- **불필요한 파일 반복 읽기**: 에이전트가 매 세션마다 대용량 파일을 다시 읽음
- **CLI 출력 과다**: 스크립트 실행 결과가 지나치게 길어 토큰을 낭비
- **Opus 모델 과다 사용**: 단순 작업에도 고비용 모델을 사용

### 해결

1. **RTK(Read-Through Cache) 설치**:

```bash
openclaw plugin install rtk
```

자주 읽는 파일을 캐싱하여 반복 읽기를 줄입니다.

2. **lightContext 활성화** (`openclaw.json`):

```json
{
  "session": {
    "lightContext": true
  }
}
```

불필요한 컨텍스트 로드를 최소화합니다.

3. **기본 모델을 Sonnet으로 변경**:

```json
{
  "model": {
    "default": "claude-sonnet-4-20250514",
    "complex": "claude-opus-4-20250514"
  }
}
```

일반 작업은 Sonnet, 복잡한 판단이 필요한 작업만 Opus를 사용합니다.

4. **토큰 사용량 모니터링**:

```bash
openclaw usage --period today
openclaw usage --period month
```

---

## 9. 서브에이전트(sessions_spawn)가 엉뚱한 결과를 낸다

### 원인
- **SOUL.md 미로딩**: 서브에이전트는 메인 에이전트의 SOUL.md를 자동으로 상속하지 않을 수 있음
- **지시가 모호**: "적절히 처리해줘" 같은 추상적인 지시로 스폰한 경우

### 해결

1. **지시문에 구체적 스펙을 포함** (What / Why / Standard / Deadline):

```
# BAD
"이 데이터 정리해줘"

# GOOD
"매출 CSV에서 2026년 3월 데이터만 추출하고,
 사업부별로 그룹핑하여 합계를 구해줘.
 출력 형식은 마크다운 테이블.
 소수점 둘째자리까지 표시.
 5분 내 완료."
```

2. **필요한 컨텍스트를 명시적으로 전달**:

```typescript
sessions_spawn({
  instruction: `
    다음 규칙을 따르세요:
    - 통화 단위: 원(₩), 천 단위 콤마
    - 날짜 형식: YYYY-MM-DD
    - 에러 시 빈 값 대신 "N/A" 표시

    작업: ...
  `
})
```

3. **결과 검증 단계 추가**: 서브에이전트 결과를 메인 에이전트가 검증 후 사용

---

## 10. openclaw.json 수정 후 반영이 안 된다

### 원인
- **Hot Reload 대상이 아닌 필드 수정**: `gateway.port`, `gateway.host` 등 일부 필드는 프로세스 재시작이 필요
- **JSON 문법 에러**: 수정 과정에서 문법 에러가 발생하여 변경 사항이 무시됨

### 진단

```bash
# JSON 문법 검증
cat openclaw.json | python3 -m json.tool > /dev/null

# 현재 적용된 설정 확인
openclaw config show
```

### 해결

1. **Hot Reload 가능한 필드** (재시작 불필요):
   - `heartbeat.*`
   - `session.*`
   - `tools.*`
   - `model.*`

2. **재시작이 필요한 필드**:
   - `gateway.port`
   - `gateway.host`
   - `channels.*`

3. **Gateway 재시작**:

```bash
openclaw gateway restart
```

또는 프로세스를 직접 재시작:

```bash
openclaw gateway stop
openclaw gateway start
```

4. **변경 사항 확인**:

```bash
# 재시작 후 적용된 설정 확인
openclaw config show | grep -A 5 <변경한_섹션>
```

---

## 빠른 진단 체크리스트

문제가 발생했을 때 아래 순서로 확인하세요:

```bash
# 1. Gateway 상태 확인
openclaw gateway status

# 2. 전체 시스템 진단
openclaw doctor

# 3. 최근 로그 확인
tail -50 ~/.openclaw/logs/gateway.log

# 4. 설정 파일 검증
openclaw config show

# 5. API 키 상태 확인
openclaw doctor --check api-keys
```
