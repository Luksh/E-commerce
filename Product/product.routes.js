import express from "express";
import { isSeller } from "../Middleware/authentication.middleware.js";
import validateReqBody from "../Middleware/validation.middleware.js";
import { addProductValidation } from "./product.validation.js";
import Product from "./product.model.js";

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

export default router;
