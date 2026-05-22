const express = require("express");
const passport = require("passport");
const router = express.Router();

router.get("/discord", passport.authenticate("discord"));

router.get("/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=1`,
  }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL || "http://localhost:3000");
  }
);

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ ok: true });
  });
});

router.get("/me", (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ user: null });
  const { id, username, avatar, role, createdAt } = req.user;
  res.json({ user: { id, username, avatar, role, createdAt } });
});

module.exports = router;
