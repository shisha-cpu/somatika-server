const express = require("express");
const router = express.Router();
const { processMessage } = require("../engine/leo");
const { saveMessage, getMessagesByUser } = require("../db/db");

/**
 * POST /api/message
 * Обработка сообщения пользователя
 * 
 * Body:
 * {
 *   "userId": "123",
 *   "project": "leo",
 *   "message": "текст"
 * }
 */
router.post("/", async (req, res) => {
  try {
    const { userId, project, message } = req.body;

    // Валидация
    if (!userId || !project || !message) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["userId", "project", "message"]
      });
    }

    // Обработка через Leo Engine
    const result = await processMessage(userId, project, message);

    // Сохранение в БД
    await saveMessage({
      userId,
      project,
      message,
      reply: result.reply,
      type: result.type,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Message error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/message/history?userId=123&project=leo
 * Получение истории сообщений
 */
router.get("/history", async (req, res) => {
  try {
    const { userId, project } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: "userId is required"
      });
    }

    const messages = await getMessagesByUser(userId, project);

    res.json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error("History error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
