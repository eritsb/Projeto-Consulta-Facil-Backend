const express = require("express");

const AgendamentosController =
  require("../controllers/agendamentosController");

const router = express.Router();

/**
 * @swagger
 * /agendamentos/paciente/{idPaciente}:
 *   get:
 *     summary: Lista os agendamentos de um paciente
 *     description: Retorna todos os agendamentos associados ao paciente informado.
 *     tags:
 *       - Agendamentos
 *     parameters:
 *       - in: path
 *         name: idPaciente
 *         required: true
 *         description: ID do paciente
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         description: Agendamentos do paciente retornados com sucesso
 *       400:
 *         description: ID do paciente inválido
 *       404:
 *         description: Paciente não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/paciente/:idPaciente",
  AgendamentosController.listarPorPaciente
);

/**
 * @swagger
 * /agendamentos:
 *   get:
 *     summary: Lista todos os agendamentos
 *     description: Retorna os agendamentos com informações do paciente, profissional, clínica, especialidade, data, horário e situação.
 *     tags:
 *       - Agendamentos
 *     responses:
 *       200:
 *         description: Lista de agendamentos retornada com sucesso
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/",
  AgendamentosController.listar
);

/**
 * @swagger
 * /agendamentos/{id}:
 *   get:
 *     summary: Busca um agendamento pelo ID
 *     tags:
 *       - Agendamentos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do agendamento
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Agendamento encontrado
 *       400:
 *         description: ID do agendamento inválido
 *       404:
 *         description: Agendamento não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/:id",
  AgendamentosController.buscarPorId
);

/**
 * @swagger
 * /agendamentos:
 *   post:
 *     summary: Realiza um novo agendamento
 *     description: Reserva uma disponibilidade e cria um agendamento para o paciente.
 *     tags:
 *       - Agendamentos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_paciente
 *               - id_profissional
 *               - id_disponibilidade
 *             properties:
 *               id_paciente:
 *                 type: integer
 *                 example: 2
 *               id_profissional:
 *                 type: integer
 *                 example: 1
 *               id_disponibilidade:
 *                 type: integer
 *                 example: 1
 *               observacao:
 *                 type: string
 *                 nullable: true
 *                 example: Primeira consulta
 *     responses:
 *       201:
 *         description: Agendamento realizado com sucesso
 *       400:
 *         description: Dados inválidos ou incompletos
 *       404:
 *         description: Paciente ou disponibilidade não encontrada
 *       409:
 *         description: Horário indisponível ou conflito de agendamento
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  "/",
  AgendamentosController.cadastrar
);

/**
 * @swagger
 * /agendamentos/{id}:
 *   put:
 *     summary: Atualiza um agendamento
 *     description: Atualiza a observação ou a situação do agendamento.
 *     tags:
 *       - Agendamentos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do agendamento
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
 *               observacao:
 *                 type: string
 *                 nullable: true
 *                 example: Paciente solicitou atendimento no período da manhã
 *               status:
 *                 type: string
 *                 enum:
 *                   - AGENDADO
 *                   - CONFIRMADO
 *                   - CANCELADO
 *                   - REALIZADO
 *                 example: CONFIRMADO
 *     responses:
 *       200:
 *         description: Agendamento atualizado com sucesso
 *       400:
 *         description: ID ou status inválido
 *       404:
 *         description: Agendamento não encontrado
 *       409:
 *         description: O agendamento não pode ser alterado
 *       500:
 *         description: Erro interno do servidor
 */
router.put(
  "/:id",
  AgendamentosController.atualizar
);

/**
 * @swagger
 * /agendamentos/{id}/cancelar:
 *   patch:
 *     summary: Cancela um agendamento
 *     description: Altera a situação para CANCELADO e libera novamente a disponibilidade.
 *     tags:
 *       - Agendamentos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do agendamento
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Agendamento cancelado com sucesso
 *       400:
 *         description: ID do agendamento inválido
 *       404:
 *         description: Agendamento não encontrado
 *       409:
 *         description: Agendamento já cancelado ou realizado
 *       500:
 *         description: Erro interno do servidor
 */
router.patch(
  "/:id/cancelar",
  AgendamentosController.cancelar
);

/**
 * @swagger
 * /agendamentos/{id}:
 *   delete:
 *     summary: Exclui um agendamento
 *     description: Remove definitivamente o agendamento e libera a disponibilidade vinculada.
 *     tags:
 *       - Agendamentos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do agendamento
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Agendamento excluído com sucesso
 *       400:
 *         description: ID do agendamento inválido
 *       404:
 *         description: Agendamento não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete(
  "/:id",
  AgendamentosController.excluir
);

module.exports = router;