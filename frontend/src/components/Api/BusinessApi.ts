import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/Context/AppContext";
import { notifications } from "@mantine/notifications";
import { baseUrl } from "./index";

export type BankData = {
  bank_name: string;
  account_number: string;
  account_holder: string;
};

export type BusinessData = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  description?: string;
  bankData: BankData[];
};

export const useGetBusiness = () => {
  const { auth: { token } } = useAppContext();
  return useQuery<BusinessData | null, Error>({
    queryKey: ["business"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/business`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) return null;
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error obteniendo negocio");
      return json as BusinessData;
    }
  });
};

export const getPublicBusiness = async (): Promise<BusinessData | null> => {
  try {
    const res = await fetch(`${baseUrl}/business/public`);
    if (res.status === 404) return null;
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Error obteniendo negocio");
    return json as BusinessData;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const useCreateBusiness = () => {
  const queryClient = useQueryClient();
  const { auth: { token } } = useAppContext();
  return useMutation({
    mutationKey: ["createBusiness"],
    mutationFn: async (payload: BusinessData) => {
      const res = await fetch(`${baseUrl}/business`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error creando negocio");
      return json as BusinessData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business"] });
      notifications.show({ message: "Negocio creado", color: "green" });
    },
    onError: (e: Error) => {
      notifications.show({ message: e.message || "Error", color: "red" });
    }
  });
};

export const useGenerateDescription = () => {
  const { auth: { token } } = useAppContext();
  return useMutation({
    mutationKey: ["generateDescription"],
    mutationFn: async ({ name, city, type }: { name: string; city: string; type?: string }) => {
      const res = await fetch(`${baseUrl}/business/generate-description`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, city, type })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error generando descripción");
      return json.description as string;
    },
    onError: (e: Error) => {
      notifications.show({ message: e.message || "Error", color: "red" });
    }
  });
};

export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();
  const { auth: { token } } = useAppContext();
  return useMutation({
    mutationKey: ["updateBusiness"],
    mutationFn: async ({ id, payload }: { id: string; payload: BusinessData }) => {
      const res = await fetch(`${baseUrl}/business/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error actualizando negocio");
      return json as BusinessData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business"] });
      notifications.show({ message: "Negocio actualizado", color: "green" });
    },
    onError: (e: Error) => {
      notifications.show({ message: e.message || "Error", color: "red" });
    }
  });
};

