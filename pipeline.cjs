/**
 * MAANTIC AI TESTGEN PIPELINE — Backend v3.0
 * Requirement-Driven CI/CD Testing Portal
 *
 * Core Principle: Requirement is SOURCE OF TRUTH
 * Code is VALIDATED against requirement — NOT the other way around
 */

const express  = require("express");
const cors     = require("cors");
const multer   = require("multer");
const AdmZip   = require("adm-zip");
const path     = require("path");
const fs       = require("fs");
const crypto   = require("crypto");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const upload = multer({ storage: multer.memoryStorage() }).fields([
  { name: "zipfile",     maxCount: 1 },
  { name: "requirement", maxCount: 1 },
]);

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const PAT_TOKEN     = process.env.PAT_TOKEN;
const GITHUB_REPO   = process.env.GITHUB_REPO || "ManishShamlani98/maantic-pipeline";

const CODE_EXT = [".java",".py",".js",".ts",".cs",".go",".rb",".php"];
const BDD_EXT  = [".feature"];
const TDD_PATS = ["test","spec","Test","Spec","_test","test_"];

const LANG_MAP = {
  ".java":"Java",".py":"Python",".js":"JavaScript",
  ".ts":"TypeScript",".cs":"C#/.NET",".go":"Go",
  ".rb":"Ruby",".php":"PHP"
};

// ─── IN-MEMORY STORE (use DB in production) ──────────────────────────────────
const store = {
  runs:         [],   // all pipeline runs
  testCases:    {},   // key: reqHash → [testCases]
  versions:     {},   // key: file → [versions]
  requirements: {},   // key: hash → requirement text
};

// ─── UTILITIES ────────────────────────────────────────────────────────────────
function detectType(filename) {
  const base = path.basename(filename).toLowerCase();
  const ext  = path.extname(filename).toLowerCase();
  if (BDD_EXT.includes(ext)) return "bdd";
  if (TDD_PATS.some(p => base.includes(p))) return "tdd";
  if (CODE_EXT.includes(ext)) return "code";
  if ([".md",".txt"].includes(ext)) return "doc";
  return "other";
}

function hashText(text) {
  return crypto.createHash("md5").update(text || "").digest("hex").slice(0, 8);
}

function deduplicateTestCases(existing, newCases) {
  const seen = new Set(existing.map(tc => tc.title?.toLowerCase().trim()));
  return newCases.filter(tc => !seen.has(tc.title?.toLowerCase().trim()));
}

// ─── CLAUDE AI CALL ───────────────────────────────────────────────────────────
async function callClaude(systemPrompt, userPrompt, maxTokens = 4000) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  const data = await res.json();
  return data?.content?.[0]?.text ?? "";
}

// ─── MODULE 1: REQUIREMENT vs CODE VALIDATION ─────────────────────────────────
async function validateRequirementVsCode(requirement, codeContent, filename, lang) {
  const system = `You are a strict QA validation engine.
Your ONLY job is to compare a business requirement against source code.
Output MUST be valid JSON. No markdown, no explanation outside JSON.`;

  const user = `Compare this requirement against this ${lang} source code.

REQUIREMENT:
${requirement}

SOURCE CODE (${filename}):
${codeContent.slice(0, 3000)}

Return ONLY this JSON structure:
{
  "status": "ALIGNED|PARTIAL|NOT_ALIGNED|CANNOT_DETERMINE",
  "score": 0-100,
  "summary": "one sentence summary",
  "matched": ["list of requirement points that are implemented"],
  "missing": ["list of requirement points NOT implemented"],
  "unexpected": ["code behaviors not in requirement"],
  "partial": ["requirement points partially implemented"],
  "recommendation": "what the developer needs to fix"
}`;

  const raw = await callClaude(system, user, 1500);
  try {
    const json = raw.replace(/```json?|```/g, "").trim();
    return JSON.parse(json);
  } catch {
    return {
      status: "CANNOT_DETERMINE",
      score: 0,
      summary: "Could not parse validation result",
      matched: [], missing: [], unexpected: [], partial: [],
      recommendation: raw.slice(0, 300)
    };
  }
}

