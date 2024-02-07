import mongoose from "mongoose";


const ratingSchema = new mongoose.Schema({
    star: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required:true
    },
    review: {
        type: String,
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Product"
    }

}, { timestamps: true })

export const Ratings = mongoose.model("Ratings",ratingSchema)