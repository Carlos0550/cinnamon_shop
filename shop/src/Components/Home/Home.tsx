
import { Box, Flex, Title, Text, Container, Input, MultiSelect } from "@mantine/core";

import useProducts, { Products } from "@/Api/useProducts";
import ProductsCards from "./sub-components/ProductsCards";
import { Categories, useCategories } from "@/Api/useCategories";
import CategoriesCards from "./sub-components/CategoriesCards";
import { useAppContext } from "@/providers/AppContext";
import { useState } from "react";
import CinnamonLoader from "@/Components/CinnamonLoader/CinnamonLoader";

export default function Home() {
    const [pagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
    })
    const { data, isLoading } = useProducts({
        page: pagination.page,
        limit: pagination.limit,
        title: '',
    })
    const { data: categoriesData } = useCategories()
    const categories: Categories[] = categoriesData?.data ?? []
    const products: Products[] = data?.data?.products ?? []
    const {
        utils: {
            capitalizeTexts,
            isMobile
        }
    } = useAppContext()
    if (isLoading) {
        return (
            <Flex h={"100vh"} justify="center" align="center">
                <CinnamonLoader />
            </Flex>
        )
    }
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