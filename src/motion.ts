export function setupPageMotion(root: HTMLElement): () => void {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const wideViewport = window.matchMedia('(min-width: 901px)')
  const revealed = new WeakSet<Element>()
  let teardown = () => {}

  const configure = () => {
    teardown()
    if (reducedMotion.matches) return

    const animations = new Set<Animation>()
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || revealed.has(entry.target)) continue
        observer?.unobserve(entry.target)
        if (typeof entry.target.animate !== 'function') continue
        revealed.add(entry.target)
        const animation = entry.target.animate(
          wideViewport.matches
            ? [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }]
            : [{ opacity: 0 }, { opacity: 1 }],
          {
            duration: wideViewport.matches ? 650 : 400,
            delay: wideViewport.matches ? Number((entry.target as HTMLElement).dataset.revealDelay || 0) : 0,
            fill: 'backwards',
            easing: 'cubic-bezier(0.2, 0.75, 0.2, 1)',
          },
        )
        animations.add(animation)
        animation.onfinish = () => animations.delete(animation)
      }
    }, { threshold: 0.08 })
    root.querySelectorAll('.reveal-target').forEach((element) => {
      if (!revealed.has(element)) observer?.observe(element)
    })

    teardown = () => {
      observer?.disconnect()
      animations.forEach((animation) => animation.cancel())
      animations.clear()
    }
  }
  configure()
  reducedMotion.addEventListener('change', configure)
  wideViewport.addEventListener('change', configure)
  return () => {
    teardown()
    reducedMotion.removeEventListener('change', configure)
    wideViewport.removeEventListener('change', configure)
  }
}
