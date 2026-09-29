const express = require("express");

const PacientesController =
  require("../controllers/pacientesController");

const router = express.Router();

/**
 * @swagger
 * /pacientes:
 *   get:
 *     summary: Lista todos os pacientes
 *     description: Retorna todos os pacientes cadastrados. Também permite busca por nome utilizando query string.
 *     tags:
 *       - Pacientes
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
  PacientesController.listar
);

/**
 * @swagger
 * /pacientes/{id}:
 *   get:
 *     summary: Busca um paciente pelo ID
 *     description: Retorna os dados de um paciente específico.
 *     tags:
 *       - Pacientes
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
 *                 example: "123456"
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
  PacientesController.excluir
);

module.exports = router;