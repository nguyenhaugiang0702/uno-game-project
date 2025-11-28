const { createLobbyService } = require("../modules/lobby/lobby.service");

const registerLobbyHandlers = (io, socket) => {
  const lobbyService = createLobbyService({ io });

  const safeExec = (cb, handler) => {
    try {
      const result = handler();
      if (cb) cb(null, result);
    } catch (error) {
      const message = error?.message || "Unexpected error";
      if (cb) cb(message);
      console.error(message);
    }
  };

  socket.on("get-servers", (_, cb = () => {}) =>
    safeExec(cb, () => lobbyService.listServers())
  );

  socket.on("get-server-players", (_, cb = () => {}) =>
    safeExec(cb, () =>
      lobbyService.listCurrentPlayers(socket.id)
    )
  );

  socket.on(
    "create-server",
    ({ serverName, serverPassword, player }, cb = () => {}) =>
      safeExec(cb, () => {
        const serverId = lobbyService.createServerLobby({
          serverName,
          serverPassword,
        });
        const playerId = lobbyService.joinServerLobby({
          serverId,
          serverPassword,
          player,
          socket,
        });
        return { serverId, playerId };
      })
  );

  socket.on(
    "join-server",
    ({ serverId, serverPassword, player }, cb = () => {}) =>
      safeExec(cb, () =>
        lobbyService.joinServerLobby({
          serverId,
          serverPassword,
          player,
          socket,
        })
      )
  );

  socket.on("add-bots", (_payload, cb = () => {}) =>
    safeExec(cb, () => {
      lobbyService.addBotsToServer(socket.id);
    })
  );

  socket.on("start-game", (_payload, cb = () => {}) =>
    safeExec(cb, () => {
      lobbyService.startGameFromSocket(socket.id);
    })
  );

  socket.on("move", ({ cardId, draw }, cb = () => {}) =>
    safeExec(cb, () => {
      lobbyService.movePlayer({ socketId: socket.id, cardId, draw });
    })
  );

  socket.on("leave-server", () =>
    safeExec(null, () => lobbyService.leaveServerLobby(socket.id))
  );

  socket.on("disconnect", () =>
    safeExec(null, () => lobbyService.leaveServerLobby(socket.id))
  );
};

module.exports = { registerLobbyHandlers };

