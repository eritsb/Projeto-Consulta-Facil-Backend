# Relatório da 2ª Entrega — Backend do Projeto Consulta Fácil

**Projeto:** API REST do Consulta Fácil (Node.js + Express + PostgreSQL/Neon + IA Groq)
**Deploy em produção:** https://projeto-consulta-facil-backend.onrender.com
**Swagger:** https://projeto-consulta-facil-backend.onrender.com/api-docs/
**Repositório:** `eritsb/Projeto-Consulta-Facil-Backend` (branch `main`)

Este documento resume **o que foi alterado, por quê e como funciona**, com foco nos três temas da entrega: **Triagem com IA, Notificações/Lembretes e (Re)Agendamento**. Ao final, um anexo com perguntas prováveis e respostas.

---

## 1. Resumo geral da entrega

A 2ª entrega adicionou inteligência artificial e automação ao back-end da 1ª entrega:

| Funcionalidade nova | O que faz |
|---|---|
| **Triagem com IA** (`POST /triagens`) | Paciente descreve sintomas → IA sugere uma especialidade cadastrada → grava em `triagens` + `recomendacoes` → notifica o paciente |
| **Chatbot** (`POST /triagens/chat`) | Conversa em português com IA que orienta qual especialidade procurar |
| **Transcrição de áudio** (`POST /audio/transcrever`) | Paciente **fala** o que sente → Whisper transcreve → o texto pode ir direto para a triagem |
| **Reagendamento** (`PATCH /agendamentos/:id/reagendar`) | Paciente muda o horário; reserva nova → atualiza → libera antiga, tudo numa única instrução SQL |
| **Confirmação com notificação dedicada** | `PUT /agendamentos/:id` com status CONFIRMADO gera `AGENDAMENTO_CONFIRMADO` |
| **Lembretes automáticos** (job interno) | Consultas nas próximas 24h geram `LEMBRETE_CONSULTA`; roda a cada 60 min |
| **Testes unitários + CI** | `npm test` (54 testes) e pipeline no GitHub Actions |

**Volume:** commit `f7e6312` — 31 arquivos alterados/criados, ~4.858 linhas adicionadas.

---

## 2. Tema 1 — Triagem com IA (Groq)

### 2.1 O fluxo completo (uma única entrada de dados)

Unificamos a criação de triagem em **um único endpoint**. Antes existia a intenção de criar triagem em uma rota e vincular em outra; agora:

```
POST /triagens (com token de PACIENTE)
   1. Valida os dados (sintomas, localização, duração, intensidade 1–5, faixa etária)
   2. Busca no banco as ESPECIALIDADES ATIVAS
   3. Chama a IA (Groq) — ANTES de qualquer INSERT
   4. Valida a resposta da IA contra a lista do banco
   5. INSERT em triagens
   6. INSERT em recomendacoes (especialidade + confiança + justificativa)
   7. Notificação PRE_TRIAGEM_IA para o paciente
   8. Retorna a triagem completa
```

**Regra de ouro: se a IA falhar, NADA é salvo.** A chamada à IA acontece antes de qualquer `INSERT` — se ela retorna 502 (fora do ar, resposta quebrada) ou 422 (especialidade inválida), o banco fica intocado. Testamos exatamente isso nos unitários.

### 2.2 Como a IA está configurada

| Configuração | Valor | Por quê |
|---|---|---|
| Provedor | Groq (SDK `groq-sdk`) | Inferência rápida e com camada gratuita |
| Modelo | `openai/gpt-oss-120b` (env `GROQ_MODEL`) | O antigo (`llama-3.3-70b-versatile`) foi **descontinuado** para nossa chave — as chamadas passaram a dar `model_not_found`. Trocamos por um modelo atual disponível |
| Formato de resposta | `response_format: json_object` (JSON mode) | Força a IA a responder **somente JSON**, que o back-end consegue interpretar com segurança |
| Temperatura | `0.1` na triagem / `0.2` no chat | Quase determinístico: respostas estáveis em triagem médica |
| Transcrição | `whisper-large-v3-turbo`, idioma `pt` | Transcreve o áudio do paciente em texto |

