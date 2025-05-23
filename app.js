const express = require("express");
const morgan = require("morgan");
const app = express();
const connection = require("./config/db");
const userModel = require("./models/user");

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

app.get(
  "/",
  (req, res, next) => {
    const a = 5;
    console.log(a);
    next();
  },
  (req, res) => {
    res.render("index");
  }
);

app.get("/about", (req, res) => {
  res.send("About Page");
});

app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const newUser = await userModel.create({
    username: username,
    email: email,
    password: password,
  });

  //will not be sent till user is created
  res.send(newUser);
});

app.post("/get-form-data", (req, res) => {
  console.log(req.body);
  res.send("Data Recieved");
});

app.listen(3000, () => {
  console.log("Port listening at 3000");
  console.log("visit http://localhost:3000/");
});
