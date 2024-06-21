import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 5000;

let browser;

(async () => {
  // Launch the Puppeteer browser and keep it running
  browser = await puppeteer.launch({ headless: true });

  app.get("/fetch-page", async (req, res) => {
    try {
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
    }
  });

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
})();

// Gracefully handle process termination
process.on("SIGINT", async () => {
  console.log("Closing Puppeteer browser...");
  if (browser) await browser.close();
  process.exit();
});

process.on("SIGTERM", async () => {
  console.log("Closing Puppeteer browser...");
  if (browser) await browser.close();
  process.exit();
});
