const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "coverage", "coverage-summary.json");

if (!fs.existsSync(file)) {
  console.error("ERROR: coverage-summary.json not found. Run Jest with coverage first.");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(file, "utf8"));
const files = data.files || data;

let html = `
<html>
<head>
  <title>High Coverage Report (90%+)</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    .green { color: green; font-weight: bold; }
  </style>
</head>
<body>
<h1>Files With Coverage ≥ 90%</h1>
<table>
  <tr>
    <th>File</th>
    <th>Lines %</th>
    <th>Stmts %</th>
    <th>Funcs %</th>
    <th>Branches %</th>
  </tr>
`;

for (const file in files) {
  const f = files[file];
  const meetsThreshold =
    f.lines.pct >= 90 &&
    f.statements.pct >= 90 &&
    f.functions.pct >= 90 &&
    f.branches.pct >= 90;

  if (meetsThreshold) {
    html += `
    <tr>
      <td>${file}</td>
      <td class="green">${f.lines.pct}%</td>
      <td class="green">${f.statements.pct}%</td>
      <td class="green">${f.functions.pct}%</td>
      <td class="green">${f.branches.pct}%</td>
    </tr>
    `;
  }
}

html += `
</table>
</body>
</html>
`;

fs.writeFileSync("high-coverage.html", html);
console.log("✔ high-coverage.html generated successfully!");
