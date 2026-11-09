const NotificacoesService = require(
  "../services/notificacoesService"
);

class NotificacoesController {

  static async listar(req, res, next) {

    try {

      const notificacoes =
        await NotificacoesService.listar(
          req.usuario.id
        );

      return res
        .status(200)
        .json(notificacoes);


    } catch (error) {

      return next(error);

    }
  }


  static async marcarComoLida(
    req,
    res,
    next
  ) {

    try {

      const notificacao =
        await NotificacoesService
          .marcarComoLida(
            req.params.id,
            req.usuario.id
          );

      return res
        .status(200)
        .json(notificacao);


    } catch (error) {

      return next(error);

    }
  }


  static async marcarTodasComoLidas(
    req,
    res,
    next
  ) {

    try {

      const resultado =
        await NotificacoesService
          .marcarTodasComoLidas(
            req.usuario.id
          );

      return res
        .status(200)
        .json(resultado);


    } catch (error) {

      return next(error);

    }
  }


  static async excluir(req, res, next) {

    try {

      const resultado =
        await NotificacoesService.excluir(
          req.params.id,
          req.usuario.id
        );

      return res
        .status(200)
        .json(resultado);


    } catch (error) {

      return next(error);

    }
  }
}

module.exports = NotificacoesController;
