import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { getBrowser } from "./backend_browser/puppeteerManager.js";
import pageActions from "./routes/pageActions.js";
import userActions from "./routes/userActions.js";
import { Server } from "socket.io";

const PORT = 5000;
const SOCKET_PORT = 3000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: "*",
    allowedHeaders: "*",
  },
});

server.listen(SOCKET_PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("message", (msg) => {
    console.log("message: " + msg);
    io.emit("message", msg); // Broadcast the message to all clients
  });
});

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Your React app's origin
    credentials: true, // Allow credentials (cookies) to be included
    methods: "*",
    allowedHeaders: "*",
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
