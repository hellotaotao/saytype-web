import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('./App.css', import.meta.url), 'utf8')

describe('product presentation and motion', () => {
  it('preserves the whole app window rather than cropping or flattening it', () => {
    const rule = css.match(/\.hero-product img\s*\{([^}]+)\}/)?.[1]
    expect(rule).toContain('height: auto')
    expect(rule).toContain('aspect-ratio: 3 / 2')
    expect(rule).not.toContain('object-fit: cover')
    expect(css).not.toContain('1200 / 480')
  })
  it('keeps the waveform full-color and gives the screenshot half the hero', () => {
    expect(css).toContain('grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr)')
    expect(css).not.toContain('left: 42%')
    expect(css).not.toContain('opacity: 0.6; mask-image')
    expect(css).not.toContain('transparent, #000 40%')
  })
  it('uses a proportional decorative asset and no perpetual animation', () => {
    const rule = css.match(/\.hero-waveform\s*\{([^}]+)\}/)?.[1]
    expect(rule).toContain('height: auto')
    expect(css).not.toContain('infinite')
    expect(css).toContain('prefers-reduced-motion: reduce')
  })
  it('separates screenshot parallax from entrance transforms and staggers title lines', () => {
    expect(css).toMatch(/\.hero-product\s*\{[^}]*translate: 0 var\(--product-scroll/)
    expect(css).toContain('animation-delay: 70ms')
    expect(css).toContain('animation-delay: 140ms')
    expect(css).toContain('--hero-enter-distance: 0px')
  })

  it('uses the hero illustration as a full-bleed scene rather than a side thumbnail', () => {
    const wrap = css.match(/\.hero-illustration-wrap\s*\{([^}]+)\}/)?.[1] ?? ''
    const image = css.match(/\.hero-illustration\s*\{([^}]+)\}/)?.[1] ?? ''
    expect(wrap).toContain('top: 70px')
    expect(wrap).toContain('width: 100%')
    expect(image).toContain('width: max(100%, 1100px)')
    expect(image).toContain('height: auto')
    expect(image).not.toContain('object-fit: cover')
  })

  it('floats the real product screen over the full-scene hero', () => {
    const peek = css.match(/\.hero-product-peek\s*\{([^}]+)\}/)?.[1] ?? ''
    expect(peek).toContain('position: absolute')
    expect(peek).toContain('top: clamp(440px, 35vw, 600px)')
    expect(peek).toContain('left: auto')
    expect(peek).toContain('width: min(48vw, 680px)')
  })

  it('does not override the last mobile workflow row with a stronger desktop selector', () => {
    expect(css).not.toMatch(/\.workflow-list li:last-child\s*\{[^}]*display:\s*block/)
  })

  it('stacks the product section after the illustrated desktop overrides', () => {
    const responsive = css.slice(css.lastIndexOf('@media (max-width: 900px) {'))
    expect(responsive).toContain('.product-layout, .product-copy { grid-template-columns: minmax(0, 1fr); }')
    expect(responsive).toContain('.settings-figure, .capability-list { grid-column: 1; grid-row: auto; }')
  })

  it('focuses the mobile crop on the woman and her laptop', () => {
    const mobileStyles = css.slice(css.lastIndexOf('@media (max-width: 600px) {'))
    const mobileImage = mobileStyles.match(/\.hero-illustration\s*\{([^}]+)\}/)?.[1] ?? ''
    expect(mobileImage).toContain('object-fit: cover')
    expect(mobileImage).toContain('object-position: 75% center')
  })

})
