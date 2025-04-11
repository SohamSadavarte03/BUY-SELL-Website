import express from "express";
import Order from "../models/order.model.js";
import mongoose from "mongoose";
import bycrypt from "bcryptjs";
import auth from "../middle/auth.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const { transaction_id, buyer_id, seller_id, amount, status, product_id } = req.body;
    console.log(transaction_id, buyer_id, seller_id, amount, status, product_id);
    if (!transaction_id || !buyer_id || !seller_id || !amount) {
        return res.status(400).json({ success: false, message: "Please provide all the required fields" });
    }
    const hashed_otp = "1";
    try {
        const newOrder = new Order({
            transaction_id,
            buyer_id,
            seller_id,
            amount,
            hashed_otp,
            status,
            product_id
        });

        await newOrder.save();
        res.status(201).json({ success: true, data: newOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    try {
        const updatedOrder = await Order.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({ success: true, data: updatedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    try {
        const deletedOrder = await Order.findByIdAndDelete(id);
        if (!deletedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/pending/:id', async (req, res) => {
    try {
        const  userId  = req.params.id;
        // console.log('userId:', req.params.id);
        console.log(userId);
        const pendingOrders = await Order.find({
            buyer_id: userId,
            status: 'Pending'
        })
        .populate('seller_id', 'first_name last_name')
        .populate('product_id');
        
        res.status(200).json({
            success: true,
            orders: pendingOrders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching pending orders',
            error: error.message
        });
    }
});

router.post('/otp/:id', async (req, res) => {
    try {
        const  orderId  = req.params.id;
        console.log('orderId:', orderId);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const salt = await bycrypt.genSalt(10);
        const hashedOTP = await bycrypt.hash(otp, salt);


        await Order.findByIdAndUpdate(orderId, {
            hashed_otp: hashedOTP
        });

        res.status(200).json({
            success: true,
            otp: otp 
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating OTP',
            error: error.message
        });
    }
});


router.post('/otpcheck', async (req, res) => {
    const { orderId, otp } = req.body;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        const isMatch = await bycrypt.compare(otp, order.hashed_otp);
        if (isMatch) {
            await Order.findByIdAndUpdate(orderId, {status: 'Successful'});
            res.status(200).json({
                success: true,
                message: 'OTP verified'
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: 'Incorrect OTP'
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verifying OTP',
            error: error.message
        });
    }
}
);

router.get('/seller/pending/:id', async (req, res) => { 
    // console.log('sellerId:', req.params.id);
    try {
        const sellerId = req.params.id;
        // console.log('sellerId:', sellerId);
        

        const pendingOrders = await Order.find({
            seller_id: sellerId,
            status: 'Pending'
        })
        .populate('buyer_id', 'first_name last_name')
        .populate('product_id');
        if(!pendingOrders) {
            return res.status(404).json({
                success: false,
                message: 'No pending orders found'
            });
        }

        res.status(200).json({
            success: true,
            orders: pendingOrders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching pending orders',
            error: error.message
        });
    }
});

router.get('/buyer/:id', async (req, res) => { 
    try {
        const buyerId = req.params.id;
        const buyerOrders = await Order.find({
            buyer_id: buyerId
        })
        .populate('seller_id', 'first_name last_name')
        .populate('product_id');
        // console.log('buyerId:', buyerOrders);
        if(!buyerOrders) {
            return res.status(404).json({
                success: false,
                message: 'No orders found'
            });
        }
        res.status(200).json({
            success: true,
            orders: buyerOrders
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
}
);

router.get('/seller/:id', async (req, res) => { 
    try {
        const sellerId = req.params.id;
        const sellerOrders = await Order.find({
            seller_id: sellerId
        })
        .populate('buyer_id', 'first_name last_name')
        .populate('product_id');
        if(!sellerOrders) {
            return res.status(404).json({
                success: false,
                message: 'No orders found'
            });
        }
        res.status(200).json({
            success: true,
            orders: sellerOrders
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
}
);

export default router;


