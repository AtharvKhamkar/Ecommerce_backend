import { Router } from "express";
import { addImages, addToWishList, createProduct, deleteProduct, getAllProducts, getaProduct, updateProduct } from "../controllers/product.controller.js";
import { isAdmin, verifyJWT } from "../middlewares/authMiddleware.js";
import { productImageResize, upload } from "../middlewares/multer.middleware.js";


const router = Router()

router.route("/add-product").post(upload.none(), verifyJWT,isAdmin,createProduct)
router.route("/get-product/:productId").get(getaProduct)
router.route("/get-products").get(getAllProducts)
router.route("/update-product/:productId").patch(upload.none(),verifyJWT,isAdmin, updateProduct)
router.route("/delete-product/:productId").delete(verifyJWT, isAdmin, deleteProduct)
router.route("/add-to-wishlist/:Id").patch(verifyJWT, addToWishList)
router.route("/upload/:Id").post(
    verifyJWT,
    isAdmin,
    upload.array('images', 10),
    productImageResize,
    addImages
)



export default router