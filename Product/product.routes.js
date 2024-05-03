import express from "express";
import { isBuyer, isSeller, isUser } from "../Middleware/authentication.middleware.js";
import validateIdFromReqParams from "../Middleware/valid.params.middleware.js";
import validateReqBody from "../Middleware/validation.middleware.js";
import Product from "./product.model.js";
import { addProductValidation, paginationValidation } from "./product.validation.js";

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

router.put(
  "/product/update/:id",
  isSeller,
  validateIdFromReqParams,
  validateReqBody(addProductValidation),
  async (req, res) => {
    const productId = req.params.id;

    const product = await Product.findOne({ _id: productId });

    if (!product) {
      return res.status(404).send({ message: "Product does not exist." });
    }

    const sellerId = product.sellerId;
    const loggedInUserId = req.loggedInUserId;

    const isProductOwner = sellerId.equals(loggedInUserId);

    if (!isProductOwner) {
      return res.status(403).send({ message: "You are not authorized to update this product." });
    }

    const updatedProduct = req.body;

    await Product.updateOne({ _id: productId }, updatedProduct);

    return res.status(200).send({ message: "Product updated successfully." });
  }
);

router.post("/product/list/buyer", isBuyer, validateReqBody(paginationValidation), async (req, res) => {
  const { page, limit } = req.body;

  const skip = (page - 1) * limit;

  const products = await Product.aggregate([
    { $match: {} },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        name: 1,
        brand: 1,
        price: 1,
        category: 1,
        freeShipping: 1,
        availableQuantity: 1,
        description: { $substr: ["$description", 0, 100] },
        image: 1,
      },
    },
  ]);

  return res.status(200).send({ message: "Success", productList: products });
});

router.post("/product/list/seller", isSeller, validateReqBody(paginationValidation), async (req, res) => {
  const { page, limit } = req.body;

  const skip = (page - 1) * limit;

  const products = await Product.aggregate([
    { $match: { sellerId: req.loggedInUserId } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        name: 1,
        brand: 1,
        price: 1,
        category: 1,
        freeShipping: 1,
        availableQuantity: 1,
        description: { $substr: ["$description", 0, 100] },
        image: 1,
        // sellerId: 0,
        // createdAt: 0,
        // updatedAt: 0,
        // __v: 0,
      },
    },
  ]);

  return res.status(200).send({ message: "Success", productList: products });
});

export default router;
