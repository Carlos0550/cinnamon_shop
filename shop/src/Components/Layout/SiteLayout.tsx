"use client";
import { useAppContext } from "@/providers/AppContext";
import { AppShell, Burger, Group, Anchor, Stack, Flex, Text, Avatar, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import LoginForm from "../Auth/LoginForm";
import AuthModal from "../Modals/AuthModal/AuthModal";
import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
type Props = {
  children: React.ReactNode;
};

export default function SiteLayout({ children }: Props) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [authOpened, { open: openAuth, close: closeAuth }] = useDisclosure(false);
  const { auth } = useAppContext();
  const fullName = auth.state.user?.name || "";
  const email = auth.state.user?.email || "";
  const { user: clerkUser } = useUser();
  const { isSignedIn: clerkSignedIn } = useClerkAuth();
  const clerkFullName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || clerkUser?.username || clerkUser?.primaryEmailAddress?.emailAddress || '';
  const clerkEmail = clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.emailAddresses?.[0]?.emailAddress || '';
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
                      {clerkUser && (
                        <Group align="center" gap="sm">
                          <Avatar src={clerkUser?.imageUrl} alt={clerkFullName} radius="xl" />
                          <Text size="sm" c="dimmed">{clerkFullName || clerkEmail || "Usuario"}</Text>
                        </Group>
                      )}
                      {clerkSignedIn ? (
                        <Button variant="light" size="xs" onClick={auth.signOut}>Salir</Button>
                      ) : (
                        <Button onClick={openAuth}>Iniciar sesión</Button>
                      )}
                    </Group>
                  )}
                </Stack>
              </Flex>
            ) : (
              auth.isAuthenticated ? (
                <Group align="center" gap="sm">
                  <Avatar src={auth.state.user?.profileImage} alt={fullName} radius="xl" />
                  <Text size="sm" c="dimmed">{fullName || email || "Usuario"}</Text>
                </Group>
              ) : (
                <Group align="center" gap="sm">
                  {clerkUser && (
                    <>
                      <Avatar src={clerkUser?.imageUrl} alt={clerkFullName} radius="xl" />
                      <Text size="sm" c="dimmed">{clerkFullName || clerkEmail || "Usuario"}</Text>
                    </>
                  )}
                  {clerkSignedIn ? (
                    <Button size="xs" variant="light" onClick={auth.signOut}>Salir</Button>
                  ) : (
                    <Button size="xs" onClick={openAuth}>Iniciar sesión</Button>
                  )}
                </Group>
              )
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" style={{ background: "var(--mantine-color-body)" }}>
        <Stack gap="sm" onClick={close}>
          <Anchor component={Link} href={"/"}>Inicio</Anchor>
          <Anchor component={Link} href={"/account"}>Mi cuenta</Anchor>
          <Anchor component={Link} href={"/orders"}>Mis ordenes</Anchor>
          <Anchor component={Link} href={"/faq"}>FAQ</Anchor>

        </Stack>
      </AppShell.Navbar>

      <AppShell.Main style={{ background: "var(--mantine-color-body)" }}>
        {children}
      </AppShell.Main>
      <AuthModal opened={authOpened} onClose={closeAuth}>
        <LoginForm onClose={closeAuth} />
      </AuthModal>
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
