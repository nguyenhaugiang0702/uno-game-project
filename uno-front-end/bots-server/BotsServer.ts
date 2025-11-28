import { EventsObject } from '@/utils/EventsObject'
import { shuffle, wrapMod } from '@/utils/helpers'
import { Card, Player } from '@/utils/interfaces'
import data from './data.json'

export interface IMoveEvent {
  curPlayer: number
  nxtPlayer: number
  card?: Card
  draw?: number
  cardsToDraw?: Card[]
}

export interface IStartEvent {
  cards: Card[]
  players: Player[]
  playerId: string
}

export default class BotsServer extends EventsObject {
  players: Player[] = []
  curPlayer = 0
  direction = 1
  tableStk: Card[] = []
  drawingStk: Card[] = []
  sumDrawing = 0
  lastPlayerDrew = false
  playersFinished: number[] = []
  gameRunning = false
  numberOfPlayers = 4

  botTimeout: NodeJS.Timeout | null = null

  constructor(numberOfPlayers = 4) {
    super()
    this.numberOfPlayers = numberOfPlayers
  }

  init() {
    this.players = []
    this.curPlayer = 0
    this.direction = 1
    this.tableStk = []
    this.drawingStk = []
    this.sumDrawing = 0
    this.playersFinished = []
    this.lastPlayerDrew = false
    this.gameRunning = false
  }

  joinPlayer(player: Player) {
    const playerId = this.players.length.toString()

    this.players.push({
      ...player,
      id: playerId,
      cards: [],
    })

    return playerId
  }

  addBots() {
    const numToAdd = this.numberOfPlayers - this.players.length
    for (let i = 0; i < numToAdd; i++) {
      const bot = (data as any).players[i]
      const playerId = this.players.length.toString()
      this.players.push({
        ...bot,
        id: playerId,
        cards: [],
        isBot: true,
      })
    }
    this.fireEvent('players-changed', this.players)
    if (this.players.length === this.numberOfPlayers)
      setTimeout(() => {
        this.start()
      }, 1000)
  }

  start() {
    const cards = [...(data as any).cards] as Card[]
    shuffle(cards)
    shuffle(this.players)
    const NUM_CARDS = 7
    this.players.forEach((player, idx) => {
      player.cards = cards.slice(idx * NUM_CARDS, (idx + 1) * NUM_CARDS)
    })

    // Place remaining cards in drawing stack
    const remainingCards = cards.slice(this.players.length * NUM_CARDS)

    // Take first card from drawing stack and place it on table
    // Make sure it's not a wild card to start with
    let firstCardIndex = 0
    while (remainingCards[firstCardIndex]?.action === 'wild' ||
      remainingCards[firstCardIndex]?.action === 'draw four') {
      firstCardIndex++
    }

    this.tableStk = [remainingCards[firstCardIndex]]
    this.drawingStk = [
      ...remainingCards.slice(0, firstCardIndex),
      ...remainingCards.slice(firstCardIndex + 1)
    ]

    this.fireEvent('game-init', {
      cards: this.players.find((p) => !p.isBot)?.cards || [],
      players: this.players.map((p) => ({ ...p, cards: [] })),
      firstCard: this.tableStk[0],
    })

    console.log('Game initialized, waiting to play first card:', this.tableStk[0])
  }

  ready() {
    console.log('Ready called, current player:', this.curPlayer, 'is bot:', this.players[this.curPlayer]?.isBot)
    if (!this.tableStk.length && this.drawingStk.length) {
      const firstCard = this.drawingStk.shift() as Card
      this.tableStk.unshift(firstCard)
      this.curPlayer = this.players.length - 1
      this.move(false, firstCard.id as string)
      return
    }
    if (this.players[this.curPlayer]?.isBot) this.moveBot()
  }

