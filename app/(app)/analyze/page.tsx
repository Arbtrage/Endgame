import { EmptyState } from "@/shared/components/empty-state";
import { PageHeader } from "@/shared/components/page-header";

export default function AnalyzePage() {
  return (
    <div>
      <PageHeader title="Analyze" description="Review games with engine-backed insights." />
      <EmptyState
        title="Coming in Phase 4"
        description="Game analysis and evaluation graphs arrive in Phase 4."
      />
    </div>
  );
}
