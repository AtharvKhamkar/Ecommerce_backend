import mongoose from "mongoose";
import { Category } from "../models/category.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addCategory = asyncHandler(async (req, res) => {
    const {title}  = req.body
    
    const category = await Category.create({
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
    
    const category = await Category.findById(Id).select("title")

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
    const category = await Category.find().select("title")

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
    
    const category = await Category.findByIdAndUpdate(
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
    
    const category = await Category.findByIdAndDelete(Id)

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {
                    "deleted_category":category.title
                },
                "Category deleted succesfully"
        )
    )
})

export { addCategory, deleteCategory, getAllCategory, getCategory, updateCategory };

