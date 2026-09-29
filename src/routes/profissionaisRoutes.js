const express = require("express");

const router =
  express.Router();

const ProfissionaisController =
  require(
    "../controllers/profissionaisController"
  );

/**
 * @swagger
 * /profissionais:
 *   get:
 *     summary: Lista profissionais
 *     description: Lista todos os profissionais cadastrados e permite filtros por nome, clínica ou especialidade.
 *     tags:
 *       - Profissionais
 *     parameters:
 *       - in: query
 *         name: nome
 *         required: false
 *         schema:
 *           type: string
 *         description: Nome do profissional
 *         example: Joao
 *       - in: query
 *         name: clinica
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID da clínica
 *         example: 1
 *       - in: query
 *         name: especialidade
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID da especialidade
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de profissionais retornada com sucesso
 */
router.get(
  "/",
  ProfissionaisController.listar
);

/**
 * @swagger
 * /profissionais/{id}:
 *   get:
 *     summary: Busca um profissional pelo ID
 *     description: Retorna os dados de um profissional específico.
 *     tags:
 *       - Profissionais
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do profissional
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Profissional encontrado
 *       404:
 *         description: Profissional não encontrado
 */
router.get(
  "/:id",
  ProfissionaisController.buscarPorId
);

/**
 * @swagger
 * /profissionais:
 *   post:
 *     summary: Cadastra um profissional
 *     description: Cria um novo profissional vinculado a uma clínica e especialidade.
 *     tags:
 *       - Profissionais
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_clinica
 *               - id_especialidade
 *               - nome
 *               - cpf
 *               - registro_profissional
 *               - conselho
 *             properties:
 *               id_clinica:
 *                 type: integer
 *                 example: 1
 *               id_especialidade:
 *                 type: integer
 *                 example: 1
 *               nome:
 *                 type: string
 *                 example: João Silva
 *               cpf:
 *                 type: string
 *                 example: "11122233344"
 *               registro_profissional:
 *                 type: string
 *                 example: "12345"
 *               conselho:
 *                 type: string
 *                 example: CRM-PE
 *               telefone:
 *                 type: string
 *                 example: "81999999999"
 *               email:
 *                 type: string
 *                 example: joao@clinica.com
 *     responses:
 *       201:
 *         description: Profissional cadastrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: CPF ou registro profissional já cadastrado
 */
router.post(
  "/",
  ProfissionaisController.cadastrar
);

/**
 * @swagger
 * /profissionais/{id}:
 *   put:
 *     summary: Atualiza um profissional
 *     description: Atualiza os dados de um profissional existente.
 *     tags:
 *       - Profissionais
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do profissional
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Profissional atualizado com sucesso
 *       404:
 *         description: Profissional não encontrado
 */
router.put(
  "/:id",
  ProfissionaisController.atualizar
);

/**
 * @swagger
 * /profissionais/{id}:
 *   delete:
 *     summary: Exclui um profissional
 *     description: Remove um profissional do sistema.
 *     tags:
 *       - Profissionais
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do profissional
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Profissional removido com sucesso
 *       404:
 *         description: Profissional não encontrado
 *       409:
 *         description: Profissional vinculado a disponibilidades ou agendamentos
 */
router.delete(
  "/:id",
  ProfissionaisController.excluir
);

module.exports = router;