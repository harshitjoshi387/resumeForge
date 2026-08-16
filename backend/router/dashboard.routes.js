const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controller/dashboard.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/", verifyToken, getDashboardStats);

module.exports = router;
