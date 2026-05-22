const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create demo admin user
  const admin = await prisma.user.upsert({
    where: { discordId: "000000000000000001" },
    update: {},
    create: {
      discordId: "000000000000000001",
      username: "Admin",
      role: "ADMIN",
    },
  });

  // Create sample projects matching the real plugin data
  const projects = [
    {
      slug: "madhav",
      name: "madhav",
      description: "General storage and building supplies for the Madhav base area.",
      status: "ACTIVE",
      world: "world",
      x: 120,
      y: 64,
      z: -340,
    },
    {
      slug: "statue",
      name: "statue",
      description: "Materials for the large statue build project.",
      status: "ACTIVE",
      world: "world",
      x: 50,
      y: 70,
      z: 200,
    },
    {
      slug: "vrn",
      name: "vrn",
      description: "VRN project storage — just getting started.",
      status: "ACTIVE",
      world: "world",
      x: -800,
      y: 64,
      z: 150,
    },
  ];

  for (const p of projects) {
    const project = await prisma.project.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });

    // Add admin as member
    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: project.id, userId: admin.id } },
      update: {},
      create: { projectId: project.id, userId: admin.id, role: "ADMIN" },
    });

    console.log(`  ✓ Project: ${project.name}`);
  }

  console.log("\nSeed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
