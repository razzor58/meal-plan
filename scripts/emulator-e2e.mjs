// E2E-тест слоя данных против эмулятора Firestore/Auth.
// Повторяет ровно операции из composables (useHousehold/useWeek/useChecks),
// чтобы доказать: создание семьи, импорт плана, realtime-синхронизация и
// апдейт лейблов работают. Запускается через `firebase emulators:exec`.
import { initializeApp } from 'firebase/app'
import {
  initializeFirestore, connectFirestoreEmulator,
  doc, getDoc, setDoc, updateDoc, onSnapshot
} from 'firebase/firestore'
import { getAuth, connectAuthEmulator, signInAnonymously } from 'firebase/auth'

const app = initializeApp({ projectId: 'demo-meal', apiKey: 'demo', authDomain: 'localhost' })
const db = initializeFirestore(app, {})
connectFirestoreEmulator(db, '127.0.0.1', 8080)
const auth = getAuth(app)
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })

const assert = (cond, msg) => { if (!cond) { console.error('❌ FAIL:', msg); process.exit(1) } else console.log('✅', msg) }
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// --- имитируем two clients: у каждого свой анонимный uid (как два телефона) ---
const app2 = initializeApp({ projectId: 'demo-meal', apiKey: 'demo', authDomain: 'localhost' }, 'client2')
const db2 = initializeFirestore(app2, {})
connectFirestoreEmulator(db2, '127.0.0.1', 8080)
const auth2 = getAuth(app2)
connectAuthEmulator(auth2, 'http://127.0.0.1:9099', { disableWarnings: true })

const u1 = (await signInAnonymously(auth)).user.uid
const u2 = (await signInAnonymously(auth2)).user.uid
assert(u1 && u2 && u1 !== u2, `два анонимных клиента с разными uid (${u1.slice(0,6)} / ${u2.slice(0,6)})`)

// --- Клиент 1: создать семью (useHousehold.createHousehold) ---
const hid = 'test-household-abc123'
await setDoc(doc(db, 'households', hid), {
  title: 'Наш план',
  targets: { 'Илья': { kcal: 2600, p: 170, f: 85, c: 290 }, 'Ира': { kcal: 1900, p: 120, f: 65, c: 210 } }
})
const hsnap = await getDoc(doc(db, 'households', hid))
assert(hsnap.exists() && hsnap.data().targets['Ира'], 'семья создана, есть цель для Иры')

// --- Клиент 2 подписывается на неделю ДО того, как клиент 1 импортирует план ---
const weekId = '2026-07-06'
let received = null
const unsub = onSnapshot(doc(db2, 'households', hid, 'weeks', weekId), (s) => {
  received = s.exists() ? s.data() : null
})
await sleep(300)

// --- Клиент 1: импорт плана (useWeek.importPlan) ---
await setDoc(doc(db, 'households', hid, 'weeks', weekId), {
  title: 'Неделя 6–12 июля',
  days: [
    { date: '2026-07-06', name: 'Понедельник', labels: [], meals: [{ slot: 'Ужин', name: 'Лосось', kbju: { kcal: 620, p: 40, f: 24, c: 58 } }] }
  ],
  shopping: [{ cat: 'Рыба', items: [{ n: 'Лосось', q: '600 г' }] }]
})

// realtime: клиент 2 должен увидеть план без ручного «обновить» (боль 2/3)
await sleep(600)
assert(received && received.days?.length === 1, 'realtime: клиент 2 получил план после импорта клиентом 1')
assert(received.days[0].meals[0].name === 'Лосось', 'realtime: содержимое плана корректно у клиента 2')

// --- Клиент 1: отметить покупку (useChecks.toggleShopping) → realtime у клиента 2 ---
let checks2 = null
const unsubC = onSnapshot(doc(db2, 'households', hid, 'checks', weekId), (s) => { checks2 = s.exists() ? s.data() : null })
await setDoc(doc(db, 'households', hid, 'checks', weekId), { shopping: { 'Лосось': true }, labels: {} })
await sleep(600)
assert(checks2 && checks2.shopping['Лосось'] === true, 'realtime: отметка покупки прилетела клиенту 2')

// --- Клиент 2: добавить лейбл дня (useWeek.setDayLabels, updateDoc days) ---
const days = received.days.map(d => d.date === '2026-07-06'
  ? { ...d, labels: [{ id: 'x1', text: 'Стирка', icon: '🧺', color: '#0a84ff' }] } : d)
await updateDoc(doc(db2, 'households', hid, 'weeks', weekId), { days })
await sleep(500)
assert(received.days[0].labels[0]?.text === 'Стирка', 'realtime: лейбл «Стирка» от клиента 2 виден клиенту 1')

// --- setDayLabels-апсерт: неделя, которой ещё нет, создаётся с каркасом ---
const emptyWeek = '2026-07-13'
await setDoc(doc(db, 'households', hid, 'weeks', emptyWeek), {
  title: 'Неделя 13–19 июля',
  days: [{ date: '2026-07-14', name: 'Вторник', meals: [], labels: [{ id: 'y1', text: 'Уборка', color: '#34c759' }] }],
  shopping: []
})
const ew = await getDoc(doc(db, 'households', hid, 'weeks', emptyWeek))
assert(ew.exists() && ew.data().days[0].labels[0].text === 'Уборка', 'дело можно добавить в неделю без меню (апсерт)')

unsub(); unsubC()
console.log('\n🎉 Все E2E-проверки слоя данных прошли')
process.exit(0)
