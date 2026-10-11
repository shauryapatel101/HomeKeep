const db = require("../config/db");

const getCategories = async (req, res) => {
    try {
        const [categories] = await db.query(
            `SELECT id, name, icon
             FROM categories
             ORDER BY name ASC`
        );

        res.json({
            categories
        });

    } catch (error) {
        console.error("Get categories error:", error);

        res.status(500).json({
            message: "Server error while fetching categories"
        });
    }
};

module.exports = {
    getCategories
};