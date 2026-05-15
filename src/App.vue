<template>
  <div :class="uiStore.isDark ? 'dark' : 'light'">
    <TopBar />
    <DashboardGrid />
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useDataStream } from './composables/useDataStream'
import { useUiStore } from './stores/uiStore'
import { useMetricsStore } from './stores/metricsStore'
import TopBar from './components/layout/TopBar.vue'
import DashboardGrid from './components/layout/DashboardGrid.vue'
import Toast from './components/ui/Toast.vue'

const uiStore = useUiStore()
const metricsStore = useMetricsStore()
useDataStream()

const toastRef = ref<InstanceType<typeof Toast> | null>(null)

watch(
  () => uiStore.timeRangeCutoff,
  (val) => metricsStore.setCutoff(val),
  { immediate: true }
)

function onKeydown(e: KeyboardEvent) {
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