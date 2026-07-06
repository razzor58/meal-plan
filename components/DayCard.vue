<script setup lang="ts">
import type { Day } from '~/types'

const props = defineProps<{ day: Day }>()

const editorOpen = ref(false)

const totalKcal = computed(() =>
  props.day.meals.reduce((s, m) => s + (m.kbju?.kcal || 0), 0)
)
const heroStyle = computed(() => {
  const img = props.day.meals.find((m) => m.imageUrl)?.imageUrl
  return img
    ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.55)), url(${img})` }
    : {}
})
</script>

<template>
  <div class="card">
    <div class="hero" :class="{ photo: !!day.meals.find((m) => m.imageUrl) }" :style="heroStyle">
      <div class="hero-top">
        <b>{{ day.name }}</b>
        <span class="date">{{ day.date.slice(8, 10) }}.{{ day.date.slice(5, 7) }}</span>
      </div>
      <div v-if="totalKcal" class="kcal">{{ totalKcal }} ккал за день</div>
    </div>

    <div class="body">
      <DayLabels :date="day.date" :labels="day.labels" @edit="editorOpen = true" />

      <div v-if="day.meals.length" class="meals">
        <MealRow v-for="(m, i) in day.meals" :key="i" :meal="m" />
      </div>
      <p v-else class="hint">На этот день блюда не заданы.</p>
    </div>

    <LabelEditor
      v-model:open="editorOpen"
      :date="day.date"
      :day-name="day.name"
      :labels="day.labels"
    />
  </div>
</template>

<style scoped>
.card {
  background: var(--card); border-radius: var(--radius); overflow: hidden;
  box-shadow: var(--shadow); margin-bottom: 14px;
}
.hero {
  background: linear-gradient(135deg, var(--blue), var(--blue2));
  color: #fff; padding: 16px; background-size: cover; background-position: center;
}
.hero.photo { min-height: 120px; display: flex; flex-direction: column; justify-content: flex-end; }
.hero-top { display: flex; justify-content: space-between; align-items: baseline; }
.hero-top b { font-size: 19px; font-weight: 800; }
.hero-top .date { font-size: 14px; opacity: .85; }
.kcal { font-size: 13px; opacity: .9; margin-top: 4px; }
.body { padding: 12px 16px 16px; }
.meals { margin-top: 8px; }
</style>
