import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createRoot } from "react-dom/client";

interface Chapter {
  id: string;
  num: string;
  title: string;
  phase: string;
  phaseLabel: string;
  file: string;
}

const chapters: Chapter[] = [
  { id: "intro", num: "", title: "시작하기", phase: "0", phaseLabel: "", file: "" },
  { id: "ch00", num: "00", title: "시작하기 전에", phase: "0", phaseLabel: "준비", file: "ch00-시작하기전에.md" },
  { id: "ch01", num: "01", title: "워크스페이스", phase: "1", phaseLabel: "Phase 1: 에이전트의 집 구경", file: "ch01-워크스페이스.md" },
  { id: "ch02", num: "02", title: "SOUL.md — 정체성", phase: "1", phaseLabel: "", file: "ch02-SOUL-md.md" },
  { id: "ch03", num: "03", title: "AGENTS.md — 규칙", phase: "1", phaseLabel: "", file: "ch03-AGENTS-md.md" },
  { id: "ch04", num: "04", title: "채널 연결", phase: "1", phaseLabel: "", file: "ch04-채널연결.md" },
  { id: "ch05", num: "05", title: "자동 실행", phase: "2", phaseLabel: "Phase 2: 혼자 움직이게 하기", file: "ch05-heartbeat-cron.md" },
  { id: "ch06", num: "06", title: "스킬 부여", phase: "2", phaseLabel: "", file: "ch06-스킬.md" },
  { id: "ch07", num: "07", title: "메모리", phase: "2", phaseLabel: "", file: "ch07-메모리.md" },
  { id: "ch08", num: "08", title: "멀티에이전트", phase: "2", phaseLabel: "", file: "ch08-멀티에이전트.md" },
  { id: "ch09", num: "09", title: "외부 연동", phase: "3", phaseLabel: "Phase 3: 팀과 세상으로", file: "ch09-외부연동.md" },
  { id: "ch10", num: "10", title: "보안", phase: "3", phaseLabel: "", file: "ch10-보안.md" },
  { id: "ch11", num: "11", title: "비용 관리", phase: "3", phaseLabel: "", file: "ch11-토큰비용.md" },
  { id: "ch12", num: "12", title: "실전 팀 구축", phase: "4", phaseLabel: "Phase 4: 실전 팀 구축", file: "ch12-실전-성장전략팀.md" },
  { id: "ch13", num: "13", title: "Claude Code 하이브리드", phase: "4", phaseLabel: "", file: "ch13-claude-code-하이브리드.md" },
  { id: "ch14", num: "14", title: "수익화", phase: "4", phaseLabel: "", file: "ch14-수익화.md" },
  { id: "apxA", num: "A", title: "도구 & 통합 레퍼런스", phase: "A", phaseLabel: "부록", file: "appendix-A-도구레퍼런스.md" },
  { id: "apxC", num: "C", title: "트러블슈팅", phase: "A", phaseLabel: "", file: "appendix-C-트러블슈팅.md" },
  { id: "apxF", num: "F", title: "용어 사전", phase: "A", phaseLabel: "", file: "appendix-F-용어사전.md" },
];

