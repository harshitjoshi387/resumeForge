const express = require("express");
const router = express.Router();
const { getPublicDocument } = require("../controller/share.controller");

// Public route to view a shared document by slug
router.get("/:slug", getPublicDocument);

module.exports = router;
