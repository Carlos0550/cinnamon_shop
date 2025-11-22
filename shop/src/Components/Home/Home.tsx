

"use client";
import { Box, Flex, Title, Text, Container, Input, ActionIcon, NativeSelect, Loader, Stack } from "@mantine/core";

import useProducts, { Products } from "@/Api/useProducts";
import ProductsCards from "./sub-components/ProductsCards";
import { Categories, useCategories } from "@/Api/useCategories";
import CategoriesCards from "./sub-components/CategoriesCards";
import { useAppContext } from "@/providers/AppContext";
import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { FaShoppingCart } from "react-icons/fa";
import CinnamonLoader from "@/Components/CinnamonLoader/CinnamonLoader";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Home() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const initialTitle = useMemo(() => searchParams.get("title") || "", [searchParams])
    const initialCategoryId = useMemo(() => searchParams.get("categoryId") || "", [searchParams])
    const [pagination] = useState({
        page: 1,
        limit: 30,
        total: 0,
    })
    const [search, setSearch] = useState(initialTitle)
    const [debouncedSearch] = useDebouncedValue(search, 400)
    const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategoryId ? [initialCategoryId] : [])
    const { data, isLoading, isFetching } = useProducts({
        page: pagination.page,
        limit: pagination.limit,
        title: debouncedSearch,
        categoryId: selectedCategories[0]
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
    // Escribe filtros en la URL cuando cambian (debounced para título)
    useEffect(() => {
        const next = new URLSearchParams(Array.from(searchParams.entries()))
        if (debouncedSearch && debouncedSearch.trim().length > 0) {
            next.set("title", debouncedSearch.trim())
        } else {
            next.delete("title")
        }
        const cat = selectedCategories[0] || ""
        if (cat) {
            next.set("categoryId", cat)
        } else {
            next.delete("categoryId")
        }
        const qs = next.toString()
        router.replace(qs ? `${pathname}?${qs}` : pathname)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, selectedCategories])

    // Lee filtros desde la URL si cambian por navegación
    useEffect(() => {
        const spTitle = searchParams.get("title") || ""
        const spCat = searchParams.get("categoryId") || ""
        if (spTitle !== search) setSearch(spTitle)
        if (spCat !== (selectedCategories[0] || "")) setSelectedCategories(spCat ? [spCat] : [])
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams])

    if (isLoading) { 
        return (
            <Flex h={"100vh"} justify="center" align="center">
                <CinnamonLoader />
            </Flex>
        )
    }

    
    return (
        <Box >
            <Flex direction="column" justify={"center"}>
                <Box my={30}>
                    <Container size="xl">
                        <Title order={2} mb="xs">Categorías</Title>
                        <Text c="dimmed" mb="md">Explorá por categoría y encontrá lo que buscás.</Text>
                        <CategoriesCards categories={categories} />
                    </Container>
                </Box>

                <Box size="xl" p={10}>
                    <Flex direction={"column"} justify={"center"} align={"flex-start"}>
                        <Title order={2} mb={10}>
                            Nuestros productos
                        </Title>
                        <Text c="dimmed" mb="md">Busca por nombre, categoría o descripción.</Text>
                    </Flex>
                    <Flex gap={10} wrap={"wrap"}>
                        <Input
                            mb={10}
                            placeholder="Buscar"
                            w={isMobile ? "100%" : 300}
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                            rightSection={isFetching ? <Loader size="xs" /> : null}
                        />
                        <NativeSelect
                            mb={10}
                            value={selectedCategories[0]}
                            onChange={(e) => setSelectedCategories([e.currentTarget.value])}
                            data={[
                                { value: "", label: "Todos" },
                                ...categories.map((category) => ({
                                    value: category.id,
                                    label: capitalizeTexts(category.title),
                                }))
                            ]}
                        />
                    </Flex>
                </Box>
                <Flex wrap="wrap" justify="space-evenly" align="flex-start" mih={Array.isArray(products) && products.length > 0 ? "100vh" : "10vh"} flex={1} gap={20}>
                    {Array.isArray(products) && products.length > 0 ? (
                        products.map((product) => (
                            <ProductsCards key={product.id} product={product} />
                        ))
                    ) : (
                        <Stack align="center">
                            {isLoading ? (
                                <Loader size="xs" />
                            ) : (
                                <Text c="dimmed">No hay productos disponibles</Text>
                            )}
                        </Stack>
                    )}
                </Flex>
                <ActionIcon
                    variant="filled"
                    color="rose"
                    radius="xl"
                    size={isMobile ? "xl" : "xl"}
                    style={{ position: "fixed", right: isMobile ? 16 : 24, bottom: isMobile ? 16 : 24, zIndex: 1000 }}
                    aria-label="Carrito"
                >
                    <FaShoppingCart />
                </ActionIcon>
            </Flex>
        </Box>
    )
}