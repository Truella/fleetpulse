<template>
  <span
    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[0.65rem]
           font-medium tracking-wider uppercase"
    :class="classes"
  >
    <span v-if="dot" class="w-1.5 h-1.5 rounded-full bg-current animate-[pulse_2s_infinite]" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Severity } from '../../types'

const props = defineProps<{
  severity: Severity | 'info'
  label: string
  dot?: boolean
}>()

const classes = computed(() => ({
  'text-[#94a3b8] bg-[rgba(148,163,184,0.12)]': props.severity === 'info',
  'text-[var(--color-warning)] bg-[rgba(245,158,11,0.12)]': props.severity === 'warning',
  'text-[var(--color-danger)] bg-[rgba(239,68,68,0.12)]': props.severity === 'critical',
}))
</script>