import { PlaceholderPage } from "@/shared/components/placeholder-page";
import { TrendingUp } from "lucide-react";

export default function ProgressPage() {
  return (
    <PlaceholderPage
      icon={TrendingUp}
      title="Progress"
      description="Track accuracy, streaks, and weekly reports as you improve."
      emptyTitle="Coming soon"
      emptyDescription="Progress charts and weekly AI reports arrive in a future update."
    />
  );
}
