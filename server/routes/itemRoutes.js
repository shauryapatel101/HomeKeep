const express = require("express");

const {
    createItem,
    getItems,
    getItemById,
    updateItem,
    deleteItem,
    completeItem,
    getItemHistory
} = require("../controllers/itemController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", createItem);
router.get("/", getItems);
router.get("/:id/history", getItemHistory);
router.get("/:id", getItemById);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);
router.patch("/:id/complete", completeItem);

module.exports = router;