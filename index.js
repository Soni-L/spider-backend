import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";
import pageActions from "./routes/pageActions.js"
import userActions from "./routes/userActions.js"

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 5000;

let browser;

(async () => {
  // Launch the Puppeteer browser and keep it running
  browser = await puppeteer.launch({ headless: true });

  // Use routes
  app.use("/fetch-page", pageActions);
  app.use("/user-actions", userActions);

  // Root route
  app.get("/", (req, res) => {
    res.send("Welcome to the API");
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
