import { showNotification } from "@mantine/notifications";
import { baseUrl } from ".";

import { useQuery, useMutation } from "@tanstack/react-query";


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

export const useGetUsers = (page: number, limit: number, search?: string) => {
    return useQuery({
        queryKey: ["getUsers", page, limit, search],
        staleTime: 1000 * 60 * 10, 
        queryFn: async () => {
            const queryString = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search: search || "",
            }).toString();
            const response = await fetch(`${baseUrl}/users?${queryString}`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();
            return data;
        },
    })
}

export const useLogin = () => {
  return useMutation({
    mutationKey: ["login"],
    mutationFn: async ({ email, password }: { email: string, password: string }) => {
      const response = await fetch(`${baseUrl}/login`, {
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
      if (!response.ok){
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
      const response = await fetch(`${baseUrl}/register`, {
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
