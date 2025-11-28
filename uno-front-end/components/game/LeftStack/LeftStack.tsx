'use client'

import { useSelector } from '@/utils/hooks'
import CardsColumn from '@/components/game/CardsColumn/CardsColumn'

export default function LeftStack() {
  const player = useSelector((state) => state.game.players[1])
  const currentPlayer = useSelector((state) => state.game.currentPlayer)
  const cards = player?.cards || []
  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2">
      <CardsColumn cards={cards} highlight={currentPlayer === 1} />
    </div>
  )
}

