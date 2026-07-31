import { PvpInviteLanding } from "@/features/pvp/components/pvp-invite-landing";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function PvpInviteTokenPage({ params }: PageProps) {
  const { token } = await params;
  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <PvpInviteLanding token={token} />
    </div>
  );
}
