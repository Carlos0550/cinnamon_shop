
import CinnamonLoader from "@/Components/CinnamonLoader/CinnamonLoader"
import { Flex } from "@mantine/core"
import Home from "@/Components/Home/Home"
import useProducts, { Products } from "@/Api/useProducts"
import { useEffect, useState } from "react"


function MainPage() {
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  const [productData, setProductData] = useState<Products[]>([])

  const {
    data,
    isLoading,
    error,
  } = useProducts({
    page: pagination.page,
    limit: pagination.limit,
    title: '',
  })

  useEffect(() => {
    if (!data) return;
    if (Array.isArray((data as any).data?.products)) {
      setProductData((data as any).data.products as Products[]);
    }
    if (typeof (data as any).data?.pagination?.total === "number") {
      setPagination(prev => ({ ...prev, total: (data as any).data.pagination.total }));
    }
  }, [data])

  return (
    <Flex
      h={"100vh"}
      w={"100vw"}
      justify={isLoading ? "center" : "flex-start"}
      align={isLoading ? "center" : "flex-start"}
    >
      {
        isLoading ? <CinnamonLoader /> : <Home products={productData} pagination={pagination} />
      }
    </Flex>
  )
}

export default MainPage