'use client'

import { useSelector } from '@/utils/hooks'
import CardsColumn from '@/components/game/CardsColumn/CardsColumn'

export default function RightStack() {
  const player = useSelector((state) => state.game.players[3])
  const currentPlayer = useSelector((state) => state.game.currentPlayer)
  const cards = player?.cards || []
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2">
      <CardsColumn cards={cards} highlight={currentPlayer === 3} />
    </div>
  )
}

