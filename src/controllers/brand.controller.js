import mongoose from "mongoose";
import { Brand } from "../models/brand.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addBrand = asyncHandler(async (req, res) => {
    const {title}  = req.body
    
    const brand = await Brand.create({
        title:title
    })

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                brand,
                "Brand Added successfully"
        )
    )
})

const getBrand = asyncHandler(async (req, res) => {
    const { Id } = req.params
    
    const brand = await Brand.findById(Id).select("title")

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                brand,
                "Brand fetched successfully"
        )
    )
})

const getAllBrand = asyncHandler(async (req, res) => {
    const brand = await Brand.find().select("title")

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                brand,
                "All Brand fetched successfully"
        )
    )
})

const updateBrand = asyncHandler(async (req, res) => {
    const {Id} = req.params
    const { newTitle } = req.body
    
    const brand = await Brand.findByIdAndUpdate(
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
                brand,
                "Brand updated successfully"
        )
    )
})

const deleteBrand = asyncHandler(async (req, res) => {
    const { Id } = req.params
    
    const brand = await Brand.findByIdAndDelete(Id)

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {
                    "deleted_Brand":brand.title
                },
                "Brand deleted succesfully"
        )
    )
})

export { addBrand, deleteBrand, getAllBrand, getBrand, updateBrand };

