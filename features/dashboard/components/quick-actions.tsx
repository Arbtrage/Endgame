import {
  ChartLineUp,
  GraduationCap,
  Shield,
  Skull,
} from "@phosphor-icons/react";
import {
  ActionCard,
  ActionCardGrid,
} from "@/shared/components/action-card";

const actions = [
  {
    href: "/play/computer",
    title: "Vs villain",
    description: "Engine-backed foes with adjustable strength",
    icon: Skull,
  },
  {
    href: "/play/ai",
    title: "Vs hero",
    description: "Superhero personalities with AI banter",
    icon: Shield,
  },
  {
    href: "/play/coach",
    title: "Coach mode",
    description: "Live explanations while you play",
    icon: GraduationCap,
  },
  {
    href: "/analyze",
    title: "Analyze",
    description: "Review games with engine insights",
    icon: ChartLineUp,
  },
];

export function QuickActions() {
  return (
    <ActionCardGrid>
      {actions.map((action) => (
        <ActionCard key={action.href} {...action} />
      ))}
    </ActionCardGrid>
  );
}
