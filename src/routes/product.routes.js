import { Router } from "express";
import { createProduct } from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/add-product").post(upload.none(), createProduct)


export default router