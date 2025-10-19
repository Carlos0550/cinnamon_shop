import { useQuery } from "@tanstack/react-query";
import { baseUrl } from "./index";

export type Category_info = {
  id: string;
  title: string;
  active: boolean;
  image: string;
  created_at: string | number | Date;
}
export type Product = {
  id: string;
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
  currentPage: number;
  totalPages: number;
  totalItems: number;
};

export type GetProductsResponse = {
  products: Product[];
  pagination?: Pagination;
};

type SaveProductPayload = {
  title: string;
  name: string;
  price: string | number;
  tags?: string[];
  active: boolean;
  category?: string;
  description?: string;
  images: File[];
};

export const saveProduct = async (value: SaveProductPayload) => {
  try {
    const formData = new FormData();
    formData.append("title", value.title);
    formData.append("name", value.name);
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
    value.images.forEach((image: File) => {
      formData.append("productImages", image);
    });

    const res = await fetch(baseUrl + "/save-product", {
      method: "POST",
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
};

export const useGetAllProducts = (
  params: GetProductsParams = { page: 1, limit: 10 }
) => {
  return useQuery<GetProductsResponse, Error>({
    queryKey: ["products", params],
    queryFn: () => getAllProducts(params),
  });
};

const buildQueryString = (queryParams: GetProductsParams): string => {
  const qs = new URLSearchParams();
  qs.set("page", String(queryParams.page));
  qs.set("limit", String(queryParams.limit));
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
  queryParams: GetProductsParams
): Promise<GetProductsResponse> => {
  try {
    const qs = buildQueryString(queryParams);
    const res = await fetch(`${baseUrl}/products?${qs}`);
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