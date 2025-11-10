
"use client";
import { Box, Flex } from "@mantine/core";

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
export default function Home({products, pagination}: Props) {   
    useEffect(()=>{
        console.log("Pagination =>", pagination)
        console.log("Product Data =>", products)
      },[pagination, products])
      
    return (
        <Box>
            <Flex p={20} wrap="wrap" justify="space-between" align="flex-start" h="100vh" w="100vw" gap={20}>
                {products.map((product) => (
                    <ProductsCards key={product.id} product={product} />
                ))}
            </Flex>
        </Box>
    )
}