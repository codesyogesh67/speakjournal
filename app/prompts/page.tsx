import { Container } from "@/components/Container";
import { PromptListClient } from "@/components/PromptListClient";

export const dynamic = "force-dynamic";

export default function PromptsPage() {
  return (
    <Container title="Prompts">
      <PromptListClient />
    </Container>
  );
}
