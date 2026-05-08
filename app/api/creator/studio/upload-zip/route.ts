import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import { serverError } from "@/lib/api-error";

export async function POST(req: Request) {
  try {
    const session = await getSession("creator").catch(() => null) as any;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;

    if (!file) return NextResponse.json({ error: "Zip file required" }, { status: 400 });

    // 1. Create a Course Draft
    const draft = await prisma.courseDraft.create({
      data: {
        title: title || "Untitled Course",
        creatorId: session.userId,
        status: "EDITING"
      }
    });

    const uploadDir = path.join(process.cwd(), "public", "uploads", "courses", draft.id);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // 2. Buffer the zip file
    const buffer = Buffer.from(await file.arrayBuffer());
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();

    const videoEntries = zipEntries.filter(entry => 
      !entry.isDirectory && 
      /\.(mp4|mov|avi|mkv)$/i.test(entry.entryName)
    );

    if (videoEntries.length === 0) {
      return NextResponse.json({ error: "No video files found in zip" }, { status: 400 });
    }

    // 3. Extract videos and create DraftVideo records
    const videos = [];
    for (let i = 0; i < videoEntries.length; i++) {
      const entry = videoEntries[i];
      const fileName = entry.name;
      const filePath = path.join(uploadDir, fileName);
      
      // Save file
      fs.writeFileSync(filePath, entry.getData());

      const video = await prisma.draftVideo.create({
        data: {
          draftId: draft.id,
          title: fileName.replace(/\.[^/.]+$/, ""), // Remove extension for default title
          fileName: fileName,
          fileUrl: `/uploads/courses/${draft.id}/${fileName}`,
          order: i + 1,
        }
      });
      videos.push(video);
    }

    return NextResponse.json({ success: true, draftId: draft.id, videos });
  } catch (err) {
    return serverError(err, "POST zip upload");
  }
}
