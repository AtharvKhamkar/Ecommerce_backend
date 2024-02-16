import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose, { isValidObjectId } from "mongoose";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "./email.controller.js";

const generateAccessTokenAndRefreshToken = async (userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh token and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, mobile, password } = req.body
    
    const checkUser = await User.findOne({email:email})
    if (checkUser) {
        throw new ApiError(400,"User is already registered")
    }

    const createdUser = await User.create({
        firstName,
        lastName,
        email,
        mobile,
        password
    })

    const user = await User.findById(createdUser._id)



    return res.status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "User created successfully"
        )
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    
    const checkRegistered = await User.findOne({ email})
    if (!checkRegistered) {
        throw new ApiError(401,"No user found please register first")
    }

    const isPasswordValid = await checkRegistered.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401,"Invalid credentials")
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(checkRegistered._id)
    
    const loggedInUser = await User.findById(checkRegistered._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure:true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user:loggedInUser,accessToken,refreshToken
                },
                "User logged in Successfully"
        )
    )
})

const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    
    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(400,"You are not admin please register first")
    }

    if (user.role !== "admin") {
        throw new ApiError(400,"You are not admin")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(400,"Incorrect credentials")
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)

    const loggedInAdmin = await User.findById(user._id).select("-accessToken -refreshToken")
    
    const options = {
        httpOnly: true,
        secure:true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user:loggedInAdmin,accessToken,refreshToken
                },
                "Admin logged in successfully"
        )
    )
})

const getAllUsers = asyncHandler(async(req, res) => {
    const allUsers = await User.find().select("-password -refreshToken")
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                allUsers,
                "All users fetched successfully"
        )
    )
})

const getUser = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400,"Please send valid commentID")
    }
    
    const user = await User.findById(userId).select("-password -refreshToken")
    if (!user) {
        throw new ApiResponse(400,"User not found please provide valid userID")
    }

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "User fetched successfully"
        )
    )
})

const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const user = await User.findByIdAndDelete(userId)

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {
                    deleted_user:user.firstName
                },
                "User deleted successfully"
        )
    )
})

const updateUser = asyncHandler(async (req, res) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                firstName: req?.body?.firstName,
                lastName: req?.body?.lastName,
                email: req?.body?.email,
                mobile:req?.body?.mobile
            }
        },
        {
            new : true
        }
    ).select("-password -refreshToken")

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                updatedUser,
                "User updated successfully"
        )
    )
})

const updatePassword = asyncHandler(async (req, res) => {
    const { userId } = req.user?._id
    const {newPassword} = req.body
    if (!isValidObjectId) {
        throw new ApiError(400,"Invalid user ID")
    }
    if (!newPassword) {
        throw new ApiError(400,"new password is required")
    }

    const fetchUser = await User.findById(req.user?._id)
    fetchUser.password = newPassword
    await fetchUser.save()

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password updated successfully"
        )
    )
})

