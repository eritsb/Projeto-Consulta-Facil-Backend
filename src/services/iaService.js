const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

class IaService {

  static criarErro(mensagem, statusCode) {
    const erro = new Error(mensagem);

    erro.statusCode = statusCode;

    return erro;
  }


  static async analisarTriagem({
    sintomas,
    localizacao,
    duracao_sintomas,
    intensidade,
    faixa_etaria,
    observacoes,
    especialidades_disponiveis
  }) {

    if (!process.env.GROQ_API_KEY) {
      throw this.criarErro(
        "GROQ_API_KEY não configurada.",
        500
      );
    }

    if (
      !Array.isArray(especialidades_disponiveis) ||
      especialidades_disponiveis.length === 0
    ) {
      throw this.criarErro(
        "Não existem especialidades cadastradas.",
        422
      );
    }

    const prompt = `
Realize uma orientação de pré-triagem.

DADOS:
Sintomas: ${sintomas}
Localização: ${localizacao}
Duração: ${duracao_sintomas}
Intensidade: ${intensidade} de 5
Faixa etária: ${faixa_etaria}
Informações adicionais:
${observacoes || "Não informado"}

ESPECIALIDADES DISPONÍVEIS:
${especialidades_disponiveis.join(", ")}

REGRAS:

- Escolha somente uma especialidade da lista.
- Não forneça diagnóstico.
- Não determine doenças.
- Não recomende medicamentos.
- Não recomende tratamentos.
- Produza apenas orientação para procura de profissional.
- Confiança deve ficar entre 0 e 100.

Retorne SOMENTE:

{
  "especialidade": "nome",
  "confianca": 90,
  "justificativa": "texto curto"
}
`;

    try {

      const resposta =
        await groq.chat.completions.create({

          model:
            process.env.GROQ_MODEL ||
            "llama-3.3-70b-versatile",

          temperature: 0.1,

          response_format: {
            type: "json_object"
          },

          messages: [
            {
              role: "system",

              content: `
Você é o assistente de pré-triagem
do sistema Consulta Fácil.

Sua função é apenas orientar qual
especialidade cadastrada pode ser
adequada para avaliação profissional.

Não forneça diagnósticos médicos.
Responda somente em JSON.
`
            },

            {
              role: "user",
              content: prompt
            }
          ]
        });


      const conteudo =
        resposta.choices?.[0]?.message?.content;

      if (!conteudo) {
        throw this.criarErro(
          "A IA não retornou resposta.",
          502
        );
      }


      let resultado;

      try {

        resultado = JSON.parse(conteudo);

      } catch {

        throw this.criarErro(
          "Resposta da IA em formato inválido.",
          502
        );

      }


      const especialidadeEncontrada =
        especialidades_disponiveis.find(

          nome =>
            nome.toLowerCase().trim() ===
            String(
              resultado.especialidade
            ).toLowerCase().trim()

        );


      if (!especialidadeEncontrada) {

        throw this.criarErro(
          "A IA retornou uma especialidade não cadastrada.",
          422
        );

      }


      const confianca =
        Number(resultado.confianca);


      if (
        !Number.isFinite(confianca) ||
        confianca < 0 ||
        confianca > 100
      ) {

        throw this.criarErro(
          "Confiança retornada pela IA é inválida.",
          502
        );

      }


      return {

        especialidade:
          especialidadeEncontrada,

        confianca,

        justificativa:
          String(
            resultado.justificativa || ""
          ).trim()

      };

    } catch (error) {

      if (error.statusCode) {
        throw error;
      }

      console.error(
        "Erro Groq:",
        error
      );

      throw this.criarErro(
        "Não foi possível analisar a triagem.",
        502
      );

    }
  }
  static normalizarHistorico(historico) {
    if (!Array.isArray(historico)) {
      return [];
    }

    const mensagens = [];

    for (const item of historico) {
      if (!item || typeof item !== "object") {
        continue;
      }

      if (item.role && item.content) {
        const role =
          item.role === "assistant"
            ? "assistant"
            : "user";

        const content =
          String(item.content).trim();

        if (content) {
          mensagens.push({ role, content });
        }

        continue;
      }

      if (item.mensagem) {
        const content =
          String(item.mensagem).trim();

        if (content) {
          mensagens.push({
            role: "user",
            content
          });
        }
      }

      if (item.resposta) {
        const content =
          String(item.resposta).trim();

        if (content) {
          mensagens.push({
            role: "assistant",
            content
          });
        }
      }
    }

    return mensagens.slice(-20);
  }


