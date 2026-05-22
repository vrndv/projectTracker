const express = require("express");
const router = express.Router();
const { requirePluginSecret } = require("../middleware/auth");
const pluginController = require("../controllers/pluginController");

router.post("/projecttrack/update", requirePluginSecret, pluginController.handleProjectUpdate);
router.post("/playerstats/update", requirePluginSecret, pluginController.handlePlayerStatsUpdate);

module.exports = router;
