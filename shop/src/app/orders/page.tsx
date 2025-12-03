"use client";
import useOrders from '@/Api/useOrders';
import { Card, Group, Stack, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';

export default function OrdersPage() {
  const { data } = useOrders(1, 20);
  const items = data?.items || [];
  return (
    <Stack>
      <Title order={2}>Mis ordenes</Title>
      {items.map((o) => (
        <Card key={o.id} withBorder>
          <Group justify="space-between">
            <Text fw={600}>#{o.id}</Text>
            <Text c="dimmed">{dayjs(o.created_at).format('YYYY-MM-DD HH:mm')}</Text>
          </Group>
          <Text>Pago: {o.payment_method}</Text>
          <Text>Total: ${o.total.toFixed(2)}</Text>
        </Card>
      ))}
      {items.length === 0 && <Text c="dimmed">No tienes órdenes aún.</Text>}
    </Stack>
  );
}

