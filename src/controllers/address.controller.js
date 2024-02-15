import mongoose, { isValidObjectId } from "mongoose";
import { Address } from "../models/address.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addAddress = asyncHandler(async (req, res) => {
    //get userId from verifyJWT from req.user
    //create object of address
    //add created object into array of address in user
    const user = req.user

    const {fullName,phoneNumber,pinCode,houseNo,addressType} = req.body

    const createdAddress = await Address.create({
        fullName: fullName,
        phoneNumber: phoneNumber,
        pinCode: pinCode,
        state: req.body?.state,
        city: req.body?.city,
        houseNo: houseNo,
        area: req.body?.area,
        landMark: req.body?.landMark,
        addressType:addressType
    })

    const address = await Address.findById(createdAddress._id)
    user.address.push(address._id);
    await user.save();

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                createdAddress,
                "Address saved successfully"
        )
    )
    
})

const getAddress = asyncHandler(async (req, res) => {
    const { Id } = req.params
    if (!isValidObjectId(Id)) {
        throw new ApiError(400,"Invalid address Id")
    }

    const address = await Address.findById(Id)

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                address,
                "Successfully fetched address"
        )
    )
})

const updateAddress = asyncHandler(async (req, res) => {
    const { Id } = req.params
    
    const address = await Address.findByIdAndUpdate(
        new mongoose.Types.ObjectId(Id),
        req.body,
        {
            new:true
        }
    )

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                address,
                "Address updated successfully"
        )
    )
})

const deleteAddress = asyncHandler(async (req, res) => {
    const { Id } = req.params
    const user = req.user
    if (!isValidObjectId(Id)) {
        throw new ApiError(400,"Invalid Id")
    }

    const address = await Address.findByIdAndDelete(Id)
    const findIndex = user.address.findIndex(a => a._id === Id)
    user.address.splice(findIndex, 1)
    user.save()



    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {
                    "deleted_address":address._id
                },
                "Address deleted successfully"
        )
    )
})

export { addAddress, deleteAddress, getAddress, updateAddress };

