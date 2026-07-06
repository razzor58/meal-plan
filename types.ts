// Общие типы модели данных. Импортируются явно (import type { ... } from '~/types').

export interface Kbju {
  kcal: number
  p: number
  f: number
  c: number
}

export interface Meal {
  slot: string // Завтрак / Обед / Перекус / Ужин
  name: string
  kbju?: Kbju
  cook?: boolean
  leftover?: boolean
  note?: string
  imageUrl?: string
}

export interface DayLabel {
  id: string
  text: string // «Стирка», «Уборка», …
  icon?: string // эмодзи
  color?: string // hex
}

export interface Day {
  date: string // YYYY-MM-DD
  name: string // Понедельник, …
  meals: Meal[]
  labels: DayLabel[]
}

export interface ShoppingItem {
  n: string
  q?: string
}

export interface ShoppingCategory {
  cat: string
  items: ShoppingItem[]
}

export interface WeekPlan {
  title: string
  days: Day[]
  shopping: ShoppingCategory[]
}

export interface Household {
  title: string
  targets: Record<string, Kbju> // { "Илья": {...}, "Ира": {...} }
}

export interface WeekChecks {
  shopping: Record<string, boolean> // item.n -> true
  labels: Record<string, Record<string, boolean>> // date -> labelId -> true
}
