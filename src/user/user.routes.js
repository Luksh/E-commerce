import { Router } from "express";
import { loginUserValidation, registerUserValidation } from "./user.validation.js";
import User from "./user.model.js";
import bcrypt from "bcrypt";
import validateReqBody from "../../Middleware/validation.middleware.js";
import jwt from "jsonwebtoken";

const router = Router();

// register user
// its just creating a new user
// forget not: to hash password before saving user into db
router.post("/user/register", validateReqBody(registerUserValidation), async (req, res) => {
  // extract new user from req.body
  const newUser = req.body;

  //? check if user with provided email already exists in our system
  //  find user by email
  const user = await User.findOne({ email: newUser.email });

  // if user, throw error
  if (user) {
    return res.status(409).send({ message: "Email already exists." });
  }

  // just before saving user, we need to create hash password
  const plainPassword = newUser.password;
  const saltRounds = 10; // to add randomness
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

  // update new user password with hashedPassword
  newUser.password = hashedPassword;

  // save user
  await User.create(newUser);

  // send res
  return res.status(201).send({ message: "User registered successfully." });
});

router.post("/user/login", validateReqBody(loginUserValidation), async (req, res, next) => {
  const loginCredentials = req.body;
  const user = await User.findOne({ email: loginCredentials.email });

  if (!user) {
    return res.status(404).send({ message: "Invalid Credentials." });
  }

  const plainPassword = loginCredentials.password;
  const hashedPassword = user.password;
  const isPasswordValid = await bcrypt.compare(plainPassword, hashedPassword);

  if (!isPasswordValid) {
    return res.status(404).send({ message: "Invalid Credentials." });
  }

  const payLoad = { email: user.email };
  const token = jwt.sign(payLoad, "096afdd0bdeb5f42b11551f6ebd46f30347fc1fa", { expiresIn: "1h" });

  user.password = undefined;

  return res.status(200).send({ message: "User logged in successfully.", userDetails: user, token });
});

export default router;
