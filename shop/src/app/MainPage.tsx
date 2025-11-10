
import CinnamonLoader from "@/Components/CinnamonLoader/CinnamonLoader"
import { Flex } from "@mantine/core"
import Home from "@/Components/Home/Home"
import useProducts, { Products } from "@/Api/useProducts"
import { useState } from "react"


function MainPage() {
  const [pagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })
  const {
    data,
    isLoading,
  } = useProducts({
    page: pagination.page,
    limit: pagination.limit,
    title: '',
  })

  const products: Products[] = data?.data?.products ?? []
  const total: number = data?.data?.pagination?.total ?? 0
  const computedPagination = { ...pagination, total }

  return (
    <Flex
      h={"100vh"}
      
      justify={isLoading ? "center" : "flex-start"}
      align={isLoading ? "center" : "flex-start"}
    >
      {isLoading ? (
        <CinnamonLoader />
      ) : (
        <Home products={products} pagination={computedPagination} />
      )}
    </Flex>
  )
}

export default MainPage