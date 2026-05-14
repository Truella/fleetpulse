<template>
  <header class="topbar">
    <!-- Left: brand -->
    <div class="topbar__brand">
      <span class="topbar__logo">▣</span>
      <span class="topbar__name">FleetPulse</span>
      <StatusBadge
        :severity="uiStore.isPaused ? 'warning' : 'info'"
        :label="uiStore.isPaused ? 'PAUSED' : 'LIVE'"
        dot
      />
    </div>

    <!-- Center: time range pills -->
    <nav class="topbar__ranges">
      <button
        v-for="r in TIME_RANGES"
        :key="r.value"
        class="topbar__pill"
        :class="{ 'topbar__pill--active': uiStore.timeRange === r.value }"
        @click="uiStore.setTimeRange(r.value)"
      >
        {{ r.label }}
      </button>
    </nav>

    <!-- Right: controls -->
    <div class="topbar__controls">
      <button class="topbar__btn" @click="uiStore.togglePause()">
        <span class="topbar__btn-icon">{{ uiStore.isPaused ? '▶' : '⏸' }}</span>
        <span class="topbar__btn-label">{{ uiStore.isPaused ? 'Resume' : 'Pause' }}</span>
        <kbd class="topbar__kbd">Space</kbd>
      </button>
      <button class="topbar__btn topbar__btn--icon-only" @click="uiStore.toggleTheme()">
        <span>{{ uiStore.isDark ? '☀' : '☾' }}</span>
      </button>
    </div>

    <!-- Paused banner -->
    <Transition name="banner">
      <div v-if="uiStore.isPaused" class="topbar__banner">
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
.topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.25rem;
  height: 52px;
  min-height: 52px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  overflow: visible;
}

.topbar__brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.topbar__logo {
  color: var(--color-accent);
  font-size: 1.1rem;
  line-height: 1;
}

.topbar__name {
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text);
}

.topbar__ranges {
  display: flex;
  gap: 0.25rem;
  margin: 0 auto;
}

.topbar__pill {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 500;
  color: var(--color-muted);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1.4;
}

.topbar__pill:hover {
  color: var(--color-text);
  border-color: var(--color-border);
}

.topbar__pill--active {
  color: var(--color-accent);
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
}

.topbar__controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.topbar__btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--color-muted);
  background: transparent;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  line-height: 1.4;
}

.topbar__btn:hover {
  color: var(--color-text);
  border-color: var(--color-muted);
}

.topbar__btn--icon-only {
  padding: 0.25rem 0.5rem;
}

.topbar__btn-icon { font-size: 0.8rem; }

.topbar__kbd {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  background: var(--color-border);
  color: var(--color-muted);
  border: 1px solid var(--color-muted);
}

.topbar__banner {
  position: absolute;
  top: 52px;
  left: 0;
  right: 0;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-family: 'IBM Plex Mono', monospace;
  color: #111318;
  background: var(--color-accent);
  z-index: 49;
}

.banner-enter-active,
.banner-leave-active { transition: opacity 0.2s, transform 0.2s; }
.banner-enter-from,
.banner-leave-to { opacity: 0; transform: translateY(-4px); }

@media (max-width: 767px) {
  .topbar__btn-label { display: none; }
  .topbar__kbd       { display: none; }
  .topbar__name      { display: none; }
}
</style>