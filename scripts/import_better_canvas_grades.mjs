import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright-core";

const chromeExecutable = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const userDataDir = "/Users/davischaney/Library/Application Support/Google/Chrome";
const appBaseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
const canvasUrl = process.env.CANVAS_DASHBOARD_URL ?? "https://tvs.instructure.com/";
const debugDir = path.join(process.cwd(), ".debug");

async function main() {
  const browser = await chromium.launchPersistentContext(userDataDir, {
    executablePath: chromeExecutable,
    headless: false,
    args: ["--profile-directory=Profile 1"],
    viewport: { width: 1440, height: 960 },
  });

  try {
    const page = browser.pages()[0] ?? (await browser.newPage());
    await page.goto(canvasUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(8000);

    const info = {
      url: page.url(),
      title: await page.title(),
    };

    const gradeData = await page.evaluate(() => {
      return [...document.querySelectorAll('.bettercanvas-card-grade')].map((el) => ({
        grade: (el.textContent || '').trim(),
        href: el.href,
        courseId: el.href.match(/courses\/(\d+)/)?.[1] || null,
      }));
    });

    if (!gradeData.length) {
      await fs.mkdir(debugDir, { recursive: true });
      await fs.writeFile(path.join(debugDir, "canvas-import-debug.html"), await page.content(), "utf8");
      await page.screenshot({ path: path.join(debugDir, "canvas-import-debug.png"), fullPage: true });
      throw new Error(`No .bettercanvas-card-grade elements found. URL=${info.url} TITLE=${info.title}. Debug artifacts saved in ${debugDir}`);
    }

    const payload = gradeData.map((row) => ({
      courseId: row.courseId,
      grade: row.grade,
    }));

    const response = await fetch(`${appBaseUrl}/api/canvas/import-grades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Import failed");
    }

    console.log(JSON.stringify({ ok: true, imported: data.imported, url: info.url, title: info.title, payload }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
