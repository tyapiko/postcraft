'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to detect if the user prefers reduced motion
 * Returns true if the user has enabled reduced motion in their OS settings
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

/**
 * Returns animation variants that respect reduced motion preference
 * Use with Framer Motion components
 */
export function useMotionVariants() {
  const prefersReducedMotion = useReducedMotion()

  // Variants that disable animation when reduced motion is preferred
  const fadeInUp = prefersReducedMotion
    ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

  const fadeIn = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 } }

  const scaleIn = prefersReducedMotion
    ? { initial: { opacity: 1, scale: 1 }, animate: { opacity: 1, scale: 1 } }
    : { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } }

  // Transition settings
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: 'easeOut' }

  const staggerTransition = (delay: number) => prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.5, delay, ease: 'easeOut' }

  return {
    prefersReducedMotion,
    fadeInUp,
    fadeIn,
    scaleIn,
    transition,
    staggerTransition,
  }
}
