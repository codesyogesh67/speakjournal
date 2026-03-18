import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const CreateSchema = z.object({
  title: z.string().min(1),
  category: z.string().optional().nullable(),
  content: z.string().min(1),
  isPinned: z.boolean().optional(),
});

export async function GET() {
  const notes = await prisma.coachNote.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 200,
  });

  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const body = CreateSchema.parse(await req.json());

  const created = await prisma.coachNote.create({
    data: {
      title: body.title.trim(),
      category: body.category?.trim() || null,
      content: body.content.trim(),
      isPinned: body.isPinned ?? false,
    },
    select: { id: true },
  });

  return NextResponse.json(created);
}
