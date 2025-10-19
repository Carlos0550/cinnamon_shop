import { theme } from '@/theme';
import { Box, Flex, Paper, TextInput, Loader, Text, Button, ActionIcon, Badge, Group, Image, ScrollArea, Stack, Table } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit, FiTrash, FiEye } from 'react-icons/fi';
import { useGetAllProducts, type GetProductsParams, type Product } from '@/components/Api/ProductsApi';
import ModalWrapper from '@/components/Common/ModalWrapper';

function ProductTable({
    setAddOpened
}: {
    setAddOpened: (opened: boolean) => void;
}) {
  const [search, setSearch] = useState<string>("");
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints?.sm || '768px'})`);

  const [viewOpened, setViewOpened] = useState<boolean>(false);
  const [selected, setSelected] = useState<Product | null>(null);

  const [searchParams, setSearchParams] = useState<GetProductsParams>({
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    setSearchParams(prev => {
      const next = { ...prev };
      if (search.trim()) {
        next.title = search.trim();
      } else {
        delete next.title;
      }
      return next;
    });
  }, [search]);

  const { data, isLoading, isError } = useGetAllProducts(searchParams);
  const products: Product[] = data?.products ?? [];
  const pagination = data?.pagination;

  return (
    <Box>
      <Flex gap={"md"} align="center" mb="md" wrap="wrap">
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto por nombre"
          leftSection={<FiSearch />}
          style={{ flex: "1 1 280px", minWidth: 260, maxWidth: 520 }}
        />
        <Button leftSection={<FiPlus />} onClick={() => setAddOpened(true)}>
          Añadir producto
        </Button>
      </Flex>

      {isLoading ? (
        <Flex justify="center" align="center" h={200}>
          <Loader />
        </Flex>
      ) : isError ? (
        <Text color="red" ta="center">Error al cargar los productos</Text>
      ) : products.length === 0 ? (
        <Text ta="center">No se encontraron productos</Text>
      ) : isMobile ? (
        <Stack>
          {products.map((p) => (
            <Paper key={p.id} withBorder p="sm" radius="md">
              <Group justify="space-between" align="flex-start">
                <Group gap="sm" wrap="nowrap">
                  <Image src={p.images?.[0] || ""} alt={p.title} w={64} h={64} radius="sm" fit="cover" />
                  <Box>
                    <Group gap="xs">
                      <Text fw={600} style={{ textTransform: 'capitalize' }}>{p.title}</Text>
                      {p.active === false && <Badge variant="light" color="gray">Inactivo</Badge>}
                    </Group>
                    <Text c="dimmed">{typeof p.price === 'number' ? `Precio: $${p.price}` : "Precio: —"}</Text>
                  </Box>
                </Group>
                <Group gap="xs">
                  <ActionIcon variant="light" aria-label="Ver" onClick={() => { setSelected(p); setViewOpened(true); }}>
                    <FiEye />
                  </ActionIcon>
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
                  <Table.Th style={{ width: 120 }}>Precio</Table.Th>
                  <Table.Th>Estado</Table.Th>
                  <Table.Th style={{ width: 160 }}>Creado</Table.Th>
                  <Table.Th style={{ width: 240 }}>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {products.map((p) => (
                  <Table.Tr key={p.id}>
                    <Table.Td>
                      <Image src={p.images?.[0] || ""} alt={p.title} w={48} h={48} radius="sm" fit="cover" />
                    </Table.Td>
                    <Table.Td>
                      <Text fw={600} style={{ textTransform: 'capitalize' }}>{p.title}</Text>
                    </Table.Td>
                    <Table.Td>
                      {typeof p.price === 'number' ? `$${p.price}` : '—'}
                    </Table.Td>
                    <Table.Td>
                      {p.active === false ? (
                        <Badge variant="light" color="gray">Inactivo</Badge>
                      ) : (
                        <Badge variant="light">Activo</Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {p.created_at ? (
                        <Text c="dimmed">{new Date(p.created_at).toLocaleString()}</Text>
                      ) : (
                        <Text c="dimmed">—</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <ActionIcon variant="light" aria-label="Ver" onClick={() => { setSelected(p); setViewOpened(true); }}>
                          <FiEye />
                        </ActionIcon>
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

      {pagination && (
        <Flex justify="center" mt="md" gap="md">
          <Text>
            Página {pagination.currentPage} de {pagination.totalPages} ({pagination.totalItems} productos)
          </Text>
        </Flex>
      )}
      <ModalWrapper opened={viewOpened} onClose={() => setViewOpened(false)} title={selected ? selected.title : 'Ver producto'} size="md">
        {selected && (
          <Stack>
            <Group align="flex-start" gap="md" wrap="nowrap">
              <Image src={selected.images?.[0] || ''} alt={selected.title} w={128} h={128} radius="md" fit="cover" />
              <Box>
                <Group gap="xs">
                  <Text fw={700} size="lg">{selected.title}</Text>
                  {selected.active === false ? (
                    <Badge variant="light" color="gray">Inactivo</Badge>
                  ) : (
                    <Badge variant="light">Activo</Badge>
                  )}
                </Group>
                <Text c="dimmed">Precio: {typeof selected.price === 'number' ? `$${selected.price}` : '—'}</Text>
                <Text c="dimmed">Categoría: {selected.category?.title || '—'}</Text>
              </Box>
            </Group>
            {selected.description && (
              <Box>
                <Text fw={600}>Descripción</Text>
                <Text>{selected.description}</Text>
              </Box>
            )}
            {Array.isArray(selected.images) && selected.images.length > 1 && (
              <Stack>
                <Text fw={600}>Imágenes</Text>
                <Group gap="xs">
                  {selected.images.map((url, idx) => (
                    <Image key={`${url}-${idx}`} src={url} alt={`Imagen ${idx + 1}`} w={72} h={72} radius="sm" fit="cover" />
                  ))}
                </Group>
              </Stack>
            )}
          </Stack>
        )}
      </ModalWrapper>
    </Box>
  );
}

export default ProductTable;