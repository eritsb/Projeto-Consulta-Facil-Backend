const express = require("express");

const TriagensController = require(
  "../controllers/triagensController"
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
 * /triagens/chat:
 *   post:
 *     summary: Conversa com o assistente de triagem
 *     description: |
 *       Recebe uma mensagem em linguagem natural e devolve uma resposta
 *       de orientação, podendo sugerir uma especialidade cadastrada.
 *       Não emite diagnóstico, não recomenda medicamentos e não recomenda
 *       tratamentos.
 *
 *       O histórico é opcional e deve ser enviado como uma lista de
 *       `{ role: "user" | "assistant", content: "..." }`.
 *
 *       Perfis permitidos: PACIENTE.
 *     tags:
 *       - Triagens
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mensagem
 *             properties:
 *               mensagem:
 *                 type: string
 *                 example: Estou com dor de cabeça e febre há três dias.
 *               historico:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: Resposta do assistente retornada com sucesso
 *       400:
 *         description: Mensagem não informada
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Usuário sem permissão para esta operação
 *       404:
 *         description: Paciente não encontrado
 *       500:
 *         description: Erro interno do servidor ou chave da IA não configurada
 *       502:
 *         description: Falha ao consultar o serviço de IA
 */
router.post(
  "/chat",
  autenticacao,
  autorizarPerfis("PACIENTE"),
  TriagensController.conversar
);

/**
 * @swagger
 * /triagens:
 *   post:
 *     summary: Cadastra uma triagem com análise de IA
 *     description: |
 *       Único fluxo de criação de triagem: valida os dados, envia os
 *       sintomas para a IA (Groq) e, se a análise for concluída, cria a
 *       triagem e grava a especialidade sugerida na tabela
 *       `recomendacoes`. Se a IA falhar, nada é salvo; se a gravação da
 *       recomendação falhar, a triagem criada é descartada.
 *
 *       A resposta inclui `id_triagem`, que pode ser enviado como
 *       `id_triagem` em `POST /agendamentos`, e os dados da recomendação
 *       (`id_recomendacao`, `id_especialidade`, `especialidade`,
 *       `confianca`, `justificativa`).
 *
 *       `faixa_etaria` é obrigatório apenas para a chamada da IA e não é
 *       armazenado no banco.
 *
 *       Não emite diagnóstico, não recomenda medicamentos e não
 *       recomenda tratamentos.
 *
 *       Perfis permitidos: PACIENTE.
 *     tags:
 *       - Triagens
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sintomas
 *               - localizacao
 *               - duracao_sintomas
 *               - intensidade
 *               - faixa_etaria
 *             properties:
 *               sintomas:
 *                 oneOf:
 *                   - type: array
 *                     items:
 *                       type: string
 *                     example: ["dor de cabeça", "febre"]
 *                   - type: string
 *                     example: dor de cabeça, febre
 *               localizacao:
 *                 type: string
 *                 example: cabeça
 *               duracao_sintomas:
 *                 type: string
 *                 example: 3 dias
 *               intensidade:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               faixa_etaria:
 *                 type: string
 *                 example: 30-39 anos
 *               observacoes:
 *                 type: string
 *                 nullable: true
 *                 example: Piora à noite
 *     responses:
 *       201:
 *         description: Triagem e recomendação salvas com sucesso
 *       400:
 *         description: Dados inválidos ou incompletos
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Usuário sem permissão para esta operação
 *       404:
 *         description: Paciente não encontrado
 *       422:
 *         description: Sem especialidades ativas ou resposta inválida da IA
 *       500:
 *         description: Erro interno do servidor ou chave da IA não configurada
 *       502:
 *         description: Falha ao consultar o serviço de IA
 */
router.post(
  "/",
  autenticacao,
  autorizarPerfis("PACIENTE"),
  TriagensController.cadastrar
);

/**
 * @swagger
 * /triagens/me:
 *   get:
 *     summary: Lista as triagens do paciente autenticado
 *     description: |
 *       Retorna o histórico de triagens do paciente autenticado,
 *       ordenado da mais recente para a mais antiga.
 *
 *       Perfis permitidos: PACIENTE.
 *     tags:
 *       - Triagens
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Histórico retornado com sucesso
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
  TriagensController.buscarMinhasTriagens
);

/**
 * @swagger
 * /triagens:
 *   get:
 *     summary: Lista todas as triagens
 *     description: |
 *       Retorna todas as triagens com o nome do paciente,
 *       ordenadas da mais recente para a mais antiga.
 *
 *       Perfis permitidos: ADMIN.
 *     tags:
 *       - Triagens
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de triagens retornada com sucesso
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
  autorizarPerfis("ADMIN"),
  TriagensController.listarTodos
);

/**
 * @swagger
 * /triagens/{id}:
 *   get:
 *     summary: Busca uma triagem pelo ID
 *     description: |
 *       Retorna uma triagem com o nome do paciente. O paciente só pode
 *       consultar as próprias triagens; o administrador pode consultar
 *       qualquer uma.
 *
 *       Perfis permitidos: PACIENTE e ADMIN.
 *     tags:
 *       - Triagens
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da triagem
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Triagem encontrada
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Triagem pertence a outro paciente
 *       404:
 *         description: Triagem não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/:id",
  autenticacao,
  autorizarPerfis("PACIENTE", "ADMIN"),
  TriagensController.buscarPorId
);

/**
 * @swagger
 * /triagens/{id}:
 *   put:
 *     summary: Atualiza uma triagem
 *     description: |
 *       Atualiza os dados de uma triagem do paciente autenticado.
 *       Campos não enviados mantêm o valor atual.
 *
 *       Perfis permitidos: PACIENTE (somente o dono da triagem).
 *     tags:
 *       - Triagens
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da triagem
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
 *               sintomas:
 *                 oneOf:
 *                   - type: array
 *                     items:
 *                       type: string
 *                     example: ["dor de cabeça", "febre"]
 *                   - type: string
 *                     example: dor de cabeça, febre
 *               localizacao:
 *                 type: string
 *                 example: cabeça
 *               duracao_sintomas:
 *                 type: string
 *                 example: 5 dias
 *               intensidade:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 3
 *               observacoes:
 *                 type: string
 *                 nullable: true
 *                 example: Melhorou pela manhã
 *     responses:
 *       200:
 *         description: Triagem atualizada com sucesso
 *       400:
 *         description: Dados inválidos ou incompletos
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Triagem pertence a outro paciente
 *       404:
 *         description: Triagem não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.put(
  "/:id",
  autenticacao,
  autorizarPerfis("PACIENTE"),
  TriagensController.atualizar
);

/**
 * @swagger
 * /triagens/{id}:
 *   delete:
 *     summary: Exclui uma triagem
 *     description: |
 *       Remove uma triagem do paciente autenticado.
 *
 *       Perfis permitidos: PACIENTE (somente o dono da triagem).
 *     tags:
 *       - Triagens
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da triagem
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Triagem excluída com sucesso
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Triagem pertence a outro paciente
 *       404:
 *         description: Triagem não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete(
  "/:id",
  autenticacao,
  autorizarPerfis("PACIENTE"),
  TriagensController.excluir
);


module.exports = router;
