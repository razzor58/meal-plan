// Утилиты дат для недельной ленты (auto-import из utils/).

export const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
export const WEEKDAYS_FULL = [
  'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'
]
const MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
]
const MONTHS_SHORT = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
]

/** YYYY-MM-DD в локальной таймзоне (без сдвига UTC). */
export function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** ID недели = дата понедельника (YYYY-MM-DD) для переданной даты. */
export function weekIdOf(d: Date = new Date()): string {
  const x = new Date(d)
  const dow = (x.getDay() + 6) % 7 // Пн=0 … Вс=6
  x.setDate(x.getDate() - dow)
  x.setHours(0, 0, 0, 0)
  return isoDate(x)
}

/** Сдвиг недели на n недель от weekId. */
export function shiftWeek(weekId: string, n: number): string {
  const d = new Date(weekId + 'T00:00:00')
  d.setDate(d.getDate() + n * 7)
  return isoDate(d)
}

/** 7 дней недели: [{ date, name, dow, day, isToday }]. */
export function weekDays(weekId: string) {
  const today = isoDate(new Date())
  const start = new Date(weekId + 'T00:00:00')
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const date = isoDate(d)
    return {
      date,
      name: WEEKDAYS_FULL[i],
      short: WEEKDAYS_SHORT[i],
      day: d.getDate(),
      isToday: date === today
    }
  })
}

/** «6–12 июля» — заголовок недели. */
export function weekTitle(weekId: string): string {
  const start = new Date(weekId + 'T00:00:00')
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const sameMonth = start.getMonth() === end.getMonth()
  if (sameMonth) return `${start.getDate()}–${end.getDate()} ${MONTHS[start.getMonth()]}`
  return `${start.getDate()} ${MONTHS[start.getMonth()]} – ${end.getDate()} ${MONTHS[end.getMonth()]}`
}

/** «Июл 2026» — левый верхний угол шапки. */
export function monthLabel(weekId: string): string {
  const d = new Date(weekId + 'T00:00:00')
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}
