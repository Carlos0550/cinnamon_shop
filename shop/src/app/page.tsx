"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppContextProvider } from "@/providers/AppContext";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import MainPage from "./MainPage";

export default function Home() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ModalsProvider>
        <Notifications position="top-right" />
        <AppContextProvider>
          <MainPage/>
        </AppContextProvider>
      </ModalsProvider>
    </QueryClientProvider>
  );
}
