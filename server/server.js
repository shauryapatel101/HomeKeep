require("dotenv").config();
const {
    generateNotifications
} = require("./services/notificationService");
const authRoutes = require("./routes/authRoutes");
const express = require("express");
const cors = require("cors");
const householdRoutes = require("./routes/householdRoutes");
const db = require("./config/db");
const itemRoutes = require("./routes/itemRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/households", householdRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/notifications", notificationRoutes);
app.get("/", (req, res) => {
    res.json({
        message: "HomeKeep API is running"
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS result");

        res.json({
            message: "Database connected successfully",
            result: rows[0].result
        });
    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
generateNotifications();