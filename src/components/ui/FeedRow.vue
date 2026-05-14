<template>
  <div class="feed-row" :class="`feed-row--${entry.severity}`">
    <span class="feed-row__time font-mono">{{ formatTime(entry.timestamp) }}</span>
    <span class="feed-row__vehicle font-mono">{{ entry.vehicleId }}</span>
    <span class="feed-row__event">{{ entry.event }}</span>
    <StatusBadge :severity="entry.severity" :label="entry.severity" />
  </div>
</template>

<script setup lang="ts">
import type { FeedEntry } from '../../types'
import StatusBadge from './StatusBadge.vue'
import { formatTime } from '../../utils/formatters'

defineProps<{ entry: FeedEntry }>()
</script>

<style scoped>
.feed-row {
  display: grid;
  grid-template-columns: 90px 80px 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem 1rem;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.75rem;
  /* No animation here — virtual scroller recycles DOM nodes,
     per-row animations cause the jump you're seeing */
}

.feed-row:hover {
  background: color-mix(in srgb, var(--color-accent) 4%, transparent);
}

.feed-row--critical { border-left: 2px solid #ef4444; }
.feed-row--warning  { border-left: 2px solid #F59E0B; }
.feed-row--info     { border-left: 2px solid transparent; }

.feed-row__time {
  color: var(--color-muted);
  font-size: 0.7rem;
  white-space: nowrap;
}

.feed-row__vehicle {
  color: var(--color-accent);
  font-size: 0.7rem;
  white-space: nowrap;
}

.feed-row__event {
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 767px) {
  .feed-row {
    grid-template-columns: 70px 70px 1fr auto;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
  }
}
</style>