import { Router } from "express";
import { saveProduct, saveCategory, getAllProducts, updateProductController } from "./router.controller";
import { uploadMultipleImages, handleImageUploadError, uploadSingleImage } from "../../middlewares/image.middleware";
import ProductServices from "./services/product.services";

const router = Router();
const product_service = new ProductServices

router.post(
    "/save-product",
     uploadMultipleImages('productImages', 10),
     handleImageUploadError, 
     saveProduct,
     (req: any, res: any) => product_service.saveProduct(req, res)
)

router.post("/categories", uploadSingleImage("image"), saveCategory, (req, res) => product_service.saveCategory(req, res))
router.get("/categories", (req, res) => product_service.getAllCategories(req, res))

router.get("/products", getAllProducts, (req, res) => product_service.getAllProducts(req, res))

router.delete("/products/:product_id", (req, res) => product_service.deleteProduct(req, res))

router.put(
    "/update-product/:product_id",
    uploadMultipleImages('productImages', 10),
    handleImageUploadError,
    updateProductController,
    (req: any, res: any) => product_service.updateProduct(req, res)
)

export default router