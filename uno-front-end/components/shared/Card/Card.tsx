'use client'

import { motion } from 'framer-motion'
import Image from '@/components/shared/Image/Image'
import API from '@/api/API'
import clsx from 'clsx'
import { CSSProperties } from 'react'

interface CardProps {
  id?: string
  color?: string
  digit?: number
  action?: string
  flip?: boolean
  rotationY?: number
  layoutId?: string
  selectable?: boolean
  playable?: boolean
  disableShadow?: boolean
}

export default function Card({
  id = '',
  color = '',
  digit,
  action = '',
  flip = false,
  rotationY = 180,
  layoutId,
  selectable,
  playable,
  disableShadow = false,
}: CardProps) {
  const onClick = () => {
    if (playable) API.move(false, id)
  }

  const renderFront = () => {
    // If no color is provided, show backside (for placeholder cards or cards without color)
    if (!color || color === '') {
      return <Image src={`/assets/images/backside.png`} ratio={590 / 418} alt="" />
    }

    if (color === 'black' && action === 'wild')
      return <Image src={`/assets/images/wild.png`} ratio={590 / 418} alt="" />

    if (color === 'black')
      return (
        <>
          <Image
            src={`/assets/images/front-${color}.png`}
            ratio={590 / 418}
            alt=""
          />
          <img src="/assets/images/draw4.png" className="card-icon" alt="draw four" />
          <img
            className="icon-small icon-tl"
            src={`/assets/images/${action}-blank.png`}
            alt={`${action} icon`}
          />
          <img
            className="icon-small icon-br"
            src={`/assets/images/${action}-blank.png`}
            alt={`${action} icon`}
          />
        </>
      )

    if (action)
      return (
        <>
          <Image
            src={`/assets/images/front-${color}.png`}
            ratio={590 / 418}
            alt=""
          />
          <img
            src={`/assets/images/${action}-${color}.png`}
            className="card-icon"
            alt={`${action} ${color}`}
          />
          <img
            className="icon-small icon-tl"
            src={`/assets/images/${action}-blank.png`}
            alt={`${action} icon`}
          />
          <img
            className="icon-small icon-br"
            src={`/assets/images/${action}-blank.png`}
            alt={`${action} icon`}
          />
        </>
      )

    return (
      <>
        <Image
          src={`/assets/images/front-${color}.png`}
          ratio={590 / 418}
          alt=""
        />
        <p className="value">{digit}</p>
        <p className="value-small value-tl">{digit}</p>
        <p className="value-small value-br">{digit}</p>
      </>
    )
  }

  const colorVar =
    color && ['red', 'blue', 'green', 'yellow'].includes(color)
      ? `var(--${color})`
      : color || '#000'

  const style = {
    '--color': colorVar,
  } as CSSProperties

  return (
    <motion.div
      className={clsx(
        'uno-card noselect',
        playable && 'uno-card--playable',
        selectable && !playable && 'uno-card--selectable',
        disableShadow && 'uno-card--no-shadow'
      )}
      layoutId={layoutId}
      initial={{
        rotateY: flip ? Math.abs(180 - rotationY) : rotationY,
        y: 0,
      }}
      whileHover={
        playable
          ? { y: -40, transition: { duration: 0.3 } }
          : { y: 0, transition: { duration: 0.3 } }
      }
      animate={{ rotateY: rotationY, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      onClick={onClick}
      style={style}
    >
      <div className="front">{renderFront()}</div>
      <div className="back">
        <Image src={`/assets/images/backside.png`} ratio={590 / 418} alt="" />
      </div>
    </motion.div>
  )
}

