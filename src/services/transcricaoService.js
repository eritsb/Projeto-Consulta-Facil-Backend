const fs = require("fs");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

class TranscricaoService {
  static async transcrever(caminhoArquivo) {
    if (!caminhoArquivo) {
      const erro = new Error("Arquivo de áudio não informado.");
      erro.statusCode = 400;
      throw erro;
    }

    if (!process.env.GROQ_API_KEY) {
      const erro = new Error(
        "A variável GROQ_API_KEY não foi configurada."
      );
      erro.statusCode = 500;
      throw erro;
    }

    try {
      const transcricao =
        await groq.audio.transcriptions.create({
          file: fs.createReadStream(caminhoArquivo),

          model:
            process.env.GROQ_WHISPER_MODEL ||
            "whisper-large-v3-turbo",

          language: "pt",

          response_format: "json",

          temperature: 0
        });

      return {
        texto: transcricao.text
      };

    } catch (error) {
      console.error("Erro na transcrição Groq:", error);

      const erro = new Error(
        "Não foi possível transcrever o áudio."
      );

      erro.statusCode = 502;

      throw erro;
    }
  }
}

module.exports = TranscricaoService;