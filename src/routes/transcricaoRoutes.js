const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const TranscricaoController = require(
  "../controllers/transcricaoController"
);

const autenticacao = require(
  "../middlewares/autenticacao"
);

const router = express.Router();

const pastaUploads = path.resolve("uploads");

if (!fs.existsSync(pastaUploads)) {
  fs.mkdirSync(pastaUploads, {
    recursive: true
  });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, pastaUploads);
  },

  filename: function (req, file, cb) {
    const nome =
      `${Date.now()}-${Math.round(
        Math.random() * 1E9
      )}${path.extname(file.originalname)}`;

    cb(null, nome);
  }
});

const formatosPermitidos = [
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm"
];

const upload = multer({
  storage,

  limits: {
    fileSize: 25 * 1024 * 1024
  },

  fileFilter: function (req, file, cb) {
    if (formatosPermitidos.includes(file.mimetype)) {
      return cb(null, true);
    }

    const erro = new Error(
      "Formato de áudio não suportado."
    );

    erro.statusCode = 400;

    return cb(erro);
  }
});

router.post(
  "/transcrever",
  autenticacao,
  upload.single("audio"),
  TranscricaoController.transcrever
);

module.exports = router;