'use client'

import Card from '@/components/shared/Card/Card'
import { Card as CardType } from '@/utils/interfaces'
import { CSSProperties } from 'react'

interface CardsRowProps {
  cards: CardType[]
  selectable?: boolean
  highlight?: boolean
}

export default function CardsRow({ cards, selectable, highlight }: CardsRowProps) {
  const style = {
    '--cardsCnt': cards.length,
    filter: highlight ? 'drop-shadow(0 0 10px white)' : 'brightness(0.6)',
  } as CSSProperties

  return (
    <div className="cards-row flex justify-center" style={style}>
      {cards.map((card) => (
        <div className="card-container" key={card.layoutId}>
          <Card
            id={card.id}
            layoutId={card.layoutId}
            color={card.color}
            digit={card.digit}
            action={card.action}
            flip={card.flip}
            rotationY={card.rotationY}
            selectable={selectable}
            playable={card.playable}
          />
        </div>
      ))}
    </div>
  )
}

