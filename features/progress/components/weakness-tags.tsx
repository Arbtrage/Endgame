import Link from "next/link";
import { Target } from "lucide-react";
import { InlineEmpty } from "@/shared/components/inline-empty";

type WeaknessTagsProps = {
  tags: Array<{ tag: string; count: number }>;
};

export function WeaknessTags({ tags }: WeaknessTagsProps) {
  if (tags.length === 0) {
    return (
      <InlineEmpty
        icon={<Target className="size-4" />}
        title="No patterns detected yet"
        description="Analyze a few more games and we'll tag recurring mistakes here."
        action={
          <Link href="/train" className="text-xs font-medium text-primary hover:underline">
            Browse training →
          </Link>
        }
        className="py-6"
      />
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag.tag}
          className="rounded-lg border border-border/50 bg-muted/20 px-3 py-1.5 text-sm capitalize"
        >
          {tag.tag} · {tag.count}
        </span>
      ))}
    </div>
  );
}
