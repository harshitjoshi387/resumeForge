const db = require("../models");
const Document = db.document;
const Application = db.application;
const Version = db.version;
const Export = db.export;
const { Op } = require("sequelize");

const PIPELINE_STATUSES = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [docCount, appCount, exportCount, userDocs] = await Promise.all([
      Document.count({ where: { userId } }),
      Application.count({ where: { userId } }),
      Export.count({ where: { userId } }),
      Document.findAll({ where: { userId }, attributes: ["id"] }),
    ]);

    const docIds = userDocs.map((d) => d.id);
    const versionCount = docIds.length
      ? await Version.count({ where: { documentId: { [Op.in]: docIds } } })
      : 0;

    const recentDocuments = await Document.findAll({
      where: { userId },
      order: [["updatedAt", "DESC"]],
      limit: 4,
      attributes: ["id", "title", "type", "updatedAt"],
    });

    const applications = await Application.findAll({
      where: { userId },
      attributes: ["status"],
    });

    const applicationPipeline = PIPELINE_STATUSES.map((status) => ({
      status,
      count: applications.filter((a) => a.status === status).length,
    }));

    return res.status(200).json({
      documents: docCount,
      applications: appCount,
      versions: versionCount,
      exports: exportCount,
      recentDocuments,
      applicationPipeline,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
