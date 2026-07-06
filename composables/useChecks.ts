import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import type { WeekChecks } from '~/types'

let unsub: (() => void) | null = null
let pushTimer: ReturnType<typeof setTimeout> | null = null

const EMPTY: WeekChecks = { shopping: {}, labels: {} }

/** Realtime-отметки недели households/{hid}/checks/{weekId} с троттлингом записи. */
export function useChecks() {
  const { $firebase } = useNuxtApp() as any
  const { hid } = useHousehold()
  const { weekId } = useWeek()
  const checks = useState<WeekChecks>('checks', () => ({ shopping: {}, labels: {} }))

  function subscribe() {
    if (!import.meta.client || !$firebase.db || !hid.value) return
    if (unsub) { unsub(); unsub = null }
    const ref = doc($firebase.db, 'households', hid.value, 'checks', weekId.value)
    unsub = onSnapshot(ref, (snap) => {
      const d = snap.exists() ? (snap.data() as Partial<WeekChecks>) : EMPTY
      checks.value = { shopping: d.shopping || {}, labels: d.labels || {} }
    })
  }

  function schedulePush() {
    if (pushTimer) clearTimeout(pushTimer)
    pushTimer = setTimeout(() => {
      setDoc(doc($firebase.db, 'households', hid.value!, 'checks', weekId.value), checks.value)
        .catch((e) => console.error('checks push failed', e))
    }, 800)
  }

  function toggleShopping(name: string) {
    const next = { ...checks.value.shopping }
    if (next[name]) delete next[name]
    else next[name] = true
    checks.value = { ...checks.value, shopping: next }
    schedulePush()
  }

  function toggleLabel(date: string, labelId: string) {
    const day = { ...(checks.value.labels[date] || {}) }
    if (day[labelId]) delete day[labelId]
    else day[labelId] = true
    checks.value = { ...checks.value, labels: { ...checks.value.labels, [date]: day } }
    schedulePush()
  }

  const isLabelDone = (date: string, labelId: string) => !!checks.value.labels[date]?.[labelId]

  return { checks, subscribe, toggleShopping, toggleLabel, isLabelDone }
}
