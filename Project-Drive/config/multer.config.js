// multerConfig.js
const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats - officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "video/mp4",
    "audio/mpeg",
    "application/zip",
    "text/plain",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const limits = {
  fileSize: 3 * 1024 * 1024 * 1024, // 30 MB
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

module.exports = upload;
