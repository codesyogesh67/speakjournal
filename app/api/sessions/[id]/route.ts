import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const s = await prisma.session.findUnique({ where: { id: params.id } });
  if (!s) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(s);
}

const PatchSchema = z.object({
  topic: z.string().min(2).max(200).optional(),
  durationSec: z
    .number()
    .int()
    .min(1)
    .max(60 * 20)
    .optional(),
  transcriptRaw: z.string().min(10).max(50_000).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const json = await req.json();
  const input = PatchSchema.parse(json);

  const updated = await prisma.session.update({
    where: { id: params.id },
    data: input,
  });

  return NextResponse.json(updated);
}
