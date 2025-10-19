import { Router } from "express";
import { saveProduct, saveCategory, getAllProducts } from "./router.controller";
import { uploadMultipleImages, handleImageUploadError, uploadSingleImage } from "../../middlewares/image.middleware";
import ProductServices from "./services/product.services";

const router = Router();
const product_service = new ProductServices

router.post(
    "/save-product",
     uploadMultipleImages('productImages', 10),
     handleImageUploadError, 
     saveProduct,
     product_service.saveProduct
)


router.post("/categories", uploadSingleImage("image"), saveCategory, product_service.saveCategory)
router.get("/categories", product_service.getAllCategories)

router.get("/products", getAllProducts, product_service.getAllProducts)

export default router