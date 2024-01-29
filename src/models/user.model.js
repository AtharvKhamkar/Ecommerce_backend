import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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
    },
    role: {
        type: String,
        default:"user"
    },
    refreshToken: {
        type:String
    }
}, {
    timestamps:true
}
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            email:this.email

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this.id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)