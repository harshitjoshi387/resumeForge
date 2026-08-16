const db = require("../models");
const Document = db.document;
const Section = db.section;
const Item = db.item;

// Helper to verify document ownership
const verifyDocumentOwnership = async (documentId, userId) => {
  const doc = await Document.findOne({
    where: { id: documentId, userId },
  });
  return doc;
};

// ==================== CREATE SECTION ====================
exports.createSection = async (req, res) => {
  try {
    const { id } = req.params; // documentId
    const { heading, position } = req.body;

    const doc = await verifyDocumentOwnership(id, req.user.id);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (!heading) {
      return res.status(400).json({ message: "Section heading is required" });
    }

    let sectionPosition = position;
    if (sectionPosition === undefined || sectionPosition === null) {
      const count = await Section.count({ where: { documentId: id } });
      sectionPosition = count + 1;
    }

    const section = await Section.create({
      heading,
      position: sectionPosition,
      documentId: id,
    });

    return res.status(201).json({
      message: "Section created successfully",
      section,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== UPDATE SECTION ====================
exports.updateSection = async (req, res) => {
  try {
    const { id, sectionId } = req.params;
    const { heading, position } = req.body;

    const doc = await verifyDocumentOwnership(id, req.user.id);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    const section = await Section.findOne({
      where: { id: sectionId, documentId: id },
    });

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    if (heading !== undefined) section.heading = heading;
    if (position !== undefined) section.position = position;

    await section.save();

    return res.status(200).json({
      message: "Section updated successfully",
      section,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== DELETE SECTION ====================
exports.deleteSection = async (req, res) => {
  try {
    const { id, sectionId } = req.params;

    const doc = await verifyDocumentOwnership(id, req.user.id);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    const section = await Section.findOne({
      where: { id: sectionId, documentId: id },
    });

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    await section.destroy();

    return res.status(200).json({ message: "Section deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== CREATE ITEM ====================
exports.createItem = async (req, res) => {
  try {
    const { id, sectionId } = req.params;
    const { content, position } = req.body;

    const doc = await verifyDocumentOwnership(id, req.user.id);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    const section = await Section.findOne({
      where: { id: sectionId, documentId: id },
    });

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    let itemPosition = position;
    if (itemPosition === undefined || itemPosition === null) {
      const count = await Item.count({ where: { sectionId } });
      itemPosition = count + 1;
    }

    const item = await Item.create({
      content: content || "",
      position: itemPosition,
      sectionId,
    });

    return res.status(201).json({
      message: "Item created successfully",
      item,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== UPDATE ITEM ====================
exports.updateItem = async (req, res) => {
  try {
    const { id, sectionId, itemId } = req.params;
    const { content, position } = req.body;

    const doc = await verifyDocumentOwnership(id, req.user.id);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    const section = await Section.findOne({
      where: { id: sectionId, documentId: id },
    });

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const item = await Item.findOne({
      where: { id: itemId, sectionId },
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (content !== undefined) item.content = content;
    if (position !== undefined) item.position = position;

    await item.save();

    return res.status(200).json({
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== DELETE ITEM ====================
exports.deleteItem = async (req, res) => {
  try {
    const { id, sectionId, itemId } = req.params;

    const doc = await verifyDocumentOwnership(id, req.user.id);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    const section = await Section.findOne({
      where: { id: sectionId, documentId: id },
    });

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const item = await Item.findOne({
      where: { id: itemId, sectionId },
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    await item.destroy();

    return res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
