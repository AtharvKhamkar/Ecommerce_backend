import { Ratings } from "../models/ratings.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const addRatings = asyncHandler(async (req, res) => {
    //get productId from params and star and review from body
    //create rating object through body
    //after creating the object push that objectId into ratings array in Product 

    const { Id } = req.params
    const { star, review } = req.body
    const userId = req.user?._id
    
    const isAlreadyRated = await Ratings.find({
        postedBy: userId,
        productId:Id
    })
    
    if (isAlreadyRated.length === 0) {
        var rating = await Ratings.create({
            star,
            review,
            postedBy: userId,
            productId:Id
        })
    } else {
        throw new ApiError(400,"User has already rated")
    }

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                rating,
                "Rating added successfully"
        )
    )

    
})

const getAllProductRatings = asyncHandler(async (req, res) => {
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
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                ratings,
                "All ratings fetched successfully"
        )
    )
})


export { addRatings, getAllProductRatings };

