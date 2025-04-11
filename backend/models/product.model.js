import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    seller_id: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true,
    },
    sold: {
      type: Boolean,
      default: false,
    },
    photo: {
      type: String,
      required: true,}
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
