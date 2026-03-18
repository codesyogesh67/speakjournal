import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const UpdateSchema = z.object({
  title: z.string().min(1),
  category: z.string().optional().nullable(),
  content: z.string().min(1),
  isPinned: z.boolean().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const note = await prisma.coachNote.findUnique({
    where: { id },
  });

  if (!note) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.json(note);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = UpdateSchema.parse(await req.json());

  const updated = await prisma.coachNote.update({
    where: { id },
    data: {
      title: body.title.trim(),
      category: body.category?.trim() || null,
      content: body.content.trim(),
      isPinned: body.isPinned ?? false,
    },
    select: { id: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.coachNote.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
