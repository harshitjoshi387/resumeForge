const db = require("../models");
const Template = db.template;

const parseConfig = (config) => {
  if (!config) return {};
  try {
    return typeof config === "string" ? JSON.parse(config) : config;
  } catch {
    return {};
  }
};

exports.getAllTemplates = async (req, res) => {
  try {
    const rows = await Template.findAll({ order: [["id", "ASC"]] });

    const templates = rows.map((t) => {
      const cfg = parseConfig(t.config);
      return {
        id: t.id,
        name: t.name,
        type: cfg.type || cfg.layout || "simple",
        description: cfg.description || "",
        previewColor: cfg.previewColor,
        config: cfg,
      };
    });

    return res.status(200).json({ templates });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getTemplateById = async (req, res) => {
  try {
    const template = await Template.findByPk(req.params.id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    const cfg = parseConfig(template.config);
    return res.status(200).json({
      template: {
        id: template.id,
        name: template.name,
        type: cfg.type || cfg.layout || "simple",
        description: cfg.description || "",
        previewColor: cfg.previewColor,
        config: cfg,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
