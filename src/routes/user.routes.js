import { Router } from "express";
import { applyCoupon, blockUser, deleteUser, emptyCart, forgotPasswordToken, getAllUsers, getUser, getUserAddress, getUserCart, getWishlist, loginAdmin, loginUser, logoutUser, registerUser, renewAccessAndRefreshToken, resetPassword, unblockUser, updatePassword, updateUser, userCart } from "../controllers/user.controller.js";
import { isAdmin, verifyJWT } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()


router.route("/register").post(upload.none(), registerUser)
router.route("/login").post(upload.none(), loginUser)
router.route("/login-admin").post(upload.none(),loginAdmin)
router.route("/all-users").get(verifyJWT,isAdmin,getAllUsers)
router.route("/get-user/:userId").get(getUser)
router.route("/delete-user/:userId").delete(deleteUser)
router.route("/update-user").patch(verifyJWT, upload.none(), updateUser)
router.route("/update-password").patch(verifyJWT, upload.none(), updatePassword)
router.route("/forgot-password").patch(upload.none(), forgotPasswordToken)
router.route("/reset-password/:token").patch(upload.none(),resetPassword)
router.route("/block-user/:userId").patch(blockUser)
router.route("/unblock-user/:userId").patch(unblockUser)
router.route("/get-address").get(verifyJWT, getUserAddress)
router.route("/add-cart").post(verifyJWT, userCart)
router.route("/get-cart").get(verifyJWT, getUserCart)
router.route("/empty-cart").delete(verifyJWT, emptyCart)
router.route("/apply-coupon").patch(verifyJWT,upload.none(),applyCoupon)
router.route("/renew-tokens").post(upload.none(), renewAccessAndRefreshToken)
router.route("/get-wishlist").get(verifyJWT,getWishlist)
router.route("/logout").post(verifyJWT,upload.none(),logoutUser)

export default router