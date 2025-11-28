import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { canPlayCard } from '@/bots-server/BotsServer'
import { wrapMod } from '@/utils/helpers'
import { Card, Player } from '@/utils/interfaces'

interface StoreState {
  playerId: string
  currentPlayer: number
  nextPlayre: number
  orderOffset: number
  direction: number
  tableStack: Card[]
  drawingStack: Card[]
  players: Player[]
  lastPlayerDrawed: boolean
  inGame: boolean
  inLobby: boolean
  pendingFirstCard?: Card
}

let cardLayoutIdIdx = 111

function generateDrawingCards(cnt: number) {
  return Array(cnt)
    .fill(0)
    .map(() => ({ layoutId: `id_${cardLayoutIdIdx++}` }))
}

const initialState: StoreState = {
  playerId: '',
  currentPlayer: 0,
  nextPlayre: 0,
  orderOffset: 0,
  direction: 1,
  tableStack: [],
  drawingStack: [],
  players: [],
  lastPlayerDrawed: false,
  inGame: false,
  inLobby: false,
  pendingFirstCard: undefined,
}

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setPlayerId(state, action: PayloadAction<string>) {
      state.playerId = action.payload
    },
    init: (
      state,
      action: PayloadAction<{ players: Player[]; cards: Card[]; firstCard?: Card }>
    ) => {
      const { players, cards: startingCards, firstCard } = action.payload
      state.direction = 1
      state.tableStack = []
      state.pendingFirstCard = firstCard
        ? {
            ...firstCard,
            layoutId: `table_${cardLayoutIdIdx++}`,
            rotationY: 0,
          }
        : undefined
      state.lastPlayerDrawed = false
      state.inGame = true
      state.inLobby = false

      let playersFinal: Player[] = []
      let myIdx = 0
      while (myIdx < players.length) {
        if (players[myIdx].id === state.playerId) break
        myIdx++
      }

      for (let i = myIdx; i < players.length; i++) {
        playersFinal.push(players[i])
      }
      state.currentPlayer = playersFinal.length % players.length
      for (let i = 0; i < myIdx; i++) {
        playersFinal.push(players[i])
      }

      let cardsToDistribute: Card[] = startingCards.map((c) => ({
        ...c,
        layoutId: `id_${cardLayoutIdIdx++}`,
        rotationY: 0,
        playable: myIdx === 0,
        forPlayer: 0,
      }))

      for (let i = 1; i < playersFinal.length; i++) {
        cardsToDistribute = cardsToDistribute.concat(
          Array(startingCards.length)
            .fill(0)
            .map(() => ({
              layoutId: `id_${cardLayoutIdIdx++}`,
              forPlayer: i,
            }))
        )
      }
      state.players = playersFinal
      state.drawingStack = cardsToDistribute.concat(generateDrawingCards(20))
      state.orderOffset = myIdx
    },

    ready(state) {
      state.players = state.players.map((player, idx) => {
        return {
          ...player,
          cards: state.drawingStack.filter((c) => c.forPlayer === idx),
        }
      })

      state.drawingStack = state.drawingStack.filter(
        (c) => typeof c.forPlayer === 'undefined'
      )

      if (!state.tableStack.length && state.pendingFirstCard) {
        state.tableStack = [state.pendingFirstCard]
        state.pendingFirstCard = undefined
      }
    },

    stopGame(state) {
      state.inGame = false
    },

    setInLobby(state, action: PayloadAction<boolean>) {
      state.inLobby = action.payload
    },

    moveCard(
      state,
      action: PayloadAction<{
        curPlayer: number
        nextPlayer: number
        card?: Card
        draw?: number
        cardsToDraw?: Card[]
      }>
    ) {
      let { curPlayer, nextPlayer, card, cardsToDraw = [], draw } = action.payload

      // Convert curPlayer from server index to UI index
      curPlayer = wrapMod(curPlayer - state.orderOffset, state.players.length)

      const curPlayerObj = state.players[curPlayer]

      nextPlayer = wrapMod(nextPlayer - state.orderOffset, state.players.length)

      if (card?.action === 'reverse') state.direction *= -1

      if (draw) {
        state.players = state.players.map((p) => {
          if (p.id === curPlayerObj.id) {
            let newCards = state.drawingStack.slice(0, draw)
            if (curPlayerObj.id === state.playerId && cardsToDraw) {
              newCards = newCards.map((c, idx) => ({
                ...c,
                ...cardsToDraw[idx],
                rotationY: 0,
              }))
            }
            return {
              ...p,
              cards: p.cards.concat(newCards),
            }
          }
          return p
        })
        state.drawingStack = state.drawingStack
          .slice(draw)
          .concat(generateDrawingCards(draw))
        state.lastPlayerDrawed = true
      }

      if (card) {
        let layoutId: string | undefined = ''
        let shouldFlip = false

        // Check if player actually has the card (or any card if not local player)
        const hasCard = curPlayerObj.cards.some((c) =>
          curPlayerObj.id === state.playerId ? c.id === card?.id : true
        )

        if (hasCard && curPlayerObj.cards.length > 0) {
          if (curPlayerObj.id !== state.playerId) {
            layoutId =
              curPlayerObj.cards[
                Math.floor(Math.random() * curPlayerObj.cards.length)
              ].layoutId
            shouldFlip = true
          } else {
            layoutId = curPlayerObj.cards.find((c) => c.id === card?.id)?.layoutId
            const cardToMove = curPlayerObj.cards.filter(
              (c) => c.layoutId === layoutId
            )[0]

            if (cardToMove) {
              card.color = cardToMove.color
              card.action = cardToMove.action
              card.digit = cardToMove.digit
            }
          }
        } else {
          // Card not in hand (e.g. first card played by system)
          // Animate from drawing stack (deck)
          layoutId = `system_move_${cardLayoutIdIdx++}`
          shouldFlip = true
        }

        state.tableStack = [
          ...state.tableStack.slice(-1),
          {
            layoutId: layoutId || `unknown_${cardLayoutIdIdx++}`,
            color: card.color,
            action: card.action,
            digit: card.digit,
            flip: shouldFlip,
            rotationY: 0,
          },
        ]

        // Only remove card if it was in hand
        if (hasCard) {
          state.players = state.players.map((p) => {
            if (p === curPlayerObj) {
              return {
                ...p,
                cards: p.cards.filter((c) => c.layoutId !== layoutId),
              }
            }
            return p
          })
        }
        state.lastPlayerDrawed = false
      }

      state.nextPlayre = nextPlayer
    },
    movePlayer(state) {
      state.players = state.players.map((p) => {
        if (p.id === state.playerId) {
          const myTurn = state.nextPlayre === 0

          return {
            ...p,
            cards: p.cards.map((c) => {
              return {
                ...c,
                playable:
                  myTurn &&
                  canPlayCard(
                    state.tableStack[state.tableStack.length - 1],
                    c,
                    state.lastPlayerDrawed
                  ),
              }
            }),
          }
        }
        return p
      })
      state.currentPlayer = state.nextPlayre
    },
  },
})

export const {
  init,
  ready,
  stopGame,
  moveCard,
  movePlayer,
  setInLobby,
  setPlayerId,
} = gameSlice.actions

export default gameSlice.reducer


