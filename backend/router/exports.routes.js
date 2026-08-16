const express = require("express");
const router = express.Router();
const { getAllUserExports } = require("../controller/export.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/", verifyToken, getAllUserExports);

module.exports = router;
