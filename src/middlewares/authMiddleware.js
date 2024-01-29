import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(400,"Invalid access token")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiResponse(400,"Invalid User")
        }
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
    }
})

const isAdmin = asyncHandler(async (req, res, next) => {
    const { email } = req.user;
    const adminUser = await User.findOne({ email: email });
    if (adminUser.role !== "admin") {
        throw new ApiError(400,"You are not an admin")
    } else {
        next()
    }
})

export { isAdmin, verifyJWT };

