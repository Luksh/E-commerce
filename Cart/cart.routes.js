import express from "express";
import mongoose from "mongoose";
import { isBuyer } from "../Middleware/authentication.middleware.js";
import validateReqBody from "../Middleware/validation.middleware.js";
import Product from "../Product/product.model.js";
import Cart from "./cart.model.js";
import { addItemToCartValidation } from "./cart.validation.js";

const router = express.Router();

router.post("/cart/item/add", isBuyer, validateReqBody(addItemToCartValidation), async (req, res) => {
  const cartData = req.body;

  const isValidMongoId = mongoose.isValidObjectId(cartData.productId);

  if (!isValidMongoId) {
    return res.status(400).send({ message: "Invalid product ID." });
  }

  const product = await Product.findOne({ _id: cartData.productId });

  if (!product) {
    return res.status(404).send({ message: "Product does not exist." });
  }

  if (cartData.orderedQuantity > product.availableQuantity) {
    return res.status(400).send({ message: "Ordered quantity is more than available quantity." });
  }

  const cartItem = await Cart.findOne({ buyerId: req.loggedInUserId, productId: cartData.productId });

  if (cartItem) {
    return res.status(409).send({ message: "Product already exists in cart." });
  }

  await Cart.create({ ...cartData, buyerId: req.loggedInUserId });

  return res.status(200).send({ message: "Product added to cart successfully." });
});

router.delete("/cart/remove", isBuyer, async (req, res) => {
  const loggedInUserId = req.loggedInUserId;

  await Cart.deleteMany({ buyerId: loggedInUserId });

  return res.status(200).send({ message: "Cart emptied successfully." });
});

export default router;
