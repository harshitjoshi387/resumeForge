const crypto = require("crypto");
const db = require("../models");
const Document = db.document;
const Share = db.share;
const Section = db.section;
const Item = db.item;

// Helper to verify document ownership
const verifyDocumentOwnership = async (documentId, userId) => {
  return await Document.findOne({
    where: { id: documentId, userId },
  });
};

// ==================== CREATE OR GET SHARE LINK ====================
exports.createOrGetShare = async (req, res) => {
  try {
    const { id } = req.params; // documentId

    const doc = await verifyDocumentOwnership(id, req.user.id);
    if (!doc) {
      return res.status(404).json({ message: "Document nahi mila" });
    }

    let shareRecord = await Share.findOne({ where: { documentId: id } });

    if (!shareRecord) {
      const slug = crypto.randomBytes(6).toString("hex");
      shareRecord = await Share.create({
        slug,
        documentId: id,
      });
    }

    return res.status(200).json({
      message: "Share link successfully fetched/created",
      share: shareRecord,
      shareUrl: `/api/shares/${shareRecord.slug}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== GET PUBLIC SHARED DOCUMENT ====================
exports.getPublicDocument = async (req, res) => {
  try {
    const { slug } = req.params;

    const shareRecord = await Share.findOne({ where: { slug } });
    if (!shareRecord) {
      return res.status(404).json({ message: "Shared link invalid ya expire ho gaya hai" });
    }

    const document = await Document.findOne({
      where: { id: shareRecord.documentId },
      attributes: ["id", "title", "type", "templateId", "createdAt", "updatedAt"],
      include: [
        {
          model: Section,
          as: "sections",
          include: [{ model: Item, as: "items" }],
        },
      ],
      order: [
        [{ model: Section, as: "sections" }, "position", "ASC"],
        [{ model: Section, as: "sections" }, { model: Item, as: "items" }, "position", "ASC"],
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

// ==================== REVOKE / DELETE SHARE LINK ====================
exports.deleteShare = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await verifyDocumentOwnership(id, req.user.id);
    if (!doc) {
      return res.status(404).json({ message: "Document nahi mila" });
    }

    const shareRecord = await Share.findOne({ where: { documentId: id } });
    if (!shareRecord) {
      return res.status(404).json({ message: "Share link exist nahi karta" });
    }

    await shareRecord.destroy();
    return res.status(200).json({ message: "Share link revoked successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
