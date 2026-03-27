# 부록 F — 용어사전

매뉴얼에서 사용되는 전문 용어를 가나다/ABC순으로 정리했습니다.

| 용어 | 영문 | 설명 |
|------|------|------|
| API Key | API Key | AI 서비스에 접속하기 위한 비밀 열쇠. console.anthropic.com에서 발급 |
| Gateway | Gateway | 에이전트의 통신 관제탑. 메시지, 웹훅, 크론잡을 모두 처리하는 단일 프로세스 |
| JSON | JSON | 설정 파일 형식. 중괄호 {}로 묶인 키-값 쌍. 예: {"name": "봇"} |
| JSON5 | JSON5 | JSON의 확장 형식. 주석(//)과 따옴표 없는 키 사용 가능 |
| MCP | Model Context Protocol | AI 모델과 외부 도구를 연결하는 프로토콜 |
| n8n | n8n | 오픈소스 워크플로우 자동화 도구. GUI로 자동화를 만듦 |
| OAuth | OAuth | 다른 서비스의 권한을 안전하게 위임받는 인증 방식 |
| RAG | Retrieval-Augmented Generation | 검색 결과를 AI에 주입하여 답변 품질을 높이는 기법 |
| RTK | Rust Token Killer | CLI 출력을 압축하여 토큰 비용을 60-90% 줄이는 도구 |
| Socket Mode | Socket Mode | Slack 앱이 웹훅 없이 WebSocket으로 이벤트를 받는 방식 |
| Tailscale | Tailscale | VPN 서비스. 포트포워딩 없이 안전한 원격 접속 제공 |
| 세션 | Session | 에이전트와 나누는 대화 한 묶음. 채널/토픽별로 분리됨 |
| 시스템 프롬프트 | System Prompt | 에이전트가 매 대화마다 자동으로 읽는 기본 지침서 (SOUL.md, AGENTS.md 등) |
| 웹훅 | Webhook | "이런 일이 생기면 이 URL로 알려줘"라는 자동 알림 약속 |
| 컨텍스트 윈도우 | Context Window | AI가 한 번에 처리할 수 있는 텍스트 크기. 초과하면 컴팩션 발동 |
| 컴팩션 | Compaction | 대화가 길어지면 오래된 부분을 자동 요약하여 공간을 확보하는 메커니즘 |
| 크론잡 | Cron Job | 정해진 시간에 자동 실행되는 예약 작업 (예: "매일 오전 9시에 브리핑") |
| 토큰 | Token | AI가 텍스트를 처리하는 기본 단위. 한글 1글자 ≈ 2-3토큰. 비용의 기본 단위 |
| 프롬프트 인젝션 | Prompt Injection | 악의적 텍스트로 AI의 행동을 조작하려는 공격 |
| 프롬프트 캐싱 | Prompt Caching | 반복되는 시스템 프롬프트를 캐시하여 비용을 최대 90% 절감하는 기능 |
| 하트비트 | Heartbeat | 에이전트가 주기적으로 깨어나서 할 일이 있는지 체크하는 자동 순찰 기능 |
