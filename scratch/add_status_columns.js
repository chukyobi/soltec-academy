
const { Client } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_YmkSF3Luw6VP@ep-odd-art-amyt0r74.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function migrate() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("Connected to database");

    console.log("Adding isActive column to User...");
    try { await client.query('ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN DEFAULT true;'); } catch(e) { console.log("User.isActive might already exist"); }

    console.log("Adding isActive column to AcademyCourse...");
    try { await client.query('ALTER TABLE "AcademyCourse" ADD COLUMN "isActive" BOOLEAN DEFAULT true;'); } catch(e) { console.log("AcademyCourse.isActive might already exist"); }

    console.log("Adding isActive column to Cohort...");
    try { await client.query('ALTER TABLE "Cohort" ADD COLUMN "isActive" BOOLEAN DEFAULT true;'); } catch(e) { console.log("Cohort.isActive might already exist"); }

    console.log("Migration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

migrate();
