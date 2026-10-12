import { afterEach, describe, expect, it, vi } from 'vitest'
import { setupPageMotion } from './motion'

class MediaQuery extends EventTarget {
  constructor(public matches: boolean) { super() }
  set(matches: boolean) { this.matches = matches; this.dispatchEvent(new Event('change')) }
}

function fixture(reduce = false) {
  const reduced = new MediaQuery(reduce)
  const fine = new MediaQuery(true)
  const wide = new MediaQuery(true)
  const win = Object.assign(new EventTarget(), { innerHeight: 800, matchMedia: (query: string) => query.includes('reduced-motion') ? reduced : query.includes('min-width') ? wide : fine })
  const bounds = { left: 0, top: 0, bottom: 100, width: 100, height: 100 }
  const hero = new EventTarget()
  const style = { setProperty: vi.fn(), removeProperty: vi.fn() }
  const animation = { cancel: vi.fn(), onfinish: null as (() => void) | null }
  const target = { animate: vi.fn(() => animation), dataset: { revealDelay: '120' } }
  const observe = vi.fn()
  const unobserve = vi.fn()
  const disconnect = vi.fn()
  let deliver: IntersectionObserverCallback = () => {}
  const createObserver = vi.fn()
  class Observer {
    observe = observe
    unobserve = unobserve
    disconnect = disconnect
    constructor(callback: IntersectionObserverCallback) { createObserver(); deliver = callback }
  }
  let frameId = 0
  const frames = new Map<number, FrameRequestCallback>()
  const raf = vi.fn((callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId })
  const cancel = vi.fn((id: number) => { frames.delete(id) })
  const doc = Object.assign(new EventTarget(), { hidden: false })
  Object.assign(hero, { getBoundingClientRect: () => bounds })
  const root = {
    querySelectorAll: () => [target],
    querySelector: (selector: string) => selector === '.hero-section' ? hero : { style },
  } as unknown as HTMLElement
  vi.stubGlobal('window', win)
  vi.stubGlobal('document', doc)
  vi.stubGlobal('IntersectionObserver', Observer)
  vi.stubGlobal('requestAnimationFrame', raf)
  vi.stubGlobal('cancelAnimationFrame', cancel)
  const intersect = (visible: boolean) => deliver([{ isIntersecting: visible, target } as unknown as IntersectionObserverEntry], {} as IntersectionObserver)
  const move = (pointerType = 'mouse') => hero.dispatchEvent(Object.assign(new Event('pointermove'), { pointerType, clientX: 1000, clientY: 1000 }))
  return { root, win, bounds, wide, reduced, fine, hero, style, animation, target, observe, unobserve, disconnect, createObserver, intersect, move, raf, cancel, doc, frame: () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback(0)) } }
}

afterEach(() => { vi.unstubAllGlobals() })

describe('scoped page motion', () => {
  it('does not set up animations with reduced motion enabled', () => {
    const f = fixture(true)
    const cleanup = setupPageMotion(f.root)
    expect(f.createObserver).not.toHaveBeenCalled()
    cleanup()
  })

  it('reveals only intersecting sections and releases each observed target', () => {
    const f = fixture()
    const cleanup = setupPageMotion(f.root)
    expect(f.observe).toHaveBeenCalledWith(f.target)
    f.intersect(false)
    expect(f.target.animate).not.toHaveBeenCalled()
    f.intersect(true)
    expect(f.target.animate).toHaveBeenCalledOnce()
    expect(f.unobserve).toHaveBeenCalledWith(f.target)
    cleanup()
    expect(f.animation.cancel).toHaveBeenCalledOnce()
    expect(f.disconnect).toHaveBeenCalledOnce()
  })

  it('cancels active work when reduced motion changes and removes listeners on teardown', () => {
    const f = fixture()
    const cleanup = setupPageMotion(f.root)
    f.intersect(true)
    f.reduced.set(true)
    expect(f.animation.cancel).toHaveBeenCalledOnce()
    cleanup()
    const observerCount = f.createObserver.mock.calls.length
    f.reduced.set(false)
    expect(f.createObserver).toHaveBeenCalledTimes(observerCount)
  })

  it('does not replay sections after motion preferences change', () => {
    const f = fixture()
    const cleanup = setupPageMotion(f.root)
    f.intersect(true)
    f.reduced.set(true)
    f.reduced.set(false)
    expect(f.observe).toHaveBeenCalledOnce()
    cleanup()
  })

  it('leaves content untouched if IntersectionObserver is unavailable', () => {
    const f = fixture()
    vi.stubGlobal('IntersectionObserver', undefined)
    const cleanup = setupPageMotion(f.root)
    expect(f.target.animate).not.toHaveBeenCalled()
    cleanup()
  })

  it('uses only fades on small screens', () => {
    const f = fixture()
    f.wide.matches = false
    const cleanup = setupPageMotion(f.root)
    f.intersect(true)
    expect(f.target.animate).toHaveBeenCalledWith(
      [{ opacity: 0 }, { opacity: 1 }], expect.objectContaining({ delay: 0 }),
    )
    cleanup()
  })

  it('staggers marked product imagery behind the section copy on desktop', () => {
    const f = fixture()
    const cleanup = setupPageMotion(f.root)
    f.intersect(true)
    expect(f.target.animate).toHaveBeenCalledWith(expect.any(Array), expect.objectContaining({ delay: 120, fill: 'backwards' }))
    cleanup()
  })

})
