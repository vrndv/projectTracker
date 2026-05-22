const prisma = require("../lib/prisma");

// GET /api/projects
async function listProjects(req, res, next) {
  try {
    const { sort = "updatedAt", status, search } = req.query;

    const where = {};
    if (status) where.status = status.toUpperCase();
    if (search) where.name = { contains: search, mode: "insensitive" };

    const orderBy = {
      updatedAt: { updatedAt: "desc" },
      newest: { createdAt: "desc" },
      name: { name: "asc" },
    }[sort] ?? { updatedAt: "desc" };

    const projects = await prisma.project.findMany({
      where,
      orderBy,
      include: {
        members: { include: { user: true } },
        goals: true,
        snapshots: {
          orderBy: { timestamp: "desc" },
          take: 1,
          include: { items: true },
        },
      },
    });

    // Attach latest snapshot to each project
    const enriched = projects.map((p) => {
      const latest = p.snapshots[0] ?? null;
      return {
        ...p,
        latestSnapshot: latest,
        snapshots: undefined,
      };
    });

    res.json(enriched);
  } catch (err) {
    next(err);
  }
}

// GET /api/projects/:slug
async function getProject(req, res, next) {
  try {
    const project = await prisma.project.findUnique({
      where: { slug: req.params.slug },
      include: {
        members: { include: { user: true } },
        goals: true,
        updates: { include: { author: true }, orderBy: { createdAt: "desc" } },
        comments: { include: { author: true }, orderBy: { createdAt: "desc" } },
        media: { include: { uploader: true }, orderBy: { createdAt: "desc" } },
        snapshots: {
          orderBy: { timestamp: "desc" },
          take: 1,
          include: { items: true },
        },
      },
    });

    if (!project) return res.status(404).json({ error: "Project not found" });

    res.json({ ...project, latestSnapshot: project.snapshots[0] ?? null });
  } catch (err) {
    next(err);
  }
}

// GET /api/projects/:slug/snapshots
async function getSnapshots(req, res, next) {
  try {
    const project = await prisma.project.findUnique({
      where: { slug: req.params.slug },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const limit = Math.min(parseInt(req.query.limit) || 48, 200);

    const snapshots = await prisma.projectSnapshot.findMany({
      where: { projectId: project.id },
      orderBy: { timestamp: "desc" },
      take: limit,
      include: { items: true },
    });

    res.json(snapshots.reverse());
  } catch (err) {
    next(err);
  }
}

// GET /api/projects/:slug/goals
async function getGoals(req, res, next) {
  try {
    const project = await prisma.project.findUnique({ where: { slug: req.params.slug } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const [goals, latest] = await Promise.all([
      prisma.projectGoal.findMany({ where: { projectId: project.id } }),
      prisma.projectSnapshot.findFirst({
        where: { projectId: project.id },
        orderBy: { timestamp: "desc" },
        include: { items: true },
      }),
    ]);

    const itemMap = {};
    if (latest) {
      for (const item of latest.items) {
        itemMap[item.material] = item.amount;
      }
    }

    const enriched = goals.map((g) => ({
      ...g,
      currentAmount: itemMap[g.material] ?? 0,
      percent: Math.min(100, Math.round(((itemMap[g.material] ?? 0) / g.requiredAmount) * 100)),
    }));

    res.json(enriched);
  } catch (err) {
    next(err);
  }
}

// POST /api/projects
async function createProject(req, res, next) {
  try {
    const { name, description, status, world, x, y, z, videoUrl, mapUrl, thumbnailUrl } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const project = await prisma.project.create({
      data: { slug, name, description, status, world, x, y, z, videoUrl, mapUrl, thumbnailUrl },
    });

    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/projects/:slug
async function updateProject(req, res, next) {
  try {
    const project = await prisma.project.update({
      where: { slug: req.params.slug },
      data: req.body,
    });
    res.json(project);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/projects/:slug
async function deleteProject(req, res, next) {
  try {
    await prisma.project.delete({ where: { slug: req.params.slug } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// POST /api/projects/:slug/goals
async function setGoal(req, res, next) {
  try {
    const project = await prisma.project.findUnique({ where: { slug: req.params.slug } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const { material, requiredAmount } = req.body;
    if (!material || !requiredAmount) return res.status(400).json({ error: "material and requiredAmount required" });

    const goal = await prisma.projectGoal.upsert({
      where: { projectId_material: { projectId: project.id, material: material.toUpperCase() } },
      update: { requiredAmount },
      create: { projectId: project.id, material: material.toUpperCase(), requiredAmount },
    });

    res.json(goal);
  } catch (err) {
    next(err);
  }
}

// POST /api/projects/:slug/updates
async function addUpdate(req, res, next) {
  try {
    const project = await prisma.project.findUnique({ where: { slug: req.params.slug } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ error: "title and content required" });

    const update = await prisma.projectUpdate.create({
      data: { projectId: project.id, authorId: req.user.id, title, content },
      include: { author: true },
    });

    res.status(201).json(update);
  } catch (err) {
    next(err);
  }
}

// POST /api/projects/:slug/comments
async function addComment(req, res, next) {
  try {
    const project = await prisma.project.findUnique({ where: { slug: req.params.slug } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "content required" });

    const comment = await prisma.projectComment.create({
      data: { projectId: project.id, authorId: req.user.id, content },
      include: { author: true },
    });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

// POST /api/projects/:slug/media
async function addMedia(req, res, next) {
  try {
    const project = await prisma.project.findUnique({ where: { slug: req.params.slug } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const { type, url } = req.body;
    if (!type || !url) return res.status(400).json({ error: "type and url required" });

    const media = await prisma.projectMedia.create({
      data: { projectId: project.id, uploadedBy: req.user.id, type: type.toUpperCase(), url },
    });

    res.status(201).json(media);
  } catch (err) {
    next(err);
  }
}

// POST /api/projects/:slug/members
async function addMember(req, res, next) {
  try {
    const project = await prisma.project.findUnique({ where: { slug: req.params.slug } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const { userId, role } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const member = await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: project.id, userId } },
      update: { role: role?.toUpperCase() ?? "MEMBER" },
      create: { projectId: project.id, userId, role: role?.toUpperCase() ?? "MEMBER" },
      include: { user: true },
    });

    res.json(member);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProjects, getProject, getSnapshots, getGoals,
  createProject, updateProject, deleteProject,
  setGoal, addUpdate, addComment, addMedia, addMember,
};
