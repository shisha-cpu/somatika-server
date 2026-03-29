require("dotenv").config();
const express = require("express");
const cors = require("cors");

const messageRoute = require("./routes/message");
const patchRoute = require("./routes/patch");
const fileRoute = require("./routes/file");
const { init: initPatchManager, getStats: getPatchStats } = require("./engine/patchManager");
const { getStats: getDbStats } = require("./db/db");
const { getStats: getFileStats } = require("./engine/fileManager");

const app = express();
const PORT = process.env.PORT || 3000;

// Инициализация Patch Manager (загрузка патчей из БД)
initPatchManager();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/message", messageRoute);
app.use("/api/patch", patchRoute);
app.use("/api/file", fileRoute);

// Stats endpoint
app.get("/api/stats", (req, res) => {
  res.json({
    success: true,
    data: {
      database: getDbStats(),
      patches: getPatchStats(),
      files: getFileStats()
    }
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
