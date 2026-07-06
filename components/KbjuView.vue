<script setup lang="ts">
import type { WeekPlan, Kbju } from '~/types'

const props = defineProps<{ plan: WeekPlan | null }>()
const { household } = useHousehold()

const targets = computed(() => household.value?.targets || {})

function daySum(dayIdx: number): Kbju {
  const sum: Kbju = { kcal: 0, p: 0, f: 0, c: 0 }
  const day = props.plan?.days[dayIdx]
  day?.meals.forEach((m) => {
    if (m.kbju) (Object.keys(sum) as (keyof Kbju)[]).forEach((k) => (sum[k] += m.kbju![k] || 0))
  })
  return sum
}
const clr = (p: number) => (p > 1.12 ? 'var(--red)' : p >= 0.9 ? 'var(--accent)' : 'var(--accent2)')
const ROWS: [string, keyof Kbju][] = [['ккал', 'kcal'], ['Б', 'p'], ['Ж', 'f'], ['У', 'c']]
</script>

<template>
  <div>
    <div v-for="(d, di) in plan?.days || []" :key="d.date" class="kday">
      <b>{{ d.name }}</b>
      <div v-for="(tg, name) in targets" :key="name" class="person">
        <div class="pname">{{ name }}</div>
        <div v-for="[lbl, k] in ROWS" :key="k" class="krow">
          <span class="lbl">{{ lbl }}</span>
          <span class="track">
            <i :style="{ width: Math.min((tg[k] ? daySum(di)[k] / tg[k] : 0) * 100, 100) + '%', background: clr(tg[k] ? daySum(di)[k] / tg[k] : 0) }" />
          </span>
          <span class="val">{{ daySum(di)[k] }} / {{ tg[k] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kday { background: var(--card); border-radius: var(--radius); padding: 14px 16px; margin-bottom: 12px; box-shadow: var(--shadow); }
.kday b { font-size: 16px; }
.person { margin-top: 10px; }
.pname { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
.krow { display: flex; align-items: center; gap: 8px; margin: 4px 0; font-size: 13px; }
.lbl { width: 32px; color: var(--text2); }
.track { flex: 1; height: 8px; background: var(--sep); border-radius: 4px; overflow: hidden; }
.track i { display: block; height: 100%; border-radius: 4px; }
.val { width: 88px; text-align: right; color: var(--text2); font-variant-numeric: tabular-nums; }
</style>
