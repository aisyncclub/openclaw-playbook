# Ch.13 Claude Code 하이브리드 전략

OpenClaw는 상시 돌아가는 AI 비서입니다. Claude Code는 터미널에서 코드를 짜는 AI 개발자입니다. 둘 다 강력하지만, 잘하는 영역이 다릅니다.

이 챕터에서는 두 도구를 **같이** 쓰는 방법을 다룹니다. F1 레이싱카와 자율주행 택시를 동시에 운영하는 전략입니다.

---

## OpenClaw vs Claude Code 비교

비유부터 정리하겠습니다.

**OpenClaw = F1 레이싱카**
- 직접 세팅하고, 직접 튜닝하고, 직접 몰아야 합니다
- 세팅만 잘하면 극한의 성능을 뽑을 수 있습니다
- 하지만 관리가 필요합니다 (서버, 설정 파일, Docker)

**Claude Code = 자율주행 택시**
- 타면 알아서 갑니다
- 설치도 간단하고, 업데이트도 자동입니다
- Anthropic이 직접 관리하니 안정적입니다
- 하지만 내가 원하는 대로 세밀하게 제어하기는 어렵습니다

---

## 기능 매핑 테이블

OpenClaw의 기능이 Claude Code에서는 어떻게 대응되는지, 갭은 무엇인지 정리했습니다.

| OpenClaw 기능 | Claude Code 대응 | 갭(차이점) |
|--------------|------------------|-----------|
| **Gateway** (상시 메시징) | 터미널 + Channels | Claude Code는 세션 기반. 상시 대기 불가. 메신저 지원 제한적 |
| **SOUL.md** (에이전트 성격) | CLAUDE.md + 서브에이전트 | 완전 대응 가능. CLAUDE.md가 동일한 역할 |
| **HEARTBEAT.md** (스케줄링) | `/loop` + CronCreate | 세션 종료 시 소멸. 영구 스케줄링에 약함 |
| **agents** (멀티 에이전트) | Agent tool + Agent Teams | 가능하지만 세션 내 한정. 에이전트 간 상시 소통은 불가 |
| **sessions_send** (에이전트 간 통신) | SendMessage | 단방향 제한. OpenClaw처럼 양방향 자유 통신은 어려움 |
| **텔레그램 연동** | Channels (Telegram) | 가능. MCP 통해 연결 |
| **ClawFlows** (워크플로우) | Skills + Hooks | 승인 게이트(human-in-the-loop) 없음 |
| **20+ 메신저 지원** | Telegram + Discord만 | 큰 갭. 카카오톡, 슬랙, 라인 등 지원 부족 |

### 핵심 요약

- **OpenClaw가 강한 곳**: 상시 가동, 메신저 다양성, 스케줄링, 워크플로우 자동화
- **Claude Code가 강한 곳**: 코딩, 파일 시스템 접근, git 워크플로우, 깊은 분석, 보안

---

## 하이브리드 아키텍처

두 도구를 결합하면 각자의 약점을 보완할 수 있습니다.

### 역할 분담

```
┌─────────────────────────────────────────────────────┐
│                    하이브리드 시스템                      │
│                                                     │
│  ┌──────────────────┐    ┌──────────────────┐      │
│  │    OpenClaw       │    │   Claude Code     │      │
│  │                  │    │                  │      │
│  │ • 상시 메시징     │◄──►│ • 코딩/개발       │      │
│  │ • 스케줄링       │    │ • 깊은 분석       │      │
│  │ • Life-OS        │    │ • Git 워크플로우   │      │
│  │ • 멀티 메신저    │    │ • 파일 시스템     │      │
│  │ • 텔레그램 알림  │    │ • 테스트 자동화   │      │
│  └──────────────────┘    └──────────────────┘      │
│           │                      │                  │
│           └──────┬───────────────┘                  │
│                  │                                  │
│        openclaw-claude-code-skill (MCP)             │
└─────────────────────────────────────────────────────┘
```

### OpenClaw 담당

- **상시 메시징**: 텔레그램/카카오톡으로 24시간 대기
- **스케줄링**: HEARTBEAT.md로 정기 작업 자동 실행
- **Life-OS**: 일정 관리, 알림, 루틴 관리
- **멀티 플랫폼**: 20개 이상 메신저 동시 지원

### Claude Code 담당

- **코딩**: 프로젝트 개발, 버그 수정, 리팩토링
- **깊은 분석**: 대량 데이터 처리, 복잡한 리서치
- **Git 워크플로우**: 커밋, PR, 코드 리뷰
- **파일 시스템**: 로컬 파일 읽기/쓰기/편집

