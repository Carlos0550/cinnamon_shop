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

export const useGetSales = (page: number = 1, per_page: number = 5, start_date?: string, end_date?: string, pending?: boolean) => {
    const {
        auth: { token }
    } = useAppContext()
    return useQuery({
        queryKey: ["get-sales", page, per_page, start_date, end_date, pending],
        enabled: !!token,
        queryFn: async () => {
            const params: Record<string, string> = {
                page: String(page),
                per_page: String(per_page),
            };
            if (start_date) params["start_date"] = start_date;
            if (end_date) params["end_date"] = end_date;
            if (pending) params["pending"] = "true";
            const qs = new URLSearchParams(params).toString();
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

export const useProcessSale = () => {
    const qc = useQueryClient();
    const { auth: { token } } = useAppContext();
    return useMutation({
        mutationKey: ['process_sale'],
        mutationFn: async (id: string) => {
            const res = await fetch(`${baseUrl}/sales/${id}/process`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
            const json = await res.json();
            if (!res.ok || !json?.success) throw new Error(json?.message || json?.err || 'process_failed');
            return json;
        },
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['get-sales'] }); showNotification({ message: 'Orden procesada y cliente notificado', color: 'green' }) },
        onError: (e: any) => { showNotification({ message: e?.message || 'Error al procesar orden', color: 'red' }) }
    })
}

export type SalesAnalyticsResponse = {
    range: { start_date: string; end_date: string; days: number };
    totals: { sales_count: number; revenue_total: number; avg_order_value: number };
    previous: { sales_count: number; revenue_total: number };
    growth: { revenue_percent: number; count_percent: number };
    timeseries: { by_day: { date: string; count: number; revenue: number }[] };
    breakdowns: {
        payment_methods: { method: string; count: number; revenue: number }[];
        sources: { source: string; count: number; revenue: number }[];
    };
}

export const useGetSalesAnalytics = (start_date?: string, end_date?: string) => {
    const {
        auth: { token }
    } = useAppContext()
    return useQuery<SalesAnalyticsResponse>({
        queryKey: ["get-sales-analytics", start_date, end_date],
        enabled: !!token,
        queryFn: async () => {
            const params: Record<string, string> = {};
            if (start_date) params["start_date"] = start_date;
            if (end_date) params["end_date"] = end_date;
            const qs = new URLSearchParams(params).toString();
            const api = new URL(baseUrl + "/sales/analytics" + (qs ? `?${qs}` : ""))

            const result = await fetch(api, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                method: "GET",
            })

            const json = await result.json();
            if (!result.ok || !json?.success) {
                throw new Error(json?.message || json?.err || "Error al obtener analíticas de ventas")
            }
            return json.analytics as SalesAnalyticsResponse;
        }
    })
}
