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

export { createCoupon };

