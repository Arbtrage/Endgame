import { Skeleton } from "@/shared/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-4 p-4 lg:p-6">
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}
