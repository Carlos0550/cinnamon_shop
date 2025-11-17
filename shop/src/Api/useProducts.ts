
import { useAppContext } from "@/providers/AppContext";
import { useQuery } from "@tanstack/react-query";

export type FetchProductsParams = {
    page: number;
    limit: number;
    title: string;
    categoryId?: string;
}

export interface ProductCategory{
    id: string,
    title: string,
    image: string
}

export interface Products {
    id: string,
    title: string,
    price: number,
    stock: number,
    images: string[],
    description: string,
    category: ProductCategory

}

export type ProductsResponse = {
    data: {
        products: Products[];
        pagination: {
            page: number;
            limit: number;
            total: number;
        };
    };
};

export default function useProducts(params: FetchProductsParams){

    const {
        utils: {
            baseUrl
        }
    } = useAppContext()
    return useQuery<ProductsResponse>({
        queryKey: ['products', params],
        queryFn: async (): Promise<ProductsResponse> => {
            const qp = new URLSearchParams({
                page: params.page.toString(),
                limit: params.limit.toString(),
            })
            if (params.title && params.title.trim().length > 0) {
                qp.append('title', params.title.trim())
            }
            if (params.categoryId) {
                qp.append('categoryId', params.categoryId)
            }
            const res = await fetch(`${baseUrl}/products/public?${qp}`)
            const data = await res.json();
            return data as ProductsResponse;
        },
        placeholderData: (previousData) => previousData
    })
}