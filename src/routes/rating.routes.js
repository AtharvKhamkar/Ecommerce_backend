import { Router } from "express";
import { addRatings, getAllProductRatings } from "../controllers/rating.controller.js";
import { isAdmin, verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router()

router.route("/add-rating/:Id").post(verifyJWT, addRatings)
router.route("/get-all-ratings").get(verifyJWT,isAdmin,getAllProductRatings)

export default router