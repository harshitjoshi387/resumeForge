const express = require("express");
const router = express.Router();
const { getAllTemplates, getTemplateById } = require("../controller/template.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/", verifyToken, getAllTemplates);
router.get("/:id", verifyToken, getTemplateById);

module.exports = router;
