import { OfflineServer } from '@/server/OfflineServer'
import { OnlineServer } from '@/server/OnlineServer'
import { ServerInterface } from '@/server/ServerInterface'
import { Player, GameServer, Card } from '@/utils/interfaces'
import { getSocket } from './socket'

export class _API implements ServerInterface {
  isOnline = false
  _server: ServerInterface
  player?: Player

  constructor() {
    if (this.isOnline) this._server = new OnlineServer()
    else this._server = new OfflineServer()

    // Only listen to socket connection if socket exists
    const socket = getSocket()
    if (socket) {
      socket.on('connect', () => {
        console.log('connected to back-end');
        this.setOnlineMode(socket.connected)
      })
      socket.on('disconnect', () => {
        console.log('Disconnected from back-end')
        this.setOnlineMode(false)
      })
    }
  }

  setOnlineMode(isOnline: boolean) {
    this.isOnline = isOnline
  }

  playOnline(isOnline: boolean) {
    if (isOnline) {
      this._server = new OnlineServer()
      // Try to connect socket when switching to online mode
      const socket = getSocket()
      if (socket && !socket.connected) {
        socket.connect()
      }
    } else {
      this._server = new OfflineServer()
      // Disconnect socket when switching to offline mode
      const socket = getSocket()
      if (socket && socket.connected) {
        socket.disconnect()
      }
    }
  }

  getServers(): Promise<GameServer[]> {
    console.log(this._server)

    return this._server.getServers()
  }
  getServerPlayers(): Promise<Player[]> {
    return this._server.getServerPlayers()
  }
  createServer(serverName: string, serverPassword?: string): Promise<string> {
    return this._server.createServer(serverName, serverPassword)
  }
  joinServer(serverId?: string, serverPassword?: string): Promise<string> {
    return this._server.joinServer(serverId || '', serverPassword)
  }

  emitReady(): void {
    this._server.emitReady()
  }
  leaveServer(): void {
    this._server.leaveServer()
  }
  move(draw: boolean | null, cardId?: string): Promise<void> {
    if (!this._server) {
      console.error('API._server is null!')
      return Promise.reject(new Error('API._server is null'))
    }
    return this._server.move(draw, cardId)
  }
  onPlayersUpdated(cb: (players: Player[]) => void): () => void {
    return this._server.onPlayersUpdated(cb)
  }
  onGameInit(
    cb: (data: { players: Player[]; cards: Card[]; firstCard?: Card }) => void
  ): () => void {
    const unsub = this._server.onGameInit(cb)
    console.log(this._server)
    return unsub
  }
  onMove(
    cb: (data: {
      nxtPlayer: number
      card: Card
      draw?: number | undefined
      cardsToDraw?: Card[] | undefined
    }) => void
  ): () => void {
    return this._server.onMove(cb)
  }
  onPlayerLeft(cb: () => void): () => void {
    return this._server.onPlayerLeft(cb)
  }
  onFinishGame(cb: (playersOrdered: Player[]) => void): () => void {
    return this._server.onFinishGame(cb)
  }
  getPlayer(): Player {
    return this._server.getPlayer()
  }
}

const API = new _API()

export default API

