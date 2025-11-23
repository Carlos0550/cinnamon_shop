import { useCallback, useEffect, useState } from "react"

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

function useCart() {
    const [cart, setCart] = useState<Cart>({
        items: [],
        total: 0,
        promo_code: ""
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
        console.log(cart)
    },[cart])

  return {
    cart,
    addProductIntoCart,
    removeProductFromCart,
    clearCart,
    updateQuantity
  }
}

export default useCart