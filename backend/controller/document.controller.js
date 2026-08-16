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
      return res.status(400).json({ message: "Title and type are required" });
    }

    const newDocument = await Document.create({
      title,
      type,          // e.g. "resume" or "cover-letter"
      templateId: templateId || null,
      userId: req.user.id,
    });

    return res.status(201).json({
      message: "Document created successfully",
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
          as: "sections",
          include: [{ model: db.item, as: "items" }],
        },
      ],
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
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
      return res.status(404).json({ message: "Document not found" });
    }

    if (title) document.title = title;
    if (type) document.type = type;
    if (templateId) document.templateId = templateId;

    await document.save();

    return res.status(200).json({
      message: "Document updated successfully",
      document,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== DUPLICATE DOCUMENT ====================
exports.duplicateDocument = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;

    const original = await Document.findOne({
      where: { id, userId: req.user.id },
      include: [
        {
          model: db.section,
          as: "sections",
          include: [{ model: db.item, as: "items" }],
        },
      ],
      transaction,
    });

    if (!original) {
      await transaction.rollback();
      return res.status(404).json({ message: "Document not found" });
    }

    const copy = await Document.create(
      {
        title: `${original.title} (Copy)`,
        type: original.type,
        templateId: original.templateId,
        userId: req.user.id,
      },
      { transaction }
    );

    if (original.sections && original.sections.length > 0) {
      for (const sec of original.sections) {
        const newSec = await db.section.create(
          {
            heading: sec.heading,
            position: sec.position,
            documentId: copy.id,
          },
          { transaction }
        );

        if (sec.items && sec.items.length > 0) {
          for (const item of sec.items) {
            await db.item.create(
              {
                content: item.content,
                position: item.position,
                sectionId: newSec.id,
              },
              { transaction }
            );
          }
        }
      }
    }

    await transaction.commit();

    const duplicatedWithDetails = await Document.findOne({
      where: { id: copy.id, userId: req.user.id },
      include: [
        {
          model: db.section,
          as: "sections",
          include: [{ model: db.item, as: "items" }],
        },
      ],
    });

    return res.status(201).json({
      message: "Document duplicated successfully",
      document: duplicatedWithDetails,
    });
  } catch (error) {
    await transaction.rollback();
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
      return res.status(404).json({ message: "Document not found" });
    }

    await document.destroy();

    return res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};