const fs = require("fs");

const TranscricaoService = require(
  "../services/transcricaoService"
);

class TranscricaoController {
  static async transcrever(req, res, next) {
    let caminhoArquivo;

    try {
      if (!req.file) {
        const erro = new Error(
          "Envie um arquivo de áudio."
        );

        erro.statusCode = 400;

        throw erro;
      }

      caminhoArquivo = req.file.path;

      const resultado =
        await TranscricaoService.transcrever(
          caminhoArquivo
        );

      return res.status(200).json(resultado);

    } catch (error) {
      return next(error);

    } finally {
      if (
        caminhoArquivo &&
        fs.existsSync(caminhoArquivo)
      ) {
        fs.unlinkSync(caminhoArquivo);
      }
    }
  }
}

module.exports = TranscricaoController;