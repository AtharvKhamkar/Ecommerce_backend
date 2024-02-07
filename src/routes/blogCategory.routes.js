import { Router } from "express";
import { addCategory, deleteCategory, getAllCategory, getCategory, updateCategory } from "../controllers/blogCategory.controller.js";
import { isAdmin, verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router()

router.route("/add-category").post(verifyJWT, isAdmin, addCategory)
router.route("/get-category/:Id").get(verifyJWT, isAdmin, getCategory)
router.route("/all-category").get(verifyJWT, isAdmin, getAllCategory)
router.route("/update-category/:Id").patch(verifyJWT, isAdmin, updateCategory)
router.route("/delete-category/:Id").delete(verifyJWT,isAdmin,deleteCategory)

export default router