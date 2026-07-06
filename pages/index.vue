<script setup lang="ts">
import type { Day } from '~/types'

const { $firebase } = useNuxtApp() as any
const { hid, household, init } = useHousehold()
const week = useWeek()
const checks = useChecks()
const { message: toastMsg } = useToast()

const { weekId, plan, loading } = week

const configMissing = computed(() => !$firebase?.db)
const tab = useState<'menu' | 'shop' | 'kbju'>('tab', () => 'menu')
const setupOpen = useState<boolean>('setup-open', () => false)
const selectedDate = useState<string>('selectedDate', () => isoDate(new Date()))

function syncSelectedToWeek() {
  const days = weekDays(weekId.value)
  const today = days.find((d) => d.isToday)
  selectedDate.value = today ? today.date : days[0].date
}

const selectedDay = computed<Day>(() => {
  const found = plan.value?.days.find((d) => d.date === selectedDate.value)
  if (found) return { ...found, labels: found.labels || [] }
  const w = weekDays(weekId.value).find((d) => d.date === selectedDate.value)
  return { date: selectedDate.value, name: w?.name || '', meals: [], labels: [] }
})

const title = computed(() => household.value?.title || 'Наш план')

function goWeek(n: number) {
  week.goWeek(n)
  checks.subscribe()
  syncSelectedToWeek()
}
function goToday() {
  weekId.value = weekIdOf(new Date())
  week.subscribe()
  checks.subscribe()
  syncSelectedToWeek()
}

onMounted(async () => {
  if (configMissing.value) return
  await init()
  if (hid.value) {
    week.subscribe()
    checks.subscribe()
  }
  syncSelectedToWeek()
})

// Обновление данных при возврате на вкладку (Firestore и так realtime, но на всякий).
if (import.meta.client) {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && hid.value) { week.subscribe(); checks.subscribe() }
  })
}
</script>

<template>
  <ClientOnly>
    <template #fallback>
      <div class="empty">Загрузка…</div>
    </template>

    <header>
      <button class="month" @click="goToday">{{ monthLabel(weekId) }}</button>
      <h1>{{ title }}</h1>
      <button class="gear" @click="setupOpen = true">⚙️</button>
    </header>

    <template v-if="configMissing">
      <div class="empty">
        Firebase ещё не настроен.<br>
        Задай переменные <code>NUXT_PUBLIC_FIREBASE_*</code> (см. README) и перезапусти.
      </div>
    </template>

    <template v-else-if="!hid">
      <div class="empty">
        Добро пожаловать 👋<br>
        Открой ⚙️ и создай семью — или открой ссылку, которую прислал(а) партнёр.
      </div>
    </template>

    <template v-else>
      <div class="weeknav">
        <button @click="goWeek(-1)">‹</button>
        <span>{{ weekTitle(weekId) }}</span>
        <button @click="goWeek(1)">›</button>
      </div>

      <WeekStrip v-model:selected="selectedDate" :plan="plan" />

      <main>
        <template v-if="tab === 'menu'">
          <DayCard :key="selectedDay.date" :day="selectedDay" />
        </template>
        <template v-else-if="tab === 'shop'">
          <div v-if="!plan" class="empty">Нет плана недели.<br>Открой ⚙️ и загрузи JSON.</div>
          <ShopView v-else :plan="plan" />
        </template>
        <template v-else>
          <div v-if="!plan" class="empty">Нет плана недели.<br>Открой ⚙️ и загрузи JSON.</div>
          <KbjuView v-else :plan="plan" />
        </template>
      </main>
    </template>

    <nav>
      <button :class="{ on: tab === 'menu' }" @click="tab = 'menu'"><span class="ic">🍽</span>Меню</button>
      <button :class="{ on: tab === 'shop' }" @click="tab = 'shop'"><span class="ic">🛒</span>Покупки</button>
      <button :class="{ on: tab === 'kbju' }" @click="tab = 'kbju'"><span class="ic">📊</span>КБЖУ</button>
    </nav>

    <SetupSheet v-model:open="setupOpen" />
    <div id="toast" :class="{ show: !!toastMsg }">{{ toastMsg }}</div>
  </ClientOnly>
</template>

<style scoped>
header {
  padding: calc(14px + env(safe-area-inset-top)) 16px 6px;
  display: flex; justify-content: space-between; align-items: center; gap: 8px;
  max-width: 560px; margin: 0 auto;
}
header h1 { font-size: 20px; font-weight: 800; letter-spacing: -.3px; text-align: center; flex: 1; }
.month { background: none; border: none; color: var(--red); font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; white-space: nowrap; }
.gear { font-size: 22px; background: none; border: none; cursor: pointer; padding: 4px; }

.weeknav {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  padding: 2px 16px 8px; max-width: 560px; margin: 0 auto;
}
.weeknav span { font-size: 14px; color: var(--text2); font-weight: 600; min-width: 130px; text-align: center; }
.weeknav button { background: none; border: none; color: var(--text); font-size: 22px; cursor: pointer; padding: 0 8px; line-height: 1; }

main { padding: 12px 16px 16px; max-width: 560px; margin: 0 auto; }

nav {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: var(--tabbar-bg); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--sep); display: flex; padding-bottom: env(safe-area-inset-bottom);
}
nav button {
  flex: 1; background: none; border: none; padding: 10px 0 8px; cursor: pointer;
  font-size: 10px; font-weight: 600; color: var(--text2);
  display: flex; flex-direction: column; align-items: center; gap: 3px; font-family: inherit;
}
nav button .ic { font-size: 24px; line-height: 1; }
nav button.on { color: var(--accent); }

code { font-family: ui-monospace, monospace; font-size: 13px; background: var(--sep); padding: 1px 5px; border-radius: 5px; }

#toast {
  position: fixed; top: calc(10px + env(safe-area-inset-top)); left: 50%; transform: translateX(-50%);
  background: var(--text); color: var(--bg); font-size: 13px; font-weight: 600;
  padding: 8px 16px; border-radius: 20px; opacity: 0; transition: opacity .3s; z-index: 40; pointer-events: none;
}
#toast.show { opacity: 1; }
</style>
