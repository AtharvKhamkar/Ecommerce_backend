import mongoose from "mongoose"

const blogCategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true,
        unique:true
    }

}, {
    timestamps:true
})

export const BlogCategory = mongoose.model("BlogCategory",blogCategorySchema)