import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const svg = readFileSync(new URL('../public/jgym-icon.svg',import.meta.url),'utf8')
const browser = await chromium.launch({channel:'chrome',headless:true})
for (const size of [180,512]) {
  const page = await browser.newPage({viewport:{width:size,height:size},deviceScaleFactor:1})
  await page.setContent(`<style>body{margin:0}svg{width:100vw;height:100vh;display:block}</style>${svg}`)
  await page.screenshot({path:fileURLToPath(new URL(`../public/icon-${size}.png`,import.meta.url)),omitBackground:true})
  await page.close()
}
await browser.close()