// ─── MODULE 2: TEST CASE GENERATION FROM REQUIREMENT ──────────────────────────
async function generateTestCasesFromRequirement(requirement, lang, existingBDD, existingTDD, validationResult) {
  const system = `You are a senior QA engineer generating test cases.
CRITICAL RULE: Generate test cases ONLY from the REQUIREMENT — never from the code.
The code is only context for validation. Test cases must be human-readable.
Output MUST be valid JSON only.`;

  const missingPoints = validationResult?.missing?.join(", ") || "none";
  const partialPoints = validationResult?.partial?.join(", ") || "none";

  const user = `Generate test cases ONLY from this requirement.

REQUIREMENT:
${requirement}

Language for test scripts: ${lang}
Missing from code: ${missingPoints}
Partially implemented: ${partialPoints}

${existingBDD ? `Existing BDD (enhance these, do not duplicate):\n${existingBDD.slice(0,800)}` : ""}
${existingTDD ? `Existing TDD (enhance these, do not duplicate):\n${existingTDD.slice(0,800)}` : ""}

Return ONLY this JSON:
{
  "testCases": [
    {
      "id": "TC-001",
      "title": "Human readable title",
      "description": "What this test verifies from the requirement",
      "requirement_ref": "Which part of requirement this covers",
      "input": {"field": "value"},
      "expected_output": "Plain English expected result",
      "steps": ["Given ...", "When ...", "Then ..."],
      "tags": ["@smoke", "@regression"],
      "priority": "HIGH|MEDIUM|LOW",
      "type": "POSITIVE|NEGATIVE|EDGE|PERFORMANCE"
    }
  ],
  "bdd_scenarios": "Full Gherkin feature file content as string",
  "tdd_script": "Complete runnable ${lang} test file as string",
  "coverage_summary": "What % of requirement is covered",
  "missing_coverage": ["requirement points not yet covered by any test"]
}`;

  const raw = await callClaude(system, user, 4000);
  try {
    const json = raw.replace(/```json?|```/g, "").trim();
    return JSON.parse(json);
  } catch {
    return {
      testCases: [],
      bdd_scenarios: raw,
      tdd_script: "",
      coverage_summary: "Parse error",
      missing_coverage: []
    };
  }
}

// ─── MODULE 3: GITHUB ACTIONS WORKFLOW GENERATOR ──────────────────────────────
async function generateCICDWorkflow(lang, repoName, testFiles) {
  const system = `You are a DevOps engineer. Generate a GitHub Actions workflow YAML. Return only the YAML, no explanation.`;
  const user = `Generate a complete GitHub Actions CI/CD workflow for a ${lang} project.
Repo: ${repoName}
Test files: ${testFiles.join(", ")}

Requirements:
- Trigger on push, pull_request, and workflow_dispatch
- Setup ${lang} environment properly
- Install dependencies
- Run all tests
- Upload test results as artifacts
- Notify on failure
- Use latest action versions (v4)`;

  return await callClaude(system, user, 2000);
}

