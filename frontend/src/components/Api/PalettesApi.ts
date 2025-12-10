import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/Context/AppContext";
import { notifications } from "@mantine/notifications";
import { baseUrl } from "./index";

export type ColorPalette = {
  id: string;
  name: string;
  colors: string[];
  is_active: boolean;
  use_for_admin: boolean;
  use_for_shop: boolean;
};

export const useListPalettes = () => {
  const { auth: { token } } = useAppContext();
  return useQuery<ColorPalette[], Error>({
    queryKey: ["palettes"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/palettes`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error obteniendo paletas");
      return json as ColorPalette[];
    }
  });
};

export const useCreatePalette = () => {
  const qc = useQueryClient();
  const { auth: { token } } = useAppContext();
  return useMutation({
    mutationKey: ["createPalette"],
    mutationFn: async (payload: { name: string; colors: string[]; is_active?: boolean }) => {
      const res = await fetch(`${baseUrl}/palettes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error creando paleta");
      return json as ColorPalette;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["palettes"] }); notifications.show({ message: "Paleta creada", color: "green" }); },
    onError: (e: Error) => notifications.show({ message: e.message, color: "red" })
  });
};

export const useUpdatePalette = () => {
  const qc = useQueryClient();
  const { auth: { token } } = useAppContext();
  return useMutation({
    mutationKey: ["updatePalette"],
    mutationFn: async ({ id, payload }: { id: string; payload: { name: string; colors: string[]; is_active?: boolean } }) => {
      const res = await fetch(`${baseUrl}/palettes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error actualizando paleta");
      return json as ColorPalette;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["palettes"] }); notifications.show({ message: "Paleta actualizada", color: "green" }); },
    onError: (e: Error) => notifications.show({ message: e.message, color: "red" })
  });
};

export const useActivatePalette = () => {
  const qc = useQueryClient();
  const { auth: { token } } = useAppContext();
  return useMutation({
    mutationKey: ["activatePalette"],
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await fetch(`${baseUrl}/palettes/${id}/activate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ active })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error actualizando estado");
      return json as ColorPalette;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["palettes"] }); },
    onError: (e: Error) => notifications.show({ message: e.message, color: "red" })
  });
};

export const useSetUsage = () => {
  const qc = useQueryClient();
  const { auth: { token } } = useAppContext();
  return useMutation({
    mutationKey: ["setPaletteUsage"],
    mutationFn: async ({ paletteId, target }: { paletteId: string; target: "admin" | "shop" }) => {
      const res = await fetch(`${baseUrl}/palettes/use`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paletteId, target })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error configurando uso");
      return json;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["palettes"] }); notifications.show({ message: "Uso actualizado", color: "green" }); },
    onError: (e: Error) => notifications.show({ message: e.message, color: "red" })
  });
};

export const fetchActivePalette = async (target: "admin" | "shop") => {
  const res = await fetch(`${baseUrl}/theme/palette/${target}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Error obteniendo paleta activa");
  return json as ColorPalette;
};

export const useGeneratePalette = () => {
  const qc = useQueryClient();
  const { auth: { token } } = useAppContext();
  return useMutation({
    mutationKey: ["generatePalette"],
    mutationFn: async (prompt: string) => {
      const res = await fetch(`${baseUrl}/palettes/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error generando paleta");
      return json as ColorPalette;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["palettes"] }); notifications.show({ message: "Paleta generada", color: "green" }); },
    onError: (e: Error) => notifications.show({ message: e.message, color: "red" })
  });
};

export const useRandomPalette = () => {
  const qc = useQueryClient();
  const { auth: { token } } = useAppContext();
  return useMutation({
    mutationKey: ["randomPalette"],
    mutationFn: async (name?: string) => {
      const res = await fetch(`${baseUrl}/palettes/random`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error generando paleta aleatoria");
      return json as ColorPalette;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["palettes"] }); notifications.show({ message: "Paleta aleatoria creada", color: "green" }); },
    onError: (e: Error) => notifications.show({ message: e.message, color: "red" })
  });
};
