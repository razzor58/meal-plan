<script setup lang="ts">
import type { WeekPlan } from '~/types'

const props = defineProps<{ plan: WeekPlan | null }>()
const { checks, toggleShopping } = useChecks()

const all = computed(() => (props.plan?.shopping || []).flatMap((c) => c.items))
const done = computed(() => all.value.filter((i) => checks.value.shopping[i.n]).length)
</script>

<template>
  <div>
    <div class="progress">
      {{ done }} из {{ all.length }} куплено
      <div class="bar"><i :style="{ width: (all.length ? (done / all.length) * 100 : 0) + '%' }" /></div>
    </div>

    <div v-for="c in plan?.shopping || []" :key="c.cat" class="cat">
      <h3>{{ c.cat }}</h3>
      <div
        v-for="i in c.items"
        :key="i.n"
        class="item"
        :class="{ done: checks.shopping[i.n] }"
        @click="toggleShopping(i.n)"
      >
        <div class="box">✓</div>
        <div class="n">{{ i.n }}</div>
        <div class="q">{{ i.q || '' }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress { font-size: 14px; color: var(--text2); text-align: center; margin: 4px 0 14px; }
.progress .bar { height: 6px; background: var(--sep); border-radius: 3px; margin-top: 8px; overflow: hidden; }
.progress .bar i { display: block; height: 100%; background: var(--accent); border-radius: 3px; transition: width .3s; }
.cat { background: var(--card); border-radius: var(--radius); margin-bottom: 12px; overflow: hidden; box-shadow: var(--shadow); }
.cat h3 { font-size: 13px; font-weight: 700; color: var(--text2); text-transform: uppercase; padding: 12px 16px 4px; }
.item { display: flex; align-items: center; gap: 12px; padding: 11px 16px; border-top: 1px solid var(--sep); cursor: pointer; user-select: none; }
.item .box {
  width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--text2);
  flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  transition: all .15s; font-size: 14px; color: transparent;
}
.item.done .box { background: var(--accent); border-color: var(--accent); color: #fff; }
.item .n { font-size: 16px; flex: 1; }
.item.done .n { color: var(--text2); text-decoration: line-through; }
.item .q { font-size: 14px; color: var(--text2); }
</style>
