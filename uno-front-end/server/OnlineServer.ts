import { GameServer, Player, Card } from '@/utils/interfaces'
import { ServerInterface } from './ServerInterface'
import { getSocket } from '@/api/socket'

export class OnlineServer implements ServerInterface {
  player?: Player
  private _socket = getSocket()

  private ensureConnected(): void {
    if (this._socket && !this._socket.connected) {
      this._socket.connect()
    }
  }

  getServers(): Promise<GameServer[]> {
    this.ensureConnected()
    if (!this._socket) {
      return Promise.reject(new Error('Socket not available'))
    }
    return new Promise((res, rej) => {
      this._socket!.emit('get-servers', null, (err: any, servers: GameServer[]) => {
        if (err) return rej(err)
        console.log(servers)

        res(servers)
      })
    })
  }
  getServerPlayers(): Promise<Player[]> {
    this.ensureConnected()
    if (!this._socket) {
      return Promise.reject(new Error('Socket not available'))
    }
    return new Promise((res, rej) => {
      this._socket!.emit('get-server-players', null, (err: any, players: Player[]) => {
        if (err) return rej(err)
        res(players)
      })
    })
  }
  createServer(serverName: string, serverPassword?: string): Promise<string> {
    this.ensureConnected()
    if (!this._socket) {
      return Promise.reject(new Error('Socket not available'))
    }
    return new Promise((res, rej) => {
      this._socket!.emit(
        'create-server',
        { serverName, serverPassword, player: this.getPlayer() },
        (err: any, data: { serverId: string; playerId: string }) => {
          if (err) return rej(err)
          res(data.playerId)
        }
      )
    })
  }

  joinServer(serverId: string, serverPassword?: string): Promise<string> {
    this.ensureConnected()
    if (!this._socket) {
      return Promise.reject(new Error('Socket not available'))
    }
    return new Promise((res, rej) => {
      this._socket!.emit(
        'join-server',
        { serverId, serverPassword, player: this.getPlayer() },
        (err: any, playerId: string) => {
          if (err) {
            return rej(err)
          }
          setTimeout(() => {
            // this._socket!.emit("add-bots");
          }, 2000)
          res(playerId)
        }
      )
    })
  }
  emitReady(): void {
    this.ensureConnected()
    if (this._socket) {
      this._socket.emit('start-game')
    }
  }
  leaveServer(): void {
    if (this._socket) {
      this._socket.emit('leave-server')
      this.removeAllListeners()
    }
  }
  move(draw: boolean | null, cardId?: string): Promise<void> {
    this.ensureConnected()
    if (!this._socket) {
      return Promise.reject(new Error('Socket not available'))
    }
    return new Promise((res, rej) => {
      this._socket!.emit('move', { cardId, draw }, (err: any) => {
        if (err) return rej(err)
        res()
      })
    })
  }
  onPlayersUpdated(cb: (players: Player[]) => void): () => void {
    this.ensureConnected()
    if (!this._socket) {
      return () => undefined
    }
    this._socket.on('players-changed', cb)
    return () => this._socket!.off('players-changed', cb)
  }

  onGameInit(
    cb: (data: { players: Player[]; cards: Card[]; firstCard?: Card }) => void
  ): () => void {
    this.ensureConnected()
    if (!this._socket) {
      return () => undefined
    }
    this._socket.on('init-game', cb)
    return () => this._socket!.off('init-game', cb)
  }
  onMove(
    cb: (data: {
      nxtPlayer: number
      card: Card
      draw?: number | undefined
      cardsToDraw?: Card[] | undefined
    }) => void
  ): () => void {
    this.ensureConnected()
    if (!this._socket) {
      return () => undefined
    }
    this._socket.on('move', cb)
    return () => this._socket!.off('move', cb)
  }

  onPlayerLeft(cb: () => void): () => void {
    this.ensureConnected()
    if (!this._socket) {
      return () => undefined
    }
    this._socket.on('player-left', cb)
    return () => this._socket!.off('player-left', cb)
  }

  onFinishGame(cb: (playersOrdered: Player[]) => void): () => void {
    this.ensureConnected()
    if (!this._socket) {
      return () => undefined
    }
    this._socket.on('finished-game', cb)
    return () => this._socket!.off('finished-game', cb)
  }

  removeAllListeners() {
    if (this._socket) {
      this._socket.removeAllListeners()
    }
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
}

