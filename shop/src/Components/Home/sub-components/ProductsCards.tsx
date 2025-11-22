"use client";
import { Products } from '@/Api/useProducts'
import { useAppContext } from '@/providers/AppContext'
import { Badge, Button, Card, Flex, Group, Image, Text } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { FaCartPlus, FaInfoCircle } from 'react-icons/fa'

type Props = {
    product: Products
}

function ProductsCards({ product }: Props) {
    const router = useRouter()
    const {
        utils: {
            isMobile,
        }
    } = useAppContext()
 
    const mobileCardWidth = "calc(50% - 10px)"; 
    return (
        <Card style={{ cursor: 'pointer' }} shadow="sm" radius="md" withBorder w={isMobile ? mobileCardWidth : 350} onClick={() => router.push(`/${product.id}`)}>
            <Card.Section>
                <Image
                    src={product.images[0]}
                    height={200}
                    alt={product.title}
                    fit="cover"
                />
            </Card.Section>

            <Group justify="space-between" mt="md" mb="xs">
                <Text fw={500}>{product.title}</Text>
                <Group>
                    <Badge color="pink">{product.category.title}</Badge>
                    <Badge color="green">En stock</Badge>
                </Group>
            </Group>

            {!isMobile && (
                <Text size="sm" c="dimmed">
                    {product.description.slice(0, 100) + "..."}
                </Text>
            )}

            {isMobile ? (
                <Group justify="space-evenly" mt={10} gap={10} wrap='nowrap'>
                <Button color="blue"><FaInfoCircle /></Button>
                <Button><FaCartPlus /></Button>
            </Group>
            ) : (
                <Flex
                    justify="space-evenly"
                    mt={10}
                    gap={10}
                    wrap='nowrap'
                >
                    <Button color="blue" leftSection={<FaInfoCircle />}>Más información</Button>
                    <Button color="green" leftSection={<FaCartPlus />}>Agregar</Button>
                </Flex>
            )}
        </Card>
    )
}

export default ProductsCards