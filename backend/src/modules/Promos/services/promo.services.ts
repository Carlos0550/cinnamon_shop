import { deleteImage, uploadImage } from "@/config/supabase";
import { PromoRequest } from "./promo.schemas";
import dayjs from "@/config/dayjs";
import { prisma } from "@/config/prisma";
import { Request, Response } from "express";
import { PromoType } from "@prisma/client";

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

      const fromDate = dayjs(start_date).isValid() ? new Date(start_date as string) : new Date(dayjs().toISOString());
      const toDate = dayjs(end_date).isValid() ? new Date(end_date as string) : new Date(dayjs().add(1, "day").toISOString());

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
}

export default PromoServices;