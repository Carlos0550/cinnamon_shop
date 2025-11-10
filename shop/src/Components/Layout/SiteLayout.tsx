"use client";
import { AppShell, Burger, Group, Anchor, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
};

export default function SiteLayout({ children }: Props) {
  const [opened, { toggle, close }] = useDisclosure(false);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 240, breakpoint: "lg", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header style={{ background: "var(--mantine-color-body)" }}>
        <Group justify="space-between" px="md" h="100%">
          <Group>
            <Burger opened={opened} onClick={toggle} aria-label="Toggle navigation" hiddenFrom="lg" />
            <Anchor component={Link} onClick={() => window.location.reload()} href="/" fw={700}>
              Cinnamon Shop
            </Anchor>
          </Group>
          {/* <Group>
            <ColorSchemeToggle />
          </Group> */}
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" style={{ background: "var(--mantine-color-body)" }}>
        <Stack gap="sm" onClick={close}>
          <Anchor component={Link} onClick={() => window.location.reload()} href={"/"}>Inicio</Anchor>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main style={{ background: "var(--mantine-color-body)" }}>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}

// function ColorSchemeToggle() {
//   const { colorScheme, setColorScheme } = useMantineColorScheme();
//   const isDark = colorScheme === "dark";
//   return (
//     <ActionIcon
//       variant="light"
//       aria-label="Toggle color scheme"
//       onClick={() => setColorScheme(isDark ? "light" : "dark")}
//       title={isDark ? "Cambiar a claro" : "Cambiar a oscuro"}
//     >
//       <span style={{ fontSize: 18 }}>{isDark ? "☀️" : "🌙"}</span>
//     </ActionIcon>
//   );
// }