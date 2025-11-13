import { useDisclosure } from '@mantine/hooks';
import { AppShell, Burger, Group, Anchor, Stack, ActionIcon } from '@mantine/core';
import { Link, Outlet } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import { useMantineColorScheme } from '@mantine/core';
import { FiMoon, FiSun } from 'react-icons/fi';

export default function Layout() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const goToShop = () => {
    const environment = import.meta.env.VITE_ENV;
    if (environment === 'development') {
      window.open('http://localhost:3001', '_blank');
    } else {
      window.open('https://cinnamon-shop.up.railway.app/', '_blank');
    }
  }
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: 'lg', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header style={{ background: 'var(--mantine-color-body)' }}>
        <Group justify="space-between" px="md" h="100%">
          <Group>
            <Burger opened={opened} onClick={toggle} aria-label="Toggle navigation" hiddenFrom="lg" />
            <FiMenu size={20} style={{ display: 'none' }} />
            <Anchor component={Link} to="/" fw={700}>
              Cinnamon Admin
            </Anchor>
          </Group>
          <Group>
            <ColorSchemeToggle />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" style={{ background: 'var(--mantine-color-body)' }}>
        <Stack gap="sm" onClick={close}>
          {/* <ColorSchemeToggle /> */}
          <Anchor component={Link} to="/" onClick={goToShop}>Ir a mi tienda</Anchor>
          <Anchor component={Link} to="/">Inicio</Anchor>
          <Anchor component={Link} to="/products">Productos</Anchor>
          <Anchor component={Link} to="/categories">Categorias</Anchor>
          <Anchor component={Link} to="/sales">Ventas</Anchor>
          <Anchor component={Link} to="/users">Usuarios</Anchor>
          <Anchor component={Link} to="/promos">Promociones</Anchor>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main style={{ background: 'var(--mantine-color-body)' }}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

function ColorSchemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <ActionIcon
      variant="light"
      aria-label="Toggle color scheme"
      onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <FiSun /> : <FiMoon />}
    </ActionIcon>
  );
}