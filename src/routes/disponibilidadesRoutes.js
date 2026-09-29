const express = require("express");

const DisponibilidadesController =
  require("../controllers/disponibilidadesController");

const router = express.Router();

/**
 * @swagger
 * /disponibilidades:
 *   get:
 *     summary: Lista todas as disponibilidades
 *     description: Retorna todos os horários cadastrados, incluindo o nome do profissional associado.
 *     tags:
 *       - Disponibilidades
 *     responses:
 *       200:
 *         description: Lista de disponibilidades retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_disponibilidade:
 *                     type: integer
 *                     example: 1
 *                   id_profissional:
 *                     type: integer
 *                     example: 1
 *                   profissional_nome:
 *                     type: string
 *                     example: Profissional Exemplo
 *                   data:
 *                     type: string
 *                     format: date
 *                     example: "2026-10-20"
 *                   hora_inicio:
 *                     type: string
 *                     example: "08:00:00"
 *                   hora_fim:
 *                     type: string
 *                     example: "09:00:00"
 *                   status:
 *                     type: string
 *                     example: DISPONIVEL
 *       500:
 *         description: Erro interno ao listar disponibilidades
 */
router.get(
  "/",
  DisponibilidadesController.listar
);

/**
 * @swagger
 * /disponibilidades/profissional/{id}:
 *   get:
 *     summary: Lista as disponibilidades de um profissional
 *     description: Retorna os dias e horários cadastrados para o profissional informado.
 *     tags:
 *       - Disponibilidades
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
 *         description: Disponibilidades do profissional retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_disponibilidade:
 *                     type: integer
 *                     example: 1
 *                   id_profissional:
 *                     type: integer
 *                     example: 1
 *                   data:
 *                     type: string
 *                     format: date
 *                     example: "2026-10-20"
 *                   hora_inicio:
 *                     type: string
 *                     example: "08:00:00"
 *                   hora_fim:
 *                     type: string
 *                     example: "09:00:00"
 *                   status:
 *                     type: string
 *                     example: DISPONIVEL
 *       500:
 *         description: Erro interno ao listar as disponibilidades do profissional
 */
router.get(
  "/profissional/:id",
  DisponibilidadesController.listarPorProfissional
);

/**
 * @swagger
 * /disponibilidades/{id}:
 *   get:
 *     summary: Busca uma disponibilidade pelo ID
 *     description: Retorna os dados de uma disponibilidade específica.
 *     tags:
 *       - Disponibilidades
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da disponibilidade
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Disponibilidade encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_disponibilidade:
 *                   type: integer
 *                   example: 1
 *                 id_profissional:
 *                   type: integer
 *                   example: 1
 *                 data:
 *                   type: string
 *                   format: date
 *                   example: "2026-10-20"
 *                 hora_inicio:
 *                   type: string
 *                   example: "08:00:00"
 *                 hora_fim:
 *                   type: string
 *                   example: "09:00:00"
 *                 status:
 *                   type: string
 *                   example: DISPONIVEL
 *       404:
 *         description: Disponibilidade não encontrada
 */
router.get(
  "/:id",
  DisponibilidadesController.buscarPorId
);

/**
 * @swagger
 * /disponibilidades:
 *   post:
 *     summary: Cadastra uma disponibilidade
 *     description: Cadastra um novo dia e horário de atendimento para um profissional. O status inicial será DISPONIVEL.
 *     tags:
 *       - Disponibilidades
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_profissional
 *               - data
 *               - hora_inicio
 *               - hora_fim
 *             properties:
 *               id_profissional:
 *                 type: integer
 *                 example: 1
 *               data:
 *                 type: string
 *                 format: date
 *                 example: "2026-10-20"
 *               hora_inicio:
 *                 type: string
 *                 example: "08:00"
 *               hora_fim:
 *                 type: string
 *                 example: "09:00"
 *     responses:
 *       201:
 *         description: Disponibilidade cadastrada com sucesso
 *       400:
 *         description: Campos obrigatórios ausentes ou disponibilidade duplicada
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  "/",
  DisponibilidadesController.cadastrar
);

/**
 * @swagger
 * /disponibilidades/{id}:
 *   put:
 *     summary: Atualiza uma disponibilidade
 *     description: Atualiza o profissional, a data, os horários ou o status de uma disponibilidade.
 *     tags:
 *       - Disponibilidades
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da disponibilidade
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_profissional
 *               - data
 *               - hora_inicio
 *               - hora_fim
 *               - status
 *             properties:
 *               id_profissional:
 *                 type: integer
 *                 example: 1
 *               data:
 *                 type: string
 *                 format: date
 *                 example: "2026-10-20"
 *               hora_inicio:
 *                 type: string
 *                 example: "09:00"
 *               hora_fim:
 *                 type: string
 *                 example: "10:00"
 *               status:
 *                 type: string
 *                 enum:
 *                   - DISPONIVEL
 *                   - RESERVADO
 *                 example: DISPONIVEL
 *     responses:
 *       200:
 *         description: Disponibilidade atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Disponibilidade não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.put(
  "/:id",
  DisponibilidadesController.atualizar
);

/**
 * @swagger
 * /disponibilidades/{id}:
 *   delete:
 *     summary: Exclui uma disponibilidade
 *     description: Remove uma disponibilidade do sistema.
 *     tags:
 *       - Disponibilidades
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da disponibilidade
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Disponibilidade excluída com sucesso
 *       404:
 *         description: Disponibilidade não encontrada
 *       409:
 *         description: Disponibilidade vinculada a um agendamento
 *       500:
 *         description: Erro interno do servidor
 */
router.delete(
  "/:id",
  DisponibilidadesController.excluir
);

module.exports = router;