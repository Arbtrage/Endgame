import { EmptyState } from "@/shared/components/empty-state";
import { PageHeader } from "@/shared/components/page-header";

export default function TrainPage() {
  return (
    <div>
      <PageHeader title="Train" description="Personalized lessons from your weaknesses." />
      <EmptyState
        title="Coming in Phase 4"
        description="AI-generated training lessons arrive in Phase 4."
      />
    </div>
  );
}
