"use client";

import { MantineProvider, localStorageColorSchemeManager } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import ActivePaletteProvider from "./ActivePaletteProvider";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AppContextProvider } from "./AppContext";

type Props = {
  children: React.ReactNode;
};

export default function AppProvider({ children }: Props) {
  const colorSchemeManager = localStorageColorSchemeManager({ key: "mantine-color-scheme" });
  const [queryClient] = useState(() => new QueryClient());

  return (
    <MantineProvider defaultColorScheme="light" colorSchemeManager={colorSchemeManager}>
      <ActivePaletteProvider>
        <QueryClientProvider client={queryClient}>
          <Notifications position="top-right" />
          <AppContextProvider>
            {children}
          </AppContextProvider>
        </QueryClientProvider>
      </ActivePaletteProvider>
    </MantineProvider>
  );
}
