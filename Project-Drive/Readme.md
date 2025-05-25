- - -

## Advanced Concepts in a Node.js Application

Here's a breakdown of advanced concepts for building a robust Node.js application, including route management, data validation, database integration, authentication, and file storage with Supabase.

### 1\. Adding Scripts in `package.json`

You can define custom scripts in your `package.json` file for easier execution of commands.

JSON

```json
"scripts": {
  "start": "npx nodemon app.js"
}
```

Now, you can run your application using:

Bash

```bash
npm start
```

### 2\. Organizing Routes

To prevent clutter in your main application file, it's best practice to separate routes into different files based on their functionality.

**`routes/user.routes.js`**

JavaScript

```js
const express = require("express");
const router = express.Router();

// All routes here will be prefixed with /user/
router.get("/test", (req, res) => {
  res.send("user test route");
});

module.exports = router;
```

**`app.js`**

JavaScript

```js
const userRouter = require("./routes/user.routes");
// ... other middleware, e.g., body parser
app.use("/user", userRouter); // Add all routes after body parser middleware
```

### 3\. Adding a Registration Page with Validation

For robust data handling, use the `express-validator` package to validate incoming user data.

First, install the package:

Bash

```bash
npm i express-validator
```

Then, implement the validation in your route:

JavaScript

```js
const { body, validationResult } = require("express-validator");

router.post(
  "/register",
  body("email").trim().isEmail().isLength({ min: 13 }),
  body("password").trim().isLength({ min: 5 }),
  body("username").trim().isLength({ min: 3 }), // These are middleware to check if the data received are valid
  (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    // Sending error message
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

- - -

## Connecting to the Database

### 1\. Adding Environment Variables

For security, sensitive information like database credentials and API keys should be stored in an `.env` file and accessed through environment variables.

Install `dotenv`:

Bash

```bash
npm i dotenv
```

**`.env` file content**

```
MONGO_URI=mongodb://0.0.0.0/project-drive
JWT_SECRET=your_secret_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**`app.js`**

JavaScript

```js
const dotenv = require("dotenv");
dotenv.config(); // Gives access to .env variables throughout the project
```

### 2\. Creating a Database Connection File

Create a dedicated file for your database connection in a `config` directory.

**`config/db.js`**

JavaScript

```js
const mongoose = require("mongoose");

function connectToDb() {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to db");
    })
    .catch((err) => {
      console.error("Database connection error:", err);
    });
}

module.exports = connectToDb;
```

**`app.js`**

JavaScript

```js
const connectToDb = require("./config/db");
connectToDb();
```

### 3\. Creating a User Model

Define your user schema using Mongoose.

**`models/user.model.js`**

JavaScript

```js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    minLength: [3, "Username must be at least 3 characters long"],
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    minLength: [13, "Email must be at least 13 characters long"],
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: [5, "Password must be at least 5 characters long"],
  },
});

const User = mongoose.model("User", userSchema); // Capitalize model name

module.exports = User; // Export the model directly
```

**`routes/user.routes.js`**

JavaScript

```js
const userModel = require("../models/user.model"); // Ensure correct path to model
// ... (express-validator imports and other middleware)

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

    // Check if user already exists
    const existingUser = await userModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: "User with this email or username already exists" });
    }

    const newUser = await userModel.create({
      email,
      username,
      password,
    });

    res.status(201).json(newUser); // Use 201 for successful creation
  }
);
```

### 4\. Encrypting Passwords

It's crucial to encrypt user passwords before storing them in the database using `bcrypt`.

Install `bcrypt`:

Bash

```bash
npm i bcrypt
```

**`routes/user.routes.js`**

JavaScript

```js
const bcrypt = require("bcrypt");
// ... (other imports)

router.post(
  "/register",
  // ... (validation middleware)
  async (req, res) => {
    // ... (error handling for validation)
    const { email, username, password } = req.body;

    // ... (check for existing user)

    const hashPassword = await bcrypt.hash(password, 10); // .hash([value to be hashed],[number of times hashed])

    const newUser = await userModel.create({
      email,
      username,
      password: hashPassword,
    });

    res.status(201).json(newUser);
  }
);
```

- - -

## Authentication and Session Management

### 5\. Login Page and Authentication

Implement a login route that verifies user credentials and issues a JSON Web Token (JWT).

Install `jsonwebtoken` and `cookie-parser`:

Bash

