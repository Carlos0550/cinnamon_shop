import { useDisclosure } from '@mantine/hooks';
import { AppShell, Burger, Group, Anchor, Stack, ActionIcon, Button, PasswordInput, Text } from '@mantine/core';
import { Link, Outlet } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import { useMantineColorScheme } from '@mantine/core';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useAppContext } from '@/Context/AppContext';
import ModalWrapper from '@/components/Common/ModalWrapper';
import { useState } from 'react';

export default function Layout() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const { auth } = useAppContext();
  const [changeOpened, setChangeOpened] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNew, setConfirmNew] = useState('');
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const goToShop = () => {
    const environment = import.meta.env.VITE_ENV;
    if (environment === 'development') {
      window.open('http://localhost:3001', '_blank');
    } else {
      window.open('https://cinnamon-makeup.com/', '_blank');
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
            <Button variant="light" size="xs" onClick={() => setChangeOpened(true)}>Cambiar contraseña</Button>
            <Button variant="light" size="xs" onClick={() => auth.logout(false)}>Cerrar sesión</Button>
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
          <Anchor component={Link} to="/faq">FAQ</Anchor>
          
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main style={{ background: 'var(--mantine-color-body)' }}>
        <Outlet />
      </AppShell.Main>
      <ModalWrapper opened={changeOpened} onClose={() => setChangeOpened(false)} title="Cambiar contraseña" size="sm">
        <Stack>
          <PasswordInput label="Contraseña actual" value={oldPass} onChange={(e) => setOldPass((e.target as HTMLInputElement).value)} />
          <PasswordInput label="Nueva contraseña" value={newPass} onChange={(e) => setNewPass((e.target as HTMLInputElement).value)} />
          <PasswordInput label="Confirmar nueva" value={confirmNew} onChange={(e) => setConfirmNew((e.target as HTMLInputElement).value)} />
          {error && <Text c="red">{error}</Text>}
          <Group justify="space-between">
            <Button variant="light" onClick={() => setChangeOpened(false)}>Cancelar</Button>
            <Button onClick={async () => {
              setError(null);
              if (!oldPass || !newPass || !confirmNew) { setError('Completa todos los campos'); return; }
              if (newPass !== confirmNew) { setError('La nueva contraseña no coincide'); return; }
              setChanging(true);
              try {
                const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'}/admin/password/change`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
                  body: JSON.stringify({ old_password: oldPass, new_password: newPass })
                });
                if (!res.ok) {
                  const err = await res.json().catch(() => ({} as any));
                  throw new Error(err?.error || 'change_failed');
                }
                setOldPass(''); setNewPass(''); setConfirmNew(''); setChangeOpened(false);
              } catch (e) {
                const er = e as Error; setError(er.message || 'Error al cambiar contraseña');
              } finally { setChanging(false); }
            }} loading={changing}>Actualizar</Button>
          </Group>
        </Stack>
      </ModalWrapper>
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
