<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
        >
          <span class="toast__icon">{{ ICONS[toast.type] }}</span>
          <span class="toast__msg">{{ toast.message }}</span>
          <button class="toast__close" @click="remove(toast.id)">✕</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type ToastType = 'error' | 'warning' | 'info'

interface ToastItem {
  id: number
  type: ToastType
  message: string
}

const ICONS: Record<ToastType, string> = {
  error: '✖',
  warning: '⚠',
  info: 'ℹ',
}

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
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.875rem;
  border-radius: 5px;
  font-size: 0.75rem;
  font-family: 'IBM Plex Mono', monospace;
  min-width: 260px;
  max-width: 380px;
  pointer-events: all;
  border: 1px solid transparent;
}

.toast--error {
  background: #1f1010;
  border-color: #ef4444;
  color: #fca5a5;
}

.toast--warning {
  background: #1f1800;
  border-color: #F59E0B;
  color: #fcd34d;
}

.toast--info {
  background: #0f172a;
  border-color: #60a5fa;
  color: #93c5fd;
}

.toast__icon {
  flex-shrink: 0;
  font-size: 0.7rem;
}

.toast__msg {
  flex: 1;
  line-height: 1.4;
}

.toast__close {
  flex-shrink: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  font-size: 0.65rem;
  padding: 0.1rem 0.2rem;
  transition: opacity 0.15s;
}

.toast__close:hover { opacity: 1; }

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(1rem);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}
</style>