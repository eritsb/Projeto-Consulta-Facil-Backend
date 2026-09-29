const AdministradoresService =
  require(
    "../services/administradoresService"
  );

class AdministradoresController {

  static async listar(req,res){

    try {

      const administradores =
        await AdministradoresService
          .listarTodos();

      return res
        .status(200)
        .json(administradores);

    } catch(error){

      return res
        .status(500)
        .json({
          erro:error.message
        });

    }

  }

  static async buscarPorId(req,res){

    try {

      const administrador =
        await AdministradoresService
          .buscarPorId(
            req.params.id
          );

      return res
        .status(200)
        .json(administrador);

    } catch(error){

      return res
        .status(404)
        .json({
          erro:error.message
        });

    }

  }

  static async cadastrar(req,res){

    try {

      const administrador =
        await AdministradoresService
          .cadastrar(req.body);

      return res
        .status(201)
        .json(administrador);

    } catch(error){

      return res
        .status(400)
        .json({
          erro:error.message
        });

    }

  }

  static async atualizar(req,res){

    try {

      const administrador =
        await AdministradoresService
          .atualizar(
            req.params.id,
            req.body
          );

      return res
        .status(200)
        .json(administrador);

    } catch(error){

      return res
        .status(400)
        .json({
          erro:error.message
        });

    }

  }

  static async excluir(req,res){

    try {

      const administrador =
        await AdministradoresService
          .excluir(
            req.params.id
          );

      return res
        .status(200)
        .json({
          mensagem:
            "Administrador removido",
          administrador
        });

    } catch(error){

      return res
        .status(400)
        .json({
          erro:error.message
        });

    }

  }

}

module.exports =
  AdministradoresController;