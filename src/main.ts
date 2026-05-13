import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'

const pinia = createPinia()

// Pinia error plugin — catches any unhandled store action errors
pinia.use(({ store }) => {
  store.$onAction(({ onError }) => {
    onError((error) => {
      console.error('[FleetPulse] Store error:', error)
      if (import.meta.env.DEV) {
        ;(window as unknown as Record<string, { add?: (m: string, t: string) => void }>)
          .__fleetToast?.add?.(`Store error: ${(error as Error).message}`, 'error')
      }
    })
  })
})

const app = createApp(App)
app.use(pinia)
app.mount('#app')