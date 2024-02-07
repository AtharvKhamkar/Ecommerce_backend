import mongoose, { isValidObjectId } from "mongoose";
import slugify from "slugify";
import { Product } from "../models/product.model.js";
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
    try {
        //Filtering
        const queryObj = { ...req.query }
        const excludeFields = ["page", "limit", "sort", "fields"]
        excludeFields.forEach((el) => delete queryObj[el])
        let stringObj = JSON.stringify(queryObj)
        stringObj = stringObj.replace(/\b(gt|gte|lt|lte)\b/g, match=> `$${match}`)
        let query = Product.find(JSON.parse(stringObj))

        //sorting
        if (req.query.sort) {
            let sortBy = req.query.sort.split(",").join(" ")
            query = query.sort(sortBy)
        } else {
            query = query.sort("-createdAt")
        }

        //selecting fields
        if (req.query.fields) {
            let fields = req.query.fields.split(",").join(" ")
            query = query.select(fields)
        } else {
            query = query.select("-__v -createdAt -updatedAt")
        }

        //pagination
        let page = req.query.page || 1
        if (page < 1) {
            page = 1
        }
        const limit = req.query.limit || 3
        const skip = (page - 1) * limit
        query = query.skip(skip).limit(limit)
        if (req.query.page) {
            const totalDocs = await Product.countDocuments()
            if (skip >= totalDocs) {
                return res.status(200)
                    .json(
                        new ApiResponse(
                            200,
                            {},
                            "This page can not be found"
                    )
                )
            }
        }

        const allProducts = await query
        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    allProducts,
                    "Successfully fetched products"
            )
        )


    } catch (error) {
        console.log(error)
    }
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

const addToWishList = asyncHandler(async (req, res) => {
    const { Id } = req.params
    
    const user = req.user
    const isContain = user.wishlist.includes(Id)
    if (!isContain) {
        user.wishlist.push(Id)
        await user.save()
    } else {
        const findIndex = user.wishlist.findIndex(a => a._id === Id)
        user.wishlist.splice(findIndex, 1)
        await user.save()
    }
    
    

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Wishlist updated successfully"
        )
    )
})


export {addToWishList, createProduct, deleteProduct, getAllProducts, getaProduct, updateProduct };

