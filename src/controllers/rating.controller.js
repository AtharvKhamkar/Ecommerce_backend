import mongoose, { isValidObjectId } from "mongoose";
import { redisClient } from "../config/redis.js";
import { Product } from "../models/product.model.js";
import { Ratings } from "../models/ratings.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const calTotalRating = async (Id)=>{
    try {
        const productRatings = await Ratings.aggregate([
            {
                $match: {
                    productId:new mongoose.Types.ObjectId(Id)
                }
            }
        ])

        let average = 0
        if (productRatings.length) {
            let total = 0
            productRatings.map((e) => (total += e.star))
            average = total / productRatings.length
            average = Math.round(average*10)/10

        }
        console.log(average)

        return average
        
    } catch (error) {
        throw new ApiError(400,Error)
    }
}


const addRatings = asyncHandler(async (req, res) => {
    //get productId from params and star and review from body
    //create rating object through body
    //after creating the object push that objectId into ratings array in Product 

    const { Id } = req.params
    const { star, review } = req.body
    const userId = req.user?._id
    
    const isAlreadyRated = await Ratings.find({
        postedBy: userId,
        productId: Id
    })

    const checkProductId = await Product.findById(Id)
    
    if (isAlreadyRated.length === 0 && checkProductId) {
        var rating = await Ratings.create({
            star,
            review,
            postedBy: userId,
            productId:Id
        })
    } else {
        throw new ApiError(400,"User has already rated or product not found")
    }

    const totalRatings = await calTotalRating(Id)

    await Product.findByIdAndUpdate(
        new mongoose.Types.ObjectId(Id),
        {
            $set: {
                totalRatings:totalRatings
            }
        },
        {
            new:true
        }
    )

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                rating,
                "Rating added successfully"
        )
    )

    
})

const updateRatings = asyncHandler(async (req, res) => {
    const { Id } = req.params
    
    
    if (!isValidObjectId(Id)) {
        throw new ApiError(400,"Invalid ObjectId")
    }

    const product = await await Ratings.findByIdAndUpdate(
        new mongoose.Types.ObjectId(Id),
        {
            $set: {
                star: req.body?.star,
                review:req.body?.review
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
                product,
                "Rating updated successfully"

        )
    )
})

const getAllProductRatings = asyncHandler(async (req, res) => {
    const cachedValue = await redisClient.get(`allProductRating`)
    if (cachedValue) {
        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    JSON.parse(cachedValue),
                    "Successfully fetched all product ratings"
            )
        )
    }
    const ratings = await Ratings.aggregate(
        [
            {
                $lookup: {
                    from:"users",
                    foreignField: "_id",
                    localField: "postedBy",
                    as: "postedBy",
                    pipeline: [
                        {
                            $project: {
                                fullName: {
                                    $concat: [
                                        "$firstName"," ","$lastName"
                                    ]
                                }
                            }
                        }
                    ]
                    
               }
            },
            {
                $addFields: {
                    postedBy: {
                        $first:"$postedBy.fullName"
                    }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productId",
                    pipeline: [
                        {
                            $project: {
                                title:1
                            }
                        }
                    ]
                },
            },
            {
                $addFields: {
                    productId: {
                        $first:"$productId.title"
                    }
                }
            }

            
           
        ]

    )

    await redisClient.set(`allProductRating`,JSON.stringify(ratings),'EX',60)
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                ratings,
                "All ratings fetched successfully"
        )
    )
})

const getRatingByProduct = asyncHandler(async (req, res) => {
    const { Id } = req.params

    const cachedValue = await redisClient.get(`rating:${Id}`)
    if (cachedValue) {
        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    JSON.parse(cachedValue),
                    "Successfully fetched product rating"
            )
        )
    }
    
    const rating = await Ratings.find({
        productId:Id
    }).select("-createdAt -updatedAt -__V")

    const averageRating = await calTotalRating(Id)

    await redisClient.set(`rating:${Id}`,JSON.stringify(averageRating),'EX',60)

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {
                    rating,averageRating
                },
                "Successfully fetched product rating"
        )
    )


})

const deleteRatings = asyncHandler(async (req, res) => {
    const { Id } = req.params
    
    const product = await Ratings.findByIdAndDelete(Id)

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {
                    "Rating_deleted":product._id
                },
                "Successfully deleted rating"
                
        )
    )
})




export { addRatings, deleteRatings, getAllProductRatings, getRatingByProduct, updateRatings };

