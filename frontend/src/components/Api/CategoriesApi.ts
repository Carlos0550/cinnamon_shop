import { useAppContext } from "@/Context/AppContext"
import { baseUrl } from "./index"
import {
    useMutation,
    useQuery,
    useQueryClient
} from "@tanstack/react-query"
import { notifications } from "@mantine/notifications"

export const useGetAllCategories = () => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await fetch(`${baseUrl}/products/categories`)
            return res.json()
        }
    })
}

export const useCreateCategory = () => {
    const {
        auth:{
            token
        }
    } = useAppContext()
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationKey: ["createCategory"],
        mutationFn: async (values: { title: string, images: File, closeForm: () => void }) => {
            const formData = new FormData()
            formData.append("title", values.title)
            formData.append("image", values.images)
            const response = await fetch(`${baseUrl}/products/categories`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            })
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`)
            }
            
            const result = await response.json()
            return { ...result, closeForm: values.closeForm }
        },
        onSuccess: (data) => {
            console.log(data)
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            notifications.show({
                message: "Categoría creada con éxito",
                color: "green"
            })
            data.closeForm()
        },
        onError: (error: Error) => {
            notifications.show({
                message: error?.message ?? "Error al crear la categoría",
                color: "red"
            })
        }
    })
}