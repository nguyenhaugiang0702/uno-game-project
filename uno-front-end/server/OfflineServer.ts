import { GameServer, Player, Card } from '@/utils/interfaces'
import { ServerInterface } from './ServerInterface'
import BotsServer from '@/bots-server/BotsServer'

export class OfflineServer implements ServerInterface {
  player?: Player

  private _botsServer: BotsServer

  constructor() {
    this._botsServer = new BotsServer()
  }

  async getServers(): Promise<GameServer[]> {
    return []
  }

  async getServerPlayers(): Promise<Player[]> {
    return this._botsServer.players.map((p) => ({ ...p, cards: [] }))
  }

  async createServer(
    serverName: string,
    serverPassword?: string
  ): Promise<string> {
    return Promise.resolve('offline')
  }

  async joinServer(serverId: string, serverPassword?: string): Promise<string> {
    this._botsServer = new BotsServer()
    this._botsServer.init()
    const playerId = this._botsServer.joinPlayer(this.getPlayer())
    setTimeout(() => this._botsServer.addBots(), 2000)
    return playerId
  }

  emitReady(): void {
    if (this._botsServer) {
      this._botsServer.ready()
    }
  }

  leaveServer(): void {
    this._botsServer = null as unknown as BotsServer
  }

  async move(draw: boolean | null, cardId?: string | null): Promise<void> {
    if (!this._botsServer) {
      console.warn('OfflineServer._botsServer is null, ignoring move')
      return
    }
    this._botsServer.move(draw, cardId || null)
  }

  onPlayersUpdated(cb: (players: Player[]) => void): () => void {
    return this.registerListener('players-changed', cb)
  }

  onGameInit(
    cb: (data: { players: Player[]; cards: Card[]; firstCard?: Card }) => void
  ): () => void {
    return this.registerListener('game-init', cb)
  }

  onMove(
    cb: (data: {
      nxtPlayer: number
      card: Card
      draw?: number
      cardsToDraw?: Card[]
    }) => void
  ): () => void {
    return this.registerListener('move', cb)
  }

  onPlayerLeft(cb: () => void): () => void {
    return this.registerListener('player-left', cb)
  }

  onFinishGame(cb: (playersOrdered: Player[]) => void): () => void {
    return this.registerListener('finish-game', cb)
  }

  getPlayer(): Player {
    if (this.player) return this.player
    this.player = {} as Player
    if (typeof window !== 'undefined') {
      this.player.name = localStorage.getItem('playerName') || ''
      this.player.img = localStorage.getItem('playerImg') || ''
    }
    return this.player
  }

  private registerListener<T>(event: string, cb: (payload: T) => void): () => void {
    const server = this._botsServer
    if (!server) {
      return () => undefined
    }
    server.addEventListener(event, cb)
    return () => server.removeEventListener(event, cb)
  }
}

