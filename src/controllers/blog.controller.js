import mongoose, { isValidObjectId } from "mongoose";
import { redisClient } from "../config/redis.js";
import { Blog } from "../models/blog.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createBlog = asyncHandler(async (req, res) => {
    const { title, description, category } = req.body
    
    const blog = await Blog.create({
        title: title,
        description: description,
        category:category
    })

    if (!blog) {
        throw new ApiError(400,"Error while creating the blog")
    }

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                blog,
                "Blog created successfully"
        )
    )
})

const updateBlog = asyncHandler(async (req, res) => {
    const {Id} = req.params
    const updatedBlog = await Blog.findByIdAndUpdate(
        new mongoose.Types.ObjectId(Id),
        {
            $set: {
                title:req.body?.title,
                description:req.body?.description,
                category:req.body?.category
            }
        },
        {
            new:true
        }
    ).select("-createdAt -updatedAt -__v")

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                updatedBlog,
                "Blog updated successfully"
        )
    )
})

const getBlog = asyncHandler(async (req, res) => {
    const { Id } = req.params
    if (!isValidObjectId) {
        throw new ApiError(400,"Invalid blog Id")
    }

    const cachedValue = await redisClient.get(`blog:${Id}`)
    if (cachedValue) {
        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    JSON.parse(cachedValue),
                    "Blog fetched successfully"
            )
        )
    }

    const blog = await Blog.findByIdAndUpdate(
        Id,
        {
            $inc: {
                views:1
            }
        },
        {
            new:true
        }
    )

    await redisClient.set(`blog:${Id}`,JSON.stringify(blog),'EX',60)

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                blog,
                "Blog fetched successfully"
        )
    )
})

const getAllBlogs = asyncHandler(async (req, res) => {
    const cachedValue = await redisClient.get(`allBlogs`)
    if (cachedValue) {
        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    JSON.parse(cachedValue),
                    "All blogs fetched successfully"
            )
        )
    }
    const blogs = await Blog.find()

    await redisClient.set(`allBlogs`,JSON.stringify(blogs),'EX',60)

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                blogs,
                "All blogs fetched successfully"
        )
    )
})

const deleteBlog = asyncHandler(async (req, res) => {
    const { Id } = req.params
    const deletedBlog = await Blog.findByIdAndDelete(Id)

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {
                    "Deleted_Blog":deletedBlog.title
                },
                "Blog deleted successfully"
        )
    )
})

const likeBlog = asyncHandler(async (req, res) => {
    const { Id } = req.params
    
    const blog = await Blog.findById(Id)
    if (!blog) {
        throw new ApiError(400,"Blog does not found")
    }

    if (blog.isLiked === false) {
        blog.isLiked = true
        blog.likes.push(req.user._id)
        await blog.save()
    } else {
        blog.isLiked = false
        const findIndex = blog.likes.findIndex(a => a._id === req.user._id)
        blog.likes.splice(findIndex,1)
        await blog.save()
    }

    

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                blog,
                "Blog liked successfully"
        )
    )
})

const dislikeBlog = asyncHandler(async (req, res) => {
    const { Id } = req.params
    
    const blog = await Blog.findById(Id)

    if (blog.isDisliked === false) {
        blog.isDisliked = true
        blog.dislikes.push(req.user._id)
        await blog.save()
    } else {
        blog.isDisliked = false
        const findIndex = blog.dislikes.findIndex(a => a._id === req.user._id)
        blog.dislikes.splice(findIndex, 1)
        await blog.save()
    }

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                blog,
                "Blog disliked successfully"
        )
    )
})

const addBlogImages = asyncHandler(async (req, res) => {
    const { Id } = req.params;
    if (!isValidObjectId(Id)) {
        throw new ApiError(400, "Invalid object Id")
    }

    try {
        const uploader = (path) => uploadOnCloudinary(path, "images");
        const urls = [];
        const files = req.files;
        for (const file of files) {
            const { path } = file;
            const newPath = await uploader(path);
            urls.push(newPath.url);
        }

        const findBlog = await Blog.findByIdAndUpdate(
            new mongoose.Types.ObjectId(Id),
            {
                images: urls.map((file) => {
                    return file;
                }),
            },
            {
                new:true
            }
        )
        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    findBlog,
                    "Images uploaded successfully"
            )
        )
    } catch (error) {
        throw new ApiError(400,"Error while uploading image on cloudinary")
    }
})


export { addBlogImages, createBlog, deleteBlog, dislikeBlog, getAllBlogs, getBlog, likeBlog, updateBlog };

