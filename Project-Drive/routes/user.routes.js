const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");

//All routers now will be used as -> /user/[route name]

router.get("/register", (req, res) => {
  res.render("register");
});

router.post(
  "/register",
  body("email").trim().isEmail().isLength({ min: 13 }),
  body("password").trim().isLength({ min: 5 }),
  body("username").trim().isLength({ min: 3 }), //These are middle ware to check if the data recieved are valid
  async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Invalid Data",
      });
    }
    const { email, username, password } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      email,
      username,
      password: hashPassword,
    });

    res.json(newUser);
  }
);

router.get("/login", (req, res) => {
  res.render("login");
});

router.post(
  "/login",
  body("username").trim().isLength({ min: 3 }),
  body("password").trim().isLength({ min: 5 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array(),
        message: "Invalid Data",
      });
    }

    const { username, password } = req.body;

    const user = await userModel.findOne({ username: username });
    if (!user) {
      return res.status(400).json({
        message: "username or password is incorrect",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password); //.compare([enter password], [password in db])

    if (!isMatch) {
      return res.status(400).json({
        message: "username or password is incorrect",
      });
    }
  }
);

module.exports = router;
