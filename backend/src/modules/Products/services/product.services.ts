import { Request, Response } from "express";
import { uploadImage, deleteImage } from "@/config/supabase";
import fs from "fs";
import { prisma } from "@/config/prisma";
import { ProductState } from "@prisma/client";
class ProductServices {
    async saveProduct(req: Request, res: Response) {
        const {
            title,
            description,
            price,
            tags,
            category_id,
        } = req.body

        const productImages = req.files

        let imageUrls: string[] = [];

        if (productImages && Array.isArray(productImages)) {
            for (const image of productImages as any[]) {
                try {
                    const fileName = `product-${Date.now()}-${Math.round(Math.random() * 1E9)}`;

                    const buffer: Buffer = image.buffer ?? fs.readFileSync(image.path);
                    const result = await uploadImage(buffer, fileName, 'products', image.mimetype);

                    if (result.url) {
                        imageUrls.push(result.url);
                    } else {
                        console.error('Error al subir imagen:', result.error);
                    }
                } catch (error) {
                    console.error('Error al procesar imagen:', error);
                }
            }
        }

        const product = await prisma.products.create({
            data: {
                title,
                description: description ?? "",
                price: parseFloat(price),
                tags: Array.isArray(tags) ? tags : [],
                categoryId: category_id,
                images: imageUrls,
            }
        });

        return res.status(201).json({
            ok: true,
            message: "Producto creado exitosamente",
            product
        });

    }