```bash
npm i jsonwebtoken cookie-parser
```

**`app.js`**

JavaScript

```js
const cookieParser = require("cookie-parser");
app.use(cookieParser());
```

**`routes/user.routes.js`**

JavaScript

```js
const jwt = require("jsonwebtoken");
// ... (other imports, including bcrypt and userModel)

router.get("/login", (req, res) => {
  res.render("login"); // Assuming you have a login.ejs view
});

router.post(
  "/login",
  body("username").trim().isLength({ min: 3 }),
  body("password").trim().isLength({ min: 5 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Invalid Data",
      });
    }

    const { username, password } = req.body;

    const user = await userModel.findOne({ username: username });
    if (!user) {
      return res.status(400).json({
        message: "Incorrect username or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password); // .compare([entered password], [password in db])

    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect username or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    ); //.sign({object: data}, secret key, [options])

    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' }); //.cookie(name, value, options)

    res.status(200).json({ message: "Logged In successfully", token }); // Send token in JSON for API, or redirect for full web app
  }
);
```

### 6\. Creating a Home Page

Define a route for your application's home page.

**`routes/index.routes.js`**

JavaScript

```js
const express = require("express");
const router = express.Router();

router.get("/home", (req, res) => {
  res.render("home"); // Assuming you have a home.ejs view
});

module.exports = router;
```

**`app.js`**

JavaScript

```js
const indexRouter = require("./routes/index.routes");
app.use("/", indexRouter); // The /home route will now be accessible at /home.
```

**`home.ejs` (for file uploads)**

HTML

```html
<form action="/upload" method="post" enctype="multipart/form-data">
  <input type="file" name="file" />
  <button type="submit">Upload</button>
</form>
```

- - -

## File Storage with Supabase

### 7\. Setting up Supabase

Create a project on Supabase and configure a storage bucket.

