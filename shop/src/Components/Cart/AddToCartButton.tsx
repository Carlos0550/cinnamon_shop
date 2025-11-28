"use client"
import { useState, useTransition } from "react"
import { Button, Loader } from "@mantine/core"
import { useCartActions } from "@/Components/Cart/Hooks/useCart"

export default function AddToCartButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)
  const busy = loading || isPending
  const { addToCart } = useCartActions()

  const handleClick = () => {
    startTransition(async () => {
      setLoading(true)
      try {
        await addToCart(productId)
      } finally {
        setLoading(false)
      }
    })
  }

  return (
    <Button variant="light" onClick={handleClick} disabled={busy} rightSection={busy ? <Loader size="xs" /> : null}>
      Agregar al carrito
    </Button>
  )
}