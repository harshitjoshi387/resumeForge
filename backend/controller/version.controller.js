const db = require("../models");
const Document = db.document;
const Section = db.section;
const Item = db.item;
const Version = db.version;

// Helper to verify document ownership
const verifyDocumentOwnership = async (documentId, userId) => {
  const doc = await Document.findOne({
    where: { id: documentId, userId },
  });
  return doc;
};

// ==================== GET ALL VERSIONS ====================
exports.getVersions = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await verifyDocumentOwnership(id, req.user.id);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    const versions = await Version.findAll({
      where: { documentId: id },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ versions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== CREATE VERSION SNAPSHOT ====================
exports.createVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const { label } = req.body;

    const doc = await Document.findOne({
      where: { id, userId: req.user.id },
      include: [
        {
          model: Section,
          as: "sections",
          include: [{ model: Item, as: "items" }],
        },
      ],
    });

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    const snapshotData = {
      title: doc.title,
      type: doc.type,
      templateId: doc.templateId,
      sections: doc.sections || [],
    };

    const versionLabel = label || `Snapshot ${new Date().toLocaleString()}`;

    const newVersion = await Version.create({
      snapshot: JSON.stringify(snapshotData),
      label: versionLabel,
      documentId: id,
    });

    return res.status(201).json({
      message: "Version snapshot created successfully",
      version: newVersion,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== RESTORE VERSION ====================
exports.restoreVersion = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id, versionId } = req.params;

    const doc = await Document.findOne({
      where: { id, userId: req.user.id },
      transaction,
    });

    if (!doc) {
      await transaction.rollback();
      return res.status(404).json({ message: "Document not found" });
    }

    const versionRecord = await Version.findOne({
      where: { id: versionId, documentId: id },
      transaction,
    });

    if (!versionRecord) {
      await transaction.rollback();
      return res.status(404).json({ message: "Version record not found" });
    }

    let snapshotData;
    try {
      snapshotData = JSON.parse(versionRecord.snapshot);
    } catch (e) {
      await transaction.rollback();
      return res.status(400).json({ message: "Invalid snapshot format" });
    }

    // Update document attributes if present
    if (snapshotData.title) doc.title = snapshotData.title;
    if (snapshotData.type) doc.type = snapshotData.type;
    if (snapshotData.templateId !== undefined) doc.templateId = snapshotData.templateId;
    await doc.save({ transaction });

    // Delete current sections (which will cascade delete items or we delete items explicitly)
    const currentSections = await Section.findAll({
      where: { documentId: id },
      transaction,
    });

    const sectionIds = currentSections.map((s) => s.id);
    if (sectionIds.length > 0) {
      await Item.destroy({ where: { sectionId: sectionIds }, transaction });
      await Section.destroy({ where: { documentId: id }, transaction });
    }

    // Recreate sections and items from snapshot
    if (Array.isArray(snapshotData.sections)) {
      for (const sec of snapshotData.sections) {
        const createdSection = await Section.create(
          {
            heading: sec.heading,
            position: sec.position,
            documentId: id,
          },
          { transaction }
        );

        if (Array.isArray(sec.items)) {
          for (const item of sec.items) {
            await Item.create(
              {
                content: item.content,
                position: item.position,
                sectionId: createdSection.id,
              },
              { transaction }
            );
          }
        }
      }
    }

    await transaction.commit();

    const restoredDoc = await Document.findOne({
      where: { id, userId: req.user.id },
      include: [
        {
          model: Section,
          as: "sections",
          include: [{ model: Item, as: "items" }],
        },
      ],
    });

    return res.status(200).json({
      message: "Document restored successfully",
      document: restoredDoc,
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
