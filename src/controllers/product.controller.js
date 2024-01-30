import { Product } from "../models/productModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createProduct = asyncHandler(async (req, res) => {
    const newProduct = await Product.create(req.body);

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                newProduct,
                "Successfully created new product"
        )
    )
})

export { createProduct };
