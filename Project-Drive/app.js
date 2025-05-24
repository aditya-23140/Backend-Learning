const PORT = 3000;
const express = require("express");
const userRouter = require("./routes/user.routes");
const dotenv = require("dotenv");
dotenv.config(); //Gets access of env in entire project
const connectToDb = require("./config/db");
connectToDb();
const cookieParser = require("cookie-parser");

const app = express();

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRouter); //keep it below body parser!!!!

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}`);
  console.log(`visit at http://localhost:${PORT}/`);
});
