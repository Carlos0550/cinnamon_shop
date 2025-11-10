import { Router } from "express";
import { saveProduct, saveCategory, getAllProducts, updateProductController, changeCategoryStatus } from "./router.controller";
import { uploadMultipleImages, handleImageUploadError, uploadSingleImage } from "../../middlewares/image.middleware";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import ProductServices from "./services/product.services";

const router = Router();
const product_service = new ProductServices

router.post(
    "/save-product",
     requireAuth,
     uploadMultipleImages('productImages', 10),
     handleImageUploadError, 
     saveProduct,
     (req: any, res: any) => product_service.saveProduct(req, res)
)

router.post("/categories", requireAuth, requireRole([1]), uploadSingleImage("image"), saveCategory, (req, res) => product_service.saveCategory(req, res))
router.put("/categories/:category_id", requireAuth, requireRole([1]), uploadSingleImage("image"), (req, res) => product_service.updateCategory(req, res))
router.get("/categories", requireAuth, requireRole([1]), (req, res) => product_service.getAllCategories(req, res))

router.get("/", requireAuth, getAllProducts, requireRole([1]),(req, res) => product_service.getAllProducts(req, res))


router.delete("/:product_id", requireAuth,requireRole([1]), (req, res) => product_service.deleteProduct(req, res))

router.put(
    "/:product_id",
    requireAuth,
    requireRole([1]),
    uploadMultipleImages('productImages', 10),
    handleImageUploadError,
    updateProductController,
    (req: any, res: any) => product_service.updateProduct(req, res)
)

router.patch(
    "/categories/status/:category_id/:status",
    requireAuth,
    requireRole([1]),
    changeCategoryStatus,
    (req, res) => product_service.categoryChangeStatus(req, res)
)

//Public endpoints
router.get("/public", (req, res) => product_service.getPublicProducts(req, res))
router.get("/public/categories", (req, res) => product_service.getPublicCategories(req, res))
export default router