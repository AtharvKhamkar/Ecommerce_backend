import { Router } from "express";
import { addBrand, deleteBrand, getAllBrand, getBrand, updateBrand } from "../controllers/brand.controller.js";
import { isAdmin, verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router()

router.route("/add-brand").post(verifyJWT, isAdmin, addBrand)
router.route("/get-brand/:Id").get(verifyJWT, isAdmin, getBrand)
router.route("/all-brand").get(verifyJWT, isAdmin, getAllBrand)
router.route("/update-brand/:Id").patch(verifyJWT, isAdmin, updateBrand)
router.route("/delete-brand/:Id").delete(verifyJWT,isAdmin,deleteBrand)

export default router