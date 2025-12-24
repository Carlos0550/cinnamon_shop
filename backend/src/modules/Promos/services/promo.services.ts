import { deleteImage, uploadImage } from "@/config/supabase";
import { PromoRequest } from "./promo.schemas";
import dayjs from "@/config/dayjs";
import { prisma } from "@/config/prisma";
import { Request, Response } from "express";
import { PromoType } from "@prisma/client";

type ValidatePromoRequest = {
  code: string;
  items?: Array<{ product_id: string; quantity: number }>;
  total?: number;
  user_id?: number;
};

class PromoServices {
  async createPromo(req: Request, res: Response) {
    let imageStoragePath: string | null = null;
    try {
      const {
        code,
        title,
        description,
        type,
        value,
        max_discount,
        min_order_amount,
        start_date,
        end_date,
        is_active,
        usage_limit,
        per_user_limit,
        categories,
        products,
        show_in_home,
      } = req.body as PromoRequest;

      if (!title || !type || value == null) {
        return res.status(400).json({
          ok: false,
          error: "Faltan campos obligatorios: title, type o value",
        });
      }

      const image = req.file as Express.Multer.File | undefined;

      let imageUrl = "";
      if (image) {
        const buffer: Buffer = image.buffer ?? image;
        const fileName = `promo-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        imageStoragePath = `promos/${fileName}`;
        const rs = await uploadImage(buffer, fileName, "promos", image.mimetype);
        if (rs.url) imageUrl = rs.url;
      }

      const generatedCode = code && code.length > 0 ? code : `${(title || "PROMO").slice(0, 3).toUpperCase()}-${Date.now()}`;

      const fromDate = dayjs(start_date).isValid() ? new Date(start_date as string) : new Date(dayjs.tz().toISOString());
      const toDate = dayjs(end_date).isValid() ? new Date(end_date as string) : new Date(dayjs.tz().add(1, "day").toISOString());

      const normalizedType = typeof type === "string" ? (type as string).toLowerCase() : "";
      const promoType: PromoType = normalizedType === "percentage" || normalizedType === "porcentaje" || normalizedType === "percent" || normalizedType === "percentage"
        ? PromoType.percentage
        : PromoType.fixed;

      const toBoolean = (v: any) => {
        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') {
          const s = v.trim().toLowerCase();
          if (['true', '1', 'yes', 'on'].includes(s)) return true;
          if (['false', '0', 'no', 'off', ''].includes(s)) return false;
        }
        return Boolean(v);
      };

      const isActiveBool = toBoolean(is_active ?? true);
      const showInHomeBool = toBoolean(show_in_home ?? false);

      const allProducts = Array.isArray(products) && products.length === 0;
      const allCategories = Array.isArray(categories) && categories.length === 0;

      const promo = await prisma.promos.create({
        data: {
          code: generatedCode,
          title: title.trim().toLowerCase(),
          description: description ?? undefined,
          image: imageUrl || undefined,
          type: promoType,
          value: typeof value === "string" ? parseFloat(value as any) : Number(value),
          max_discount: typeof max_discount === "number" ? max_discount : undefined,
          min_order_amount: typeof min_order_amount === "number" ? min_order_amount : undefined,
          start_date: fromDate,
          end_date: toDate,
          is_active: isActiveBool,
          usage_limit: typeof usage_limit === "number" ? usage_limit : undefined,
          per_user_limit: typeof per_user_limit === "number" ? per_user_limit : undefined,
          all_products: allProducts,
          all_categories: allCategories,
          show_in_home: showInHomeBool,
          categories: Array.isArray(categories) && categories.length > 0
            ? { connect: categories.map((id) => ({ id })) }
            : undefined,
          products: Array.isArray(products) && products.length > 0
            ? { connect: products.map((id) => ({ id })) }
            : undefined,

        },
      });
      return res.status(201).json({ ok: true, promo });
    } catch (error: any) {
      console.error("Error al crear promo:", error);
      try {
        if (imageStoragePath) {
          await deleteImage(imageStoragePath);
          console.log("Imagen eliminada de Supabase:", imageStoragePath);
        }
      } catch (cleanupErr) {
        console.warn("Error al eliminar imagen subida:", cleanupErr);
      }
      if (error?.code === "P2002") {
        return res.status(409).json({ ok: false, error: "El código de la promoción ya existe" });
      } else {
        return res.status(500).json({ ok: false, error: "Error al crear la promoción" });
      }
    }
  }

  async getPromos(req: Request, res: Response) {
    try {
      const result = await prisma.promos.findMany({
        include: {
          categories: true,
          products: true
        }
      })

      // Siempre devolver 200 con la lista (posiblemente vacía)
      return res.status(200).json({ ok: true, promos: result });
    } catch (error) {
      console.log(error)
      return res.status(500).json({ ok: false, error: "Error al obtener las promociones" });
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
  async updatePromo(req: Request, res: Response) {
    let newImageStoragePath: string | null = null;
    try {
      const { id } = req.params as { id: string };
      const existing = await prisma.promos.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ ok: false, error: "Promoción no encontrada" });
      }

      const {
        code,
        title,
        description,
        type,
        value,
        max_discount,
        min_order_amount,
        start_date,
        end_date,
        is_active,
        usage_limit,
        per_user_limit,
        categories,
        products,
        show_in_home,
      } = req.body as PromoRequest;

      const image = req.file as Express.Multer.File | undefined;

      let imageUrl: string | undefined = undefined;
      if (image) {
        const buffer: Buffer = image.buffer ?? image;
        const fileName = `promo-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        newImageStoragePath = `promos/${fileName}`;
        const rs = await uploadImage(buffer, fileName, "promos", image.mimetype);
        if (rs.url) imageUrl = rs.url;
      }

      const toBoolean = (v: any) => {
        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') {
          const s = v.trim().toLowerCase();
          if (['true', '1', 'yes', 'on'].includes(s)) return true;
          if (['false', '0', 'no', 'off', ''].includes(s)) return false;
        }
        return Boolean(v);
      };

      const normalizedType = typeof type === "string" ? (type as string).toLowerCase() : undefined;
      const promoType = normalizedType
        ? normalizedType === "percentage" || normalizedType === "porcentaje" || normalizedType === "percent"
          ? PromoType.percentage
          : PromoType.fixed
        : undefined;

      const fromDate = start_date && dayjs(start_date).isValid() ? new Date(start_date as string) : undefined;
      const toDate = end_date && dayjs(end_date).isValid() ? new Date(end_date as string) : undefined;

      const allProducts = Array.isArray(products) && products.length === 0;
      const allCategories = Array.isArray(categories) && categories.length === 0;

      const updated = await prisma.promos.update({
        where: { id },
        data: {
          code: code ?? existing.code,
          title: title ? title.trim().toLowerCase() : existing.title,
          description: description ?? existing.description ?? undefined,
          image: imageUrl ?? existing.image ?? undefined,
          type: promoType ?? existing.type,
          value: value != null ? (typeof value === 'string' ? parseFloat(value as any) : Number(value)) : existing.value,
          max_discount: typeof max_discount === 'number' ? max_discount : existing.max_discount ?? undefined,
          min_order_amount: typeof min_order_amount === 'number' ? min_order_amount : existing.min_order_amount ?? undefined,
          start_date: fromDate ?? existing.start_date,
          end_date: toDate ?? existing.end_date,
          is_active: is_active != null ? toBoolean(is_active) : existing.is_active,
          usage_limit: typeof usage_limit === 'number' ? usage_limit : existing.usage_limit ?? undefined,
          per_user_limit: typeof per_user_limit === 'number' ? per_user_limit : existing.per_user_limit ?? undefined,
          show_in_home: show_in_home != null ? toBoolean(show_in_home) : existing.show_in_home,
          all_products: Array.isArray(products) ? allProducts : existing.all_products,
          all_categories: Array.isArray(categories) ? allCategories : existing.all_categories,
          categories: Array.isArray(categories)
            ? { set: categories.map((id) => ({ id })) }
            : undefined,
          products: Array.isArray(products)
            ? { set: products.map((id) => ({ id })) }
            : undefined,
        },
        include: { categories: true, products: true },
      });

      if (imageUrl && existing.image) {
        const imagePath = this.extractPathFromPublicUrl(existing.image);
        if (imagePath) {
          try {
            await deleteImage(imagePath);
          } catch (cleanupErr) {
            console.warn("Error al eliminar imagen previa:", cleanupErr);
          }
        }
      }

      return res.status(200).json({ ok: true, promo: updated });
    } catch (error: any) {
      console.error("Error al actualizar promo:", error);
      try {
        if (newImageStoragePath) {
          await deleteImage(newImageStoragePath);
        }
      } catch (cleanupErr) {
        console.warn("Error al limpiar imagen subida:", cleanupErr);
      }
      return res.status(500).json({ ok: false, error: "Error al actualizar la promoción" });
    }
  }

  async togglePromoActive(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const { is_active } = req.body as { is_active?: boolean | string };
      const existing = await prisma.promos.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ ok: false, error: "Promoción no encontrada" });

      const nextActive = is_active != null ? (typeof is_active === 'string' ? ['true','1','yes','on'].includes(is_active.toLowerCase()) : !!is_active) : !existing.is_active;
      const updated = await prisma.promos.update({
        where: { id },
        data: { is_active: nextActive },
      });
      return res.status(200).json({ ok: true, promo: updated });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ ok: false, error: "Error al cambiar estado de la promoción" });
    }
  }

  async deletePromo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const promoInfo = await prisma.promos.findUnique({
        where: {
          id: id as string,
        }
      })

      if (!promoInfo) {
        return res.status(404).json({ ok: true, error: "Promoción no encontrada" });
      }

      if (![null, "", undefined].includes(promoInfo.image)) {
        const imagePath = this.extractPathFromPublicUrl(promoInfo.image!);
        if (imagePath) {
          await deleteImage(imagePath);
          console.log("Imagen eliminada de Supabase:", imagePath);
        }
      }
      const promo = await prisma.promos.delete({
        where: {
          id: id as string,
        },
      });
      return res.status(200).json({ ok: true, promo });
    } catch (error) {
      console.log(error)
      return res.status(500).json({ ok: false, error: "Error al eliminar la promoción" });
    }
  }

  /**
   * Valida un código de promoción y calcula el descuento aplicable
   */
  async validatePromo(req: Request, res: Response) {
    try {
      const { code, items = [], total = 0, user_id } = req.body as ValidatePromoRequest;

      if (!code || typeof code !== 'string' || code.trim().length === 0) {
        return res.status(400).json({ ok: false, error: 'code_required' });
      }

      const promo = await prisma.promos.findUnique({
        where: { code: code.trim().toUpperCase() },
        include: { categories: true, products: true }
      });

      if (!promo) {
        return res.status(404).json({ ok: false, error: 'promo_not_found' });
      }

      // Validar que esté activa
      if (!promo.is_active) {
        return res.status(400).json({ ok: false, error: 'promo_inactive' });
      }

      // Validar fechas
      const now = dayjs.tz();
      if (promo.start_date && dayjs(promo.start_date).isAfter(now)) {
        return res.status(400).json({ ok: false, error: 'promo_not_started' });
      }
      if (promo.end_date && dayjs(promo.end_date).isBefore(now)) {
        return res.status(400).json({ ok: false, error: 'promo_expired' });
      }

      // Validar límite de uso global
      if (promo.usage_limit && promo.usage_count >= promo.usage_limit) {
        return res.status(400).json({ ok: false, error: 'promo_usage_limit_reached' });
      }

      // Validar límite por usuario
      if (user_id && promo.per_user_limit) {
        const userUsageCount = await prisma.orders.count({
          where: {
            userId: user_id,
            promo_code: promo.code
          }
        });
        if (userUsageCount >= promo.per_user_limit) {
          return res.status(400).json({ ok: false, error: 'promo_user_limit_reached' });
        }
      }

      // Validar monto mínimo de orden
      if (promo.min_order_amount && total < promo.min_order_amount) {
        return res.status(400).json({ 
          ok: false, 
          error: 'min_order_amount_not_met',
          min_amount: promo.min_order_amount 
        });
      }

      // Validar productos/categorías aplicables
      if (items.length > 0) {
        const productIds = items.map(i => i.product_id);
        const products = await prisma.products.findMany({
          where: { id: { in: productIds } },
          include: { category: true }
        });

        let hasApplicableProduct = false;

        if (promo.all_products) {
          hasApplicableProduct = true;
        } else if (promo.all_categories) {
          hasApplicableProduct = products.some(p => p.categoryId !== null);
        } else {
          const promoProductIds = promo.products.map(p => p.id);
          const promoCategoryIds = promo.categories.map(c => c.id);
          
          hasApplicableProduct = products.some(p => 
            promoProductIds.includes(p.id) || 
            (p.categoryId && promoCategoryIds.includes(p.categoryId))
          );
        }

        if (!hasApplicableProduct) {
          return res.status(400).json({ ok: false, error: 'promo_not_applicable_to_items' });
        }
      }

      // Calcular descuento
      let discount = 0;
      if (promo.type === PromoType.percentage) {
        discount = total * (promo.value / 100);
        if (promo.max_discount && discount > promo.max_discount) {
          discount = promo.max_discount;
        }
      } else {
        discount = promo.value;
        if (discount > total) {
          discount = total;
        }
      }

      return res.status(200).json({
        ok: true,
        promo: {
          id: promo.id,
          code: promo.code,
          title: promo.title,
          type: promo.type,
          value: promo.value,
          max_discount: promo.max_discount,
        },
        discount: Math.round(discount * 100) / 100,
        final_total: Math.round((total - discount) * 100) / 100
      });
    } catch (error) {
      console.error('Error validando promoción:', error);
      return res.status(500).json({ ok: false, error: 'validation_error' });
    }
  }

  /**
   * Obtiene promociones públicas activas (para mostrar en home)
   */
  async getPublicPromos(req: Request, res: Response) {
    try {
      const now = dayjs.tz();
      const promos = await prisma.promos.findMany({
        where: {
          is_active: true,
          show_in_home: true,
          AND: [
            {
              OR: [
                { start_date: null },
                { start_date: { lte: now.toDate() } }
              ]
            },
            {
              OR: [
                { end_date: null },
                { end_date: { gte: now.toDate() } }
              ]
            }
          ]
        },
        select: {
          id: true,
          code: true,
          title: true,
          description: true,
          image: true,
          type: true,
          value: true,
          max_discount: true,
          min_order_amount: true,
          end_date: true,
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 10
      });

      return res.status(200).json({ ok: true, promos });
    } catch (error) {
      console.error('Error obteniendo promociones públicas:', error);
      return res.status(500).json({ ok: false, error: 'error_fetching_promos' });
    }
  }

  /**
   * Calcula el descuento aplicable para un total y código de promoción
   */
  static async calculateDiscount(
    code: string | null | undefined,
    subtotal: number,
    items?: Array<{ product_id: string; quantity: number }>,
    userId?: number
  ): Promise<{ discount: number; promo_id: string | null }> {
    if (!code || code.trim().length === 0) {
      return { discount: 0, promo_id: null };
    }

    try {
      const promo = await prisma.promos.findUnique({
        where: { code: code.trim().toUpperCase() },
        include: { categories: true, products: true }
      });

      if (!promo || !promo.is_active) {
        return { discount: 0, promo_id: null };
      }

      // Validar fechas
      const now = dayjs.tz();
      if (promo.start_date && dayjs(promo.start_date).isAfter(now)) {
        return { discount: 0, promo_id: null };
      }
      if (promo.end_date && dayjs(promo.end_date).isBefore(now)) {
        return { discount: 0, promo_id: null };
      }

      // Validar límites
      if (promo.usage_limit && promo.usage_count >= promo.usage_limit) {
        return { discount: 0, promo_id: null };
      }

      if (userId && promo.per_user_limit) {
        const userUsageCount = await prisma.orders.count({
          where: {
            userId,
            promo_code: promo.code
          }
        });
        if (userUsageCount >= promo.per_user_limit) {
          return { discount: 0, promo_id: null };
        }
      }

      // Validar monto mínimo
      if (promo.min_order_amount && subtotal < promo.min_order_amount) {
        return { discount: 0, promo_id: null };
      }

      // Calcular descuento
      let discount = 0;
      if (promo.type === PromoType.percentage) {
        discount = subtotal * (promo.value / 100);
        if (promo.max_discount && discount > promo.max_discount) {
          discount = promo.max_discount;
        }
      } else {
        discount = promo.value;
        if (discount > subtotal) {
          discount = subtotal;
        }
      }

      return { 
        discount: Math.round(discount * 100) / 100, 
        promo_id: promo.id 
      };
    } catch (error) {
      console.error('Error calculando descuento:', error);
      return { discount: 0, promo_id: null };
    }
  }
}

export default PromoServices;