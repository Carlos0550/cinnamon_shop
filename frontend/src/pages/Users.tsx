import { useMemo, useState } from "react";
import { Badge, Box, Group, Paper, Switch, Table, Text, Title, TextInput, Stack, ScrollArea, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { FiSearch } from "react-icons/fi";

type User = {
  id: string;
  role: 1 | 2; 
  name: string;
  email: string;
  is_verified: boolean;
  active: boolean; 
};

const mockUsers: User[] = [
  { id: "u-001", role: 1, name: "Admin One", email: "admin1@cinnamon.dev", is_verified: true, active: true },
  { id: "u-002", role: 2, name: "User Two", email: "user2@cinnamon.dev", is_verified: false, active: true },
  { id: "u-003", role: 2, name: "User Three", email: "user3@cinnamon.dev", is_verified: true, active: false },
];

function roleBadge(role: 1 | 2) {
  return role === 1 ? (
    <Badge color="rose" variant="light">Admin</Badge>
  ) : (
    <Badge variant="light">Usuario</Badge>
  );
}

function verifiedBadge(verified: boolean) {
  return verified ? (
    <Badge color="kuromi" variant="light">Verificado</Badge>
  ) : (
    <Badge variant="light" color="gray">Sin verificar</Badge>
  );
}

export default function Users() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [query, setQuery] = useState("");
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const toggleAccess = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [query, users]);

  return (
    <Box>
      <Title mb="md">Usuarios</Title>

      <Group mb="md" gap="md" align="center" wrap="wrap">
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Buscar por nombre o email"
          leftSection={<FiSearch />}
          style={{ flex: "1 1 280px", minWidth: 260, maxWidth: 520 }}
        />
      </Group>

      {isMobile ? (
        <Stack>
          {filtered.map((u) => (
            <Paper key={u.id} withBorder p="sm" radius="md">
              <Group justify="space-between" align="flex-start">
                <Box>
                  <Group gap="xs">
                    <Text fw={600}>{u.name}</Text>
                    {roleBadge(u.role)}
                  </Group>
                  <Text c="dimmed">{u.email}</Text>
                </Box>
                {verifiedBadge(u.is_verified)}
              </Group>
              <Group justify="flex-end" mt="sm">
                <Switch checked={u.active} onChange={() => toggleAccess(u.id)} aria-label="Activar acceso" />
              </Group>
            </Paper>
          ))}
        </Stack>
      ) : (
        <Paper withBorder p="md" radius="md">
          <ScrollArea>
            <Table highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 120 }}>Rol</Table.Th>
                  <Table.Th>Nombre</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th style={{ width: 140 }}>Verificación</Table.Th>
                  <Table.Th style={{ width: 160 }}>Acceso</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtered.map((u) => (
                  <Table.Tr key={u.id}>
                    <Table.Td>{roleBadge(u.role)}</Table.Td>
                    <Table.Td>
                      <Text fw={600}>{u.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text c="dimmed">{u.email}</Text>
                    </Table.Td>
                    <Table.Td>{verifiedBadge(u.is_verified)}</Table.Td>
                    <Table.Td>
                      <Group justify="flex-end">
                        <Switch checked={u.active} onChange={() => toggleAccess(u.id)} aria-label="Activar acceso" />
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      )}
    </Box>
  );
}