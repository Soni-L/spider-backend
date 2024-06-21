import { Router } from "express";
import { createNewPage, getBrowser, getPageById } from "../puppeteerManager.js";
import { v4 as uuidv4 } from "uuid";
const router = Router();

router.post("/", async (req, res) => {
  try {
    const browser = await getBrowser();
    const url = decodeURIComponent(req.query.url); // URL of the page to retrieve
    const id = uuidv4();
    await createNewPage(id, browser);
    const page = getPageById(id)
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

    const cookieName = "client-tab-session-id";
    const options = {
      maxAge: 3600000, // Cookie expiration time in milliseconds (1 hour)
    };

    // Set the cookie
    res.cookie(cookieName, id, options);

    res.json({ html, styles: stylesheets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
