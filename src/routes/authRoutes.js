const express = require("express");

const AuthController =
  require("../controllers/authController");

const autenticacao =
  require("../middlewares/autenticacao");

const autorizarPerfis =
  require("../middlewares/autorizarPerfis");

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza autenticação do usuário
 *     description: |
 *       Permite login utilizando e-mail e senha.
 *
 *       Perfis suportados:
 *       - PACIENTE
 *       - PROFISSIONAL
 *       - ADMIN
 *
 *       Retorna um token JWT para utilização nas rotas protegidas.
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@consultafacil.com
 *               senha:
 *                 type: string
 *                 example: Admin@123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Credenciais inválidas
 *       403:
 *         description: Usuário inativo
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  "/login",
  AuthController.login
);

/**
 * @swagger
 * /auth/perfil:
 *   get:
 *     summary: Retorna os dados do usuário autenticado
 *     description: |
 *       Retorna as informações do usuário autenticado utilizando o token JWT.
 *
 *       Perfis permitidos:
 *       - PACIENTE
 *       - PROFISSIONAL
 *       - ADMIN
 *     tags:
 *       - Autenticação
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil retornado com sucesso
 *       401:
 *         description: Token inválido ou expirado
 *       403:
 *         description: Usuário não autorizado
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/perfil",
  autenticacao,
  autorizarPerfis(
    "PACIENTE",
    "PROFISSIONAL",
    "ADMIN"
  ),
  AuthController.perfil
);

module.exports = router;