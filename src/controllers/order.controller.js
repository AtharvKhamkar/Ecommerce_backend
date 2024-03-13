import mongoose from "mongoose";
import uniqid from "uniqid";
import { redisClient } from "../config/redis.js";
import { Cart } from "../models/cart.model.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const placeOrder = asyncHandler(async (req, res) => {
    const { paymentMethod, couponApplied } = req.body;

    const cart = await Cart.findOne({ orderBy: req.user?._id })
    let finalAmount = 0;
    try {
        if (couponApplied) {
            finalAmount = cart.totalAfterDiscount
        } else {
            finalAmount = cart.cartTotal
        }

        let newOrder = await Order.create({
            products: cart.products,
            paymentIntent: {
                id: uniqid(),
                method: paymentMethod,
                amount: finalAmount,
                status: "Order placed",
                created: Date.now(),
                currency:"rupees"
            },
            orderBy: req.user?.id,
            orderStatus:"Order placed"
        })

        let update = cart.products.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item.product._id },
                    update: { $inc: { quantity: -item.count, sold: item.count } }
                },
            };
        });

        const updated = await Product.bulkWrite(update, {});

        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    newOrder,
                    "Order placed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(400,`${error} error occured while placing order`)
    }
    
})

const userOrders = asyncHandler(async (req, res) => {
    const Id = req.user._id
    const cachedValue = await redisClient.get(`Order:${Id}`)
    if (cachedValue) {
        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    JSON.parse(cachedValue),
                    "Order fetched successfully"
            )
        )
    }
    const orders = await Order.find({ orderBy: Id })
        .populate("products.product", { title: 1, description: 1, price: 1, totalRating: 1 })
        .populate("orderBy", { firstName: 1, lastName: 1 })
        .exec()
    
    await redisClient.set(`Order:${Id}`,JSON.stringify(orders),'EX',60)

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                orders,
                "Orders fetched successfully"
        )
    )
})

const getAllOrders = asyncHandler(async (req, res) => {
    const cachedValue = await redisClient.get(`allOrders`)
    if (cachedValue) {
        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    JSON.parse(cachedValue),
                    "Successfully fetched all orders"
            )
        )
    }
    const orders = await Order.find()
        .populate("products.product",{title:1,description:1,price:1,totalRating:1})
        .populate("orderBy",{firstName:1,lastName:1})
        .exec()
    
    await redisClient.set(`allOrders`,JSON.stringify(orders),'EX',60)
    
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                orders,
                "Fetched all orders"
        )
    )
})

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { Id } = req.params;
    const {orderStatus} = req.body
    const order = await Order.findByIdAndUpdate(
        new mongoose.Types.ObjectId(Id),
        {
            $set: {
                orderStatus
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
                order,
                "Order status updated successfully"
        )
    )
})

const cancelOrder = asyncHandler(async (req, res) => {
    const { Id } = req.params;

    const order = await Order.findByIdAndDelete(Id)

    const update = order.products.map((item) => {
        return {
            updateOne: {
                filter: { _id: item.product._id },
                update: { $inc: { quantity: item.count, sold: -item.count } },
            },
        };
    })

    const updated = await Product.bulkWrite(update,{})

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {
                    "Deleted_order":order.id
                },
                "Order cancelled successfully"
        )
    )
})

export { cancelOrder, getAllOrders, placeOrder, updateOrderStatus, userOrders };

