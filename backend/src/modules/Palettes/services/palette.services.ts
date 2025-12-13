import { prisma } from "@/config/prisma";
import { redis } from "@/config/redis";

export type PalettePayload = {
  name: string;
  colors: string[];
  is_active?: boolean;
};

export class PaletteServices {
  private async readCacheAll(tenantId?: string): Promise<any[]> {
    const key = tenantId ? `palettes:all:${tenantId}` : "palettes:all";
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : [];
  }

  private async writeCacheAll(items: any[], tenantId?: string): Promise<void> {
    const key = tenantId ? `palettes:all:${tenantId}` : "palettes:all";
    await redis.set(key, JSON.stringify(items));
  }

  private generateId(): string {
    return `pal_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  }

  async list(tenantId: string) {
    const cached = await redis.get(`palettes:all:${tenantId}`);
    if (cached){
      const sorted_palettes = JSON.parse(cached).sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      console.log("Paletas:", sorted_palettes);
      return sorted_palettes;
    }
    try {
      const data = await prisma.colorPalette.findMany({ where: { tenantId }, orderBy: { created_at: "desc" } });
      console.log("Paletas:", data);
      await redis.set(`palettes:all:${tenantId}`, JSON.stringify(data));
      return data;
    } catch {
      return [];
    }
  }

  async get(tenantId: string, id: string) {
    try { return await prisma.colorPalette.findFirst({ where: { id, tenantId } }); } catch { 
      const all = await this.readCacheAll(tenantId);
      return all.find((p) => p.id === id) || null;
    }
  }

  async create(payload: PalettePayload) {
    try {
      const created = await prisma.colorPalette.create({
        data: {
          name: payload.name,
          colors: payload.colors,
          is_active: payload.is_active ?? true,
        }
      });
      await this.refreshCache();
      return created;
    } catch {
      const created = {
        id: this.generateId(),
        name: payload.name,
        colors: payload.colors,
        is_active: payload.is_active ?? true,
        use_for_admin: false,
        use_for_shop: false,
        created_at: new Date(),
        updated_at: new Date(),
      } as any;
      const all = await this.readCacheAll();
      all.unshift(created);
      await this.writeCacheAll(all);
      return created;
    }
  }

  async createForTenant(payload: PalettePayload, tenantId: string) {
    try {
      const created = await prisma.colorPalette.create({
        data: {
          name: payload.name,
          colors: payload.colors,
          is_active: payload.is_active ?? true,
          tenant: { connect: { id: tenantId } }
        }
      });
      await this.refreshCache(tenantId);
      return created;
    } catch {
      return this.create(payload)
    }
  }

  async update(tenantId: string, id: string, payload: PalettePayload) {
    try {
      const updated = await prisma.colorPalette.update({
        where: { id, tenantId },
        data: {
          name: payload.name,
          colors: payload.colors,
          ...(payload.is_active !== undefined ? { is_active: payload.is_active } : {})
        }
      });
      await this.refreshCache(tenantId);
      return updated;
    } catch {
      const all = await this.readCacheAll(tenantId);
      const idx = all.findIndex((p) => p.id === id);
      if (idx >= 0) {
        const next = { ...all[idx], name: payload.name, colors: payload.colors };
        if (payload.is_active !== undefined) next.is_active = payload.is_active;
        next.updated_at = new Date();
        all[idx] = next;
        await this.writeCacheAll(all, tenantId);
        return next;
      }
      return null as any;
    }
  }

  async remove(tenantId: string, id: string) {
    try {
      await prisma.colorPalette.delete({ where: { id, tenantId } });
      await this.refreshCache(tenantId);
    } catch {
      const all = await this.readCacheAll(tenantId);
      const next = all.filter((p) => p.id !== id);
      await this.writeCacheAll(next, tenantId);
    }
  }

  async activate(tenantId: string, id: string, active: boolean) {
    try {
      const updated = await prisma.colorPalette.update({ where: { id, tenantId }, data: { is_active: active } });
      await this.refreshCache(tenantId);
      return updated;
    } catch {
      const all = await this.readCacheAll(tenantId);
      const idx = all.findIndex((p) => p.id === id);
      if (idx >= 0) {
        all[idx].is_active = active;
        all[idx].updated_at = new Date();
        await this.writeCacheAll(all, tenantId);
        return all[idx];
      }
      return null as any;
    }
  }

  async setUsage(tenantId: string, paletteId: string, target: "admin" | "shop") {
    try {
      if (target === "admin") {
        await prisma.colorPalette.updateMany({ where: { tenantId }, data: { use_for_admin: false } });
        await prisma.colorPalette.update({ where: { id: paletteId, tenantId }, data: { use_for_admin: true } });
        const palette = await prisma.colorPalette.findFirst({ where: { id: paletteId, tenantId } });
        if (palette) await redis.set(`palette:admin:${tenantId}`, JSON.stringify(palette));
      } else {
        await prisma.colorPalette.updateMany({ where: { tenantId }, data: { use_for_shop: false } });
        await prisma.colorPalette.update({ where: { id: paletteId, tenantId }, data: { use_for_shop: true } });
        const palette = await prisma.colorPalette.findFirst({ where: { id: paletteId, tenantId } });
        if (palette) await redis.set(`palette:shop:${tenantId}`, JSON.stringify(palette));
      }
      await this.refreshCache(tenantId);
    } catch {
      const all = await this.readCacheAll(tenantId);
      const next = all.map((p) => ({
        ...p,
        use_for_admin: target === "admin" ? (p.id === paletteId) : p.use_for_admin,
        use_for_shop: target === "shop" ? (p.id === paletteId) : p.use_for_shop,
      }));
      await this.writeCacheAll(next, tenantId);
      const chosen = next.find((p) => p.id === paletteId);
      if (chosen) await redis.set(target === "admin" ? `palette:admin:${tenantId}` : `palette:shop:${tenantId}`, JSON.stringify(chosen));
    }
  }

  async getActiveFor(tenantId: string, target: "admin" | "shop") {
    const key = target === "admin" ? `palette:admin:${tenantId}` : `palette:shop:${tenantId}`;
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
    const palette = await prisma.colorPalette.findFirst({ where: target === "admin" ? { use_for_admin: true, is_active: true, tenantId } : { use_for_shop: true, is_active: true, tenantId } });
    if (palette) {
      await redis.set(key, JSON.stringify(palette));
      return palette;
    }
    const fallback = {
      id: "default-bw",
      name: "mono",
      colors: ["#ffffff","#f2f2f2","#e6e6e6","#cccccc","#b3b3b3","#999999","#7f7f7f","#666666","#4d4d4d","#1a1a1a"],
      is_active: true,
      use_for_admin: target === "admin",
      use_for_shop: target === "shop",
      created_at: new Date(),
      updated_at: new Date()
    } as any;
    await redis.set(key, JSON.stringify(fallback));
    return fallback;
  }

  async refreshCache(tenantId?: string) {
    try {
      if (tenantId) {
        const data = await prisma.colorPalette.findMany({ where: { tenantId } });
        await redis.set(`palettes:all:${tenantId}`, JSON.stringify(data));
        const admin = await prisma.colorPalette.findFirst({ where: { use_for_admin: true, is_active: true, tenantId } });
        const shop = await prisma.colorPalette.findFirst({ where: { use_for_shop: true, is_active: true, tenantId } });
        if (admin) await redis.set(`palette:admin:${tenantId}`, JSON.stringify(admin));
        if (shop) await redis.set(`palette:shop:${tenantId}`, JSON.stringify(shop));
      } else {
        const data = await prisma.colorPalette.findMany();
        await redis.set("palettes:all", JSON.stringify(data));
      }
    } catch {
      const all = await this.readCacheAll(tenantId);
      const admin = all.find((p) => p.use_for_admin && p.is_active);
      const shop = all.find((p) => p.use_for_shop && p.is_active);
      if (tenantId) {
        if (admin) await redis.set(`palette:admin:${tenantId}`, JSON.stringify(admin));
        if (shop) await redis.set(`palette:shop:${tenantId}`, JSON.stringify(shop));
      } else {
        if (admin) await redis.set("palette:admin", JSON.stringify(admin));
        if (shop) await redis.set("palette:shop", JSON.stringify(shop));
      }
    }
  }
}

export default new PaletteServices();
