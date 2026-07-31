import { Skeleton } from "@/shared/ui/skeleton";
import { ViewportPage, ViewportPageSection } from "@/shared/components/viewport-page";

export default function DashboardLoading() {
  return (
    <ViewportPage className="gap-4">
      <ViewportPageSection>
        <Skeleton className="h-24 w-full rounded-xl" />
      </ViewportPageSection>
      <ViewportPageSection>
        <Skeleton className="h-32 w-full rounded-xl" />
      </ViewportPageSection>
    </ViewportPage>
  );
}
