const AuthService =
  require("../services/authService");

class AuthController {
  static tratarErro(
    error,
    res,
    mensagemPadrao
  ) {
    console.error(
      mensagemPadrao,
      error
    );

    return res
      .status(error.statusCode || 500)
      .json({
        erro:
          error.statusCode
            ? error.message
            : mensagemPadrao
      });
  }

  static async login(req, res) {
    try {
      const resultado =
        await AuthService.login(
          req.body
        );

      return res.status(200).json({
        mensagem:
          "Login realizado com sucesso",

        ...resultado
      });
    } catch (error) {
      return AuthController.tratarErro(
        error,
        res,
        "Erro interno ao realizar login"
      );
    }
  }

  static async perfil(req, res) {
    try {
      const usuario =
        await AuthService.obterPerfil(
          req.usuario.id,
          req.usuario.perfil
        );

      return res
        .status(200)
        .json(usuario);
    } catch (error) {
      return AuthController.tratarErro(
        error,
        res,
        "Erro interno ao buscar perfil"
      );
    }
  }
}

module.exports = AuthController;