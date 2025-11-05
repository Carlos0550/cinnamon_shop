import { Badge, Box, Group, Paper, ScrollArea, Table, Text, Stack, Modal, Divider, List } from "@mantine/core";
import { useMediaQuery, useDisclosure } from "@mantine/hooks";
import { useState } from "react";

// Tipos locales para evitar dependencias externas
export type Product = {
  id: number;
  name: string;
  price: number;
  available?: boolean;
  sku?: string;
};

export type Sales = {
  id: number;
  created_at: string;
  total: number;
  payment_method: "Efectivo" | "Tarjeta" | "Transferencia" | "QR";
  source: "Caja" | "Web"
  products: Product[];
  buyer?: {
    name: string;
    email?: string;
    phone?: string;
  };
};

const mockSales: Sales[] = [
  {
    id: 1001,
    created_at: "2025-10-24T10:35:00Z",
    total: 24.5,
    payment_method: "Efectivo",
    products: [
      { id: 1, name: "Latte", price: 4.5, available: true, sku: "LAT-001" },
      { id: 2, name: "Croissant", price: 3.0, available: true, sku: "CRO-101" },
      { id: 3, name: "Scone", price: 4.0, available: false, sku: "SCN-050" },
      { id: 4, name: "Americano", price: 3.5, available: true, sku: "AME-002" },
      { id: 5, name: "Té Verde", price: 2.5, available: true, sku: "TEA-200" },
      { id: 6, name: "Galleta", price: 2.0, available: true, sku: "GAL-010" },
      { id: 7, name: "Muffin", price: 5.0, available: true, sku: "MUF-015" },
    ],
    source: "Caja",
  },
  {
    id: 1002,
    created_at: "2025-10-24T12:10:00Z",
    total: 12.0,
    payment_method: "Tarjeta",
    products: [
      { id: 8, name: "Cappuccino", price: 3.5, available: true, sku: "CAP-009" },
      { id: 9, name: "Tostada", price: 2.5, available: true, sku: "TOS-023" },
      { id: 10, name: "Jugo Naranja", price: 3.0, available: true, sku: "JUG-300" },
      { id: 11, name: "Brownie", price: 3.0, available: false, sku: "BRO-501" },
    ],
    buyer: { name: "Luis García", email: "luis.garcia@example.com", phone: "+34 600 789 012" },
    source: "Web",
  },
  {
    id: 1003,
    created_at: "2025-10-25T09:05:00Z",
    total: 8.5,
    payment_method: "Transferencia",
    products: [
      { id: 12, name: "Americano", price: 3.0, available: true, sku: "AME-002" },
      { id: 13, name: "Medialuna", price: 2.5, available: true, sku: "MED-020" },
      { id: 14, name: "Cookie", price: 3.0, available: true, sku: "COO-070" },
    ],
    source: "Caja",
  },
  {
    id: 1004,
    created_at: "2025-10-25T14:20:00Z",
    total: 15.75,
    payment_method: "QR",
    products: [
      { id: 15, name: "Flat White", price: 4.0, available: true, sku: "FLW-007" },
      { id: 16, name: "Sandwich", price: 6.5, available: false, sku: "SAN-120" },
      { id: 17, name: "Té Chai", price: 5.25, available: true, sku: "CHAI-222" },
    ],
    buyer: { name: "Carlos Díaz", email: "carlos.diaz@example.com", phone: "+34 600 456 789" },
    source: "Web",
  },
];

