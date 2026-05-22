const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const adminController = require("../controllers/adminController");

router.use(requireAuth, requireRole("ADMIN"));

router.get("/users", adminController.listUsers);
router.patch("/users/:id/role", adminController.setUserRole);
router.get("/stats", adminController.getStats);

module.exports = router;
