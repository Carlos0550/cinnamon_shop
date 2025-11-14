"use client";

import { ModalsProvider } from "@mantine/modals";
import dynamic from "next/dynamic";
import HomeComponent from "@/Components/Home/Home"

const NotificationsClient = dynamic(
  () => import("@mantine/notifications").then((m) => m.Notifications),
  { ssr: false }
);

function MainPage() {
  return <HomeComponent />
}

export default function Home() {
  return (
    <ModalsProvider>
      <NotificationsClient position="top-right" />
      <MainPage />
    </ModalsProvider>
  );
}
