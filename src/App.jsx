import { useState, useEffect, useCallback } from "react";

// ─── DESIGN SYSTEM ────────────────────────────────────────────────────────────
const T = {
  bg0: "#060810", bg1: "#090c18", bg2: "#0e1220", bg3: "#141826",
  border: "#1a2035", border2: "#202840", border3: "#2a3558",
  cyan: "#00d4ff",   cyanDim: "rgba(0,212,255,0.07)",
  green: "#00e5a0",  greenDim: "rgba(0,229,160,0.07)",
  red: "#ff4060",    redDim: "rgba(255,64,96,0.07)",
  amber: "#ffb030",  amberDim: "rgba(255,176,48,0.07)",
  violet: "#9f7aea", violetDim: "rgba(159,122,234,0.07)",
  blue: "#4da6ff",   blueDim: "rgba(77,166,255,0.07)",
  text: "#dce8ff", text2: "#7a8fb5", text3: "#384668", text4: "#1e2a40",
};

// ─── UTILS ────────────────────────────────────────────────────────────────────
const api = (path, opts) => fetch(`http://localhost:3002${path}`, opts).then(r => r.json());

function dl(filename, content) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
  a.download = filename; a.click();
}

function alignColor(s) {
  if (s === "ALIGNED")         return T.green;
  if (s === "PARTIAL")         return T.amber;
  if (s === "NOT_ALIGNED")     return T.red;
  if (s === "CANNOT_DETERMINE") return T.violet;
  return T.text3;
}
function alignIcon(s) {
  if (s === "ALIGNED")         return "✅";
  if (s === "PARTIAL")         return "⚠️";
  if (s === "NOT_ALIGNED")     return "❌";
  return "○";
}
function priorityColor(p) {
  if (p === "HIGH")   return T.red;
  if (p === "MEDIUM") return T.amber;
  return T.green;
}
function typeColor(t) {
  if (t === "POSITIVE")    return T.green;
  if (t === "NEGATIVE")    return T.red;
  if (t === "EDGE")        return T.amber;
  if (t === "PERFORMANCE") return T.violet;
  return T.blue;
}

// ─── ATOMS ───────────────────────────────────────────────────────────────────
function Badge({ c, col, size = 9 }) {
  return (
    <span style={{
      padding: "2px 7px", borderRadius: 3,
      fontSize: size, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase",
      background: `${col}15`, color: col, border: `1px solid ${col}28`,
      whiteSpace: "nowrap"
    }}>{c}</span>
  );
}

function Btn({ onClick, children, variant = "ghost", sm, disabled }) {
  const bg = variant === "primary" ? T.cyan
           : variant === "danger"  ? T.red
           : variant === "success" ? T.green
           : T.bg2;
  const fg = ["primary","danger","success"].includes(variant) ? T.bg0 : T.text2;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: sm ? "4px 11px" : "8px 16px",
      borderRadius: 5, fontSize: sm ? 10 : 12, fontWeight: 600,
      fontFamily: "'Fira Code', monospace",
      border: ["primary","danger","success"].includes(variant) ? "none" : `1px solid ${T.border2}`,
      background: bg, color: fg,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1, transition: "all .15s", whiteSpace: "nowrap",
    }}>{children}</button>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 10, ...style }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <Card style={{ padding: "16px 14px", textAlign: "center" }}>
      <div style={{ fontSize: 11, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 30, fontWeight: 800, color, lineHeight: 1, marginBottom: 4 }}>{value ?? "—"}</div>
      <div style={{ fontSize: 9, color: T.text3, letterSpacing: 2, textTransform: "uppercase" }}>{label}</div>
    </Card>
  );
}

function ScoreBar({ score, color }) {
  return (
    <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: "hidden", marginTop: 6 }}>
      <div style={{ height: "100%", width: `${score || 0}%`, background: color, borderRadius: 2, transition: "width 1s ease" }} />
    </div>
  );
}

