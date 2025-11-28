'use client'

import Card from '@/components/shared/Card/Card'
import FrontCards from '@/components/game/DrawingStack/FrontCards'
import { motion } from 'framer-motion'
import { useEffect, useState, CSSProperties } from 'react'
import { useDispatch, useSelector } from '@/utils/hooks'
import { ready } from '@/stores/features/gameSlice'
import API from '@/api/API'
import GameAudio from '@/utils/audio'

const variants = {
  init: { x: 0, y: 0 },
  idleCenter: { x: 'calc(50vw - 50%)', y: 'calc(-1 * 50vh + 50% )' },
  idleCorner: { x: '10px', y: '70px' },
  idleCornerDisabled: { x: '10px', y: '80%', transition: { duration: 1 } },

  hover: { scale: 1.05, transition: { duration: 0.3 } },
}

export default function DrawingStack() {
  const { drawingStack, currentPlayer } = useSelector((state) => ({
    drawingStack: state.game.drawingStack,
    currentPlayer: state.game.currentPlayer,
  }))
  const dispatch = useDispatch()

  const [gameStarted, setGameStarted] = useState(false)

  const handleClick = () => {
    if (currentPlayer === 0) API.move(true)
  }

  useEffect(() => {
    const shuffleTimeout = setTimeout(() => {
      try {
        GameAudio.playAudio('shuffle')
      } catch (error) {
        console.warn('Audio not ready yet:', error)
      }
    }, 1800)
    const readyTimeout = setTimeout(() => {
      dispatch(ready())
      setGameStarted(true)
    }, 2000)

    return () => {
      clearTimeout(shuffleTimeout)
      clearTimeout(readyTimeout)
    }
  }, [dispatch])

  const canHover = gameStarted && currentPlayer === 0
  const highlight = canHover || !gameStarted

  const style = {
    '--cardWidth': 'var(--cardWidthBigger)',
    width: 'var(--cardWidth)',
    height: 'calc(var(--cardWidth) * 1.41)',
    filter: highlight ? 'drop-shadow(0 0 10px white)' : 'contrast(.5)',
    cursor: canHover ? 'pointer' : 'initial',
  } as CSSProperties

  const cardsToRender = gameStarted
    ? drawingStack
    : drawingStack.slice(0, 1)

  return (
    <motion.div
      onClick={handleClick}
      className="fixed bottom-0 left-0 z-10 -translate-x-1/2 translate-y-1/2"
      style={style}
      variants={variants}
      initial="init"
      animate={
        gameStarted
          ? canHover
            ? 'idleCorner'
            : 'idleCornerDisabled'
          : 'idleCenter'
      }
      whileHover={canHover ? 'hover' : { scale: 1 }}
    >
      {cardsToRender.map((card) => (
        <div className="absolute bottom-0 left-0" key={card.layoutId}>
          <Card
            layoutId={card.layoutId}
            color={card.color}
            digit={card.digit}
            action={card.action}
            disableShadow={true}
          />
        </div>
      ))}
      {gameStarted && <FrontCards />}
    </motion.div>
  )
}

