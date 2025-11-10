"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppContextProvider } from "@/providers/AppContext";
import { ModalsProvider } from "@mantine/modals";
import dynamic from "next/dynamic";
import MainPage from "./MainPage";

const NotificationsClient = dynamic(
  () => import("@mantine/notifications").then((m) => m.Notifications),
  { ssr: false }
);

export default function Home() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ModalsProvider >
        <NotificationsClient position="top-right" />
        <AppContextProvider>
          <MainPage/>
        </AppContextProvider>
      </ModalsProvider>
    </QueryClientProvider>
  );
}
