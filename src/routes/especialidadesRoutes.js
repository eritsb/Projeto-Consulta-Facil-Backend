const express = require("express");

const EspecialidadesController =
  require(
    "../controllers/especialidadesController"
  );

const router = express.Router();

/**
 * @swagger
 * /especialidades:
 *   get:
 *     summary: Lista todas as especialidades
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

router.get(
  "/:id",
  EspecialidadesController.buscarPorId
);

/**
 * @swagger
 * /especialidades:
 *   post:
 *     summary: Cadastra uma especialidade
 *     tags:
 *       - Especialidades
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *     responses:
 *       201:
 *         description: Especialidade cadastrada com sucesso
 */

router.post(
  "/",
  EspecialidadesController.cadastrar
);

router.put(
  "/:id",
  EspecialidadesController.atualizar
);

router.delete(
  "/:id",
  EspecialidadesController.excluir
);

module.exports = router;