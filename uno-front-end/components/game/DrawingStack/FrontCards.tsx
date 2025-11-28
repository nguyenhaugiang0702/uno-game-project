'use client'

import { memo } from 'react'
import Card from '@/components/shared/Card/Card'

const FrontCards = memo(function FrontCards() {
  return (
    <>
      {Array(5)
        .fill(0)
        .map((_, idx) => (
          <div
            className="card-container"
            key={idx}
            style={{
              transform: `translate(${Math.random() * 20 - 10}px,${
                Math.random() * 20 - 10
              }px)`,
            }}
          >
            <Card />
          </div>
        ))}
    </>
  )
})

export default FrontCards

