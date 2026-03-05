"use client";

import { StoreProvider } from "@/lib/store";
import { ThemeProvider } from "@/lib/theme";
import { ReactNode } from "react";

export function StoreProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <StoreProvider>{children}</StoreProvider>
    </ThemeProvider>
  );
}