function parseMarkdown(md: string): string {
  let html = md;
  const codeBlocks: string[] = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    const escaped = code.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n{3,}/g, "\n\n").trimEnd();
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre><code class="lang-${lang}">${escaped}</code></pre>`);
    return `\n%%CODEBLOCK_${idx}%%\n`;
  });
  html = html.replace(/^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)*)/gm, (_m, header, _sep, body) => {
    const ths = header.split("|").filter((c: string) => c.trim()).map((c: string) => `<th>${c.trim()}</th>`).join("");
    const rows = body.trim().split("\n").map((row: string) => {
      const tds = row.split("|").filter((c: string) => c.trim()).map((c: string) => `<td>${c.trim()}</td>`).join("");
      return `<tr>${tds}</tr>`;
    }).join("");
    return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
  });
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  html = html.replace(/^---$/gm, "<hr>");
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");
  html = html.replace(/<\/blockquote>\n<blockquote>/g, "\n");
  html = html.replace(/^- \[x\] (.+)$/gm, '<li><input type="checkbox" checked disabled> $1</li>');
  html = html.replace(/^- \[ \] (.+)$/gm, '<li><input type="checkbox" disabled> $1</li>');
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
  html = html.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/^(?!<[hupoltba]|<\/|<li|<hr|<pre|<code|<table|<thead|<tbody|<tr|<td|<th|<blockquote|%%CODEBLOCK)(.+)$/gm, "<p>$1</p>");
  html = html.replace(/<p>\s*<\/p>/g, "");
  html = html.replace(/<p><\/p>/g, "");
  html = html.replace(/%%CODEBLOCK_(\d+)%%/g, (_m, idx) => codeBlocks[parseInt(idx)]);
  return html;
}

/* ============================================================
   INTRO — 완전 리뉴얼: 초보 친화 + OpenClaw 설명
   ============================================================ */
function IntroPage({ onStart }: { onStart: (i: number) => void }) {
  return (
    <div className="intro-wrap">
      <div className="intro">
        {/* Hero — OpenClaw 설명 포함 */}
        <div className="hero">
          <div className="hero-eyebrow">AI싱크클럽</div>
          <h1>OpenClaw 실전 매뉴얼</h1>
          <div className="subtitle">
            ChatGPT는 <em>답</em>만 해요.<br />
            OpenClaw는 <strong>실행</strong>합니다.
          </div>
          <div className="hero-desc">
            텔레그램으로 "아침 브리핑 보내줘"라고 말하면,<br />
            매일 정해진 시간에 이메일·캘린더·뉴스를 정리해서 보내주는 AI.
          </div>
          <div className="by-line">by AI싱크클럽 &middot; 복사-붙여넣기로 시작</div>
        </div>

        {/* What is OpenClaw — 1줄 설명 */}
        <div className="what-is">
          <h2>OpenClaw가 뭔가요?</h2>
          <div className="what-is-grid">
            <div className="what-is-card">
              <div className="what-is-label">ChatGPT / Claude</div>
              <div className="what-is-desc">물어보면 답해줌<br /><span>대화가 끝나면 잊어버림</span></div>
            </div>
            <div className="what-is-vs">→</div>
            <div className="what-is-card active">
              <div className="what-is-label">OpenClaw</div>
              <div className="what-is-desc">시키면 직접 실행<br /><span>24시간 혼자 일함, 기억도 함</span></div>
            </div>
          </div>
        </div>

        {/* 비용 미리보기 */}
        <div className="cost-preview">
          <h3>💰 비용은?</h3>
          <div className="cost-chips">
            <div className="cost-chip"><strong>무료</strong><span>Ollama 로컬 모델</span></div>
            <div className="cost-chip"><strong>월 1.5~4만원</strong><span>가벼운 사용</span></div>
            <div className="cost-chip"><strong>월 13~26만원</strong><span>5인 팀 운영</span></div>
          </div>
          <p className="cost-note">직원 인건비의 1/10. 처음엔 $5만 충전해서 테스트 가능.</p>
        </div>

        {/* 3단계 로드맵 — 간결하게 */}
        <div className="roadmap-simple">
          <h2>3단계로 시작합니다</h2>
          <div className="steps">
            <div className="step" onClick={() => onStart(1)}>
              <div className="step-num">1</div>
              <div className="step-info">
                <h3>설치하고 "안녕" 보내기</h3>
                <p>5분이면 텔레그램에서 AI와 대화 가능</p>
              </div>
              <div className="step-arrow">→</div>
            </div>
            <div className="step" onClick={() => onStart(2)}>
              <div className="step-num">2</div>
              <div className="step-info">
                <h3>성격 정하고 규칙 세우기</h3>
                <p>SOUL.md에 성격, AGENTS.md에 규칙 작성</p>
              </div>
              <div className="step-arrow">→</div>
            </div>
            <div className="step" onClick={() => onStart(6)}>
              <div className="step-num">3</div>
              <div className="step-info">
                <h3>혼자 움직이게 만들기</h3>
                <p>매일 아침 브리핑, 자동 모니터링 설정</p>
              </div>
              <div className="step-arrow">→</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="cta">
          <button className="cta-btn" onClick={() => onStart(1)}>
            Ch.00 — 설치부터 시작하기 <span className="arrow">→</span>
          </button>
          <p className="cta-sub">코딩 경험 없어도 됩니다. 5분이면 첫 응답을 받습니다.</p>
        </div>

        {/* 전체 목차 (접힌 상태) */}
        <details className="full-toc">
          <summary>전체 목차 보기 (16개 챕터 + 부록 3개)</summary>
          <div className="toc-grid">
            <div className="toc-phase">
              <h4>준비</h4>
              <div className="toc-item" onClick={() => onStart(1)}>Ch.00 시작하기 전에</div>
            </div>
            <div className="toc-phase">
              <h4>Phase 1: 에이전트의 집</h4>
              <div className="toc-item" onClick={() => onStart(2)}>Ch.01 워크스페이스</div>
              <div className="toc-item" onClick={() => onStart(3)}>Ch.02 SOUL.md — 정체성</div>
              <div className="toc-item" onClick={() => onStart(4)}>Ch.03 AGENTS.md — 규칙</div>
              <div className="toc-item" onClick={() => onStart(5)}>Ch.04 채널 연결</div>
            </div>
            <div className="toc-phase">
              <h4>Phase 2: 자동화</h4>
              <div className="toc-item" onClick={() => onStart(6)}>Ch.05 자동 실행</div>
              <div className="toc-item" onClick={() => onStart(7)}>Ch.06 스킬 부여</div>
              <div className="toc-item" onClick={() => onStart(8)}>Ch.07 메모리</div>
              <div className="toc-item" onClick={() => onStart(9)}>Ch.08 멀티에이전트</div>
            </div>
            <div className="toc-phase">
              <h4>Phase 3~4: 실전</h4>
              <div className="toc-item" onClick={() => onStart(10)}>Ch.09~11 외부연동·보안·비용</div>
              <div className="toc-item" onClick={() => onStart(13)}>Ch.12~14 팀 구축·하이브리드·수익화</div>
              <div className="toc-item" onClick={() => onStart(16)}>부록 A·C·F</div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

/* ============================================================
   SIDEBAR — 아코디언: 현재 Phase만 열림
   ============================================================ */
function Sidebar({ current, onSelect, open, onClose, theme, onToggleTheme }: {
  current: number;
  onSelect: (i: number) => void;
  open: boolean;
  onClose: () => void;
  theme: string;
  onToggleTheme: () => void;
}) {
  // Group chapters by phase
  const phases = useMemo(() => {
    const map: { phase: string; label: string; items: { idx: number; ch: Chapter }[] }[] = [];
    let currentPhase = "";
    chapters.forEach((ch, i) => {
      if (i === 0) return; // skip intro
      if (ch.phaseLabel && ch.phase !== currentPhase) {
        currentPhase = ch.phase;
        map.push({ phase: ch.phase, label: ch.phaseLabel, items: [] });
      }
      if (map.length > 0) {
        map[map.length - 1].items.push({ idx: i, ch });
      }
    });
    return map;
  }, []);

  const currentPhase = current > 0 ? chapters[current]?.phase : "0";

  return (
    <nav className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-head">
        <div className="sidebar-brand" onClick={() => { onSelect(0); onClose(); }}>
          <div className="sidebar-brand-icon">OC</div>
          <div className="sidebar-brand-text">
            <h1>OpenClaw 매뉴얼</h1>
          </div>
        </div>
      </div>

      <div className="sidebar-toolbar">
        <button className="theme-btn" onClick={onToggleTheme}>
          {theme === "light" ? "🌙 다크 모드" : "☀️ 라이트 모드"}
        </button>
      </div>

      <div className="sidebar-scroll">
        {/* Home */}
        <div className={`nav-item ${current === 0 ? "active" : ""}`} onClick={() => { onSelect(0); onClose(); }}>
          <span className="nav-num" style={{ fontSize: 13 }}>🏠</span>
          <span className="nav-label">홈</span>
        </div>

        {phases.map((p) => {
          const isOpen = p.phase === currentPhase || p.phase === "0";
          const hasActive = p.items.some(item => item.idx === current);
          return (
            <div key={p.phase} className="sidebar-phase-group">
              <div
                className={`sidebar-phase-header ${hasActive ? "active" : ""}`}
                onClick={() => { onSelect(p.items[0].idx); onClose(); }}
              >
                <span className="phase-toggle">{isOpen || hasActive ? "▾" : "▸"}</span>
                <span>{p.label}</span>
              </div>
              {(isOpen || hasActive) && (
                <div className="sidebar-phase-items">
                  {p.items.map(({ idx, ch }) => (
                    <div
                      key={ch.id}
                      className={`nav-item ${idx === current ? "active" : ""}`}
                      onClick={() => { onSelect(idx); onClose(); }}
                    >
                      <span className="nav-num">{ch.num}</span>
                      <span className="nav-label">{ch.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

/* ============================================================
   CHAPTER NAV — 완료 배너 추가
   ============================================================ */
function ChapterNav({ current, onSelect }: { current: number; onSelect: (i: number) => void }) {
  const prev = current > 0 ? chapters[current - 1] : null;
  const next = current < chapters.length - 1 ? chapters[current + 1] : null;
  const ch = chapters[current];

  return (
    <div className="chapter-nav-wrap">
      {/* 완료 배너 */}
      {next && (
        <div className="chapter-complete" onClick={() => onSelect(current + 1)}>
          ✅ {ch.num ? `Ch.${ch.num}` : ""} {ch.title} 완료! &nbsp;→&nbsp; 다음: {next.num ? `Ch.${next.num}` : ""} {next.title}
        </div>
      )}
      <div className="chapter-nav">
        {prev ? (
          <div className="ch-nav-btn prev" onClick={() => onSelect(current - 1)}>
            <span className="ch-nav-label">← 이전</span>
            <span className="ch-nav-title">{prev.num ? `Ch.${prev.num}` : ""} {prev.title}</span>
          </div>
        ) : <div />}
        {next ? (
          <div className="ch-nav-btn next" onClick={() => onSelect(current + 1)}>
            <span className="ch-nav-label">다음 →</span>
            <span className="ch-nav-title">{next.num ? `Ch.${next.num}` : ""} {next.title}</span>
          </div>
        ) : <div />}
      </div>
    </div>
  );
}

/* ============================================================
   LOCK SCREEN
   ============================================================ */
function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const submit = () => {
    if (pw === "sync2026") {
      localStorage.setItem("oc-unlocked", "1");
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 20,
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, fontFamily: "var(--font-display)" }}>OpenClaw 실전 매뉴얼</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>비밀번호를 입력하세요</p>
      </div>
      <form onSubmit={e => { e.preventDefault(); submit(); }} style={{ display: "flex", gap: 8 }}>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          placeholder="비밀번호"
          autoFocus
          style={{
            padding: "10px 16px", fontSize: 15, borderRadius: 8,
            border: `1px solid ${error ? "#b34040" : "var(--border)"}`,
            background: "var(--bg-card, #fff)", color: "var(--text)",
            outline: "none", width: 220, fontFamily: "var(--font-body)",
          }}
        />
        <button type="submit" style={{
          padding: "10px 20px", fontSize: 15, fontWeight: 700, borderRadius: 8,
          border: "none", background: "var(--text)", color: "var(--bg)",
          cursor: "pointer", fontFamily: "var(--font-body)",
        }}>입장</button>
      </form>
      {error && <p style={{ color: "#b34040", fontSize: 13 }}>비밀번호가 틀렸습니다</p>}
      <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 8 }}>by AI싱크클럽</p>
    </div>
  );
}

/* ============================================================
   APP
   ============================================================ */
function App() {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem("oc-unlocked") === "1");
  const [current, setCurrent] = useState(0);
  const [content, setContent] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem("oc-theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("oc-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(t => t === "light" ? "dark" : "light"), []);

  const goTo = useCallback((i: number) => {
    setCurrent(i);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  useEffect(() => {
    if (current === 0) { setContent(""); return; }
    const file = chapters[current]?.file;
    if (!file) return;
    const inlineChapters = (window as any).__CHAPTERS__ as { file: string; content: string }[] | undefined;
    if (inlineChapters) {
      const found = inlineChapters.find(c => c.file === file);
      if (found) { setContent(found.content); return; }
    }
    fetch(`/manual/${file}`)
      .then(r => r.text())
      .then(setContent)
      .catch(() => setContent("# 로딩 중..."));
  }, [current]);

  useEffect(() => {
    const fn = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0) setScrollProgress((window.scrollY / h) * 100);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const rendered = useMemo(() => parseMarkdown(content), [content]);
  const isIntro = current === 0;

  if (!unlocked) return <LockScreen onUnlock={() => setUnlocked(true)} />;

  return (
    <>
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />

      <div className="mobile-bar">
        <button onClick={() => setSidebarOpen(true)}>☰</button>
        <h1>OpenClaw 매뉴얼</h1>
        <button onClick={toggleTheme}>{theme === "light" ? "🌙" : "☀️"}</button>
      </div>

      {sidebarOpen && <div className="overlay show" onClick={() => setSidebarOpen(false)} />}

      <div className="layout">
        <Sidebar
          current={current}
          onSelect={goTo}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {isIntro ? (
          <IntroPage onStart={goTo} />
        ) : (
          <div className="content-wrap">
            <main className="content" dangerouslySetInnerHTML={{ __html: rendered }} />
            <ChapterNav current={current} onSelect={goTo} />
          </div>
        )}
      </div>
    </>
  );
}

createRoot(document.getElementById("app")!).render(<App />);
