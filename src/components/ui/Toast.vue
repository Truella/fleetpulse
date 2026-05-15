<template>
  <Teleport to="body">
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-md text-[0.75rem] font-mono
                 min-w-[260px] max-w-[380px] pointer-events-auto border"
          :class="{
            'bg-[#1f1010] border-[var(--color-danger)] text-[#fca5a5]':   toast.type === 'error',
            'bg-[#1f1800] border-[var(--color-warning)] text-[#fcd34d]': toast.type === 'warning',
            'bg-[#0f172a] border-[var(--color-info)] text-[#93c5fd]':    toast.type === 'info',
          }"
        >
          <span class="shrink-0 text-[0.7rem]">{{ ICONS[toast.type] }}</span>
          <span class="flex-1 leading-snug">{{ toast.message }}</span>
          <button
            class="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-[0.65rem]
                   bg-transparent border-none cursor-pointer text-inherit px-0.5"
            @click="remove(toast.id)"
          >✕</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type ToastType = 'error' | 'warning' | 'info'
interface ToastItem { id: number; type: ToastType; message: string }

const ICONS: Record<ToastType, string> = { error: '✖', warning: '⚠', info: 'ℹ' }
const toasts = ref<ToastItem[]>([])
let _counter = 0

function add(message: string, type: ToastType = 'error', duration = 4000) {
  const id = _counter++
  toasts.value.push({ id, type, message })
  setTimeout(() => remove(id), duration)
}

function remove(id: number) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

defineExpose({ add })
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(1rem); }
</style>