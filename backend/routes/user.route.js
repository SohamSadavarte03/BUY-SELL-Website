import express from "express";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import axios from "axios";
import auth from "../middle/auth.js";
import jwt from "jsonwebtoken"
import xml2js from "xml2js";
const router = express.Router();

router.post("/register", async (req, res) => {
    console.log(req.body);
    // const { first_name, last_name, email, password, age, contact_number } = req.body;
    const first_name = req.body.firstName;
    const last_name = req.body.lastName;
    const email = req.body.email;
    const age = req.body.age;
    const contact_number = req.body.contactNumber;
    let password = req.body.password;

    console.log(first_name, last_name, email, age, contact_number, password);
    if (!first_name || !last_name || !email || !age || !contact_number || !password) {
        // console.log('Request Body:', req.body);
        return res.status(400).json({ success: false, message: "Please provide all the required fields" });
    }


    const emailRegex = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)?iiit\.ac\.in$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Invalid email. Only IIIT emails are allowed." });
    }
    console.log(first_name, last_name, email, age, contact_number, password);
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        console.log(typeof password, password);
        password = String(password);
        // let hashedPassword = "";
        // let j=31;
        // for (let i = 0; i < password.length; i++) {
        //     hashedPassword += String(password.charCodeAt(i) * j);
        //     j = (j * 31) % 256;
        // }
        // console.log("hashedPassword", hashedPassword, typeof hashedPassword);

        // console.log(hashedPassword, typeof hashedPassword);
        const newUser = new User({
            first_name,
            last_name,
            email,
            age,
            contact_number,
            // password: hashedPassword,
            password: password,
            cart_items: [],
            seller_reviews: [],
        });

        await newUser.save();
        res.status(201).json({ success: true, data: newUser });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post("/login", async (req, res) => {
    let { email, password, captchaToken } = req.body;
    const secretKey = "6Lfc4MMqAAAAAOPBRekt9NjhwlbBlnzYin8npXYf";
    console.log(email, password);

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    try {

        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            null,
            {
                params: {
                    secret: secretKey,
                    response: captchaToken,
                },
            }
        );

        if (!response.data.success) {
            return res.status(400).json({ error: 'reCAPTCHA verification failed' });
        }
        console.log("reCAPTCHA verification successful");

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }


        password = String(password);

        const isMatch = await bcrypt.compare(String(password), user.password);
        // let hashedPassword = "";
        // let j=31;
        // for (let i = 0; i < password.length; i++) {
        //     hashedPassword += String(password.charCodeAt(i) * j);
        //     j = (j * 31) % 256;
        // }
        // console.log("hashedPassword userpass", hashedPassword, user.password, typeof hashedPassword== typeof user.password);
        // const isMatch = hashedPassword === user.password;
        console.log(isMatch);
        console.log(user.password);


        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        const userObject = user.toObject();
        delete userObject.password;

        res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            user: userObject
        });

        // res.status(200).json({ success: true, message: "Login successful", data: user });
    } catch (error) {
        // console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/verify', auth, async (req, res) => {
    try {
        const userObject = req.user.toObject();
        delete userObject.password;
        res.json({ user: userObject });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    try {
        const user = await User.findById(id).populate('cart_items').populate('seller_reviews.reviewer_id');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/me', async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('cart_items').populate('seller_reviews.reviewer_id');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user data." });
    }
});

router.post('/cart', async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        const product = req.body.productId;
        if (user.cart_items.includes(product)) {
            return res.status(200).json({ message: "Product already in cart." });
        }
        user.cart_items.push(product);
        await user.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error adding product to cart." });
    }
}
);

router.get('/cart/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('cart_items');
        res.status(200).json({ success: true, cartItems: user.cart_items });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching cart items." });
    }
}
);

router.delete('/cart/remove', async (req, res) => {
    try {
        console.log(req.body);
        const user = await User.findById(req.body.userId);
        const productId = req.body.productId;
        user.cart_items = user.cart_items.filter(
            item => item.toString() !== productId
        );
        await user.save();
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error removing product from cart." });
    }
}
);

router.delete('/cart/clear/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        // console.log(req.params);
        console.log(userId);
        await User.findByIdAndUpdate(userId, {
            $set: { cart_items: [] }
        });

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error clearing cart',
            error: error.message
        });
    }
});

router.post('/:sellerId/review', async (req, res) => {
    try {
        const { review, rating, reviewer_id } = req.body;
        const sellerId = req.params.sellerId;

        if (!review || !rating || !reviewer_id) {
            return res.status(400).json({
                success: false,
                message: 'Review, rating, and reviewer ID are required'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        if (reviewer_id === sellerId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot review yourself'
            });
        }

        const seller = await User.findById(sellerId);
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }


        seller.seller_reviews.push({
            reviewer_id,
            review,
            rating
        });

        await seller.save();

        res.status(200).json({
            success: true,
            message: 'Review added successfully'
        });

    } catch (error) {
        console.error('Error in adding review:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

router.post('/cas-verify', async (req, res) => {
    try {
        const { ticket, service, renew } = req.body;

    const validateUrl = `https://login.iiit.ac.in/cas/serviceValidate?ticket=${ticket}&service=${service}&renew=${renew ? 'true' : 'false'}`;
    const response = await axios.get(validateUrl);

    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(response.data);

    if (result['cas:serviceResponse']['cas:authenticationSuccess']) {
      const casUser = result['cas:serviceResponse']['cas:authenticationSuccess']['cas:user'];
      const email = casUser;

      let user = await User.findOne({ email });
      
      if (!user) {
        user = new User({
          email,
          first_name: 'IIIT User',
          last_name: '',
          contact_number: '',
          age: 0,
          password: Math.random().toString(36).slice(-8)
        });
        await user.save();
      }

            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({ token, user });
        } else {
            res.status(401).json({ message: 'CAS authentication failed' });
        }
    } catch (error) {
        console.error('CAS verification error:', error);
        res.status(500).json({ message: 'Server error during CAS verification' });
    }
});





export default router;