  static async conversar({
    mensagem,
    historico,
    especialidades_disponiveis
  }) {

    if (!process.env.GROQ_API_KEY) {
      throw this.criarErro(
        "GROQ_API_KEY não configurada.",
        500
      );
    }

    const texto =
      mensagem ? String(mensagem).trim() : "";

    if (!texto) {
      throw this.criarErro(
        "Informe a mensagem.",
        400
      );
    }

    const especialidades =
      Array.isArray(especialidades_disponiveis)
        ? especialidades_disponiveis
        : [];

    const listaEspecialidades =
      especialidades.length > 0
        ? especialidades.join(", ")
        : "Nenhuma especialidade cadastrada";

    const prompt = `
CONVERSA ATUAL:
${texto}

ESPECIALIDADES DISPONÍVEIS:
${listaEspecialidades}

REGRAS:

- Converse em português, de forma breve e acolhedora.
- Oriente o paciente sobre qual tipo de profissional procurar.
- Se identificar uma especialidade da lista que faça sentido, retorne o nome exato.
- Se não houver especialidade adequada na lista, retorne null.
- Não forneça diagnóstico.
- Não determine doenças.
- Não recomende medicamentos.
- Não recomende tratamentos.
- Em caso de sinais de emergência, recomende procurar atendimento imediato.
- Confiança deve ficar entre 0 e 100.

Retorne SOMENTE:

{
  "resposta": "texto da resposta",
  "especialidade": "nome" ou null,
  "confianca": 90,
  "justificativa": "texto curto"
}
`;

    try {

      const resposta =
        await groq.chat.completions.create({

          model:
            process.env.GROQ_MODEL ||
            "llama-3.3-70b-versatile",

          temperature: 0.2,

          response_format: {
            type: "json_object"
          },

          messages: [
            {
              role: "system",

              content: `
Você é o assistente de orientação do
sistema Consulta Fácil.

Sua função é conversar com o paciente,
entender os sintomas relatados e orientar
qual especialidade cadastrada pode ser
adequada para avaliação profissional.

Não forneça diagnósticos médicos.
Não recomende medicamentos nem tratamentos.
Responda somente em JSON.
`
            },

            ...this.normalizarHistorico(
              historico
            ),

            {
              role: "user",
              content: prompt
            }
          ]
        });


      const conteudo =
        resposta.choices?.[0]?.message?.content;

      if (!conteudo) {
        throw this.criarErro(
          "A IA não retornou resposta.",
          502
        );
      }


      let resultado;

      try {

        resultado = JSON.parse(conteudo);

      } catch {

        throw this.criarErro(
          "Resposta da IA em formato inválido.",
          502
        );

      }


      const textoResposta =
        String(
          resultado.resposta || ""
        ).trim();

      if (!textoResposta) {
        throw this.criarErro(
          "A IA não retornou uma resposta válida.",
          502
        );
      }


      let especialidade = null;

      if (resultado.especialidade) {

        const encontrada =
          especialidades.find(
            (nome) =>
              String(nome).toLowerCase().trim() ===
              String(
                resultado.especialidade
              ).toLowerCase().trim()
          );

        especialidade = encontrada || null;

      }


      let confianca =
        Number(resultado.confianca);

      if (
        !Number.isFinite(confianca) ||
        confianca < 0 ||
        confianca > 100
      ) {
        confianca = 0;
      }


      return {

        resposta: textoResposta,

        especialidade,

        confianca,

        justificativa:
          String(
            resultado.justificativa || ""
          ).trim()

      };

    } catch (error) {

      if (error.statusCode) {
        throw error;
      }

      console.error(
        "Erro Groq (chat):",
        error
      );

      throw this.criarErro(
        "Não foi possível conversar com o assistente.",
        502
      );

    }
  }
}

module.exports = IaService;