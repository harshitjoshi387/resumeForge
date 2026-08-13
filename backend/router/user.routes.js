
const express = require("express");
const router = express.Router();
const { getMe, updateMe, deleteMe } = require("../controller/user.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateMe);
router.delete("/me", verifyToken, deleteMe);

module.exports = router;