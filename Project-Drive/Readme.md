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

6. <u>JsonWebToken for verification</u>: The token should be saved in cookies

```
npm i jsonwebtoken
npm i cookie-parser
```

```js
//app.js
const cookieParser = require("cookie-parser");

app.use(cookieParser());
```

```js
//user.routes.js

const jwt = require("jsonwebtoken");

const token = jwt.sign(
  {
    userId: user._id,
    email: user.email,
    username: user.username,
  },
  process.env.JWT_SECRET
); //.sign({object: data}, secret key)

res.cookie("token", token); //.cookie(name, value)

res.send("Logged In");
```

7. <u>Creating home page</u>:

```js
//index.routes.js
const express = require("express");
const router = express.Router();

router.get("/home", (req, res) => {
  res.render("home");
});

module.exports = router;
```

```js
//app.js
const indexRouter = require("./routes/index.routes");

app.use("/", indexRouter); //home will be rendered at just /home route.
```

```js
//home.ejs
//When creating form for files need to add enctype
<form action="/upload" method="post" enctype="multipart/form-data"></form>
```

8. <u>Creating a project at supabase</u>: https://supabase.com/
   > Create a project <br>
   > Build > storage > Create a storage bucket > public bucket <br>
   > MIME type -> application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/jpeg, image/png, video/mp4, audio/mpeg, application/zip, text/plain <br>
   > Settings > Data API > service_role

```
npm install @supabase/supabase-js
npm i multer
```

```js
//supabase.config.js
require("dotenv").config(); //It wasn't called in app.js so this file need to call it seperately
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; //use role_key when bucket is private, use anon/public key when dealing with public bucket

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in .env"
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

module.exports = supabase;
```

```js
// multerConfig.js
const multer = require("multer");
// Memory storage: files are kept in memory as Buffer
const storage = multer.memoryStorage();
// File filter (optional) — restrict to images, pdfs, etc.
const fileFilter = (req, file, cb) => {
  // Accept only certain mime types (example: images and PDFs)
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats - officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "video/mp4",
    "audio/mpeg",
    "application/zip",
    "text/plain",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};
// File size limit (optional) — example: 30MB max
const limits = {
  fileSize: 3 * 1024 * 1024 * 1024, // 30 MB
};
// Export configured multer instance
const upload = multer({
  storage,
  fileFilter,
  limits,
});
module.exports = upload;
```

```js
//index.routes.js
const upload = require("../config/multer.config");
const supabase = require("../config/supabase.config");
//.single('name of input field')
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).send("No file uploaded");
    }

    const supabasePath = `uploads/${Date.now()}_${file.originalname}`;

    const { data, error } = await supabase.storage
      .from("project-drive") //.from("your-project-name")
      .upload(supabasePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const { data: publicUrlData } = supabase.storage
      .from("project-drive") //.from("your-project-name")
      .getPublicUrl(supabasePath);

    res.json({
      path: data.path,
      publicUrl: publicUrlData.publicUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
```
