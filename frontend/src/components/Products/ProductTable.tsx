import { theme } from '@/theme';
import { Box, Flex, Paper, TextInput, Loader, Text, Button, ActionIcon, Badge, Group, Image, ScrollArea, Stack, Table, Select, Pagination, Modal } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit, FiEye, FiTrash} from 'react-icons/fi';
import { useDeleteProduct, useGetAllProducts, useUpdateProductState, useUpdateProductStock, type GetProductsParams, type Product, type ProductState } from '@/components/Api/ProductsApi';
import ModalWrapper from '@/components/Common/ModalWrapper';
import dummyImage from '@/assets/dummy_image.png';
import ProductForm from './ProductForm';


function ProductTable({
  setAddOpened
}: {
  setAddOpened: (opened: boolean) => void;
}) {
  const deleteProductMutation = useDeleteProduct();
  const updateProductMutation = useUpdateProductState();
  const updateStockMutation = useUpdateProductStock();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId] = useState<string | null>(null);

  const [search, setSearch] = useState<string>("");
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints?.sm || '768px'})`);

  const [viewOpened, setViewOpened] = useState<boolean>(false);
  const [selected, setSelected] = useState<Product | null>(null);

  const [searchParams, setSearchParams] = useState<GetProductsParams>({
    page: 1,
    limit: 10,
    state: 'active',
    sortBy: undefined,
    sortOrder: undefined,
    isActive: undefined,
    categoryId: undefined,
  });

  const [editing, setEditing] = useState<Product | null>(null);
  const [stockModalOpen, setStockModalOpen] = useState<boolean>(false);
  const [stockProductId, setStockProductId] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState<string>("1");

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
  const products: Product[] = data?.products ?? [];
  const pagination = data?.pagination;

  useEffect(() => {
    if (pagination?.totalPages && currentPage > pagination.totalPages) {
      setCurrentPage(pagination.totalPages);
    }
  }, [pagination, currentPage]);

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
      case 'deleted':
        return <Badge variant="light" color="red">Eliminado</Badge>;
      default:
        return null;
    }
  }


  // const changeProductsStatus = (pr_id: string, status: ProductState) => {
  //   setUpdatingId(pr_id);
  //   updateProductMutation.mutate(
  //     { productId: pr_id, state: status },
  //     { onSettled: () => setUpdatingId(null) }
  //   );
  // }

  const openStockModal = (product: Product) => {
    setStockProductId(product.id);
    setStockValue(String(typeof product.stock === 'number' ? product.stock : 1));
    setStockModalOpen(true);
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
          onChange={(value) => { setSearchParams(prev => ({ ...prev, limit: Number(value) })); setCurrentPage(1); }}
          label="Mostrar por página"
          data={[
            { value: '5', label: '5 por página' },
            { value: '10', label: '10 por página' },
            { value: "20", label: '20 por página' },
            { value: "50", label: '50 por página' },
          ]}
        />

        <Select
          value={String(searchParams.state)}
          label="Filtrar por estado"
          onChange={(value) => setSearchParams(prev => ({ ...prev, state: value as ProductState }))}
          data={[
            { value: 'active', label: 'Activo' },
            { value: 'inactive', label: 'Inactivo' },
            { value: 'draft', label: 'Borrador' },
            { value: 'out_stock', label: 'Agotado' },
            { value: 'deleted', label: 'Eliminado' },
          ]}
        />

        <Select
          value={searchParams.sortBy ?? ''}
          label="Tipo de orden"
          onChange={(value) => setSearchParams(prev => ({ ...prev, sortBy: value || undefined }))}
          data={[
            { value: '', label: 'Ninguno' },
            { value: 'title', label: 'Nombre' },
            { value: 'price', label: 'Precio' },
            { value: 'created_at', label: 'Fecha de creación' },
          ]}
        />

        <Select
          value={searchParams.sortOrder || 'desc'}
          label="Orden"
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
              {searchParams.state === "draft" && (
                <Text mb={"md"} c={"dimmed"}>Recuerde editar precio y activar el producto para que esté a la venta, haga esto usando el botón " <FiEdit /> editar " en la fila del producto.</Text>
              )}
              <Group justify="space-between" align="flex-start">
                <Group gap="sm" wrap="nowrap">
                  <Image src={p.images?.[0] || dummyImage} alt={p.title} w={64} h={64} radius="sm" fit="cover" />
                  <Box>
                    <Group gap="xs">
                      {renderBadgeByState(p.state)}
                    </Group>
                    <Text c="dimmed">{typeof p.price === 'number' ? `Precio: $${p.price}` : "Precio: —"}</Text>
                    <Text c="dimmed">{p.stock !== undefined ? `Stock: ${p.stock}` : "Stock: —"}</Text>
                  </Box>
                </Group>
                <Stack gap="xs">
                  <Group gap={"xs"}>
                    <ActionIcon variant="light" aria-label="Ver" onClick={() => { setSelected(p); setViewOpened(true); }} loading={isLoading}>
                      <FiEye />
                    </ActionIcon>
                    <ActionIcon color="red" variant="light" aria-label="Eliminar"
                      onClick={() => { setDeletingId(p.id); deleteProductMutation.mutate(p.id, { onSettled: () => setDeletingId(null) }); }}
                      loading={deleteProductMutation.isPending && deletingId === p.id}
                      disabled={deleteProductMutation.isPending && deletingId === p.id}
                    >
                      <FiTrash />
                    </ActionIcon>
                    <Button size="xs" variant="light" leftSection={<FiEdit />} aria-label="Editar"
                      onClick={() => { setEditing(p); setViewOpened(true); }}
                      loading={isLoading}
                    >
                      Editar
                    </Button>
                  </Group>
                  <Group gap="xs">
                    <Button onClick={() => openStockModal(p)}
                      loading={updateProductMutation.isPending && updatingId === p.id}
                      disabled={updateProductMutation.isPending && updatingId === p.id}
                    >
                      Actualizar stock
                    </Button>
                    {/* {p.state !== 'out_stock' && (
                      <Button onClick={() => changeProductsStatus(p.id, 'out_stock')}
                        loading={updateProductMutation.isPending && updatingId === p.id}
                        disabled={updateProductMutation.isPending && updatingId === p.id}
                      >
                        Sin stock
                      </Button>
                    )} */}
                  </Group>
                </Stack>
              </Group>
            </Paper>
          ))}
        </Stack>
      ) : (
        <Paper withBorder p="md" radius="md">
          {searchParams.state === "draft" && (
            <Text mb={"md"} c={"dimmed"}>Recuerde editar precio y activar el producto para que esté a la venta, haga esto usando el botón " <FiEdit /> editar " en la fila del producto.</Text>
          )}
          <ScrollArea>
            <Table highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 120 }}>Imagen</Table.Th>
                  <Table.Th>Título</Table.Th>
                  <Table.Th>Precio</Table.Th>
                  <Table.Th>Estado</Table.Th>
                  <Table.Th>Stock</Table.Th>
                  <Table.Th>Creado</Table.Th>
                  <Table.Th style={{ width: 440 }}>Acciones</Table.Th>
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
                      {p.stock !== undefined ? p.stock : '—'}
                    </Table.Td>
                    <Table.Td>
                      {p.created_at ? (
                        <Text c="dimmed">{new Date(p.created_at).toLocaleString()}</Text>
                      ) : (
                        <Text c="dimmed">—</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Stack gap="xs">
                        <Group gap={"xs"}>
                          <ActionIcon variant="light" aria-label="Ver" onClick={() => { setSelected(p); setViewOpened(true); }} loading={isLoading}>
                            <FiEye />
                          </ActionIcon>
                          <ActionIcon color="red" variant="light" aria-label="Eliminar"
                            onClick={() => { setDeletingId(p.id); deleteProductMutation.mutate(p.id, { onSettled: () => setDeletingId(null) }); }}
                            loading={deleteProductMutation.isPending && deletingId === p.id}
                            disabled={deleteProductMutation.isPending && deletingId === p.id}
                          >
                            <FiTrash />
                          </ActionIcon>
                          <Button size="xs" variant="light" leftSection={<FiEdit />} aria-label="Editar"
                            onClick={() => { setEditing(p); setViewOpened(true); }}
                            loading={isLoading}
                          >
                            Editar
                          </Button>
                          <Button onClick={() => openStockModal(p)}
                            loading={updateProductMutation.isPending && updatingId === p.id}
                            disabled={updateProductMutation.isPending && updatingId === p.id}
                          >
                            Actualizar stock
                          </Button>
                          {/* {p.state !== 'out_stock' && (
                            <Button onClick={() => changeProductsStatus(p.id, 'out_stock')}
                              loading={updateProductMutation.isPending && updatingId === p.id}
                              disabled={updateProductMutation.isPending && updatingId === p.id}
                            >
                              Sin stock
                            </Button>
                          )} */}
                        </Group>
                        {/* <Group gap="xs">
                          
                        </Group> */}
                      </Stack>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      )}

      {pagination && (
        <Flex justify="center" mt="md" gap="md" align="center">
          <Text>
            Página {pagination.page} de {pagination.totalPages} ({pagination.total} productos)
          </Text>
          <Pagination total={pagination.totalPages || 1} value={pagination.page || 1} onChange={setCurrentPage} disabled={isLoading} withEdges />
        </Flex>
      )}

      <Modal opened={stockModalOpen} onClose={() => setStockModalOpen(false)} title="Reponer stock" centered>
        <Stack>
          <TextInput label="Cantidad" value={stockValue} onChange={(e) => setStockValue(e.currentTarget.value)} type="number" min={0} />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setStockModalOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (!stockProductId) return;
              const qty = parseInt(stockValue, 10);
              if (!Number.isFinite(qty) || qty < 0) return;
              setStockModalOpen(false);
              updateStockMutation.mutate({ productId: stockProductId, quantity: qty });
            }}>
              Guardar
            </Button>
          </Group>
        </Stack>
      </Modal>
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