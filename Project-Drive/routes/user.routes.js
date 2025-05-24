const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();

//All routers now will be used as -> /user/[route name]

router.get("/register", (req, res) => {
  res.render("register");
});

router.post(
  "/register",
  body("email").trim().isEmail().isLength({ min: 13 }),
  body("password").trim().isLength({ min: 5 }),
  body("username").trim().isLength({ min: 3 }), //These are middle ware to check if the data recieved are valid
  (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Invalid Data",
      });
    }
    res.send(errors);
  }
);

module.exports = router;
