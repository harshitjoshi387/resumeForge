const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  createSection,
  updateSection,
  deleteSection,
  createItem,
  updateItem,
  deleteItem,
} = require("../controller/section.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.post("/", verifyToken, createSection);
router.patch("/:sectionId", verifyToken, updateSection);
router.delete("/:sectionId", verifyToken, deleteSection);

router.post("/:sectionId/items", verifyToken, createItem);
router.patch("/:sectionId/items/:itemId", verifyToken, updateItem);
router.delete("/:sectionId/items/:itemId", verifyToken, deleteItem);

module.exports = router;
