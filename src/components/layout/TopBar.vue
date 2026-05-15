<template>
  <!-- Full-width background bar -->
  <header class="sticky top-0 z-50 bg-[var(--color-surface)] border-b border-[var(--color-border)] overflow-visible">
    <!-- Constrained inner content -->
    <div class="flex items-center gap-4 px-5 h-[52px] max-w-[1600px] mx-auto">

      <!-- Brand -->
      <div class="flex items-center gap-2 shrink-0">
        <span class="text-[var(--color-accent)] text-lg leading-none">▣</span>
        <span class="hidden sm:block font-semibold text-sm tracking-widest uppercase text-[var(--color-text)]">
          FleetPulse
        </span>
        <StatusBadge
          :severity="uiStore.isPaused ? 'warning' : 'info'"
          :label="uiStore.isPaused ? 'PAUSED' : 'LIVE'"
          dot
        />
      </div>

      <!-- Time range pills -->
      <nav class="flex gap-1 mx-auto">
        <button
          v-for="r in TIME_RANGES"
          :key="r.value"
          class="px-3 py-1 rounded text-xs font-mono font-medium border transition-all duration-150 cursor-pointer"
          :class="uiStore.timeRange === r.value
            ? 'text-[var(--color-accent)] border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]'
            : 'text-[var(--color-muted)] border-transparent hover:text-[var(--color-text)] hover:border-[var(--color-border)]'"
          @click="uiStore.setTimeRange(r.value)"
        >
          {{ r.label }}
        </button>
      </nav>

      <!-- Controls -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          class="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border border-[var(--color-border)]
                 text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-muted)]
                 transition-all duration-150 cursor-pointer whitespace-nowrap"
          @click="uiStore.togglePause()"
        >
          <span class="text-[0.8rem]">{{ uiStore.isPaused ? '▶' : '⏸' }}</span>
          <span class="hidden sm:inline text-xs">{{ uiStore.isPaused ? 'Resume' : 'Pause' }}</span>
          <kbd class="hidden md:inline font-mono text-[0.65rem] px-1 py-0.5 rounded
                      bg-[var(--color-border)] text-[var(--color-muted)] border border-[var(--color-muted)]">
            Space
          </kbd>
        </button>

        <button
          class="flex items-center px-2 py-1 rounded text-xs border border-[var(--color-border)]
                 text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-muted)]
                 transition-all duration-150 cursor-pointer"
          @click="uiStore.toggleTheme()"
        >
          {{ uiStore.isDark ? '☀' : '☾' }}
        </button>
      </div>
    </div>

    <!-- Paused banner — full width -->
    <Transition name="banner">
      <div
        v-if="uiStore.isPaused"
        class="absolute top-[52px] left-0 right-0 h-[30px] flex items-center justify-center
               text-xs font-mono text-[#111318] bg-[var(--color-accent)] z-40"
      >
        Stream paused — click Resume or press Space
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { useUiStore } from '../../stores/uiStore'
import type { TimeRange } from '../../stores/uiStore'
import StatusBadge from '../ui/StatusBadge.vue'

const uiStore = useUiStore()

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: 'Live', value: 'live' },
  { label: '1m',  value: '1m' },
  { label: '5m',  value: '5m' },
  { label: '1h',  value: '1h' },
]
</script>

<style scoped>
.banner-enter-active, .banner-leave-active { transition: opacity 0.2s, transform 0.2s; }
.banner-enter-from, .banner-leave-to { opacity: 0; transform: translateY(-4px); }
</style>