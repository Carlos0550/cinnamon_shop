import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { SaleRequest } from "../Sales/SalesForm"
import { baseUrl } from "."
import { useAppContext } from "@/Context/AppContext"
import { showNotification } from "@mantine/notifications"

export const useSaveSale = () => {
    const queryClient = useQueryClient();
    const {
        auth: { token }
    } = useAppContext()
    return useMutation({
        mutationKey: ["save-sale"],
        mutationFn: async (request: SaleRequest) => {
            const api = new URL(baseUrl + "/sales/save")
            
            const result = await fetch(api, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                method: "POST",
                body: JSON.stringify(request),
            })

            return await result.json()
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["get-sales"] })
            if (data?.success) {
                showNotification({
                    message: "Venta guardada con éxito",
                    color: "green",
                })
            }
        },
        onError: (error: any) => {
            showNotification({
                message: (error as Error)?.message || "Error al guardar la venta",
                color: "red",
            })
        },
    })
}

export const useGetSales = (page: number = 1, per_page: number = 5) => {
    const {
        auth: { token }
    } = useAppContext()
    return useQuery({
        queryKey: ["get-sales", page, per_page],
        enabled: !!token,
        queryFn: async () => {
            const qs = new URLSearchParams({
                page: String(page),
                per_page: String(per_page),
            }).toString();
            const api = new URL(baseUrl + "/sales?" + qs)
            
            const result = await fetch(api, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                method: "GET",
            })

            return await result.json()
        }
    })
}