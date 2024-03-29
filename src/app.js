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
app.use(limiter)

import { limiter } from "./config/ratelimiter.js";
import addressRouter from "./routes/address.routes.js";
import blogRouter from "./routes/blog.routes.js";
import blogCategoryRoutes from "./routes/blogCategory.routes.js";
import brandRouter from "./routes/brand.routes.js";
import categoryRouter from "./routes/category.routes.js";
import couponRouter from "./routes/coupon.routes.js";
import orderRouter from "./routes/order.routes.js";
import productRouter from "./routes/product.routes.js";
import ratingRoutes from "./routes/rating.routes.js";
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/users",userRouter)
app.use("/api/v1/products", productRouter)
app.use("/api/v1/blog", blogRouter)
app.use("/api/v1/category", categoryRouter)
app.use("/api/v1/blogcategory", blogCategoryRoutes)
app.use("/api/v1/brand", brandRouter)
app.use("/api/v1/ratings", ratingRoutes)
app.use("/api/v1/coupons", couponRouter)
app.use("/api/v1/address", addressRouter)
app.use("/api/v1/order",orderRouter)


export { app };
