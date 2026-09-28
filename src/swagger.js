const swaggerJsdoc =
  require("swagger-jsdoc");

const options = {
  failOnErrors: true,

  definition: {
    openapi: "3.0.0",

    info: {
      title: "API Consulta Fácil",
      version: "1.0.0",
      description:
        "Documentação da API REST do projeto Consulta Fácil"
    },

    servers: [
      {
        url: "http://localhost:3000",
        description: "Ambiente local"
      },
      {
        url: "https://back-end-pi-ihs1.onrender.com",
        description: "Ambiente de produção"
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },

  apis: [
    "./src/routes/*.js"
  ]
};

module.exports =
  swaggerJsdoc(options);