### 연결점: MCP (Model Context Protocol)

두 도구를 연결하는 다리가 MCP입니다. OpenClaw에서 Claude Code의 기능을 호출하거나, 그 반대도 가능합니다.

```json
// OpenClaw 설정에서 Claude Code MCP 연결
{
  "tools": {
    "claude-code": {
      "type": "mcp",
      "endpoint": "localhost:3000",
      "capabilities": ["code_edit", "file_read", "git_commit"]
    }
  }
}
```

이미 커뮤니티에서 이런 연결을 시도한 프로젝트들이 있습니다.

---

## 이미 존재하는 프로젝트들

### ClaudeClaw

OpenClaw와 Claude Code를 직접 연결하는 커뮤니티 프로젝트입니다.

- OpenClaw 에이전트가 Claude Code CLI를 호출
- 코딩이 필요한 작업을 자동으로 Claude Code에 위임
- 결과를 다시 OpenClaw 에이전트가 받아서 보고

### Praktor

Claude Code 기반의 에이전트 프레임워크입니다.

- Claude Code의 Agent tool을 활용한 멀티 에이전트 시스템
- OpenClaw의 SOUL.md와 유사한 에이전트 설정 파일 지원
- 주로 개발 워크플로우에 특화

### 기타 통합 시도들

- **MCP 브릿지**: OpenClaw MCP 서버를 Claude Code에서 사용
- **Webhook 연동**: OpenClaw → Webhook → Claude Code 트리거
- **공유 파일 시스템**: 두 도구가 같은 디렉토리를 읽고 쓰는 방식

---

## Claude Agent SDK

Anthropic이 공식으로 제공하는 에이전트 개발 도구입니다. Claude Code 생태계의 핵심 부품입니다.

### 지원 언어

- **Python**: `pip install claude-agent-sdk`
- **TypeScript**: `npm install @anthropic-ai/agent-sdk`

### 빌트인 도구

Agent SDK에는 기본 도구가 포함되어 있습니다:

- **컴퓨터 사용**: 화면을 보고 마우스/키보드 조작
- **파일 편집**: 코드 읽기/쓰기
- **웹 검색**: 실시간 정보 수집
- **코드 실행**: 샌드박스에서 코드 실행

### 세션 관리

```python
from claude_agent_sdk import Agent, Session

# 에이전트 생성
researcher = Agent(
    name="researcher",
    instructions="시장 조사를 담당합니다.",
    model="claude-sonnet-4-20250514"
)

# 세션 시작
session = Session(agent=researcher)
response = session.run("AI 커머스 최신 트렌드를 조사해주세요")
```

OpenClaw의 에이전트 개념과 유사하지만, 코드로 제어한다는 차이가 있습니다.

---

## Agent Teams

Claude Code의 Agent Teams 기능은 여러 에이전트가 협력하는 구조입니다. 이미 인상적인 사례가 나왔습니다.

### 사례: 16 에이전트가 C 컴파일러 작성

Anthropic 내부 실험에서 16개의 Claude Code 에이전트가 팀을 이뤄 **10만 줄 규모의 C 컴파일러**를 작성했습니다.

- 각 에이전트가 서로 다른 모듈을 담당 (렉서, 파서, 코드 생성 등)
- 에이전트 간 SendMessage로 인터페이스 협의
- 전체 조율은 리드 에이전트가 담당

이것은 OpenClaw의 멀티 에이전트 구조와 개념적으로 동일합니다. 다만 Claude Code Agent Teams는 **개발 작업에 특화**되어 있습니다.

### OpenClaw 멀티 에이전트 vs Claude Code Agent Teams

| 비교 항목 | OpenClaw | Claude Code Agent Teams |
|----------|----------|----------------------|
| 최적 용도 | 비즈니스 운영, 생활 자동화 | 소프트웨어 개발 |
| 에이전트 수 | 제한 없음 | 세션 내 제한 |
| 실행 방식 | 상시 가동 (서버) | 세션 기반 (터미널) |
| 통신 방식 | sessions_send (양방향) | SendMessage (에이전트 내) |
| 스케줄링 | HEARTBEAT.md (영구) | /loop, CronCreate (세션 한정) |
| 외부 연동 | 20+ 메신저 | Telegram, Discord |

---

## 실전 조합 패턴

하이브리드를 실제로 어떻게 쓰는지 하루 흐름으로 보여드리겠습니다.

### 패턴 1: 낮에는 Claude Code, 밤에는 OpenClaw

