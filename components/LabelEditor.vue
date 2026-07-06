<script setup lang="ts">
import type { DayLabel } from '~/types'

const props = defineProps<{ date: string; dayName: string; labels: DayLabel[] }>()
const open = defineModel<boolean>('open', { required: true })

const { setDayLabels } = useWeek()

const PRESETS: Omit<DayLabel, 'id'>[] = [
  { text: 'Стирка', icon: '🧺', color: '#0a84ff' },
  { text: 'Уборка', icon: '🧹', color: '#34c759' },
  { text: 'Продукты', icon: '🛒', color: '#ff9f0a' },
  { text: 'Мусор', icon: '🗑', color: '#8e8e93' },
  { text: 'Готовка', icon: '🍳', color: '#ff453a' },
  { text: 'Спорт', icon: '🏋️', color: '#af52de' },
  { text: 'Аптека', icon: '💊', color: '#5ac8fa' },
  { text: 'Дела', icon: '📌', color: '#ff2d55' }
]

const custom = ref('')
const local = ref<DayLabel[]>([])

// Локальная копия при открытии — сохраняем разом по «Готово».
watch(open, (v) => { if (v) local.value = props.labels.map((l) => ({ ...l })) })

function newId(): string {
  const b = new Uint8Array(8)
  crypto.getRandomValues(b)
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
}
function addPreset(p: Omit<DayLabel, 'id'>) {
  if (local.value.some((l) => l.text === p.text)) return
  local.value.push({ id: newId(), ...p })
}
function addCustom() {
  const t = custom.value.trim()
  if (!t) return
  local.value.push({ id: newId(), text: t, icon: '📌', color: '#ff2d55' })
  custom.value = ''
}
function remove(id: string) {
  local.value = local.value.filter((l) => l.id !== id)
}
async function save() {
  await setDayLabels(props.date, local.value)
  open.value = false
}
</script>

<template>
  <div class="overlay" :class="{ show: open }" @click.self="open = false">
    <div class="sheet">
      <h2>Дела · {{ dayName }}</h2>

      <div v-if="local.length" class="current">
        <span
          v-for="l in local"
          :key="l.id"
          class="chip"
          :style="{ '--c': l.color || 'var(--blue)' }"
        >
          <span v-if="l.icon">{{ l.icon }}</span>{{ l.text }}
          <button class="x" @click="remove(l.id)">×</button>
        </span>
      </div>
      <p v-else class="hint">Пока нет дел на этот день. Добавь из пресетов или своё.</p>

      <label>Быстро добавить</label>
      <div class="presets">
        <button v-for="p in PRESETS" :key="p.text" class="preset" @click="addPreset(p)">
          {{ p.icon }} {{ p.text }}
        </button>
      </div>

      <label>Своё дело</label>
      <div class="row">
        <input v-model="custom" placeholder="Например: Забрать посылку" @keyup.enter="addCustom" />
        <button class="btn ghost add" @click="addCustom">Добавить</button>
      </div>

      <button class="btn blue" @click="save">Готово</button>
    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: none; align-items: flex-end; z-index: 30; }
.overlay.show { display: flex; }
.sheet {
  background: var(--card); width: 100%; border-radius: 22px 22px 0 0;
  padding: 20px 20px calc(24px + env(safe-area-inset-bottom)); max-width: 560px; margin: 0 auto;
  max-height: 88vh; overflow-y: auto;
}
h2 { font-size: 20px; margin-bottom: 14px; }
label { font-size: 13px; color: var(--text2); display: block; margin: 16px 0 6px; }
.current { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  display: inline-flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 600;
  border-radius: 999px; padding: 6px 8px 6px 11px;
  background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--c);
}
.chip .x { background: none; border: none; color: inherit; font-size: 18px; line-height: 1; cursor: pointer; padding: 0 2px; }
.presets { display: flex; flex-wrap: wrap; gap: 8px; }
.preset {
  font-size: 14px; font-family: inherit; border: 1px solid var(--sep); background: var(--bg);
  color: var(--text); border-radius: 999px; padding: 8px 12px; cursor: pointer;
}
.row { display: flex; gap: 8px; align-items: stretch; }
.row input {
  flex: 1; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--sep);
  background: var(--bg); color: var(--text); font-size: 16px; font-family: inherit;
}
.btn.add { width: auto; margin: 0; padding: 0 16px; white-space: nowrap; }
</style>
