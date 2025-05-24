const PORT = 3000;
const express = require("express");
const userRouter = require("./routes/user.routes");
const app = express();

app.set("view engine", "ejs");

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
