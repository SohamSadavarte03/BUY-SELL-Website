import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    transaction_id: {
      type: String,
      required: true,
      unique: true, 
    },
    buyer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller_id: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    hashed_otp: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product",
      required: true,
      unique:true,
    }

  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
