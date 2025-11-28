const http = require("http");
const { buildApp } = require("./app");

const createHttpServer = () => {
  const app = buildApp();
  return http.createServer(app);
};

module.exports = { createHttpServer };

