import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { Sparkle } from "@phosphor-icons/react";
import { EmptyState } from "@/shared/components/empty-state";
import {
  FeatureHero,
  FeaturePage,
  FeaturePanel,
} from "@/shared/components/feature-page";

type PlaceholderPageProps = {
  icon?: PhosphorIcon;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
};

export function PlaceholderPage({
  icon: Icon = Sparkle,
  title,
  description,
  emptyTitle,
  emptyDescription,
}: PlaceholderPageProps) {
  return (
    <FeaturePage className="max-w-4xl">
      <FeatureHero icon={Icon} title={title} description={description} />
      <FeaturePanel bodyClassName="flex flex-1 items-center justify-center p-6 sm:p-8">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          className="max-w-md border-0 bg-transparent py-6"
        />
      </FeaturePanel>
    </FeaturePage>
  );
}
