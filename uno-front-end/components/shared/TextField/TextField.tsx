'use client'

import React from 'react'
import clsx from 'clsx'

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

const baseClasses =
  'inline-block w-3/4 px-8 py-5 bg-black/30 border border-[#020F6C] rounded-xl text-center text-lg text-cyan-300 shadow-inner shadow-[#1a1b35] placeholder:text-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-cyan-300'

const TextField = ({ className, ...props }: TextFieldProps) => {
  return <input className={clsx(baseClasses, className)} {...props} />
}

export default TextField

