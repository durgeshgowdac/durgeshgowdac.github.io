// Stand-in for app/components/useReducedMotion during the render: every scene draws its still frame
// (the one a visitor with reduced motion sees) instead of starting its animation clock.
export const useReducedMotion = () => true