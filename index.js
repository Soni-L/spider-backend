import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";

const app = express();
app.use(cors());
app.use(express.json());
const port = 5000;

app.get("/", async (req, res) => {
  console.log(req.query.url);
  res.json({ hello: "hello world" });
  //   const browser = await puppeteer.launch();
  //   const page = await browser.newPage();
  //   await page.goto("https://example.org/", { waitUntil: "networkidle0" });
  //   const data = await page.evaluate(() => document.querySelector("*").outerHTML);

  //   await browser.close();
  //   res.json(data);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
