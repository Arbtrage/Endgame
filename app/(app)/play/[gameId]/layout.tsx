export default function ActiveGameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100dvh-3rem)] max-h-[calc(100dvh-3rem)] flex-col overflow-hidden max-lg:h-[calc(100dvh-7rem)] max-lg:max-h-[calc(100dvh-7rem)]">
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
