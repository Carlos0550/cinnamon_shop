"use client";
import { Categories, useCategories } from "@/Api/useCategories";
import { useAppContext } from "@/providers/AppContext";
import { AppShell, Burger, Group, Anchor, Stack, ActionIcon, Input, Flex, MultiSelect } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";
type Props = {
  children: React.ReactNode;
};

export default function SiteLayout({ children }: Props) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const {
    utils: {
      isMobile,
      capitalizeTexts
    }
  } = useAppContext()

  const {
    data: categoriesData,
  } = useCategories()

  const categories: Categories[] = categoriesData?.data ?? []
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
              <Anchor component={Link} onClick={() => window.location.reload()} href="/" fw={700}>
                Cinnamon
              </Anchor>
              <ActionIcon>
                <FaShoppingCart />
              </ActionIcon>
            </Flex>
            ) : (
              <Anchor component={Link} onClick={() => window.location.reload()} href="/" fw={700}>
                Cinnamon
              </Anchor>
            )}
          </Group>
          {/* <Group>
            <ColorSchemeToggle />
          </Group> */}
          {!isMobile ? (
            <Flex
              align="center"
              justify="flex-end"
              gap={10}
            >
              <Flex gap={10} align={"center"} justify={"center"}>
                <Input mb={10} placeholder="Buscar" w={300} />
                <MultiSelect mb={10} placeholder="Categorías" w={"auto"} data={categories.map((category) => ({
                  value: category.id,
                  label: capitalizeTexts(category.title),
                }))} />

              </Flex>
            </Flex>
          ) : (
            <ActionIcon>
              <FaShoppingCart />
            </ActionIcon>
          )}
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