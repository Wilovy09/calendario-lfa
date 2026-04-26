import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
)

const TEAMS = {
  Osos: 'osos-IZc8MbN6',
  Dinos: 'dinos-Igv8ezEN',
  'Gallos Negros': 'gallos-negros-n5EFXnna',
  Reyes: 'reyes-2RFvjEyo',
  Caudillos: 'caudillos-W8W8Z3oT',
  Raptors: 'raptors-6Jz4dGbH',
  Mexicas: 'mexicas-Cdy0cdqB',
}

const GAMES = [
  { id: 's1-osos-vs-dinos',              home: 'Osos',         away: 'Dinos' },
  { id: 's1-caudillos-vs-raptors',       home: 'Caudillos',    away: 'Raptors' },
  { id: 's1-gallos-negros-vs-reyes',     home: 'Gallos Negros',away: 'Reyes' },
  { id: 's2-dinos-vs-gallos-negros',     home: 'Dinos',        away: 'Gallos Negros' },
  { id: 's2-raptors-vs-mexicas',         home: 'Raptors',      away: 'Mexicas' },
  { id: 's2-caudillos-vs-osos',          home: 'Caudillos',    away: 'Osos' },
  { id: 's3-raptors-vs-dinos',           home: 'Raptors',      away: 'Dinos' },
  { id: 's3-gallos-negros-vs-mexicas',   home: 'Gallos Negros',away: 'Mexicas' },
  { id: 's3-reyes-vs-osos',              home: 'Reyes',        away: 'Osos' },
  { id: 's4-osos-vs-mexicas',            home: 'Osos',         away: 'Mexicas' },
  { id: 's4-raptors-vs-gallos-negros',   home: 'Raptors',      away: 'Gallos Negros' },
  { id: 's4-reyes-vs-caudillos',         home: 'Reyes',        away: 'Caudillos' },
  { id: 's5-caudillos-vs-gallos-negros', home: 'Caudillos',    away: 'Gallos Negros' },
  { id: 's5-reyes-vs-raptors',           home: 'Reyes',        away: 'Raptors' },
  { id: 's5-mexicas-vs-dinos',           home: 'Mexicas',      away: 'Dinos' },
  { id: 's6-osos-vs-raptors',            home: 'Osos',         away: 'Raptors' },
  { id: 's6-dinos-vs-caudillos',         home: 'Dinos',        away: 'Caudillos' },
  { id: 's6-mexicas-vs-reyes',           home: 'Mexicas',      away: 'Reyes' },
  { id: 's7-dinos-vs-reyes',             home: 'Dinos',        away: 'Reyes' },
  { id: 's7-gallos-negros-vs-osos',      home: 'Gallos Negros',away: 'Osos' },
  { id: 's7-mexicas-vs-caudillos',       home: 'Mexicas',      away: 'Caudillos' },
]

async function dismissCookies(page) {
  try {
    await page.click('#onetrust-accept-btn-handler', { timeout: 4000 })
  } catch {}
}

async function scrapeGame(page, game) {
  const url = `https://www.flashscore.com.mx/partido/futbol-americano/${TEAMS[game.home]}/${TEAMS[game.away]}/`

  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await dismissCookies(page)

  try {
    await page.waitForSelector('.loadable.complete', { timeout: 12000 })
  } catch {
    console.log(`  skip: page did not load for ${game.id}`)
    return null
  }

  const quarters = await page.$$eval(
    '[data-testid="wcl-headerSection-text"]',
    (sections) =>
      sections
        .map((el) => {
          const spans = el.querySelectorAll('span')
          const name = spans[0]?.textContent?.trim()
          const scoreText = spans[1]?.querySelector('div')?.textContent?.trim()
          if (!name || !scoreText || !scoreText.includes('-')) return null
          const [home, away] = scoreText.split('-').map((s) => parseInt(s.trim(), 10))
          return { name, home, away }
        })
        .filter(Boolean),
  )

  if (quarters.length === 0) {
    console.log(`  skip: no quarter data for ${game.id}`)
    return null
  }

  const home_score = quarters.reduce((sum, q) => sum + q.home, 0)
  const away_score = quarters.reduce((sum, q) => sum + q.away, 0)

  const byQuarter = {
    q1_home: quarters[0]?.home ?? null, q1_away: quarters[0]?.away ?? null,
    q2_home: quarters[1]?.home ?? null, q2_away: quarters[1]?.away ?? null,
    q3_home: quarters[2]?.home ?? null, q3_away: quarters[2]?.away ?? null,
    q4_home: quarters[3]?.home ?? null, q4_away: quarters[3]?.away ?? null,
  }

  return { quarters, home_score, away_score, ...byQuarter }
}

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.setExtraHTTPHeaders({
    'Accept-Language': 'es-MX,es;q=0.9',
  })

  let updated = 0
  let skipped = 0

  for (const game of GAMES) {
    console.log(`Scraping ${game.id}...`)

    const result = await scrapeGame(page, game)

    if (!result) {
      skipped++
      continue
    }

    console.log(`  quarters:`, result.quarters.map((q) => `${q.name} ${q.home}-${q.away}`).join(', '))
    console.log(`  final: ${result.home_score} - ${result.away_score}`)

    const { q1_home, q1_away, q2_home, q2_away, q3_home, q3_away, q4_home, q4_away } = result
    const { error } = await supabase
      .from('games')
      .update({ home_score: result.home_score, away_score: result.away_score, q1_home, q1_away, q2_home, q2_away, q3_home, q3_away, q4_home, q4_away })
      .eq('id', game.id)

    if (error) {
      console.error(`  ERROR updating ${game.id}:`, error.message)
    } else {
      console.log(`  OK`)
      updated++
    }

    await page.waitForTimeout(800)
  }

  await browser.close()
  console.log(`\nDone: ${updated} updated, ${skipped} skipped`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
