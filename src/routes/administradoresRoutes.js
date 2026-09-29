const express = require("express");

const AdministradoresController =
  require(
    "../controllers/administradoresController"
  );

const autenticacao =
  require("../middlewares/autenticacao");

const autorizarPerfis =
  require(
    "../middlewares/autorizarPerfis"
  );

const router = express.Router();

/**
 * @swagger
 * /administradores:
 *   get:
 *     summary: Lista todos os administradores
 *     description: Retorna os administradores cadastrados. A senha e o hash não são retornados.
 *     tags:
 *       - Administradores
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de administradores retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_administrador:
 *                     type: integer
 *                     example: 1
 *                   nome:
 *                     type: string
 *                     example: Administrador Sistema
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: admin@consultafacil.com
 *                   perfil:
 *                     type: string
 *                     enum:
 *                       - ADMIN
 *                     example: ADMIN
 *                   ativo:
 *                     type: boolean
 *                     example: true
 *                   data_cadastro:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Usuário sem permissão para acessar o recurso
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/",
  autenticacao,
  autorizarPerfis("ADMIN"),
  AdministradoresController.listar
);

/**
 * @swagger
 * /administradores/{id}:
 *   get:
 *     summary: Busca um administrador pelo ID
 *     description: Retorna os dados de um administrador específico.
 *     tags:
 *       - Administradores
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do administrador
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Administrador encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_administrador:
 *                   type: integer
 *                   example: 1
 *                 nome:
 *                   type: string
 *                   example: Administrador Sistema
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: admin@consultafacil.com
 *                 perfil:
 *                   type: string
 *                   enum:
 *                     - ADMIN
 *                   example: ADMIN
 *                 ativo:
 *                   type: boolean
 *                   example: true
 *                 data_cadastro:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: ID do administrador inválido
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Usuário sem permissão para acessar o recurso
 *       404:
 *         description: Administrador não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/:id",
  autenticacao,
  autorizarPerfis("ADMIN"),
  AdministradoresController.buscarPorId
);

/**
 * @swagger
 * /administradores:
 *   post:
 *     summary: Cadastra um administrador
 *     description: Cria um administrador com perfil ADMIN e senha criptografada.
 *     tags:
 *       - Administradores
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Administrador Consulta Fácil
 *               email:
 *                 type: string
 *                 format: email
 *                 example: novo.admin@consultafacil.com
 *               senha:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "Admin@123"
 *               ativo:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Administrador cadastrado com sucesso
 *       400:
 *         description: Dados obrigatórios ausentes ou inválidos
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Usuário sem permissão para cadastrar administradores
 *       409:
 *         description: E-mail já cadastrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  "/",
  autenticacao,
  autorizarPerfis("ADMIN"),
  AdministradoresController.cadastrar
);

/**
 * @swagger
 * /administradores/{id}:
 *   put:
 *     summary: Atualiza um administrador
 *     description: Atualiza nome, e-mail ou situação de um administrador.
 *     tags:
 *       - Administradores
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do administrador
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
 *               nome:
 *                 type: string
 *                 example: Administrador Atualizado
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin.atualizado@consultafacil.com
 *               ativo:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Administrador atualizado com sucesso
 *       400:
 *         description: ID ou dados inválidos
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Usuário sem permissão para atualizar administradores
 *       404:
 *         description: Administrador não encontrado
 *       409:
 *         description: E-mail utilizado por outro administrador
 *       500:
 *         description: Erro interno do servidor
 */
router.put(
  "/:id",
  autenticacao,
  autorizarPerfis("ADMIN"),
  AdministradoresController.atualizar
);

/**
 * @swagger
 * /administradores/{id}:
 *   delete:
 *     summary: Exclui um administrador
 *     description: Remove definitivamente um administrador do sistema.
 *     tags:
 *       - Administradores
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do administrador
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         description: Administrador excluído com sucesso
 *       400:
 *         description: ID do administrador inválido
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Usuário sem permissão para excluir administradores
 *       404:
 *         description: Administrador não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete(
  "/:id",
  autenticacao,
  autorizarPerfis("ADMIN"),
  AdministradoresController.excluir
);

module.exports = router;
