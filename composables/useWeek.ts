import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import type { WeekPlan, Day } from '~/types'

let unsub: (() => void) | null = null

/** Realtime-план текущей недели households/{hid}/weeks/{weekId}. */
export function useWeek() {
  const { $firebase } = useNuxtApp() as any
  const { hid } = useHousehold()
  const weekId = useState<string>('weekId', () => weekIdOf(new Date()))
  const plan = useState<WeekPlan | null>('plan', () => null)
  const loading = useState<boolean>('plan-loading', () => true)

  function subscribe() {
    if (!import.meta.client || !$firebase.db || !hid.value) return
    if (unsub) { unsub(); unsub = null }
    loading.value = true
    const ref = doc($firebase.db, 'households', hid.value, 'weeks', weekId.value)
    unsub = onSnapshot(ref, (snap) => {
      plan.value = snap.exists() ? (snap.data() as WeekPlan) : null
      loading.value = false
    }, () => { loading.value = false })
  }

  function goWeek(n: number) {
    weekId.value = shiftWeek(weekId.value, n)
    subscribe()
  }

  /** Загрузка плана недели (JSON из чата Claude) в Firestore. */
  async function importPlan(raw: WeekPlan & { targets?: Record<string, any> }, targetWeekId?: string) {
    const id = targetWeekId || deriveWeekId(raw) || weekId.value
    // Гарантируем, что у каждого дня есть labels[] (для семейного планера).
    const days: Day[] = (raw.days || []).map((d) => ({ ...d, labels: d.labels || [] }))
    const clean: WeekPlan = { title: raw.title || weekTitle(id), days, shopping: raw.shopping || [] }
    await setDoc(doc($firebase.db, 'households', hid.value!, 'weeks', id), clean)
    // targets в JSON опциональны — если есть, обновляем цели семьи.
    if (raw.targets && Object.keys(raw.targets).length) {
      await updateDoc(doc($firebase.db, 'households', hid.value!), { targets: raw.targets })
    }
    weekId.value = id
    subscribe()
  }

  /**
   * Обновить labels конкретного дня (редактирование Ирой).
   * Если недели/дня ещё нет — создаём пустой каркас, чтобы дела можно было
   * добавлять даже без импортированного меню.
   */
  async function setDayLabels(date: string, labels: Day['labels']) {
    const skeleton: Day[] = weekDays(weekId.value).map((w) => ({
      date: w.date, name: w.name, meals: [], labels: []
    }))
    const base = plan.value?.days?.length ? plan.value.days : skeleton
    let found = false
    const days = base.map((d) => {
      if (d.date === date) { found = true; return { ...d, labels } }
      return { ...d, labels: d.labels || [] }
    })
    if (!found) days.push({ date, name: dayNameOf(date), meals: [], labels })
    days.sort((a, b) => a.date.localeCompare(b.date))
    const ref = doc($firebase.db, 'households', hid.value!, 'weeks', weekId.value)
    if (plan.value) await updateDoc(ref, { days })
    else await setDoc(ref, { title: weekTitle(weekId.value), days, shopping: [] })
  }

  function dayNameOf(date: string): string {
    const idx = (new Date(date + 'T00:00:00').getDay() + 6) % 7
    return WEEKDAYS_FULL[idx]
  }

  function deriveWeekId(raw: WeekPlan): string | null {
    const first = raw?.days?.[0]?.date
    return first ? weekIdOf(new Date(first + 'T00:00:00')) : null
  }

  return { weekId, plan, loading, subscribe, goWeek, importPlan, setDayLabels }
}
