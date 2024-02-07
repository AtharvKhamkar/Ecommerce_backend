import { Router } from "express";
import { createCoupon, deleteCoupon, getAllCoupons, updateCoupons } from "../controllers/coupon.controller.js";
import { isAdmin, verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router()

router.route("/add-coupon").post(verifyJWT, isAdmin, createCoupon)
router.route("/all-coupon").get(verifyJWT, getAllCoupons)
router.route("/update-coupon/:Id").patch(verifyJWT, isAdmin, updateCoupons)
router.route("/delete-coupon/:Id").delete(verifyJWT,isAdmin,deleteCoupon)

export default router