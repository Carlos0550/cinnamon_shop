import { useCallback, useEffect, useState } from "react"
import { showNotification } from "@mantine/notifications"

export type CartItem = {
    product_id: string,
    product_name: string,
    price: number,
    quantity: number,
    image_url: string,
    price_changed: boolean,

}

export type Cart = {
    items: CartItem[],
    total: number,
    promo_code?: string
}

export type OrderMethod = 'EN_LOCAL' | 'TRANSFERENCIA'
export type CheckoutFormValues = {
    pickup: boolean,
    name: string,
    email: string,
    phone: string,
    street: string,
    postal_code: string,
    city: string,
    province: string,
    selectedProvinceId: string,
    selectedLocalityId: string,
    orderMethod: OrderMethod,
    activeStep: number,
    checkoutOpen: boolean,
}

function useCart() {
    const [cart, setCart] = useState<Cart>(() => {
        if (typeof window === 'undefined') return { items: [], total: 0, promo_code: "" }
        try {
            const raw = localStorage.getItem('shop_cart')
            if (!raw) return { items: [], total: 0, promo_code: "" }
            const parsed = JSON.parse(raw)
            return { items: Array.isArray(parsed.items) ? parsed.items : [], total: Number(parsed.total) || 0, promo_code: parsed.promo_code || "" }
        } catch {
            return { items: [], total: 0, promo_code: "" }
        }
    })

    const [formValues, setFormValues] = useState<CheckoutFormValues>({
        pickup: false,
        name: '',
        email: '',
        phone: '',
        street: '',
        postal_code: '',
        city: '',
        province: '',
        selectedProvinceId: '',
        selectedLocalityId: '',
        orderMethod: 'EN_LOCAL',
        activeStep: 0,
        checkoutOpen: false,
    })

    const addProductIntoCart = useCallback((product: CartItem) => {
        setCart({
            ...cart,
            items: [...cart.items, product],
            total: cart.total + product.price
        })
    }, [cart])

    const removeProductFromCart = useCallback((product_id: string) => {
        setCart({
            ...cart,
            items: cart.items.filter(item => item.product_id !== product_id),
            total: cart.total - (cart.items.find(item => item.product_id === product_id)?.price ?? 0)
        })
    }, [cart])

    const clearCart = useCallback(() => {
        setCart({
            ...cart,
            items: [],
            total: 0,
            promo_code: ""
        })
    }, [cart])

    const updateQuantity = useCallback((product_id: string, quantity: number) => {
        const items = cart.items.map(item => item.product_id === product_id ? { ...item, quantity } : item)
        const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
        setCart({
            ...cart,
            items,
            total,
        })
    }, [cart])

    useEffect(() => {
        try {
            localStorage.setItem('shop_cart', JSON.stringify(cart))
        } catch {}
    },[cart])

    const processOrder = useCallback(async (baseUrl: string, token: string | null) => {
        const items = cart.items.map(it => ({ product_id: it.product_id, quantity: it.quantity }))
        if (items.length === 0) {
            showNotification({ title: 'Carrito vacío', message: 'No hay productos para procesar la orden.', color: 'yellow', autoClose: 3000 })
            return { ok: false }
        }
        const payload = {
            items,
            payment_method: formValues.orderMethod,
            customer: {
                name: formValues.name,
                email: formValues.email,
                phone: formValues.phone,
                street: formValues.street,
                postal_code: formValues.postal_code,
                city: formValues.city,
                province: formValues.province,
                pickup: formValues.pickup,
            }
        }
        try {
            const res = await fetch(`${baseUrl}/orders/create`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(payload) })
            const json = await res.json().catch(() => null)
            if (!res.ok || !json?.ok) {
                showNotification({ title: 'Pago fallido', message: 'No se pudo procesar la orden.', color: 'red', autoClose: 3000 })
                return { ok: false }
            }
            try { localStorage.setItem('shipping_info', JSON.stringify({ name: formValues.name, email: formValues.email, phone: formValues.phone, street: formValues.street, postal_code: formValues.postal_code, city: formValues.city, province: formValues.province, pickup: formValues.pickup })) } catch {}
            clearCart()
            setFormValues({ pickup: false, name: '', email: '', phone: '', street: '', postal_code: '', city: '', province: '', selectedProvinceId: '', selectedLocalityId: '', orderMethod: 'EN_LOCAL', activeStep: 0, checkoutOpen: false })
            showNotification({ title: 'Pago confirmado', message: 'Tu compra fue procesada correctamente.', color: 'green', autoClose: 3000 })
            return { ok: true, order_id: json?.order_id, total: json?.total }
        } catch {
            showNotification({ title: 'Error de conexión', message: 'No se pudo contactar al servidor.', color: 'red', autoClose: 3000 })
            return { ok: false }
        }
    }, [cart.items, formValues, clearCart])

    const syncWithServer = useCallback(async (baseUrl: string, token: string | null) => {
        if (!token) return
        const items = cart.items.map(it => ({ product_id: it.product_id, quantity: it.quantity, price: it.price }))
        try {
            if (items.length > 0) {
                await fetch(`${baseUrl}/cart/merge`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ items }) })
            }
            const res = await fetch(`${baseUrl}/cart`, { headers: { Authorization: `Bearer ${token}` } })
            const json = await res.json().catch(() => null)
            const serverCart = json?.cart
            if (serverCart && Array.isArray(serverCart.items)) {
                const mappedItems: CartItem[] = serverCart.items.map((it: { productId: string; product?: { title?: string; price?: number; images?: string[] }; quantity?: number; price_has_changed?: boolean }) => ({ product_id: it.productId, product_name: it.product?.title || '', price: Number(it.product?.price) || 0, quantity: Number(it.quantity) || 1, image_url: Array.isArray(it.product?.images) ? (it.product?.images?.[0] || '') : '', price_changed: !!it.price_has_changed }))
                const total = mappedItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
                setCart({ items: mappedItems, total, promo_code: cart.promo_code })
            }
        } catch {}
    }, [cart])

  return {
    cart,
    formValues,
    setFormValues,
    addProductIntoCart,
    removeProductFromCart,
    clearCart,
    updateQuantity,
    syncWithServer,
    processOrder
  }
}

export default useCart
