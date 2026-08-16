const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  getVersions,
  createVersion,
  restoreVersion,
} = require("../controller/version.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/", verifyToken, getVersions);
router.post("/", verifyToken, createVersion);
router.post("/:versionId/restore", verifyToken, restoreVersion);

module.exports = router;
