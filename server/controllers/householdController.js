const db = require("../config/db");

const createHousehold = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Household name is required"
            });
        }

        // Create household
        const [result] = await db.query(
            `INSERT INTO households (name, created_by)
             VALUES (?, ?)`,
            [name.trim(), userId]
        );

        const householdId = result.insertId;

        // Automatically make creator a member
        await db.query(
            `INSERT INTO household_members (household_id, user_id)
             VALUES (?, ?)`,
            [householdId, userId]
        );

        res.status(201).json({
            message: "Household created successfully",
            householdId
        });

    } catch (error) {
        console.error("Create household error:", error);

        res.status(500).json({
            message: "Server error while creating household"
        });
    }
};


const getMyHouseholds = async (req, res) => {
    try {
        const userId = req.user.id;

        const [households] = await db.query(
            `SELECT h.id, h.name, h.created_by, h.created_at
             FROM households h
             INNER JOIN household_members hm
                ON h.id = hm.household_id
             WHERE hm.user_id = ?
             ORDER BY h.created_at DESC`,
            [userId]
        );

        res.json({
            households
        });

    } catch (error) {
        console.error("Get households error:", error);

        res.status(500).json({
            message: "Server error while fetching households"
        });
    }
};


const addMember = async (req, res) => {
    try {
        const householdId = req.params.id;
        const { email } = req.body;
        const userId = req.user.id;

        if (!email) {
            return res.status(400).json({
                message: "Member email is required"
            });
        }

        // Check whether current user belongs to household
        const [membership] = await db.query(
            `SELECT id
             FROM household_members
             WHERE household_id = ?
             AND user_id = ?`,
            [householdId, userId]
        );

        if (membership.length === 0) {
            return res.status(403).json({
                message: "You are not a member of this household"
            });
        }

        // Find user to add
        const [users] = await db.query(
            `SELECT id, name, email
             FROM users
             WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User with this email does not exist"
            });
        }

        const newUser = users[0];

        // Check whether already a member
        const [existingMember] = await db.query(
            `SELECT id
             FROM household_members
             WHERE household_id = ?
             AND user_id = ?`,
            [householdId, newUser.id]
        );

        if (existingMember.length > 0) {
            return res.status(409).json({
                message: "User is already a member of this household"
            });
        }

        await db.query(
            `INSERT INTO household_members (household_id, user_id)
             VALUES (?, ?)`,
            [householdId, newUser.id]
        );

        res.status(201).json({
            message: "Member added successfully",
            member: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error("Add member error:", error);

        res.status(500).json({
            message: "Server error while adding member"
        });
    }
};


const getMembers = async (req, res) => {
    try {
        const householdId = req.params.id;
        const userId = req.user.id;

        // Make sure requester belongs to household
        const [membership] = await db.query(
            `SELECT id
             FROM household_members
             WHERE household_id = ?
             AND user_id = ?`,
            [householdId, userId]
        );

        if (membership.length === 0) {
            return res.status(403).json({
                message: "You are not a member of this household"
            });
        }

        const [members] = await db.query(
            `SELECT u.id, u.name, u.email, hm.joined_at
             FROM household_members hm
             INNER JOIN users u
                ON hm.user_id = u.id
             WHERE hm.household_id = ?
             ORDER BY hm.joined_at ASC`,
            [householdId]
        );

        res.json({
            members
        });

    } catch (error) {
        console.error("Get members error:", error);

        res.status(500).json({
            message: "Server error while fetching members"
        });
    }
};


module.exports = {
    createHousehold,
    getMyHouseholds,
    addMember,
    getMembers
};