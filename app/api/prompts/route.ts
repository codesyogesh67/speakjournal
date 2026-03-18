import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const CreateSchema = z.object({
  title: z.string().min(1),
  category: z.string().optional().nullable(),
  content: z.string().min(1),
});

export async function GET() {
  const prompts = await prisma.prompt.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json(prompts);
}

export async function POST(req: Request) {
  const body = CreateSchema.parse(await req.json());
  const created = await prisma.prompt.create({
    data: {
      title: body.title.trim(),
      category: body.category?.trim() || null,
      content: body.content.trim(),
    },
    select: { id: true },
  });
  return NextResponse.json(created);
}