### 2.3 Guardas de segurança contra "a IA inventar"

A IA nunca é fonte de verdade — sempre validada contra o banco:

1. O **prompt** só recebe as especialidades **ativas** cadastradas e instrui: *"Escolha somente uma especialidade da lista. Não forneça diagnóstico. Não determine doenças. Não recomende medicamentos nem tratamentos."*
2. Mesmo assim, o **service revalida**: se a IA devolver um nome que não existe na lista (case-insensitive), responde **422** e nada é gravado.
3. `confiança` fora de 0–100 → **502**.
4. Resposta que não é JSON parseável → **502**.

### 2.4 Transcrição de áudio (o paciente "fala" em vez de digitar)

`POST /audio/transcrever` recebe um formulário multipart com o campo `audio`:

- `multer` limita a **25 MB** e aceita mp3/wav/m4a/ogg/webm; o formato inválido dá **400** antes de gastar crédito de API;
- a transcrição usa **Whisper** com idioma fixo em português;
- o arquivo temporário é **sempre apagado** no `finally` do controller;
- o texto transcrito pode ir direto ao `POST /triagens` — no teste real, um áudio de TTS falando sintomas foi transcrito em **0,8 s** e a IA respondeu **Neurologia**.

### 2.5 Voz x triagem (resumo do ciclo)

```
[app] paciente fala → /audio/transcrever → { texto }
      paciente (ou o app) → POST /triagens com o texto → IA responde especialidade
      sem áudio? digita normalmente no formulário
      dúvida livre? → POST /triagens/chat (IA conversa; a conversa não é persistida)
```

---

## 3. Tema 2 — Notificações e Lembretes

### 3.1 Tipos de notificação (todos gerados pelo próprio back-end)

| Tipo | Quando é gerado |
|---|---|
| `AGENDAMENTO_CRIADO` | Consulta agendada com sucesso |
| `AGENDAMENTO_CONFIRMADO` | Paciente confirma (status muda para CONFIRMADO) |
| `AGENDAMENTO_ATUALIZADO` | Qualquer outra alteração (ex.: observação) |
| `AGENDAMENTO_REAGENDADO` | Reagendamento concluído (com horário antigo → novo) |
| `AGENDAMENTO_CANCELADO` | Cancelamento |
| `AGENDAMENTO_EXCLUIDO` | Agendamento excluído |
| `PRE_TRIAGEM_IA` | IA conclui a triagem (com especialidade sugerida e confiança) |
| `LEMBRETE_CONSULTA` | Job de lembretes acha consulta nas próximas 24h |

### 3.2 Propriedades importantes

- **Notificação nunca derruba o fluxo principal:** `notificar()` captura falha do banco (degradação) e devolve `null` — o agendamento continua salvo mesmo se a notificação falhar. Testado nos unitários.
- **Gestão pelo paciente:** `PATCH /notificacoes/:id/lida` (uma), `PATCH /notificacoes/lidas` (todas), `DELETE /notificacoes/:id`.
- **Isolamento:** cada paciente só vê/manipula as notificações dele (token + `id_paciente`).

### 3.3 Job de lembretes (`src/jobs/lembretesJob.js`)

- Roda **dentro do processo do servidor** (`setInterval`), a cada `LEMBRETE_INTERVALO_MINUTOS` (60 min) — não precisamos de serviço externo (cron/queue).
- A cada execução chama `gerarLembretes(24)`:
  - SQL pega agendamentos `AGENDADO`/`CONFIRMADO` cuja `data_consulta + hora_consulta` esteja entre **agora** e **agora + 24h** (`LOCALTIMESTAMP` + `make_interval`);
  - para cada um, verifica com `NOT EXISTS` (**`lembreteExiste`**) se já existe `LEMBRETE_CONSULTA` para aquele agendamento → **idempotência**: rodar o job quantas vezes for, um agendamento gera só um lembrete. Teste real: 1ª execução gera 1; 2ª execução → `gerados: 0, ignorados: 1`.
