const express = require("express");
const router = express.Router();
const {
  getAllApplications,
  createApplication,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require("../controller/application.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/", verifyToken, getAllApplications);
router.post("/", verifyToken, createApplication);
router.get("/:id", verifyToken, getApplicationById);
router.put("/:id", verifyToken, updateApplication);
router.delete("/:id", verifyToken, deleteApplication);

module.exports = router;
