import express from "express";
import { isSeller, isUser } from "../Middleware/authentication.middleware.js";
import validateReqBody from "../Middleware/validation.middleware.js";
import { addProductValidation } from "./product.validation.js";
import Product from "./product.model.js";
import validateIdFromReqParams from "../Middleware/valid.params.middleware.js";

const router = express.Router();

router.post("/product/create", isSeller, validateReqBody(addProductValidation), async (req, res) => {
  // extract new product from req.body
  const newProduct = req.body;

  // extract loggedInUserId
  const loggedInUserId = req.loggedInUserId;

  newProduct.sellerId = loggedInUserId;

  // create product
  await Product.create(newProduct);

  return res.status(200).send({ message: "Product is added successfully." });
});

router.get("/product/details/:id", isUser, validateIdFromReqParams, async (req, res) => {
  const productId = req.params.id;

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    return res.status(404).send({ message: "Product does not exist." });
  }

  return res.status(200).send({ message: "Success", productDetails: product });
});

router.delete("/product/delete/:id", isSeller, validateIdFromReqParams, async (req, res) => {
  const productId = req.params.id;

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    return res.status(404).send({ message: "Product does not exist." });
  }

  const sellerId = product.sellerId;
  const loggedInUserId = req.loggedInUserId;

  const isProductOwner = sellerId.equals(loggedInUserId);

  if (!isProductOwner) {
    return res.status(403).send({ message: "You are not authorized to delete this product." });
  }

  await Product.deleteOne({ _id: productId });

  return res.status(200).send({ message: "Product deleted successfully." });
});

export default router;
