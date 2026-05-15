<template>
  <div
    class="grid gap-3 px-4 py-[0.4rem] border-b border-[var(--color-border)] text-xs
           hover:bg-[color-mix(in_srgb,var(--color-accent)_4%,transparent)] transition-colors duration-100"
    :class="[
      'grid-cols-[90px_80px_1fr_auto]',
      entry.severity === 'critical' ? 'border-l-2 border-l-[var(--color-danger)]' :
      entry.severity === 'warning'  ? 'border-l-2 border-l-[var(--color-warning)]' :
                                      'border-l-2 border-l-transparent'
    ]"
  >
    <span class="font-mono text-[0.7rem] text-[var(--color-muted)] whitespace-nowrap">
      {{ formatTime(entry.timestamp) }}
    </span>
    <span class="font-mono text-[0.7rem] text-[var(--color-accent)] whitespace-nowrap">
      {{ entry.vehicleId }}
    </span>
    <span class="text-[var(--color-text)] whitespace-nowrap overflow-hidden text-ellipsis">
      {{ entry.event }}
    </span>
    <StatusBadge :severity="entry.severity" :label="entry.severity" />
  </div>
</template>

<script setup lang="ts">
import type { FeedEntry } from '../../types'
import StatusBadge from './StatusBadge.vue'
import { formatTime } from '../../utils/formatters'

defineProps<{ entry: FeedEntry }>()
</script>