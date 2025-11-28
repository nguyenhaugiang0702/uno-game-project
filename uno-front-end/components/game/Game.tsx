'use client'

import { LayoutGroup } from 'framer-motion'
import TableStack from '@/components/game/TableStack/TableStack'
import PlayerStack from '@/components/game/PlayerStack/PlayerStack'
import { useEffect, useState, useRef } from 'react'
import LeftStack from '@/components/game/LeftStack/LeftStack'
import RightStack from '@/components/game/RightStack/RightStack'
import TopStack from '@/components/game/TopStack/TopStack'
import DrawingStack from '@/components/game/DrawingStack/DrawingStack'
import { useDispatch, useSelector } from '@/utils/hooks'
import {
  moveCard,
  movePlayer,
  stopGame,
} from '@/stores/features/gameSlice'
import Scoreboard from '@/components/game/Scoreboard/Scoreboard'
import { Player } from '@/utils/interfaces'
import API from '@/api/API'
import GameAudio from '@/utils/audio'
import { useRouter } from 'next/navigation'

export default function GameBoard() {
  const dispatch = useDispatch()
  const [finished, setFinished] = useState(false)
  const [playersOrder, setPlayersOrder] = useState<Player[]>([])
  const inGame = useSelector((state) => state.game.inGame)
  const router = useRouter()
  const isInitializedRef = useRef(false)

  // Check if we should redirect (only once, not on every render)
  useEffect(() => {
    if (!inGame && !isInitializedRef.current) {
      router.replace('/main-menu')
      return
    }
    isInitializedRef.current = true
  }, [inGame, router])

  // Setup game listeners (only when inGame is true)
  useEffect(() => {
    if (!inGame) return

    const timeoutReady = setTimeout(() => {
      API.emitReady()
    }, 2000)

    const unsubMove = API.onMove(({ card, draw, cardsToDraw, nxtPlayer, curPlayer }) => {
      dispatch(
        moveCard({
          curPlayer,
          nextPlayer: nxtPlayer,
          card,
          draw,
          cardsToDraw,
        })
      )
      if (draw) {
        GameAudio.playAudio('draw', draw)
      } else GameAudio.playAudio('play')
      setTimeout(() => dispatch(movePlayer()), 500)
    })

    const unsubFinish = API.onFinishGame((players: Player[]) => {
      setFinished(true)
      setPlayersOrder(players)
    })

    return () => {
      clearTimeout(timeoutReady)
      if (unsubMove) unsubMove()
      if (unsubFinish) unsubFinish()
    }
  }, [dispatch, inGame])

  if (!inGame) return null

  return (
    <div>
      <LayoutGroup>
        <TableStack />
        <TopStack />
        <LeftStack />
        <RightStack />
        <PlayerStack />
        <DrawingStack />
      </LayoutGroup>

      {finished && <Scoreboard players={playersOrder} />}
    </div>
  )
}

