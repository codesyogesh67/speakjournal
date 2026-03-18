export type PracticeTopic = {
  slug: string;
  title: string;
  level: "easy" | "medium" | "hard";
  timeSecDefault: number; // e.g., 120 = 2 minutes
  prompt: string;

  ideas: string[]; // bullet points you can talk about
  vocab: string[]; // keywords to practice
  starters: string[]; // sentence starters
  strongSentences: string[]; // ready-made lines
  stuckBridges: string[]; // when blank
  insights: string[]; // speaking tips for that topic
};

export const TOPICS: PracticeTopic[] = [
  {
    slug: "discipline-vs-motivation",
    title: "Discipline is more important than motivation",
    level: "easy",
    timeSecDefault: 120,
    prompt:
      "Explain why discipline matters more than motivation. Use one personal example.",
    ideas: [
      "Define motivation (emotional energy) and why it disappears",
      "Define discipline (showing up consistently)",
      "Example: coding after work / gym / English practice",
      "What changed for you: before vs now",
      "Conclusion: systems > feelings",
    ],
    vocab: [
      "discipline",
      "consistency",
      "follow-through",
      "momentum",
      "emotional energy",
      "routine",
      "long-term results",
    ],
    starters: [
      "Today I want to talk about…",
      "For a long time, I believed…",
      "But over time, I realized…",
      "That’s why…",
      "In the long run…",
    ],
    strongSentences: [
      "Motivation starts you, but discipline keeps you going.",
      "Discipline means showing up even when you don’t feel like it.",
      "Consistency creates results, not intensity.",
    ],
    stuckBridges: [
      "Let me think for a second…",
      "What I mean is…",
      "Let me give you an example…",
      "Basically…",
    ],
    insights: [
      "Use Before → After → Lesson format",
      "Keep sentences short; add pauses",
      "End with a one-line takeaway",
    ],
  },
  {
    slug: "small-projects-learning",
    title: "Why building small projects is the fastest way to learn",
    level: "easy",
    timeSecDefault: 120,
    prompt:
      "Explain how projects teach you more than tutorials. Mention one struggle and one win.",
    ideas: [
      "Tutorial learning vs real building",
      "Bugs reveal weak understanding",
      "Confidence comes from solving problems",
      "Momentum from finishing small things",
      "How this applies to your Next.js journey",
    ],
    vocab: [
      "hands-on",
      "feedback loop",
      "debugging",
      "iterate",
      "ship",
      "confidence",
      "real-world",
    ],
    starters: [
      "Something that changed my learning is…",
      "At first, I used to…",
      "The turning point was…",
      "What I realized is…",
    ],
    strongSentences: [
      "Information feels productive, but projects build skill.",
      "Every bug I fix teaches me more than a video.",
      "Finishing small projects creates momentum.",
    ],
    stuckBridges: [
      "Let me rephrase that…",
      "Another way to see it is…",
      "Here’s a simple example…",
    ],
    insights: [
      "Give one specific example (a bug you fixed)",
      "Use contrast words: but / however / instead",
    ],
  },
  {
    slug: "english-confidence",
    title: "How to build confidence speaking English",
    level: "easy",
    timeSecDefault: 120,
    prompt:
      "Share your plan for improving English and how you handle fear or freezing.",
    ideas: [
      "What makes you feel nervous (pronunciation, blank moments)",
      "Your system: record → transcript → correction → repeat",
      "Small daily practice beats long rare sessions",
      "How to speak even when stuck (bridge phrases)",
      "What progress looks like after 30 days",
    ],
    vocab: [
      "confidence",
      "fluency",
      "clarity",
      "practice loop",
      "consistency",
      "self-correction",
      "progress",
    ],
    starters: [
      "I used to feel…",
      "Now I’m working on…",
      "One thing that helps me is…",
      "The biggest challenge is…",
    ],
    strongSentences: [
      "Confidence comes from repetition, not perfection.",
      "I don’t wait to feel ready—I practice every day.",
      "My goal is progress, not perfect English.",
    ],
    stuckBridges: [
      "I’m not sure how to say it, but…",
      "Let me say it in a simpler way…",
      "What I’m trying to say is…",
    ],
    insights: [
      "Say one fear + one solution",
      "End with: ‘This is what I’m doing now.’",
    ],
  },
  {
    slug: "best-advice-you-received",
    title: "The best advice you ever received",
    level: "easy",
    timeSecDefault: 120,
    prompt: "Tell the advice, who gave it, and how it changed your behavior.",
    ideas: [
      "What the advice was",
      "Why it mattered to you",
      "How you applied it",
      "A result you noticed",
      "A lesson for others",
    ],
    vocab: [
      "lesson",
      "mindset",
      "impact",
      "apply",
      "habit",
      "changed my perspective",
    ],
    starters: [
      "The best advice I ever heard was…",
      "At the time…",
      "Looking back…",
      "What changed for me was…",
    ],
    strongSentences: [
      "That advice stuck with me because it was simple and true.",
      "It changed how I make decisions day to day.",
    ],
    stuckBridges: ["Let me give a quick story…", "One moment I remember is…"],
    insights: ["Tell it like a story: before → moment → after"],
  },
  {
    slug: "social-media-benefit-harm",
    title: "Is social media good or bad for you?",
    level: "medium",
    timeSecDefault: 120,
    prompt:
      "Give both sides, then your final opinion with one rule you follow.",
    ideas: [
      "Benefits (learning, community)",
      "Costs (distraction, comparison)",
      "Your personal rule",
      "Example from your day",
      "Conclusion",
    ],
    vocab: [
      "distraction",
      "attention",
      "consume",
      "create",
      "boundaries",
      "mindless scrolling",
    ],
    starters: [
      "On one hand…",
      "On the other hand…",
      "Personally, I think…",
      "For me, the rule is…",
    ],
    strongSentences: [
      "Social media is a tool—it depends on how you use it.",
      "If I’m only consuming, I feel drained. If I’m creating, I feel motivated.",
    ],
    stuckBridges: ["Let me compare both sides…", "The main point is…"],
    insights: ["Use a clear structure: pros → cons → rule → ending"],
  },
  {
    slug: "work-life-balance",
    title: "What does work-life balance mean to you?",
    level: "medium",
    timeSecDefault: 120,
    prompt: "Explain your definition and what you’re doing to improve it.",
    ideas: [
      "Your definition",
      "What’s hard (time, energy)",
      "Your strategy (schedule, limits)",
      "A habit you’re building",
      "Result you want",
    ],
    vocab: [
      "balance",
      "priorities",
      "boundaries",
      "recharge",
      "routine",
      "burnout",
    ],
    starters: [
      "To me, balance means…",
      "Right now, my biggest challenge is…",
      "One thing I’m trying is…",
    ],
    strongSentences: [
      "Balance isn’t equal time; it’s the right priorities.",
      "If I don’t protect my energy, I can’t be consistent.",
    ],
    stuckBridges: ["Let me break it down…", "A simple example is…"],
    insights: ["Mention one practical change (sleep, blocks, no phone)"],
  },
  {
    slug: "future-self-1-year",
    title: "Where do you want to be in one year?",
    level: "medium",
    timeSecDefault: 120,
    prompt: "Describe your goals and the daily habits that will get you there.",
    ideas: [
      "Your main goal (coding/English/fitness)",
      "Why it matters",
      "Daily habit plan",
      "What you’ll stop doing",
      "How you’ll measure progress",
    ],
    vocab: [
      "goal",
      "plan",
      "consistency",
      "measure",
      "commitment",
      "milestone",
    ],
    starters: [
      "In one year, I want to…",
      "The reason is…",
      "My plan is simple…",
      "I’ll measure it by…",
    ],
    strongSentences: [
      "Big goals are built by small daily actions.",
      "I’m focused on systems, not motivation.",
    ],
    stuckBridges: ["Let me be specific…", "For example…"],
    insights: ["Give 2 habits + 1 metric (WPM, sessions/week, workouts/week)"],
  },
  {
    slug: "failure-lesson",
    title: "A failure that taught you something important",
    level: "hard",
    timeSecDefault: 120,
    prompt: "Tell the story, what you learned, and how you changed after.",
    ideas: [
      "What happened",
      "How you felt",
      "What went wrong",
      "Lesson learned",
      "What you do differently now",
    ],
    vocab: [
      "lesson",
      "mistake",
      "improve",
      "responsibility",
      "reflection",
      "growth",
    ],
    starters: [
      "One time I failed was…",
      "At that moment…",
      "The lesson I learned is…",
      "Now I…",
    ],
    strongSentences: [
      "That failure was painful, but it made me stronger.",
      "I learned that progress needs patience.",
    ],
    stuckBridges: ["Let me give the short version…", "The key moment was…"],
    insights: ["Keep it honest, not dramatic. Finish with the lesson."],
  },
  {
    slug: "money-habits",
    title: "A money habit that improved your life",
    level: "hard",
    timeSecDefault: 120,
    prompt: "Explain one habit and why it matters long-term.",
    ideas: [
      "The habit",
      "What problem it solved",
      "How you started",
      "Result",
      "Advice to someone else",
    ],
    vocab: ["budget", "discipline", "spending", "saving", "plan", "long-term"],
    starters: [
      "One habit that helped me is…",
      "I started because…",
      "Over time…",
    ],
    strongSentences: [
      "Small changes compound over time.",
      "I try to be intentional, not perfect.",
    ],
    stuckBridges: ["A simple example is…", "What I’m trying to say is…"],
    insights: ["Use numbers if you can (weekly budget / rule)"],
  },
];
