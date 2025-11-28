'use client'

import Card from '@/components/shared/Card/Card'
import { Card as CardType } from '@/utils/interfaces'
import { CSSProperties } from 'react'

interface CardsColumnProps {
  cards: CardType[]
  highlight?: boolean
}

export default function CardsColumn({ cards, highlight }: CardsColumnProps) {
  const style = {
    '--cardsCnt': cards.length,
    filter: highlight ? 'drop-shadow(0 0 10px white)' : 'brightness(0.6)',
  } as CSSProperties

  return (
    <div className="cards-column flex flex-col items-center" style={style}>
      {cards.map((card) => (
        <div className="card-container" key={card.layoutId}>
          <Card
            layoutId={card.layoutId}
            color={card.color}
            digit={card.digit}
            action={card.action}
            flip={card.flip}
            rotationY={card.rotationY}
          />
        </div>
      ))}
    </div>
  )
}

