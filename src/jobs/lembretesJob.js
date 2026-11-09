const NotificacoesService = require(
  "../services/notificacoesService"
);

const INTERVALO_MINUTOS = Number(
  process.env.LEMBRETE_INTERVALO_MINUTOS || 60
);

const ANTECEDENCIA_HORAS = Number(
  process.env.LEMBRETE_ANTECEDENCIA_HORAS || 24
);

let intervaloId = null;

async function executar() {
  try {
    const resultado =
      await NotificacoesService.gerarLembretes(
        ANTECEDENCIA_HORAS
      );

    if (resultado.gerados > 0) {
      console.log(
        `Lembretes de consulta gerados: ${resultado.gerados}`
      );
    }

    return resultado;

  } catch (error) {
    console.error(
      "Erro ao gerar lembretes de consulta:",
      error
    );

    return null;
  }
}

function iniciar() {
  if (intervaloId) {
    return;
  }

  if (
    !Number.isFinite(INTERVALO_MINUTOS) ||
    INTERVALO_MINUTOS <= 0
  ) {
    console.error(
      "LEMBRETE_INTERVALO_MINUTOS inválido; job de lembretes não iniciado."
    );

    return;
  }

  executar();

  intervaloId = setInterval(
    executar,
    INTERVALO_MINUTOS * 60 * 1000
  );

  if (typeof intervaloId.unref === "function") {
    intervaloId.unref();
  }

  console.log(
    `Job de lembretes ativo (a cada ${INTERVALO_MINUTOS} min, antecedência de ${ANTECEDENCIA_HORAS}h)`
  );
}

function parar() {
  if (intervaloId) {
    clearInterval(intervaloId);
    intervaloId = null;
  }
}

module.exports = {
  iniciar,
  parar,
  executar
};
