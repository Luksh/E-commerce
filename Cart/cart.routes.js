import express from "express";
import mongoose from "mongoose";
import { isBuyer } from "../Middleware/authentication.middleware.js";
import validateIdFromReqParams from "../Middleware/valid.params.middleware.js";
import validateReqBody from "../Middleware/validation.middleware.js";
import Product from "../Product/product.model.js";
import Cart from "./cart.model.js";
import { addItemToCartValidation, updateCartItemValidation } from "./cart.validation.js";

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

router.delete("/cart/item/remove/:id", isBuyer, validateIdFromReqParams, async (req, res) => {
  const productId = req.params.id;

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    return res.status(404).send({ message: "Product does not exist." });
  }

  await Cart.deleteOne({ buyerId: req.loggedInUserId, productId: productId });

  return res.status(200).send({ message: "Product removed from the cart successfully." });
});

router.put(
  "/cart/item/update/:id",
  isBuyer,
  validateIdFromReqParams,
  validateReqBody(updateCartItemValidation),
  async (req, res) => {
    const productId = req.params.id;
    const buyerId = req.loggedInUserId;
    const actionData = req.body;

    const product = await Product.findOne({ _id: productId });

    if (!product) {
      return res.status(404).send({ message: "Product does not exist." });
    }

    const productAvailableQuantity = product?.availableQuantity;

    const cartItem = await Cart.findOne({ buyerId, productId });

    if (!cartItem) {
      return res.status(404).send({ message: "Product does not exist in cart." });
    }

    let previousOrderedQuantity = cartItem.orderedQuantity;
    let newOrderedQuantity;

    if (actionData.action === "inc") {
      newOrderedQuantity = previousOrderedQuantity + 1;
    } else {
      newOrderedQuantity = previousOrderedQuantity - 1;
    }

    if (newOrderedQuantity > productAvailableQuantity) {
      return res.status(400).send({ message: "Ordered quantity is more than available quantity." });
    }

    if (newOrderedQuantity < 1) {
      return res.status(400).send({ message: "Ordered quantity must be at least 1." });
    }

    await Cart.updateOne(
      { buyerId: buyerId, productId: productId },
      {
        $set: {
          orderedQuantity: newOrderedQuantity,
        },
      }
    );

    // Aternative
    // await Cart.updateOne({ buyerId, productId }, { orderedQuantity: newOrderedQuantity });

    return res.status(200).send({ message: "Cart item updated successfully." });
  }
);

router.get("/cart/item/list", isBuyer, async (req, res) => {
  // extract buyerId from req.loggedInUserId
  const buyerId = req.loggedInUserId;

  const cartData = await Cart.aggregate([
    {
      $match: {
        buyerId: buyerId,
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $project: {
        name: { $first: "$productDetails.name" },
        brand: { $first: "$productDetails.brand" },
        unitPrice: { $first: "$productDetails.price" },
        image: { $first: "$productDetails.image" },
        orderedQuantity: 1,
        productId: 1,
      },
    },
  ]);

  return res.status(200).send({ message: "success", cartData: cartData });
});

router.get("/cart/item/count", isBuyer, async (req, res) => {
  const buyerId = req.loggedInUserId;

  const cartItemCount = await Cart.find({ buyerId }).countDocuments();

  return res.status(200).send({ message: "success", cartItemCount });
});

export default router;
