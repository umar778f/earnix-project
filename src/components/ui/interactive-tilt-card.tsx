"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface InteractiveTiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  maxTilt?: number
  perspective?: number
}

/**
 * Lightweight, accessible interactive card with subtle 3D perspective tilt.
 * Honors prefers-reduced-motion and disables transforms on touch devices.
 */
export function InteractiveTiltCard({
  children,
  className,
  maxTilt = 3.5,
  perspective = 1000,
  ...props
}: InteractiveTiltCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const [transformStyle, setTransformStyle] = React.useState<React.CSSProperties>({})
  const [isHovered, setIsHovered] = React.useState(false)

  const prefersReducedMotion = React.useRef(false)
  const isTouchDevice = React.useRef(false)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      isTouchDevice.current = window.matchMedia("(pointer: coarse)").matches
    }
  }, [])

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion.current || isTouchDevice.current || !cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Subtle tilt: max ~3.5 degrees
    const rotateX = -((y - centerY) / centerY) * maxTilt
    const rotateY = ((x - centerX) / centerX) * maxTilt

    setTransformStyle({
      transform: `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`,
      transition: "transform 120ms ease-out, box-shadow 200ms ease",
    })
  }

  const handlePointerEnter = () => {
    if (prefersReducedMotion.current || isTouchDevice.current) return
    setIsHovered(true)
  }

  const handlePointerLeave = () => {
    if (prefersReducedMotion.current || isTouchDevice.current) return
    setIsHovered(false)
    setTransformStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) translateY(0px)`,
      transition: "transform 350ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms ease",
    })
  }

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={transformStyle}
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-xs transition-[box-shadow,border-color] duration-200",
        isHovered && "shadow-md border-border/80",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
