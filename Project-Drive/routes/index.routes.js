const express = require("express");
const upload = require("../config/multer.config");
const supabase = require("../config/supabase.config");
const fileModel = require("../models/files.model");
const authMiddleware = require("../middlewares/auth");
const { sign } = require("jsonwebtoken");

const router = express.Router();

const DURATION = 24 * 60 * 60;

router.get("/home", authMiddleware, async (req, res) => {
  try {
    const userFiles = await fileModel.find({ uploadedBy: req.user.userId });

    //Generating signed urls
    const signedFiles = await Promise.all(
      userFiles.map(async (file) => {
        const { data, error } = await supabase.storage
          .from("project-drive") //replace with your bucket name
          .createSignedUrl(file.supabasePath, DURATION); //valid for 24hrs

        if (error) {
          console.error(`Error signing URL for ${file.supabasePath}`, error);
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

      res.redirect(`/home`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

router.get("/download/:path", authMiddleware, async (req, res) => {
  try {
    const loggedUserId = req.user.userId;
    const path = decodeURIComponent(req.params.path);

    const file = await fileModel.findOne({
      uploadedBy: loggedUserId,
      supabasePath: path,
    });

    if (!file) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { data, error } = await supabase.storage
      .from("project-drive") //replace with your bucket name
      .createSignedUrl(path, 60); //valid for 60 seconds

    if (error || !data) {
      console.error(error);
      return res.status(500).json({ message: "Failed to generate signed URL" });
    }

    const signedUrl = data.signedUrl;

    res.redirect(signedUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
