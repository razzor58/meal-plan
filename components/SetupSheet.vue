<script setup lang="ts">
import type { WeekPlan } from '~/types'

const open = defineModel<boolean>('open', { required: true })

const { hid, createHousehold, shareLink } = useHousehold()
const { importPlan } = useWeek()
const { toast } = useToast()

const planText = ref('')
const busy = ref(false)

async function onCreate() {
  busy.value = true
  try {
    await createHousehold()
    toast('Семья создана')
  } catch {
    toast('Не удалось создать — проверь Firebase')
  } finally {
    busy.value = false
  }
}

async function onShare() {
  const link = shareLink()
  try {
    if (navigator.share) { await navigator.share({ title: 'Семейный планер', url: link }); return }
    await navigator.clipboard.writeText(link)
    toast('Ссылка скопирована')
  } catch (e: any) {
    if (e?.name === 'AbortError') return
    try { await navigator.clipboard.writeText(link); toast('Ссылка скопирована') }
    catch { toast('Не удалось создать ссылку') }
  }
}

async function onImport() {
  let p: WeekPlan
  try { p = JSON.parse(planText.value) }
  catch { toast('Это не валидный JSON'); return }
  if (!Array.isArray((p as any).days)) { toast('В плане нет поля days'); return }
  busy.value = true
  try {
    await importPlan(p)
    planText.value = ''
    open.value = false
    toast('План загружен')
  } catch {
    toast('Ошибка загрузки')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="overlay" :class="{ show: open }" @click.self="open = false">
    <div class="sheet">
      <h2>Настройки</h2>

      <template v-if="!hid">
        <p class="hint">
          Создай «семью» — общее пространство для тебя и Иры. Второму устройству просто отправишь
          ссылку, вводить ничего не нужно.
        </p>
        <button class="btn blue" :disabled="busy" @click="onCreate">Создать семью</button>
      </template>

      <template v-else>
        <label>Общий доступ</label>
        <button class="btn blue" @click="onShare">🔗 Поделиться с Ирой</button>
        <p class="hint">
          Открой ссылку на втором телефоне (Safari → «На экран Домой») — приложение настроится само.
          Ключ семьи в части ссылки после «#», на серверы не уходит. Отправляй только Ире.
        </p>

        <label style="margin-top: 20px">Импорт плана недели (JSON из чата Claude)</label>
        <textarea v-model="planText" rows="4" placeholder='{"title":"Неделя …","days":[…]}' />
        <button class="btn ghost" :disabled="busy" @click="onImport">Загрузить план</button>
      </template>
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
label { font-size: 13px; color: var(--text2); display: block; margin: 12px 0 6px; }
textarea {
  width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--sep);
  background: var(--bg); color: var(--text); font-size: 16px; font-family: inherit; resize: vertical;
}
</style>
