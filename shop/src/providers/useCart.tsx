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

function useCart(baseUrl: string, token: string | null) {
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

    const log = (action: string, data?: unknown) => {
        console.log(`[Cart] ${action}`, data ? data : '')
    }

    const addProductIntoCart = useCallback(async (product: CartItem) => {
        log('Adding product', product)
        let newCart: Cart
        const existingItem = cart.items.find(item => item.product_id === product.product_id)
        const qtyToAdd = product.quantity > 0 ? product.quantity : 1
        
        if (existingItem) {
            // If product already exists, increment quantity
            const updatedItems = cart.items.map(item => 
                item.product_id === product.product_id 
                    ? { ...item, quantity: item.quantity + qtyToAdd }
                    : item
            )
            const newTotal = updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
            newCart = {
                ...cart,
                items: updatedItems,
                total: newTotal
            }
        } else {
            // If product doesn't exist, add new item
            const newItems = [...cart.items, { ...product, quantity: qtyToAdd }]
            const newTotal = newItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
            newCart = {
                ...cart,
                items: newItems,
                total: newTotal
            }
        }
        setCart(newCart)

        if (token) {
            try {
                log('Syncing add to server')
                await fetch(`${baseUrl}/cart/items`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ product_id: product.product_id, quantity: qtyToAdd })
                })
            } catch (e) {
                log('Error syncing add', e)
            }
        }
    }, [cart, token, baseUrl])

    const removeProductFromCart = useCallback(async (product_id: string) => {
        log('Removing product', product_id)
        const newItems = cart.items.filter(item => item.product_id !== product_id)
        const newTotal = newItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
        
        setCart({
            ...cart,
            items: newItems,
            total: newTotal
        })

        if (token) {
            try {
                log('Syncing remove to server')
                await fetch(`${baseUrl}/cart/items/${product_id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                })
            } catch (e) {
                log('Error syncing remove', e)
            }
        }
    }, [cart, token, baseUrl])

    const clearCart = useCallback(async () => {
        log('Clearing cart')
        setCart({
            ...cart,
            items: [],
            total: 0,
            promo_code: ""
        })

        if (token) {
            try {
                log('Syncing clear to server')
                await fetch(`${baseUrl}/cart`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                })
            } catch (e) {
                log('Error syncing clear', e)
            }
        }
    }, [cart, token, baseUrl])

    const updateQuantity = useCallback(async (product_id: string, quantity: number) => {
        log('Updating quantity', { product_id, quantity })
        if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            const items = cart.items.filter(item => item.product_id !== product_id)
            const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
            setCart({
                ...cart,
                items,
                total,
            })

            if (token) {
                try {
                    log('Syncing remove (qty <= 0) to server')
                    await fetch(`${baseUrl}/cart/items/${product_id}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` }
                    })
                } catch (e) {
                    log('Error syncing remove', e)
                }
            }
        } else {
            // Update quantity if greater than 0
            const items = cart.items.map(item => item.product_id === product_id ? { ...item, quantity } : item)
            const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
            setCart({
                ...cart,
                items,
                total,
            })

            if (token) {
                try {
                    log('Syncing update to server')
                    await fetch(`${baseUrl}/cart/items/${product_id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ quantity })
                    })
                } catch (e) {
                    log('Error syncing update', e)
                }
            }
        }
    }, [cart, token, baseUrl])

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
