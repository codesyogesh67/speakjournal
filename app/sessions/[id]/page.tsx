import { Container } from "@/components/Container";
import { prisma } from "@/lib/prisma";
import { SessionView } from "@/components/SessionView";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await prisma.session.findUnique({
    where: { id },
  });

  if (!session) {
    return (
      <Container title="Session not found">
        <div className="rounded-xl border bg-white p-4">No session.</div>
      </Container>
    );
  }

  return (
    <Container title="Session">
      <SessionView
        session={{ ...session, createdAt: session.createdAt.toISOString() }}
      />
    </Container>
  );
}
