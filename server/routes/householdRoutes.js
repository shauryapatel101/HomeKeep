const express = require("express");

const {
    createHousehold,
    getMyHouseholds,
    addMember,
    getMembers
} = require("../controllers/householdController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", createHousehold);
router.get("/", getMyHouseholds);
router.post("/:id/members", addMember);
router.get("/:id/members", getMembers);

module.exports = router;