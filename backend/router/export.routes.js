const express = require("express");
const router = express.Router({ mergeParams: true });
const { exportDocumentPDF, getExportHistory } = require("../controller/export.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/pdf", verifyToken, exportDocumentPDF);
router.get("/history", verifyToken, getExportHistory);

module.exports = router;
