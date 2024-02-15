import { Router } from "express";
import { addAddress, deleteAddress, getAddress, updateAddress } from "../controllers/address.controller.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/add-address/:Id").post(verifyJWT, upload.none(), addAddress)
router.route("/get-address/:Id").get(verifyJWT, getAddress)
router.route("/update-address/:Id").patch(verifyJWT, updateAddress)
router.route("/delete-address/:Id").delete(verifyJWT,deleteAddress)

export default router