"use client";
import { Products } from '@/Api/useProducts'
import AddToCartButton from '@/Components/Cart/AddToCartButton';
import { useAppContext } from '@/providers/AppContext'
import { Badge, Button, Card, Flex, Group, Text, Loader } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { FaInfoCircle } from 'react-icons/fa'
import { useState } from 'react'
import Image from 'next/image';
type Props = {
    product: Products
    priority?: boolean
}

function ProductsCards({ product, priority = false }: Props) {
    const router = useRouter()
    const {
        utils: {
            isMobile,
        },

    } = useAppContext()
    const [navigating, setNavigating] = useState(false)
    const [imageLoading, setImageLoading] = useState(true)
 
    const mobileCardWidth = "calc(50% - 10px)"; 

    const renderLoader = () => (
        <Flex align="center" justify="center" style={{ position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.9)', zIndex: 1 }}>
            <Loader type="bars" />
        </Flex>
    )
    return (
        <Card shadow="sm" radius="md" withBorder w={isMobile ? mobileCardWidth : 350}>
            <Card.Section style={{ position: 'relative', paddingBottom: '75%', height: '250px' }}>
                {imageLoading && renderLoader()}
                <Image
                    src={product.images[0]}
                    fill
                    //sizes="(max-width: 768px) 50vw, 350px"
                    style={{ objectFit: 'cover' }}
                    onLoad={() => setImageLoading(false)}
                    priority={priority}
                    alt={product.title}
                    onLoadingComplete={() => setNavigating(false)}
                />
            </Card.Section>

            <Group justify="space-between" mt="md" mb="xs">
                <div>
                    <Text fw={500}>{product.title}</Text>
                    <Text fw={700} size="lg">${product.price}</Text>
                </div>
                <Group>
                    <Badge >{product.category.title}</Badge>
                    <Badge variant="outline">En stock</Badge>
                </Group>
            </Group>

            {!isMobile && (
                <Text size="sm" c="dimmed">
                    {product.description.slice(0, 100) + "..."}
                </Text>
            )}

            {isMobile ? (
                <Flex justify="space-evenly" mt={10} gap={10} wrap='wrap'>
                    <Button onClick={() => { setNavigating(true); router.push(`/${product.id}`) }} leftSection={<FaInfoCircle />} fullWidth disabled={navigating} rightSection={navigating ? <Loader size="xs" /> : null}>Ver más</Button>
                    <AddToCartButton productId={product.id} />
                </Flex>
            ) : (
                <Flex
                    justify="space-evenly"
                    mt={10}
                    gap={10}
                    wrap='nowrap'
                >
                    <Button onClick={() => { setNavigating(true); router.push(`/${product.id}`) }} leftSection={<FaInfoCircle />} disabled={navigating} rightSection={navigating ? <Loader size="xs" /> : null}>Más info</Button>
                    <AddToCartButton productId={product.id} />
                </Flex>
            )}
        </Card>
    )
}

export default ProductsCards
