import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
    const { userId } = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400,"Invalid ObjectId")
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
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
    )

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                updatedUser,
                "User updated successfully"
        )
    )
})


export { deleteUser, getAllUsers, getUser, loginUser, registerUser, updateUser };

