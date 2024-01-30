import mongoose, { isValidObjectId } from "mongoose";
import slugify from "slugify";
import { Product } from "../models/productModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createProduct = asyncHandler(async (req, res) => {
    if (req.body.title) {
        req.body.slug = slugify(req.body.title)
    }
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

const getaProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params
    
    if (!isValidObjectId(productId)) {
        throw new ApiError(400,"Invalid productId")
    }

    const product = await Product.findById(productId).select("-createdAt -updatedAt")
    if (!product) {
        throw new ApiError(400,"Product not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                product,
                "Successfully fetched a product"
        )
    )
})

const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find().select("-createdAt -updatedAt")
    if (!products) {
        throw new ApiError(400,"Error while fetching products")
    }

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                products,
                "Successfully fetched all products"
        )
    )
})

const updateProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params
    
    if (!isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid productId")
    }

    if (req.body.title) {
        req.body.slug = slugify(req.body.title)
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        new mongoose.Types.ObjectId(productId),
        req.body,
        {
            new:true
        }
    ).select("-createdAt -updatedAt")

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                updatedProduct,
                "Product updated successfully"
        )
    )
})

const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params
    if (!isValidObjectId(productId)) {
        throw new ApiError(400,"Invalid userId")
    }

    const toDeleteProduct = await Product.findByIdAndDelete(productId)

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {
                    "Deleted_product" : toDeleteProduct.title
                },
                "Product deleted successfully"
        )
    )
})

export { createProduct, deleteProduct, getAllProducts, getaProduct, updateProduct };

