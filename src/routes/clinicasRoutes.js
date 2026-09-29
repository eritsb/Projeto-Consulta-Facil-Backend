const express = require("express");

const ClinicasController =
  require(
    "../controllers/clinicasController"
  );

const router = express.Router();

/**
 * @swagger
 * /clinicas:
 *   get:
 *     summary: Lista todas as clínicas
 *     description: Retorna todas as clínicas cadastradas na plataforma.
 *     tags:
 *       - Clínicas
 *     responses:
 *       200:
 *         description: Lista de clínicas retornada com sucesso
 */
router.get(
  "/",
  ClinicasController.listar
);

/**
 * @swagger
 * /clinicas/{id}:
 *   get:
 *     summary: Busca uma clínica pelo ID
 *     description: Retorna os dados de uma clínica específica.
 *     tags:
 *       - Clínicas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da clínica
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Clínica encontrada
 *       404:
 *         description: Clínica não encontrada
 */
router.get(
  "/:id",
  ClinicasController.buscarPorId
);

/**
 * @swagger
 * /clinicas:
 *   post:
 *     summary: Cadastra uma clínica
 *     description: Cria uma nova clínica no sistema.
 *     tags:
 *       - Clínicas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - cnpj
 *               - endereco
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Clínica Consulta Fácil
 *               cnpj:
 *                 type: string
 *                 example: 12345678000199
 *               telefone:
 *                 type: string
 *                 example: 8133334444
 *               email:
 *                 type: string
 *                 example: contato@consultafacil.com
 *               endereco:
 *                 type: string
 *                 example: Avenida Recife, 1000
 *               horario_funcionamento:
 *                 type: string
 *                 example: Segunda a sexta das 08:00 às 18:00
 *               ativo:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Clínica cadastrada com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: CNPJ já cadastrado
 */
router.post(
  "/",
  ClinicasController.cadastrar
);

/**
 * @swagger
 * /clinicas/{id}:
 *   put:
 *     summary: Atualiza uma clínica
 *     description: Atualiza os dados de uma clínica existente.
 *     tags:
 *       - Clínicas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da clínica
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Clínica atualizada com sucesso
 *       404:
 *         description: Clínica não encontrada
 */
router.put(
  "/:id",
  ClinicasController.atualizar
);

/**
 * @swagger
 * /clinicas/{id}:
 *   delete:
 *     summary: Exclui uma clínica
 *     description: Remove uma clínica do sistema.
 *     tags:
 *       - Clínicas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da clínica
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Clínica excluída com sucesso
 *       409:
 *         description: Clínica vinculada a profissionais ou especialidades
 *       404:
 *         description: Clínica não encontrada
 */
router.delete(
  "/:id",
  ClinicasController.excluir
);

module.exports = router;