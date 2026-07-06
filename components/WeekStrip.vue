<script setup lang="ts">
import type { WeekPlan } from '~/types'

const props = defineProps<{ plan: WeekPlan | null }>()
const selected = defineModel<string>('selected', { required: true })

const { weekId } = useWeek()
const days = computed(() => weekDays(weekId.value))

function dayOf(date: string) {
  return props.plan?.days.find((d) => d.date === date) || null
}
// До трёх цветных полосок под числом — по лейблам дня (стиль Final Surge).
function labelColors(date: string): string[] {
  const d = dayOf(date)
  if (!d) return []
  return d.labels.slice(0, 3).map((l) => l.color || 'var(--accent2)')
}
function hasMeals(date: string): boolean {
  const d = dayOf(date)
  return !!d && d.meals.length > 0
}
</script>

<template>
  <div class="strip">
    <button
      v-for="d in days"
      :key="d.date"
      class="d"
      :class="{ sel: d.date === selected }"
      @click="selected = d.date"
    >
      <span class="dow">{{ d.short }}</span>
      <span class="num" :class="{ today: d.isToday }">{{ d.day }}</span>
      <span class="ind">
        <i v-for="(c, i) in labelColors(d.date)" :key="i" class="bar" :style="{ background: c }" />
        <i v-if="hasMeals(d.date) && !labelColors(d.date).length" class="dot" />
      </span>
    </button>
  </div>
</template>

<style scoped>
.strip {
  display: flex;
  gap: 2px;
  padding: 6px 8px 10px;
  border-bottom: 1px solid var(--sep);
}
.d {
  flex: 1;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 4px 0;
  font-family: inherit;
  border-radius: 12px;
}
.dow { font-size: 11px; color: var(--text2); font-weight: 600; }
.num {
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.num.today { color: var(--red); }
.d.sel .num { background: var(--red); color: #fff; }
.d.sel .dow { color: var(--red); }
.ind { height: 5px; display: flex; gap: 3px; align-items: center; }
.bar { width: 8px; height: 3px; border-radius: 2px; }
.dot { width: 5px; height: 5px; border-radius: 50%; background: var(--text2); }
</style>
