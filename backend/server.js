import express from "express";
import dotenv from "dotenv";
import path from "path";
import { connect } from "http2";
import { connectDB } from "./config/db.js";
import Product from "./models/product.model.js";
import mongoose from "mongoose";
import productRoutes from "./routes/product.route.js";
import userRoutes from "./routes/user.route.js";    
import orderRoutes from "./routes/order.route.js";
import cors from "cors";
import auth from "./middle/auth.js";
import chatBot from "./routes/chat.route.js";

dotenv.config();
const app = express();
app.use(express.json());
// const cors = require('cors');
app.use(cors({
    origin: ['http://localhost:5173','http://127.0.0.1:5173'],
    credentials: true
  }));
app.options('*', cors()); 



app.use("/api/products",productRoutes);
app.use("/api/users",userRoutes);
app.use("/api/orders",orderRoutes);
app.use("/api/chat",chatBot);
console.log(process.env.JWT_SECRET);


app.listen(5000, () => {
    connectDB();
    console.log("Server started on http://localhost:5000");
});

// 