import { baseUrl } from ".";

import { useQuery, useMutation } from "@tanstack/react-query";


export const useCreateUser = () => {
    return useMutation({
        mutationKey: ["createUser"],
        mutationFn: async ({ name, email, role_id }: { name: string, email: string, role_id: string }) => {
            const response = await fetch(`${baseUrl}/users/new`, {
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
            console.log("Response:", data);
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
            console.log("Response:", data);
            return data;
        },
    })
}