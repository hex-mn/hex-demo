'use client'

import React, { useEffect, useState } from 'react'

type GridItem = {
  id: string
  x: number
  y: number
  w: number
  h: number
  url: string | null
  image_url: string | null
}

const GRID_GAP = 0 //px
const COLS_DESKTOP = 48
const COLS_MOBILE = 24

function Cell({
  item,
  isMobile,
  screenWidth,
}: {
  item: GridItem
  isMobile: boolean
  screenWidth: number
}) {
  const cols = isMobile ? COLS_MOBILE : COLS_DESKTOP
  const cellWidth = (screenWidth - (cols + 1) * GRID_GAP) / cols

  const width = item.w * cellWidth + (item.w - 1) * GRID_GAP
  const height = item.h * cellWidth + (item.h - 1) * GRID_GAP
  const left = item.x * cellWidth + item.x * GRID_GAP
  const top = item.y * cellWidth + item.y * GRID_GAP

  const clickable = !!item.url

  return (
    <div
      className={`absolute overflow-hidden transition-transform duration-300 ${clickable ? 'hover:scale-[1.03] cursor-pointer' : ''
        }`}
      style={{
        width,
        height,
        left,
        top,
        backgroundImage: item.image_url ? `url(${item.image_url})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: item.image_url ? 'transparent' : 'white',
      }}
      onClick={() => {
        if (item.url) window.open(item.url, '_blank')
      }}
    />
  )
}

export default function GridLayout({ data }: { data: GridItem[] }) {
  const [screenWidth, setScreenWidth] = useState(0)

  useEffect(() => {
    function handleResize() {
      // Dynamically calculate scrollbar width also 
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth 
      setScreenWidth(window.innerWidth - (scrollbarWidth === 0 ? 15 : scrollbarWidth))
    }

    handleResize() // initial value
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (screenWidth === 0) return null // or loading

  const isMobile = screenWidth < 768

  const maxRow = data.length > 0 ? Math.max(...data.map(item => item.y + item.h)) : 0;
  const cols = isMobile ? COLS_MOBILE : COLS_DESKTOP;
  const cellWidth = (screenWidth - (cols + 1) * GRID_GAP) / cols;
  const gridHeight = maxRow > 0 ? maxRow * cellWidth + (maxRow - 1) * GRID_GAP : 0;

  return (
    <div className=''>
      <div
        className="relative "
        style={{ height: gridHeight }}
      >
        {data.map(item => (
          <Cell
            key={item.id}
            item={item}
            isMobile={isMobile}
            screenWidth={screenWidth}
          />
        ))}
      </div>
    </div>
  )
}
