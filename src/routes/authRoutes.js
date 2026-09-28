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
 *                       example: rejane@email.com
 *                     perfil:
 *                       type: string
 *                       example: PACIENTE
 *       400:
 *         description: E-mail ou senha não informados ou e-mail inválido
 *       401:
 *         description: E-mail ou senha inválidos
 *       403:
 *         description: Conta de paciente inativa
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
 *                 telefone:
 *                   type: string
 *                   example: "81999999999"
 *                 email:
 *                   type: string
 *                   example: rejane@email.com
 *                 endereco:
 *                   type: string
 *                   example: Recife - PE
 *                 ativo:
 *                   type: boolean
 *                   example: true
 *                 perfil:
 *                   type: string
 *                   example: PACIENTE
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Usuário sem permissão para acessar o recurso
 *       404:
 *         description: Paciente não encontrado
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