```
06:00  [OpenClaw] 분석봇이 일일 대시보드를 텔레그램으로 전송
07:00  [OpenClaw] 리서치봇이 AI 도구 트렌드를 모니터링
08:00  [OpenClaw] 전략봇이 오늘의 우선순위를 정리

09:00  [Claude Code] 출근. SaaS 프로젝트 코딩 시작
12:00  [Claude Code] 버그 수정, PR 생성
14:00  [Claude Code] 데이터 분석 스크립트 작성

18:00  [OpenClaw] 퍼널봇이 오늘의 전환 데이터 정리
20:00  [OpenClaw] 콘텐츠봇이 내일 스크립트 초안 작성
22:00  [OpenClaw] 리서치봇이 해외 시장 리서치 (시차 활용)

02:00  [OpenClaw] 분석봇이 야간 매출 이상치 감지 → 긴급 알림
```

### 패턴 2: Claude Code Channels로 텔레그램 알림

Claude Code의 Channels 기능을 사용하면 텔레그램으로 알림을 보낼 수 있습니다.

```
[Claude Code] 빌드 완료 → Channels(Telegram) → "SaaS v1.2 빌드 성공"
[Claude Code] 테스트 실패 → Channels(Telegram) → "결제 모듈 테스트 3건 실패"
[Claude Code] PR 머지 → Channels(Telegram) → "PR #47 머지 완료"
```

OpenClaw 텔레그램 토픽과 같은 그룹을 사용하면, 모든 알림이 한 곳에 모입니다.

### 패턴 3: OpenClaw heartbeat로 Claude Code 결과 모니터링

```
[OpenClaw 분석봇 HEARTBEAT]
매일 07:00:
  1. Claude Code가 생성한 분석 리포트 파일을 읽는다
  2. 핵심 수치를 추출한다
  3. 텔레그램 대시보드로 전송한다
  4. 이상치가 있으면 긴급 알림
```

### 패턴 4: OpenClaw가 Claude Code에 작업 위임

```
[사용자] → [OpenClaw 전략봇]: "경쟁사 A의 가격 분석 좀 해줘"
[전략봇] → [Claude Code MCP]: "competitor_analysis.py 스크립트로 경쟁사 A 가격 크롤링"
[Claude Code]: 스크립트 작성 → 실행 → 결과 파일 생성
[전략봇]: 결과 파일 읽기 → 요약 → 텔레그램 전송
```

---

## Claude Code의 보안 강점

기업 환경에서는 보안이 중요합니다. 이 부분에서 Claude Code가 강점을 가집니다.

### Anthropic 전담 보안팀

- Claude Code는 Anthropic이 직접 개발하고 관리합니다
- 보안 패치가 빠르게 배포됩니다
- SOC 2 Type II 인증 (기업용)

### 기업용 통제 기능

| 기능 | 설명 |
|------|------|
| **권한 제어** | 파일 접근 범위 제한 가능 |
| **감사 로그** | 모든 AI 행동 기록 |
| **샌드박스** | 위험한 명령어 실행 차단 |
| **승인 흐름** | 민감한 작업은 사람 승인 필요 |
| **SSO 통합** | 기업 인증 시스템 연동 |

### OpenClaw과의 비교

| 보안 항목 | OpenClaw | Claude Code |
|----------|----------|-------------|
| 코드 공개 | 오픈소스 (투명) | 비공개 (Anthropic 관리) |
| 데이터 위치 | 자체 서버 (완전 통제) | Anthropic 서버 경유 |
| 인증 | 자체 구현 필요 | 빌트인 |
| 감사 | 자체 구현 필요 | 빌트인 |
| 업데이트 | 수동 | 자동 |

**판단 기준**:
- 데이터 주권이 중요하면 → OpenClaw (자체 서버)
- 관리 부담을 줄이고 싶으면 → Claude Code (Anthropic 관리)
- 둘 다 원하면 → 하이브리드 (민감 데이터는 OpenClaw, 나머지는 Claude Code)

---

## 하이브리드 구축 실전 가이드

### 1단계: OpenClaw 기본 설정 (Ch.12 완료 상태)

Ch.12에서 만든 성장 전략팀 5인이 이미 돌아가고 있다고 가정합니다.

### 2단계: Claude Code 설정

```bash
# Claude Code 설치 (이미 설치되어 있다면 스킵)
npm install -g @anthropic-ai/claude-code

# CLAUDE.md에 에이전트 규칙 설정
# (SOUL.md와 동일한 역할)
```

