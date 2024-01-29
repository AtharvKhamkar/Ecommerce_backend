import { Router } from "express";
import { blockUser, deleteUser, getAllUsers, getUser, loginUser, registerUser, renewAccessAndRefreshToken, unblockUser, updateUser } from "../controllers/user.controller.js";
import { isAdmin, verifyJWT } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()


router.route("/register").post(upload.none(), registerUser)
router.route("/login").post(upload.none(), loginUser)
router.route("/all-users").get(verifyJWT,isAdmin,getAllUsers)
router.route("/get-user/:userId").get(getUser)
router.route("/delete-user/:userId").delete(deleteUser)
router.route("/update-user").patch(verifyJWT, upload.none(), updateUser)
router.route("/block-user/:userId").patch(blockUser)
router.route("/unblock-user/:userId").patch(unblockUser)
router.route("/renew-tokens").post(upload.none(),renewAccessAndRefreshToken)

export default router