const { getCard } = require("../../data/cards.repository");
const {
  getServer,
  setServer,
  deleteServer,
  getAllServers,
  getServerPlayers,
} = require("../../data/servers.repository");
const {
  addPlayer,
  removePlayer,
  getPlayer,
} = require("../../data/players-sockets.repository");
const { getBots } = require("../../data/bots.repository");
const GameServer = require("../../core/game-server");

const createLobbyService = ({ io }) => {
  const listServers = () => getAllServers();

  const listCurrentPlayers = (socketId) => {
    const { serverId } = getPlayer(socketId);
    return getServerPlayers(serverId);
  };

  const createServerLobby = ({ serverName, serverPassword }) => {
    if (serverName.trim().length < 2) {
      throw new Error("Server name too short");
    }
    const server = new GameServer(serverName, serverPassword);
    const serverId = server.serverId;
    setServer(server);
    server.init();
    return serverId;
  };

  const joinServerLobby = ({
    serverId,
    serverPassword = "",
    player,
    socket,
  }) => {
    const server = getServer(serverId);
    if (!server) throw new Error("Server doesn't exist");
    if (server.serverPassword !== serverPassword)
      throw new Error("Invalid server password");
    if (player.name.trim().length <= 1)
      throw new Error("Player name too short");
    if (server.players.length >= server.numberOfPlayers)
      throw new Error("Server is already full");

    let playerId;
    if (socket) {
      player.socketId = socket.id;
      socket.join(serverId);
      playerId = server.joinPlayer(player);
      addPlayer(socket.id, playerId, serverId);
    } else {
      playerId = server.joinPlayer(player);
    }

    io.to(serverId).emit("players-changed", server.players);

    if (server.players.length === server.numberOfPlayers) {
      initGame(server);
    }

    return playerId;
  };

  const addBotsToServer = (socketId) => {
    const { playerId, serverId } = getPlayer(socketId);
    const server = getServer(serverId);
    if (!server.isAdmin(playerId))
      throw new Error("Only admin can add bots to the lobby");

    const botsToAdd = getBots(server.numberOfPlayers - server.players.length);
    for (const bot of botsToAdd) {
      joinServerLobby({
        serverId,
        serverPassword: server.serverPassword,
        player: { ...bot, isBot: true },
      });
    }

    io.to(serverId).emit("players-changed", server.players);

    if (server.players.length === server.numberOfPlayers) {
      initGame(server);
    }
  };

  const startGameLoop = (serverId) => {
    const server = getServer(serverId);
    if (!server.gameRunning) {
      server.gameRunning = true;
      if (
        server.players[server.curPlayer].disconnected ||
        server.players[server.curPlayer].isBot
      ) {
        setTimeout(() => {
          moveBot(server);
        }, 1500);
      }
      server.onFinish((playersOrdered) => {
        io.to(serverId).emit("finished-game", playersOrdered);
      });
    }
  };

  const startGameFromSocket = (socketId) => {
    const { serverId } = getPlayer(socketId);
    startGameLoop(serverId);
  };

  const movePlayer = ({ socketId, cardId, draw }) => {
    const { playerId, serverId } = getPlayer(socketId);
    const server = getServer(serverId);
    const card = cardId ? getCard(cardId) : null;
    const socket = io.sockets.sockets.get(socketId);

    if (!socket) throw new Error("Player socket not found");

    if (server.players[server.curPlayer].id !== playerId)
      throw new Error("Not your turn");

    const result = server.move(draw, card);
    if (!result) throw new Error("Unable to process move");

    const { nxtPlayer, cardsToDraw, card: resolvedCard, draw: drawCount } =
      result;
    const responseCard = resolvedCard || card;
    const drawValue = cardsToDraw?.length ?? drawCount;

    socket.broadcast.to(serverId).emit("move", {
      nxtPlayer,
      card: responseCard,
      draw: drawValue,
    });

    socket.emit("move", {
      nxtPlayer,
      card: responseCard,
      draw: drawValue,
      cardsToDraw,
    });

    if (
      server.players[server.curPlayer].disconnected ||
      server.players[server.curPlayer].isBot
    ) {
      setTimeout(() => moveBot(server), 1500);
    }
  };

  const leaveServerLobby = (socketId) => {
    try {
      const { playerId, serverId } = getPlayer(socketId);
      const server = getServer(serverId);

      server.leavePlayer(playerId);
      let connectedPlayer = 0;
      for (const p of server.players) {
        if (!p.disconnected && !p.isBot) connectedPlayer++;
      }
      if (connectedPlayer === 0) deleteServer(serverId);

      if (server.gameRunning) io.to(serverId).emit("player-left", playerId);
      else io.to(serverId).emit("players-changed", server.players);

      if (
        server.players[server.curPlayer]?.isBot &&
        server.players[server.curPlayer]?.id === playerId
      ) {
        moveBot(server);
      }

      removePlayer(socketId);
    } catch (error) {
      removePlayer(socketId);
    }
  };

  const initGame = (server) => {
    setTimeout(() => {
      server.start();
      const playersToSend = server.players.map((player) => ({
        ...player,
        cards: [],
      }));

      for (const player of server.players) {
        if (player.socketId) {
          io.to(player.socketId).emit("init-game", {
            players: playersToSend,
            cards: player.cards,
          });
        }
      }
    }, 2000);
  };

  const moveBot = (server) => {
    if (!server) return;
    const { card, nxtPlayer, draw } = server.moveBot() || {};
    io.to(server.serverId).emit("move", {
      nxtPlayer,
      card,
      draw,
    });

    if (
      server.players[server.curPlayer] &&
      (server.players[server.curPlayer].disconnected ||
        server.players[server.curPlayer].isBot)
    ) {
      setTimeout(() => {
        moveBot(server);
      }, 1500);
    }
  };

  return {
    listServers,
    listCurrentPlayers,
    createServerLobby,
    joinServerLobby,
    addBotsToServer,
    startGameLoop,
    startGameFromSocket,
    movePlayer,
    leaveServerLobby,
  };
};

module.exports = { createLobbyService };