// ─── TEST CASE CARD ───────────────────────────────────────────────────────────
function TestCaseCard({ tc }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: T.bg0, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
      {/* Header */}
      <div onClick={() => setOpen(!open)} style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: open ? T.bg2 : "transparent", flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: T.cyan, fontFamily: "'Fira Code', monospace", minWidth: 52 }}>{tc.id}</span>
        <span style={{ fontSize: 12, color: T.text, fontWeight: 600, flex: 1 }}>{tc.title}</span>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          <Badge c={tc.priority} col={priorityColor(tc.priority)} />
          <Badge c={tc.type} col={typeColor(tc.type)} />
          {(tc.tags || []).map(t => <Badge key={t} c={t} col={T.blue} />)}
        </div>
        <span style={{ color: T.text3, fontSize: 12 }}>{open ? "▲" : "▼"}</span>
      </div>
      {/* Body */}
      {open && (
        <div style={{ padding: "12px 14px", borderTop: `1px solid ${T.border}` }}>
          {tc.requirement_ref && (
            <div style={{ fontSize: 11, color: T.violet, marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}>
              <span>📋</span><span>{tc.requirement_ref}</span>
            </div>
          )}
          <div style={{ fontSize: 11, color: T.text2, marginBottom: 10, lineHeight: 1.7 }}>{tc.description}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div style={{ background: T.bg2, borderRadius: 6, padding: "10px 12px" }}>
              <div style={{ fontSize: 9, color: T.text3, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Input</div>
              <pre style={{ fontSize: 11, color: T.text, fontFamily: "'Fira Code', monospace", whiteSpace: "pre-wrap", margin: 0 }}>
                {typeof tc.input === "object" ? JSON.stringify(tc.input, null, 2) : tc.input}
              </pre>
            </div>
            <div style={{ background: T.greenDim, border: `1px solid ${T.green}25`, borderRadius: 6, padding: "10px 12px" }}>
              <div style={{ fontSize: 9, color: T.green, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Expected Output</div>
              <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.7 }}>{tc.expected_output}</div>
            </div>
          </div>
          {tc.steps?.length > 0 && (
            <div>
              <div style={{ fontSize: 9, color: T.text3, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Steps (BDD)</div>
              {tc.steps.map((s, i) => (
                <div key={i} style={{ fontSize: 11, color: T.text2, lineHeight: 1.8, paddingLeft: 8 }}>
                  <span style={{ color: s.startsWith("Given") ? T.violet : s.startsWith("When") ? T.cyan : T.green, fontWeight: 600, fontFamily: "'Fira Code', monospace" }}>
                    {s.split(" ")[0]}{" "}
                  </span>
                  {s.split(" ").slice(1).join(" ")}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── VALIDATION PANEL ────────────────────────────────────────────────────────
function ValidationPanel({ v }) {
  if (!v) return <div style={{ padding: 20, color: T.text3, fontSize: 12 }}>No requirement provided — exception mode.</div>;
  const col = alignColor(v.status);
  return (
    <div style={{ padding: 14 }}>
      {/* Status bar */}
      <div style={{ background: `${col}10`, border: `1px solid ${col}25`, borderRadius: 8, padding: "12px 16px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 20 }}>{alignIcon(v.status)}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: col }}>{v.status}</div>
            <div style={{ fontSize: 11, color: T.text2, marginTop: 2 }}>{v.summary}</div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: col }}>{v.score}</div>
            <div style={{ fontSize: 9, color: T.text3, letterSpacing: 1 }}>/ 100</div>
          </div>
        </div>
        <ScoreBar score={v.score} color={col} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {/* Matched */}
        <div style={{ background: T.greenDim, border: `1px solid ${T.green}20`, borderRadius: 8, padding: "12px" }}>
          <div style={{ fontSize: 9, color: T.green, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>✅ Matched ({v.matched?.length || 0})</div>
          {(v.matched || []).map((m, i) => <div key={i} style={{ fontSize: 11, color: T.text2, lineHeight: 1.8, paddingLeft: 4 }}>· {m}</div>)}
        </div>
        {/* Missing */}
        <div style={{ background: T.redDim, border: `1px solid ${T.red}20`, borderRadius: 8, padding: "12px" }}>
          <div style={{ fontSize: 9, color: T.red, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>❌ Missing ({v.missing?.length || 0})</div>
          {(v.missing || []).map((m, i) => <div key={i} style={{ fontSize: 11, color: T.text2, lineHeight: 1.8, paddingLeft: 4 }}>· {m}</div>)}
        </div>
        {/* Partial */}
        {v.partial?.length > 0 && (
          <div style={{ background: T.amberDim, border: `1px solid ${T.amber}20`, borderRadius: 8, padding: "12px" }}>
            <div style={{ fontSize: 9, color: T.amber, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>⚠️ Partial ({v.partial?.length || 0})</div>
            {(v.partial || []).map((m, i) => <div key={i} style={{ fontSize: 11, color: T.text2, lineHeight: 1.8, paddingLeft: 4 }}>· {m}</div>)}
          </div>
        )}
        {/* Unexpected */}
        {v.unexpected?.length > 0 && (
          <div style={{ background: T.violetDim, border: `1px solid ${T.violet}20`, borderRadius: 8, padding: "12px" }}>
            <div style={{ fontSize: 9, color: T.violet, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>⚡ Unexpected ({v.unexpected?.length || 0})</div>
            {(v.unexpected || []).map((m, i) => <div key={i} style={{ fontSize: 11, color: T.text2, lineHeight: 1.8, paddingLeft: 4 }}>· {m}</div>)}
          </div>
        )}
      </div>

      {v.recommendation && (
        <div style={{ marginTop: 10, background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ fontSize: 9, color: T.text3, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>AI Recommendation</div>
          <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.7 }}>{v.recommendation}</div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  // Views: upload | results | dashboard | runs | history
  const [view,       setView]       = useState("upload");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [health,     setHealth]     = useState(null);

  // Upload
  const [zipFile,    setZipFile]    = useState(null);
  const [reqText,    setReqText]    = useState("");
  const [reqFile,    setReqFile]    = useState(null);
  const [reqMode,    setReqMode]    = useState("text");
  const [commitRef,  setCommitRef]  = useState("");
  const [branch,     setBranch]     = useState("main");
  const [drag,       setDrag]       = useState(false);

  // Results
  const [runData,    setRunData]    = useState(null);
  const [selected,   setSelected]   = useState(null);
  const [activeTab,  setActiveTab]  = useState("testcases");

  // History + CI
  const [history,    setHistory]    = useState([]);
  const [ghRuns,     setGhRuns]     = useState([]);
  const [triggering, setTriggering] = useState(false);

  // Health check on load
  useEffect(() => { checkHealth(); }, []);

  async function checkHealth() {
    try { setHealth(await api("/api/health")); }
    catch { setHealth({ status: "error" }); }
  }

  async function loadGHRuns() {
    try { const d = await api("/api/github/runs"); setGhRuns(d.runs || []); }
    catch { setGhRuns([]); }
  }

  async function triggerRun() {
    setTriggering(true);
    try {
      await api("/api/github/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow: "test.yml", branch }),
      });
      setTimeout(loadGHRuns, 3000);
    } catch {}
    setTriggering(false);
  }

  // ── ANALYZE ─────────────────────────────────────────────────────────────────
  const runAnalysis = useCallback(async () => {
    if (!zipFile) { setError("Please upload a ZIP file."); return; }
    setLoading(true); setError(""); setRunData(null); setSelected(null);

    const form = new FormData();
    form.append("zipfile", zipFile);
    form.append("branch", branch);
    form.append("commitRef", commitRef);
    if (reqMode === "file" && reqFile)     form.append("requirement", reqFile);
    else if (reqText.trim())               form.append("requirementText", reqText);

    try {
      const data = await api("/api/analyze", { method: "POST", body: form });
      if (!data.success) throw new Error(data.error);
      setRunData(data);
      setSelected(data.results[0]);
      setActiveTab("testcases");
      setView("results");
      setHistory(p => [{ ...data, timestamp: new Date().toISOString(), zipName: zipFile.name }, ...p]);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, [zipFile, reqText, reqFile, reqMode, branch, commitRef]);

  // ── TABS FOR RESULT DETAIL ───────────────────────────────────────────────────
  const DETAIL_TABS = [
    { key: "testcases",  label: "Test Cases",        icon: "📋" },
    { key: "validation", label: "Req Validation",    icon: "🔍" },
    { key: "bdd",        label: "BDD Scenarios",     icon: "⬡" },
    { key: "tdd",        label: "TDD Script",        icon: "{ }" },
    { key: "cicd",       label: "CI/CD Workflow",    icon: "⚙" },
    { key: "coverage",   label: "Coverage",          icon: "◎" },
  ].filter(t => {
    if (!selected) return false;
    if (t.key === "validation") return true;
    if (t.key === "testcases")  return true;
    if (t.key === "bdd")        return selected.bddScenarios?.length > 10;
    if (t.key === "tdd")        return selected.tddScript?.length > 10;
    if (t.key === "cicd")       return selected.workflow?.length > 10;
    if (t.key === "coverage")   return true;
    return false;
  });

  // ── DASHBOARD TOTALS ─────────────────────────────────────────────────────────
  const totalFiles     = history.reduce((a, h) => a + (h.summary?.totalFiles || 0), 0);
  const totalAligned   = history.reduce((a, h) => a + (h.summary?.aligned || 0), 0);
  const totalPartial   = history.reduce((a, h) => a + (h.summary?.partial || 0), 0);
  const totalNotAligned = history.reduce((a, h) => a + (h.summary?.notAligned || 0), 0);
  const totalTCs       = history.reduce((a, h) => a + (h.summary?.totalTestCases || 0), 0);

  const NAV = [
    { key: "upload",    icon: "📦", label: "Upload"      },
    { key: "results",   icon: "◈",  label: "Results",   badge: runData?.summary?.totalFiles },
    { key: "dashboard", icon: "▦",  label: "Dashboard",  badge: history.length },
    { key: "runs",      icon: "⚙",  label: "CI/CD Runs" },
  ];

  return (
    <div style={{ background: T.bg0, minHeight: "100vh", color: T.text, fontFamily: "'Fira Code', 'Courier New', monospace", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes fadein { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: ${T.border2}; border-radius: 2px; }
        button:hover:not(:disabled) { filter: brightness(1.15); }
        textarea, input, select { font-family: 'Fira Code', monospace !important; }
        textarea:focus, input:focus, select:focus { outline: none !important; border-color: ${T.cyan} !important; }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <div style={{ background: T.bg1, borderBottom: `1px solid ${T.border}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 42, height: 42, background: `linear-gradient(135deg, ${T.cyan}, ${T.green})`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: T.bg0 }}>M</div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, background: `linear-gradient(90deg, ${T.cyan}, ${T.green})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Maantic AI TestGen
            </div>
            <div style={{ fontSize: 9, color: T.text3, letterSpacing: 2.5, textTransform: "uppercase" }}>Requirement-Driven CI/CD Portal · v3.0</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div onClick={checkHealth} style={{ display: "flex", alignItems: "center", gap: 6, background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 20, padding: "4px 12px", fontSize: 10, cursor: "pointer", color: health?.status === "ok" ? T.green : health ? T.red : T.text3 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: health?.status === "ok" ? T.green : T.red, animation: "pulse 2s infinite", display: "inline-block" }} />
            {health?.status === "ok" ? "Server Online" : "Server Offline"}
          </div>
          {health?.status === "ok" && (
            <div style={{ display: "flex", gap: 4 }}>
              <Badge c={health.hasApiKey ? "Claude ✅" : "Claude ❌"} col={health.hasApiKey ? T.green : T.red} size={10} />
              <Badge c={health.hasPatToken ? "GitHub ✅" : "GitHub ❌"} col={health.hasPatToken ? T.green : T.red} size={10} />
            </div>
          )}
        </div>
      </div>

      {/* ═══ PIPELINE STRIP ═══ */}
      <div style={{ background: T.bg1, borderBottom: `1px solid ${T.border}`, padding: "6px 24px", display: "flex", gap: 0, alignItems: "center", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", overflowX: "auto", flexShrink: 0 }}>
        {[
          { l: "1. Requirement",  done: !!(reqText || reqFile) },
          { l: "2. Upload Code",  done: !!zipFile },
          { l: "3. AI Validate",  done: !!runData, active: loading },
          { l: "4. Gen Tests",    done: !!runData?.summary?.totalTestCases },
          { l: "5. Push GitHub",  done: !!runData?.summary?.githubPushed },
          { l: "6. CI/CD",        done: false },
          { l: "7. Dashboard",    done: false },
        ].map((s, i) => (
          <span key={s.l} style={{ display: "flex", alignItems: "center" }}>
            <span style={{ padding: "2px 8px", borderRadius: 3, color: s.done ? T.green : s.active ? T.cyan : T.text4, background: s.active ? T.cyanDim : "transparent" }}>
              {s.done ? "✓ " : ""}{s.l}
            </span>
            {i < 6 && <span style={{ color: T.border3, margin: "0 1px" }}>›</span>}
          </span>
        ))}
      </div>

      {/* ═══ BODY ═══ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ─── SIDEBAR ─── */}
        <div style={{ width: 200, background: T.bg1, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ fontSize: 8, color: T.text4, letterSpacing: 2.5, textTransform: "uppercase", padding: "14px 16px 5px" }}>Navigation</div>
          {NAV.map(n => (
            <div key={n.key} onClick={() => { setView(n.key); if (n.key === "runs") loadGHRuns(); }}
              style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 16px", fontSize: 12, cursor: "pointer", color: view === n.key ? T.cyan : T.text2, background: view === n.key ? T.cyanDim : "transparent", borderLeft: `2px solid ${view === n.key ? T.cyan : "transparent"}`, transition: "all .12s" }}>
              <span>{n.icon}</span>
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.badge > 0 && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 8, background: view === n.key ? "rgba(0,212,255,0.12)" : T.bg3, color: view === n.key ? T.cyan : T.text3, border: `1px solid ${view === n.key ? "rgba(0,212,255,0.25)" : T.border2}` }}>{n.badge}</span>}
            </div>
          ))}

          <div style={{ height: 1, background: T.border, margin: "8px 0" }} />
          <div style={{ fontSize: 8, color: T.text4, letterSpacing: 2.5, textTransform: "uppercase", padding: "5px 16px" }}>Session</div>
          {[
            { l: "Uploads",      v: history.length,    c: T.cyan  },
            { l: "Files",        v: totalFiles,         c: T.blue  },
            { l: "Test Cases",   v: totalTCs,           c: T.green },
            { l: "Aligned",      v: totalAligned,       c: T.green },
            { l: "Partial",      v: totalPartial,       c: T.amber },
            { l: "Not Aligned",  v: totalNotAligned,    c: T.red   },
          ].map(s => (
            <div key={s.l} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "3px 16px", fontSize: 11 }}>
              <span style={{ color: T.text3 }}>{s.l}</span>
              <span style={{ color: s.v > 0 ? s.c : T.text4, fontWeight: s.v > 0 ? 700 : 400 }}>{s.v}</span>
            </div>
          ))}

          <div style={{ height: 1, background: T.border, margin: "8px 0" }} />
          <div style={{ fontSize: 8, color: T.text4, letterSpacing: 2.5, textTransform: "uppercase", padding: "5px 16px" }}>Supports</div>
          {["Java","Python","JavaScript","TypeScript","C#/.NET","Go","Ruby","PHP"].map(l => (
            <div key={l} style={{ padding: "2px 16px", fontSize: 10, color: T.text3 }}>· {l}</div>
          ))}
        </div>

        {/* ─── MAIN ─── */}
        <div style={{ flex: 1, overflowY: "auto", background: T.bg0 }}>

          {/* ════ UPLOAD VIEW ════ */}
          {view === "upload" && !loading && (
            <div style={{ padding: 28, animation: "fadein .3s ease" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 4 }}>New Analysis Run</div>
              <div style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>
                Requirement → Validate Code → Generate Tests → Push to GitHub
              </div>

              {/* KEY PRINCIPLE BANNER */}
              <div style={{ background: T.amberDim, border: `1px solid ${T.amber}35`, borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.amber, marginBottom: 3 }}>Core Principle</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.7 }}>
                    Test cases are generated FROM the requirement — NOT from the code. The code is only validated against the requirement. Always provide a requirement for best results.
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                {/* LEFT COLUMN */}
                <div>
                  {/* STEP 1: REQUIREMENT */}
                  <Card style={{ padding: 18, marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: T.cyan, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: T.bg0 }}>1</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13 }}>Requirement Input</div>
                      <Badge c="Recommended" col={T.amber} />
                    </div>

                    <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
                      {["text", "file"].map(m => (
                        <button key={m} onClick={() => setReqMode(m)} style={{ padding: "4px 12px", borderRadius: 5, fontSize: 10, fontFamily: "inherit", border: `1px solid ${reqMode === m ? T.cyan : T.border2}`, background: reqMode === m ? T.cyanDim : T.bg2, color: reqMode === m ? T.cyan : T.text3, cursor: "pointer" }}>
                          {m === "text" ? "Paste Text" : "Upload File"}
                        </button>
                      ))}
                    </div>

                    {reqMode === "text" ? (
                      <textarea value={reqText} onChange={e => setReqText(e.target.value)}
                        style={{ width: "100%", minHeight: 120, background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 7, color: T.text, fontSize: 11, padding: "10px 12px", resize: "vertical", lineHeight: 1.7 }}
                        placeholder={"Paste BDD / Jira Story / Acceptance Criteria...\n\nExample:\nAs a customer I want to process payments\nGiven I have a valid order\nWhen I apply coupon SAVE10\nThen a 10% discount should be applied\n\nLeave empty for exception mode (bug fix)"}
                      />
                    ) : (
                      <div>
                        <input type="file" accept=".md,.txt,.feature" id="reqinput" onChange={e => setReqFile(e.target.files[0])} style={{ display: "none" }} />
                        <div onClick={() => document.getElementById("reqinput").click()} style={{ border: `2px dashed ${reqFile ? T.cyan : T.border2}`, borderRadius: 7, padding: 18, textAlign: "center", cursor: "pointer", background: reqFile ? T.cyanDim : T.bg2 }}>
                          {reqFile ? <div style={{ color: T.cyan, fontSize: 12 }}>📄 {reqFile.name}</div> : <div style={{ color: T.text3, fontSize: 11 }}>Click to upload .md / .txt / .feature</div>}
                        </div>
                      </div>
                    )}

                    <input value={commitRef} onChange={e => setCommitRef(e.target.value)}
                      style={{ width: "100%", marginTop: 10, background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 5, color: T.text, fontSize: 11, padding: "7px 10px" }}
                      placeholder="Commit / Jira ref (optional — e.g. ERX-1234)"
                    />
                  </Card>

                  {/* BRANCH */}
                  <Card style={{ padding: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 9, color: T.text3, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Branch</div>
                    <input value={branch} onChange={e => setBranch(e.target.value)}
                      style={{ width: "100%", background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 5, color: T.text, fontSize: 11, padding: "7px 10px" }}
                      placeholder="main"
                    />
                  </Card>
                </div>

                {/* RIGHT COLUMN */}
                <div>
                  {/* STEP 2: ZIP */}
                  <Card style={{ padding: 18, marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: T.cyan, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: T.bg0 }}>2</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13 }}>Upload Code Package</div>
                      <Badge c="Required" col={T.red} />
                    </div>

                    <div
                      onDragOver={e => { e.preventDefault(); setDrag(true); }}
                      onDragLeave={() => setDrag(false)}
                      onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f?.name.endsWith(".zip")) setZipFile(f); }}
                      onClick={() => document.getElementById("zipinput").click()}
                      style={{ border: `2px dashed ${drag ? T.cyan : zipFile ? T.green : T.border2}`, borderRadius: 10, padding: "28px 20px", textAlign: "center", background: drag ? T.cyanDim : zipFile ? T.greenDim : T.bg2, cursor: "pointer", transition: "all .2s" }}
                    >
                      {zipFile ? (
                        <div>
                          <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                          <div style={{ color: T.green, fontSize: 12, fontWeight: 600 }}>📦 {zipFile.name}</div>
                          <div style={{ color: T.text3, fontSize: 10, marginTop: 4 }}>{(zipFile.size / 1024).toFixed(1)} KB · click to change</div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
                          <div style={{ color: T.text2, fontSize: 12, marginBottom: 4 }}>Drop ZIP here or click to browse</div>
                          <div style={{ color: T.text3, fontSize: 10 }}>Java · Python · JS/TS · C# · Go · Ruby · PHP</div>
                        </div>
                      )}
                      <input id="zipinput" type="file" accept=".zip" onChange={e => setZipFile(e.target.files[0])} style={{ display: "none" }} />
                    </div>

                    {/* Detection modes */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10 }}>
                      {[
                        { l: "No tests in ZIP", d: "Generates BDD + TDD", c: T.blue },
                        { l: "Has BDD",         d: "Enhances + gen TDD", c: T.violet },
                        { l: "Has TDD",         d: "Enhances + gen BDD", c: T.amber },
                        { l: "Has both",        d: "Enhances both",      c: T.green },
                      ].map(m => (
                        <div key={m.l} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "8px 10px" }}>
                          <Badge c={m.l} col={m.c} />
                          <div style={{ fontSize: 9, color: T.text3, marginTop: 5, lineHeight: 1.5 }}>{m.d}</div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* STEP 3: RUN */}
                  <Btn variant="primary" onClick={runAnalysis} disabled={!zipFile}>
                    ◈ Run AI Analysis
                  </Btn>
                  {!reqText.trim() && !reqFile && (
                    <div style={{ marginTop: 10, fontSize: 11, color: T.amber }}>⚠️ No requirement — will run in exception mode</div>
                  )}
                </div>
              </div>

              {error && (
                <div style={{ marginTop: 16, background: T.redDim, border: `1px solid ${T.red}35`, borderRadius: 8, padding: "12px 16px", color: T.red, fontSize: 12 }}>⚠️ {error}</div>
              )}
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", animation: "fadein .3s ease" }}>
              <div style={{ width: 60, height: 60, border: `3px solid ${T.border2}`, borderTopColor: T.cyan, borderRadius: "50%", animation: "spin .7s linear infinite", marginBottom: 28 }} />
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 12, background: `linear-gradient(90deg, ${T.cyan}, ${T.green})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                AI is Running Analysis...
              </div>
              <div style={{ color: T.text3, fontSize: 11, lineHeight: 2.4, textAlign: "center" }}>
                <div>✦ Extracting code, BDD & TDD from ZIP</div>
                <div>✦ Validating code against requirement</div>
                <div>✦ Generating human-readable test cases</div>
                <div>✦ Producing BDD scenarios & TDD scripts</div>
                <div>✦ Generating GitHub Actions workflow</div>
                <div>✦ Pushing results to GitHub</div>
              </div>
            </div>
          )}

          {/* ════ RESULTS VIEW ════ */}
          {view === "results" && !loading && runData && (
            <div style={{ padding: 28, animation: "fadein .3s ease" }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Run: {runData.runId}</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    <Badge c={`${runData.summary?.totalFiles} files`} col={T.cyan} />
                    <Badge c={`${runData.summary?.aligned} aligned`} col={T.green} />
                    <Badge c={`${runData.summary?.partial} partial`} col={T.amber} />
                    <Badge c={`${runData.summary?.notAligned} not aligned`} col={T.red} />
                    <Badge c={`${runData.summary?.totalTestCases} test cases`} col={T.violet} />
                    <Badge c={`${runData.summary?.githubPushed} pushed to GitHub`} col={T.green} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn sm onClick={() => dl(`run_${runData.runId}.md`, runData.results.map(r => `# ${r.file}\nAlignment: ${r.validation?.status}\nTest Cases: ${r.testCases?.length}\n\n${r.bddScenarios}\n\n${r.tddScript}`).join("\n\n---\n\n"))}>↓ All</Btn>
                  <Btn sm onClick={() => setView("upload")}>+ New Run</Btn>
                </div>
              </div>

              <div style={{ display: "flex", gap: 14 }}>
                {/* File list */}
                <div style={{ width: 220, flexShrink: 0 }}>
                  {runData.results.map((r, i) => {
                    const col = alignColor(r.validation?.status);
                    return (
                      <div key={i} onClick={() => { setSelected(r); setActiveTab("testcases"); }}
                        style={{ padding: "10px 12px", borderRadius: 8, marginBottom: 6, cursor: "pointer", background: selected?.file === r.file ? T.cyanDim : T.bg2, border: `1px solid ${selected?.file === r.file ? T.cyan : T.border}`, transition: "all .15s" }}>
                        <div style={{ fontSize: 11, color: selected?.file === r.file ? T.cyan : T.text, fontWeight: 600, marginBottom: 5, wordBreak: "break-all" }}>
                          {r.file.split("/").pop()}
                        </div>
                        <div style={{ display: "flex", gap: 4, marginBottom: 4, flexWrap: "wrap" }}>
                          <Badge c={r.language} col={T.blue} />
                          <Badge c={r.validation?.status || "NO_REQ"} col={col} />
                        </div>
                        <div style={{ fontSize: 10, color: T.text3 }}>v{r.version} · {r.testCases?.length || 0} TCs</div>
                        {r.validation && <ScoreBar score={r.validation.score} color={col} />}
                      </div>
                    );
                  })}
                </div>

                {/* Detail */}
                {selected && (
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* File header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 5 }}>{selected.file.split("/").pop()}</div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          <Badge c={selected.language} col={T.blue} />
                          <Badge c={`v${selected.version}`} col={T.text3} />
                          {selected.hadBDD && <Badge c="Had BDD" col={T.violet} />}
                          {selected.hadTDD && <Badge c="Had TDD" col={T.amber} />}
                          {selected.validation && <Badge c={`${selected.validation.score}/100`} col={alignColor(selected.validation.status)} />}
                          <Badge c="✅ GitHub" col={T.green} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {selected.bddScenarios && <Btn sm onClick={() => dl(`${selected.file.split("/").pop()}.feature`, selected.bddScenarios)}>↓ BDD</Btn>}
                        {selected.tddScript && <Btn sm onClick={() => dl(`test_${selected.file.split("/").pop()}`, selected.tddScript)}>↓ TDD</Btn>}
                        {selected.workflow && <Btn sm onClick={() => dl("test.yml", selected.workflow)}>↓ CI/CD</Btn>}
                      </div>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
                      {DETAIL_TABS.map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: "5px 12px", borderRadius: 5, fontSize: 11, fontFamily: "inherit", border: `1px solid ${activeTab === t.key ? T.cyan : T.border2}`, background: activeTab === t.key ? T.cyanDim : T.bg2, color: activeTab === t.key ? T.cyan : T.text3, fontWeight: activeTab === t.key ? 700 : 400, cursor: "pointer" }}>
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab content */}
                    <Card>
                      <div style={{ padding: "9px 14px", borderBottom: `1px solid ${T.border}`, background: T.bg2, fontSize: 10, color: T.text3, letterSpacing: 1, textTransform: "uppercase" }}>
                        {DETAIL_TABS.find(t => t.key === activeTab)?.label}
                      </div>
                      {activeTab === "testcases" && (
                        <div style={{ padding: 12, maxHeight: 520, overflowY: "auto" }}>
                          {selected.testCases?.length > 0
                            ? selected.testCases.map((tc, i) => <TestCaseCard key={i} tc={tc} />)
                            : <div style={{ padding: 20, color: T.text3, fontSize: 12 }}>No test cases generated.</div>
                          }
                        </div>
                      )}
                      {activeTab === "validation" && <ValidationPanel v={selected.validation} />}
                      {(activeTab === "bdd" || activeTab === "tdd" || activeTab === "cicd") && (
                        <pre style={{ padding: 14, fontSize: 11, lineHeight: 1.8, color: T.text, whiteSpace: "pre-wrap", maxHeight: 520, overflowY: "auto", fontFamily: "'Fira Code', monospace" }}>
                          {activeTab === "bdd" ? selected.bddScenarios : activeTab === "tdd" ? selected.tddScript : selected.workflow}
                        </pre>
                      )}
                      {activeTab === "coverage" && (
                        <div style={{ padding: 14 }}>
                          <div style={{ fontSize: 12, color: T.text2, marginBottom: 12, lineHeight: 1.7 }}>{selected.coverageSummary}</div>
                          {selected.missingCoverage?.length > 0 && (
                            <div>
                              <div style={{ fontSize: 9, color: T.red, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Missing Coverage</div>
                              {selected.missingCoverage.map((m, i) => (
                                <div key={i} style={{ fontSize: 11, color: T.text2, lineHeight: 1.8, paddingLeft: 8 }}>❌ {m}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════ DASHBOARD VIEW ════ */}
          {view === "dashboard" && (
            <div style={{ padding: 28, animation: "fadein .3s ease" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 4 }}>Dashboard</div>
              <div style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>Centralized visibility — alignment, test cases, and run history</div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 20 }}>
                <StatCard label="Total Runs"    value={history.length}   color={T.cyan}   icon="🔄" />
                <StatCard label="Files"         value={totalFiles}        color={T.blue}   icon="📄" />
                <StatCard label="Test Cases"    value={totalTCs}          color={T.violet} icon="📋" />
                <StatCard label="Aligned"       value={totalAligned}      color={T.green}  icon="✅" />
                <StatCard label="Not Aligned"   value={totalNotAligned}   color={T.red}    icon="❌" />
              </div>

              {/* Alignment breakdown */}
              {totalFiles > 0 && (
                <Card style={{ padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 9, color: T.text3, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Requirement Alignment — All Runs</div>
                  <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                    {[
                      { l: "Aligned",     v: totalAligned,    c: T.green  },
                      { l: "Partial",     v: totalPartial,    c: T.amber  },
                      { l: "Not Aligned", v: totalNotAligned, c: T.red    },
                    ].map(s => (
                      <div key={s.l} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.c }} />
                        <span style={{ fontSize: 11, color: T.text2 }}>{s.l}</span>
                        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: s.c }}>{s.v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ height: 8, background: T.border, borderRadius: 4, overflow: "hidden", display: "flex" }}>
                    <div style={{ width: `${totalFiles ? (totalAligned / totalFiles) * 100 : 0}%`, background: T.green, transition: "width 1s" }} />
                    <div style={{ width: `${totalFiles ? (totalPartial / totalFiles) * 100 : 0}%`, background: T.amber, transition: "width 1s" }} />
                    <div style={{ width: `${totalFiles ? (totalNotAligned / totalFiles) * 100 : 0}%`, background: T.red, transition: "width 1s" }} />
                  </div>
                </Card>
              )}

              {/* History table */}
              <Card style={{ overflow: "hidden" }}>
                <div style={{ padding: "10px 16px", background: T.bg2, borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 9, color: T.text3, letterSpacing: 1.5, textTransform: "uppercase" }}>Run History</span>
                  <span style={{ fontSize: 9, color: T.text4 }}>{history.length} runs this session</span>
                </div>
                {history.length === 0 ? (
                  <div style={{ padding: 48, textAlign: "center", color: T.text4, fontSize: 12 }}>No runs yet. Go to Upload to start.</div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          {["Run ID","Package","Req","Files","TCs","Aligned","Partial","Not Aligned","Branch","GitHub","Time","Actions"].map(h => (
                            <th key={h} style={{ fontSize: 8, color: T.text4, letterSpacing: 1.2, textTransform: "uppercase", textAlign: "left", padding: "8px 12px", background: T.bg2, borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((h, i) => (
                          <tr key={h.runId} style={{ borderBottom: `1px solid ${T.border}` }}>
                            <td style={{ padding: "9px 12px" }}><span style={{ fontSize: 10, color: T.cyan, fontFamily: "'Fira Code', monospace" }}>{h.runId}</span></td>
                            <td style={{ padding: "9px 12px" }}>
                              <div style={{ fontSize: 11, color: T.text }}>📦 {h.zipName}</div>
                            </td>
                            <td style={{ padding: "9px 12px" }}><Badge c={h.summary?.noReq === 0 ? "✅" : "⚠️"} col={h.summary?.noReq === 0 ? T.green : T.amber} /></td>
                            <td style={{ padding: "9px 12px" }}><Badge c={h.summary?.totalFiles} col={T.cyan} /></td>
                            <td style={{ padding: "9px 12px" }}><Badge c={h.summary?.totalTestCases} col={T.violet} /></td>
                            <td style={{ padding: "9px 12px" }}><Badge c={h.summary?.aligned} col={T.green} /></td>
                            <td style={{ padding: "9px 12px" }}><Badge c={h.summary?.partial} col={T.amber} /></td>
                            <td style={{ padding: "9px 12px" }}><Badge c={h.summary?.notAligned} col={T.red} /></td>
                            <td style={{ padding: "9px 12px" }}><Badge c={h.summary?.branch || "main"} col={T.blue} /></td>
                            <td style={{ padding: "9px 12px" }}><Badge c={`${h.summary?.githubPushed} pushed`} col={T.green} /></td>
                            <td style={{ padding: "9px 12px", fontSize: 10, color: T.text4, whiteSpace: "nowrap" }}>{new Date(h.timestamp).toLocaleTimeString()}</td>
                            <td style={{ padding: "9px 12px" }}>
                              <div style={{ display: "flex", gap: 5 }}>
                                <Btn sm onClick={() => { setRunData(h); setSelected(h.results?.[0]); setActiveTab("testcases"); setView("results"); }}>View</Btn>
                                <Btn sm onClick={() => {
                                  const c = (h.results || []).map(r => `# ${r.file}\n\n${r.bddScenarios || ""}`).join("\n\n---\n\n");
                                  dl(`run_${h.runId}_all.md`, c);
                                }}>↓</Btn>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ════ CI/CD RUNS VIEW ════ */}
          {view === "runs" && (
            <div style={{ padding: 28, animation: "fadein .3s ease" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 4 }}>CI/CD Runs</div>
                  <div style={{ fontSize: 12, color: T.text3 }}>GitHub Actions — live run status and trigger controls</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={loadGHRuns} sm>↺ Refresh</Btn>
                  <Btn variant="primary" onClick={triggerRun} disabled={triggering}>
                    {triggering ? "Triggering..." : "▶ Trigger Run"}
                  </Btn>
                </div>
              </div>

              {/* Trigger modes info */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
                {[
                  { icon: "⚡", title: "Auto (on commit)", desc: "Triggers automatically on every push to main or PR", color: T.green },
                  { icon: "🖱️", title: "Manual trigger", desc: "Click 'Trigger Run' above to run on-demand", color: T.cyan },
                  { icon: "📦", title: "Batch mode", desc: "Wait for multiple commits then run together", color: T.amber },
                ].map(m => (
                  <Card key={m.title} style={{ padding: 14 }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{m.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: m.color, marginBottom: 4 }}>{m.title}</div>
                    <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.6 }}>{m.desc}</div>
                  </Card>
                ))}
              </div>

              {/* GitHub Actions runs */}
              <Card style={{ overflow: "hidden" }}>
                <div style={{ padding: "10px 16px", background: T.bg2, borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 9, color: T.text3, letterSpacing: 1.5, textTransform: "uppercase" }}>GitHub Actions Runs</span>
                </div>
                {ghRuns.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: T.text4, fontSize: 12 }}>
                    Click "Refresh" to load GitHub Actions runs, or "Trigger Run" to start a new one.
                  </div>
                ) : ghRuns.map((run, i) => (
                  <div key={run.id} style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 16 }}>
                      {run.status === "completed" && run.conclusion === "success" ? "✅" :
                       run.status === "completed" && run.conclusion === "failure" ? "❌" :
                       run.status === "in_progress" ? "🔄" : "○"}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>{run.name}</div>
                      <div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>
                        #{run.run_number} · {run.head_branch} · {run.event} · {new Date(run.created_at).toLocaleString()}
                      </div>
                    </div>
                    <Badge c={run.conclusion || run.status} col={
                      run.conclusion === "success" ? T.green :
                      run.conclusion === "failure" ? T.red :
                      run.status === "in_progress" ? T.cyan : T.text3
                    } />
                    <a href={run.html_url} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: T.cyan, textDecoration: "none" }}>View ↗</a>
                  </div>
                ))}
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
