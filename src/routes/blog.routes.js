import { Router } from "express";
import { addBlogImages, createBlog, deleteBlog, dislikeBlog, getAllBlogs, getBlog, likeBlog, updateBlog } from "../controllers/blog.controller.js";
import { isAdmin, verifyJWT } from "../middlewares/authMiddleware.js";
import { blogImageResize, upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/create-blog").post(verifyJWT, isAdmin, upload.none(), createBlog)
router.route("/update-blog/:Id").patch(verifyJWT, isAdmin, upload.none(), updateBlog)
router.route("/get-blog/:Id").get(verifyJWT, isAdmin, getBlog)
router.route("/all").get(getAllBlogs)
router.route("/delete-blog/:Id").delete(verifyJWT, isAdmin, deleteBlog)
router.route("/like-blog/:Id").patch(verifyJWT, likeBlog)
router.route("/dislike-blog/:Id").patch(verifyJWT, dislikeBlog)
router.route("/add-images/:Id").patch(
    verifyJWT,
    isAdmin,
    upload.array("images", 2),
    blogImageResize,
    addBlogImages
)

export default router