import { PlaceholderPage } from "@/shared/components/placeholder-page";
import { GraduationCap } from "lucide-react";

export default function TrainPage() {
  return (
    <PlaceholderPage
      icon={GraduationCap}
      title="Train"
      description="Personalized lessons built from your weaknesses and recent games."
      emptyTitle="Coming soon"
      emptyDescription="AI-generated training lessons arrive in a future update."
    />
  );
}
