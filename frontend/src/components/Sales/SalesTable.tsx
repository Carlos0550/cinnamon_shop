import { Box, Paper, Table, Text, Loader, Group, Button, Badge, Stack, ScrollArea, SegmentedControl } from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { useMediaQuery } from "@mantine/hooks"
import { theme } from "@/theme"
import type { Product } from "../Api/ProductsApi"
import { useGetSales } from "../Api/SalesApi"
import type { PaymentMethods, SaleSource, ManualProductItem } from "./SalesForm"
import ModalWrapper from "@/components/Common/ModalWrapper"
import React, { useMemo, useState, useEffect } from "react"

export type Sales = {
  id: string,
  created_at: string,
  payment_method: PaymentMethods
  source: SaleSource
  tax: number,
  total: number,
  user?: {
    id?: string,
    name?: string,
    email?: string,
  } | null,
  products: Product[],
  manualProducts?: ManualProductItem[],
  loadedManually?: boolean,
}

export default function SalesTable() {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [perPage, setPerPage] = useState<number>(5)
  const [preset, setPreset] = useState<string>("HOY")
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null])
  const [totalToday, setTotalToday] = useState<number>(0)

  const startEndFromPreset = useMemo(() => {
    const today = new Date();
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
    const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
    const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days, 0, 0, 0, 0)
    switch (preset) {
      case "AYER": {
        const y = addDays(today, -1); return { start: startOfDay(y), end: endOfDay(y) }
      }
      case "ULTIMOS_3": {
        const s = addDays(today, -2); return { start: startOfDay(s), end: endOfDay(today) }
      }
      case "ULTIMOS_7": {
        const s = addDays(today, -6); return { start: startOfDay(s), end: endOfDay(today) }
      }
      case "MES": {
        const s = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0); const e = endOfDay(today); return { start: s, end: e }
      }
      case "PERSONALIZADO": {
        const [s, e] = range;
        const start = s instanceof Date ? s : (s ? new Date(s as unknown as string) : startOfDay(today));
        const end = e instanceof Date ? e : (e ? new Date(e as unknown as string) : endOfDay(today));
        return { start, end }
      }
      case "HOY":
      default: {
        return { start: startOfDay(today), end: endOfDay(today) }
      }
    }
  }, [preset, range])

  const toDateOnly = (d: unknown) => {
    if (!d) return undefined;
    const date = d instanceof Date ? d : new Date(d as unknown as string);
    if (isNaN(date.getTime())) return undefined;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  const start_date = toDateOnly(startEndFromPreset.start)
  const end_date = toDateOnly(startEndFromPreset.end)

  const { data, isLoading } = useGetSales(currentPage, perPage, start_date, end_date)

  const sales: Sales[] = (data?.sales ?? []) as Sales[]
  const pagination = data?.pagination as undefined | {
    total: number,
    page: number,
    limit: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPrevPage: boolean,
  }
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints?.sm || '768px'})`)
  const currency = useMemo(() => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }), [])

  const [viewProductsOpen, setViewProductsOpen] = useState<boolean>(false)
  const [selectedSale, setSelectedSale] = useState<Sales | null>(null)

  useEffect(() => { setCurrentPage(1) }, [preset, range])

  const openProducts = (sale: Sales) => {
    setSelectedSale(sale)
    setViewProductsOpen(true)
  }

  const closeProducts = () => {
    setViewProductsOpen(false)
    setSelectedSale(null)
  }

  const formatDate = (value?: string) => {
    if (!value) return "—"
    const d = new Date(value)
    return isNaN(d.getTime()) ? String(value) : d.toLocaleString('es-AR')
  }

  useEffect(() => {
    if (sales && Array.isArray(sales) && sales.length > 0) {
      const total = sales.reduce((acc, sale) => acc + Number(sale.total || 0), 0)
      setTotalToday(total)
    }
  }, [sales])
  return (
    <Box>
      <Group mb="md" gap="md" align="center" wrap="wrap">
        <SegmentedControl
          value={preset}
          onChange={setPreset}
          style={{ flexWrap: "wrap" }}
          data={[
            { label: "Hoy", value: "HOY" },
            { label: "Ayer", value: "AYER" },
            { label: "Últimos 3", value: "ULTIMOS_3" },
            { label: "Últimos 7", value: "ULTIMOS_7" },
            { label: "Mes", value: "MES" },
            { label: "Personalizado", value: "PERSONALIZADO" },
          ]}
        />
        {preset === "PERSONALIZADO" && (
          <DatePickerInput
            type="range"
            value={range}
            onChange={(value) => setRange(value as [Date | null, Date | null])}
            placeholder="Selecciona rango"
            locale="es"
          />
        )}
      </Group>
      {isLoading ? (
        <Group justify="center" align="center" h={200}>
          <Loader />
        </Group>
      ) : (!sales || sales.length === 0) ? (
        <Text ta="center">No se encontraron ventas</Text>
      ) : isMobile ? (
        <Stack>
          <Text c={"dimmed"} size="xl">
            Total vendido hoy: {currency.format(totalToday)}
          </Text>
          {sales.map((sale) => {
            const finalTotal = Number(sale.total) || 0
            const taxPct = Number(sale.tax) || 0
            const subtotal = taxPct > 0 ? finalTotal / (1 + taxPct / 100) : finalTotal
            const taxAmount = finalTotal - subtotal
            const itemsCount = sale?.loadedManually ? (sale?.manualProducts?.length ?? 0) : (sale?.products?.length ?? 0)
            return (
              <Paper key={sale.id} withBorder p="md" radius="md">

                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text fw={600}>Venta #{sale.id}</Text>
                    <Badge variant="light">{sale.source}</Badge>
                  </Group>
                  <Text c="dimmed">Fecha: {formatDate(sale.created_at)}</Text>
                  <Group gap="xs">
                    <Badge color="blue" variant="light">{sale.payment_method}</Badge>
                    {taxPct > 0 && <Badge color="grape" variant="light">Impuesto {taxPct}%</Badge>}
                  </Group>
                  <Group justify="space-between">
                    <Text>Subtotal</Text>
                    <Text fw={600}>{currency.format(subtotal)}</Text>
                  </Group>
                  {taxPct > 0 && (
                    <Group justify="space-between">
                      <Text>Impuesto</Text>
                      <Text fw={600}>{currency.format(taxAmount)}</Text>
                    </Group>
                  )}
                  <Group justify="space-between">
                    <Text>Total</Text>
                    <Text fw={700}>{currency.format(finalTotal)}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text>Cliente</Text>
                    <Text>{sale.user?.name || '—'} {sale.user?.email ? `(${sale.user.email})` : ''}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text>Productos</Text>
                    <Badge>{itemsCount}</Badge>
                  </Group>
                  <Group justify="flex-end">
                    <Button variant="light" onClick={() => openProducts(sale)}>Ver productos</Button>
                  </Group>
                </Stack>
              </Paper>
            )
          })}
        </Stack>
      ) : (
        <React.Fragment>
          <Stack mb={"md"}>
            <Text c={"dimmed"} size="xl">
              Total vendido hoy: {currency.format(totalToday)}
            </Text>
          </Stack>
          <Paper withBorder radius="md" p="sm">

            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Fecha</Table.Th>
                    <Table.Th>Cliente</Table.Th>
                    <Table.Th>Método</Table.Th>
                    <Table.Th>Fuente</Table.Th>
                    <Table.Th>Impuesto %</Table.Th>
                    <Table.Th>Subtotal</Table.Th>
                    <Table.Th>Total</Table.Th>
                    <Table.Th>Productos</Table.Th>
                    <Table.Th>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sales.map((sale) => {
                    const finalTotal = Number(sale.total) || 0
                    const taxPct = Number(sale.tax) || 0
                    const subtotal = taxPct > 0 ? finalTotal / (1 + taxPct / 100) : finalTotal
                    const itemsCount = sale?.loadedManually ? (sale?.manualProducts?.length ?? 0) : (sale?.products?.length ?? 0)
                    return (
                      <Table.Tr key={sale.id}>
                        <Table.Td>{formatDate(sale.created_at)}</Table.Td>
                        <Table.Td>
                          <Stack gap={2}>
                            <Text fw={600}>{sale.user?.name || '—'}</Text>
                            <Text c="dimmed" size="sm">{sale.user?.email || '—'}</Text>
                          </Stack>
                        </Table.Td>
                        <Table.Td>
                          <Badge color="blue" variant="light">{sale.payment_method}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light">{sale.source}</Badge>
                        </Table.Td>
                        <Table.Td>{taxPct}</Table.Td>
                        <Table.Td>{currency.format(subtotal)}</Table.Td>
                        <Table.Td>{currency.format(finalTotal)}</Table.Td>
                        <Table.Td>
                          <Badge>{itemsCount}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Button size="xs" variant="light" onClick={() => openProducts(sale)}>Ver productos</Button>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    )
                  })}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Paper>
        </React.Fragment>
      )}

      {pagination && (
        <Group justify="center" mt="md" gap="md">
          <Text>
            Página {pagination.page} de {pagination.totalPages} ({pagination.total} ventas)
          </Text>
          <Group gap="xs">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevPage}
              size="sm"
            >
              Anterior
            </Button>
            <Button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!pagination.hasNextPage}
              size="sm"
            >
              Siguiente
            </Button>
          </Group>
          <Group gap="xs" align="center">
            <Text size="sm">Por página:</Text>
            <Button size="xs" variant={perPage === 5 ? 'filled' : 'light'} onClick={() => { setPerPage(5); setCurrentPage(1); }}>5</Button>
            <Button size="xs" variant={perPage === 10 ? 'filled' : 'light'} onClick={() => { setPerPage(10); setCurrentPage(1); }}>10</Button>
            <Button size="xs" variant={perPage === 20 ? 'filled' : 'light'} onClick={() => { setPerPage(20); setCurrentPage(1); }}>20</Button>
            <Button size="xs" variant={perPage === 50 ? 'filled' : 'light'} onClick={() => { setPerPage(50); setCurrentPage(1); }}>50</Button>
          </Group>
        </Group>
      )}

      {viewProductsOpen && selectedSale && (
        <ModalWrapper
          opened={viewProductsOpen}
          onClose={closeProducts}
          title={<Text fw={600}>Productos de la venta #{selectedSale.id}</Text>}
          size={"lg"}
          fullScreen={isMobile}
        >
          <Stack>
            {(selectedSale.loadedManually ? (selectedSale.manualProducts?.length ?? 0) > 0 : (selectedSale.products?.length ?? 0) > 0) ? (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Producto</Table.Th>
                    <Table.Th>Precio</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {(() => {
                    const rows = selectedSale.loadedManually
                      ? (selectedSale.manualProducts || []).map((mp, idx) => ({
                        key: String(idx),
                        title: mp.title + (mp.quantity && mp.quantity > 1 ? ` x${mp.quantity}` : ''),
                        price: Number(mp.quantity) * Number(mp.price),
                      }))
                      : (selectedSale.products || []).map((p) => ({
                        key: String(p.id),
                        title: p.title,
                        price: typeof p.price === 'number' ? p.price : Number(p.price || 0),
                      }));
                    return rows.map((r) => (
                      <Table.Tr key={r.key}>
                        <Table.Td>{r.title}</Table.Td>
                        <Table.Td>{currency.format(r.price)}</Table.Td>
                      </Table.Tr>
                    ))
                  })()}
                </Table.Tbody>
              </Table>
            ) : (
              <Text c="dimmed">Sin productos</Text>
            )}

            {(() => {
              const finalTotal = Number(selectedSale.total) || 0
              const taxPct = Number(selectedSale.tax) || 0
              const subtotal = taxPct > 0 ? finalTotal / (1 + taxPct / 100) : finalTotal
              const taxAmount = finalTotal - subtotal
              return (
                <Paper withBorder p="sm" radius="md">
                  <Stack gap={4}>
                    <Group justify="space-between">
                      <Text>Subtotal</Text>
                      <Text fw={600}>{currency.format(subtotal)}</Text>
                    </Group>
                    {taxPct > 0 && (
                      <Group justify="space-between">
                        <Text>Impuesto ({taxPct}%)</Text>
                        <Text fw={600}>{currency.format(taxAmount)}</Text>
                      </Group>
                    )}
                    <Group justify="space-between">
                      <Text>Total</Text>
                      <Text fw={700}>{currency.format(finalTotal)}</Text>
                    </Group>
                  </Stack>
                </Paper>
              )
            })()}
          </Stack>
        </ModalWrapper>
      )}
    </Box>
  )
}