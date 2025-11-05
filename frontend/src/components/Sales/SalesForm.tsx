import { Box, Grid, Text, Select, Card, Group, Stack, Badge, ActionIcon, Divider, Paper, Loader } from "@mantine/core";
import { useState, useMemo } from "react";
import { FiTrash, FiShoppingCart } from "react-icons/fi";
import { useGetAllProducts, type GetProductsParams, type Product } from "@/components/Api/ProductsApi";
export const SaleSource = ["WEB", "CAJA"] as const;
export type SaleSource = typeof SaleSource[number];

export const PaymentMethods = ["TARJETA", "EFECTIVO", "QR", "NINGUNO"] as const;
export type PaymentMethods = typeof PaymentMethods[number];

export type UserSale = {
    user_id?: string
}

export type SaleRequest = {
    payment_method: PaymentMethods
    source: SaleSource
    product_ids: string[]
    user_sale?: UserSale
    total?: number
}

export function SalesForm() {
    const [formValue, setFormValue] = useState<SaleRequest>({
        payment_method: "EFECTIVO",
        source: "CAJA",
        product_ids: [],
        total: 0,
    })

    const [searchTitle, setSearchTitle] = useState<string>("");
    const [selectValue, setSelectValue] = useState<string | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

    const productQueryParams: GetProductsParams = useMemo(() => ({
        page: 1,
        limit: 10,
        state: "active",
        title: searchTitle || undefined,
    }), [searchTitle]);

    const { data: productsRes, isLoading } = useGetAllProducts(productQueryParams);

    const productsOptions = useMemo(() => {
        const items = productsRes?.products ?? [];
        return items.map(p => ({ value: p.id, label: p.title }));
    }, [productsRes]);

    const addProductById = (id?: string | null) => {
        if (!id) return;
        const sourceList = productsRes?.products ?? [];
        const found = sourceList.find(p => p.id === id);
        if (!found) return;
        setSelectedProducts(prev => {
            const exists = prev.some(p => p.id === id);
            const next = exists ? prev : [...prev, found];
            const nextIds = next.map(p => p.id);
            const nextTotal = next.reduce((acc, p) => acc + (typeof p.price === "number" ? p.price : 0), 0);
            setFormValue(v => ({ ...v, product_ids: nextIds, total: nextTotal }));
            return next;
        });
    };

    const removeProduct = (id: string) => {
        setSelectedProducts(prev => {
            const next = prev.filter(p => p.id !== id);
            const nextIds = next.map(p => p.id);
            const nextTotal = next.reduce((acc, p) => acc + (typeof p.price === "number" ? p.price : 0), 0);
            setFormValue(v => ({ ...v, product_ids: nextIds, total: nextTotal }));
            return next;
        });
    };

    const currency = useMemo(() => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }), []);

  return (
    <Box>
        <Text fw={600} fz="lg" mb="md">Formulario de Venta</Text>
        <Paper withBorder p="md" radius="md">
            <Grid gutter={16}>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack gap="sm">
                        <Select
                            label="Productos"
                            placeholder={isLoading ? "Cargando productos..." : "Buscar y seleccionar"}
                            data={productsOptions}
                            searchable
                            leftSection={isLoading && <Loader size={"xs"}/>}
                            searchValue={searchTitle}
                            onSearchChange={setSearchTitle}
                            value={selectValue}
                            onChange={(value) => {
                                addProductById(value);
                                setSelectValue(null);
                                setSearchTitle("");
                            }}
                            withCheckIcon={false}
                        />

                        <Card withBorder shadow="sm" radius="md">
                            <Group justify="space-between" mb="xs">
                                <Group>
                                    <FiShoppingCart />
                                    <Text fw={500}>Seleccionados</Text>
                                </Group>
                                <Badge color="blue" variant="light">{selectedProducts.length}</Badge>
                            </Group>
                            <Divider my="sm" />
                            <Stack gap="xs">
                                {selectedProducts.length === 0 ? (
                                    <Text c="dimmed">No hay productos seleccionados</Text>
                                ) : (
                                    selectedProducts.map(p => (
                                        <Group key={p.id} justify="space-between">
                                            <Group gap="xs">
                                                <Badge color="green" variant="light">{currency.format(typeof p.price === 'number' ? p.price : 0)}</Badge>
                                                <Text>{p.title}</Text>
                                            </Group>
                                            <ActionIcon color="red" variant="light" aria-label="Eliminar" onClick={() => removeProduct(p.id)}>
                                                <FiTrash />
                                            </ActionIcon>
                                        </Group>
                                    ))
                                )}
                            </Stack>
                        </Card>
                    </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack gap="sm">
                        <Select
                            label="Método de pago"
                            placeholder="Seleccionar método"
                            data={PaymentMethods.map((pm) => ({ value: pm, label: pm }))}
                            value={formValue.payment_method}
                            onChange={(value) => {
                                if (!value) return;
                                setFormValue(v => ({ ...v, payment_method: value as PaymentMethods }));
                            }}
                        />
                        <Card withBorder shadow="sm" radius="md">
                            <Group justify="space-between">
                                <Text fw={500}>Total</Text>
                                <Text fw={700}>{currency.format(formValue.total ?? 0)}</Text>
                            </Group>
                        </Card>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Paper>
    </Box>
  )
}

