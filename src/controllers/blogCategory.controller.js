import mongoose from "mongoose";
import { redisClient } from "../config/redis.js";
import { BlogCategory } from "../models/blogCategory.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addCategory = asyncHandler(async (req, res) => {
    const {title}  = req.body
    
    const category = await BlogCategory.create({
        title:title
    })

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                category,
                "Category Added successfully"
        )
    )
})

const getCategory = asyncHandler(async (req, res) => {
    const { Id } = req.params

    const cachedValue = await redisClient.get(`category:${Id}`)
    if (cachedValue) {
        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    JSON.parse(cachedValue),
                    "Successfully fetched category"
            )
        )
    }
    
    const category = await BlogCategory.findById(Id).select("title")

    await redisClient.set(`category:${Id}`,JSON.stringify(category),'EX',60)

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                category,
                "Category fetched successfully"
        )
    )
})

const getAllCategory = asyncHandler(async (req, res) => {
    const cachedValue = await redisClient.get(`getAllCategory`)
    if (cachedValue) {
        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    JSON.parse(cachedValue),
                    "Successfully fetched all category"
            )
        )
    }

    const category = await BlogCategory.find().select("title")

    await redisClient.set(`getAllCategory`,JSON.stringify(category),'EX',60)

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                category,
                "All category fetched successfully"
        )
    )
})

const updateCategory = asyncHandler(async (req, res) => {
    const {Id} = req.params
    const { newTitle } = req.body
    
    const category = await BlogCategory.findByIdAndUpdate(
        new mongoose.Types.ObjectId(Id),
        {
            $set: {
                title:newTitle
            }
        },
        {
            new : true
        }

    )

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                category,
                "Category updated successfully"
        )
    )
})

const deleteCategory = asyncHandler(async (req, res) => {
    const { Id } = req.params
    
    const category = await BlogCategory.findByIdAndDelete(Id)

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {
                    "deleted_category":category.title
                },
                "Category deleted successfully"
        )
    )
})

export { addCategory, deleteCategory, getAllCategory, getCategory, updateCategory };
