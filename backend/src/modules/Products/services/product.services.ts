import { Request, Response } from "express";
import { uploadImage } from "@/config/supabase";
import fs from "fs";
import { prisma } from "@/config/prisma";
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

    async getAllProducts(req: Request, res: Response){
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
                    }
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
}

export default ProductServices