// ─── MODULE 4: GITHUB PUSH ────────────────────────────────────────────────────
async function pushToGitHub(filepath, content, message) {
  if (!PAT_TOKEN) return { success: false, error: "No PAT_TOKEN set" };
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filepath}`;
    const headers = {
      "Authorization": `token ${PAT_TOKEN}`,
      "Accept": "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    };
    const check = await fetch(url, { headers });
    let sha;
    if (check.ok) sha = (await check.json()).sha;

    const body = { message, content: Buffer.from(content).toString("base64") };
    if (sha) body.sha = sha;

    const res = await fetch(url, { method: "PUT", headers, body: JSON.stringify(body) });
    if (res.ok) {
      const data = await res.json();
      console.log(`  ✅ GitHub: ${filepath}`);
      return { success: true, url: data?.content?.html_url };
    }
    return { success: false, error: `HTTP ${res.status}` };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ─── MODULE 5: VERSION MANAGEMENT ─────────────────────────────────────────────
function bumpVersion(filename) {
  if (!store.versions[filename]) store.versions[filename] = [];
  const v = store.versions[filename].length;
  store.versions[filename].push({
    version: v,
    timestamp: new Date().toISOString(),
  });
  return v;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

// ── HEALTH ────────────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    version: "3.0.0",
    hasApiKey:  !!ANTHROPIC_KEY,
    hasPatToken: !!PAT_TOKEN,
    repo: GITHUB_REPO,
    runsCount: store.runs.length,
    timestamp: new Date().toISOString(),
  });
});

// ── MAIN ANALYZE ENDPOINT ──────────────────────────────────────────────────────
app.post("/api/analyze", upload, async (req, res) => {
  const runId   = `RUN-${Date.now()}`;
  const startTs = Date.now();

  try {
    const zipFile = req.files?.zipfile?.[0];
    const reqFile = req.files?.requirement?.[0];
    if (!zipFile) return res.status(400).json({ error: "No ZIP file uploaded" });

    // Get requirement
    let requirement = req.body?.requirementText || "";
    if (reqFile) requirement = reqFile.buffer.toString("utf8");
    const commitRef = req.body?.commitRef || "";
    const branch    = req.body?.branch || "main";
    const hasReq    = requirement.trim().length > 20;

    console.log(`\n${"=".repeat(60)}`);
    console.log(`🚀 ${runId} | ZIP: ${zipFile.originalname}`);
    console.log(`📋 Requirement: ${hasReq ? "provided" : "NONE (exception mode)"}`);
    console.log(`🔖 Branch: ${branch} | CommitRef: ${commitRef || "none"}`);

    // Extract ZIP
    const zip     = new AdmZip(zipFile.buffer);
    const entries = zip.getEntries();
    const codeFiles = [], bddFiles = [], tddFiles = [];

    for (const entry of entries) {
      if (entry.isDirectory) continue;
      const content = entry.getData().toString("utf8");
      if (content.trim().length < 20) continue;
      const type = detectType(entry.entryName);
      const obj  = { name: entry.entryName, content };
      if (type === "code")      codeFiles.push(obj);
      else if (type === "bdd")  bddFiles.push(obj);
      else if (type === "tdd")  tddFiles.push(obj);
    }

    console.log(`📁 Files: ${codeFiles.length} code | ${bddFiles.length} BDD | ${tddFiles.length} TDD`);
    if (!codeFiles.length) return res.status(400).json({ error: "No source code files found in ZIP" });

    const reqHash = hashText(requirement);
    if (hasReq) store.requirements[reqHash] = requirement;

    const results = [];
    const githubPushes = [];

    for (const file of codeFiles) {
      const lang    = LANG_MAP[path.extname(file.name)] || "JavaScript";
      const baseName = path.basename(file.name, path.extname(file.name)).toLowerCase();
      const relBDD  = bddFiles.find(b => path.basename(b.name,path.extname(b.name)).toLowerCase().includes(baseName));
      const relTDD  = tddFiles.find(t => path.basename(t.name,path.extname(t.name)).toLowerCase().includes(baseName));
      const version = bumpVersion(file.name);

      console.log(`\n  📄 ${file.name} [${lang}] v${version}`);

      // MODULE 1: Validate requirement vs code
      let validation = null;
      if (hasReq) {
        console.log(`    → Validating requirement vs code...`);
        validation = await validateRequirementVsCode(requirement, file.content, file.name, lang);
        console.log(`    ✓ Alignment: ${validation.status} (${validation.score}/100)`);
      }

      // MODULE 2: Generate test cases from requirement
      let generated = null;
      const effectiveReq = hasReq ? requirement : `Analyze the code behavior in ${file.name} and create comprehensive test cases.`;
      console.log(`    → Generating test cases from ${hasReq ? "requirement" : "code (exception mode)"}...`);
      generated = await generateTestCasesFromRequirement(effectiveReq, lang, relBDD?.content, relTDD?.content, validation);

      // Deduplicate test cases
      const existingTCs = store.testCases[reqHash] || [];
      const newTCs = generated.testCases || [];
      const uniqueNewTCs = deduplicateTestCases(existingTCs, newTCs);
      store.testCases[reqHash] = [...existingTCs, ...uniqueNewTCs];

      console.log(`    ✓ Generated: ${uniqueNewTCs.length} unique test cases`);

      // MODULE 3: Generate CI/CD workflow
      const workflow = await generateCICDWorkflow(lang, GITHUB_REPO, [file.name]);

      // Build result
      const result = {
        file:          file.name,
        language:      lang,
        version,
        hasRequirement: hasReq,
        hadBDD:        !!relBDD,
        hadTDD:        !!relTDD,
        commitRef,
        branch,
        validation,
        testCases:     uniqueNewTCs,
        allTestCases:  store.testCases[reqHash],
        bddScenarios:  generated.bdd_scenarios || "",
        tddScript:     generated.tdd_script || "",
        workflow,
        coverageSummary:  generated.coverage_summary || "",
        missingCoverage:  generated.missing_coverage || [],
        requirementHash:  reqHash,
      };

      results.push(result);

      // Push to GitHub
      const safeName = file.name.replace(/[\/\\]/g, "_");
      const ts = new Date().toISOString().split("T")[0];
      const mdContent = buildMarkdownReport(result, requirement);
      const push1 = await pushToGitHub(`generated-tests/${ts}_${safeName}_report.md`, mdContent, `AI TestGen: ${file.name} v${version}`);
      if (generated.bdd_scenarios) {
        const push2 = await pushToGitHub(`generated-tests/${ts}_${safeName}.feature`, generated.bdd_scenarios, `BDD: ${file.name}`);
        githubPushes.push(push2);
      }
      githubPushes.push(push1);
    }

    // Summary
    const summary = {
      runId,
      totalFiles:   results.length,
      aligned:      results.filter(r => r.validation?.status === "ALIGNED").length,
      partial:      results.filter(r => r.validation?.status === "PARTIAL").length,
      notAligned:   results.filter(r => r.validation?.status === "NOT_ALIGNED").length,
      noReq:        results.filter(r => !r.hasRequirement).length,
      totalTestCases: results.reduce((a, r) => a + r.testCases.length, 0),
      languages:    [...new Set(results.map(r => r.language))],
      branch,
      duration:     Date.now() - startTs,
      githubPushed: githubPushes.filter(p => p?.success).length,
    };

    // Store run
    store.runs.unshift({
      ...summary,
      timestamp: new Date().toISOString(),
      results,
      requirement: hasReq ? requirement.slice(0, 200) + "..." : null,
    });

    console.log(`\n✅ ${runId} complete in ${summary.duration}ms`);
    console.log(`   Aligned: ${summary.aligned} | Partial: ${summary.partial} | Not: ${summary.notAligned}`);
    console.log(`   Test cases: ${summary.totalTestCases} | GitHub: ${summary.githubPushed} files pushed`);

    res.json({ success: true, runId, summary, results });

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: err.message, runId });
  }
});

// ── GET ALL RUNS ──────────────────────────────────────────────────────────────
app.get("/api/runs", (req, res) => {
  res.json({ runs: store.runs.slice(0, 50) });
});

// ── GET SINGLE RUN ────────────────────────────────────────────────────────────
app.get("/api/runs/:runId", (req, res) => {
  const run = store.runs.find(r => r.runId === req.params.runId);
  if (!run) return res.status(404).json({ error: "Run not found" });
  res.json(run);
});

// ── GET TEST CASES FOR REQUIREMENT ────────────────────────────────────────────
app.get("/api/testcases/:reqHash", (req, res) => {
  const tcs = store.testCases[req.params.reqHash] || [];
  res.json({ testCases: tcs, total: tcs.length });
});

// ── GET VERSIONS ──────────────────────────────────────────────────────────────
app.get("/api/versions", (req, res) => {
  res.json({ versions: store.versions });
});

// ── GITHUB ACTIONS STATUS ─────────────────────────────────────────────────────
app.get("/api/github/runs", async (req, res) => {
  if (!PAT_TOKEN) return res.json({ runs: [] });
  try {
    const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/actions/runs?per_page=10`, {
      headers: { "Authorization": `token ${PAT_TOKEN}`, "Accept": "application/vnd.github.v3+json" }
    });
    const data = await r.json();
    res.json({ runs: data.workflow_runs || [] });
  } catch (e) {
    res.json({ runs: [], error: e.message });
  }
});

