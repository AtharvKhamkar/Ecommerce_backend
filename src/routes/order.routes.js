import { Router } from "express";
import { cancelOrder, getAllOrders, placeOrder, updateOrderStatus, userOrders } from "../controllers/order.controller.js";
import { isAdmin, verifyJWT } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router()

router.route("/place-order").post(verifyJWT, upload.none(), placeOrder)
router.route("/get-orders").get(verifyJWT, userOrders)
router.route("/all-orders").get(verifyJWT, isAdmin, getAllOrders)
router.route("/update-order/:Id").patch(verifyJWT, isAdmin, updateOrderStatus)
router.route("/cancel-order/:Id").delete(verifyJWT,cancelOrder)

export default router