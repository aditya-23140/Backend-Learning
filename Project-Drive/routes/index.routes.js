const express = require("express");
const upload = require("../config/multer.config");
const supabase = require("../config/supabase.config");

const router = express.Router();

router.get("/home", (req, res) => {
  res.render("home");
});

//.single('name of input field')
router.post("/upload", upload.single("file"), async (req, res) => {
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

    res.json({
      path: data.path,
      publicUrl: publicUrlData.publicUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
