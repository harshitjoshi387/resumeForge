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
const { verifyToken } = require("../middleware/auth.middleware");

// Saare document routes login zaroori hai, isliye verifyToken har jagah lagaya
router.get("/", verifyToken, getAllDocuments);
router.post("/", verifyToken, createDocument);
router.get("/:id", verifyToken, getDocumentById);
router.put("/:id", verifyToken, updateDocument);
router.post("/:id/duplicate", verifyToken, duplicateDocument);
router.delete("/:id", verifyToken, deleteDocument);

module.exports = router;