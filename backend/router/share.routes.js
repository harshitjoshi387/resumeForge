const express = require("express");
const router = express.Router();
const { getPublicDocument, getAllShares } = require("../controller/share.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/", verifyToken, getAllShares);
router.get("/:slug", getPublicDocument);

module.exports = router;
