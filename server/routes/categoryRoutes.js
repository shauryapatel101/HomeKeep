const express = require("express");

const {
    getCategories
} = require("../controllers/categoryController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/", getCategories);

module.exports = router;