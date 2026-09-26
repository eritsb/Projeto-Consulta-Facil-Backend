const express =
  require("express");

const router =
  express.Router();

const DisponibilidadesController =
  require(
    "../controllers/disponibilidadesController"
  );

router.get(
  "/",
  DisponibilidadesController.listar
);

router.get(
  "/profissional/:id",
  DisponibilidadesController.listarPorProfissional
);

router.get(
  "/:id",
  DisponibilidadesController.buscarPorId
);

router.post(
  "/",
  DisponibilidadesController.cadastrar
);

router.put(
  "/:id",
  DisponibilidadesController.atualizar
);

router.delete(
  "/:id",
  DisponibilidadesController.excluir
);

module.exports = router;