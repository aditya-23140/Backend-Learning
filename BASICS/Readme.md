
# Backend Learning Guide [BASICS]

## Steps

### 1. Initializing Project

Creates a package.json which other developers can use.

```bash
npm init -y
```

---

### 2. Adding a Package: `cat-me`

```bash
npm i cat-me
```

Usage:

```js
const catMe = require("cat-me");
var cat = catMe();
console.log(cat); // outputs random ASCII cat images.
```

---

### 3. Creating a Server

No need to install `http` package as it is pre-installed in Node.js.

```js
const http = require('http');

const server = http.createServer((req, res) => {
  res.end("Hello, world!"); 
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listening at: http://localhost:${PORT}/`);
});
```

---

### 4. Routing

`req.url` gives the route being accessed, e.g., `/about` for `localhost:3000/about`.

```js
const server = http.createServer((req, res) => {
  console.log(req.url);
  if (req.url === "/about") {
    res.end("About Page");
  } else if (req.url === "/profile") {
    res.end("Profile Page");
  }
});
```

---

### 5. Setting up Express

Express is a toolbox for creating servers.

Install:

```bash
npm i express
```

Basic setup:

```js
const express = require("express");
const app = express();
```

---

### 6. Routing in Express

`.get` for GET requests and `.post` for POST requests.

```js
app.get("/", (req, res) => {
  res.send("Hello, world");
});
```

---

### 7. Rendering HTML with Express (EJS)

Install EJS:

```bash
npm i ejs
```

Setup view engine:

```js
app.set("view engine", "ejs");
```

Create a `views` directory with `index.ejs` inside it. Render it using:

```js
app.get("/", (req, res) => {
  res.render("index");
});
```

---

### 8. Middleware

Middleware runs on every request and can modify behavior or redirect.

Example of middleware on all routes:

```js
app.use((req, res, next) => {
  console.log("Middleware");
  next(); // continue to next middleware or route handler
});
```

Middleware for a single route:

```js
app.get(
  "/",
  (req, res, next) => {
    console.log(5);
    next();
  },
  (req, res) => {
    res.render("index");
  }
);
```

---

### 9. Adding Morgan Logger

Morgan logs details about every request.

Install:

```bash
npm i morgan
```

Use:

```js
const morgan = require("morgan");
app.use(morgan("dev")); // e.g., GET / 304 17.858 ms - -
```

---

### 10. Form Control

To get data from a form: create a route and use the form's `action` attribute with method `POST`.

* `POST`: data sent from frontend to backend
* `GET`: data fetched from backend to frontend

Express cannot read POST data by default, so use these middlewares:

```js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

Example routes:

```js
app.get("/get-form-data", (req, res) => {
  console.log(req.query); // query params from URL
  res.send("Data Received");
});

app.post("/get-form-data", (req, res) => {
  console.log(req.body); // POST data
  res.send("Data Received");
});
```

---

### 11. Handling CSS and Static Files

Place CSS files in a `public` directory and serve with:

```js
app.use(express.static("public"));
```

Link CSS in EJS like normal HTML.

---

## Database (MongoDB)

### 1. Setup Mongoose

Install:

```bash
npm i mongoose
```

Create a config file to connect:

```js
// config/db.js
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/backend-tutorial")
  .then(() => console.log("Connected to database"))
  .catch(err => console.error(err));

module.exports = mongoose;
```

---

### 2. Create Models (Schemas)

Example user schema:

```js
// models/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  /* Optional fields
  age: Number,
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  */
  email: String,
  password: String,
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
```

Use in `app.js`:

```js
const connection = require("./config/db");
const userModel = require("./models/user");
```

---

### 3. Creating a User

Create `register.ejs` form in `views` with `action="/register"` and `method="post"`.

Example routes:

```js
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const newUser = await userModel.create({ username, email, password });
  res.send(newUser); // Send created user as response
});
```

---

### 4. CRUD Operations

```js
// Read
app.get("/get-data", (req, res) => {
  userModel.find({ username: "Gilgamesh" }).then(users => {
    res.send(users); // returns empty array if none found
  });
});

// Update
app.get("/update-user", async (req, res) => {
  await userModel.findOneAndUpdate(
    { username: "a" },
    { email: "c@gmail.com" }
  );
  res.send("User Updated");
});

// Delete
app.get("/delete-user", async (req, res) => {
  await userModel.findOneAndDelete({ username: "a" });
  res.send("User Deleted");
});
```

---

## Other Notes

* `package.json` holds all package info and project metadata.
* To regenerate `node_modules` and `package-lock.json` after cloning:

  ```bash
  npm install
  ```
* Use `nodemon` for auto-restarting server on code changes:

  ```bash
  npx nodemon [filename]
  ```

---

**Happy Learning!** 🚀

---
