import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const UpdateSchema = z.object({
  title: z.string().min(1),
  category: z.string().optional().nullable(),
  content: z.string().min(1),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prompt = await prisma.prompt.findUnique({ where: { id } });
  if (!prompt) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(prompt);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = UpdateSchema.parse(await req.json());

  const updated = await prisma.prompt.update({
    where: { id },
    data: {
      title: body.title.trim(),
      category: body.category?.trim() || null,
      content: body.content.trim(),
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
  await prisma.prompt.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
