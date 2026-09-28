const express =
  require("express");

const router =
  express.Router();

const DisponibilidadesController =
  require(
    "../controllers/disponibilidadesController"
  );

/**
 * @swagger
 * /disponibilidades:
 *   get:
 *     summary: Lista disponibilidades
 *     tags:
 *       - Disponibilidades
 *     responses:
 *       200:
 *         description: Lista de disponibilidades
 */

router.get(
  "/",
  DisponibilidadesController.listar
);

/**
 * @swagger
 * /disponibilidades/profissional/{id}:
 *   get:
 *     summary: Lista disponibilidades de um profissional
 *     tags:
 *       - Disponibilidades
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Disponibilidades retornadas com sucesso
 */

router.get(
  "/profissional/:id",
  DisponibilidadesController.listarPorProfissional
);

router.get(
  "/:id",
  DisponibilidadesController.buscarPorId
);

/**
 * @swagger
 * /disponibilidades:
 *   post:
 *     summary: Cadastra uma disponibilidade
 *     tags:
 *       - Disponibilidades
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_profissional:
 *                 type: integer
 *               data:
 *                 type: string
 *               hora_inicio:
 *                 type: string
 *               hora_fim:
 *                 type: string
 *     responses:
 *       201:
 *         description: Disponibilidade cadastrada com sucesso
 */

router.post(
  "/",
  DisponibilidadesController.cadastrar
);

router.put(
  "/:id",
  DisponibilidadesController.atualizar
);

router.delete(
  "/:id",
  DisponibilidadesController.excluir
);

module.exports = router;