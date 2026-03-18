import { Container } from "@/components/Container";
import { PromptDetailClient } from "@/components/PromptDetailClient";

export const dynamic = "force-dynamic";

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Container title="Prompt">
      <PromptDetailClient id={id} />
    </Container>
  );
}
