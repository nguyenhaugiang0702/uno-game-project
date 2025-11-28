'use client'

import { useSelector } from '@/utils/hooks'
import CardsRow from '@/components/game/CardsRow/CardsRow'
import { CSSProperties } from 'react'

export default function PlayerStack() {
  const { player, currentPlayer } = useSelector((state) => ({
    player: state.game.players[0],
    currentPlayer: state.game.currentPlayer,
  }))
  const cards = player?.cards || []

  return (
    <div
      className="fixed bottom-[-50px] left-1/2 -translate-x-1/2"
      style={{ '--cardWidth': 'var(--cardWidthBigger)' } as CSSProperties}
    >
      <CardsRow cards={cards} highlight={currentPlayer === 0} selectable />
    </div>
  )
}

