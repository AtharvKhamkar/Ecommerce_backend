import { Router } from "express";
import { isAdmin, verifyJWT } from "../middlewares/authMiddleware.js";
import { createCoupon } from "../controllers/coupon.controller.js";

const router = Router()

router.route("/add-coupon").post(verifyJWT, isAdmin, createCoupon)

export default router