import { Box, Grid, Text, Select, Card, Group, Stack, Badge, ActionIcon, Divider, Paper, Loader, Button, TextInput } from "@mantine/core";
import { useState, useMemo, useEffect } from "react";
import { FiTrash, FiShoppingCart } from "react-icons/fi";
import { useGetAllProducts, type GetProductsParams, type Product } from "@/components/Api/ProductsApi";
import { useSaveSale } from "../Api/SalesApi";
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
    tax: number
}

type Props = {
    onClose: () => void
}
export function SalesForm({ onClose }: Props) { 
    const saveSale = useSaveSale();
    const [formValue, setFormValue] = useState<SaleRequest>({
        payment_method: "EFECTIVO",
        source: "CAJA",
        product_ids: [],
        total: 0,
        tax: 0  
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
    const handleChangeValues = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormValue({
            ...formValue,
            [name]: type === "checkbox" ? checked : value,
        });
    };
    const currency = useMemo(() => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }), []);

    useEffect(() => {
        if(formValue.payment_method == "EFECTIVO" || formValue.payment_method == "NINGUNO") {
            setFormValue(v => ({ ...v, tax: 0 }));
        }
    },[formValue.payment_method])

    useEffect(() => {
        if(saveSale.isSuccess){
           onClose();
        }
    },[saveSale.isSuccess])
    
    return (
        <Box>
            
            <Paper withBorder p="md" radius="md">
                <Grid gutter={16}>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Stack gap="sm">
                            <Select
                                label="Productos"
                                name="product_ids"
                                placeholder={isLoading ? "Cargando productos..." : "Buscar y seleccionar"}
                                data={productsOptions}
                                searchable
                                leftSection={isLoading && <Loader size={"xs"} />}
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
                                name="payment_method"
                                placeholder="Seleccionar método"
                                data={PaymentMethods.map((pm) => ({ value: pm, label: pm }))}
                                value={formValue.payment_method}
                                onChange={(value) => {
                                    if (!value) return;
                                    setFormValue((prev) => ({
                                        ...prev,
                                        payment_method: value as PaymentMethods,
                                    }));
                                }}
                            />
                            {["TARJETA", "QR"].includes(formValue.payment_method) && (
                                <TextInput
                                    label="Agregar impuesto"
                                    placeholder="Ingresar impuesto"
                                    name="tax"
                                    value={formValue.tax}
                                    onChange={handleChangeValues}
                                />
                            )}
                            <Card withBorder shadow="sm" radius="md">
                                {formValue.tax > 0 && (
                                    <Group justify="space-between">
                                        <Text>Impuesto ({formValue.tax}%)</Text>
                                        <Text>{currency.format(Number(formValue.total) * Number(formValue.tax) / 100)}</Text>
                                    </Group>
                                )}
                                <Group justify="space-between">
                                    <Text fw={500}>Total</Text>
                                    <Text fw={700}>{currency.format(Number(formValue.total) * (1 + Number(formValue.tax) / 100))}</Text>
                                </Group>
                            </Card>
                        </Stack>
                    </Grid.Col>
                    <Button disabled={saveSale.isPending} loading={saveSale.isPending} onClick={() => saveSale.mutate(formValue)}>Guardar venta</Button>
                </Grid>
            </Paper>
        </Box>
    )
}

