import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import { ApiError } from './ApiError.js';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) throw new ApiError(400,"localFilepath is required")
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type:"auto"
        })
        
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        throw new ApiError(400, `${error} while uploading file on cloudinary`)
    }
}

export { uploadOnCloudinary };
