import mongoose from "mongoose";
import { Coupon } from "../models/coupon.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createCoupon = asyncHandler(async (req, res) => {
    const { name, expire, discount } = req.body

    const coupon = await Coupon.create({
        name,
        expire,
        discount
    })

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                coupon,
                "Coupon created successfully"
        )
    )
})

const getAllCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find()

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                coupons,
                "Coupons fetched successfully"
            )
    )
})

const updateCoupons = asyncHandler(async (req, res) => {
    const { Id } = req.params
    
    const coupons = await Coupon.findByIdAndUpdate(
        new mongoose.Types.ObjectId(Id),
        {
            $set: {
                name: req.body?.name,
                expire: req.body?.expire,
                discount:req.body?.discount
            }
        },
        {
            new:true
        }
    ).select("-createdAt -updatedAt -__V")

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                coupons,
                "Coupons updated successfully"
        )
    )
})

const deleteCoupon = asyncHandler(async (req, res) => {
    const { Id } = req.params
    
    const coupon = await Coupon.findByIdAndDelete(Id)

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {
                    "Deleted_coupon":coupon.name
                },
                "coupon deleted successfully"
        )
    )
 })

export { createCoupon, deleteCoupon, getAllCoupons, updateCoupons };

