const prisma = require("../lib/prisma");

async function listUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { memberships: { include: { project: true } } },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function setUserRole(req, res, next) {
  try {
    const { role } = req.body;
    const validRoles = ["ADMIN", "BUILDER", "MEMBER", "VIEWER"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const [projectCount, userCount, snapshotCount] = await Promise.all([
      prisma.project.count(),
      prisma.user.count(),
      prisma.projectSnapshot.count(),
    ]);

    res.json({ projectCount, userCount, snapshotCount });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, setUserRole, getStats };