CLAUDE.md에 OpenClaw 에이전트와 동일한 규칙을 넣되, **코딩/분석 특화** 규칙을 추가합니다.

### 3단계: MCP 브릿지 설정

```json
// Claude Code의 .claude/settings.json
{
  "mcpServers": {
    "openclaw-bridge": {
      "command": "openclaw",
      "args": ["mcp-server", "--port", "18790"]
    }
  }
}
```

이렇게 하면 Claude Code에서 OpenClaw 에이전트에게 메시지를 보낼 수 있습니다.

### 4단계: 텔레그램 통합

OpenClaw과 Claude Code 모두 같은 텔레그램 그룹에 연결합니다.

```
텔레그램 그룹: "AI싱크클럽 AI 팀"
├── 토픽 1~7: OpenClaw 에이전트 (Ch.12)
├── 토픽 8: Claude Code 알림
└── 토픽 9: 시스템 상태
```

---

## 정리

| 상황 | 추천 도구 |
|------|----------|
| 24시간 상시 메시징이 필요할 때 | OpenClaw |
| 코드를 짜거나 수정할 때 | Claude Code |
| 정기 스케줄 작업이 필요할 때 | OpenClaw |
| 대량 데이터 분석이 필요할 때 | Claude Code |
| 카카오톡/라인으로 알림 받을 때 | OpenClaw |
| Git PR/커밋 자동화가 필요할 때 | Claude Code |
| 복잡한 워크플로우 자동화가 필요할 때 | OpenClaw (ClawFlows) |
| 보안이 최우선일 때 | Claude Code |

**핵심 메시지**: 하나만 고르지 마세요. 둘 다 쓰세요. OpenClaw가 일상을 관리하고, Claude Code가 전문 작업을 처리합니다. MCP로 연결하면 하나의 시스템처럼 동작합니다.

---

## 실전: OpenClaw + Claude Code 조합 사용법

### 패턴 1: 낮에는 Claude Code, 밤에는 OpenClaw

```bash
# 낮: Claude Code로 코딩/분석 작업 (터미널에서)
claude "이번 달 매출 데이터 분석해줘"

# 밤: OpenClaw가 자동으로 리서치/모니터링 (Heartbeat)
# → 아침에 텔레그램으로 결과 수신
```

### 패턴 2: OpenClaw에서 Claude Code 호출

에이전트가 코딩이 필요한 작업을 만나면 Claude Code에 위임:

```
사용자 → OpenClaw(텔레그램): "홈페이지 랜딩페이지 수정해줘"
   → OpenClaw: "이건 코딩 작업이니 Claude Code에 위임합니다"
   → Claude Code: (코드 수정, git commit, PR 생성)
   → OpenClaw(텔레그램): "완료! PR #42 생성했습니다. 리뷰해주세요."
```

### 패턴 3: Claude Code Channels로 텔레그램 알림

```bash
# Claude Code에서 Telegram 채널 활성화
claude --channels plugin:telegram@claude-plugins-official

# 코딩 작업 완료 시 텔레그램으로 알림 받기
```

### 어떤 도구를 언제 쓸까?

| 상황 | 추천 도구 | 이유 |
|------|----------|------|
| 매일 아침 브리핑 자동 발송 | OpenClaw | 상시 가동, 스케줄링 |
| 코드 리팩토링 | Claude Code | 코드 깊이 이해, git 통합 |
| 텔레그램으로 업무 지시 | OpenClaw | 메시징 연동 |
| 데이터 분석 + 시각화 | Claude Code | 파일 시스템 직접 접근 |
| 고객 CS 자동 응답 | OpenClaw | 웹훅, 24시간 가동 |
| PR 리뷰 + 코드 수정 | Claude Code | 코드 전문 |
| 경쟁사 가격 모니터링 | OpenClaw | 브라우저 자동화, Heartbeat |
| 한 번에 큰 코딩 프로젝트 | Claude Code | 집중 세션 |

> **핵심**: OpenClaw = "항상 켜져 있는 비서" (메시징 + 스케줄링 + 모니터링). Claude Code = "불러서 쓰는 전문가" (코딩 + 분석 + 깊은 작업). 둘 다 쓰면 최강.

---

## 심화: Claude Agent SDK 멀티에이전트 패턴

Claude Agent SDK를 사용하면 코드로 멀티에이전트 시스템을 구축할 수 있습니다. OpenClaw의 선언적 설정(SOUL.md, openclaw.json)과 달리, SDK는 프로그래밍 방식으로 에이전트를 제어합니다.

