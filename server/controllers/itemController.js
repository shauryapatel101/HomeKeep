const db = require("../config/db");

const createItem = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            household_id,
            category_id,
            name,
            description,
            purchase_date,
            next_due_date,
            is_recurring,
            recurrence_interval,
            recurrence_unit
        } = req.body;

        if (!household_id || !category_id || !name || !next_due_date) {
            return res.status(400).json({
                message: "Household, category, name and due date are required"
            });
        }

        // Check household membership
        const [membership] = await db.query(
            `SELECT id
             FROM household_members
             WHERE household_id = ?
             AND user_id = ?`,
            [household_id, userId]
        );

        if (membership.length === 0) {
            return res.status(403).json({
                message: "You are not a member of this household"
            });
        }

        // Validate recurring fields
        if (is_recurring) {
            if (!recurrence_interval || !recurrence_unit) {
                return res.status(400).json({
                    message: "Recurrence interval and unit are required for recurring items"
                });
            }
        }

        const [result] = await db.query(
            `INSERT INTO items (
                household_id,
                created_by,
                category_id,
                name,
                description,
                purchase_date,
                next_due_date,
                is_recurring,
                recurrence_interval,
                recurrence_unit
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                household_id,
                userId,
                category_id,
                name,
                description || null,
                purchase_date || null,
                next_due_date,
                is_recurring ? 1 : 0,
                is_recurring ? recurrence_interval : null,
                is_recurring ? recurrence_unit : null
            ]
        );

        const itemId = result.insertId;

        // Every item starts with a pending history record
        await db.query(
            `INSERT INTO item_history (
                item_id,
                due_date,
                status
            )
            VALUES (?, ?, 'PENDING')`,
            [itemId, next_due_date]
        );

        res.status(201).json({
            message: "Item created successfully",
            itemId
        });

    } catch (error) {
        console.error("Create item error:", error);

        res.status(500).json({
            message: "Server error while creating item"
        });
    }
};


const getItems = async (req, res) => {
    try {
        const userId = req.user.id;
        const { household_id } = req.query;

        if (!household_id) {
            return res.status(400).json({
                message: "Household ID is required"
            });
        }

        // Check membership
        const [membership] = await db.query(
            `SELECT id
             FROM household_members
             WHERE household_id = ?
             AND user_id = ?`,
            [household_id, userId]
        );

        if (membership.length === 0) {
            return res.status(403).json({
                message: "You are not a member of this household"
            });
        }

        const [items] = await db.query(
            `SELECT
                i.id,
                i.name,
                i.description,
                i.purchase_date,
                i.next_due_date,
                i.is_recurring,
                i.recurrence_interval,
                i.recurrence_unit,
                i.created_at,
                i.updated_at,

                c.id AS category_id,
                c.name AS category_name,
                c.icon AS category_icon,

                u.id AS created_by,
                u.name AS created_by_name

             FROM items i

             INNER JOIN categories c
                ON i.category_id = c.id

             INNER JOIN users u
                ON i.created_by = u.id

             WHERE i.household_id = ?

             ORDER BY i.next_due_date ASC`,
            [household_id]
        );

        res.json({
            items
        });

    } catch (error) {
        console.error("Get items error:", error);

        res.status(500).json({
            message: "Server error while fetching items"
        });
    }
};


const getItemById = async (req, res) => {
    try {
        const userId = req.user.id;
        const itemId = req.params.id;

        const [items] = await db.query(
            `SELECT
                i.*,
                c.name AS category_name,
                c.icon AS category_icon
             FROM items i

             INNER JOIN categories c
                ON i.category_id = c.id

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

        res.json({
            item: items[0]
        });

    } catch (error) {
        console.error("Get item error:", error);

        res.status(500).json({
            message: "Server error while fetching item"
        });
    }
};


const updateItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const itemId = req.params.id;

        const {
            category_id,
            name,
            description,
            purchase_date,
            next_due_date,
            is_recurring,
            recurrence_interval,
            recurrence_unit
        } = req.body;

        // Find item and verify membership
        const [items] = await db.query(
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

        if (!category_id || !name || !next_due_date) {
            return res.status(400).json({
                message: "Category, name and due date are required"
            });
        }

        if (is_recurring && (!recurrence_interval || !recurrence_unit)) {
            return res.status(400).json({
                message: "Recurrence interval and unit are required for recurring items"
            });
        }

        await db.query(
            `UPDATE items
             SET
                category_id = ?,
                name = ?,
                description = ?,
                purchase_date = ?,
                next_due_date = ?,
                is_recurring = ?,
                recurrence_interval = ?,
                recurrence_unit = ?
             WHERE id = ?`,
            [
                category_id,
                name,
                description || null,
                purchase_date || null,
                next_due_date,
                is_recurring ? 1 : 0,
                is_recurring ? recurrence_interval : null,
                is_recurring ? recurrence_unit : null,
                itemId
            ]
        );

        await db.query(
            `UPDATE item_history
             SET due_date = ?
             WHERE item_id = ?
             AND status = 'PENDING'`,
            [next_due_date, itemId]
        );

        res.json({
            message: "Item updated successfully"
        });

    } catch (error) {
        console.error("Update item error:", error);

        res.status(500).json({
            message: "Server error while updating item"
        });
    }
};


const deleteItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const itemId = req.params.id;

        const [items] = await db.query(
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

        await db.query(
            "DELETE FROM items WHERE id = ?",
            [itemId]
        );

        res.json({
            message: "Item deleted successfully"
        });

    } catch (error) {
        console.error("Delete item error:", error);

        res.status(500).json({
            message: "Server error while deleting item"
        });
    }
};

const completeItem = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const userId = req.user.id;
        const itemId = req.params.id;

        // Find item and verify household membership
        const [items] = await connection.query(
            `SELECT
                i.id,
                i.household_id,
                i.next_due_date,
                i.is_recurring,
                i.recurrence_interval,
                i.recurrence_unit
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

        const item = items[0];

        // Find current pending history record
        const [history] = await connection.query(
            `SELECT id, due_date
             FROM item_history
             WHERE item_id = ?
             AND status = 'PENDING'
             ORDER BY due_date ASC
             LIMIT 1`,
            [itemId]
        );

        if (history.length === 0) {
            return res.status(400).json({
                message: "No pending occurrence found for this item"
            });
        }

        await connection.beginTransaction();

        // Mark current occurrence as completed
        await connection.query(
            `UPDATE item_history
             SET
                status = 'COMPLETED',
                completed_date = CURDATE(),
                completed_by = ?
             WHERE id = ?`,
            [userId, history[0].id]
        );

        // Non-recurring item is finished here
        if (!item.is_recurring) {
            await connection.commit();

            return res.json({
                message: "Item completed successfully"
            });
        }

        // Calculate next due date in MySQL
        let intervalExpression;

        switch (item.recurrence_unit) {
            case "DAY":
                intervalExpression = `INTERVAL ${Number(item.recurrence_interval)} DAY`;
                break;

            case "WEEK":
                intervalExpression = `INTERVAL ${Number(item.recurrence_interval)} WEEK`;
                break;

            case "MONTH":
                intervalExpression = `INTERVAL ${Number(item.recurrence_interval)} MONTH`;
                break;

            case "YEAR":
                intervalExpression = `INTERVAL ${Number(item.recurrence_interval)} YEAR`;
                break;

            default:
                throw new Error("Invalid recurrence unit");
        }

        // Get next due date
        const [nextDate] = await connection.query(
            `SELECT DATE_ADD(?, ${intervalExpression}) AS next_due_date`,
            [item.next_due_date]
        );

        const nextDueDate = nextDate[0].next_due_date;

        // Update item's next due date
        await connection.query(
            `UPDATE items
             SET next_due_date = ?
             WHERE id = ?`,
            [nextDueDate, itemId]
        );

        // Create next pending history record
        await connection.query(
            `INSERT INTO item_history (
                item_id,
                due_date,
                status
            )
            VALUES (?, ?, 'PENDING')`,
            [itemId, nextDueDate]
        );

        await connection.commit();

        res.json({
            message: "Item completed and next occurrence created",
            next_due_date: nextDueDate
        });

    } catch (error) {
        await connection.rollback();

        console.error("Complete item error:", error);

        res.status(500).json({
            message: "Server error while completing item"
        });

    } finally {
        connection.release();
    }
};

const getItemHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const itemId = req.params.id;

        // Make sure the user belongs to the household
        // that owns this item.
        const [access] = await db.query(
            `SELECT i.id
             FROM items i
             INNER JOIN household_members hm
                ON i.household_id = hm.household_id
             WHERE i.id = ?
             AND hm.user_id = ?`,
            [itemId, userId]
        );

        if (access.length === 0) {
            return res.status(403).json({
                message: "You do not have access to this item"
            });
        }

        const [history] = await db.query(
            `SELECT
                ih.id,
                ih.due_date,
                ih.completed_date,
                ih.status,
                ih.notes,
                ih.created_at,
                u.name AS completed_by_name
             FROM item_history ih
             LEFT JOIN users u
                ON ih.completed_by = u.id
             WHERE ih.item_id = ?
             ORDER BY ih.due_date DESC`,
            [itemId]
        );

        res.json({ history });

    } catch (error) {
        console.error("Get item history error:", error);

        res.status(500).json({
            message: "Server error while fetching item history"
        });
    }
};


module.exports = {
    createItem,
    getItems,
    getItemById,
    updateItem,
    deleteItem,
    completeItem,
    getItemHistory
};