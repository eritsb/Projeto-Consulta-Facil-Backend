const express = require("express");

const EspecialidadesController =
  require("../controllers/especialidadesController");

const router = express.Router();

/**
 * @swagger
 * /especialidades:
 *   get:
 *     summary: Lista todas as especialidades
 *     description: Retorna todas as especialidades cadastradas na plataforma.
 *     tags:
 *       - Especialidades
 *     responses:
 *       200:
 *         description: Lista de especialidades retornada com sucesso
 */
router.get(
  "/",
  EspecialidadesController.listar
);

/**
 * @swagger
 * /especialidades/{id}:
 *   get:
 *     summary: Busca uma especialidade pelo ID
 *     description: Retorna os dados de uma especialidade específica.
 *     tags:
 *       - Especialidades
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Especialidade encontrada
 *       404:
 *         description: Especialidade não encontrada
 */
router.get(
  "/:id",
  EspecialidadesController.buscarPorId
);

/**
 * @swagger
 * /especialidades:
 *   post:
 *     summary: Cadastra uma especialidade
 *     description: Cria uma nova especialidade no sistema.
 *     tags:
 *       - Especialidades
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Cardiologia
 *               descricao:
 *                 type: string
 *                 example: Especialidade responsável pelo diagnóstico e tratamento de doenças cardiovasculares.
 *               ativo:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Especialidade cadastrada com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Especialidade já cadastrada
 */
router.post(
  "/",
  EspecialidadesController.cadastrar
);

/**
 * @swagger
 * /especialidades/{id}:
 *   put:
 *     summary: Atualiza uma especialidade
 *     description: Atualiza os dados de uma especialidade existente.
 *     tags:
 *       - Especialidades
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Cardiologia
 *               descricao:
 *                 type: string
 *                 example: Especialidade responsável pelo diagnóstico e tratamento de doenças cardiovasculares.
 *               ativo:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Especialidade atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Especialidade não encontrada
 *       409:
 *         description: Especialidade já cadastrada
 */
router.put(
  "/:id",
  EspecialidadesController.atualizar
);

/**
 * @swagger
 * /especialidades/{id}:
 *   delete:
 *     summary: Exclui uma especialidade
 *     description: Remove uma especialidade do sistema.
 *     tags:
 *       - Especialidades
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Especialidade excluída com sucesso
 *       404:
 *         description: Especialidade não encontrada
 *       409:
 *         description: Especialidade vinculada a profissionais ou clínicas
 */
router.delete(
  "/:id",
  EspecialidadesController.excluir
);

module.exports = router;