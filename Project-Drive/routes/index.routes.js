const express = require("express");
const upload = require("../config/multer.config");
const supabase = require("../config/supabase.config");
const fileModel = require("../models/files.model");
const authMiddleware = require("../middlewares/auth");
const { default: mongoose } = require("mongoose");

const router = express.Router();

router.get("/home", authMiddleware, (req, res) => {
  res.render("home");
});

//.single('name of input field')
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
        uploadedBy: req.user.userId,
      });

      res.json(newFile);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