### 기본 구조

```typescript
import { AgentSDK } from "@anthropic-ai/claude-agent-sdk";

const sdk = new AgentSDK({
  model: "claude-opus-4-6",
  tools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
  agents: [
    { id: "researcher", description: "시장 조사", prompt: "..." },
    { id: "writer", description: "콘텐츠 작성", prompt: "..." }
  ]
});

const session = await sdk.createSession({
  systemPrompt: "당신은 AI싱크클럽 성장 전략팀의 리드입니다.",
  permissionMode: "acceptEdits"
});
```

### 빌트인 도구

Agent SDK에는 Claude Code와 동일한 빌트인 도구가 포함되어 있습니다:

| 도구 | 용도 |
|------|------|
| `Read` | 파일 읽기 (이미지, PDF 포함) |
| `Write` | 파일 생성 및 덮어쓰기 |
| `Edit` | 파일 부분 수정 (diff 기반) |
| `Bash` | 셸 명령 실행 |
| `Glob` | 파일 패턴 검색 |
| `Grep` | 코드/텍스트 내용 검색 |
| `WebSearch` | 웹 검색 |
| `WebFetch` | URL 콘텐츠 가져오기 |

### 세션 관리

```typescript
// 세션 resume — 이전 대화 이어가기
const resumed = await sdk.resumeSession(sessionId);

// 세션 fork — 기존 세션을 복제하여 분기
const forked = await sdk.forkSession(sessionId, {
  systemPrompt: "새로운 맥락에서 작업합니다."
});
```

세션 resume/fork를 활용하면 장기 실행 작업에서 컨텍스트를 유지하면서도 유연하게 분기할 수 있습니다.

### Hooks via Callback

```typescript
const session = await sdk.createSession({
  hooks: {
    preToolUse: async (tool, input) => {
      // 도구 실행 전 검증/변환
      if (tool === "Bash" && input.command.includes("rm")) {
        return { abort: true, reason: "삭제 명령 차단" };
      }
      return { proceed: true };
    },
    postToolUse: async (tool, input, output) => {
      // 도구 실행 후 로깅/변환
      console.log(`[${tool}] 실행 완료`);
      return output;
    }
  }
});
```

### MCP 서버 인라인 설정

외부 MCP 서버를 Agent SDK 세션에 직접 연결할 수 있습니다:

```typescript
const sdk = new AgentSDK({
  model: "claude-sonnet-4-20250514",
  mcpServers: {
    "openclaw-bridge": {
      command: "openclaw",
      args: ["mcp-server", "--port", "18790"]
    },
    "google-calendar": {
      command: "npx",
      args: ["@anthropic-ai/mcp-google-calendar"]
    }
  }
});
```

### 클라우드 프로바이더 지원

Agent SDK는 Anthropic API 외에도 다양한 클라우드 프로바이더를 지원합니다:

| 프로바이더 | 설정 방법 |
|-----------|----------|
| **Amazon Bedrock** | `provider: "bedrock"`, AWS credentials 사용 |
| **Google Vertex AI** | `provider: "vertex"`, GCP project 지정 |
| **Azure Foundry** | `provider: "azure-foundry"`, Azure endpoint 지정 |

```typescript
// Bedrock 예시
const sdk = new AgentSDK({
  provider: "bedrock",
  model: "claude-sonnet-4-20250514",
  region: "us-east-1"
});

// Vertex AI 예시
const sdk = new AgentSDK({
  provider: "vertex",
  model: "claude-sonnet-4-20250514",
  project: "my-gcp-project",
  region: "us-central1"
});
```

### OpenClaw vs Agent SDK 선택 기준

| 기준 | OpenClaw | Agent SDK |
|------|----------|-----------|
| 설정 방식 | 선언적 (JSON + Markdown) | 프로그래밍 (TypeScript/Python) |
| 최적 대상 | 비개발자, 빠른 프로토타이핑 | 개발자, 커스텀 로직 필요 시 |
| 상시 가동 | 기본 지원 (Gateway) | 직접 구현 필요 |
| 메신저 연동 | 20+ 빌트인 | MCP로 연결 |
| 세밀한 제어 | 제한적 | 코드 레벨 완전 제어 |

두 도구를 결합하면 가장 강력합니다: OpenClaw로 상시 메시징/스케줄링을 처리하고, Agent SDK로 복잡한 코딩/분석 파이프라인을 구축합니다.

---

다음 챕터에서는 이 모든 것을 **돈으로 바꾸는 방법**을 다룹니다.
