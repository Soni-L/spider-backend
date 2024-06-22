import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { createNewPage, getBrowser, getPageById } from "../puppeteerManager.js";
const router = Router();

router.post("/", async (req, res) => {
  try {
    const id = uuidv4();
    const page = getPageById(id);

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
