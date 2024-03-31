import express from "express";
import connectDB from "./db.connect.js";
import userRoutes from "./src/user/user.routes.js";
import productRoutes from "./Product/product.routes.js";
import cartRoutes from "./Cart/cart.routes.js";

const app = express();

app.use(express.json());

connectDB();

app.use(userRoutes);
app.use(productRoutes);
app.use(cartRoutes);

const PORT = process.env.API_PORT;

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
