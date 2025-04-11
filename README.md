# IIIT Buy-Sell Platform

## Overview
This is a dedicated Buy-Sell web application designed exclusively for the IIIT community. It provides a seamless marketplace for students and faculty, allowing them to trade goods efficiently while avoiding the constraints of the new Whatscap taxation policy on community buy-sell groups.

## Tech Stack
- **Frontend**: React.js
- **Backend**: Express.js (Node.js)
- **Database**: MongoDB

## Features

### Authentication
- Secure user registration with IIIT email verification
- Password protection using hashing (bcrypt)
- JWT-based authentication system
- Persistent login sessions
- Optional Google Recaptcha for enhanced security
- Support for CAS Login integration

### User Capabilities
- Manage and edit personal profile
- Search and filter listed products
- Add products to the cart and proceed to checkout
- Track placed orders and purchase history
- Leave seller reviews

## Core Pages & Functionality

### 1. Dashboard
   - Central hub for user account and navigation

### 2. Product Search & Filtering
   - Case-insensitive search functionality
   - Category-based filtering
   - Quick product preview

### 3. Product Details Page
   - Comprehensive item descriptions
   - Direct cart addition

### 4. Order Management
   - Track pending and completed orders
   - View past purchases
   - Monitor sales as a seller

### 5. Delivery & Fulfillment
   - Track seller order status
   - OTP verification for secure transactions

### 6. Shopping Cart
   - Manage selected items before purchase
   - Automatic total cost calculation

### 7. Customer Support (Bonus Feature)
   - AI-powered chatbot

## Setup Requirements
- **Node.js** installed
- **MongoDB** database instance
- **npm** for package management



## Security Measures
- Password hashing via bcrypt
- JWT token-based authentication
- IIIT email validation for user accounts
- OTP-based verification for transactions

## Additional Features
- Google Recaptcha integration for enhanced security
- CAS Login support for IIIT users
- AI-powered chatbot 

## Important Assumptions
- Users can submit unlimited reviews for a seller.
- The `package-lock.json`, `package.json`, and `node_modules` were originally placed outside the backend folder for optimal project structure. However, due to submission requirements, they are now inside the backend directory. **For testing, move these files outside the backend folder for proper functionality.**
