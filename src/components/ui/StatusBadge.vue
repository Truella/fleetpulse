<template>
  <span class="badge" :class="`badge--${severity}`">
    <span v-if="dot" class="badge__dot" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import type { Severity } from '../../types'

defineProps<{
  severity: Severity | 'info'
  label: string
  dot?: boolean
}>()
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.15rem 0.5rem;
  border-radius: 3px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

.badge--info {
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.12);
}

.badge--warning {
  color: #F59E0B;
  background: rgba(245, 158, 11, 0.12);
}

.badge--critical {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>