const TriagensService = require(
  "../services/triagensService"
);

class TriagensController {

  static async cadastrar(req, res, next) {

    try {

      const idPaciente =
        req.usuario.id;


      const triagem =
        await TriagensService.cadastrar(
          idPaciente,
          req.body
        );


      return res
        .status(201)
        .json(triagem);


    } catch (error) {

      return next(error);

    }
  }


  static async conversar(req, res, next) {

    try {

      const idPaciente =
        req.usuario.id;


      const resultado =
        await TriagensService.conversar(
          idPaciente,
          req.body
        );


      return res
        .status(200)
        .json(resultado);


    } catch (error) {

      return next(error);

    }
  }


  static async listarTodos(req, res, next) {

    try {

      const triagens =
        await TriagensService.listarTodos();


      return res
        .status(200)
        .json(triagens);


    } catch (error) {

      return next(error);

    }
  }


  static async buscarPorId(req, res, next) {

    try {

      const triagem =
        await TriagensService.buscarPorId(
          req.params.id,
          req.usuario
        );


      return res
        .status(200)
        .json(triagem);


    } catch (error) {

      return next(error);

    }
  }


  static async buscarMinhasTriagens(
    req,
    res,
    next
  ) {

    try {

      const idPaciente =
        req.usuario.id;


      const triagens =
        await TriagensService.buscarPorPaciente(
          idPaciente
        );


      return res
        .status(200)
        .json(triagens);


    } catch (error) {

      return next(error);

    }
  }


  static async atualizar(req, res, next) {

    try {

      const idPaciente =
        req.usuario.id;


      const triagem =
        await TriagensService.atualizar(
          req.params.id,
          idPaciente,
          req.body
        );


      return res
        .status(200)
        .json(triagem);


    } catch (error) {

      return next(error);

    }
  }


  static async excluir(req, res, next) {

    try {

      const idPaciente =
        req.usuario.id;


      const resultado =
        await TriagensService.excluir(
          req.params.id,
          idPaciente
        );


      return res
        .status(200)
        .json(resultado);


    } catch (error) {

      return next(error);

    }
  }
}

module.exports = TriagensController;