import { PvpChallengeSetup } from "@/features/pvp/components/pvp-challenge-setup";

export default function PvpPlayPage() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <PvpChallengeSetup />
      </div>
    </div>
  );
}
