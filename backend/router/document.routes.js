const express = require("express");
const router = express.Router();
const {
  getAllDocuments,
  createDocument,
  getDocumentById,
  updateDocument,
  duplicateDocument,
  deleteDocument,
} = require("../controller/document.controller");
const { createOrGetShare, deleteShare } = require("../controller/share.controller");
const sectionRouter = require("./section.routes");
const versionRouter = require("./version.routes");
const exportRouter = require("./export.routes");
const { verifyToken } = require("../middleware/auth.middleware");

// Saare document routes login zaroori hai, isliye verifyToken har jagah lagaya
router.get("/", verifyToken, getAllDocuments);
router.post("/", verifyToken, createDocument);
router.get("/:id", verifyToken, getDocumentById);
router.put("/:id", verifyToken, updateDocument);
router.post("/:id/duplicate", verifyToken, duplicateDocument);
router.delete("/:id", verifyToken, deleteDocument);

// Document share routes
router.post("/:id/share", verifyToken, createOrGetShare);
router.delete("/:id/share", verifyToken, deleteShare);

// Nested sub-routers for sections, versions, and exports
router.use("/:id/sections", sectionRouter);
router.use("/:id/versions", versionRouter);
router.use("/:id/export", exportRouter);

module.exports = router;