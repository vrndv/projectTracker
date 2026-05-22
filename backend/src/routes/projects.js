const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const projectController = require("../controllers/projectController");

// Public
router.get("/", projectController.listProjects);
router.get("/:slug", projectController.getProject);
router.get("/:slug/snapshots", projectController.getSnapshots);
router.get("/:slug/goals", projectController.getGoals);

// Auth required
router.post("/:slug/comments", requireAuth, projectController.addComment);
router.post("/:slug/members", requireAuth, requireRole("ADMIN"), projectController.addMember);

// Builder+
router.post("/", requireAuth, requireRole("ADMIN", "BUILDER"), projectController.createProject);
router.post("/:slug/updates", requireAuth, requireRole("ADMIN", "BUILDER", "MEMBER"), projectController.addUpdate);
router.post("/:slug/media", requireAuth, requireRole("ADMIN", "BUILDER"), projectController.addMedia);
router.post("/:slug/goals", requireAuth, requireRole("ADMIN", "BUILDER"), projectController.setGoal);

// Management (Edit/Delete) with updated roles
router.patch("/:slug", requireAuth, requireRole("ADMIN", "BUILDER", "MEMBER"), projectController.updateProject);
router.delete("/:slug", requireAuth, requireRole("ADMIN", "BUILDER"), projectController.deleteProject);

module.exports = router;