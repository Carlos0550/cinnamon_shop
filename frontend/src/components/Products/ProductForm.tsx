import { useEffect, useState } from "react";
import { Box, Button, Group, Stack, TextInput, Textarea, Badge, Image, TagsInput, Select, Switch, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useGetAllCategories } from "../Api/CategoriesApi";

import { useSaveProduct, useUpdateProduct, type Product, type ProductState } from "../Api/ProductsApi";

export type ProductFormValues = {
  title: string;
  price: string;
  tags?: string[];
  active: boolean;
  category?: string;
  description?: string;
  images: File[];
  existingImageUrls: string[];
  deletedImageUrls: string[];
  productId?: string;
  state: ProductState;
  fillWithAI?: boolean;
};

type ProductFormProps = {
  onCancel?: () => void;
  onSuccess?: () => void;
};

const PRODUCT_STATE_META: Record<ProductState, { label: string; color: string }> = {
  active: { label: "Activo", color: "green" },
  inactive: { label: "Inactivo", color: "gray" },
  draft: { label: "Borrador", color: "orange" },
  out_stock: { label: "Agotado", color: "red" },
  deleted: { label: "Eliminado", color: "red" },
};

const PRODUCT_STATE_OPTIONS: { value: ProductState; label: string }[] = (
  Object.keys(PRODUCT_STATE_META) as ProductState[]
).map((value) => ({ value, label: PRODUCT_STATE_META[value].label }));

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps & { product?: Product | null }) {
  const {data: categories = []} = useGetAllCategories();
  const saveProductMutation = useSaveProduct();
  const updateProductMutation = useUpdateProduct();
  const [fillWithAI, setFillWithAI] = useState(false);
  const [formValues, setFormValues] = useState<ProductFormValues>({
    title: "",
    price: "",
    active: true,
    tags: [],
    category: "",
    description: "",
    images: [],
    existingImageUrls: [],
    deletedImageUrls: [],
    productId: undefined,
    state: 'active',
    fillWithAI: false,
  });

  useEffect(() => {
    if (product) {
      setFormValues(prev => ({
        ...prev,
        title: product.title || "",
        price: product.price != null ? String(product.price) : "",
        active: product.active ?? true,
        tags: prev.tags ?? [],
        category: product.category?.id ?? "",
        description: product.description ?? "",
        images: [],
        existingImageUrls: Array.isArray(product.images) ? product.images : [],
        deletedImageUrls: [],
        productId: product.id,
        state: product.state || 'active',
      }));
    }
  }, [product]);

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

  const handleSubmit = () => {
    const isAI = !!formValues.fillWithAI;
    const mutation = product ? updateProductMutation : saveProductMutation;
    const submitData = {
      ...formValues,
      state: isAI ? 'draft' : formValues.state
    };

    if (isAI) {
      mutation.mutate(submitData);
      notifications.show({
        title: "Generación en segundo plano",
        message: "Estamos creando el producto con IA. Te avisaremos al finalizar.",
        color: "blue",
      });
      onCancel?.();
    } else {
      mutation.mutate(submitData, {
        onSuccess: () => {
          onSuccess?.();
          onCancel?.();
        }
      });
    }
  };

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const removeExistingImage = (index: number) => {
    setFormValues(prev => ({
      ...prev,
      existingImageUrls: prev.existingImageUrls.filter((_, i) => i !== index),
      deletedImageUrls: [...prev.deletedImageUrls, prev.existingImageUrls[index]]
    }));
  }

  useEffect(() => {
    console.log("values:", formValues);
  },[formValues])

  useEffect(() => {
    setFormValues(prev => ({
      ...prev,
      fillWithAI
    }));
  }, [fillWithAI]);
  return (
    <Stack>
      {!product && (
        <Group justify="space-between" align="center">
          <Switch
            label="Completar con IA"
            description="La IA analizará las imágenes para generar título y descripción automáticamente"
            checked={fillWithAI}
            onChange={(event) => setFillWithAI(event.currentTarget.checked)}
          />
        </Group>
      )}

      {!fillWithAI && (
        <Group grow>
          <TextInput label="Título" name="title" placeholder="Ej. Auriculares Kuromi" value={formValues.title} onChange={handleChangeValues} required />
          <Select
            label="Estado"
            name="state" 
            placeholder="Selecciona el estado"
            data={PRODUCT_STATE_OPTIONS}
            value={formValues.state}
            onChange={(value) => setFormValues(prev => ({ ...prev, state: (value as ProductState) || 'active' }))}
          />
        </Group>
      )}

      <Group grow>
        {!fillWithAI && (
          <TextInput label="Precio" name="price" placeholder="Ej. 59.99" value={formValues.price} onChange={handleChangeValues} required />
        )}
        <Select
          label="Categoría"
          name="category" 
          placeholder="Selecciona una categoría"
          data={Array.isArray(categories?.categories) ? categories.categories.map((cat: { id: string; title: string }) => ({ 
            value: cat.id, 
            label: capitalizeFirstLetter(cat.title)
          })) : []}
          value={formValues.category}
          onChange={(value) => setFormValues(prev => ({ ...prev, category: value || "" }))}
          required={fillWithAI}
        />
      </Group>

      {!fillWithAI && (
        <>
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
        </>
      )}

      <Stack>
        {/* Input nativo oculto */}
        <input
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          id="file-input"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
              setFormValues(prev => ({ ...prev, images: [...prev.images, ...files] }));
            }
          }}
        />
        
        {/* Dropzone para desktop */}
        <Dropzone
          name="images"
          onDrop={(files) => setFormValues(prev => ({ ...prev, images: [...prev.images, ...files] }))}
          accept={IMAGE_MIME_TYPE}
          maxSize={10 * 1024 * 1024}
          activateOnClick={true}
          styles={{
            root: {
              cursor: 'pointer',
              minHeight: '120px',
              border: '2px dashed #ced4da',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: '#f8f9fa',
                borderColor: '#868e96'
              }
            }
          }}
          onReject={(files) => {
            console.log('Archivos rechazados:', files);
          }}
        >
          <Stack align="center" gap="sm">
            <Text size="lg">📷</Text>
            <Text size="sm" ta="center">
              Arrastra y suelta imágenes aquí o haz clic para seleccionar
            </Text>
            <Badge variant="light" size="sm">
              Máximo 10MB por imagen
            </Badge>
          </Stack>
        </Dropzone>
        
        {/* Botón alternativo para móviles */}
        <Button
          variant="filled"
          size="lg"
          onClick={() => document.getElementById('file-input')?.click()}
          leftSection="📱"
          styles={{
            root: {
              '@media (min-width: 768px)': {
                display: 'none'
              }
            }
          }}
        >
          Seleccionar imágenes desde galería
        </Button>
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
       {formValues.existingImageUrls.length > 0 && (
         <Stack>
           <Group>
             <Badge variant="light">Imágenes existentes: {formValues.existingImageUrls.length}</Badge>
           </Group>
           <Group gap="sm">
             {formValues.existingImageUrls.map((url, idx) => (
               <Box key={`${url}-${idx}`}>
                 <Image src={url} alt={`Imagen ${idx + 1}`} w={96} h={96} radius="sm" fit="cover" />
                 <Button mt={6} size="xs" variant="light" color="red" onClick={() => removeExistingImage(idx)}>Eliminar</Button>
               </Box>
             ))}
           </Group>
         </Stack>
       )}
      <Group justify="flex-end" mt="md">
        <Button 
          onClick={handleSubmit} 
          loading={!fillWithAI && (product ? updateProductMutation.isPending : saveProductMutation.isPending)}
          disabled={fillWithAI && (!formValues.category || formValues.images.length === 0)}
        >
          {(product ? updateProductMutation.isPending : saveProductMutation.isPending) 
            ? "Guardando..." 
            : fillWithAI 
              ? "Generar con IA" 
              : "Guardar"
          }
        </Button>
      </Group>
    </Stack>
  );
}