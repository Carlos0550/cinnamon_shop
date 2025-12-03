"use client";
import useOrders from '@/Api/useOrders';
import { Table, Pagination, Badge, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { useAppContext } from '@/providers/AppContext';
import { useState } from 'react';
import dayjs from 'dayjs';

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data } = useOrders(page, limit);
  const items = data?.items || [];
  const { auth, utils } = useAppContext();
  const baseUrl = utils.baseUrl;
  const token = auth.state.token;

  const uploadReceipt = async (orderId: string, file?: File | null) => {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${baseUrl}/orders/${orderId}/receipt`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) {
      alert(json?.error || 'No se pudo subir el comprobante');
      return;
    }
    alert('Comprobante subido');
  };
  return (
    <Stack>
      <Title order={2}>Mis ordenes</Title>
      {items.map((o) => (
        <Card key={o.id} withBorder>
          <Group justify="space-between">
            <Text fw={600}>#{o.id}</Text>
            <Text c="dimmed">{dayjs(o.created_at).format('YYYY-MM-DD HH:mm')}</Text>
          </Group>
          <Group gap="xs" mt="xs">
            <Badge variant="light">Pago: {o.payment_method}</Badge>
          </Group>
          {String(o.payment_method).toUpperCase() === 'TRANSFERENCIA' && (
            <Group mt="xs">
              <div>
                <div>Alias: <strong>Roo.recalde</strong></div>
                <div>Nombre: <strong>Recalde Rocio Candelaria</strong></div>
                <div>Banco: <strong>Mercado Pago</strong></div>
              </div>
            </Group>
          )}
          <Text>Total: ${o.total.toFixed(2)}</Text>
          {Array.isArray(o.items) && o.items.length > 0 && (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Producto</Table.Th>
                  <Table.Th>Cantidad</Table.Th>
                  <Table.Th>Subtotal</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {o.items.map((it: any, idx: number) => (
                  <Table.Tr key={idx}>
                    <Table.Td>{it.title}</Table.Td>
                    <Table.Td>{it.quantity}</Table.Td>
                    <Table.Td>${(Number(it.price) * Number(it.quantity)).toFixed(2)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
          {String(o.payment_method).toUpperCase() === 'TRANSFERENCIA' && (
            <Group mt="sm">
              <input type="file" accept="image/*,application/pdf" onChange={(e) => uploadReceipt(o.id, e.target.files?.[0] || null)} />
              <Button variant="light" onClick={() => window.open(`${baseUrl}/orders/${o.id}/receipt`, '_blank')}>Ver comprobante (admin)</Button>
            </Group>
          )}
        </Card>
      ))}
      {items.length === 0 && <Text c="dimmed">No tienes órdenes aún.</Text>}
      <Group justify="center">
        <Pagination total={Math.max(1, Number(data?.total || 1))} value={page} onChange={setPage} />
      </Group>
    </Stack>
  );
}
