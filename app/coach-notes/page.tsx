import { Container } from "@/components/Container";
import { CoachNotesClient } from "@/components/CoachNotesClient";

export const dynamic = "force-dynamic";

export default function CoachNotesPage() {
  return (
    <Container title="Coach Notes">
      <CoachNotesClient />
    </Container>
  );
}
