import CategoriesForm from "@/components/Categories/CategoriesForm";
import ModalWrapper from "@/components/Common/ModalWrapper";
import { theme } from "@/theme";
import { ActionIcon, Badge, Box, Button, Flex, Group, Image, Paper, ScrollArea, Stack, Table, Text, TextInput, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useMemo, useState } from "react";
import { FiEdit, FiPlus, FiSearch, FiTrash } from "react-icons/fi";
import { useGetAllCategories } from "@/components/Api/CategoriesApi";

type Category = {
  id: string;
  title: string;
  image?: string;
  is_active?: boolean;
  created_at?: string | number | Date;
};

export default function Categories() {
  const [addOpened, setAddOpened] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints?.sm || '768px'})`);

  const { data, isLoading, isError } = useGetAllCategories();

  const categories: Category[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as Category[];
    const maybe = data as { data?: unknown; categories?: unknown };
    if (Array.isArray(maybe.data)) return maybe.data as Category[];
    if (Array.isArray(maybe.categories)) return maybe.categories as Category[];
    return [];
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => String(c.title || "").toLowerCase().includes(q));
  }, [query, categories]);
  return (
    <Box>
      <Title mb={"md"}>Categorías</Title>

      <Flex direction={"row"} gap={"md"} align={"center"} mb="md" wrap={"wrap"}>
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Buscar categorías por título"
          leftSection={<FiSearch />}
          style={{ flex: "1 1 280px", minWidth: 260, maxWidth: 520 }}
        />
        <Button leftSection={<FiPlus />} onClick={() => setAddOpened(true)}>
          Nueva categoría
        </Button>
      </Flex>

      {isLoading && <Text>Cargando categorías...</Text>}
      {isError && <Text color="red">Error al cargar categorías</Text>}

      {isMobile ? (
        <Stack>
          {filtered.map((c) => (
            <Paper key={c.id} withBorder p="sm" radius="md">
              <Group justify="space-between" align="flex-start">
                <Group gap="sm" wrap="nowrap">
                  <Image src={c.image || ""} alt={c.title} w={64} h={64} radius="sm" fit="cover" />
                  <Box>
                    <Group gap="xs">
                      <Text fw={600} style={{ textTransform: 'capitalize' }}>{c.title}</Text>
                      {c.is_active === false && <Badge variant="light" color="gray">Inactiva</Badge>}
                    </Group>
                    {c.created_at && (
                      <Text c="dimmed">Creada: {new Date(c.created_at).toLocaleDateString()}</Text>
                    )}
                  </Box>
                </Group>
                <Group gap="xs">
                  <ActionIcon color="red" variant="light" aria-label="Eliminar">
                    <FiTrash />
                  </ActionIcon>
                  <Button size="xs" variant="light" leftSection={<FiEdit />} aria-label="Editar">
                    Editar
                  </Button>
                </Group>
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
                  <Table.Th style={{ width: 64 }}>Imagen</Table.Th>
                  <Table.Th>Título</Table.Th>
                  <Table.Th>Estado</Table.Th>
                  <Table.Th style={{ width: 160 }}>Creado</Table.Th>
                  <Table.Th style={{ width: 240 }}>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtered.map((c) => (
                  <Table.Tr key={c.id}>
                    <Table.Td>
                      <Image src={c.image || ""} alt={c.title} w={48} h={48} radius="sm" fit="cover" />
                    </Table.Td>
                    <Table.Td>
                      <Text fw={600} style={{ textTransform: 'capitalize' }}>{c.title}</Text>
                    </Table.Td>
                    <Table.Td>
                      {c.is_active === false ? (
                        <Badge variant="light" color="gray">Inactiva</Badge>
                      ) : (
                        <Badge variant="light">Activa</Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {c.created_at ? (
                        <Text c="dimmed">{new Date(c.created_at).toLocaleString()}</Text>
                      ) : (
                        <Text c="dimmed">—</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <ActionIcon color="red" variant="light" aria-label="Eliminar">
                          <FiTrash />
                        </ActionIcon>
                        <Button size="xs" variant="light" leftSection={<FiEdit />} aria-label="Editar">
                          Editar
                        </Button>

                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      )}
      <ModalWrapper opened={addOpened} onClose={() => setAddOpened(false)} title="Nueva categoría" size="lg">
        <CategoriesForm closeForm={() => setAddOpened(false)} />
      </ModalWrapper>
    </Box>
  )
}