"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppContextProvider } from "@/providers/AppContext";
import { ColorSchemeScript, MantineProvider, useMantineColorScheme } from "@mantine/core";

import { theme } from "@/theme"
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import MainPage from "./MainPage";
function PrimaryColorProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useMantineColorScheme();
  return (
    <MantineProvider theme={{ ...theme, primaryColor: colorScheme === 'dark' ? 'rose' : 'rose' }}>
      {children}
    </MantineProvider>
  );
}
export default function Home() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ColorSchemeScript defaultColorScheme="auto" />
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <PrimaryColorProvider>
          <ModalsProvider>
            <Notifications position="top-right" />
            <AppContextProvider>
              <MainPage/>
            </AppContextProvider>
          </ModalsProvider>
        </PrimaryColorProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}
