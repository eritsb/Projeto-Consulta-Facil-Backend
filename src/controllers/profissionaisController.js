const ProfissionaisService =
 require("../services/profissionaisService");

class ProfissionaisController {

  static async listar(req, res) {

  try {

    const {
      nome,
      clinica,
      especialidade
    } = req.query;

    let profissionais;

    if (nome) {

      profissionais =
        await ProfissionaisService
          .buscarPorNome(nome);

    } else if (clinica) {

      profissionais =
        await ProfissionaisService
          .buscarPorClinica(clinica);

    } else if (especialidade) {

      profissionais =
        await ProfissionaisService
          .buscarPorEspecialidade(
            especialidade
          );

    } else {

      profissionais =
        await ProfissionaisService
          .listarTodos();

    }

    return res
      .status(200)
      .json(profissionais);

  } catch (error) {

    return res
      .status(500)
      .json({
        erro: error.message
      });

  }

}

  static async buscarPorId(req,res){

    try {

      const profissional =
        await ProfissionaisService
          .buscarPorId(
            req.params.id
          );

      return res
        .status(200)
        .json(profissional);

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

      const profissional =
        await ProfissionaisService
          .cadastrar(req.body);

      return res
        .status(201)
        .json(profissional);

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

      const profissional =
        await ProfissionaisService
          .atualizar(
            req.params.id,
            req.body
          );

      return res
        .status(200)
        .json(profissional);

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

      const profissional =
        await ProfissionaisService
          .excluir(
            req.params.id
          );

      return res
        .status(200)
        .json({
          mensagem:
          "Profissional removido",
          profissional
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
  ProfissionaisController;