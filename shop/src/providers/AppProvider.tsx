"use client";

import { MantineProvider, localStorageColorSchemeManager } from "@mantine/core";
import { theme } from "../theme";
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
    <MantineProvider theme={theme} defaultColorScheme="light" colorSchemeManager={colorSchemeManager}>
      <QueryClientProvider client={queryClient}>
        <AppContextProvider>
          {children}
        </AppContextProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}