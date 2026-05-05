import prisma from "./lib/prisma.js";

async function checkTrack() {
  const track = await prisma.academyCourse.findUnique({
    where: { slug: "advanced-python-engineering" }
  });
  console.log(JSON.stringify(track, null, 2));
}

checkTrack();
