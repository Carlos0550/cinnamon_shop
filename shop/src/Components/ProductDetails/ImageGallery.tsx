"use client";
import { Image, Group, Stack } from "@mantine/core"
import { useState } from "react"

type Props = {
  images?: string[]
  title: string
}

export default function ImageGallery({ images = [], title }: Props) {
  const [selected, setSelected] = useState<number>(0)
  const main = images?.[selected] || images?.[0] || "/logo.png"

  return (
    <Stack>
      <Image src={main} alt={title} radius="md" fit="cover" h={320} />
      {Array.isArray(images) && images.length > 1 && (
        <Group gap="xs">
          {images.map((url, idx) => (
            <Image
              key={`${url}-${idx}`}
              src={url}
              alt={`Imagen ${idx + 1}`}
              radius="sm"
              fit="cover"
              w={84}
              h={84}
              style={{ cursor: "pointer", outline: idx === selected ? "2px solid var(--mantine-color-pink-5)" : "none" }}
              onClick={() => setSelected(idx)}
            />
          ))}
        </Group>
      )}
    </Stack>
  )
}