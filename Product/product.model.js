import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    brand: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      enum: [
        "Electronics",
        "Clothing",
        "Shoes",
        "Books",
        "Home",
        "Beauty",
        "Toys",
        "Sports",
        "Outdoors",
        "Tools",
        "Grocery",
        "Health",
        "Automotive",
        "Industrial",
        "Handmade",
        "Jewelry",
        "Music",
        "Furniture",
        "Kids",
        "Other",
      ],
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    sellerId: {
      type: mongoose.ObjectId,
      required: true,
      ref: "users",
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    description: {
      type: String,
      trim: true,
      required: true,
      maxlength: 1000,
      minlength: 100,
    },
    images: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);

export default Product;
