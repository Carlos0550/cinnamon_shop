
import { Box, Flex, Title } from "@mantine/core";

import { Products } from "@/Api/useProducts";
import { useEffect } from "react";
import ProductsCards from "./sub-components/ProductsCards";

type Props = {
    products: Products[]
    pagination: {
        page: number,
        limit: number,
        total: number,
    }
}
export default function Home({ products, pagination }: Props) {
    useEffect(() => {
        console.log("Pagination =>", pagination)
        console.log("Product Data =>", products)
    }, [pagination, products])

    return (
        <Box>
            <Flex
               
                direction="column"
                justify={"center"}
            >
                <Title order={3} mb={20}>
                    Explorá todo nuestro catálogo de productos
                </Title>
                <Flex  wrap="wrap" justify="space-evenly" align="flex-start" h="100vh" w="100%" gap={20}>
                    {products.map((product) => (
                        <ProductsCards key={product.id} product={product} />
                    ))}
                </Flex>
            </Flex>
        </Box>
    )
}