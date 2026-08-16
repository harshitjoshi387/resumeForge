require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./models");

const authRouter = require("./router/auth.routes");
const userRouter = require("./router/user.routes");
const documentRouter = require("./router/document.routes");
const shareRouter = require("./router/share.routes");
const applicationRouter = require("./router/application.routes");

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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "ResumeForge2 Backend is running" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try {
    await db.sequelize.authenticate();
    console.log("Database connection established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
  }
});