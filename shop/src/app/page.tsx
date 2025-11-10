"use client";

import { ModalsProvider } from "@mantine/modals";
import dynamic from "next/dynamic";
import MainPage from "./MainPage";

const NotificationsClient = dynamic(
  () => import("@mantine/notifications").then((m) => m.Notifications),
  { ssr: false }
);

export default function Home() {
  return (
    <ModalsProvider>
      <NotificationsClient position="top-right" />
      <MainPage />
    </ModalsProvider>
  );
}
