import Link from "next/link";
import { BarChart3, GraduationCap, Swords } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

const actions = [
  {
    href: "/play/computer",
    title: "Play",
    description: "Face a random Marvel villain at your level",
    icon: Swords,
  },
  {
    href: "/analyze",
    title: "Analyze",
    description: "Review games with engine insights",
    icon: BarChart3,
  },
  {
    href: "/train",
    title: "Train",
    description: "Personalized lessons from your weaknesses",
    icon: GraduationCap,
  },
];

export function QuickActions() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {actions.map((action) => (
        <Link key={action.href} href={action.href}>
          <Card className="h-full transition-colors hover:border-primary/40 hover:bg-card/80">
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <action.icon className="size-5" />
              </div>
              <CardTitle>{action.title}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        </Link>
      ))}
    </div>
  );
}
