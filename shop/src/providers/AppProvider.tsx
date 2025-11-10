"use client";

import { MantineProvider, localStorageColorSchemeManager } from "@mantine/core";
import { theme } from "../theme";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css"

type Props = {
  children: React.ReactNode;
};

export default function AppProvider({ children }: Props) {
  const colorSchemeManager = localStorageColorSchemeManager({ key: "mantine-color-scheme" });

  return (
    <MantineProvider theme={theme} defaultColorScheme="light" colorSchemeManager={colorSchemeManager}>
      {children}
    </MantineProvider>
  );
}