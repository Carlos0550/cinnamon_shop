'use client'
import { useAppContext } from '@/providers/AppContext'
import { Modal, Box, Stack, Group, Image, Text, ActionIcon, Divider, Button, Stepper, TextInput, Checkbox, Select } from '@mantine/core'
import { useState, useEffect } from 'react'
import { FaMinus, FaPlus } from 'react-icons/fa'

type CartProps = {
  opened?: boolean
  onClose: () => void
}
function Cart({ opened = true, onClose }: CartProps) {
  const [shippingInfoCompleted, setShippingInfoCompleted] = useState(false)
  const {
    cart: { cart, clearCart, updateQuantity, formValues, setFormValues, processOrder },
    auth,
    utils,
  } = useAppContext()

  const formatCurrency = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)

  const [provinces, setProvinces] = useState<{ id: string; nombre: string }[]>([])
  const [localities, setLocalities] = useState<{ id: string; nombre: string }[]>([])
  const [processingOrder, setProcessingOrder] = useState(false)

  const initShipping = () => {

    const raw = localStorage.getItem('shipping_info') || '{}'
    if (!raw) return {
      pickup: false,
      name: '', email: '', phone: '', street: '', postal_code: '', city: '', province: '', selectedProvinceId: '', selectedLocalityId: '', orderMethod: 'EN_LOCAL', activeStep: 0, checkoutOpen: false,
    }
    const s = JSON.parse(raw)
    console.log(s)
    setFormValues((prev) => ({
      ...prev,
      pickup: !!s.pickup,
      name: s.name || '',
      email: s.email || '',
      phone: s.phone || '',
      street: s.street || '',
      postal_code: s.postal_code || '',
      city: s.city || '',
      province: s.province || '',
      selectedProvinceId: '',
      selectedLocalityId: '',
      orderMethod: s.pickup ? 'EN_LOCAL' : 'TRANSFERENCIA',
      activeStep: 0,
      checkoutOpen: true,
    }))
    if (auth?.state?.user) {
      const u = auth.state.user
      console.log(u)
      if (!s.name || !s.email) {
        const nv = { ...formValues, name: formValues.name || (u.name || ''), email: formValues.email || (u.email || '') }
        setFormValues(nv)
      }
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('https://apis.datos.gob.ar/georef/api/provincias?campos=id,nombre&max=100')
        const json = await res.json().catch(() => null)
        const list = Array.isArray(json?.provincias) ? json.provincias : []
        setProvinces(list)
      } catch { }
    })()
  }, [])

  const handleProvinceChange = async (provId: string) => {
    setFormValues({ ...formValues, selectedProvinceId: provId, province: (provinces.find((x) => x.id === provId)?.nombre || ''), selectedLocalityId: '', city: '' })
    setLocalities([])
    try {
      const res = await fetch(`https://apis.datos.gob.ar/georef/api/municipios?provincia=${encodeURIComponent(provId)}&campos=id,nombre&max=500`)
      const json = await res.json().catch(() => null)
      const list = Array.isArray(json?.municipios) ? json.municipios : []
      setLocalities(list)
    } catch { }
  }

  const handleLocalityChange = (locId: string) => {
    const l = localities.find((x) => x.id === locId)
    setFormValues({ ...formValues, selectedLocalityId: locId, city: l?.nombre || '' })
  }

  const submitOrder = async () => {
    setProcessingOrder(true)
    const rs = await processOrder(utils.baseUrl, auth.state.token)
    if (rs.ok) {
      setProcessingOrder(false)
      onClose()
    }
    setProcessingOrder(false)
  }

  useEffect(()=>{
    if(formValues.pickup){
      
      
    if(!formValues.name || !formValues.email || !formValues.phone || !formValues.street || !formValues.postal_code || !formValues.city || !formValues.province || !formValues.selectedProvinceId || !formValues.selectedLocalityId){
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShippingInfoCompleted(false)
    }
    }
    setShippingInfoCompleted(true)
    
  },[formValues])

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
                        {item.price_changed && (
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
            <Button color="green" onClick={initShipping}>Continuar</Button>
          </Group>
        </Group>
      </Box>
      {formValues.checkoutOpen && (
        <Box mt="md">
          <Stepper active={formValues.activeStep} onStepClick={(step) => setFormValues({ ...formValues, activeStep: step })} allowNextStepsSelect={false} size="sm">
            <Stepper.Step label="Datos del cliente">
              <Stack>
                <TextInput label="Nombre" value={formValues.name} onChange={(e) => setFormValues({ ...formValues, name: e.currentTarget.value })} required />
                <TextInput label="Correo" value={formValues.email} onChange={(e) => setFormValues({ ...formValues, email: e.currentTarget.value })} required />
                <TextInput label="Teléfono" value={formValues.phone} onChange={(e) => setFormValues({ ...formValues, phone: e.currentTarget.value })} />
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
              <Stack>
                <Select searchable label="Método de pago" data={[{ label: 'Transferencia bancaria', value: 'TRANSFERENCIA' }, { label: 'Acordar en el negocio', value: 'EN_LOCAL' }]} value={formValues.orderMethod} onChange={(value) => setFormValues({ ...formValues, orderMethod: (value === 'TRANSFERENCIA' || value === 'EN_LOCAL') ? value : 'EN_LOCAL' })} />
                <Group justify="space-between">
                  <Button variant="outline" onClick={() => setFormValues({ ...formValues, activeStep: 0 })}>Volver</Button>
                  <Button color="green" onClick={submitOrder} disabled={processingOrder} loading={processingOrder}>Confirmar compra</Button>
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
