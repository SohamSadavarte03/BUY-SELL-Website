import express from "express";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", async (req, res) => {
    try {


        const products = await Product.find();

        const total = await Product.countDocuments();

        res.json({
            success: true,
            data: products,
            total,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, price, description, category, seller_id, sold, photo } = req.body;
    console.log(req.body, id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    if (!name || !price || !description || !category || !seller_id || sold === undefined || !photo) {
        return res.status(400).json({ success: false, message: "Please provide all details" });
    }

    try {
        const sellerExists = await User.findById(seller_id);
        if (!sellerExists) {
            return res.status(404).json({ success: false, message: "Seller not found" });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: { name, price, description, category, seller_id, photo } },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post("/", async (req, res) => {
    const { name, price, description, category, seller_id, sold , photo} = req.body;
    console.log(req.body);
    if (!name || !price || !description || !category || !seller_id || sold === undefined || !photo) {
        return res.status(400).json({ success: false, message: "Please provide all details" });
    }
    try {
        const sellerExists = await User.findById(seller_id);
        if (!sellerExists) {
            return res.status(404).json({ success: false, message: "Seller not found" });
        }

        const newProduct = new Product({ name, price, description, category, seller_id, photo });
        await newProduct.save();

        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    try {
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    try {
        const product = await Product.findById(id).populate("seller_id", "first_name last_name");
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put("/sold/:id", async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, { sold: true }, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


export default router;
