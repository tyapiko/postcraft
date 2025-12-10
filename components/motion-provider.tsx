'use client'

import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion'
import { ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface MotionProviderProps {
  children: ReactNode
}

/**
 * Provider component that wraps the app with motion configuration
 * Automatically respects user's prefers-reduced-motion setting
 */
export function MotionProvider({ children }: MotionProviderProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig
        reducedMotion={prefersReducedMotion ? 'always' : 'never'}
        transition={prefersReducedMotion ? { duration: 0 } : undefined}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  )
}
