import { Request, Response } from "express";
import SalesServices from "./services/sales.services";
import { SaleRequest } from "./services/schemas/sales.schemas";

export const saveSale = async (req: Request, res: Response) => {
    try {
        const request = req.body as SaleRequest;
        const hasProducts = Array.isArray(request.product_ids) && request.product_ids.length > 0;
        const hasManual = !!request.loadedManually && Array.isArray(request.manualProducts) && request.manualProducts.length > 0;
        if(!request.payment_method || !request.source || (!hasProducts && !hasManual)){
            return res.status(400).json({
                success: false,
                message: "Faltan datos obligatorios para guardar la venta."
            })
        }
        const response = await SalesServices.saveSale(request);
        if(response === true){
            res.status(200).json({
                success: true,
                message: "Venta guardada exitosamente."
            })
        } else {
            res.status(400).json({
                success: false,
                err: response.message,
                message: "Error al guardar la venta, por favor intente nuevamente."
            })
        }
    } catch (error: any) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            err: error.message,
            message: "Error interno del servidor al guardar la venta, por favor intente nuevamente."
        })
    }
}

export const getSales = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const per_page = Number((req.query.per_page || req.query.limit)) || 10;
        const response = await SalesServices.getSales({ page, per_page });

        if (Array.isArray(response?.sales)) {
            res.status(200).json({
                success: true,
                sales: response.sales,
                pagination: response.pagination
            })
        } else {
            res.status(400).json({
                success: false,
                err: response,
                message: "Error al obtener las ventas, por favor intente nuevamente."
            })
        }
    } catch (error: any) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            err: error.message,
            message: "Error interno del servidor al obtener las ventas, por favor intente nuevamente."
        })
    }
}
