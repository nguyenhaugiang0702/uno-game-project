const { Server } = require("socket.io");
const { registerLobbyHandlers } = require("./lobby.handlers");

const registerSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log('Client connected:', socket.id);
    registerLobbyHandlers(io, socket);
  });


  return io;
};

module.exports = { registerSocketServer };

