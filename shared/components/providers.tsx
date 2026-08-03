"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/shared/api/query-client";
import { Toaster } from "@/shared/ui/sonner";

function ResponsiveToaster() {
  const [position, setPosition] = useState<"top-right" | "bottom-center">(
    "top-right",
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => {
      setPosition(mq.matches ? "bottom-center" : "top-right");
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return <Toaster richColors closeButton position={position} />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ResponsiveToaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
