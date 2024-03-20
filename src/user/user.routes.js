import { Router } from "express";

import { registerUserValidation } from "./user.validation.js";
import User from "./user.model.js";
import bcrypt from "bcrypt";

const router = Router();

// register user
// its just creating a new user
// forget not: to hash password before saving user into db
router.post(
  "/user/register",
  async (req, res, next) => {
    //   extract date from req.body
    const data = req.body;

    try {
      // validate data using schema
      const validatedData = await registerUserValidation.validate(data);

      req.body = validatedData;
    } catch (error) {
      // if validation fails, throw error
      return res.status(400).send({ message: error.message });
    }

    // call next function

    next();
  },
  async (req, res) => {
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
  }
);

export default router;
