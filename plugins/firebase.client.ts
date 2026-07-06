import { initializeApp } from 'firebase/app'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager
} from 'firebase/firestore'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'

// Инициализация Firebase на клиенте.
// firebaseConfig публичный by design; защита данных — через Auth + Security Rules
// и неугадываемый householdId (см. composables/useHousehold.ts).
export default defineNuxtPlugin(async () => {
  const cfg = useRuntimeConfig().public.firebase as Record<string, string>

  if (!cfg.apiKey || !cfg.projectId) {
    // Конфиг ещё не задан (нет env). Приложение покажет подсказку из useAuth().
    return { provide: { firebase: { app: null, db: null, auth: null, ready: Promise.resolve(null) } } }
  }

  const app = initializeApp(cfg)

  // Firestore с офлайн-кэшем в IndexedDB — данные показываются мгновенно,
  // обновляются в реальном времени и переживают перезапуск/офлайн (чинит боли 1,2).
  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentSingleTabManager(undefined) })
  })

  const auth = getAuth(app)

  // Анонимный вход. Сессия хранится в IndexedDB и переживает standalone-PWA.
  const ready = new Promise<string | null>((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) resolve(user.uid)
    })
    signInAnonymously(auth).catch((e) => {
      console.error('Anonymous sign-in failed', e)
      resolve(null)
    })
  })

  return { provide: { firebase: { app, db, auth, ready } } }
})
