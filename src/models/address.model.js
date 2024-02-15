import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required:true
    },
    phoneNumber: {
        type: Number,
        required:true
    },
    pinCode: {
        type: String,
        required:true
    },
    state: {
        type:String
    },
    city: {
        type:String
    },
    houseNo: {
        type: String,
        required:true
    },
    area: {
        type: String,
    },
    landMark: {
        type:String
    },
    addressType: {
        type: String,
        enum: ["Home", "Word"],
        required:true
    }

}, {
    timestamps:true
})

export const Address = mongoose.model("Address",addressSchema)

