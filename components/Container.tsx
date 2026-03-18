import Link from "next/link";

export function Container({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-semibold">
            SpeakJournal
          </Link>
          <nav className="flex gap-3 text-sm flex-wrap justify-end">
            <Link className="hover:underline" href="/game">
              Game
            </Link>

            <Link className="hover:underline" href="/vocabulary">
              Vocabulary
            </Link>
            <Link className="hover:underline" href="/pronunciation">
              Pronunciations
            </Link>
            <Link className="hover:underline" href="/starters">
              Starters
            </Link>
            <Link className="hover:underline" href="/prompts">
              Prompts
            </Link>
            <Link className="hover:underline" href="/coach-notes">
              Coach Notes
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
