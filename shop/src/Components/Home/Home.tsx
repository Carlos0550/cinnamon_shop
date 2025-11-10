
import { Box, Flex, Title, Text, Container, Input, MultiSelect } from "@mantine/core";

import { Products } from "@/Api/useProducts";
import ProductsCards from "./sub-components/ProductsCards";
import { Categories } from "@/Api/useCategories";
import CategoriesCards from "./sub-components/CategoriesCards";
import { useAppContext } from "@/providers/AppContext";

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
    const {
        utils: {
            capitalizeTexts,
            isMobile
        }
    } = useAppContext()
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

                {isMobile ? (
                    <Box size="xl" p={10}>
                    <Flex direction={"column"} justify={"center"} align={"flex-start"}>
                        <Title order={2} mb={10}>
                            Nuestros productos
                        </Title>
                        <Text c="dimmed" mb="md">Busca por nombre, categoría o descripción.</Text>
                    </Flex>
                    <Flex gap={10} wrap={"wrap"}>
                        <Input mb={10} placeholder="Buscar" w={isMobile ? "100%" : 300} />
                        <MultiSelect mb={10} searchable placeholder="Categorías" w={isMobile ? "100%" : 300} data={categories.map((category) => ({
                            value: category.id,
                            label: capitalizeTexts(category.title),
                        }))} />
                    </Flex>
                </Box>
                ) : (
                    <Flex direction={"column"} justify={"center"} align={"flex-start"}>
                        <Title order={2} mb={10}>
                            Nuestros productos
                        </Title>
                        <Text c="dimmed" mb="md">Explorá todo nuestro catálogo de productos usando el buscador o filtrá por categorías.</Text>
                    </Flex>
                )}
                <Flex wrap="wrap" justify="space-evenly" align="flex-start" h="100vh"  flex={1} gap={20}>
                    {products.map((product) => (
                        <ProductsCards key={product.id} product={product} />
                    ))}
                </Flex>
            </Flex>
        </Box>
    )
}