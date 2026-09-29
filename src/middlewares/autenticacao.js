const jwt = require("jsonwebtoken");

function autenticacao(
  req,
  res,
  next
) {
  try {
    const cabecalho =
      req.headers.authorization;

    if (
      !cabecalho ||
      !cabecalho.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        erro:
          "Token de autenticação não informado"
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        erro:
          "JWT_SECRET não configurada no servidor"
      });
    }

    const token =
      cabecalho.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        erro:
          "Token de autenticação não informado"
      });
    }

    const dados =
      jwt.verify(
        token,
        process.env.JWT_SECRET,
        {
          algorithms: ["HS256"]
        }
      );

    const perfisPermitidos = [
      "PACIENTE",
      "PROFISSIONAL",
      "ADMIN"
    ];

    if (
      !dados.id ||
      !perfisPermitidos.includes(
        dados.perfil
      )
    ) {
      return res.status(401).json({
        erro:
          "Token de autenticação inválido"
      });
    }

    req.usuario = {
      id: dados.id,
      perfil: dados.perfil
    };

    return next();
  } catch (error) {
    if (
      error.name ===
      "TokenExpiredError"
    ) {
      return res.status(401).json({
        erro:
          "Token de autenticação expirado"
      });
    }

    return res.status(401).json({
      erro:
        "Token de autenticação inválido"
    });
  }
}

module.exports = autenticacao;
