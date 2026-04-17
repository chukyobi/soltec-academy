import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { title, content, image, isFeatured } = await req.json();

    const post = await prisma.blogPost.create({
      data: {
        title,
        content,
        image,
        isFeatured
      }
    });

    return NextResponse.json({ success: true, message: "Blog post published", dbResponse: post });
  } catch (error) {
    console.error("Blog post creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

