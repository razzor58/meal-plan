<script setup lang="ts">
import type { DayLabel } from '~/types'

const props = defineProps<{ date: string; labels: DayLabel[] }>()
const emit = defineEmits<{ edit: [] }>()

const { toggleLabel, isLabelDone } = useChecks()
</script>

<template>
  <div class="labels">
    <button
      v-for="l in props.labels"
      :key="l.id"
      class="chip"
      :class="{ done: isLabelDone(date, l.id) }"
      :style="{ '--c': l.color || 'var(--blue)' }"
      @click="toggleLabel(date, l.id)"
    >
      <span v-if="l.icon" class="ic">{{ l.icon }}</span>{{ l.text }}
      <span v-if="isLabelDone(date, l.id)" class="tick">✓</span>
    </button>
    <button class="chip add" @click="emit('edit')">＋ дело</button>
  </div>
</template>

<style scoped>
.labels { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.chip {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 13px; font-weight: 600; font-family: inherit;
  border: none; border-radius: 999px; padding: 6px 11px; cursor: pointer;
  background: color-mix(in srgb, var(--c) 16%, transparent);
  color: var(--c);
}
.chip .ic { font-size: 13px; }
.chip.done { opacity: .55; text-decoration: line-through; }
.chip .tick { text-decoration: none; }
.chip.add { background: var(--sep); color: var(--text2); }
</style>
