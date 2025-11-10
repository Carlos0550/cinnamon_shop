
import { Box, Flex, Title, Text, Container } from "@mantine/core";

import { Products } from "@/Api/useProducts";
import ProductsCards from "./sub-components/ProductsCards";
import { Categories } from "@/Api/useCategories";
import CategoriesCards from "./sub-components/CategoriesCards";

type Props = {
    products: Products[]
    pagination: {
        page: number,
        limit: number,
        total: number,
    }
    categories: Categories[]
}
export default function Home({ products, pagination, categories }: Props) {
    return (
        <Box>
            <Flex direction="column" justify={"center"}>
                <Box my={30}>
                    <Container size="xl">
                        <Title order={2} mb="xs">Categorías</Title>
                        <Text c="dimmed" mb="md">Explorá por categoría y encontrá lo que buscás.</Text>
                        <CategoriesCards categories={categories} />
                    </Container>
                </Box>

                <Container size="xl">
                    <Title order={2} mb={10}>
                        Explorá todo nuestro catálogo de productos
                    </Title>
                </Container>
                <Flex  wrap="wrap" justify="space-evenly" align="flex-start" h="100vh" w="100%" gap={20}>
                    {products.map((product) => (
                        <ProductsCards key={product.id} product={product} />
                    ))}
                </Flex>
            </Flex>
        </Box>
    )
}