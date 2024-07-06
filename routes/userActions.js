import { Router } from "express";
import { getPageById } from "../puppeteerManager.js";
const router = Router();

async function findElementOrAncestor(page, xpath) {
  try {
    let found = false;
    while (!found) {
      const element = await page.$(`::-p-xpath(${xpath})`);
      if (element) {
        found = true;
        break;
      }

      // Remove the last part of the XPath to go up one level
      const lastSlashIndex = xpath.lastIndexOf("/");
      if (lastSlashIndex === -1) break; // No more ancestors to check
      xpath = xpath.substring(0, lastSlashIndex);
    }

    if (found) {
      return xpath;
    } else {
      return "";
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

router.get("/", async (req, res) => {
  try {
    const id = req.cookies.client_tab_session_id;
    // const url = decodeURIComponent(req.query.url);
    const page = getPageById(id);
    let xpath = req.query.xpath;

    xpath = await findElementOrAncestor(page, xpath);
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }), // wait for navigation to complete
      page.click(`::-p-xpath(${xpath})`), // replace with your element's selector
    ]);

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

    res.json({ html, styles: stylesheets, xpath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
