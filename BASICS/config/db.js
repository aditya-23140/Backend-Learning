const mongoose = require("mongoose");

//connecting to local database
const connection = mongoose
  .connect("mongodb://localhost:27017/backend-tutorial")
  .then(() => {
    console.log("connected to database");
  });

module.exports = connection;
