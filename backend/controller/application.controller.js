const db = require("../models");
const Application = db.application;
const Document = db.document;

// ==================== GET ALL APPLICATIONS ====================
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Document,
          attributes: ["id", "title", "type"],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    return res.status(200).json({ applications });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== CREATE APPLICATION ====================
exports.createApplication = async (req, res) => {
  try {
    const { company, role, status, documentId } = req.body;

    if (!company || !role) {
      return res.status(400).json({ message: "Company aur role zaroori hain" });
    }

    if (documentId) {
      const doc = await Document.findOne({ where: { id: documentId, userId: req.user.id } });
      if (!doc) {
        return res.status(404).json({ message: "Linked document nahi mila" });
      }
    }

    const application = await Application.create({
      company,
      role,
      status: status || "Applied",
      documentId: documentId || null,
      userId: req.user.id,
    });

    return res.status(201).json({
      message: "Application successfully add ho gaya",
      application,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== GET APPLICATION BY ID ====================
exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findOne({
      where: { id, userId: req.user.id },
      include: [{ model: Document, attributes: ["id", "title", "type"] }],
    });

    if (!application) {
      return res.status(404).json({ message: "Application nahi mila" });
    }

    return res.status(200).json({ application });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== UPDATE APPLICATION ====================
exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { company, role, status, documentId } = req.body;

    const application = await Application.findOne({
      where: { id, userId: req.user.id },
    });

    if (!application) {
      return res.status(404).json({ message: "Application nahi mila" });
    }

    if (company !== undefined) application.company = company;
    if (role !== undefined) application.role = role;
    if (status !== undefined) application.status = status;

    if (documentId !== undefined) {
      if (documentId) {
        const doc = await Document.findOne({ where: { id: documentId, userId: req.user.id } });
        if (!doc) {
          return res.status(404).json({ message: "Linked document nahi mila" });
        }
      }
      application.documentId = documentId || null;
    }

    await application.save();

    return res.status(200).json({
      message: "Application update ho gaya",
      application,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== DELETE APPLICATION ====================
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findOne({
      where: { id, userId: req.user.id },
    });

    if (!application) {
      return res.status(404).json({ message: "Application nahi mila" });
    }

    await application.destroy();

    return res.status(200).json({ message: "Application delete ho gaya" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
