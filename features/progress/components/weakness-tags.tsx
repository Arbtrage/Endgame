type WeaknessTagsProps = {
  tags: Array<{ tag: string; count: number }>;
};

export function WeaknessTags({ tags }: WeaknessTagsProps) {
  if (tags.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No weakness patterns yet. Analyze more games to unlock tags.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag.tag}
          className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-sm capitalize"
        >
          {tag.tag} · {tag.count}
        </span>
      ))}
    </div>
  );
}
