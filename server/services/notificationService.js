const db = require("../config/db");

const generateNotifications = async () => {
    try {
        const [items] = await db.query(
            `SELECT
                i.id,
                i.name,
                i.next_due_date,
                r.days_before,
                hm.user_id
             FROM items i

             INNER JOIN reminders r
                ON i.id = r.item_id

             INNER JOIN household_members hm
                ON i.household_id = hm.household_id

             WHERE i.next_due_date IS NOT NULL`
        );

        for (const item of items) {
            const [difference] = await db.query(
                `SELECT DATEDIFF(?, CURDATE()) AS days_remaining`,
                [item.next_due_date]
            );

            const daysRemaining =
                difference[0].days_remaining;

            if (daysRemaining !== item.days_before) {
                continue;
            }

            // Prevent duplicate notification
            const [existing] = await db.query(
                `SELECT id
                 FROM notifications
                 WHERE user_id = ?
                 AND item_id = ?
                 AND reminder_days = ?
                 AND DATE(created_at) = CURDATE()
                 LIMIT 1`,
                [
                    item.user_id,
                    item.id,
                    item.days_before
                ]
            );

            if (existing.length > 0) {
                continue;
            }

            let message;

            if (daysRemaining === 0) {
                message = `${item.name} is due today.`;
            } else if (daysRemaining === 1) {
                message = `${item.name} is due tomorrow.`;
            } else {
                message =
                    `${item.name} is due in ${daysRemaining} days.`;
            }

            await db.query(
                `INSERT INTO notifications (
                    user_id,
                    item_id,
                    message,
                    reminder_days
                )
                VALUES (?, ?, ?, ?)`,
                [
                    item.user_id,
                    item.id,
                    message,
                    item.days_before
                ]
            );
        }

    } catch (error) {
        console.error(
            "Notification generation error:",
            error
        );
    }
};

module.exports = {
    generateNotifications
};