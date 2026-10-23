import { useEffect, useState } from 'react'
import { imgSrc, illustrationOf, isCustomEx } from '../lib/exercises.js'
import { MOBILE } from '../lib/mobile.js'
import { useStore } from '../store/useStore.js'
import { t, exerciseNameFor } from '../lib/i18n.js'
import Icon from './Icon.jsx'
import SOURCES from '../lib/exercise-image-sources.json'
import CustomMedia, { CustomThumb } from './CustomMedia.jsx'

// An exercise's picture, wherever one shows. A custom exercise goes to CustomMedia.jsx — its own
// photo, GIF, video or link, from the local media store — and never through imgSrc/gifSrc, which
// name files of the shipped dataset (a stray img/gif on a custom exercise, written by a fork, is
// ignored). The split is by component, not by branch, so each side keeps its own hooks in order.
export default function Media(p) {
  return isCustomEx(p.ex) ? <CustomMedia {...p} /> : <BuiltinMedia {...p} />
}

// Static demonstration frames are labelled as such, never presented as an animation.
function BuiltinMedia({ ex, id, compact, minimizable }) {
  const art = illustrationOf(ex)
  const [selection, setSelection] = useState({ id: null, frame: 0 })
  const [failed, setFailed] = useState(null)
  const gifSize = useStore(s => s.S.gifSize)
  const update = useStore(s => s.update)
  if (minimizable && gifSize === 'off') return null
  if (!art) return <p className="small dim jg-media-missing">No free demonstration image available for this exercise yet.</p>
  const source = SOURCES[art.source || 'everkinetic']
  const frame = selection.id === ex.id ? selection.frame : 0
  const src = art.frames[frame]
  const mini = minimizable && gifSize === 'mini'
  return <figure id={id} data-image-background={source.dark ? 'dark' : 'light'} className={'jg-illustration' + (compact ? ' compact' : '') + (mini ? ' mini' : '')}>
    {failed === src
      ? <p role="status">Image could not load. <button onClick={() => setFailed(null)}>Retry</button></p>
      : <img src={src} alt={`${exerciseNameFor(ex)} — demonstration ${frame + 1} of ${art.frames.length}`} onError={() => setFailed(src)} />}
    <figcaption>
      <div className="jg-frame-controls" aria-label="Demonstration frames">
        {art.frames.length > 1 && art.frames.map((_, i) => <button key={i} aria-pressed={frame === i}
          onClick={() => setSelection({ id: ex.id, frame: i })}>Position {i + 1}</button>)}
        {minimizable && <button className="giftoggle" onClick={() => update(s => { s.gifSize = mini ? 'full' : 'mini' })}>
          {mini ? t('Expand') : t('Minimize')}</button>}
      </div>
      <small>{source.aiGenerated ? 'AI-generated illustration: ' : 'Illustration: '}<a href={source.url} target="_blank" rel="noreferrer">{source.creator}</a>
        {' · '}<a href={source.licensePath} target="_blank" rel="noreferrer">{source.license}</a>
        {art.source === 'guide' && <> · <a href="exercise-media/provenance.json" target="_blank" rel="noreferrer">Frame credits</a></>}</small>
    </figcaption>
  </figure>
}

// In the phone app the clips come out of the app package through Capacitor's local server, which
// answers every seek with a fresh, slow read: each loop jumped back to 0 and sat there for one to
// five seconds, and users saw "slow and buggy" animations (the web, with its HTTP cache, never
// did). So the app reads a clip into memory once (20-40 KB) and plays it from there; the last few
// stay, so reopening an exercise is instant. The web keeps its URL and the browser's cache.
const MEMORY_CLIPS = 30
const clipCache = new Map()          // src -> object URL, oldest first
const clipLoads = new Map()          // src -> pending promise
function loadClip(src) {
  if (clipCache.has(src)) {
    const url = clipCache.get(src)
    clipCache.delete(src); clipCache.set(src, url)   // most recently used last
    return Promise.resolve(url)
  }
  if (!clipLoads.has(src)) {
    clipLoads.set(src, fetch(src)
      .then(r => (r.ok ? r.blob() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(blob => {
        const url = URL.createObjectURL(blob)
        clipCache.set(src, url)
        while (clipCache.size > MEMORY_CLIPS) {
          const [old, oldUrl] = clipCache.entries().next().value
          clipCache.delete(old); URL.revokeObjectURL(oldUrl)
        }
        return url
      })
      .finally(() => clipLoads.delete(src)))
  }
  return clipLoads.get(src)
}

export function useClipInMemory(src, inApp = MOBILE) {
  const [url, setUrl] = useState(() => (src && inApp ? clipCache.get(src) || null : src))
  useEffect(() => {
    if (!src || !inApp) { setUrl(src); return }
    let alive = true
    setUrl(clipCache.get(src) || null)
    // A read that fails falls back to the URL itself: playing slowly beats not playing.
    loadClip(src).then(u => { if (alive) setUrl(u) }, () => { if (alive) setUrl(src) })
    return () => { alive = false }
  }, [src, inApp])
  return url
}

// React sets `muted` as a property only, never as the attribute, and Android's WebView (the phone
// app) allows autoplay only for a video that carries the attribute: the loop sat on its first frame
// there while every desktop browser played it. Set it before the first frame and start playback
// ourselves; a refusal leaves the still showing, which a tap can still start.
export function autoplayMuted(el) {
  if (!el) return
  el.muted = true
  el.defaultMuted = true
  el.setAttribute('muted', '')
  const p = el.play?.()
  if (p && typeof p.catch === 'function') p.catch(() => {})
}

// A still that will not load (offline and never cached, a lapsed session on a gated instance, a
// CDN hiccup) gets the same neutral tile as an exercise without media, instead of the browser's
// broken-image glyph in a list of them (#281). The failure is remembered per image, so a list
// that re-renders does not ask again; a new exercise in the same slot tries its own.
export function Thumb(p) {
  return isCustomEx(p.ex) ? <CustomThumb {...p} /> : <BuiltinThumb {...p} />
}
function BuiltinThumb({ ex }) {
  const src = illustrationOf(ex) ? imgSrc(ex) : null
  const [broken, setBroken] = useState(null)
  if (!src || broken === src) return <div className="thumb thumb-x" role="img" aria-label="No demonstration image"><Icon name="dumbbell" /></div>
  return <img className="thumb" data-image-background={SOURCES[illustrationOf(ex)?.source || 'everkinetic']?.dark ? 'dark' : 'light'} loading="lazy" decoding="async" draggable={false} src={src} alt="" onError={() => setBroken(src)} />
}
