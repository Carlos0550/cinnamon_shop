
import { useAppContext } from "@/providers/AppContext";
import { useQuery } from "@tanstack/react-query";

export type FetchProductsParams = {
    page: number;
    limit: number;
    title: string;
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
                title: params.title,
            })
            const res = await fetch(`${baseUrl}/products/public?${qp}`)
            //espera artificial de 2 segundos
            await new Promise(resolve => setTimeout(resolve, 2000));
            const data = await res.json();
            return data as ProductsResponse;
        }
    })
}