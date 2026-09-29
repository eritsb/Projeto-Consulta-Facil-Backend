
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const swaggerUi =
  require("swagger-ui-express");

const swaggerSpec =
  require("./swagger");

const pacientesRoutes =
  require("./routes/pacientesRoutes");

const especialidadesRoutes =
  require("./routes/especialidadesRoutes");

const clinicasRoutes =
  require("./routes/clinicasRoutes");

const profissionaisRoutes =
  require("./routes/profissionaisRoutes");

const disponibilidadesRoutes =
  require("./routes/disponibilidadesRoutes");

const agendamentosRoutes =
  require("./routes/agendamentosRoutes");

const authRoutes =
  require("./routes/authRoutes");

const app = express();

app.use(helmet());

app.use(morgan("dev"));

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    mensagem:
      "API Consulta Fácil funcionando"
  });
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.use(
  "/auth",
  authRoutes
);

app.use(
  "/pacientes",
  pacientesRoutes
);

app.use(
  "/especialidades",
  especialidadesRoutes
);

app.use(
  "/clinicas",
  clinicasRoutes
);

app.use(
  "/profissionais",
  profissionaisRoutes
);

app.use(
  "/disponibilidades",
  disponibilidadesRoutes
);

app.use(
  "/agendamentos",
  agendamentosRoutes
);

app.use((req, res) => {
  return res.status(404).json({
    erro: "Rota não encontrada"
  });
});

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Servidor rodando em http://localhost:${PORT}`
  );
});