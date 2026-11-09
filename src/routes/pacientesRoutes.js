const express = require("express");

const PacientesController =
  require("../controllers/pacientesController");

const autenticacao = require(
  "../middlewares/autenticacao"
);

const autorizarPerfis = require(
  "../middlewares/autorizarPerfis"
);

const router = express.Router();

/**
 * @swagger
 * /pacientes:
 *   get:
 *     summary: Lista todos os pacientes
 *     description: Retorna todos os pacientes cadastrados. Também permite busca por nome utilizando query string.
 *     tags:
 *       - Pacientes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nome
 *         required: false
 *         schema:
 *           type: string
 *         description: Nome do paciente para pesquisa
 *         example: Maria
 *     responses:
 *       200:
 *         description: Lista de pacientes retornada com sucesso
 */
router.get(
  "/",
  autenticacao,
  autorizarPerfis("ADMIN"),
  PacientesController.listar
);

/**
 * @swagger
 * /pacientes/me:
 *   get:
 *     summary: Retorna o perfil do paciente autenticado
 *     description: |
 *       Retorna os dados do paciente autenticado, obtidos do token JWT.
 *
 *       Perfis permitidos: PACIENTE.
 *     tags:
 *       - Pacientes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil retornado com sucesso
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Usuário sem permissão para esta operação
 *       404:
 *         description: Paciente não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/me",
  autenticacao,
  autorizarPerfis("PACIENTE"),
  PacientesController.buscarMe
);

/**
 * @swagger
 * /pacientes/me:
 *   put:
 *     summary: Atualiza o perfil do paciente autenticado
 *     description: |
 *       Atualiza os dados do paciente autenticado. O identificador é
 *       obtido do token e o campo `ativo` não pode ser alterado por esta
 *       rota.
 *
 *       Perfis permitidos: PACIENTE.
 *     tags:
 *       - Pacientes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Maria Silva
 *               cpf:
 *                 type: string
 *                 example: "12345678901"
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *                 example: "1995-02-10"
 *               telefone:
 *                 type: string
 *                 example: "81988888888"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria@email.com
 *               senha:
 *                 type: string
 *                 example: "12345678"
 *               endereco:
 *                 type: string
 *                 example: Recife - PE
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Usuário sem permissão para esta operação
 *       404:
 *         description: Paciente não encontrado
 *       409:
 *         description: CPF ou e-mail utilizado por outro paciente
 *       500:
 *         description: Erro interno do servidor
 */
router.put(
  "/me",
  autenticacao,
  autorizarPerfis("PACIENTE"),
  PacientesController.atualizarMe
);

/**
 * @swagger
 * /pacientes/{id}:
 *   get:
 *     summary: Busca um paciente pelo ID
 *     description: Retorna os dados de um paciente específico.
 *     tags:
 *       - Pacientes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         description: Paciente encontrado
 *       404:
 *         description: Paciente não encontrado
 */
router.get(
  "/:id",
  autenticacao,
  autorizarPerfis("PACIENTE", "ADMIN"),
  PacientesController.buscarPorId
);

/**
 * @swagger
 * /pacientes:
 *   post:
 *     summary: Cadastra um novo paciente
 *     description: Cria uma conta de paciente no sistema.
 *     tags:
 *       - Pacientes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - cpf
 *               - data_nascimento
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Maria Silva
 *               cpf:
 *                 type: string
 *                 example: "12345678901"
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *                 example: "1995-02-10"
 *               telefone:
 *                 type: string
 *                 example: "81988888888"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria@email.com
 *               senha:
 *                 type: string
 *                 example: "12345678"
 *               endereco:
 *                 type: string
 *                 example: Recife - PE
 *     responses:
 *       201:
 *         description: Paciente cadastrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: CPF ou e-mail já cadastrado
 */
router.post(
  "/",
  PacientesController.cadastrar
);

/**
 * @swagger
 * /pacientes/{id}:
 *   put:
 *     summary: Atualiza um paciente
 *     description: Atualiza os dados de um paciente existente.
 *     tags:
 *       - Pacientes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         description: Paciente atualizado com sucesso
 *       404:
 *         description: Paciente não encontrado
 */
router.put(
  "/:id",
  autenticacao,
  autorizarPerfis("PACIENTE", "ADMIN"),
  PacientesController.atualizar
);

/**
 * @swagger
 * /pacientes/{id}:
 *   delete:
 *     summary: Exclui um paciente
 *     description: Remove um paciente do sistema.
 *     tags:
 *       - Pacientes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         description: Paciente removido com sucesso
 *       404:
 *         description: Paciente não encontrado
 *       409:
 *         description: Paciente possui registros vinculados
 */
router.delete(
  "/:id",
  autenticacao,
  autorizarPerfis("ADMIN"),
  PacientesController.excluir
);

module.exports = router;