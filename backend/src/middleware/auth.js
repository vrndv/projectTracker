function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Not authenticated" });
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

function requirePluginSecret(req, res, next) {
  const secret = req.headers["x-plugin-secret"];
  if (process.env.PLUGIN_SECRET && secret !== process.env.PLUGIN_SECRET) {
    return res.status(401).json({ error: "Invalid plugin secret" });
  }
  next();
}

module.exports = { requireAuth, requireRole, requirePluginSecret };
