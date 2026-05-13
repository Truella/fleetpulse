<template>
  <div :class="uiStore.isDark ? 'dark' : 'light'">
    <TopBar />
    <DashboardGrid>
    </DashboardGrid>
  </div>
</template>

<script setup lang="ts">
import { useDataStream } from './composables/useDataStream'
import { useUiStore } from './stores/uiStore'
import TopBar from './components/layout/TopBar.vue'
import DashboardGrid from './components/layout/DashboardGrid.vue'

const uiStore = useUiStore()
useDataStream()
</script>