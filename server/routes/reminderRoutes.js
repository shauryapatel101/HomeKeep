const express = require("express");

const {
    getReminders,
    setReminders
} = require("../controllers/reminderController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/:itemId", getReminders);

router.put("/:itemId", setReminders);

module.exports = router;