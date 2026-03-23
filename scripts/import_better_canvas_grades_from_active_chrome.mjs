import { execFileSync } from "node:child_process";
import process from "node:process";

const appBaseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
const scriptPath = new URL("./read_better_canvas_grades.applescript", import.meta.url);

function readGradesFromChrome() {
  const output = execFileSync("osascript", [scriptPath.pathname], { encoding: "utf8" }).trim();
  if (!output) {
    throw new Error("No Better Canvas grades found in the active Chrome tab.");
  }

  const rows = output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [courseId, grade] = line.split("|");
      return {
        courseId: courseId || null,
        grade: grade || null,
      };
    });

  if (!rows.length) {
    throw new Error("No Better Canvas grade rows could be parsed.");
  }

  return rows;
}

async function main() {
  const payload = readGradesFromChrome();
  const response = await fetch(`${appBaseUrl}/api/canvas/import-grades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Import failed");
  }
  console.log(JSON.stringify({ ok: true, imported: data.imported, payload }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
