import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/dbConnect.js";


const PORT = process.env.PORT || 7500;
const app = express();
dotenv.config({
    path:'./env'
})

connectDB()
.then(() => {
        app.listen(PORT, () => {
        console.group(`Server is running at port: ${PORT}`)
    })
    })
.catch((error) => {
    console.log("MongoDB connection failed!!!",error)
})
