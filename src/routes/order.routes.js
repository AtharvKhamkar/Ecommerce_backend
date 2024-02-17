import { Router } from "express";
import { isAdmin, verifyJWT } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { placeOrder } from "../controllers/order.controller.js";


const router = Router()

router.route("/place-order").post(verifyJWT, upload.none(), placeOrder)

export default router