function formatCurrency(value: number): string {
  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} €`;
  }
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SalesTable() {
  const isSmall = useMediaQuery("(max-width: 48em)"); // ~768px
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedSale, setSelectedSale] = useState<Sales | null>(null);

  const openSale = (sale: Sales) => {
    setSelectedSale(sale);
    open();
  };

  return (
    <Box mt="lg">
      {isSmall ? (
        <StackCards sales={mockSales} onOpenSale={openSale} />
      ) : (
        <Paper withBorder radius="md">
          <ScrollArea type="auto" offsetScrollbars>
            <Table striped highlightOnHover withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Fecha</Table.Th>
                  <Table.Th>Total</Table.Th>
                  <Table.Th>Método de pago</Table.Th>
                  <Table.Th>Origen</Table.Th>
                  <Table.Th>Productos</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {mockSales.map((sale) => (
                  <Table.Tr key={sale.id} onClick={() => openSale(sale)} style={{ cursor: "pointer" }}>
                    <Table.Td>
                      <Text fw={500}>{sale.id}</Text>
                    </Table.Td>
                    <Table.Td>{formatDate(sale.created_at)}</Table.Td>
                    <Table.Td>
                      <Text fw={600}>{formatCurrency(sale.total)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="blue">
                        {sale.payment_method}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="green">
                        {sale.source}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Badge variant="dot" color="gray">
                          {sale.products.length} ítems
                        </Badge>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      )}

      <SaleDetailsModal sale={selectedSale} opened={opened} onClose={close} />
    </Box>
  );
}

function StackCards({ sales, onOpenSale }: { sales: Sales[]; onOpenSale: (sale: Sales) => void }) {
  return (
    <Stack gap="sm">
      {sales.map((sale) => (
        <Paper key={sale.id} withBorder radius="md" p="md" onClick={() => onOpenSale(sale)} style={{ cursor: "pointer" }}>
          <Group justify="space-between" align="flex-start">
            <Box>
              <Group gap={6}>
                <Text size="sm" c="dimmed">
                  #{sale.id}
                </Text>
                <Badge variant="light" color="blue">
                  {sale.payment_method}
                </Badge>
                <Badge variant="light" color="green">
                  {sale.source}
                </Badge>
              </Group>
              <Text mt={4} fw={600}>
                {formatCurrency(sale.total)}
              </Text>
              <Text size="sm" c="dimmed">
                {formatDate(sale.created_at)}
              </Text>
            </Box>
            <Box>
              <Group gap={6} wrap="wrap">
                {sale.products.slice(0, 3).map((p) => (
                  <Badge key={p.id} variant="light" color="gray">
                    {p.name}
                  </Badge>
                ))}
                {sale.products.length > 3 && (
                  <Badge variant="outline" color="gray">
                    +{sale.products.length - 3}
                  </Badge>
                )}
              </Group>
            </Box>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}

function SaleDetailsModal({ sale, opened, onClose }: { sale: Sales | null; opened: boolean; onClose: () => void }) {
  if (!sale) return null;
  return (
    <Modal opened={opened} onClose={onClose} title={`Venta #${sale.id}`} size="lg">
      <Box>
        <Text fw={600}>{formatCurrency(sale.total)}</Text>
        <Text c="dimmed" size="sm">{formatDate(sale.created_at)}</Text>
        <Badge mt="xs" variant="light" color="blue">{sale.payment_method}</Badge>

        {sale.buyer && (
          <Box mt="md">
            <Divider label="Comprador" labelPosition="center" />
            <Text mt="xs">{sale.buyer.name}</Text>
            {sale.buyer.email && <Text c="dimmed" size="sm">{sale.buyer.email}</Text>}
            {sale.buyer.phone && <Text c="dimmed" size="sm">{sale.buyer.phone}</Text>}
          </Box>
        )}

        <Box mt="md">
          <Divider label="Productos" labelPosition="center" />
          <List spacing="xs" mt="xs">
            {sale.products.map((p) => (
              <List.Item key={p.id}>
                <Group gap="xs">
                  <Text fw={500}>{p.name}</Text>
                  {p.sku && (
                    <Badge variant="outline" color="gray">{p.sku}</Badge>
                  )}
                  <Badge variant="light" color={p.available ? "green" : "red"}>
                    {p.available ? "Disponible" : "No disponible"}
                  </Badge>
                  <Text>{formatCurrency(p.price)}</Text>
                </Group>
              </List.Item>
            ))}
          </List>
        </Box>
      </Box>
    </Modal>
  );
}

export default SalesTable;