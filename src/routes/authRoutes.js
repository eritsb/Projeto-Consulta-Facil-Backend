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
 *     summary: Realiza o login do paciente
 *     description: Autentica o paciente por e-mail e senha e retorna um token JWT.
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
 *                 example: rejane@email.com
 *               senha:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Login realizado com sucesso
 *                 token:
 *                   type: string
 *                   description: Token JWT utilizado nas rotas protegidas
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id_paciente:
 *                       type: integer
 *                       example: 2
 *                     nome:
 *                       type: string
 *                       example: Rejane Mendonca
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: rejane@email.com
 *                     perfil:
 *                       type: string
 *                       enum:
 *                         - PACIENTE
 *                       example: PACIENTE
 *       400:
 *         description: E-mail ou senha não informados ou e-mail inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erro:
 *                   type: string
 *                   example: E-mail e senha são obrigatórios
 *       401:
 *         description: E-mail ou senha inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erro:
 *                   type: string
 *                   example: E-mail ou senha inválidos
 *       403:
 *         description: Conta de paciente inativa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erro:
 *                   type: string
 *                   example: Conta inativa
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
 *     summary: Consulta o perfil do paciente autenticado
 *     description: Valida o token JWT e retorna os dados do paciente autenticado.
 *     tags:
 *       - Autenticação
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do paciente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_paciente:
 *                   type: integer
 *                   example: 2
 *                 nome:
 *                   type: string
 *                   example: Rejane Mendonca
 *                 cpf:
 *                   type: string
 *                   example: "12345678901"
 *                 data_nascimento:
 *                   type: string
 *                   format: date-time
 *                   example: "1998-05-10T03:00:00.000Z"
 *                 telefone:
 *                   type: string
 *                   nullable: true
 *                   example: "81999999999"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: rejane@email.com
 *                 endereco:
 *                   type: string
 *                   nullable: true
 *                   example: Recife - PE
 *                 ativo:
 *                   type: boolean
 *                   example: true
 *                 data_cadastro:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-09-24T18:29:09.684Z"
 *                 perfil:
 *                   type: string
 *                   enum:
 *                     - PACIENTE
 *                   example: PACIENTE
 *       401:
 *         description: Token não informado, inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erro:
 *                   type: string
 *                   example: Token de autenticação inválido
 *       403:
 *         description: Usuário sem permissão para acessar o recurso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erro:
 *                   type: string
 *                   example: Usuário sem permissão para esta operação
 *       404:
 *         description: Paciente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erro:
 *                   type: string
 *                   example: Paciente não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/perfil",
  autenticacao,
  autorizarPerfis("PACIENTE"),
  AuthController.perfil
);

module.exports = router;