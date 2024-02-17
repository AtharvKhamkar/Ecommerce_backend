import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref:"Product"
            },
            count: Number,
            color:String
        },

    ],
    paymentIntent: {},
    orderStatus: {
        type: String,
        default: "Order placed",
        enum: [
            "Order placed",
            "Not Processed",
            "Processing",
            "Dispatched",
            "Cancelled",
            "Out for delivery",
            "Delivered"
        ]
    },
    orderBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    totalAmount: {
        type:Number
    }

}, {
    timestamps:true
})

export const Order = mongoose.model("Order",orderSchema)