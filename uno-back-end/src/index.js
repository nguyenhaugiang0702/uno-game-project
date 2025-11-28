const { createHttpServer } = require("./http-server");
const { registerSocketServer } = require("./socket");

const PORT = process.env.PORT || 5000;

const bootstrap = () => {
  const httpServer = createHttpServer();
  registerSocketServer(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Uno backend listening on port ${PORT}`);
  });
};

bootstrap();

