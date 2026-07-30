import { EmptyState } from "@/shared/components/empty-state";
import { PageHeader } from "@/shared/components/page-header";

export default function ProgressPage() {
  return (
    <div>
      <PageHeader title="Progress" description="Track accuracy, streaks, and weekly reports." />
      <EmptyState
        title="Coming in Phase 5"
        description="Progress charts and weekly AI reports arrive in Phase 5."
      />
    </div>
  );
}
