import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        index:true
    },
    lastName: {
        type: String,
        required: true,
        index:true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    mobile: {
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
        required:true
    }
}, {
    timestamps:true
}
)

export const User = mongoose.model("User",userSchema)