import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
const app = express();

app.use(morgan('dev'))
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({
    limit:"16kb"
}))

app.use(express.urlencoded({
    extended:true,limit:"16kb"
}))

app.use(express.static("public"))

app.use(cookieParser())

import blogRouter from "./routes/blog.routes.js";
import productRouter from "./routes/product.routes.js";
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/users",userRouter)
app.use("/api/v1/products", productRouter)
app.use("/api/v1/blog",blogRouter)


export { app };
