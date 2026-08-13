const db = require("../models");
const Document = db.document;

// ==================== GET ALL MY DOCUMENTS ====================
exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: { userId: req.user.id },
      order: [["updatedAt", "DESC"]],
    });

    return res.status(200).json({ documents });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== CREATE NEW DOCUMENT ====================
exports.createDocument = async (req, res) => {
  try {
    const { title, type, templateId } = req.body;

    if (!title || !type) {
      return res.status(400).json({ message: "Title aur type zaroori hain" });
    }

    const newDocument = await Document.create({
      title,
      type,          // e.g. "resume" ya "cover-letter"
      templateId: templateId || null,
      userId: req.user.id,
    });

    return res.status(201).json({
      message: "Document successfully ban gaya",
      document: newDocument,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== GET ONE DOCUMENT (with sections/items) ====================
exports.getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findOne({
      where: { id, userId: req.user.id },
      include: [
        {
          model: db.section,
          as: "sections",       // association banate waqt yehi alias use karna hoga
          include: [{ model: db.item, as: "items" }],
        },
      ],
    });

    if (!document) {
      return res.status(404).json({ message: "Document nahi mila" });
    }

    return res.status(200).json({ document });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== UPDATE DOCUMENT ====================
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, templateId } = req.body;

    const document = await Document.findOne({
      where: { id, userId: req.user.id },
    });

    if (!document) {
      return res.status(404).json({ message: "Document nahi mila" });
    }

    if (title) document.title = title;
    if (type) document.type = type;
    if (templateId) document.templateId = templateId;

    await document.save();

    return res.status(200).json({
      message: "Document update ho gaya",
      document,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== DUPLICATE DOCUMENT ====================
exports.duplicateDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const original = await Document.findOne({
      where: { id, userId: req.user.id },
    });

    if (!original) {
      return res.status(404).json({ message: "Document nahi mila" });
    }

    const copy = await Document.create({
      title: `${original.title} (Copy)`,
      type: original.type,
      templateId: original.templateId,
      userId: req.user.id,
    });

    return res.status(201).json({
      message: "Document copy ho gaya",
      document: copy,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== DELETE DOCUMENT ====================
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findOne({
      where: { id, userId: req.user.id },
    });

    if (!document) {
      return res.status(404).json({ message: "Document nahi mila" });
    }

    await document.destroy();

    return res.status(200).json({ message: "Document delete ho gaya" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};