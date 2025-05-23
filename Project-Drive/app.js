const PORT = 3000;
const express = require("express");
const app = express();

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}`);
  console.log(`visit at http://localhost:${PORT}/`);
});
