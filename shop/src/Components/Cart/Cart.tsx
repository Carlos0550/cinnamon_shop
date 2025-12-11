'use client'
import { Modal, Box, Stack, Group, Image, Text, ActionIcon, Divider, Button, Stepper, TextInput, Checkbox, Select, Loader, Alert, Card, CopyButton, Tooltip } from '@mantine/core'
import { FaMinus, FaPlus, FaUniversity, FaCopy, FaCheck } from 'react-icons/fa'
import useCart from './useCart'
import React from 'react'

type CartProps = {
  opened?: boolean
  onClose: () => void
}

function Cart({ opened = true, onClose }: CartProps) {
  const {
    cart,
    clearCart,
    updateQuantity,
    formValues,
    setFormValues,
    shippingInfoCompleted,
    initShipping,
    provinces,
    localities,
    handleProvinceChange,
    handleLocalityChange,
    submitOrder,
    processingOrder,
    receiptFile,
    setReceiptFile,
    businessData,
    isLoadingBankInfo,
    bankInfoError
  } = useCart(onClose);

  const formatCurrency = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)

  return (
    <Modal opened={opened} onClose={onClose} title="Mi carrito" size="lg">
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
                        {item.price_changed && (
                          <Text size="xs" c="yellow.6">El precio de este producto ha cambiado recientemente</Text>
                        )}
                      </Stack>
                    </Group>
                    <Group align="center" gap="sm">
                      <ActionIcon variant="light" aria-label="decrement" onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>
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
            {!formValues.checkoutOpen && (
                 <Button color="green" onClick={initShipping} disabled={cart.items.length === 0}>Continuar</Button>
            )}
          </Group>
        </Group>
      </Box>
      {formValues.checkoutOpen && (
        <Box mt="md">
          <Stepper active={formValues.activeStep} onStepClick={(step) => setFormValues({ ...formValues, activeStep: step })} allowNextStepsSelect={false} size="sm">
            <Stepper.Step label="Datos del cliente">
              <Stack mt="md">
                <TextInput label="Nombre" value={formValues.name} onChange={(e) => setFormValues({ ...formValues, name: e.currentTarget.value })} required />
                <TextInput label="Correo" value={formValues.email} onChange={(e) => setFormValues({ ...formValues, email: e.currentTarget.value })} required />
                <TextInput label="Teléfono" value={formValues.phone} onChange={(e) => setFormValues({ ...formValues, phone: e.currentTarget.value })} required />
                <Checkbox label="Retiro en local" checked={formValues.pickup} onChange={(e) => setFormValues({ ...formValues, pickup: e.currentTarget.checked, orderMethod: e.currentTarget.checked ? 'EN_LOCAL' : 'TRANSFERENCIA' })} />
                {!formValues.pickup && (
                  <Stack>
                    <TextInput label="Calle" value={formValues.street} onChange={(e) => setFormValues({ ...formValues, street: e.currentTarget.value })} />
                    <Select searchable label="Provincia" data={provinces.map(p => ({ label: p.nombre, value: p.id }))} value={formValues.selectedProvinceId} onChange={(value) => handleProvinceChange(value || '')} withAsterisk />
                    <Select searchable label="Localidad/Municipio" data={localities.map(l => ({ label: l.nombre, value: l.id }))} value={formValues.selectedLocalityId} onChange={(value) => handleLocalityChange(value || '')} disabled={!formValues.selectedProvinceId || localities.length === 0} withAsterisk />
                    <TextInput label="Código postal" value={formValues.postal_code} onChange={(e) => setFormValues({ ...formValues, postal_code: e.currentTarget.value })} />
                  </Stack>
                )}
                <Group justify="end">
                  <Button onClick={() => setFormValues({ ...formValues, activeStep: 1 })} disabled={!shippingInfoCompleted}>Continuar</Button>
                </Group>
              </Stack>
            </Stepper.Step>
            <Stepper.Step label="Pago">
              <Stack mt="md">
                <Select searchable label="Método de pago" data={[{ label: 'Transferencia bancaria', value: 'TRANSFERENCIA' }, { label: 'Acordar en el negocio', value: 'EN_LOCAL' }]} value={formValues.orderMethod} onChange={(value) => setFormValues({ ...formValues, orderMethod: (value === 'TRANSFERENCIA' || value === 'EN_LOCAL') ? value : 'EN_LOCAL' })} />
                
                {formValues.orderMethod === 'TRANSFERENCIA' && (
                  <Stack gap="xs">
                    {isLoadingBankInfo ? (
                        <Group justify="center" my="md">
                            <Loader size="sm" />
                            <Text size="sm">Cargando datos bancarios...</Text>
                        </Group>
                    ) : bankInfoError ? (
                        <Alert color="red" title="Error">No se pudieron cargar los datos bancarios. Por favor contacte al negocio.</Alert>
                    ) : businessData?.bankData && businessData.bankData.length > 0 ? (
                        <Stack gap="sm">
                            <Text size="sm" fw={500}>Cuentas disponibles para transferir:</Text>
                            {businessData.bankData.map((bank, index) => (
                                <Card key={index} withBorder shadow="sm" radius="md" p="sm">
                                    <Group justify="space-between" align="start">
                                        <Stack gap={2}>
                                            <Group gap="xs">
                                                <FaUniversity size={14} color="gray" />
                                                <Text size="sm" fw={700}>{bank.bank_name}</Text>
                                            </Group>
                                            <Text size="sm">CBU/CVU: {bank.account_number}</Text>
                                            <Text size="xs" c="dimmed">Titular: {bank.account_holder}</Text>
                                        </Stack>
                                        <CopyButton value={bank.account_number} timeout={2000}>
                                            {({ copied, copy }) => (
                                                <Tooltip label={copied ? 'Copiado' : 'Copiar CBU'} withArrow position="right">
                                                    <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                                                        {copied ? <FaCheck size={16} /> : <FaCopy size={16} />}
                                                    </ActionIcon>
                                                </Tooltip>
                                            )}
                                        </CopyButton>
                                    </Group>
                                </Card>
                            ))}
                        </Stack>
                    ) : (
                        <Alert color="yellow">No hay cuentas bancarias configuradas.</Alert>
                    )}
                    
                    <Divider my="xs" />
                    <Text size="sm" fw={500}>Adjunta tu comprobante de transferencia (imagen/PDF):</Text>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
                  </Stack>
                )}

                <Group justify="space-between" mt="md">
                  <Button variant="outline" onClick={() => setFormValues({ ...formValues, activeStep: 0 })}>Volver</Button>
                  <Button color="green" onClick={submitOrder} disabled={processingOrder || (formValues.orderMethod === 'TRANSFERENCIA' && !receiptFile)} loading={processingOrder}>Finalizar compra</Button>
                </Group>
              </Stack>
            </Stepper.Step>
          </Stepper>
        </Box>
      )}
    </Modal>
  )
}



export default Cart
