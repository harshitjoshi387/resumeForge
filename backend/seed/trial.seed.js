const bcrypt = require("bcryptjs");
const db = require("../models");

const TRIAL_EMAIL = "trial@resumeforge.com";
const TRIAL_PASSWORD = "trial123";
const TRIAL_NAME = "Trial Free";

async function seedTrialUser() {
  const User = db.user;
  const Document = db.document;
  const Section = db.section;
  const Item = db.item;
  const Application = db.application;

  let user = await User.findOne({ where: { email: TRIAL_EMAIL } });

  if (!user) {
    const hashedPassword = await bcrypt.hash(TRIAL_PASSWORD, 10);
    user = await User.create({
      name: TRIAL_NAME,
      email: TRIAL_EMAIL,
      password: hashedPassword,
    });
    console.log("Trial account created (trial@resumeforge.com / trial123).");
  }

  const docCount = await Document.count({ where: { userId: user.id } });
  if (docCount > 0) return;

  const modern = await db.template.findOne({ where: { name: "Modern" } });
  const classic = await db.template.findOne({ where: { name: "Classic" } });
  const academic = await db.template.findOne({ where: { name: "Academic" } });

  const docs = await Document.bulkCreate([
    { title: "Senior Frontend Engineer — 2026", type: "resume", userId: user.id, templateId: modern?.id || null },
    { title: "Cover letter — Linear", type: "cover-letter", userId: user.id, templateId: classic?.id || null },
    { title: "Academic CV", type: "cv", userId: user.id, templateId: academic?.id || null },
    { title: "Resume — product roles", type: "resume", userId: user.id, templateId: modern?.id || null },
  ]);

  const expSection = await Section.create({
    heading: "Experience",
    position: 1,
    documentId: docs[0].id,
  });
  await Item.bulkCreate([
    { content: "Built scalable React dashboards used by 50k+ users.", position: 1, sectionId: expSection.id },
    { content: "Led migration to TypeScript across 12 frontend packages.", position: 2, sectionId: expSection.id },
  ]);

  await Application.bulkCreate([
    { company: "Figma", role: "Frontend Engineer", status: "Saved", userId: user.id, documentId: docs[0].id },
    { company: "Retool", role: "UI Engineer", status: "Saved", userId: user.id, documentId: docs[3].id },
    { company: "Linear", role: "Senior Frontend Engineer", status: "Applied", userId: user.id, documentId: docs[0].id },
    { company: "Airtable", role: "Product Engineer", status: "Applied", userId: user.id, documentId: docs[3].id },
    { company: "Vercel", role: "Developer Advocate", status: "Interview", userId: user.id, documentId: docs[0].id },
    { company: "Notion", role: "Frontend Engineer", status: "Offer", userId: user.id, documentId: docs[2].id },
    { company: "Stripe", role: "Software Engineer", status: "Rejected", userId: user.id, documentId: docs[1].id },
  ]);

  console.log("Trial demo data seeded.");
}

module.exports = { seedTrialUser, TRIAL_EMAIL, TRIAL_PASSWORD, TRIAL_NAME };
