const express = require("express");
const cors = require("cors");

const buildApp = () => {
  const app = express();
  app.use(cors());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return app;
};

module.exports = { buildApp };

