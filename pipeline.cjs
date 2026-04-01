const express = require("express");
const cors = require("cors");
const multer = require("multer");
const AdmZip = require("adm-zip");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const CODE_EXTENSIONS = [".java", ".py", ".js", ".ts", ".cs", ".go"];
const API_KEY = process.env.ANTHROPIC_API_KEY;

async function generateTests(filename, code) {
  const ext = path.extname(filename);
  const langMap = {
    ".java": "Java", ".py": "Python", ".js": "JavaScript",
    ".ts": "TypeScript", ".cs": "C#", ".go": "Go"
  };
  const lang = langMap[ext] || "JavaScript";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: `You are a senior QA engineer. Analyze this ${lang} code and generate:

=== BDD SCENARIOS (GHERKIN) ===
[Write 3-5 Gherkin scenarios with @smoke @regression @edge tags]

=== TDD TEST SCRIPT ===
[Write a complete runnable ${lang} test file with all imports, setup, and assertions]

=== GITHUB ACTIONS WORKFLOW ===
[Write a .github/workflows/test.yml CI/CD workflow for this code]

File: ${filename}
Code:
${code}`
      }]
    }),
  });

  const data = await response.json();
  return data?.content?.[0]?.text ?? "Error generating tests";
}

app.post("/api/analyze", upload.single("zipfile"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const zip = new AdmZip(req.file.buffer);
    const entries = zip.getEntries();
    const results = [];

    for (const entry of entries) {
      const ext = path.extname(entry.entryName);
      if (!entry.isDirectory && CODE_EXTENSIONS.includes(ext)) {
        const code = entry.getData().toString("utf8");
        if (code.trim().length < 50) continue;
        console.log(`Analyzing: ${entry.entryName}`);
        const tests = await generateTests(entry.entryName, code.slice(0, 3000));
        results.push({
          file: entry.entryName,
          language: ext,
          tests: tests
        });
      }
    }

    if (results.length === 0) {
      return res.status(400).json({ error: "No code files found in ZIP" });
    }

    res.json({ success: true, files: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3002, () => console.log("Pipeline server running on http://localhost:3002"));