import { Router } from "express";
import { getPageById, createNewPage } from "../backend_browser/puppeteerManager.js";
import { v4 as uuidv4 } from "uuid";
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
    const url = decodeURIComponent(req.query.url);
    const page = getPageById(id);

    if (!page) {
      const newId = uuidv4();
      await createNewPage(newId, browser);
      const page = getPageById(id);
      await page.goto(url, { waitUntil: "networkidle2", timeout: 100000 });
      res.cookie("client_tab_session_id", id, {
        httpOnly: true, // The cookie only accessible by the web server
        secure: true, // Ensure the browser only sends the cookie over HTTPS
        maxAge: 1000 * 60 * 15, // Cookie expiry time in milliseconds (15 minutes)
      });

      res.json({ html, styles: stylesheets, reload: true });
    }

    let xpath = req.query.xpath;

    xpath = await findElementOrAncestor(page, xpath);
    await page.waitForSelector(`::-p-xpath(${xpath})`);
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }), // wait for navigation to complete
      page.$eval(`::-p-xpath(${xpath})`, (element) => element.click()),
      // page.click(`::-p-xpath(${xpath})`), // replace with your element's selector
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

    res.json({ html, styles: stylesheets, xpath, reload: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
