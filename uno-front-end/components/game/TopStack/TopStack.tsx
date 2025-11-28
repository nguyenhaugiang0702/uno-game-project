'use client'

import { useSelector } from '@/utils/hooks'
import CardsRow from '@/components/game/CardsRow/CardsRow'

export default function TopStack() {
  const player = useSelector((state) => state.game.players[2])
  const currentPlayer = useSelector((state) => state.game.currentPlayer)
  const cards = player?.cards || []
  return (
    <div className="fixed left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
      <CardsRow cards={cards} highlight={currentPlayer === 2} />
    </div>
  )
}

