const express = require("express");
const app = express();

app.set("view engine", "ejs");

//Middleware, it is run at every route
app.use((res, req, next)=>{
  console.log("Middleware");
  return next() //allows for normal flow.
})

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/about", (req, res) => {
  res.send("About Page");
});

app.listen(3000, () => {
  console.log("Port listening at 3000");
  console.log("visit http://localhost:3000/");
});
