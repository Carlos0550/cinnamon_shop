import { useState } from "react";
import { Box, Button, Group, Stack, Switch, TextInput, Textarea, Badge, Image, TagsInput, Select } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { baseUrl } from "@/components/Api";
import { getAllProducts, saveProduct } from "../Api/ProductsApi";

export type ProductFormValues = {
  title: string;
  name: string;
  price: string;
  tags?: string[];
  active: boolean;
  category?: string;
  description?: string;
  images: File[];
};

type ProductFormProps = {
  onCancel?: () => void;
};

export default function ProductForm({ onCancel }: ProductFormProps) {
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState<ProductFormValues>({
    title: "",
    name: "",
    price: "",
    active: true,
    tags: [],
    category: "",
    description: "",
    images: [],
  });

  const handleChangeValues = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormValues({
      ...formValues,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const removeImage = (index: number) => {
    setFormValues(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const { data: categories = [] } = useQuery({
    queryKey: ['categoriess'],
    queryFn: async () => {
      try {
        const res = await fetch(`${baseUrl}/categories`)
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error || "No se pudieron obtener las categorías");
        }
        console.log("Response format:", json);
        if (json.data && json.data.categories) {
          return json.data.categories;
        } else if (json.categories) {
          return json.categories;
        } else if (Array.isArray(json)) {
          return json;
        } else {
          console.log("Unexpected API response format:", json);
          return [];
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        notifications.show({
          title: "Error",
          message: message || "No se pudieron obtener las categorías",
          color: "red",
          autoClose: 3000,
        });
        return [];
      }
    }
  });

  const handleSubmit = useMutation({
    mutationFn: saveProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      notifications.show({
        title: "Éxito",
        message: "Producto guardado correctamente",
        color: "green",
        autoClose: 3000,
      });
      queryClient.prefetchQuery({
        queryKey: ["products"],
        queryFn: () => getAllProducts({ page: 1, limit: 10 })
      });
      onCancel?.();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      notifications.show({
        title: "Error",
        message: message || "No se pudo guardar el producto",
        color: "red",
        autoClose: 3000,
      });
    }
  })

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <Stack>
      <Group grow>
        <TextInput label="Título" name="title" placeholder="Ej. Auriculares Kuromi" value={formValues.title} onChange={handleChangeValues} required />
        <Switch name="active" checked={formValues.active} onChange={handleChangeValues} label="Producto activo" />
      </Group>
      <Group grow>
        <TextInput label="Precio" name="price" placeholder="Ej. 59.99" value={formValues.price} onChange={handleChangeValues} required />
        <Select
          label="Categoría"
          name="category" 
          placeholder="Selecciona una categoría"
          data={categories.map((cat: { id: string; title: string }) => ({ 
            value: cat.id, 
            label: capitalizeFirstLetter(cat.title)
          }))}
          value={formValues.category}
          onChange={(value) => setFormValues(prev => ({ ...prev, category: value || "" }))}
        />
      </Group>
      <Textarea name="description" label="Descripción" placeholder="Describe el producto" minRows={3} value={formValues.description} onChange={handleChangeValues} />
      
      <Group>
        <TagsInput
          name="tags"
          label="Etiquetas"
          placeholder="Añade etiquetas"
          value={formValues.tags}
          onChange={(value) => setFormValues(prev => ({ ...prev, tags: value || [] }))}
        />
      </Group>

      <Stack>
        <Dropzone
          name="images"
          onDrop={(files) => setFormValues(prev => ({ ...prev, images: [...prev.images, ...files] }))}
          accept={IMAGE_MIME_TYPE}
          maxSize={10 * 1024 * 1024}
        >
          <Group justify="center" gap="sm" style={{ pointerEvents: "none" }}>
            <Badge variant="light">Arrastra y suelta imágenes aquí</Badge>
            <TextInput disabled placeholder="o haz click para seleccionar" style={{ maxWidth: 240 }} />
          </Group>
        </Dropzone>
      </Stack>

      {formValues.images.length > 0 && (
        <Stack>
          <Group>
            <Badge variant="light">Imágenes: {formValues.images.length}</Badge>
          </Group>
          <Group gap="sm">
            {formValues.images.map((file, idx) => (
              <Box key={`${file.name}-${idx}`}>
                <Image src={URL.createObjectURL(file)} alt={`Imagen ${idx + 1}`} w={96} h={96} radius="sm" fit="cover" />
                <Button mt={6} size="xs" variant="light" color="red" onClick={() => removeImage(idx)}>Eliminar</Button>
              </Box>
            ))}
          </Group>
        </Stack>
      )}

      <Group justify="flex-end" mt="md">
        <Button onClick={() => handleSubmit.mutate(formValues)} loading={handleSubmit.isPending}>
          {handleSubmit.isPending ? "Guardando..." : "Guardar"}
        </Button>
      </Group>
    </Stack>
  );
}