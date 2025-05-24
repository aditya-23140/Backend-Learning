const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, "Path is required"],
  },
  supabasePath: {
    type: String,
    required: true,
    unique: true,
  },
  publicUrl: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId, // optional, if you have users collection
    ref: "users",
    required: [true, "User is required"],
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const file = mongoose.model("file", fileSchema);

module.exports = file;
