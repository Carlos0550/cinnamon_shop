import { baseUrl } from "./index"
import {
    useQuery
} from "@tanstack/react-query"

export const useGetAllCategories = () => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await fetch(`${baseUrl}/categories`)
            return res.json()
        }
    })
}