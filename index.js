import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { getBrowser } from "./puppeteerManager.js";
import pageActions from "./routes/pageActions.js";
import userActions from "./routes/userActions.js";

const PORT = 5000;
const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", // Your React app's origin
    credentials: true, // Allow credentials (cookies) to be included
  })
);
app.use(express.json());

// Use routes
app.use("/fetch-page", pageActions);
app.use("/user-actions", userActions);

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

(async () => {
  try {
    await getBrowser();
    console.log("Puppeteer browser launched");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    // Handle server shutdown
    const gracefulShutdown = async () => {
      await closeBrowser();
      console.log("Puppeteer browser closed");
      process.exit(0);
    };

    // Listen for termination signals
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
})();
