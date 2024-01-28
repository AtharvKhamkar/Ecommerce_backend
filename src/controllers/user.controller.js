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
    console.log(checkRegistered)

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

export { loginUser, registerUser };

