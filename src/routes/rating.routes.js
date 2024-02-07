import { Router } from "express";
import { addRatings, deleteRatings, getAllProductRatings, getRatingByProduct, updateRatings } from "../controllers/rating.controller.js";
import { isAdmin, verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router()

router.route("/add-rating/:Id").post(verifyJWT, addRatings)
router.route("/get-all-ratings").get(verifyJWT, isAdmin, getAllProductRatings)
router.route("/update-ratings/:Id").patch(verifyJWT, updateRatings)
router.route("/delete-ratings/:Id").delete(verifyJWT, deleteRatings)
router.route("/get-product-ratings/:Id").get(verifyJWT,getRatingByProduct)

export default router