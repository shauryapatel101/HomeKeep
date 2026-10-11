const express = require("express");

const {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead
} = require("../controllers/notificationController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/", getNotifications);

router.patch("/:id/read", markNotificationRead);

router.patch("/read-all", markAllNotificationsRead);

module.exports = router;