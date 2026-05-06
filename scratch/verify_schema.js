const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const settings = await prisma.classroomSettings.findMany();
    console.log("ClassroomSettings found:", settings.length);
    const cohorts = await prisma.cohort.findMany({
      include: { settings: true }
    });
    console.log("Cohorts with settings found:", cohorts.length);
  } catch (e) {
    console.error("Verification failed:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
