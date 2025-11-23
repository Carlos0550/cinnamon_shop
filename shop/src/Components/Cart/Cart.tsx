'use client'
import { useAppContext } from '@/providers/AppContext'
import { Modal, Box, Stack, Group, Image, Text, ActionIcon, Divider, Button } from '@mantine/core'
import { FaMinus, FaPlus } from 'react-icons/fa'

type CartProps = {
  opened?: boolean
  onClose: () => void
}
function Cart({ opened = true, onClose }: CartProps) {
  const {
    cart: { cart, clearCart, updateQuantity },
  } = useAppContext()

  const formatCurrency = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)

  return (
    <Modal opened={opened} onClose={onClose} title="Mi carrito">
      <Box>
        <Box style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <Stack gap="md">
            {cart.items.length === 0 ? (
              <Text c="dimmed">Tu carrito está vacío</Text>
            ) : (
              cart.items.map((item) => (
                <Box key={item.product_id} style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 8, padding: 12 }}>
                  <Group justify="space-between" align="center">
                    <Group align="center" gap="md">
                      <Image src={item.image_url} alt={item.product_name} w={64} h={64} fit="cover" radius="sm" />
                      <Stack gap={4}>
                        <Text fw={600}>{item.product_name}</Text>
                        <Text>{formatCurrency(item.price)}</Text>
                        {!item.price_changed && (
                          <Text size="xs" c="yellow.6">El precio de este producto ha cambiado recientemente</Text>
                        )}
                      </Stack>
                    </Group>
                    <Group align="center" gap="sm">
                      <ActionIcon variant="light" aria-label="decrement" onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}>
                        <FaMinus />
                      </ActionIcon>
                      <Text fw={600}>{item.quantity}</Text>
                      <ActionIcon variant="light" aria-label="increment" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>
                        <FaPlus />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Box>
              ))
            )}
          </Stack>
        </Box>

        <Divider my="md" />

        <Group justify="space-between" align="center">
          <Text fw={700}>Total: {formatCurrency(cart.total)}</Text>
          <Group>
            <Button variant="outline" color="red" onClick={clearCart}>Limpiar carrito</Button>
            <Button color="green" onClick={onClose}>Continuar</Button>
          </Group>
        </Group>
      </Box>
    </Modal>
  )
}

export default Cart