import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        uppercase:true
    },
    expire: {
        type: String,
        required: true,
        default: () => {
            const currentDate = new Date();
            currentDate.setMonth(currentDate.getMonth() + 1)
            return currentDate
        }
    },
    discount: {
        type: Number,
        required:true
    }

}, { timestamps: true })

export const Coupon = mongoose.model("Coupon",couponSchema)