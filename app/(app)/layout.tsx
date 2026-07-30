import { redirect } from "next/navigation";
import { AppShell } from "@/shared/components/app-shell";
import { getServerSession } from "@/shared/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="h-dvh overflow-hidden">
      <AppShell>{children}</AppShell>
    </div>
  );
}
