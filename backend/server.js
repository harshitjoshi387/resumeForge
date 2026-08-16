require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./models");

const authRouter = require("./router/auth.routes");
const userRouter = require("./router/user.routes");
const documentRouter = require("./router/document.routes");
const shareRouter = require("./router/share.routes");
const applicationRouter = require("./router/application.routes");
const dashboardRouter = require("./router/dashboard.routes");
const templateRouter = require("./router/template.routes");
const exportsRouter = require("./router/exports.routes");
const { seedTrialUser } = require("./seed/trial.seed");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/documents", documentRouter);
app.use("/api/shares", shareRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/templates", templateRouter);
app.use("/api/exports", exportsRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "ResumeForge2 Backend is running" });
});

const PORT = process.env.PORT || 3000;

async function seedTemplates() {
  const Template = db.template;
  const count = await Template.count();
  if (count > 0) return;

  await Template.bulkCreate([
    { name: "Classic", config: JSON.stringify({ type: "simple", layout: "standard" }) },
    { name: "Modern", config: JSON.stringify({ type: "simple", layout: "modern" }) },
    { name: "Technical", config: JSON.stringify({ type: "sidebar", layout: "technical" }) },
    { name: "Executive", config: JSON.stringify({ type: "simple", layout: "executive" }) },
    { name: "Creative", config: JSON.stringify({ type: "sidebar", layout: "creative" }) },
    { name: "Minimal", config: JSON.stringify({ type: "simple", layout: "minimal" }) },
    { name: "Academic", config: JSON.stringify({ type: "sidebar", layout: "academic" }) },
    { name: "Bold", config: JSON.stringify({ type: "simple", layout: "bold" }) },
  ]);
  console.log("Default templates seeded.");
}

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try {
    await db.sequelize.authenticate();
    console.log("Database connection established successfully.");
    await seedTemplates();
    await seedTrialUser();
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
  }
});