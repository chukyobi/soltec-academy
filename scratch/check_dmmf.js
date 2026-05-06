const { prisma } = require('../lib/prisma');

async function main() {
  try {
    // Check if the cohort model has settings
    const dmmf = (prisma as any)._baseDmmf || (prisma as any)._dmmf;
    const cohortModel = dmmf?.modelMap?.Cohort || dmmf?.datamodel?.models?.find((m: any) => m.name === 'Cohort');
    
    console.log("Cohort Model Fields:", cohortModel?.fields?.map((f: any) => f.name).join(', '));
    
    if (cohortModel?.fields?.find((f: any) => f.name === 'settings')) {
      console.log("SUCCESS: 'settings' field found in Prisma DMMF.");
    } else {
      console.log("FAILURE: 'settings' field NOT found in Prisma DMMF.");
    }
  } catch (e) {
    console.error("DMMF Check failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
