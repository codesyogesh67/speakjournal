import { Container } from "@/components/Container";
import { CoachNoteDetailClient } from "@/components/CoachNoteDetailClient";

export const dynamic = "force-dynamic";

export default async function CoachNoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Container title="Coach Note">
      <CoachNoteDetailClient id={id} />
    </Container>
  );
}
