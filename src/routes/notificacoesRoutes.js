const express = require("express");

const NotificacoesController = require(
  "../controllers/notificacoesController"
);

const autenticacao = require(
  "../middlewares/autenticacao"
);

const autorizarPerfis = require(
  "../middlewares/autorizarPerfis"
);

const router = express.Router();

/**
 * @swagger
 * /notificacoes:
 *   get:
 *     summary: Lista as notificações do paciente autenticado
 *     description: |
 *       Retorna as notificações in-app do paciente autenticado,
 *       ordenadas da mais recente para a mais antiga.
 *
 *       Perfis permitidos: PACIENTE.
 *     tags:
 *       - Notificações
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificações retornada com sucesso
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Usuário sem permissão para esta operação
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/",
  autenticacao,
  autorizarPerfis("PACIENTE"),
  NotificacoesController.listar
);

/**
 * @swagger
 * /notificacoes/lidas:
 *   patch:
 *     summary: Marca todas as notificações como lidas
 *     description: |
 *       Marca como lidas todas as notificações não lidas do
 *       paciente autenticado.
 *
 *       Perfis permitidos: PACIENTE.
 *     tags:
 *       - Notificações
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificações marcadas como lidas
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Usuário sem permissão para esta operação
 *       500:
 *         description: Erro interno do servidor
 */
router.patch(
  "/lidas",
  autenticacao,
  autorizarPerfis("PACIENTE"),
  NotificacoesController.marcarTodasComoLidas
);

/**
 * @swagger
 * /notificacoes/{id}/lida:
 *   patch:
 *     summary: Marca uma notificação como lida
 *     description: |
 *       Marca como lida uma notificação do paciente autenticado.
 *
 *       Perfis permitidos: PACIENTE (somente o dono da notificação).
 *     tags:
 *       - Notificações
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da notificação
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Notificação marcada como lida
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Notificação pertence a outro paciente
 *       404:
 *         description: Notificação não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.patch(
  "/:id/lida",
  autenticacao,
  autorizarPerfis("PACIENTE"),
  NotificacoesController.marcarComoLida
);

/**
 * @swagger
 * /notificacoes/{id}:
 *   delete:
 *     summary: Exclui uma notificação
 *     description: |
 *       Remove uma notificação do paciente autenticado.
 *
 *       Perfis permitidos: PACIENTE (somente o dono da notificação).
 *     tags:
 *       - Notificações
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da notificação
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Notificação excluída com sucesso
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Notificação pertence a outro paciente
 *       404:
 *         description: Notificação não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete(
  "/:id",
  autenticacao,
  autorizarPerfis("PACIENTE"),
  NotificacoesController.excluir
);

module.exports = router;
