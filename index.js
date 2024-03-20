import express from "express";
import connectDB from "./db.connect.js";
import userRoutes from "./src/user/user.routes.js";

const app = express();

app.use(express.json());

connectDB();

app.use(userRoutes);

const PORT = 8001;

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
