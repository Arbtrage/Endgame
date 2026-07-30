import { PlaceholderPage } from "@/shared/components/placeholder-page";
import { BarChart3 } from "lucide-react";

export default function AnalyzePage() {
  return (
    <PlaceholderPage
      icon={BarChart3}
      title="Analyze"
      description="Review games with engine-backed insights and evaluation graphs."
      emptyTitle="Coming soon"
      emptyDescription="Game analysis and evaluation graphs arrive in a future update."
    />
  );
}
