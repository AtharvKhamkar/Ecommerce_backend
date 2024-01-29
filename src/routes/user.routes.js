import { Router } from "express";
import { deleteUser, getAllUsers, getUser, loginUser, registerUser, updateUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()


router.route("/register").post(upload.none(), registerUser)
router.route("/login").post(upload.none(), loginUser)
router.route("/all-users").get(getAllUsers)
router.route("/get-user/:userId").get(getUser)
router.route("/delete-user/:userId").delete(deleteUser)
router.route("/update-user/:userId").patch(upload.none(),updateUser)

export default router