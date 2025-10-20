import { theme } from '@/theme';
import { Box, Flex, Paper, TextInput, Loader, Text, Button, ActionIcon, Badge, Group, Image, ScrollArea, Stack, Table, Select } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit, FiTrash, FiEye } from 'react-icons/fi';
import { deleteProduct, useGetAllProducts, type GetProductsParams, type Product, type ProductState } from '@/components/Api/ProductsApi';
import ModalWrapper from '@/components/Common/ModalWrapper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showNotification } from '@mantine/notifications';
import dummyImage from '@/assets/dummy_image.png';
import ProductForm from './ProductForm';


function ProductTable({
  setAddOpened
}: {
  setAddOpened: (opened: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState<string>("");
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints?.sm || '768px'})`);

  const [viewOpened, setViewOpened] = useState<boolean>(false);
  const [selected, setSelected] = useState<Product | null>(null);

  const [searchParams, setSearchParams] = useState<GetProductsParams>({
    page: 1,
    limit: 10,
    state: 'active',
    sortBy: 'title',
    sortOrder: 'asc',
    isActive: undefined,
    categoryId: undefined,
  });

  const [editing, setEditing] = useState<Product | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setSearchParams(prev => ({
      ...prev,
      page: currentPage,
    }));
  }, [currentPage]);

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
  console.log(data)
  const products: Product[] = data?.products ?? [];
  const pagination = data?.pagination;

  const deleteImage = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSearchParams(prev => ({ ...prev }));
      showNotification({
        message: 'Producto eliminado con éxito',
        color: 'green',
        autoClose: 3000,
      });
    },
    onError: (error: Error) => {
      showNotification({
        message: error.message || 'Error al eliminar el producto',
        color: 'red',
        autoClose: 3000,
      });
    },
  })

  const renderBadgeByState = (state: ProductState) => {
    switch (state) {
      case 'active':
        return <Badge variant="light" color="green">Activo</Badge>;
      case 'inactive':
        return <Badge variant="light" color="gray">Inactivo</Badge>;
      case 'draft':
        return <Badge variant="light" color="orange">Borrador</Badge>;
      case 'out_stock':
        return <Badge variant="light" color="red">Agotado</Badge>;
      case 'discontinued':
        return <Badge variant="light" color="yellow">Obsoleto</Badge>;
      case 'archived':
        return <Badge variant="light" color="blue">Archivado</Badge>;
      case 'deleted':
        return <Badge variant="light" color="red">Eliminado</Badge>;
      default:
        return null;
    }
  }
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

        <Select
          value={String(searchParams.limit)}
          onChange={(value) => setSearchParams(prev => ({ ...prev, limit: Number(value) }))}
          
          data={[
            { value: '5', label: '5 por página' },
            { value: '10', label: '10 por página' },
            { value: "20", label: '20 por página' },
            { value: "50", label: '50 por página' },
          ]}
        />

        <Select
          value={String(searchParams.state)}
          onChange={(value) => setSearchParams(prev => ({ ...prev, state: value as ProductState }))}
          data={[
            { value: 'active', label: 'Activo' },
            { value: 'inactive', label: 'Inactivo' },
            { value: 'draft', label: 'Borrador' },
            { value: 'out_stock', label: 'Agotado' },
            { value: 'discontinued', label: 'Obsoleto' },
            { value: 'archived', label: 'Archivado' },
            { value: 'deleted', label: 'Eliminado' },
          ]}
        />

        <Select
          value={searchParams.sortBy || 'title'}
          onChange={(value) => setSearchParams(prev => ({ ...prev, sortBy: value || undefined }))}
          data={[
            { value: 'title', label: 'Nombre' },
            { value: 'price', label: 'Precio' },
            { value: 'created_at', label: 'Fecha de creación' },
          ]}
        />

        <Select
          value={searchParams.sortOrder || 'asc'}
          onChange={(value) => setSearchParams(prev => ({ ...prev, sortOrder: value as "asc" | "desc" }))}
          data={[
            { value: 'asc', label: 'Ascendente' },
            { value: 'desc', label: 'Descendente' },
          ]}
        />
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
                  <Image src={p.images?.[0] || dummyImage} alt={p.title} w={64} h={64} radius="sm" fit="cover" />
                  <Box>
                    <Group gap="xs">
                      {renderBadgeByState(p.state)}
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
                  <Button size="xs" variant="light" leftSection={<FiEdit />} aria-label="Editar"
                    onClick={() => { setEditing(p); setViewOpened(true); }}
                  >
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
                      <Image src={p.images?.[0] || dummyImage} alt={p.title} w={48} h={48} radius="sm" fit="cover" />
                    </Table.Td>
                    <Table.Td>
                      <Text fw={600} style={{ textTransform: 'capitalize' }}>{p.title}</Text>
                    </Table.Td>
                    <Table.Td>
                      {typeof p.price === 'number' ? `$${p.price}` : '—'}
                    </Table.Td>
                    <Table.Td>
                      
                      {renderBadgeByState(p.state)}
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
                        <ActionIcon color="red" variant="light" aria-label="Eliminar" onClick={() => deleteImage.mutate(p.id)}>
                          <FiTrash />
                        </ActionIcon>
                         <Button size="xs" variant="light" leftSection={<FiEdit />} aria-label="Editar"
                          onClick={() => { setEditing(p); setViewOpened(true); }}
                        >
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
            Página {pagination.page} de {pagination.totalPages} ({pagination.total} productos)
          </Text>
          <Group gap="xs">
            <Button
              onClick={() => {
                if (pagination.hasPrevPage) {
                  setCurrentPage(pagination.page - 1);
                }
              }}
              disabled={!pagination.hasPrevPage}
            >
              Anterior
            </Button>
            <Button
              onClick={() => {
                if (pagination.hasNextPage) {
                  setCurrentPage(pagination.page + 1);
                }
              }}
              disabled={!pagination.hasNextPage}
            >
              Siguiente
            </Button>
          </Group>
        </Flex>
      )}
      <ModalWrapper opened={viewOpened} onClose={() => { setViewOpened(false); setEditing(null); }} title={selected ? selected.title : 'Ver producto'} size="md">
        {selected && (
          <Stack>
            <Group align="flex-start" gap="md" wrap="nowrap">
              <Image src={selected.images?.[0] || dummyImage} alt={selected.title} w={128} h={128} radius="md" fit="cover" />
              <Box>
                <Group gap="xs">
                  <Text fw={700} size="lg">{selected.title}</Text>
                  {renderBadgeByState(selected.state)}
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
        {editing && (
          <ProductForm
            product={editing}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['products'] });
              setEditing(null);
              setViewOpened(false);
            }}
          />
        )}

      </ModalWrapper>
    </Box>
  );
}

export default ProductTable;