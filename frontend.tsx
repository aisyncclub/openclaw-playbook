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
  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    const escaped = code.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n{3,}/g, "\n\n").trimEnd();
    return `\n<pre><code class="lang-${lang}">${escaped}</code></pre>\n`;
  });
  // Tables
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
  html = html.replace(/^(?!<[hupoltba]|<\/|<li|<hr|<pre|<code|<table|<thead|<tbody|<tr|<td|<th|<blockquote)(.+)$/gm, "<p>$1</p>");
  html = html.replace(/<p>\s*<\/p>/g, "");
  html = html.replace(/<p><\/p>/g, "");
  // Remove stray <p> tags inside <pre> blocks
  html = html.replace(/<pre>([\s\S]*?)<\/pre>/g, (m) => m.replace(/<\/?p>/g, ""));
  return html;
}

/* ============================================================
   INTRO PAGE
   ============================================================ */
function IntroPage({ onStart }: { onStart: (i: number) => void }) {
  return (
    <div className="intro-wrap">
      <div className="intro">
        {/* Hero */}
        <div className="hero">
          <div className="hero-eyebrow">AI싱크클럽</div>
          <h1>OpenClaw 실전 매뉴얼</h1>
          <div className="subtitle">
            AI 에이전트를 만들고, 팀으로 구성하고,<br />
            사업에 레버리지하는 완전 가이드
          </div>
          <div className="by-line">16개 챕터 + 부록 &middot; 실전 설정 파일 포함 &middot; 복사-붙여넣기 OK</div>
        </div>

        {/* Features */}
        <div className="features">
          <div className="feature-card">
            <div className="feature-icon f1">🐾</div>
            <h3>처음이어도 괜찮아요</h3>
            <p>코딩 경험이 없어도 따라할 수 있습니다. 모든 설정 파일은 복사-붙여넣기로 시작합니다.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon f2">⚡</div>
            <h3>실전 중심 가이드</h3>
            <p>실제 운영 사례와 실수 사례 기반. 이론이 아닌 바로 쓸 수 있는 지식을 담았습니다.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon f3">👥</div>
            <h3>AI 팀을 만듭니다</h3>
            <p>혼자 일하는 AI가 아닌, 5인 에이전트 팀으로 사업을 레버리지하는 시스템을 구축합니다.</p>
          </div>
        </div>

        {/* Prerequisites */}
        <div className="prereq">
          <h3>📋 시작하기 전에 준비할 것</h3>
          <ul>
            <li><span className="prereq-check">✓</span>Mac (M1 이상) 또는 Linux 서버</li>
            <li><span className="prereq-check">✓</span>텔레그램 계정</li>
            <li><span className="prereq-check">✓</span>Anthropic 또는 OpenAI API Key</li>
            <li><span className="prereq-check">✓</span>터미널 기본 사용법 (복사-붙여넣기 수준 OK)</li>
          </ul>
        </div>

        {/* Roadmap */}
        <div className="roadmap">
          <h2 className="roadmap-title">학습 로드맵</h2>
          <div className="roadmap-grid">
            <div className="roadmap-card" data-p="1" onClick={() => onStart(2)}>
              <div className="roadmap-badge">1</div>
              <div className="roadmap-info">
                <h3>에이전트의 집 구경</h3>
                <p>워크스페이스, 정체성, 규칙, 채널 연결</p>
                <div className="roadmap-chapters">Ch.01 ~ 04</div>
              </div>
            </div>
            <div className="roadmap-card" data-p="2" onClick={() => onStart(6)}>
              <div className="roadmap-badge">2</div>
              <div className="roadmap-info">
                <h3>혼자 움직이게 하기</h3>
                <p>자동 실행, 스킬, 메모리, 멀티에이전트</p>
                <div className="roadmap-chapters">Ch.05 ~ 08</div>
              </div>
            </div>
            <div className="roadmap-card" data-p="3" onClick={() => onStart(10)}>
              <div className="roadmap-badge">3</div>
              <div className="roadmap-info">
                <h3>팀과 세상으로</h3>
                <p>외부 연동, 보안, 비용 관리</p>
                <div className="roadmap-chapters">Ch.09 ~ 11</div>
              </div>
            </div>
            <div className="roadmap-card" data-p="4" onClick={() => onStart(13)}>
              <div className="roadmap-badge">4</div>
              <div className="roadmap-info">
                <h3>실전 팀 구축</h3>
                <p>5인 팀 구축, Claude Code 하이브리드, 수익화</p>
                <div className="roadmap-chapters">Ch.12 ~ 14</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="cta">
          <button className="cta-btn" onClick={() => onStart(1)}>
            시작하기 전에 읽기 <span className="arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SIDEBAR
   ============================================================ */
function Sidebar({ current, onSelect, open, onClose, theme, onToggleTheme }: {
  current: number;
  onSelect: (i: number) => void;
  open: boolean;
  onClose: () => void;
  theme: string;
  onToggleTheme: () => void;
}) {
  let lastPhase = "";

  return (
    <nav className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-head">
        <div className="sidebar-brand" onClick={() => { onSelect(0); onClose(); }}>
          <div className="sidebar-brand-icon">OC</div>
          <div className="sidebar-brand-text">
            <h1>OpenClaw 매뉴얼</h1>
            <span>AI 에이전트 팀 구축 가이드</span>
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
          <span className="nav-label">시작하기</span>
        </div>

        {chapters.slice(1).map((ch, idx) => {
          const i = idx + 1;
          const showPhase = ch.phaseLabel && ch.phase !== lastPhase;
          if (ch.phaseLabel) lastPhase = ch.phase;
          return (
            <React.Fragment key={ch.id}>
              {showPhase && <div className="sidebar-phase-label" data-phase={ch.phase}>{ch.phaseLabel}</div>}
              <div className={`nav-item ${i === current ? "active" : ""}`} onClick={() => { onSelect(i); onClose(); }}>
                <span className="nav-num">{ch.num}</span>
                <span className="nav-label">{ch.title}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}

/* ============================================================
   CHAPTER NAV
   ============================================================ */
function ChapterNav({ current, onSelect }: { current: number; onSelect: (i: number) => void }) {
  const prev = current > 0 ? chapters[current - 1] : null;
  const next = current < chapters.length - 1 ? chapters[current + 1] : null;

  return (
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
  );
}

/* ============================================================
   APP
   ============================================================ */
const PASS_HASH = "a3f5c8d2"; // simple hash of sync2026
function simpleHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16).slice(0, 8);
}

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
        <div style={{ fontSize: 32, marginBottom: 8, fontFamily: "var(--font-display)" }}>🔒</div>
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
            border: `1px solid ${error ? "var(--danger, #b34040)" : "var(--border)"}`,
            background: "var(--bg-card, #fff)", color: "var(--text)",
            outline: "none", width: 220,
            fontFamily: "var(--font-body)",
            transition: "border-color 0.2s",
          }}
        />
        <button type="submit" style={{
          padding: "10px 20px", fontSize: 15, fontWeight: 700, borderRadius: 8,
          border: "none", background: "var(--text)", color: "var(--bg)",
          cursor: "pointer", fontFamily: "var(--font-body)",
        }}>입장</button>
      </form>
      {error && <p style={{ color: "var(--danger, #b34040)", fontSize: 13 }}>비밀번호가 틀렸습니다</p>}
      <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 8 }}>by AI싱크클럽</p>
    </div>
  );
}

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

  // Load markdown — try inline data first, then fetch
  useEffect(() => {
    if (current === 0) { setContent(""); return; }
    const file = chapters[current]?.file;
    if (!file) return;

    // Try inline chapters (static build)
    const inlineChapters = (window as any).__CHAPTERS__ as { file: string; content: string }[] | undefined;
    if (inlineChapters) {
      const found = inlineChapters.find(c => c.file === file);
      if (found) { setContent(found.content); return; }
    }

    // Fallback to fetch (dev server)
    fetch(`/manual/${file}`)
      .then(r => r.text())
      .then(setContent)
      .catch(() => setContent("# 로딩 중..."));
  }, [current]);

  // Scroll progress
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

      {/* Mobile top bar */}
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
