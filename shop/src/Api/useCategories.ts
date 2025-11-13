import { useAppContext } from "@/providers/AppContext"
import { useQuery } from "@tanstack/react-query"
import { ProductCategory } from "./useProducts"

export interface CategoriesResponse {
    data: ProductCategory[];
}

export interface Categories {
    id: string,
    title: string,
    image?: string
    
}

export const useCategories = () => {
    ///public/categories
    const {
        utils: {
            baseUrl
        }
    } = useAppContext()
    return useQuery<CategoriesResponse>({
        queryKey: ['categories'],
        queryFn: async (): Promise<CategoriesResponse> => {
            const res = await fetch(`${baseUrl}/products/public/categories`)
            const data = await res.json();
            return data as CategoriesResponse;
        }
    })
}