    async saveCategory(req: Request, res: Response) {
        const { title } = req.body
        const image = req.file
        const normalized_title = title.trim().toLowerCase()

        try {
            const category_exists = await prisma.categories.findFirst({
                where: {
                    title: normalized_title
                }
            })

            if (category_exists) {
                return res.status(409).json({
                    ok: false,
                    error: "Esta categoría ya existe."
                })
            }

            let image_url: string = ""
            if (image) {
                const fileName = `category-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
                const buffer: Buffer = (image as any).buffer ?? fs.readFileSync((image as any).path);
                const result = await uploadImage(buffer, fileName, 'categories', image.mimetype);
                if (result.url) {
                    image_url = result.url
                } else {
                    console.log("Error subiendo imagen a Supabase", result.error)
                }
            }

            await prisma.categories.create({
                data: {
                    title: normalized_title,
                    image: image_url
                }
            })

            return res.status(201).json({
                ok: true,
                message: "Categoría creada exitosamente"
            })
        } catch (error) {
            console.log("Error al guardar categoría", error)
            return res.status(500).json({
                ok: false,
                error: "Error al guardar categoría"
            })
        }

    }

    async getAllCategories(req: Request, res: Response) {
        try {
            const categories = await prisma.categories.findMany()
            return res.status(200).json({
                ok: true,
                categories
            })
        } catch (error) {
            console.log("Error al obtener categorías", error)
            return res.status(500).json({
                ok: false,
                error: "Error al obtener categorías"
            })
        }
    }

    async getAllProducts(req: Request, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const title = req.query.title as string;
            const categoryId = req.query.categoryId as string;

            const isActive = req.query.isActive === 'true' ? true :
                req.query.isActive === 'false' ? false : undefined;

            const where: any = {};

            if (title) {
                where.title = {
                    contains: title,
                    mode: 'insensitive'
                };
            }

            if (categoryId) {
                where.categoryId = categoryId;
            }

            if (isActive !== undefined) {
                where.is_active = isActive;
            }

            const [totalProducts, products] = await Promise.all([
                prisma.products.count({ where }),

                prisma.products.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        category: true
                    },
                    orderBy: [{
                        state: "asc"
                    }]
                })
            ])

            const totalPages = Math.ceil(totalProducts / limit);

            return res.status(200).json({
                ok: true,
                data: {
                    products,
                    pagination: {
                        total: totalProducts,
                        page,
                        limit,
                        totalPages,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    }
                }
            });
        } catch (error) {
            console.error("Error al obtener productos:", error);
            return res.status(500).json({
                ok: false,
                error: "Error al obtener los productos"
            });
        }
    }

    extractPathFromPublicUrl = (url: string): string | null => {
        try {
            const u = new URL(url);
            const match = u.pathname.match(/\/storage\/v1\/object\/(?:public|authenticated)\/([^/]+)\/(.+)/);
            if (!match) return null;
            const bucket = match[1];
            const path = match[2];
            const envBucket = process.env.SUPABASE_BUCKET || "images";
            if (bucket !== envBucket) {
                console.warn(`Bucket en URL (${bucket}) difiere del configurado (${envBucket}). Intentando eliminar por path relativo.`);
            }
            return path;
        } catch {
            return typeof url === "string" && url.length > 0 ? url : null;
        }
    };
    async deleteProduct(req: Request, res: Response) {
        try {
            const { product_id } = req.params;

            const product_info = await prisma.products.findFirst({
                where: { id: product_id }
            });

            if (!product_info) {
                return res.status(404).json({
                    ok: false,
                    error: "Producto no encontrado"
                });
            }

            if (product_info.state === ProductState.deleted) {
                return res.status(400).json({
                    ok: false,
                    error: "Producto ya eliminado"
                });
            }

            const images: string[] = Array.isArray(product_info.images)
                ? product_info.images.filter((img): img is string => typeof img === 'string')
                : [];



            const imagePaths = images
                .map((img) => this.extractPathFromPublicUrl(img))
                .filter((p): p is string => typeof p === "string" && p.length > 0);

            if (imagePaths.length > 0) {
                const results = await Promise.all(imagePaths.map((p) => deleteImage(p)));
                const failed = results.filter(r => !r.success).length;
                if (failed > 0) {
                    console.warn(`No se pudieron eliminar ${failed} imágenes de Supabase.`);
                }
            }

            await prisma.products.update({
                where: { id: product_id },
                data: {
                    is_active: false,
                    state: ProductState.deleted,
                    images: []
                }
            });

            return res.status(200).json({
                ok: true,
                message: "Producto eliminado exitosamente",
                deletedImages: imagePaths.length
            });
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            return res.status(500).json({
                ok: false,
                error: "Error al eliminar el producto"
            });
        }
    }

    async updateProduct(req: Request, res: Response) {
        try {
            const {
                title,
                description,
                price,
                tags,
                category_id,
                existingImageUrls,
                deletedImageUrls,
            } = req.body;

            // Normalizar arrays provenientes de multipart/form-data (strings JSON)
            const rawExisting = existingImageUrls ?? (req.body as any).existing_image_urls;
            const rawDeleted = deletedImageUrls ?? (req.body as any).deleted_image_urls;

            const normalizedExisting: string[] = Array.isArray(rawExisting)
                ? rawExisting
                : typeof rawExisting === 'string' && rawExisting.trim().length
                ? JSON.parse(rawExisting)
                : [];

            const normalizedDeleted: string[] = Array.isArray(rawDeleted)
                ? rawDeleted
                : typeof rawDeleted === 'string' && rawDeleted.trim().length
                ? JSON.parse(rawDeleted)
                : [];

            const {
                product_id,
            } = req.params;

            const productImages = req.files

            let imageUrls: string[] = [];

            const existentProduct = await prisma.products.findFirst({
                where: { id: product_id }
            });

            if (!existentProduct) {
                return res.status(404).json({
                    ok: false,
                    error: "Producto no encontrado"
                });
            }

            if (normalizedDeleted.length > 0) {
                const imagePaths = normalizedDeleted   
                    .map((img: string) => this.extractPathFromPublicUrl(img))
                    .filter((p: string | null): p is string => p !== null);
                if (imagePaths.length > 0) {
                    const results = await Promise.all(imagePaths.map((p: string) => deleteImage(p)));
                    const failed = results.filter(r => !r.success).length;
                    if (failed > 0) {
                        console.warn(`No se pudieron eliminar ${failed} imágenes de Supabase.`);
                    }
                }
            }

            if (productImages && Array.isArray(productImages)) {
                for (const image of productImages as any[]) {
                    try {
                        const fileName = `product-${Date.now()}-${Math.round(Math.random() * 1E9)}`;

                        const buffer: Buffer = image.buffer ?? fs.readFileSync(image.path);
                        const result = await uploadImage(buffer, fileName, 'products', image.mimetype);

                        if (result.url) {
                            imageUrls.push(result.url);
                        } else {
                            console.error('Error al subir imagen:', result.error);
                        }
                    } catch (error) {
                        console.error('Error al procesar imagen:', error);
                    }
                }
            }
            
            const updatedImages = [...normalizedExisting, ...imageUrls];
            await prisma.products.update({
                where: { id: product_id },
                data: {
                    title,
                    description,
                    price: typeof price === 'string' ? parseFloat(price) : price,
                    tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? JSON.parse(tags) : []),
                    categoryId: category_id,
                    images: updatedImages
                }
            });

            return res.status(200).json({
                ok: true,
                message: "Producto actualizado exitosamente",
                images: updatedImages
            });

        } catch (error) {
            console.error("Error al actualizar producto:", error);
            return res.status(500).json({
                ok: false,
                error: "Error al actualizar el producto"
            });
        }
    }
}

export default ProductServices