const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(400, "Invalid email");
    }

    console.log(user)

    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi,please follow this link to reset your password.This link is valid till 10 minutes from now.<a href='http://localhost:8500/api/v1/users/reset-password/${token}'>Click here</>`;
    const data = {
        to: email,
        text: "Hey user",
        subject: "Forgot password link",
        htm:resetURL
    }
    sendEmail(data)

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                token,
                "reset password mail send successfully"
        )
    )
})

const resetPassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body
    const { token } = req.params
    
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex")
    
    const fetchedUser = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires:{$gt:Date.now()}
    })

    if (!fetchedUser) {
        throw new ApiError(400,"Token Expired,Please try again later")
    }
    fetchedUser.password = newPassword
    fetchedUser.passwordResetToken = undefined;
    fetchedUser.passwordResetExpires = undefined;
    await fetchedUser.save()

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password reset successfully"
        )
    )
})

const blockUser = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400,"Please provide valid userID")
    }

    const block = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                isBlocked:true
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
                "User blocked"
        )
    )
})

const unblockUser = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400,"Invalid userId")
    }

    const unblock = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                isBlocked:false
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
                "User unblocked"
        )
    )
})

const renewAccessAndRefreshToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(400,"Invalid refresh token")
    }

    const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
    const user = await User.findById(decodedRefreshToken._id)
    if (!user) {
        throw new ApiError(401,"Invalid User")
    }

    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(402,"refresh token did not matched")
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)
    const options= {
        httpOnly: true,
        secure:true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,refreshToken
                },
                "accessToken and refreshToken renewed"
        )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                refreshToken:1
            }
        },
        {
            new:true
        }
    )

    const options = {
        httpOnly: true,
        secure:true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged OUt"
        )
    )
})

const getWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user
    
    const fetchedUser = await User.aggregate([
        {
            $match: {
                _id:new mongoose.Types.ObjectId(_id)
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "wishlist",
                foreignField: "_id",
                as: "wishlist",
                pipeline: [
                    {
                        $project: {
                            title:1
                        }
                    }
                ]
            }
        },
        
        
    ])

    // const fetchedUser = await User.findById(_id).populate("wishlist");

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                fetchedUser,
                "User wishlist fetched successfully"
        )
    )
})

const getUserAddress = asyncHandler(async (req, res) => {
    const  user  = req.user
    
    const allAddress = await User.findById(user._id).populate("address").select("address")

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                allAddress,
                "Success"
        )
    )
})

const userCart = asyncHandler(async (req, res) => {
    //get product info from user through req.body
    //get user instance through verifyJWT
    //check if the cart is alreadyexist or not
    //create one empty product array
    //create on empty object that contains value of product, count,prize
    //get product price by product Id
    //push that object into the product array
    //for loop through the array and calculate price
    //save the created object to the database

    const { cart } = req.body;
    const user = req.user

    if (!isValidObjectId(user._id)) {
        throw new ApiError(400,"Invalid user Id")
    }

    const isAlreadyExistCart = await Cart.findOne({ orderBy: user._id })
    if (isAlreadyExistCart) {
        await isAlreadyExistCart.remove()
        throw new ApiError(400, "Cart is already exists")
    }

    try {
        let products = [];
        console.log(cart)
        for (let i = 0; i < cart.length; i++){
            let object = {}
            object.product = cart[i]._id
            object.count = cart[i].count
            object.color = cart[i].color
            let getPrice = await Product.findById(cart[i]._id).select("price").exec();
            object.price = getPrice.price;
            products.push(object)
        }
        
        let cartTotal = 0;
        for (let i = 0; i < products.length; i++){
            cartTotal = cartTotal + products[i].count * products[i].price
        }
        const newCart = await Cart.create({
            products,
            cartTotal,
            orderBy:user?._id

        })
        await user.cart.push(newCart._id)
        await user.save()

        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    newCart,
                    "Cart fetched successfully"
            )
        )
    } catch (error) {
        throw new ApiError(400,error)
    }

})

const getUserCart = asyncHandler(async (req, res) => {
    const user = req.user
    
    const cart = await Cart.findOne({orderBy:user._id}).populate("products.product")

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                cart,
                "Cart fetched successfully"
        )
    )
})

const emptyCart = asyncHandler(async (req, res) => {
    const user = req.user

    const cart = await Cart.findOneAndDelete({ orderBy: user._id })

    const findIndex = user.cart.findIndex(a => a._id === cart._id)
    user.cart.splice(findIndex, 1)
    await user.save()
    
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {
                    "deleted_cart" : cart._id
                },
                "Cart empty successfully "
        )
    )
})





export { blockUser, deleteUser, emptyCart, forgotPasswordToken, getAllUsers, getUser, getUserAddress, getUserCart, getWishlist, loginAdmin, loginUser, logoutUser, registerUser, renewAccessAndRefreshToken, resetPassword, unblockUser, updatePassword, updateUser, userCart };

