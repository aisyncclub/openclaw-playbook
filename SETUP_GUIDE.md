# AI싱크클럽 성장 전략팀 — 셋업 가이드

## 개요

AI싱크클럽 사업 레버리지를 위한 AI 전략 에이전트 팀 (5인)

| 에이전트 | 역할 | 레버리지 |
|----------|------|---------|
| 전략봇 (팀장) | 3개 사업 통합 조율 | 의사결정 자동화 |
| 리서치봇 | 트렌드/경쟁/도구 스캔 | 시간 → 지식 |
| 콘텐츠봇 | 유튜브 기획/스크립트 | 지식 → 콘텐츠 |
| 퍼널봇 | 리드/전환/상품 설계 | 콘텐츠 → 수익 |
| 분석봇 | 통합 데이터 분석 | 데이터 → 인사이트 |

**Gateway 포트**: 18790 (AI싱크클럽 운영팀 18789와 별도)

---

## Phase 1: 텔레그램 설정

### 1-1. 봇 생성 (5개)

텔레그램에서 `@BotFather`에게:

```
/newbot
이름: AI싱크클럽 전략봇
username: aisyncclub_strategy_bot

/newbot
이름: AI싱크클럽 리서치봇
username: aisyncclub_research_bot

/newbot
이름: AI싱크클럽 콘텐츠봇
username: aisyncclub_content_bot

/newbot
이름: AI싱크클럽 퍼널봇
username: aisyncclub_funnel_bot

/newbot
이름: AI싱크클럽 분석봇
username: aisyncclub_analysis_bot
```

각 봇의 토큰(예: `123456789:ABC-xxx`)을 메모.

### 1-2. 봇 프라이버시 해제

각 봇에 대해:
```
@BotFather → /setprivacy → 봇 선택 → Disable
```

### 1-3. 포럼 그룹 생성

1. 텔레그램에서 **그룹 생성** → 이름: "성장 전략팀"
2. **그룹 설정** → **Topics** 활성화
3. 토픽 생성:
   - `#전략` (전략봇)
   - `#리서치` (리서치봇)
   - `#콘텐츠` (콘텐츠봇)
   - `#퍼널` (퍼널봇)
   - `#분석` (분석봇)
   - `#공지사항`
   - `#긴급`
4. 5개 봇을 그룹에 **관리자로 추가**
5. 그룹 Chat ID 확인: `@userinfobot`을 그룹에 추가 후 확인 → 바로 제거
6. 각 토픽의 Thread ID 확인: 토픽 메시지 URL에서 `thread/xxxxx` 부분

### 1-4. 내 Telegram ID 확인

`@userinfobot`에게 DM → 내 ID 메모

---

## Phase 2: 모델 인증

### Codex Pro OAuth (1순위 — $200/월 정액)

AI싱크클럽 운영팀과 동일한 Codex Pro 계정 사용 가능 (추가 비용 없음).

```bash
openclaw onboard --auth-choice openai-codex
# 또는
openclaw models auth login --provider openai-codex
```

### OpenAI API (2순위 fallback)

- `platform.openai.com` → API Keys → 새 키 생성
- 월간 사용량 제한 설정 권장 ($10)

### Claude API (3순위 fallback)

- `console.anthropic.com` → API Keys → 새 키 생성
- 월간 사용량 제한 설정 필수 ($20)
- **⚠️ 주의**: OAuth 토큰(`sk-ant-sid-xxx`) 절대 사용 금지! API Key(`sk-ant-api01-xxx`)만 사용

---

## Phase 3: 환경 설정

### .env 생성

```bash
cp .openclaw/.env.example .openclaw/.env
```

`.env` 파일을 열고 실제 값 입력:
- API 키 (Phase 2에서 획득)
- 봇 토큰 5개 (Phase 1-1에서 획득)
- 그룹 ID + 토픽 ID 5개 (Phase 1-3에서 획득)
- 내 Telegram ID (Phase 1-4에서 획득)

---

## Phase 4: 검증 및 실행

### 구조 검증

```bash
chmod +x test-agents.sh
./test-agents.sh
```

### 로컬 테스트

```bash
# 방법 1: 직접 실행
openclaw gateway

# 방법 2: Docker
docker-compose up -d
docker logs -f openclaw-growth-strategy
```

### 헬스 확인

```bash
openclaw doctor
# 또는
curl http://localhost:18790/health
```

### 텔레그램 테스트

각 토픽에서 봇에게 메시지 전송:
- `#전략` → "이번 주 브리핑 해줘"
- `#리서치` → "최근 AI 커머스 트렌드 알려줘"
- `#콘텐츠` → "이번 주 영상 기획해줘"
- `#퍼널` → "퍼널 현황 보여줘"
- `#분석` → "오늘 대시보드 보여줘"

---

## Phase 5: GCP 프로덕션 배포

### VM 생성

```bash
gcloud compute instances create openclaw-growth \
  --zone=asia-northeast3-a \
  --machine-type=e2-small \
  --boot-disk-size=20GB \
  --image-family=cos-stable \
  --image-project=cos-cloud
```

### 파일 업로드 및 실행

```bash
# 파일 전송
gcloud compute scp --recurse ./ openclaw-growth:~/openclaw-growth/ \
  --zone=asia-northeast3-a

# SSH 접속 후 실행
gcloud compute ssh openclaw-growth --zone=asia-northeast3-a
cd ~/openclaw-growth
docker-compose up -d

# 로그 확인
docker logs -f openclaw-growth-strategy
```

---

## 월간 비용

| 항목 | 비용 | 비고 |
|------|------|------|
| Codex Pro | $0 추가 | 운영팀과 공유 ($200 이미 지불 중) |
| OpenAI API fallback | ~$0-5 | Codex 장애 시만 사용 |
| Claude API fallback | ~$0-2 | 최후 수단, $20 cap |
| GCP e2-small | ~$12 | 운영팀 서버와 별도 or 공유 가능 |
| **합계** | **~$12-19/월 추가** | Codex Pro 공유 시 |

---

## 트러블슈팅

### 봇이 응답하지 않을 때
1. `openclaw doctor` 실행
2. `.env` 봇 토큰 형식 확인
3. 봇 프라이버시 설정 확인 (Disable 상태여야 함)
4. 봇이 그룹 관리자인지 확인

### Gateway가 시작되지 않을 때
1. 포트 18790 사용 중인지 확인: `lsof -i :18790`
2. Docker 로그 확인: `docker logs openclaw-growth-strategy`
3. `.env` 파일 경로 확인

### 모델 인증 오류
1. Codex Pro OAuth 토큰 갱신: `openclaw models auth login --provider openai-codex`
2. API Key 유효성 확인
3. Claude OAuth 사용 여부 확인 (API Key만 사용!)
