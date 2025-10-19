import { Badge, Box, Button, Group, Image, Stack, TextInput } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useEffect, useState } from "react";
import { baseUrl } from "../Api";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";

type CategoryFormValue = {
    title: string,
    images: File
}

type ProductFormProps = {
    initialValues?: Partial<CategoryFormValue>;
    closeForm: () => void;
};

function CategoriesForm({
    initialValues,
    closeForm
}: ProductFormProps) {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState<string>(initialValues?.title ?? "")
    const [image, setImage] = useState<File | null>(initialValues?.images ?? null)
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        console.log(image)
        console.log(title)
    }, [image, title])

    const handleSubmit = async () => {
        try {
            setLoading(true)
            const url = `${baseUrl}/categories`

            const formData = new FormData()

            formData.append("title", title)
            formData.append("image", image ?? new File([], ""))
            
            const result = await fetch(url, {
                method: "POST",
                body: formData
            })

            const data = await result.json()

            if (result.ok) {
                await queryClient.invalidateQueries({ queryKey: ["categories"] })
                closeForm()
                notifications.show({
                    title: "Categoría creada",
                    message: "La categoría se ha creado exitosamente",
                    color: "green",
                    autoClose: 3000,
                })
            } else {
                notifications.show({
                    title: "No se ha podido crear la categoría",
                    message: data.error,
                    color: "red",
                    autoClose: 3000,
                })
            }
        } catch (error) {
            console.log(error)
            notifications.show({
                title: "Error",
                message: "No se ha podido crear la categoría",
                color: "red",
                autoClose: 3000,
            })
        } finally {
            setLoading(false)
        }
    }
    return (
        <Stack>
            <Group grow>
                <TextInput label="Título" value={title} onChange={(e) => setTitle(e.currentTarget.value)} required />
                <Dropzone
                    onDrop={(files) => setImage(files[0] ?? null)}
                    accept={IMAGE_MIME_TYPE}
                    maxSize={10 * 1024 * 1024}
                >
                    <Group justify="center" gap="sm" style={{ pointerEvents: "none" }}>
                        <Badge variant="light">Arrastra y suelta imágenes aquí</Badge>
                        <TextInput disabled placeholder="o haz click para seleccionar" style={{ maxWidth: 240 }} />
                    </Group>
                </Dropzone>


            </Group>
            <Stack>
                <Group gap="sm">
                    {image && (
                        <Box key={`${image.name}`}>
                            <Image src={URL.createObjectURL(image)} alt={`Imagen`} w={96} h={96} radius="sm" fit="cover" />
                            <Button mt={6} size="xs" variant="light" color="red" onClick={() => setImage(null)}>Eliminar</Button>
                        </Box>
                    )}
                </Group>
            </Stack>

            <Group justify="flex-end" mt="md">
                <Button onClick={handleSubmit} loading={loading} disabled={loading}>Guardar</Button>
            </Group>
        </Stack>
    )
}

export default CategoriesForm

