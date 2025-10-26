import { showNotification } from "@mantine/notifications";
import { baseUrl } from ".";
import { useMutation } from "@tanstack/react-query";

export const PromoTypes = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
} as const;

export type PromoType = typeof PromoTypes[keyof typeof PromoTypes];

export type PromoRequest = {
    code?: string
    title?: string
    description?: string
    image?: string
    type?: PromoType
    value?: number
    max_discount?: number
    min_order_amount?: number
    start_date?: string
    end_date?: string
    is_active?: boolean
    usage_limit?: number
    usage_count?: number
    show_in_home?: boolean
    per_user_limit?: number
    categories?: string[]
    products?: string[]
}

export const useSubmitPromo = () => {
  return useMutation({
    mutationKey: ["submitPromo"],
    retryDelay: 1000,
    retry: (failureCount, error) => failureCount < 1,
    mutationFn: async ({ values, image }: { values: PromoRequest; image?: File }) => {
      const formData = new FormData();

      formData.append("code", values.code || "");
      formData.append("title", values.title || "");
      formData.append("description", values.description || "");
      formData.append("image", image ?? new File([], ""));
      formData.append("type", values.type || PromoTypes.PERCENTAGE);
      formData.append("value", String(values.value || 0));
      formData.append("max_discount", String(values.max_discount || 0));
      formData.append("min_order_amount", String(values.min_order_amount || 0));
      formData.append("start_date", values.start_date || "");
      formData.append("end_date", values.end_date || "");
      formData.append("is_active", String(values.is_active || false));
      formData.append("usage_limit", String(values.usage_limit || 0));
      formData.append("usage_count", String(values.usage_count || 0));
      formData.append("show_in_home", String(values.show_in_home || false));
      formData.append("per_user_limit", String(values.per_user_limit || 0));
      formData.append("categories", JSON.stringify(values.categories || []));
      formData.append("products", JSON.stringify(values.products || []));

      const url = new URL(baseUrl + "/promos");
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const rd = await response.json();
      if (response.status === 500) throw new Error(rd.error || rd.message || "Error interno del servidor");
      if (!response.ok) {
        const message = rd.error || rd.message || "Ocurrió un error, por favor intente de nuevo.";
        throw new Error(message);
      }
      return rd;
    },
    onSuccess: () => {
      showNotification({
        title: "Promo guardada",
        message: "La promo se ha guardado correctamente.",
        color: "green",
        autoClose: 3000,
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Error interno del servidor, por favor intente de nuevo.";
      showNotification({
        title: "Error al guardar la promo",
        message,
        color: "red",
        autoClose: 3000,
      });
    },
  });
};