  move(draw: boolean | null, cardId: string | null) {
    if (this.botTimeout) {
      clearTimeout(this.botTimeout)
      this.botTimeout = null
    }
    let moveEventObj: IMoveEvent = { nxtPlayer: 0, curPlayer: 0 }
    let card: Card | undefined

    if (cardId) card = getCardById(cardId) as Card

    console.log('Move request:', { draw, cardId, card, curPlayer: this.curPlayer })

    if (card && !canPlayCard(this.tableStk[0], card, this.lastPlayerDrew)) {
      console.log('Move rejected: cannot play card', { tableCard: this.tableStk[0], card })
      return false
    }

    if (draw) {
      let drawCnt = 1
      if (this.sumDrawing) {
        drawCnt = this.sumDrawing
        this.sumDrawing = 0
      }

      moveEventObj.draw = drawCnt
      if (drawCnt + 1 > this.drawingStk.length) {
        this.drawingStk = shuffle(
          this.tableStk.slice(5, this.tableStk.length)
        ) as Card[]
        this.tableStk = this.tableStk.slice(0, 5)
      }

      moveEventObj.cardsToDraw = this.drawingStk.slice(0, drawCnt)
      this.players[this.curPlayer].cards = this.drawingStk
        .slice(0, drawCnt)
        .concat(this.players[this.curPlayer].cards)

      this.drawingStk = this.drawingStk.slice(drawCnt, this.drawingStk.length)
      this.lastPlayerDrew = true
    }

    let nxtPlayer = this.getNextPlayer(card)

    moveEventObj.curPlayer = this.curPlayer
    moveEventObj.nxtPlayer = nxtPlayer

    if (card) {
      if (card.action === 'draw two') this.sumDrawing += 2
      if (card.action === 'draw four') this.sumDrawing += 4

      this.tableStk.unshift(card)
      moveEventObj.card = card

      // Only try to remove card from player if they have it (system might play first card)
      const hasCard = this.players[this.curPlayer].cards.some(c => c.id === card?.id)
      if (hasCard) {
        this.players[this.curPlayer].cards = this.players[
          this.curPlayer
        ].cards.filter((c) => c.id !== card?.id)
      }
      this.lastPlayerDrew = false

      // Check if game finished
      if (this.players[this.curPlayer].cards.length === 0)
        this.playersFinished.push(this.curPlayer)
      if (this.playersFinished.length === this.players.length - 1) {
        this.playersFinished.push(nxtPlayer)
        this.finishGame()
        this.fireEvent('move', moveEventObj as IMoveEvent)
        return
      }
    }

    this.curPlayer = nxtPlayer

    this.fireEvent('move', moveEventObj as IMoveEvent)

    if (this.players[this.curPlayer].isBot) this.moveBot()
  }

  getNextPlayer(card?: Card) {
    let nxtPlayer = this.curPlayer

    if (card?.action === 'reverse') this.direction *= -1

    const moveForward = (steps: number = 1) => {
      while (steps--) {
        nxtPlayer = wrapMod(
          nxtPlayer + 1 * this.direction,
          this.players.length
        )
        while (this.players[nxtPlayer].cards.length === 0)
          nxtPlayer = wrapMod(
            nxtPlayer + 1 * this.direction,
            this.players.length
          )
      }
    }

    //Move to next player ( if not wild card )
    if (card?.action === 'skip') {
      moveForward(2)
    } else if (card?.action !== 'wild') moveForward()

    return nxtPlayer
  }

  moveBot() {
    if (this.botTimeout) {
      clearTimeout(this.botTimeout)
    }
    this.botTimeout = setTimeout(() => {
      if (!this.players[this.curPlayer]?.isBot) {
        this.botTimeout = null
        return
      }
      const validCards = this.players[this.curPlayer].cards.filter(card =>
        canPlayCard(this.tableStk[0], card, this.lastPlayerDrew)
      )

      if (validCards.length > 0) {
        this.botTimeout = null
        const randomCard = validCards[Math.floor(Math.random() * validCards.length)]
        return this.move(false, randomCard.id as string)
      }

      this.botTimeout = null
      return this.move(true, null)
    }, 1500)
  }

  finishGame() {
    const playersFinishingOrder = this.playersFinished.map(
      (idx) => this.players[idx]
    )

    this.init()
    this.fireEvent('finish-game', playersFinishingOrder)
  }
}

export function canPlayCard(
  oldCard: Card,
  newCard: Card,
  lastPlayerDrew: boolean
) {
  const isOldDawingCard =
    oldCard?.action && oldCard.action.indexOf('draw') !== -1
  const haveToDraw = isOldDawingCard && !lastPlayerDrew
  const isNewDawingCard =
    newCard?.action && newCard.action.indexOf('draw') !== -1

  //No Card Played Yet
  if (!oldCard) return true

  if (!haveToDraw && newCard.action === 'wild') return true

  if (newCard.action === 'draw four') return true

  if (oldCard.color === 'black' && !haveToDraw) return true

  if (haveToDraw && isNewDawingCard) return true

  if (!haveToDraw && oldCard.color === newCard.color) return true

  if (oldCard.digit !== undefined && oldCard.digit === newCard.digit)
    return true

  return false
}

const getCardById = (id: string) =>
  (data as any).cards.find((c: Card) => c.id === id)
