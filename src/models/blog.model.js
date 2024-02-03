import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required:true
    },
    description: {
        type: String,
        required:true
    },
    category: {
        type: String,
        required:true
    },
    views: {
        type: Number,
        default:0
    },
    isLiked: {
        type: Boolean,
        default:false
    },
    isDisliked: {
        type: Boolean,
        default:false
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    dislikes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    image: {
        type: String,
        default:"https://images.pexels.com/photos/733856/pexels-photo-733856.jpeg"
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    }

}, {
    toJSON: {
        virtuals:true
    },
    toObject: {
        virtuals:true
    },
    timestamps:true
})

export const Blog = mongoose.model("Blog",blogSchema)