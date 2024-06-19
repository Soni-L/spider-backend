import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";

const app = express();
app.use(cors());
app.use(express.json());
const port = 5000;

app.get("/fetch-page", async (req, res) => {
  const url = decodeURIComponent(req.query.url); // URL of the page to retrieve

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const html = await page.content();
    const cssHandles = await page.$$('link[rel="stylesheet"]');
    let css = []
    css = await Promise.allSettled(
      cssHandles.map(async (handle) => {
        const href = await page.evaluate((el) => el.href, handle);
        const response = await page.goto(href);
        return response.text();
      })
    );

    await browser.close();

    res.json({ html, css });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
