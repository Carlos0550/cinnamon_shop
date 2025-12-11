"use client";
import { useAppContext } from "@/providers/AppContext";
import { AppShell, Burger, Group, Anchor, Stack, Flex, Text, Avatar, Button, useMantineColorScheme, ActionIcon, Box } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import LoginForm from "../Auth/LoginForm";
import AuthModal from "../Modals/AuthModal/AuthModal";
type Props = {
  children: React.ReactNode;
};

export default function SiteLayout({ children }: Props) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [authOpened, { open: openAuth, close: closeAuth }] = useDisclosure(false);
  const { auth } = useAppContext();
  const fullName = auth.state.user?.name || "";
  const email = auth.state.user?.email || "";
  const {
    utils: {
      isMobile,
    }
  } = useAppContext()

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
            {!isMobile ? (
              <Flex align={"center"} justify={"flex-start"} gap={10}>
                <Stack p="md">
                  {auth.isAuthenticated ? (
                    <Group align="center" gap="md">
                      <Avatar src={auth.state.user?.profileImage} alt={fullName} radius="xl" />
                      <Text size="sm" c="dimmed">{fullName || email || "Usuario"}</Text>
                      <Button variant="light" size="xs" onClick={auth.signOut}>Salir</Button>
                    </Group>
                  ) : (
                    <Group align="center" gap="md">
                      <Button onClick={openAuth}>Iniciar sesión</Button>
                    </Group>
                  )}
                </Stack>
              </Flex>
            ) : (
              auth.isAuthenticated ? (
                <Group align="center" gap="sm">
                  <Avatar src={auth.state.user?.profileImage} alt={fullName} radius="xl" />
                  <Text size="sm" c="dimmed">{fullName || email || "Usuario"}</Text>
                  <Button variant="light" size="xs" onClick={auth.signOut}>Salir</Button>
                </Group>
              ) : (
                <Group align="center" gap="sm">
                  <Button size="xs" onClick={openAuth}>Iniciar sesión</Button>
                </Group>
              )
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" style={{ background: "var(--mantine-color-body)" }}>
        <Box mb="md">
          <ColorSchemeToggle />
        </Box>
        <Stack gap="sm" onClick={close}>
          <Anchor component={Link} href={"/"}>Inicio</Anchor>
          <Anchor component={Link} href={"/account"}>Mi cuenta</Anchor>
          <Anchor component={Link} href={"/orders"}>Mis ordenes</Anchor>
          <Anchor component={Link} href={"/faq"}>FAQ</Anchor>

        </Stack>
      </AppShell.Navbar>

      <AppShell.Main bg="var(--mantine-color-body)">
        {children}
      </AppShell.Main>
      <AuthModal opened={authOpened} onClose={closeAuth}>
        <LoginForm onClose={closeAuth} />
      </AuthModal>
    </AppShell>
  );
}

function ColorSchemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <ActionIcon
      variant="light"
      aria-label="Toggle color scheme"
      onClick={() => setColorScheme(isDark ? "light" : "dark")}
      title={isDark ? "Cambiar a claro" : "Cambiar a oscuro"}
    >
      <span style={{ fontSize: 18 }}>{isDark ? "☀️" : "🌙"}</span>
    </ActionIcon>
  );
}
