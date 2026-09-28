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

router.get(
  "/:id",
  ClinicasController.buscarPorId
);

/**
 * @swagger
 * /clinicas:
 *   post:
 *     summary: Cadastra uma clínica
 *     tags:
 *       - Clínicas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               cnpj:
 *                 type: string
 *               telefone:
 *                 type: string
 *               email:
 *                 type: string
 *               endereco:
 *                 type: string
 *               horario_funcionamento:
 *                 type: string
 *     responses:
 *       201:
 *         description: Clínica cadastrada com sucesso
 */

router.post(
  "/",
  ClinicasController.cadastrar
);

router.put(
  "/:id",
  ClinicasController.atualizar
);

router.delete(
  "/:id",
  ClinicasController.excluir
);

module.exports = router;