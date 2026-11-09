const express = require("express");

const AgendamentosController =
  require("../controllers/agendamentosController");

const autenticacao = require(
  "../middlewares/autenticacao"
);

const autorizarPerfis = require(
  "../middlewares/autorizarPerfis"
);

const router = express.Router();

/**
 * @swagger
 * /agendamentos/paciente/{idPaciente}:
 *   get:
 *     summary: Lista os agendamentos de um paciente
 *     description: Retorna todos os agendamentos associados ao paciente informado.
 *     tags:
 *       - Agendamentos
 *     security:
 *       - bearerAuth: []
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
  autenticacao,
  autorizarPerfis("PACIENTE", "ADMIN"),
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de agendamentos retornada com sucesso
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/",
  autenticacao,
  autorizarPerfis("ADMIN"),
  AgendamentosController.listar
);

/**
 * @swagger
 * /agendamentos/me:
 *   get:
 *     summary: Lista os agendamentos do paciente autenticado
 *     description: |
 *       Retorna o histórico de agendamentos do paciente autenticado.
 *
 *       Perfis permitidos: PACIENTE.
 *     tags:
 *       - Agendamentos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agendamentos retornados com sucesso
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Usuário sem permissão para esta operação
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/me",
  autenticacao,
  autorizarPerfis("PACIENTE"),
  AgendamentosController.listarMe
);

/**
 * @swagger
 * /agendamentos/{id}:
 *   get:
 *     summary: Busca um agendamento pelo ID
 *     tags:
 *       - Agendamentos
 *     security:
 *       - bearerAuth: []
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
  autenticacao,
  autorizarPerfis("PACIENTE", "ADMIN"),
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
 *     security:
 *       - bearerAuth: []
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
 *               id_triagem:
 *                 type: integer
 *                 nullable: true
 *                 description: ID de uma triagem do próprio paciente para vincular ao agendamento
 *                 example: 1
 *     responses:
 *       201:
 *         description: Agendamento realizado com sucesso
 *       400:
 *         description: Dados inválidos ou incompletos
 *       403:
 *         description: Triagem pertence a outro paciente
 *       404:
 *         description: Paciente, disponibilidade ou triagem não encontrada
 *       409:
 *         description: Horário indisponível, conflito ou triagem já vinculada
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  "/",
  autenticacao,
  autorizarPerfis("PACIENTE", "ADMIN"),
  AgendamentosController.cadastrar
);

/**
 * @swagger
 * /agendamentos/{id}:
 *   put:
 *     summary: Atualiza um agendamento
 *     description: Atualiza a observação ou a situação do agendamento. Mudar o status para CONFIRMADO envia a notificação AGENDAMENTO_CONFIRMADO; as demais alterações enviam AGENDAMENTO_ATUALIZADO.
 *     tags:
 *       - Agendamentos
 *     security:
 *       - bearerAuth: []
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
  autenticacao,
  autorizarPerfis("PACIENTE", "ADMIN"),
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
 *     security:
 *       - bearerAuth: []
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
  autenticacao,
  autorizarPerfis("PACIENTE", "ADMIN"),
  AgendamentosController.cancelar
);

/**
 * @swagger
 * /agendamentos/{id}/reagendar:
 *   patch:
 *     summary: Reagenda um agendamento para outro horário
 *     description: |
 *       Permite apenas ao paciente dono reservar uma nova disponibilidade
 *       e atualizar o agendamento com a nova data, horário e profissional.
 *       A antiga disponibilidade volta a ficar disponível somente após o
 *       sucesso da atualização; se a nova disponibilidade não estiver
 *       `DISPONIVEL`, nada é alterado.
 *
 *       Agendamentos `CANCELADO` ou `REALIZADO` não podem ser reagendados
 *       e a situação atual do agendamento é mantida.
 *     tags:
 *       - Agendamentos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do agendamento
 *         schema:
 *           type: integer
 *           example: 9
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_disponibilidade
 *             properties:
 *               id_disponibilidade:
 *                 type: integer
 *                 description: ID da nova disponibilidade, que deve estar DISPONIVEL
 *                 example: 12
 *     responses:
 *       200:
 *         description: Agendamento reagendado com sucesso
 *       400:
 *         description: ID do agendamento ou da disponibilidade inválido
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Somente o paciente dono pode reagendar o agendamento
 *       404:
 *         description: Agendamento ou disponibilidade não encontrados
 *       409:
 *         description: Cancelado/realizado não pode reagendar, profissional inativo, horário indisponível ou conflito de horário
 *       500:
 *         description: Erro interno do servidor
 */
router.patch(
  "/:id/reagendar",
  autenticacao,
  autorizarPerfis("PACIENTE"),
  AgendamentosController.reagendar
);

/**
 * @swagger
 * /agendamentos/{id}:
 *   delete:
 *     summary: Exclui um agendamento
 *     description: Remove definitivamente o agendamento e libera a disponibilidade vinculada.
 *     tags:
 *       - Agendamentos
 *     security:
 *       - bearerAuth: []
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
  autenticacao,
  autorizarPerfis("PACIENTE", "ADMIN"),
  AgendamentosController.excluir
);

module.exports = router;