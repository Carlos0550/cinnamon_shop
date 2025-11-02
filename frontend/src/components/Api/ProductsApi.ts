import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/Context/AppContext";
import { notifications } from "@mantine/notifications";
import { baseUrl } from "./index";

export type Category_info = {
  id: string;
  title: string;
  active: boolean;
  image: string;
  created_at: string | number | Date;
}

export type ProductState =
  | 'active'
  | 'inactive'
  | 'draft'
  | 'out_stock'
  | 'discontinued'
  | 'archived'
  | 'deleted';

export type Product = {
  id: string;
  state: ProductState;
  title: string;
  name: string;
  price: number;
  active: boolean;
  images: string[];
  description?: string;
  category?: Category_info;
  created_at?: string | number | Date;
};

export type Pagination = {
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
  page: number
  total: number
  totalPages: number
};

export type GetProductsResponse = {
  products: Product[];
  pagination?: Pagination;
};

type SaveProductPayload = {
  title: string;
  price: string | number;
  tags?: string[];
  active: boolean;
  category?: string;
  description?: string;
  images: File[];
  // Nuevos campos para edición
  existingImageUrls?: string[];
  deletedImageUrls?: string[];
  productId?: string;
};

export const useSaveProduct = () => {
  const queryClient = useQueryClient();
  const {
    auth: {
      token
    }
  } = useAppContext();

  return useMutation({
    mutationKey: ["saveProduct"],
    mutationFn: async (value: SaveProductPayload) => {
      try {
        const formData = new FormData();
        formData.append("title", value.title);
        formData.append("price", String(value.price));
        formData.append("active", String(value.active));
        if (value.tags) {
          formData.append("tags", JSON.stringify(value.tags));
        }
        if (value.category) {
          formData.append("category_id", value.category);
        }
        if (value.description) {
          formData.append("description", value.description);
        }
        if (value.productId) {
          formData.append("product_id", value.productId);
        }
        if (Array.isArray(value.existingImageUrls)) {
          formData.append("existing_image_urls", JSON.stringify(value.existingImageUrls));
        }
        if (Array.isArray(value.deletedImageUrls)) {
          formData.append("deleted_image_urls", JSON.stringify(value.deletedImageUrls));
        }
        value.images.forEach((image: File) => {
          formData.append("productImages", image);
        });

        const res = await fetch(baseUrl + "/save-product", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.error || "Error creando el producto");
        }

        return res.json();
      } catch (error: unknown) {
        console.log(error);
        if (error instanceof Error) throw error;
        throw new Error(String(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      notifications.show({
        message: "Producto creado con éxito",
        color: "green"
      });
    },
    onError: (error: Error) => {
      notifications.show({
        message: error?.message ?? "Error al crear el producto",
        color: "red"
      });
    }
  });
};

export type GetProductsParams = {
  page: number;
  limit: number;
  title?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  state: ProductState;
};

export const useGetAllProducts = (
  params: GetProductsParams = { page: 1, limit: 10, state: 'active' }
) => {
  const {
    auth: {
      token
    }
  } = useAppContext();

  return useQuery<GetProductsResponse, Error>({
    queryKey: ["products", params],
    queryFn: () => getAllProducts(params, token),
    enabled: !!token,
  });
};

const buildQueryString = (queryParams: GetProductsParams): string => {
  const qs = new URLSearchParams();
  qs.set("page", String(queryParams.page));
  qs.set("limit", String(queryParams.limit));
  qs.set("state", queryParams.state);
  if (queryParams.title) qs.set("title", queryParams.title);
  if (queryParams.categoryId) qs.set("categoryId", queryParams.categoryId);
  if (typeof queryParams.minPrice === "number")
    qs.set("minPrice", String(queryParams.minPrice));
  if (typeof queryParams.maxPrice === "number")
    qs.set("maxPrice", String(queryParams.maxPrice));
  if (typeof queryParams.isActive === "boolean")
    qs.set("isActive", String(queryParams.isActive));
  if (queryParams.sortBy) qs.set("sortBy", queryParams.sortBy);
  if (queryParams.sortOrder) qs.set("sortOrder", queryParams.sortOrder);
  return qs.toString();
};

export const getAllProducts = async (
  queryParams: GetProductsParams,
  token: string | null
): Promise<GetProductsResponse> => {
  try {
    const qs = buildQueryString(queryParams);
    const res = await fetch(`${baseUrl}/products?${qs}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error || "Error obteniendo los productos");
    }

    if (Array.isArray(json)) {
      return { products: json, pagination: undefined };
    }

    const products = Array.isArray(json?.data?.products)
      ? (json.data.products as Product[])
      : Array.isArray(json?.products)
      ? (json.products as Product[])
      : Array.isArray(json?.data)
      ? (json.data as Product[])
      : [];

    const pagination: Pagination | undefined =
      (json?.pagination as Pagination | undefined) ||
      (json?.data?.pagination as Pagination | undefined) ||
      undefined;

    return { products, pagination };
  } catch (error: unknown) {
    console.log(error);
    if (error instanceof Error) throw error;
    throw new Error(String(error));
  }
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const {
    auth: {
      token
    }
  } = useAppContext();

  return useMutation({
    mutationKey: ["deleteProduct"],
    mutationFn: async (id: string) => {
      try {
        const res = await fetch(`${baseUrl}/products/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error || "Error eliminando el producto");
        }
        return json;
      } catch (error: unknown) {
        console.log(error);
        if (error instanceof Error) throw error;
        throw new Error(String(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      notifications.show({
        message: "Producto eliminado con éxito",
        color: "green"
      });
    },
    onError: (error: Error) => {
      notifications.show({
        message: error?.message ?? "Error al eliminar el producto",
        color: "red"
      });
    }
  });
};


export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const {
    auth: {
      token
    }
  } = useAppContext();

  return useMutation({
    mutationKey: ["updateProduct"],
    mutationFn: async (value: SaveProductPayload) => {
      try {
        const formData = new FormData();
        formData.append("title", value.title);
        formData.append("price", String(value.price));
        formData.append("active", String(value.active));
        if (value.tags) {
          formData.append("tags", JSON.stringify(value.tags));
        }
        if (value.category) {
          formData.append("category_id", value.category);
        }
        if (value.description) {
          formData.append("description", value.description);
        }
        if (value.productId) {
          formData.append("product_id", value.productId);
        }
        if (Array.isArray(value.existingImageUrls)) {
          formData.append("existing_image_urls", JSON.stringify(value.existingImageUrls));
        }
        if (Array.isArray(value.deletedImageUrls)) {
          formData.append("deleted_image_urls", JSON.stringify(value.deletedImageUrls));
        }
        value.images.forEach((image: File) => {
          formData.append("productImages", image);
        });

        console.log("Actualizando producto...")
        const res = await fetch(baseUrl + "/products/" + value.productId, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.error || "Error actualizando el producto");
        }
        console.log("Actualizacion exitosa", res)
        return res.json();
      } catch (error: unknown) {
        console.log(error);
        if (error instanceof Error) throw error;
        throw new Error(String(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      notifications.show({
        message: "Producto actualizado con éxito",
        color: "green"
      });
    },
    onError: (error: Error) => {
      notifications.show({
        message: error?.message ?? "Error al actualizar el producto",
        color: "red"
      });
    }
  });
};
