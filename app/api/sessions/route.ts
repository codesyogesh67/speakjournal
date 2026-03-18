import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const BodySchema = z.object({
  journalJsonText: z.string().min(10),
});

const JournalSchema = z
  .object({
    session: z.object({
      topicTitle: z.string().min(1),
      duration: z.object({
        raw: z.string().min(1),
        seconds: z.number().int().positive(),
      }),
      transcriptRaw: z.string().min(1),
    }),
    metrics: z.object({
      estimatedWordCount: z.number().int().nonnegative(),
      wpm: z.number().nonnegative(),
    }),
    editedTexts: z.object({
      cleanTranscript: z.string(),
      nativeTranscript: z.string(),
    }),
    scores: z.object({
      fluencyOutOf10: z.number(),
      grammarOutOf10: z.number(),
      structureOutOf10: z.number(),
      confidencePotentialOutOf10: z.number(),
      notes: z.array(z.string()),
    }),
  })
  .passthrough(); // allow the rest of your JSON

export async function GET() {
  const sessions = await prisma.session.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      createdAt: true,
      topic: true,
      durationSec: true,
      wpm: true,
      estimatedWords: true,
      analysisJson: true,
    },
  });
  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  const body = BodySchema.parse(await req.json());

  let parsed: any;
  try {
    parsed = JSON.parse(body.journalJsonText);
  } catch {
    return new NextResponse("Invalid JSON: could not parse", { status: 400 });
  }

  const journal = JournalSchema.parse(parsed);

  const created = await prisma.session.create({
    data: {
      topic: journal.session.topicTitle,
      durationSec: journal.session.duration.seconds,
      transcriptRaw: journal.session.transcriptRaw,

      transcriptClean: journal.editedTexts.cleanTranscript,
      transcriptNative: journal.editedTexts.nativeTranscript,
      estimatedWords: journal.metrics.estimatedWordCount,
      wpm: journal.metrics.wpm,

      // store full journal output
      //   journalJson: parsed,

      // optionally store the same for analysis tab reuse
      analysisJson: parsed,
    },
    select: { id: true },
  });

  return NextResponse.json(created);
}
