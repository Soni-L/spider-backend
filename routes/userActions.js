import { Router } from "express";
import { getPageById } from "../puppeteerManager.js";
const router = Router();

router.get("/", async (req, res) => {
  try {
    const id = req.cookies.client_tab_session_id;
    const page = getPageById(id);
    const xpath = req.query.xpath;

    await page.waitForSelector(`::-p-xpath(${xpath})`);
    await page.click(`::-p-xpath(${xpath})`);

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
  }
});

export default router;
