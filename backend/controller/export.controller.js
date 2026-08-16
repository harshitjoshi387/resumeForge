const PDFDocument = require("pdfkit");
const db = require("../models");
const Document = db.document;
const Section = db.section;
const Item = db.item;
const Export = db.export;

// ==================== EXPORT DOCUMENT AS PDF ====================
exports.exportDocumentPDF = async (req, res) => {
  try {
    const { id } = req.params; // documentId

    const document = await Document.findOne({
      where: { id, userId: req.user.id },
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

    // PDFkit document setup
    const doc = new PDFDocument({ margin: 40 });

    const fileName = `${document.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    doc.pipe(res);

    // Document Title
    doc.fontSize(22).fillColor("#111827").text(document.title, { align: "center" });
    doc.moveDown(0.5);

    doc.moveTo(40, doc.y).lineTo(570, doc.y).strokeColor("#9CA3AF").stroke();
    doc.moveDown(1);

    // Sections & Items
    if (document.sections && document.sections.length > 0) {
      document.sections.forEach((sec) => {
        doc.fontSize(16).fillColor("#1F2937").text(sec.heading, { underline: true });
        doc.moveDown(0.3);

        if (sec.items && sec.items.length > 0) {
          sec.items.forEach((item) => {
            doc.fontSize(12).fillColor("#374151").text(`• ${item.content}`, {
              indent: 15,
            });
            doc.moveDown(0.2);
          });
        }
        doc.moveDown(0.8);
      });
    } else {
      doc.fontSize(12).fillColor("#6B7280").text("This document has no sections yet.");
    }

    doc.end();

    // Log export entry in DB
    await Export.create({
      format: "pdf",
      fileUrl: fileName,
      documentId: document.id,
      userId: req.user.id,
    });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};

// ==================== GET ALL EXPORTS FOR CURRENT USER ====================
exports.getAllUserExports = async (req, res) => {
  try {
    const exportsList = await Export.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Document,
          attributes: ["id", "title", "type"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ exports: exportsList });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== GET EXPORT HISTORY ====================
exports.getExportHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const exportsList = await Export.findAll({
      where: { documentId: id, userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ exports: exportsList });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
