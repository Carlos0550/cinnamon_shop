import { Request, Response } from "express";
import { BusinessDataRequest } from "./schemas/business.schemas";
import businessServices from "./business.services";
class BusinessController {
    async createBusiness(req: Request, res: Response) {
        const payload = req.body as BusinessDataRequest;

        if(!Array.isArray(payload.bankData) || payload.bankData.length === 0) {
            return res.status(400).json({ error: "Los datos bancarios son requeridos" });
        }

        if(!payload.name || !payload.email || !payload.phone || !payload.address || !payload.city || !payload.state) {
            return res.status(400).json({ error: "Todos los campos son requeridos" });
        }
        const business = await businessServices.createBusiness(payload);
        res.status(201).json(business);
    }

    async updateBusiness(req: Request, res: Response) {
        try {
            const { id } = req.params as { id: string };
            const payload = req.body as BusinessDataRequest;

            if(!payload.name || !payload.email || !payload.phone || !payload.address || !payload.city || !payload.state) {
                return res.status(400).json({ error: "Todos los campos son requeridos" });
            }

            const business = await businessServices.updateBusiness(id, payload);
            return res.status(200).json(business);
        } catch (error) {
            if (error instanceof Error && error.message === "BUSINESS_NOT_FOUND") {
                return res.status(404).json({ error: "Negocio no encontrado" });
            }
            return res.status(500).json({ error: "Error al actualizar el negocio" });
        }
    }

    async getBusiness(req: Request, res: Response) {
        try {
            const data = await businessServices.getBusiness();
            if (!data) {
                return res.status(404).json({ error: "Negocio no configurado" });
            }
            return res.status(200).json(data);
        } catch {
            return res.status(500).json({ error: "Error al obtener la información del negocio" });
        }
    }
}

export default new BusinessController()
