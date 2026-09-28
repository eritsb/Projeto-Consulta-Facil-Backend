const express =
 require("express");

const router =
 express.Router();

const ProfissionaisController =
 require(
 "../controllers/profissionaisController"
 );

/**
 * @swagger
 * /profissionais:
 *   get:
 *     summary: Lista profissionais
 *     tags:
 *       - Profissionais
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *       - in: query
 *         name: clinica
 *         schema:
 *           type: integer
 *       - in: query
 *         name: especialidade
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de profissionais
 */

router.get(
 "/",
 ProfissionaisController.listar
);

router.get(
 "/:id",
 ProfissionaisController.buscarPorId
);

/**
 * @swagger
 * /profissionais:
 *   post:
 *     summary: Cadastra um profissional
 *     tags:
 *       - Profissionais
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_clinica:
 *                 type: integer
 *               id_especialidade:
 *                 type: integer
 *               nome:
 *                 type: string
 *               cpf:
 *                 type: string
 *               registro_profissional:
 *                 type: string
 *               conselho:
 *                 type: string
 *               telefone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Profissional cadastrado com sucesso
 */

router.post(
 "/",
 ProfissionaisController.cadastrar
);

router.put(
 "/:id",
 ProfissionaisController.atualizar
);

router.delete(
 "/:id",
 ProfissionaisController.excluir
);

module.exports = router;