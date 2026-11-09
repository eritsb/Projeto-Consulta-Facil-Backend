/*
  Base dos testes unitarios.

  node --test roda cada * .test.js em um processo isolado,
  entao isso roda antes de qualquer modelo ser importado:

    1) variaveis "fake" para os modulos que validam env
       no import (config/database.js exige DATABASE_URL);
       os metodos dos models sao substituidos por stubs,
       entao nehuma conexao real acontece.

    2) helper patchar() troca um metodo estatico de um
       modelo/service pelo stub e devolve a funcao de
       restauracao (usada nos hooks after).
*/

process.env.DATABASE_URL ||=
  "postgresql://testes:testes@localhost:5432/testes";

process.env.JWT_SECRET ||=
  "chave-secreta-dos-testes-unitarios";

process.env.GROQ_API_KEY ||=
  "chave-fake-dos-testes-unitarios";


function patchar(alvo, metodo, implementacao) {
  const original = alvo[metodo];

  alvo[metodo] = implementacao;

  return function restaurar() {
    alvo[metodo] = original;
  };
}

module.exports = { patchar };
