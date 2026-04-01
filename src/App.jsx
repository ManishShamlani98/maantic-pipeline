import { useState } from "react";

const C = {
  bg0: "#080a0c", bg1: "#0e1115", bg2: "#141820", bg3: "#1c2230",
  border: "#242c3a", border2: "#2e3a4e",
  accent: "#00f0a0", blue: "#4d9fff",
  pass: "#22d68a", fail: "#ff4466", warn: "#ffb020", purple: "#c084fc",
  text: "#dde4f0", text2: "#8896b0", text3: "#4a5870", text4: "#2e3a50",
};

export default function App() {
  const [file, setFile]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [results, setResults]   = useState([]);
  const [error, setError]       = useState("");
  const [selected, setSelected] = useState(null);
  const [drag, setDrag]         = useState(false);

  async function analyze(f) {
    setLoading(true); setResults([]); setError(""); setSelected(null);
    const form = new FormData();
    form.append("zipfile", f);
    try {
      const res = await fetch("http://localhost:3002/api/analyze", {
        method: "POST", body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      setResults(data.files);
      setSelected(data.files[0]);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  function onFileChange(e) {
    const f = e.target.files[0];
    if (f) { setFile(f); analyze(f); }
  }

  function onDrop(e) {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith(".zip")) { setFile(f); analyze(f); }
    else setError("Please drop a .zip file");
  }

  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  function extractSection(text, section) {
    const parts = text.split("===");
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].trim().startsWith(section)) {
        return parts[i + 1]?.trim() || "";
      }
    }
    return text;
  }

  return (
    <div style={{ background: C.bg0, minHeight: "100vh", color: C.text, fontFamily: "'JetBrains Mono','Courier New',monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Outfit:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        ::-webkit-scrollbar { width: 4px; } 
        ::-webkit-scrollbar-thumb { background: #2e3a4e; border-radius: 2px; }
      `}</style>

      {/* HEADER */}
      <div style={{ background: C.bg1, borderBottom: `1px solid ${C.border}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, background: C.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 18, color: "#080a0c" }}>M</div>
          <div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 20 }}>AI TestGen Pipeline</div>
            <div style={{ fontSize: 10, color: C.text3, letterSpacing: 2, textTransform: "uppercase" }}>Self-Healing CI/CD · Maantic POC</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,240,160,0.1)", border: "1px solid rgba(0,240,160,0.25)", borderRadius: 20, padding: "4px 12px", fontSize: 11, color: C.accent }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, animation: "pulse 2s infinite", display: "inline-block" }} />
            GenAI Live
          </div>
          <span style={{ fontSize: 10, color: C.text3, border: `1px solid ${C.border2}`, borderRadius: 20, padding: "4px 10px" }}>claude-sonnet-4</span>
        </div>
      </div>

      {/* PIPELINE STEPS */}
      <div style={{ background: C.bg1, borderBottom: `1px solid ${C.border}`, padding: "8px 24px", display: "flex", gap: 4, alignItems: "center", fontSize: 10, color: C.text4, letterSpacing: 1, textTransform: "uppercase" }}>
        {["Upload ZIP", "Extract Code", "AI Analysis", "BDD Scenarios", "TDD Scripts", "CI/CD Workflow", "Results"].map((s, i) => (
          <span key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: results.length > 0 ? C.pass : loading && i < 3 ? C.accent : C.text4 }}>{s}</span>
            {i < 6 && <span style={{ color: C.border2, margin: "0 2px" }}>›</span>}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 97px)" }}>

        {/* LEFT PANEL */}
        <div style={{ width: 280, background: C.bg1, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", padding: 16, gap: 16, overflowY: "auto" }}>

          {/* UPLOAD ZONE */}
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            style={{
              border: `2px dashed ${drag ? C.accent : C.border2}`,
              borderRadius: 10, padding: 24, textAlign: "center",
              background: drag ? "rgba(0,240,160,0.05)" : C.bg2,
              cursor: "pointer", transition: "all .2s"
            }}
            onClick={() => document.getElementById("zipinput").click()}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
            <div style={{ fontSize: 12, color: C.text2, marginBottom: 4 }}>Drop ZIP file here</div>
            <div style={{ fontSize: 10, color: C.text3 }}>or click to browse</div>
            <input id="zipinput" type="file" accept=".zip" onChange={onFileChange} style={{ display: "none" }} />
          </div>

          {file && (
            <div style={{ background: C.bg2, border: `1px solid ${C.border2}`, borderRadius: 8, padding: 10, fontSize: 11 }}>
              <div style={{ color: C.accent, marginBottom: 4 }}>📁 {file.name}</div>
              <div style={{ color: C.text3 }}>{(file.size / 1024).toFixed(1)} KB</div>
            </div>
          )}

          {/* FILE LIST */}
          {results.length > 0 && (
            <div>
              <div style={{ fontSize: 9, color: C.text4, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
                Analysed Files ({results.length})
              </div>
              {results.map((r, i) => (
                <div key={i} onClick={() => setSelected(r)} style={{
                  padding: "8px 10px", borderRadius: 6, marginBottom: 4, cursor: "pointer", fontSize: 11,
                  background: selected?.file === r.file ? "rgba(0,240,160,0.08)" : "transparent",
                  borderLeft: `2px solid ${selected?.file === r.file ? C.accent : "transparent"}`,
                  color: selected?.file === r.file ? C.accent : C.text2,
                }}>
                  {r.file.split("/").pop()}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>

          {/* LOADING */}
          {loading && (
            <div style={{ textAlign: "center", padding: 60 }}>
              <div style={{ width: 48, height: 48, border: `3px solid ${C.border2}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 20px" }} />
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Analysing Your Code...</div>
              <div style={{ color: C.text3, fontSize: 12 }}>AI is generating BDD scenarios, TDD scripts and CI/CD workflow</div>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div style={{ background: "rgba(255,68,102,0.1)", border: `1px solid ${C.fail}`, borderRadius: 10, padding: 16, color: C.fail, fontSize: 13 }}>
              ⚠ {error}
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && results.length === 0 && (
            <div style={{ textAlign: "center", padding: 80 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🚀</div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Upload Your Code ZIP</div>
              <div style={{ color: C.text3, fontSize: 13, maxWidth: 400, margin: "0 auto", lineHeight: 1.8 }}>
                Drop a ZIP file containing your Java, Python, or JavaScript code.<br />
                AI will automatically generate BDD scenarios, TDD test scripts, and a GitHub Actions CI/CD workflow.
              </div>
            </div>
          )}

          {/* RESULTS */}
          {selected && !loading && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 20 }}>{selected.file.split("/").pop()}</div>
                  <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{selected.file}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => downloadFile(`bdd_${selected.file.split("/").pop()}.feature`, extractSection(selected.tests, "BDD SCENARIOS"))}
                    style={{ padding: "8px 14px", borderRadius: 6, border: `1px solid ${C.border2}`, background: C.bg2, color: C.text2, cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>
                    ↓ BDD File
                  </button>
                  <button onClick={() => downloadFile(`test_${selected.file.split("/").pop()}`, extractSection(selected.tests, "TDD TEST SCRIPT"))}
                    style={{ padding: "8px 14px", borderRadius: 6, border: `1px solid ${C.border2}`, background: C.bg2, color: C.text2, cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>
                    ↓ TDD File
                  </button>
                  <button onClick={() => downloadFile("test.yml", extractSection(selected.tests, "GITHUB ACTIONS WORKFLOW"))}
                    style={{ padding: "8px 14px", borderRadius: 6, border: "none", background: C.accent, color: "#080a0c", cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 700 }}>
                    ↓ GitHub Actions YML
                  </button>
                </div>
              </div>

              {/* TABS */}
              {[
                { key: "BDD SCENARIOS", label: "BDD Scenarios", color: C.purple },
                { key: "TDD TEST SCRIPT", label: "TDD Test Script", color: C.blue },
                { key: "GITHUB ACTIONS WORKFLOW", label: "GitHub Actions CI/CD", color: C.accent },
              ].map(({ key, label, color }) => (
                <div key={key} style={{ marginBottom: 16, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ background: C.bg2, padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
                    <span style={{ fontSize: 11, color: C.text2, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
                  </div>
                  <pre style={{ padding: 16, fontSize: 11, lineHeight: 1.8, color: C.text, whiteSpace: "pre-wrap", maxHeight: 300, overflowY: "auto", background: C.bg1, fontFamily: "inherit" }}>
                    {extractSection(selected.tests, key) || "No content generated"}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}