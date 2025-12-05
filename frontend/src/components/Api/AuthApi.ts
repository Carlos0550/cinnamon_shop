import { showNotification } from "@mantine/notifications";
import { baseUrl } from ".";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/Context/AppContext";


export const useCreateUser = () => {
  return useMutation({
    mutationKey: ["createUser"],
    mutationFn: async ({ name, email, role_id }: { name: string, email: string, role_id: string }) => {
      const response = await fetch(`${baseUrl}/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          role_id,
        }),
      });

      const data = await response.json();
      return data;
    },
  })
}

export const useGetUsers = (page: number, limit: number, search?: string, type: 'user' | 'admin' = 'user') => {
  const {
    auth: {
      token
    }
  } = useAppContext()
  return useQuery({
    queryKey: ["getUsers", page, limit, search, type],
    //staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const queryString = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: search || "",
        type: type || 'user',
      }).toString();
      const response = await fetch(`${baseUrl}/users?${queryString}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    },
    enabled: !!token,
  })
}

export const useLogin = () => {
  return useMutation({
    mutationKey: ["login"],
    mutationFn: async ({ email, password }: { email: string, password: string }) => {
      const response = await fetch(`${baseUrl}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const data = await response.json();
      console.log(data)
      if (!response.ok) {
        showNotification({
          title: "Error al iniciar sesión",
          message: data?.message || data?.err || "Error desconocido",
          autoClose: 3000,
          color: "red",
        })
        return
      }
      return data;
    },
  })
}

export const useRegister = () => {
  return useMutation({
    mutationKey: ["register"],
    mutationFn: async ({ name, email, password }: { name: string, email: string, password: string }) => {
      const response = await fetch(`${baseUrl}/admin/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({} as any));
        throw new Error(err?.error || 'Error al registrarse');
      }
      const data = await response.json();
      return data;
    },
  })
}

export const useDisableUser = () => {
  const queryClient = useQueryClient();
  const {
    auth: { token }
  } = useAppContext();
  return useMutation({
    mutationKey: ["disableUser"],
    mutationFn: async ({ id, type }: { id: string; type: 'user' | 'admin' }) => {
      const res = await fetch(`${baseUrl}/users/${id}/disable?type=${type}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification({ title: "Error", message: data?.error || "No se pudo inhabilitar", color: "red" });
        throw new Error(data?.error || 'disable_failed');
      }
      queryClient.invalidateQueries({ queryKey: ["getUsers"] });
      return data;
    }
  })
}

export const useEnableUser = () => {
  const queryClient = useQueryClient();
  const {
    auth: { token }
  } = useAppContext();
  return useMutation({
    mutationKey: ["enableUser"],
    mutationFn: async ({ id, type }: { id: string; type: 'user' | 'admin' }) => {
      const res = await fetch(`${baseUrl}/users/${id}/enable?type=${type}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification({ title: "Error", message: data?.error || "No se pudo habilitar", color: "red" });
        throw new Error(data?.error || 'enable_failed');
      }
      queryClient.invalidateQueries({ queryKey: ["getUsers"] });
      return data;
    }
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const {
    auth: { token }
  } = useAppContext();
  return useMutation({
    mutationKey: ["deleteUser"],
    mutationFn: async ({ id, type }: { id: string; type: 'user' | 'admin' }) => {
      const res = await fetch(`${baseUrl}/users/${id}?type=${type}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification({ title: "Error", message: data?.error || "No se pudo eliminar", color: "red" });
        throw new Error(data?.error || 'delete_failed');
      }
      queryClient.invalidateQueries({ queryKey: ["getUsers"] });
      return data;
    }
  })
}
