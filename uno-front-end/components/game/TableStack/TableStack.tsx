'use client'

import Card from '@/components/shared/Card/Card'
import { useSelector } from '@/utils/hooks'
import { CSSProperties } from 'react'

export default function TableStack() {
  const tableStack = useSelector((state) => state.game.tableStack)

  return (
    <div
      className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ '--cardWidth': 'var(--cardWidthBigger)' } as CSSProperties}
    >
      {tableStack.map((card) => (
        <div
          className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
          key={card.layoutId}
        >
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

