import mongoose from "mongoose"

const brandSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true,
        unique:true
    }

}, {
    timestamps:true
})

export const Brand = mongoose.model("Brand",brandSchema)