import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)?iiit\.ac\.in$/, 
    },
    age: {
      type: Number,
      required: true,
      min: 1,
    },
    contact_number: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/,
    },
    password: {
      type: String,
      required: true,
    },
    cart_items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        // unique:true, 
      },
    ],
    seller_reviews: [
      {
        reviewer_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        review: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
