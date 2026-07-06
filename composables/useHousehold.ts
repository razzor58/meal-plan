import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { Household } from '~/types'

const DEFAULT_TARGETS = {
  'Илья': { kcal: 2600, p: 170, f: 85, c: 290 },
  'Ира': { kcal: 1900, p: 120, f: 65, c: 210 }
}

/** Генерация неугадываемого ID семьи (url-safe, ~22 симв). */
function randomId(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Резолвит семью без логина: сперва из ссылки #h=<hid>, затем из localStorage.
 * Если нигде нет — hid остаётся null и UI покажет экран «Создать семью».
 */
export function useHousehold() {
  const { $firebase } = useNuxtApp() as any
  const hid = useState<string | null>('hid', () => null)
  const household = useState<Household | null>('household', () => null)
  const ready = useState<boolean>('household-ready', () => false)

  function applyLink() {
    if (!import.meta.client) return
    const m = location.hash.match(/h=([A-Za-z0-9_-]+)/)
    if (m) {
      localStorage.setItem('hid', m[1])
      history.replaceState(null, '', location.pathname + location.search)
    }
  }

  async function init() {
    if (!import.meta.client) return
    applyLink()
    await $firebase.ready
    hid.value = localStorage.getItem('hid')
    if (hid.value && $firebase.db) {
      const snap = await getDoc(doc($firebase.db, 'households', hid.value))
      household.value = snap.exists() ? (snap.data() as Household) : null
    }
    ready.value = true
  }

  async function createHousehold(): Promise<string> {
    const id = randomId()
    const data: Household = { title: 'Наш план', targets: { ...DEFAULT_TARGETS } }
    await setDoc(doc($firebase.db, 'households', id), data)
    localStorage.setItem('hid', id)
    hid.value = id
    household.value = data
    return id
  }

  function shareLink(): string {
    const base = location.origin + location.pathname
    return `${base}#h=${hid.value}`
  }

  return { hid, household, ready, init, createHousehold, shareLink }
}
