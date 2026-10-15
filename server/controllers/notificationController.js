const db = require("../config/db");

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const [notifications] = await db.query(
            `SELECT
                n.id,
                n.item_id,
                n.message,
                n.is_read,
                n.reminder_days,
                n.created_at,
                i.name AS item_name
             FROM notifications n
             LEFT JOIN items i
                ON n.item_id = i.id
             WHERE n.user_id = ?
             ORDER BY n.created_at DESC`,
            [userId]
        );

        res.json({
            notifications
        });

    } catch (error) {
        console.error("Get notifications error:", error);

        res.status(500).json({
            message: "Server error while fetching notifications"
        });
    }
};


const markNotificationRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;

        const [result] = await db.query(
            `UPDATE notifications
             SET is_read = TRUE
             WHERE id = ?
             AND user_id = ?`,
            [notificationId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.json({
            message: "Notification marked as read"
        });

    } catch (error) {
        console.error("Mark notification error:", error);

        res.status(500).json({
            message: "Server error while updating notification"
        });
    }
};


const markAllNotificationsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await db.query(
            `UPDATE notifications
             SET is_read = TRUE
             WHERE user_id = ?`,
            [userId]
        );

        res.json({
            message: "All notifications marked as read"
        });

    } catch (error) {
        console.error("Mark all notifications error:", error);

        res.status(500).json({
            message: "Server error while updating notifications"
        });
    }
};


module.exports = {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead
};