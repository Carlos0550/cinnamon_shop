import { Badge, Box, Button, Group, Image, Stack, TextInput } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { useCreateCategory } from "../Api/CategoriesApi";
import { useState } from "react";

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
    const [title, setTitle] = useState<string>(initialValues?.title ?? "")
    const [image, setImage] = useState<File | null>(initialValues?.images ?? null)
    const { mutate, isPending } = useCreateCategory()

    const handleSubmit = () => {
        if (!title || !image) {
            notifications.show({
                message: "Por favor, complete todos los campos",
                color: "red"
            })
            return
        }
        mutate({ title, images: image, closeForm })
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
                <Button onClick={handleSubmit} loading={isPending} disabled={isPending}>Guardar</Button>
            </Group>
        </Stack>
    )
}

export default CategoriesForm

