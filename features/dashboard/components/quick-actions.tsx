import Link from "next/link";
import { BarChart3, GraduationCap, Shield, Skull } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

const actions = [
  {
    href: "/play/computer",
    title: "Vs Villain",
    description: "Engine-backed Marvel foes",
    icon: Skull,
  },
  {
    href: "/play/ai",
    title: "Vs Hero",
    description: "Random superheroes with AI banter",
    icon: Shield,
  },
  {
    href: "/play/coach",
    title: "Coach Mode",
    description: "Live explanations while you play",
    icon: GraduationCap,
  },
  {
    href: "/analyze",
    title: "Analyze",
    description: "Review games with engine insights",
    icon: BarChart3,
  },
];

export function QuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {actions.map((action) => (
        <Link key={action.href} href={action.href}>
          <Card
            size="sm"
            className="h-full border-border/60 py-3 transition-all hover:border-primary/40 hover:bg-muted/20 hover:shadow-sm"
          >
            <CardHeader className="gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <action.icon className="size-4" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-sm leading-snug">{action.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {action.description}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
