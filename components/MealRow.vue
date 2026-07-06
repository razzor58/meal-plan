<script setup lang="ts">
import type { Meal } from '~/types'

defineProps<{ meal: Meal }>()

const fmtK = (k?: Meal['kbju']) => (k ? `${k.kcal} ккал · Б${k.p} Ж${k.f} У${k.c}` : '')
</script>

<template>
  <div class="meal">
    <div class="slot">{{ meal.slot }}</div>
    <div class="body">
      <div class="name">{{ meal.name }}</div>
      <div v-if="meal.kbju" class="kbju">{{ fmtK(meal.kbju) }} / порция</div>
      <span v-if="meal.cook" class="badge cook">👨‍🍳 Готовим ×4 порции</span>
      <span v-if="meal.leftover" class="badge left">♻️ Доедаем вчерашнее</span>
      <div v-if="meal.note" class="note">{{ meal.note }}</div>
    </div>
  </div>
</template>

<style scoped>
.meal { display: flex; gap: 10px; padding: 10px 0; border-top: 1px solid var(--sep); align-items: flex-start; }
.slot { font-size: 11px; font-weight: 700; color: var(--text2); text-transform: uppercase; width: 62px; flex-shrink: 0; padding-top: 2px; }
.name { font-size: 15px; line-height: 1.35; }
.kbju { font-size: 12px; color: var(--text2); margin-top: 2px; }
.badge { display: inline-block; font-size: 11px; font-weight: 700; border-radius: 8px; padding: 2px 7px; margin-top: 4px; margin-right: 4px; }
.badge.cook { background: rgba(255, 159, 10, .15); color: var(--accent2); }
.badge.left { background: rgba(52, 199, 89, .15); color: var(--accent); }
.note { font-size: 12px; color: var(--text2); margin-top: 3px; }
</style>
