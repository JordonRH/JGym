import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { EXDB, illustrationOf, imgSrc, gifSrc } from './exercises.js'
import map from './exercise-illustrations.json'

describe('bundled illustrations', () => {
  it('all mappings reference existing catalogue entries and shipped SVG frames', () => {
    for (const [id, art] of Object.entries(map)) {
      expect(EXDB.find(e => e.id === id)?.n).toBe(art.name)
      expect(art.frames.length).toBeGreaterThan(0)
      for (const path of art.frames) {
        expect(path).toMatch(/^exercise-media\/everkinetic\/\d{4}-[\w-]+\.svg$/)
        const svg = readFileSync(new URL('../../public/' + path, import.meta.url), 'utf8')
        expect(svg).toContain('<svg')
        expect(svg).not.toMatch(/<script|<foreignObject|\son\w+=/i)
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
