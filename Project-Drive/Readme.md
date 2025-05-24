# Advanced Concept

1. <u>Adding Script in package.json</u>:

   ```js
   //in package.json
   "start": "npx nodemon app.js"
   ```

   now we can run the program using:

   > npm start

2. Making all routes in one file increases clutter so make a different route for different operation in a `routes` folder/directory.

```js
//user.routes.js file
const express = require("express");
const router = express.Router();

//All routers now will be used as -> /user/[route name]

router.get("/test", (req, res) => {
  res.send("user test route");
});

module.exports = router;

//app.js
const userRouter = require("./routes/user.routes");
app.use("/user", userRouter); //add all routes after the body parser middleware
```

3. <u>Adding register Page:</u> Using normal way we get data but they are sometimes not valid so use `express validator` package.

```
npm i express-validator
```

```js
const { body, validationResult } = require("express-validator");

router.post(
  "/register",
  body("email").trim().isEmail().isLength({ min: 13 }),
  body("password").trim().isLength({ min: 5 }),
  body("username").trim().isLength({ min: 3 }), //These are middle ware to check if the data recieved are valid
  (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    //Sending error message
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Invalid Data",
      });
    }
    res.send(errors);
  }
);
```

4. <u>Connecting Database</u>:
