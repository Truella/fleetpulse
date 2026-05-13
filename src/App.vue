<template>
  <div :class="uiStore.isDark ? 'dark' : 'light'">
    <TopBar />
    <DashboardGrid />
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useDataStream } from './composables/useDataStream'
import { useUiStore } from './stores/uiStore'
import TopBar from './components/layout/TopBar.vue'
import DashboardGrid from './components/layout/DashboardGrid.vue'
import Toast from './components/ui/Toast.vue'

const uiStore = useUiStore()
useDataStream()

const toastRef = ref<InstanceType<typeof Toast> | null>(null)

// Keyboard shortcut: Space = pause/resume
function onKeydown(e: KeyboardEvent) {
  // Don't fire when typing in an input
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
  if (e.code === 'Space') {
    e.preventDefault()
    uiStore.togglePause()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  if (import.meta.env.DEV) {
    ;(window as unknown as Record<string, unknown>).__fleetToast = toastRef.value
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>