- `intervalo.unref()` permite o servidor encerrar sem travar no timer.
- **Configuração por variáveis de ambiente** (defaults 60 min / 24h), sem redeploy para mudar a política.
- Nota sobre o plano gratuito do Render: sem tráfego o serviço dorme e o job pausa; ao acordar, a próxima execução gera os pendentes da janela — por causa da idempotência não há risco de duplicar.

---

## 4. Tema 3 — Agendamento, Confirmação e Reagendamento

### 4.1 Vínculo triagem → agendamento

`POST /agendamentos` recebe `id_triagem` opcional:

- a triagem deve **pertencer ao paciente logado** (`403` caso contrário) e **não pode estar vinculada** a outro agendamento (`409`);
- o slot deve estar `DISPONIVEL` (`409` caso contrário) e pertencer ao profissional informado (`400`);
- a reserva é um `UPDATE ... WHERE status = 'DISPONIVEL' ... RETURNING` em tempo real: **numa corrida de dois pacientes no mesmo horário, só um ganha** — o segundo recebe `409 "O horário acabou de ser reservado por outra pessoa"`.

### 4.2 Confirmação x atualização

`PUT /agendamentos/:id` — quando o status muda para `CONFIRMADO`, a notificação é `AGENDAMENTO_CONFIRMADO` (título "Consulta confirmada"); qualquer outra mudança (ex.: só observação) é `AGENDAMENTO_ATUALIZADO`. Status mudar para `CANCELADO` delega para o fluxo de cancelamento, com seu tipo próprio.

### 4.3 Reagendamento atômico (`PATCH /agendamentos/:id/reagendar`)

**Regras de negócio:** só o **paciente dono**; agendamento `CANCELADO`/`REALIZADO` → 409; novo horário igual ao atual → 409 com mensagem específica; conflito de horário do próprio paciente → 409.

**Como garantimos atomicidade — 3 operações em 1 statement SQL (CTE):**

```sql
WITH nova AS (               -- 1) reserva o slot novo
  UPDATE disponibilidades SET status = 'RESERVADO'
  WHERE id_disponibilidade = $nova AND status = 'DISPONIVEL'
  RETURNING id_disponibilidade
),
atualiza AS (                -- 2) move o agendamento (só se reservou)
  UPDATE agendamentos SET id_disponibilidade = $nova, data/hora...
  WHERE id_agendamento = $ag AND id_paciente = $paciente
    AND id_disponibilidade = $antiga AND status NOT IN ('CANCELADO','REALIZADO')
  RETURNING agendamentos.id_agendamento, agendamentos.id_disponibilidade
),
libera AS (                  -- 3) libera o slot antigo, se moveu
  UPDATE disponibilidades SET status = 'DISPONIVEL'
  WHERE id_disponibilidade = (SELECT id_disponibilidade FROM atualiza) + cláusula de segurança
)
SELECT * FROM atualiza;      -- vazio ⇒ 409, sem mexer em nada
```

Como as três partes são **uma só instrução PostgreSQL**, se qualquer passo falhar (slot já reservado, status proibido, dono errado) **nada é aplicado** — atomicidade garantida pelo banco, sem orquestração em JavaScript.

**Decisão técnica:** o driver HTTP do Neon **não aceita** `sql.transaction` com callback (apenas array de queries independentes — incompatível com etapas dependentes). Substituímos por esse CTE único, validado antes em tabelas temporárias e com `BEGIN`/`ROLLBACK`.

**Detalhe fino:** em `UPDATE ... FROM`, o `RETURNING` de colunas de mesmo nome em duas tabelas precisa ser **qualificado** (`agendamentos.id_disponibilidade`) — erro `42702 (ambiguous)`, corrigido.

### 4.4 Problemas encontrados e soluções

| Problema | Solução |
|---|---|
| `model_not_found`: o modelo Groq antigo deixou de existir na nossa chave | Migrado para `openai/gpt-oss-120b`, fixado no `.env`/Render, e atualizado no `.env.example` |
| Reagendamento em 3 passos precisava ser atômico; driver do Neon não aceita transação com callback | CTE único com `RETURNING` qualificado; validado com `BEGIN/ROLLBACK` real |
| ID do banco (bigint) vinha como **string** do driver e quebrava comparações `===` | Normalização com `Number()` antes de comparar |
| IA podia sugerir especialidade inexistente/inativa | Guarda dupla: só lista ativa no prompt + revalidação no código (422) |
| `/api-docs/swagger.json` no smoke test do deploy devolvia HTML | Não é bug: na v5 do `swagger-ui-express` o JSON vai **embutido** na UI (`/api-docs/swagger-ui-init.js`); verificação corrigida |

