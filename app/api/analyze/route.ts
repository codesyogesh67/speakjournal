import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { countWords, wpm } from "@/lib/utils";

const BodySchema = z.object({
  sessionId: z.string().min(5),
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildPrompt(args: {
  topic: string;
  durationSec: number;
  transcriptRaw: string;
}) {
  const schema = {
    topic: "",
    durationSec: 0,
    estimatedWords: 0,
    wpm: 0,
    cleanTranscript: "",
    nativeTranscript: "",
    mistakes: [
      {
        original: "",
        fix: "",
        type: "grammar|word_choice|pronunciation|clarity|structure",
        note: "",
      },
    ],
    vocabUpgrades: [{ used: "", better: ["", "", ""] }],
    stuckPhrases: { detected: [""], betterOptions: ["", "", ""] },
    scores: { clarity: 0, fluency: 0, naturalness: 0 },
    top3Focus: ["", "", ""],
    drill: { repeatLines: ["", "", ""], pronunciationTargets: ["", "", ""] },
  };

  return `
Return ONLY valid JSON matching this schema EXACTLY (no markdown, no extra keys):
${JSON.stringify(schema, null, 2)}

Given:
topic: ${JSON.stringify(args.topic)}
durationSec: ${args.durationSec}
transcriptRaw: ${JSON.stringify(args.transcriptRaw)}

Tasks:
1) cleanTranscript: correct grammar/wording but keep my meaning and tone.
2) nativeTranscript: more natural, conversational version.
3) mistakes: extract issues with original -> fix + type + short note.
4) vocabUpgrades: provide 3 better options for key phrases I used.
5) stuckPhrases: detect fillers/stalls and give alternatives.
6) Compute estimatedWords from transcriptRaw (split by spaces) and wpm = estimatedWords/(durationSec/60).
7) scores: 1-10 for clarity, fluency, naturalness (be honest and conservative).
8) top3Focus + drill.repeatLines (3-5 lines) + drill.pronunciationTargets (3-8 items).
`.trim();
}

export async function POST(req: Request) {
  const json = await req.json();
  const { sessionId } = BodySchema.parse(json);

  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) return new NextResponse("Session not found", { status: 404 });

  const model = process.env.OPENAI_MODEL || "gpt-5.2";
  const prompt = buildPrompt({
    topic: session.topic,
    durationSec: session.durationSec,
    transcriptRaw: session.transcriptRaw,
  });

  const r = await client.responses.create({
    model,
    input: prompt,
  });

  const text = (r as any).output_text as string | undefined;
  if (!text)
    return new NextResponse("No output_text from model", { status: 500 });

  let analysis: any;
  try {
    analysis = JSON.parse(text);
  } catch {
    return new NextResponse(
      "Model did not return valid JSON. Try re-analyze.",
      { status: 500 }
    );
  }

  // local computed metrics as a backup (still store model's too)
  const words = countWords(session.transcriptRaw);
  const localWpm = wpm(words, session.durationSec);

  const updated = await prisma.session.update({
    where: { id: sessionId },
    data: {
      transcriptClean: analysis.cleanTranscript ?? null,
      transcriptNative: analysis.nativeTranscript ?? null,
      estimatedWords: Number.isFinite(analysis.estimatedWords)
        ? analysis.estimatedWords
        : words,
      wpm: Number.isFinite(analysis.wpm) ? analysis.wpm : localWpm,
      analysisJson: analysis,
    },
  });

  return NextResponse.json({ ok: true, session: updated });
}
