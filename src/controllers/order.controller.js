import uniqid from "uniqid";
import { Cart } from "../models/cart.model.js";
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";

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

export { placeOrder };
