'use client'

import React from 'react'
import clsx from 'clsx'

const Table = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div
      className={clsx(
        'min-h-[35vh] rounded-2xl bg-black/80 text-white grid grid-cols-1 grid-rows-[60px_auto] max-h-[500px] overflow-y-auto',
        className
      )}
    >
      <div className="grid grid-cols-3 gap-4 px-5 py-4 border-b border-[#020F6C] text-center font-semibold text-white">
        <span>Server Name</span>
        <span>Players Joined</span>
        <span>Is Private</span>
      </div>
      <div className="grid grid-cols-1 gap-3 px-5 py-5">{children}</div>
    </div>
  )
}

export default Table

