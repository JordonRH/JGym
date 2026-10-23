import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { EXDB, illustrationOf, imgSrc, gifSrc } from './exercises.js'
import map from './exercise-illustrations.json'
import sources from './exercise-image-sources.json'

describe('bundled illustrations', () => {
  it('all mappings reference existing catalogue entries and shipped safe SVG/WebP frames', () => {
    for (const [id, art] of Object.entries(map)) {
      expect(EXDB.find(e => e.id === id)?.n).toBe(art.name)
      expect(art.frames.length).toBeGreaterThan(0)
      expect(sources[art.source]).toBeDefined()
      expect(existsSync(new URL('../../public/' + sources[art.source].licensePath, import.meta.url))).toBe(true)
      for (const path of art.frames) {
        expect(path).toMatch(/^exercise-media\/(everkinetic|open|guide)\/[\w/-]+\.(svg|webp)$/)
        const bytes = readFileSync(new URL('../../public/' + path, import.meta.url))
        if (path.endsWith('.webp')) {
          expect(bytes.toString('ascii', 0, 4)).toBe('RIFF')
          expect(bytes.toString('ascii', 8, 12)).toBe('WEBP')
          continue
        }
        const svg = bytes.toString('utf8')
        expect(svg).toContain('<svg')
        expect(svg).not.toMatch(/<script|<foreignObject|\son\w+=|(?:href|src)=["'](?:https?:|javascript:)/i)
      }
    }
    expect(existsSync(new URL('../../public/exercise-media/everkinetic/LICENSE.md', import.meta.url))).toBe(true)
  })
  it('matches exact IDs without guessing, including custom IDs that collide', () => {
    expect(imgSrc({id:'0025'})).toContain('0042-relaxation.svg')
    expect(gifSrc({id:'0025'})).toContain('0042-tension.svg')
    expect(illustrationOf({id:'not-covered',n:'barbell bench press'})).toBeNull()
    expect(illustrationOf({id:'0025',custom:true})).toBeNull()
  })
})
