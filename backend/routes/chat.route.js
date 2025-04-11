import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
const router = express.Router();
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

router.post('/', async (req, res) => {
    try {
        const {userMessage, conversationHistory} = req.body;
        
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: userMessage || "Hello"
                    }]
                }]
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        const responseText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 
                           response.data.candidates?.[0]?.content || 
                           'No response generated';

        res.json({ botReply: responseText });
    } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Chatbot error', 
            details: error.response?.data || error.message 
        });
    }
});

export default router;