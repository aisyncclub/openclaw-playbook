# 부록 A: 빌트인 도구 & 통합 레퍼런스

OpenClaw가 기본 제공하는 도구와 주요 통합 목록입니다.

---

## 빌트인 도구 25종

### 파일 시스템

| 도구 | 위험도 | 설명 |
|------|:------:|------|
| `read` | 낮음 | 파일 읽기 |
| `write` | 중간 | 파일 쓰기/생성 |
| `edit` | 중간 | 파일 수정 (diff 기반) |
| `list` | 낮음 | 디렉토리 목록 |
| `search` | 낮음 | 파일 내 텍스트 검색 |

### 실행

| 도구 | 위험도 | 설명 |
|------|:------:|------|
| `exec` | 높음 | 쉘 명령 실행 (exec-approvals 적용) |

### 웹

| 도구 | 위험도 | 설명 |
|------|:------:|------|
| `web_search` | 낮음 | 웹 검색 (Brave/Gemini/Grok 등) |
| `web_fetch` | 낮음 | URL 내용 가져오기 |
| `browser` | 중간 | Playwright 기반 브라우저 자동화 |

### 미디어

| 도구 | 위험도 | 설명 |
|------|:------:|------|
| `image_generate` | 낮음 | DALL-E 3/SD 이미지 생성 |
| `tts` | 낮음 | 텍스트→음성 (ElevenLabs/OpenAI/MS) |

### 메모리

| 도구 | 위험도 | 설명 |
|------|:------:|------|
| `memory` | 낮음 | 장기 기억 읽기/쓰기 |
| `context` | 낮음 | 컨텍스트 관리 |

### 세션/에이전트

| 도구 | 위험도 | 설명 |
|------|:------:|------|
| `sessions_spawn` | 중간 | 서브에이전트 생성 |
| `sessions_send` | 중간 | 에이전트 간 메시지 전송 |
| `sessions_list` | 낮음 | 활성 세션 목록 |
| `sessions_history` | 낮음 | 세션 대화 기록 |

### 스케줄링

| 도구 | 위험도 | 설명 |
|------|:------:|------|
| `cron` | 중간 | 크론잡 생성/관리 |
| `heartbeat` | 낮음 | 하트비트 상태 확인 |

### 디바이스

| 도구 | 위험도 | 설명 |
|------|:------:|------|
| `nodes` | 중간 | 원격 디바이스 제어 (카메라, 위치, SMS) |

### 유틸리티

| 도구 | 위험도 | 설명 |
|------|:------:|------|
| `calculator` | 낮음 | 수학 계산 |
| `date_time` | 낮음 | 날짜/시간 조회 |

---

## 도구 프로파일

> `minimal`은 정보 조회 전용 에이전트에 사용합니다. 대부분의 에이전트는 `messaging` 이상을 사용합니다. Ch.03의 3종(messaging/coding/full)에 `minimal`을 추가한 확장 목록입니다.

| 프로파일 | 포함 도구 | 적합 용도 |
|---------|----------|---------|
| `minimal` | read, memory | 정보 조회만 |
| `messaging` | minimal + message, reactions | CS봇, 외부 응대 |
| `coding` | messaging + write, edit, exec | 개발 에이전트 |
| `full` | coding + sessions, cron, nodes, browser | 팀장, 오케스트레이터 |

---

## 주요 통합 (MCP/스킬)

### 생산성

| 통합 | 설치 | 기능 |
|------|------|------|
| **Google Workspace** | `clawhub install gog` | Gmail, Calendar, Drive, Docs, Sheets |
| **Notion** | `openclaw skill install notion` | 페이지/DB 읽기·쓰기·검색 |
| **Linear** | `openclaw skill install linear-skill` | 이슈 생성/관리, 사이클 모니터링 |
| **Airtable** | Composio MCP | 레코드 관리, 뷰 조회 |
| **Trello** | `clawhub install trello` | 카드/보드 관리 |
| **Obsidian** | `openclaw skill install obsidian` | 노트 읽기/쓰기/검색 |

