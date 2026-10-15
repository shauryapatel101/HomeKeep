const db = require("../config/db");

const getReminders = async (req, res) => {
    try {
        const userId = req.user.id;
        const itemId = req.params.itemId;

        const [reminders] = await db.query(
            `SELECT
                r.id,
                r.item_id,
                r.days_before
             FROM reminders r
             INNER JOIN items i
                ON r.item_id = i.id
             INNER JOIN household_members hm
                ON i.household_id = hm.household_id
             WHERE r.item_id = ?
             AND hm.user_id = ?
             ORDER BY r.days_before DESC`,
            [itemId, userId]
        );

        res.json({
            reminders
        });

    } catch (error) {
        console.error("Get reminders error:", error);

        res.status(500).json({
            message: "Server error while fetching reminders"
        });
    }
};


const setReminders = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const userId = req.user.id;
        const itemId = req.params.itemId;
        const { days_before } = req.body;

        if (!Array.isArray(days_before)) {
            return res.status(400).json({
                message: "days_before must be an array"
            });
        }

        // Validate values
        const reminderDays = [
            ...new Set(
                days_before
                    .map(Number)
                    .filter(
                        (days) =>
                            Number.isInteger(days) &&
                            days > 0
                    )
            )
        ];

        // Check item access
        const [items] = await connection.query(
            `SELECT i.id
             FROM items i
             INNER JOIN household_members hm
                ON i.household_id = hm.household_id
             WHERE i.id = ?
             AND hm.user_id = ?`,
            [itemId, userId]
        );

        if (items.length === 0) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        await connection.beginTransaction();

        // Replace existing reminders
        await connection.query(
            `DELETE FROM reminders
             WHERE item_id = ?`,
            [itemId]
        );

        for (const days of reminderDays) {
            await connection.query(
                `INSERT INTO reminders (
                    item_id,
                    days_before
                )
                VALUES (?, ?)`,
                [itemId, days]
            );
        }

        await connection.commit();

        res.json({
            message: "Reminders updated successfully",
            days_before: reminderDays
        });

    } catch (error) {
        await connection.rollback();

        console.error("Set reminders error:", error);

        res.status(500).json({
            message: "Server error while updating reminders"
        });

    } finally {
        connection.release();
    }
};


module.exports = {
    getReminders,
    setReminders
};