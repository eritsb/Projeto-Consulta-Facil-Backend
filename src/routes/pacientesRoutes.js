const express = require("express");

const PacientesController =
  require("../controllers/pacientesController");

const router = express.Router();

/**
 * @swagger
 * /pacientes:
 *   get:
 *     summary: Lista pacientes
 *     tags:
 *       - Pacientes
 *     responses:
 *       200:
 *         description: Lista de pacientes
 */

router.get(
  "/",
  PacientesController.listar
);

router.get(
  "/:id",
  PacientesController.buscarPorId);

/**
 * @swagger
 * /pacientes:
 *   post:
 *     summary: Cadastra paciente
 *     tags:
 *       - Pacientes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               cpf:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paciente cadastrado
 */

router.post(
  "/",
  PacientesController.cadastrar
);

router.put(
  "/:id",
  PacientesController.atualizar
);

router.delete(
  "/:id",
  PacientesController.excluir
);

module.exports = router;