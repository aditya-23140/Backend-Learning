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

## Connecting Database

1. <u>Adding env file</u>: For security all database credentials or sensetive information like API keys are written in env file.

```
npm i dotenv
```

```
//env file content
MONGO_URI=mongodb://0.0.0.0/project-drive
```

```js
//app.js
const dotenv = require("dotenv");

dotenv.config(); //Gets access of env in entire project
```

2. <u>Adding db.js connection file</u>: In config directory.

```js
const mongoose = require("mongoose");

function connectToDb() {
  mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Connected to db");
  });
}

module.exports = connectToDb;
```

```js
//app.js
const connectToDb = require("./config/db");
connectToDb();
```

3. <u>Creating user model</u>:

```js
//user.model.js in models directory
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // username: String, correct for basic
  // email: String,
  // password: String,
  //In production
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    minLength: [3, "Username must be at least 3 characters long"], //[length, message]
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    minLength: [13, "Email must be at least 13 characters long"], //[length, message]
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: [5, "Password must be at least 5 characters long"], //[length, message]
  },
});
```

```js
//user.routes.js
const userModel = require("../models/user.model");
router.post(
  "/register",
  body("email").trim().isEmail().isLength({ min: 13 }),
  body("password").trim().isLength({ min: 5 }),
  body("username").trim().isLength({ min: 3 }),
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

    const newUser = await userModel.create({
      email,
      username,
      password,
    });

    res.json(newUser);
  }
);
```

4. <u>Encrypting password:</u>

```
npm i bcrypt
```

```js
//user.routes.js
const bcrypt = require("bcrypt");

const hashPassword = await bcrypt.hash(password, 10); //.hash([value to be hashed],[number of times hashed])

const newUser = await userModel.create({
  email,
  username,
  password: hashPassword,
});
```

5. <u>Login Page</u>: Adding login.ejs

```js
//user.routes.js

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
```