---

## 5. Validação da entrega (números)

| Rodada | Escopo | Resultado |
|---|---|---|
| E2E Fase 1 (local, banco+IA reais) | Triagem+recomendação, agendamento+vínculo, reagendamento (ok/409 ocupado/409 cancelado), confirmação, atualização, cancelamento, exclusão, todos os tipos de notificação, negativos 401/404/409 | **42 PASS / 0 FAIL** |
| E2E Fase 2 (local) | Chatbot real, duplicado 409, login errado 401, conflito entre dois pacientes, triagem alheia 403 sem reservar, isolamento entre contas, lidas/excluir notificações, lembretes com idempotência | **43 PASS / 0 FAIL** |
| Smoke no Render (produção) | Mesmo ciclo completo contra o deploy, IA real, slots alternando, banco sem sobras | **29 PASS / 0 FAIL** |
| E2E da transcrição | Áudio real (voz) → Whisper → texto com sintomas → IA responde | **8 PASS / 0 FAIL** |
| Unitários (`npm test`) | 5 arquivos, stubs nos models, `bcrypt`/`jwt` reais | **54 PASS / 0 FAIL** (~4 s) |
| CI (GitHub Actions) | `npm ci` + `node --check` (51 arquivos) + `npm test` | **success** no primeiro push |

---

## 6. Infraestrutura e variáveis de ambiente

| Variável | Papel |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL (sslmode=require) — banco igual local e produção |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Tokens (HS256, 8h), perfis PACIENTE/PROFISSIONAL/ADMIN |
| `GROQ_API_KEY` | Chave Groq (triagem, chat e Whisper) |
| `GROQ_MODEL` | `openai/gpt-oss-120b` — **crítico** (fallback antigo está descontinuado) |
| `GROQ_WHISPER_MODEL` | `whisper-large-v3-turbo` |
| `LEMBRETE_INTERVALO_MINUTOS` / `LEMBRETE_ANTECEDENCIA_HORAS` | Política do job de lembretes (60/24) |

**Pipeline:** push em `main` → Render faz build automático (`npm ci`, `npm start`) → API na porta do Render.

---

## 7. Histórico (commits relevantes)

| Commit | Conteúdo |
|---|---|
| `f7e6312` | Funcionalidades da 2ª entrega (31 arquivos) |
| `7ca259a` | Correção da URL de produção na documentação |
| `94b97f8` | Suite unitária + CI |

---

## Anexo A — Perguntas prováveis do professor (com resposta)

**1. "Onde está a IA e qual modelo você usou?"**
Groq como provedor; na triagem e no chat usamos `openai/gpt-oss-120b` com JSON mode; na transcrição, `whisper-large-v3-turbo` em português. Modelos configurados por variável de ambiente.

**2. "O que acontece se a IA estiver fora do ar?"**
O `POST /triagens` responde **502** e **nada é salvo** — a chamada IA acontece antes de qualquer INSERT. O paciente pode tentar de novo; o banco nunca fica com dado parcial.

**3. "E se a IA devolver uma especialidade que não existe?"**
Duas defesas: o prompt só recebe a lista de especialidades **ativas** do banco, e o código revalida case-insensitive; se divergir → **422** e nada persiste.

**4. "Por que salvar em duas tabelas (`triagens` e `recomendacoes`)?"**
A `triagens` guarda o relato (dados do paciente); a `recomendacoes` guarda o **resultado da IA** (especialidade sugerida, confiança, justificativa). Assim o modelo de dados separa entrada de saída, e a recomendação tem FK para a triagem e para a especialidade.

**5. "Como você impede a IA de prescrever coisa médica?"**
Guardas no prompt (sem diagnóstico/droga/tratamento, só orientação de especialidade) e regra de negócio: a resposta da IA só é usada para recomendar especialidade já cadastrada.

