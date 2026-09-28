const express = require("express");

const AgendamentosController =
  require(
    "../controllers/agendamentosController"
  );

const router = express.Router();

/**
 * @swagger
 * /agendamentos:
 *   get:
 *     summary: Lista agendamentos
 *     tags:
 *       - Agendamentos
 *     responses:
 *       200:
 *         description: Lista de agendamentos
 */

router.get(
  "/paciente/:idPaciente",
  AgendamentosController
    .listarPorPaciente
);

router.get(
  "/",
  AgendamentosController.listar
);

router.get(
  "/:id",
  AgendamentosController.buscarPorId
);

/**
 * @swagger
 * /agendamentos:
 *   post:
 *     summary: Realiza um agendamento
 *     tags:
 *       - Agendamentos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_paciente:
 *                 type: integer
 *               id_profissional:
 *                 type: integer
 *               id_disponibilidade:
 *                 type: integer
 *               observacao:
 *                 type: string
 *     responses:
 *       201:
 *         description: Agendamento realizado com sucesso
 */

router.post(
  "/",
  AgendamentosController.cadastrar
);

router.put(
  "/:id",
  AgendamentosController.atualizar
);

/**
 * @swagger
 * /agendamentos/{id}/cancelar:
 *   patch:
 *     summary: Cancela um agendamento
 *     tags:
 *       - Agendamentos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Agendamento cancelado com sucesso
 */

router.patch(
  "/:id/cancelar",
  AgendamentosController.cancelar
);

router.delete(
  "/:id",
  AgendamentosController.excluir
);

module.exports = router;