// ── TRIGGER GITHUB ACTIONS ────────────────────────────────────────────────────
app.post("/api/github/trigger", async (req, res) => {
  if (!PAT_TOKEN) return res.status(400).json({ error: "No PAT_TOKEN" });
  const { workflow = "test.yml", branch = "main" } = req.body;
  try {
    const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${workflow}/dispatches`, {
      method: "POST",
      headers: {
        "Authorization": `token ${PAT_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: branch }),
    });
    res.json({ success: r.status === 204, status: r.status });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── MARKDOWN REPORT BUILDER ───────────────────────────────────────────────────
function buildMarkdownReport(result, requirement) {
  const v = result.validation;
  const tcs = result.testCases;
  return `# AI TestGen Report — ${result.file}

**Generated:** ${new Date().toISOString()}
**Version:** ${result.version}
**Language:** ${result.language}
**Branch:** ${result.branch}
**Mode:** ${result.hasRequirement ? "Requirement-Driven" : "Exception (No Requirement)"}

---

## Requirement Alignment

**Status:** ${v?.status || "N/A"}
**Score:** ${v?.score || 0}/100
**Summary:** ${v?.summary || "N/A"}

### Matched
${(v?.matched || []).map(m => `- ✅ ${m}`).join("\n")}

### Missing
${(v?.missing || []).map(m => `- ❌ ${m}`).join("\n")}

### Partial
${(v?.partial || []).map(m => `- ⚠ ${m}`).join("\n")}

---

## Test Cases (${tcs.length})

${tcs.map(tc => `### ${tc.id} — ${tc.title}
**Priority:** ${tc.priority} | **Type:** ${tc.type}
**Tags:** ${(tc.tags || []).join(", ")}
**Requirement:** ${tc.requirement_ref}
**Description:** ${tc.description}
**Input:** \`${JSON.stringify(tc.input)}\`
**Expected:** ${tc.expected_output}
${tc.steps ? `**Steps:**\n${tc.steps.map(s => `- ${s}`).join("\n")}` : ""}
`).join("\n---\n")}

---

## BDD Scenarios

\`\`\`gherkin
${result.bddScenarios}
\`\`\`

---

## Coverage

${result.coverageSummary}

**Missing coverage:**
${(result.missingCoverage || []).map(m => `- ${m}`).join("\n")}
`;
}

app.listen(3002, () => {
  console.log("🚀 Maantic Pipeline Server v3.0 — http://localhost:3002");
  console.log(`   API Key:   ${ANTHROPIC_KEY ? "✅ set" : "❌ MISSING"}`);
  console.log(`   PAT Token: ${PAT_TOKEN ? "✅ set" : "❌ MISSING"}`);
  console.log(`   Repo:      ${GITHUB_REPO}`);
});
