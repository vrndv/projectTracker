const prisma = require("../lib/prisma");
const { broadcast } = require("../lib/ws");
const { z } = require("zod");

const ProjectDataSchema = z.object({
  name: z.string(),
  containers: z.number().int().nonnegative(),
  fullness: z.number().min(0).max(100),
  totalItems: z.number().int().nonnegative(),
  uniqueItems: z.number().int().nonnegative(),
  items: z.record(z.string(), z.number().int().nonnegative()),
});

const PayloadSchema = z.object({
  server: z.string(),
  timestamp: z.number().int(),
  projects: z.array(ProjectDataSchema),
});

async function handleProjectUpdate(req, res, next) {
  try {
    const payload = PayloadSchema.parse(req.body);

    const results = [];

    for (const proj of payload.projects) {
      // Skip zero-value updates (chunks unloaded) — preserve last valid snapshot
      const isEmptyUpdate = proj.totalItems === 0 && proj.containers === 0;
      if (isEmptyUpdate) {
        results.push({ name: proj.name, skipped: true, reason: "zero-value update ignored" });
        continue;
      }

      // Find or create project by slug (derived from name)
      const slug = proj.name.toLowerCase().replace(/\s+/g, "-");

      let project = await prisma.project.findUnique({ where: { slug } });
      if (!project) {
        project = await prisma.project.create({
          data: {
            slug,
            name: proj.name,
            status: "ACTIVE",
          },
        });
      }

      // Create snapshot
      const snapshot = await prisma.projectSnapshot.create({
        data: {
          projectId: project.id,
          fullness: proj.fullness,
          totalItems: proj.totalItems,
          uniqueItems: proj.uniqueItems,
          containers: proj.containers,
          items: {
            create: Object.entries(proj.items).map(([material, amount]) => ({
              material,
              amount,
            })),
          },
        },
      });

      // Update project updatedAt
      await prisma.project.update({
        where: { id: project.id },
        data: { updatedAt: new Date() },
      });

      results.push({ name: proj.name, snapshotId: snapshot.id });

      // Broadcast to WebSocket clients
      broadcast("snapshot", {
        projectSlug: slug,
        fullness: proj.fullness,
        totalItems: proj.totalItems,
        uniqueItems: proj.uniqueItems,
        containers: proj.containers,
        items: proj.items,
      });
    }

    res.json({ ok: true, processed: results });
  } catch (err) {
    next(err);
  }
}

async function handlePlayerStatsUpdate(req, res, next) {
  try {
    const { server, players } = req.body;
    if (!server || !Array.isArray(players)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    for (const p of players) {
      const user = await prisma.user.findFirst({ where: { username: p.username } });
      if (!user) continue;

      await prisma.playerStats.upsert({
        where: { userId_server: { userId: user.id, server } },
        update: {
          playtimeSecs: p.playtimeSecs ?? undefined,
          deaths: p.deaths ?? undefined,
          kills: p.kills ?? undefined,
          blocksMined: p.blocksMined ?? undefined,
          distanceMoved: p.distanceMoved ?? undefined,
        },
        create: {
          userId: user.id,
          server,
          playtimeSecs: p.playtimeSecs ?? 0,
          deaths: p.deaths ?? 0,
          kills: p.kills ?? 0,
          blocksMined: p.blocksMined ?? 0,
          distanceMoved: p.distanceMoved ?? 0,
        },
      });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { handleProjectUpdate, handlePlayerStatsUpdate };
