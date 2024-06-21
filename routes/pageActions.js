import { Router } from "express";
import puppeteer from "puppeteer";
const router = Router();

router.get("/", async (req, res) => {
  try {
    let browser = await puppeteer.launch({ headless: true });
    const url = decodeURIComponent(req.query.url); // URL of the page to retrieve
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const html = await page.content();

    const stylesheets = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      return sheets
        .map((sheet) => {
          try {
            return Array.from(sheet.cssRules)
              .map((rule) => rule.cssText)
              .join("\n");
          } catch (e) {
            // In case of cross-origin issues
            return "";
          }
        })
        .join("\n");
    });

    res.json({ html, styles: stylesheets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    browser.close();
  }
});

export default router;
