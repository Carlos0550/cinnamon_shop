import { NextFunction, Request, Response } from "express"

export const saveProduct = async (req: Request, res: Response, next: NextFunction) => {
    const {
        title,
        description,
        price,
        tags,
        category_id
    } = req.body

    try {
        if (!title || !price || !category_id){
            return res.status(400).json({
                ok: false,
                error: "Uno o más campos obligatorios están vacios."
            })
        }
        
        next()
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            error: "Error interno del servidor al validar la subida del producto, por favor intente nuevamente."
        })
    }
}

export const saveCategory = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {
            title,
        } = req.body

        if(!title){
            return res.status(400).json({
                ok: false,
                error: "El título esta vacio, por favor coloque un titulo."
            })
        }

        next()
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            error: "Error interno del servidor al validar esta solicitud, por favor intente nuevamente."
        })
    }
}

export const getAllProducts = async (req:Request, res: Response, next: NextFunction) => {
    try {
        const {
            page,
            limit,
            title,
            categoryId,
            isActive
        } = req.query

        if(!page || !limit){
            return res.status(400).json({
                ok: false,
                error: "Faltan parametros obligatorios: page, limit."
            })
        }

        if(title !== undefined && title == ""){
            return res.status(400).json({
                ok: false,
                error: "El parametro title no puede estar vacio."
            })
        }

        if(categoryId !== undefined && categoryId == ""){
            return res.status(400).json({
                ok: false,
                error: "El parametro categoryId no puede estar vacio."
            })
        }
    
        if(isActive !== undefined){
            var parsedBool = isActive === 'true' ? true : 
                            isActive === 'false' ? false : undefined;
            if(parsedBool === undefined){
                return res.status(400).json({
                    ok: false,
                    error: "El parametro isActive debe ser true o false."
                })
            }
        }

        next()
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            error: "Error interno del servidor al validar esta solicitud, por favor intente nuevamente."
        })
    }
}