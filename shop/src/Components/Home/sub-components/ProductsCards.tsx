import { Products } from '@/Api/useProducts'
import { useAppContext } from '@/providers/AppContext'
import { Badge, Button, Card, Flex, Group, Image, Text } from '@mantine/core'

type Props = {
    product: Products
}

function ProductsCards({ product }: Props) {
    const {
        utils: {
            isMobile,
            windowWidth
        }
    } = useAppContext()
    const smallPhone = windowWidth < 375;
    const mobileCardWidth = smallPhone ? "100%" : "calc(50% - 10px)"; 
    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder w={isMobile ? mobileCardWidth : 350}>
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

            <Text size="sm" c="dimmed">
                {product.description.slice(0, 100) + "..."}
            </Text>

            <Flex justify="space-evenly" mt={10} gap={10} direction={isMobile ? "column" : "row"}>
                <Button color="blue" >
                    Más detalles
                </Button>
                <Button>Agregar al carrito</Button>
            </Flex>
        </Card>
    )
}

export default ProductsCards