### 개발

| 통합 | 설치 | 기능 |
|------|------|------|
| **GitHub** | Composio MCP 또는 스킬 | PR 리뷰, 이슈, CI 모니터링 |
| **PostgreSQL** | `openclaw mcp install @mcp/server-postgres` | DB 쿼리 (읽기 전용 기본) |
| **SQLite** | `openclaw mcp install @mcp/server-sqlite` | 로컬 DB 분석 |

### 커뮤니케이션

| 통합 | 설치 | 기능 |
|------|------|------|
| **Slack** | openclaw.json channels 설정 | Socket Mode, 채널/DM |
| **Discord** | `openclaw channels login discord` | 서버/채널 |
| **Gmail** | `openclaw skill install gmail` | Pub/Sub 또는 IMAP |

### 자동화

| 통합 | 설치 | 기능 |
|------|------|------|
| **n8n** | 웹훅 연동 | 워크플로우 엔진, 크레덴셜 격리 |
| **Make** | Composio MCP | 시나리오 실행 |
| **Zapier** | Zapier MCP | 8,000+ 앱 연결 |
| **Home Assistant** | HA Add-on | 스마트홈 자연어 제어 |
| **Composio** | `openclaw mcp install composio` | 500+ 앱 통합 허브 |

### 미디어/콘텐츠

| 통합 | 설치 | 기능 |
|------|------|------|
| **Post Bridge** | post-bridge.com | 6+ SNS 동시 게시 |
| **Genviral** | ClawHub | 42+ SNS 명령어 |
| **Firecrawl** | Firecrawl MCP | AI 기반 웹 스크래핑 |

### 음성/비디오

| 통합 | 설치 | 기능 |
|------|------|------|
| **ElevenLabs** | TTS 설정 | 고품질 음성 합성 |
| **OpenAI Whisper** | STT 기본값 | 음성→텍스트 |
| **Microsoft Edge TTS** | 기본 내장 | 무료 음성 (API Key 불필요) |

---

## 메신저 22종

**공식 지원:** WhatsApp, Telegram, Slack, Discord, Signal, iMessage, Google Chat, Microsoft Teams, LINE, Matrix

**커뮤니티 지원:** IRC, Mattermost, Feishu, BlueBubbles, Nostr, Synology Chat, Tlon, Twitch, Zalo, Nextcloud Talk, WebChat

---

## 유용한 CLI 명령어 모음

```bash
# 상태 확인
openclaw doctor                    # 전체 진단
openclaw gateway status            # Gateway 상태
openclaw models status             # 모델/인증 상태
openclaw channels list             # 연결된 채널 목록
openclaw devices list              # 연결된 디바이스
openclaw skills list               # 설치된 스킬
openclaw cron list                 # 크론잡 목록

# 관리
openclaw gateway start|stop|restart
openclaw config get <key>
openclaw config set <key> <value>
openclaw security audit --deep
openclaw logs --follow

# 스킬/MCP
openclaw skill install <name>
openclaw skill enable|disable <name>
openclaw mcp install <package>
clawhub install <slug>

# 채널
openclaw channels login whatsapp|discord|signal
openclaw pairing list
openclaw pairing approve <id>

# 브라우저
openclaw browser snapshot|screenshot|click|type|pdf
openclaw dashboard
```

---

## 참고 리소스

| 리소스 | URL |
|--------|-----|
| 공식 문서 | docs.openclaw.ai |
| ClawHub 스킬 마켓 | clawhub.ai |
| Awesome OpenClaw | github.com/vincentkoc/awesome-openclaw |
| Awesome 활용 사례 | github.com/hesamsheikh/awesome-openclaw-usecases |
| 162 에이전트 템플릿 | github.com/mergisi/awesome-openclaw-agents |
| 한국 커뮤니티 | x.com/i/communities/2017879415318007887 |
