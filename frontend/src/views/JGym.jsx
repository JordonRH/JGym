import { useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { useUI } from '../store/useUI.js'
import { todayISO, weekStartOf, startOfWeek, isoOf } from '../lib/format.js'
import { effectiveRoutines } from '../lib/history.js'
import { importFromApp } from '../sheets.jsx'
import LineChart from '../components/LineChart.jsx'
import Icon from '../components/Icon.jsx'
import { APPEARANCES, appearanceOf, bmi, bmiCategory, validDate, validWeight, readSpreadsheet, weightPreview, spreadsheetCSV, downloadCSV } from '../lib/jgym.js'

const links = [['/home', 'Overview'], ['/today', 'Training'], ['/weight', 'Weight & BMI'], ['/import', 'Import'], ['/appearance', 'Appearance']]
export function JGymNav() {
  const user = useStore(s => s.user), { pathname } = useLocation()
  return <header className="jg-nav"><Link to="/home" className="jg-brand"><span><Icon name="dumbbell" /></span>JGym<span className="jg-brand-note">your own pace</span></Link>
    <nav aria-label="JGym navigation">{links.map(([to, label]) => <Link key={to} to={to} aria-current={pathname === to ? 'page' : undefined}>{label}</Link>)}{user?.admin && <Link to="/admin" aria-current={pathname === '/admin' ? 'page' : undefined}>People</Link>}<Link to="/settings" aria-label="Settings"><Icon name="gear" /></Link></nav>
  </header>
}
function PageHead({ eyebrow, title, children }) { return <div className="jg-heading"><span className="jg-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{children}</p></div> }
function Metric({ label, value, detail }) { return <div className="jg-metric"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div> }
const fmt = n => Number(n).toLocaleString(undefined, { maximumFractionDigits: 1 })
const pointsOf = rows => rows.map(x => ({ d: x.d, t: new Date(x.d + 'T12:00:00').getTime(), y: x.w }))

export default function JGymHome() {
  const { S, user } = useStore(), nav = useNavigate()
  const latest = S.bodyweight.at(-1), first = S.bodyweight[0]
  const week = isoOf(startOfWeek(todayISO(), weekStartOf(S)))
  const sessions = S.workouts.filter(w => w.d >= week && w.d <= todayISO())
  const today = effectiveRoutines(S, todayISO())
  const points = useMemo(() => pointsOf(S.bodyweight.slice(-30)), [S.bodyweight])
  return <main className="jg-page">
    <div className="jg-welcome"><div><span className="jg-eyebrow">A LITTLE STRONGER, A LITTLE AT A TIME</span><h1>{user?.name ? `Hey, ${user.name}.` : 'Make room for you.'}</h1></div><span className="jg-date">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span></div>
    <section className="jg-hero"><div><span className="jg-pill">YOUR SPACE TO SHOW UP</span><h2>Good days start<br />with a little movement.</h2><p>A heavy session, an easy walk, or a well-earned rest.<br className="jg-desktop" /> Find your rhythm. We’ll keep track.</p><button className="jg-button" onClick={() => nav('/workout')}><Icon name="play" />{S.active ? 'Resume your workout' : 'Start a workout'}<span>↗</span></button><Link to="/plan" className="jg-hero-link">Or take a look at your plan →</Link></div><div className="jg-hero-art" aria-hidden="true"><div className="jg-orbit"/><svg viewBox="0 0 240 240"><g transform="rotate(-32 120 120)" fill="currentColor"><rect x="52" y="105" width="136" height="30" rx="15"/><rect x="45" y="70" width="30" height="100" rx="12"/><rect x="24" y="87" width="21" height="66" rx="9"/><rect x="165" y="70" width="30" height="100" rx="12"/><rect x="195" y="87" width="21" height="66" rx="9"/></g></svg><span>Progress feels different<br />for everyone.</span></div></section>
    <section className="jg-metrics" aria-label="Your progress"><Metric label="THIS WEEK" value={sessions.length} detail="workouts in the books"/><Metric label="LATEST WEIGH-IN" value={latest ? `${fmt(latest.w)} ${S.unit}` : '—'} detail={latest ? latest.d : 'Your first check-in starts here'}/><Metric label="YOUR ROUTINES" value={S.routines.length} detail="ways to get moving"/><Metric label="TOTAL SESSIONS" value={S.workouts.length} detail="every one counts"/></section>
    <div className="jg-grid"><section className="jg-panel"><div className="jg-panel-title"><h2>On your radar</h2><Link to="/plan">View plan ↗</Link></div><div className="jg-session-icon"><Icon name="calendar"/></div><h3>{S.active ? 'A session is waiting for you' : today.length ? today.map(r => r.name).join(' + ') : 'A little space in your day'}</h3><p>{S.active ? 'Pick up exactly where you left off.' : today.length ? 'Your plan is ready when you are.' : 'No workout scheduled. Enjoy the breather, or make it a movement day.'}</p><button className="jg-button secondary" onClick={() => nav(S.active ? '/workout' : '/today')}>{S.active ? 'Resume session' : 'Open today'} →</button></section>
      <section className="jg-panel"><div className="jg-panel-title"><h2>The bigger picture</h2><Link to="/weight">Weight & BMI ↗</Link></div>{latest ? <><div className="jg-chart-number">{fmt(latest.w)} <small>{S.unit}</small></div><p>{S.bodyweight.length > 1 ? `${fmt(latest.w - first.w)} ${S.unit} since your first check-in` : 'Your first point on the chart.'}</p><LineChart points={points} unit={S.unit} h={155}/></> : <div className="jg-empty"><Icon name="chart"/><h3>Small check-ins. A clearer picture.</h3><p>Log your weight to start seeing your own trend.</p><Link to="/weight">Add your first weigh-in →</Link></div>}</section></div>
    <section className="jg-import-callout"><div><span className="jg-eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>Your history belongs here, too.</h2><p>Bring your existing workouts and weigh-ins from CSV or Excel.</p></div><Link className="jg-button secondary" to="/import">Bring in your data ↗</Link></section>
    <footer className="jg-footer">JGym · Move at your own pace.<span>Built on <a href="https://github.com/DuarteSantos8/openGym">openGym</a> · <a href="https://github.com/JordonRH/JGym">Source & licence</a></span></footer>
  </main>
}

export function WeightPage() {
  const { S, update } = useStore(), toast = useUI(s => s.toast)
  const [date, setDate] = useState(todayISO()), [weight, setWeight] = useState(''), [height, setHeight] = useState(S.jgymHeightCm || ''), [goal, setGoal] = useState(S.targetW || ''), [error, setError] = useState('')
  const [range, setRange] = useState('all'), [remove, setRemove] = useState(null)
  const latest = S.bodyweight.at(-1), value = bmi(latest?.w, S.jgymHeightCm, S.unit)
  const points = useMemo(() => { const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - Number(range)); return pointsOf(S.bodyweight.filter(x => range === 'all' || x.d >= isoOf(cutoff))) }, [S.bodyweight, range])
  function save(e) {
    e.preventDefault()
    if (!validDate(date) || date > todayISO() || !validWeight(weight, S.unit)) return setError('Enter a valid date up to today and a positive weight.')
    update(s => { const entry = s.bodyweight.find(x => x.d === date); if (entry) { entry.w = Number(weight); entry.t = Date.now() } else s.bodyweight.push({ d: date, w: Number(weight), t: Date.now() }); s.bodyweight.sort((a,b) => a.d.localeCompare(b.d)) })
    setWeight(''); setError(''); toast('Weigh-in saved')
  }
  function saveProfile(e) {
    e.preventDefault()
    if (height !== '' && (!Number.isFinite(Number(height)) || Number(height) < 50 || Number(height) > 260)) return setError('Height must be between 50 and 260 cm.')
    if (goal !== '' && !validWeight(goal, S.unit)) return setError('Enter a positive goal weight, or leave it blank.')
    update(s => { s.jgymHeightCm = height === '' ? null : Number(height); s.targetW = goal === '' ? null : Number(goal) }); setError(''); toast('Details saved')
  }
  return <main className="jg-page"><PageHead eyebrow="CHECK IN, WITHOUT THE PRESSURE" title="A little perspective.">Weight is one part of the picture. Watch the trend, take your time.</PageHead>
    {error && <p role="alert" className="jg-error">{error}</p>}
    <div className="jg-grid"><section className="jg-panel"><h2>Log a weigh-in</h2><form onSubmit={save} className="jg-form"><label>Date<input type="date" required max={todayISO()} value={date} onChange={e => setDate(e.target.value)}/></label><label>Weight ({S.unit})<input type="number" min="0.1" step="any" required value={weight} onChange={e => setWeight(e.target.value)} placeholder={latest ? String(latest.w) : 'e.g. 75.5'}/></label>{S.bodyweight.some(x => x.d === date) && <p>This date already has a weigh-in. Saving will update it.</p>}<button className="jg-button">Save weigh-in <span>+</span></button></form></section>
    <section className="jg-panel"><h2>Your details</h2><form onSubmit={saveProfile} className="jg-form"><label>Height (cm)<input type="number" min="50" max="260" step="any" value={height} onChange={e => setHeight(e.target.value)} placeholder="For your BMI calculation"/></label><label>Goal weight ({S.unit}, optional)<input type="number" min="0.1" step="any" value={goal} onChange={e => setGoal(e.target.value)} placeholder="Only if it helps you"/></label><button className="jg-button secondary">Save details</button></form></section></div>
    <div className="jg-grid jg-weight-grid"><section className="jg-panel"><div className="jg-panel-title"><h2>Your weight over time</h2><select aria-label="Chart period" value={range} onChange={e => setRange(e.target.value)}><option value="all">All time</option><option value="30">30 days</option><option value="90">90 days</option></select></div><div className="jg-chart-number">{latest ? fmt(latest.w) : '—'} <small>{S.unit}</small></div><LineChart points={points} unit={S.unit} goal={S.targetW} h={210}/></section><section className="jg-panel jg-bmi"><span className="jg-eyebrow">ADULT BMI CHECK</span><div className="jg-chart-number">{value == null ? '—' : value.toFixed(1)}</div><h3>{bmiCategory(value)}</h3><p>{latest ? `Based on your latest weigh-in (${latest.d}) and saved height.` : 'Log a weigh-in and save your height to calculate BMI.'}</p><div className="jg-bmi-scale" aria-hidden="true"/><p className="jg-fine">For adults aged 20+. BMI is a screening measure, not a diagnosis, and does not distinguish muscle from fat. It is not suitable for assessing pregnancy or children.</p><a className="jg-fine" href="https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html" target="_blank" rel="noreferrer">About BMI categories ↗</a></section></div>
    <section className="jg-panel"><div className="jg-panel-title"><h2>Your check-ins</h2><button disabled={!S.bodyweight.length} onClick={() => downloadCSV('jgym-weight.csv', [['date','weight','unit'], ...S.bodyweight.map(x => [x.d,x.w,S.unit])])}>Export CSV ↗</button></div>{!S.bodyweight.length ? <p>No weigh-ins yet. Start above, or <Link to="/import">import existing data</Link>.</p> : <div className="jg-table-wrap"><table><thead><tr><th>Date</th><th>Weight</th><th>Actions</th></tr></thead><tbody>{[...S.bodyweight].reverse().map(x => <tr key={x.d}><td>{x.d}</td><td>{fmt(x.w)} {S.unit}</td><td><button onClick={() => { setDate(x.d); setWeight(String(x.w)); window.scrollTo({top:0,behavior:'smooth'}) }}>Edit</button> · {remove === x.d ? <><button onClick={() => { update(s => { s.bodyweight = s.bodyweight.filter(b => b.d !== x.d) }); setRemove(null) }}>Confirm delete</button> <button onClick={() => setRemove(null)}>Cancel</button></> : <button onClick={() => setRemove(x.d)}>Delete</button>}</td></tr>)}</tbody></table></div>}</section>
  </main>
}

export function AppearancePage() {
  const { S, update } = useStore()
  const current = S.jgymAppearance === 'classic' ? 'classic' : appearanceOf(S.jgymAppearance).id
  return <main className="jg-page"><PageHead eyebrow="MAKE YOURSELF AT HOME" title="Set the mood.">Three ways to feel at home. Your appearance follows your profile.</PageHead><div className="jg-themes">{APPEARANCES.map(a => <button className={'jg-theme-card ' + a.id} key={a.id} aria-pressed={a.id === current} onClick={() => update(s => { s.jgymAppearance = a.id; s.theme = a.theme; s.accent = 'custom'; s.accentCustom = a.accent })}><div className="jg-theme-preview"><i/><div><b/><b/><b/></div><span/></div><div className="jg-theme-caption"><strong>{a.name}</strong><span>{current === a.id ? 'Selected ✓' : 'Choose theme'}</span><p>{a.detail}</p></div></button>)}</div><p className="jg-fine">For OpenGym’s original light/dark and custom accent controls, <Link to="/settings/look" onClick={() => update(s => { s.jgymAppearance = 'classic' })}>use classic appearance</Link>.</p></main>
}

export function ImportPage() {
  const { S, update, user } = useStore(), toast = useUI(s => s.toast), ref = useRef(null)
  const [sheets,setSheets] = useState([]), [sheet,setSheet] = useState(0), [kind,setKind] = useState('weight'), [busy,setBusy] = useState(false), [error,setError] = useState(''), [name,setName] = useState(''), [preview,setPreview] = useState(null)
  const [map,setMap] = useState({ date:0, weight:1, unit:-1 }), [sourceUnit,setSourceUnit] = useState(S.unit)
  const rows = sheets[sheet]?.rows || [], headers = rows[0] || []
  function selectSheet(all, index) { setSheet(index); setPreview(null); const h = (all[index]?.rows[0] || []).map(x => String(x).trim().toLowerCase()); setMap({ date: Math.max(0,h.findIndex(x => /^(date|day)$/.test(x))), weight: Math.max(0,h.findIndex(x => /^(weight|bodyweight|body weight|weight_kg|weight \(kg\))$/.test(x))), unit:h.findIndex(x => x === 'unit' || x === 'weight unit') }) }
  async function choose(file) { if (!file) return; setBusy(true); setError(''); setPreview(null); setSheets([]); try { const all = await readSpreadsheet(file); if (!all.length || all.every(s => s.rows.length < 2)) throw new Error('Include a header row and at least one data row.'); setSheets(all); setName(file.name); selectSheet(all,0) } catch(e) { setError(e.message) } finally { setBusy(false) } }
  function review() {
    setError('')
    if (kind === 'workout') { const file = new File([spreadsheetCSV(rows)], 'jgym-workouts.csv', {type:'text/csv'}); importFromApp(file); return }
    if (map.date === map.weight || (map.unit >= 0 && [map.date,map.weight].includes(map.unit))) return setError('Choose different columns for date, weight, and unit.')
    const converted = rows.slice(1).map(row => map.unit < 0 ? Array.from({length:headers.length + 1}, (_,i) => i === headers.length ? sourceUnit : row[i]) : row)
    const result = weightPreview(converted, {...map,unit:map.unit < 0 ? headers.length : map.unit},S.unit,S.bodyweight)
    const future = result.entries.filter(x => x.d > todayISO())
    if (future.length) result.errors.push('Future dates are not supported. Correct them before importing.')
    setPreview(result)
  }
  function commit() {
    const result = preview
    if (!result || result.errors.length || !result.entries.length) return
    let count = 0
    update(s => { const days = new Set(s.bodyweight.map(x => x.d)); result.entries.forEach(x => { if (!days.has(x.d)) { s.bodyweight.push({...x,t:Date.now()}); days.add(x.d); count++ } }); s.bodyweight.sort((a,b) => a.d.localeCompare(b.d)) })
    setPreview(null); setSheets([]); toast(`${count} weigh-ins imported`)
  }
  return <main className="jg-page"><PageHead eyebrow="YOUR HISTORY, IN ONE PLACE" title="Bring the good work with you.">Import CSV or Excel (.xlsx) into {user?.name ? `${user.name}’s` : 'your current'} profile. Review everything before saving.</PageHead>
    <div className="jg-grid"><section className="jg-panel"><h2>1. Choose your data</h2><div className="jg-segment">{[['weight','Weigh-ins'],['workout','Workouts']].map(([v,l]) => <button key={v} aria-pressed={kind === v} onClick={() => {setKind(v);setPreview(null)}}>{l}</button>)}</div><button className="jg-drop" disabled={busy} onClick={() => ref.current.click()}><Icon name="download"/><strong>{busy ? 'Reading your file…' : name && sheets.length ? name : 'Choose a CSV or Excel file'}</strong><span>CSV / XLSX · up to 10 MB · 20,000 rows</span></button><input ref={ref} type="file" accept=".csv,.xlsx" hidden onChange={e => {choose(e.target.files?.[0]);e.target.value=''}}/><p className="jg-fine">Files are parsed in your browser. Imported records sync to your account. For older .xls files, save as .xlsx first.</p><button className="jg-text-button" onClick={() => downloadCSV(`jgym-${kind}-template.csv`, kind === 'weight' ? [['date','weight','unit'],['2026-01-01','75','kg']] : [['Date','Workout Name','Exercise Name','Weight','Reps'],['2026-01-01','Full body','Barbell Bench Press','40','8']])}>Download a {kind === 'weight' ? 'weigh-in' : 'workout'} template ↓</button></section>
    <section className="jg-panel"><h2>A fresh start. Same history.</h2><p>Weigh-ins use one entry per day. Existing dates and duplicate rows are skipped, so importing twice won’t double your records.</p><p>Workout imports use OpenGym’s exercise matching and review screen, including FitNotes, Strong and Hevy exports.</p><p>Import each person’s data while signed into their profile.</p><Link to="/settings/data">Restore an OpenGym JSON or ZIP backup →</Link></section></div>
    {error && <p role="alert" className="jg-error">{error}</p>}
    {!!sheets.length && <section className="jg-panel"><h2>2. Review your columns</h2><div className="jg-form"><label>Worksheet<select aria-label="Worksheet" value={sheet} onChange={e => selectSheet(sheets,Number(e.target.value))}>{sheets.map((s,i) => <option key={i} value={i}>{s.name}</option>)}</select></label>{kind === 'weight' && <div className="jg-columns">{[['date','Date column'],['weight','Weight column'],['unit','Unit column']].map(([key,label]) => <label key={key}>{label}<select value={map[key]} onChange={e => {setMap({...map,[key]:Number(e.target.value)});setPreview(null)}}>{key === 'unit' && <option value={-1}>Use selected unit</option>}{headers.map((h,i) => <option key={i} value={i}>{String(h || `Column ${i+1}`)}</option>)}</select></label>)}{map.unit < 0 && <label>File weight unit<select value={sourceUnit} onChange={e => {setSourceUnit(e.target.value);setPreview(null)}}><option value="kg">Kilograms</option><option value="lb">Pounds</option></select></label>}</div>}</div><p className="jg-fine">{rows.length - 1} rows. First five shown below. Use YYYY-MM-DD dates for weigh-ins.</p><div className="jg-table-wrap"><table><thead><tr>{headers.map((h,i) => <th key={i}>{String(h)}</th>)}</tr></thead><tbody>{rows.slice(1,6).map((row,i) => <tr key={i}>{headers.map((_,j) => <td key={j}>{row[j] instanceof Date ? validDate(row[j]) : String(row[j] ?? '')}</td>)}</tr>)}</tbody></table></div><button className="jg-button" onClick={review}>Preview import →</button></section>}
    {preview && <section className="jg-panel" aria-live="polite"><h2>3. Ready when you are</h2><p>{preview.entries.length} new weigh-ins · {preview.duplicates} duplicates skipped · {preview.errors.length} issues</p>{preview.errors.length ? <><p>Fix these issues in your file, then choose it again. Nothing has been saved.</p><ul className="jg-error-list">{preview.errors.slice(0,10).map((x,i) => <li key={i}>{x}</li>)}</ul></> : <><p>Weights will be stored in {S.unit}. Existing entries will stay as they are.</p><button className="jg-button" disabled={!preview.entries.length} onClick={commit}>Import {preview.entries.length} weigh-ins</button></>}</section>}
  </main>
}