1.  Go to [Supabase](https://supabase.com/).
2.  **Create a project.**
3.  Navigate to **Build > Storage > Create a storage bucket**.
4.  Make it a **public bucket** or configure access rules.
5.  Set **MIME types** for allowed files (e.g., `application/pdf`, `image/jpeg`, `image/png`, etc.).
6.  Go to **Settings > Data API** and get your `service_role` key (use `service_role` for private buckets, `anon/public` key for public buckets).

Install Supabase SDK and Multer:

Bash

```bash
npm install @supabase/supabase-js multer
```

**`config/supabase.config.js`**

JavaScript

```js
require("dotenv").config(); // Ensure dotenv is configured here if not in app.js
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in .env"
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

module.exports = supabase;
```

**`config/multer.config.js`**

JavaScript

```js
const multer = require("multer");

// Memory storage: files are kept in memory as Buffer
const storage = multer.memoryStorage();

// File filter (optional) — restrict to specific types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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

// File size limit (optional) — example: 3GB max (note: 30MB in original, adjust as needed)
const limits = {
  fileSize: 3 * 1024 * 1024 * 1024, // 3 GB (adjust to your needs, original was 30MB)
};

// Export configured multer instance
const upload = multer({
  storage,
  fileFilter,
  limits,
});

module.exports = upload;
```

**`routes/index.routes.js`**

JavaScript

```js
const upload = require("../config/multer.config");
const supabase = require("../config/supabase.config");
// ... (other imports)

router.post("/upload", upload.single("file"), async (req, res) => { //.single('name of input field')
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).send("No file uploaded");
    }

    const supabasePath = `uploads/${Date.now()}_${file.originalname}`;

    const { data, error } = await supabase.storage
      .from("project-drive") // .from("your-bucket-name")
      .upload(supabasePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const { data: publicUrlData } = supabase.storage
      .from("project-drive") // .from("your-bucket-name")
      .getPublicUrl(supabasePath);

    res.json({
      filename: file.originalname,
      supabasePath: data.path,
      publicUrl: publicUrlData.publicUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
```

### 8\. File Schema for Database Storage

Define a Mongoose schema to store information about uploaded files.

**`models/file.model.js`**

JavaScript

```js
const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, "Filename is required"],
  },
  supabasePath: {
    type: String,
    required: true,
    unique: true,
  },
  publicUrl: { // This might be a signed URL if bucket is private
    type: String,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: [true, "User is required"],
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const File = mongoose.model("File", fileSchema); // Capitalize model name

module.exports = File;
```

- - -

## Integrating Authentication and File Management

### 9\. Adding Authentication Middleware and Uploading File Details

Create an authentication middleware to protect routes and save file details to MongoDB.

**`middlewares/auth.js`**

JavaScript

```js
const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized: No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // If token is tampered, an error is thrown
    req.user = decoded; // req.user now contains all the data initially set in the token
    return next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized: Invalid token.",
    });
  }
}

module.exports = auth;
```

**`routes/index.routes.js`**

JavaScript

```js
const authMiddleware = require("../middlewares/auth");
const fileModel = require("../models/file.model"); // Ensure correct path to model
// ... (other imports like upload and supabase)

router.get("/home", authMiddleware, async (req, res) => {
  // Fetch user's uploaded files (initial render, before signed URLs)
  try {
    const userFiles = await fileModel.find({ uploadedBy: req.user.userId });
    res.render("home", { files: userFiles }); // Pass files to the EJS template
  } catch (err) {
    console.error("Failed to fetch files for home page:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).send("No file uploaded");
      }

      const supabasePath = `uploads/${Date.now()}_${file.originalname}`;

      const { data, error } = await supabase.storage
        .from("project-drive")
        .upload(supabasePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      const { data: publicUrlData } = supabase.storage
        .from("project-drive")
        .getPublicUrl(supabasePath);

      const newFile = await fileModel.create({
        filename: file.originalname,
        supabasePath: data.path,
        publicUrl: publicUrlData.publicUrl,
        uploadedBy: req.user.userId, // Middleware sets req.user to decoded token values
      });

      res.redirect(`/home`); // Redirect to home page after successful upload
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);
```

### 10\. Fetching User Uploaded Files and Signed URLs

For private Supabase buckets, you need to generate signed URLs to allow temporary access to files.

JavaScript

```js
const DURATION = 24 * 60 * 60; // 24 hours in seconds

router.get("/home", authMiddleware, async (req, res) => {
  try {
    const userFiles = await fileModel.find({ uploadedBy: req.user.userId });

    // Generating signed URLs for each file
    const signedFiles = await Promise.all(
      userFiles.map(async (file) => {
        const { data, error } = await supabase.storage
          .from("project-drive") // Replace with your bucket name
          .createSignedUrl(file.supabasePath, DURATION); // Valid for 24 hours

        if (error) {
          console.error(`Error signing URL for ${file.supabasePath}:`, error);
          // Return file object with null signedUrl if there's an error
          return { ...file.toObject(), signedUrl: null };
        }

        return { ...file.toObject(), signedUrl: data.signedUrl };
      })
    );

    res.render("home", { files: signedFiles });
  } catch (err) {
    console.error("Failed to fetch files:", err);
    res.status(500).json({ error: "Server error" });
  }
});
```

### 11\. Adding a Download Feature

Allow users to download their uploaded files.

**`home.ejs`**

HTML

```html
<div class="files flex flex-col gap-2 mt-8">
  <% files.forEach((file)=> { %>
  <div
    class="p-2 rounded-md bg-gray-300 cursor-pointer mt-2 flex justify-between items-center"
  >
    <h1 class="w-fit"><%= file.filename %></h1>

    <a
      href="/download/<%= encodeURIComponent(file.supabasePath) %>"
      download="<%= file.filename %>"
      target="_blank"
    ><i class="ri-download-line"></i></a>
  </div>
  <%}); %>
</div>
```

**`routes/index.routes.js`**

JavaScript

```js
router.get("/download/:path", authMiddleware, async (req, res) => {
  try {
    const loggedUserId = req.user.userId;
    const path = decodeURIComponent(req.params.path);

    // Verify that the file belongs to the logged-in user
    const file = await fileModel.findOne({
      uploadedBy: loggedUserId,
      supabasePath: path,
    });

    if (!file) {
      return res.status(401).json({
        message: "Unauthorized: File does not belong to this user or not found.",
      });
    }

    const { data, error } = await supabase.storage
      .from("project-drive") // Replace with your bucket name
      .createSignedUrl(path, 60); // Valid for 60 seconds (short duration for direct download)

    if (error || !data) {
      console.error("Error generating signed URL for download:", error);
      return res.status(500).json({ message: "Failed to generate signed URL" });
    }

    const signedUrl = data.signedUrl;

    // Redirect the user to the signed URL to initiate download
    res.redirect(signedUrl);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ message: "Internal server error during download" });
  }
});
```