**6. "Como funciona o chatbot? Ele guarda o histórico?"**
`POST /triagens/chat`. O **cliente** envia `mensagem` + `historico`; o back-end normaliza o histórico (últimas 20 mensagens, papel user/assistant) e encaminha para a IA. No próprio endpoint não persistimos conversa — a "memória" vem do cliente (o app envia o histórico).

**7. "Como o lembrete é enviado? E se rodar duas vezes?"**
Job interno `setInterval` (60 min) chama `gerarLembretes(24)`, que busca consultas nas próximas 24h e gera `LEMBRETE_CONSULTA`. Idempotência por `NOT EXISTS`: um agendamento jamais gera dois lembretes.

**8. "E se o servidor do Render estiver dormindo (plano grátis)?"**
O job pausa junto com o processo; quando o serviço acorda, a próxima execução cobre a janela de 24h — e não duplica, por causa da checagem.

**9. "Por que o reagendamento usa um SQL tão grande (CTE)?"**
São 3 operações dependentes (reserva nova → move agendamento → libera antiga). Com driver do Neon só dava "transação" em array sem dependência entre queries. Transformamos tudo em **uma** instrução com CTEs: se qualquer parte falha, nada é aplicado. Atomicidade nativa do PostgreSQL.

**10. "Dois pacientes podem agendar o mesmo horário?"**
Não. A reserva é feita por `UPDATE ... WHERE status = 'DISPONIVEL' ... RETURNING` — se alguém chegar primeiro, o segundo recebe 409 ("acabou de ser reservado"). Testamos o caso com dois pacientes de verdade.

**11. "Quais status um agendamento pode ter e o que bloqueia?"**
`AGENDADO → CONFIRMADO → REALIZADO`, com `CANCELADO` possível até ser realizado. Agendamento `CANCELADO` não pode ser alterado nem reagendado (409); `REALIZADO` também não. Reagendar para o MESMO horário → 409 com mensagem específica.

**12. "Confirmação e atualização geram notificações diferentes?"**
Sim: muda status para CONFIRMADO → `AGENDAMENTO_CONFIRMADO`; qualquer outra alteração → `AGENDAMENTO_ATUALIZADO`.

**13. "Notificação falha, o fluxo para?"**
Não. O gerenciador de notificações captura a falha (degradação silenciosa) — o agendamento/triagem permanece salvo. Prioridade: dado de negócio > notificação.

**14. "Como você valida tudo isso?"**
Três níveis: **unitários** (54 testes, `npm test`, stubs no banco/IA, CI no GitHub Actions), **E2E reais** (banco Neon + Groq verdadeiros, dezenas de checks cobrindo inclusive os códigos de erro 401/403/404/409, concorrência e idempotência) e **smoke em produção** no Render.

**15. "Segurança?"**
JWT bearer com perfis; autorizações por perfil nas rotas; checagens de "dono" no service (`403` quando o paciente tenta usar dados de outro); `bcrypt` no hash de senha; `helmet` e validação de entrada; upload limitado a 25 MB e com whitelist de formatos.

---

## Anexo B — Roteiro rápido para demonstrar (Swagger UI)

1. `POST /pacientes` (se ainda não tiver cadastro) → `POST /auth/login` → copiar o `token`.
2. Clicar em **Authorize** (botão no canto direito) e colar o token.
3. `POST /triagens` com sintomas → ver `id_triagem`, especialidade e confiança; conferir em `GET /notificacoes` o tipo `PRE_TRIAGEM_IA`.
4. `POST /agendamentos` num slot DISPONIVEL (com o `id_triagem` de cima) → `PATCH /agendamentos/{id}/reagendar` com outro slot → mensagem com horário novo; tentar reagendar para o MESMO slot → 409 específico.
5. `PUT /agendamentos/{id}` `{ "status": "CONFIRMADO" }` → notificação de confirmação.
6. `POST /triagens/chat` `{ "mensagem": "Tenho manchas na pele que coçam, procuro qual especialidade?" }`.
7. `POST /audio/transcrever` (precisa de arquivo: pelo app ou `curl -F "audio=@sintoma.wav"`).
