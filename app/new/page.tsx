import { Container } from "@/components/Container";
import { JournalJsonForm } from "@/components/JournalJsonForm";

export default function NewSessionPage() {
  return (
    <Container title="New session (paste JSON)">
      <JournalJsonForm />
    </Container>
  );
}
