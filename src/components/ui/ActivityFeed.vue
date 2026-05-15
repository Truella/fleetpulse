<template>
  <div class="flex flex-col overflow-hidden rounded-md border border-[var(--color-border)]
              bg-[var(--color-surface)]">

    <!-- Header -->
    <div class="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
      <span class="text-[0.75rem] font-semibold uppercase tracking-[0.07em] text-[var(--color-text)] shrink-0">
        Activity Feed
      </span>
      <span
        class="text-[0.65rem] font-mono text-[var(--color-muted)] shrink-0"
        :key="feedStore.filteredFeed.length"
        style="animation: feedCountFlash 0.4s ease both"
      >
        {{ feedStore.filteredFeed.length }} events
      </span>
      <div class="ml-auto">
        <input
          v-model="localSearch"
          type="search"
          spellcheck="false"
          placeholder="Search vehicle or event…"
          class="w-[220px] px-2.5 py-1 rounded text-[0.7rem] font-mono outline-none
                 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]
                 placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]
                 transition-colors duration-150"
        />
      </div>
    </div>

    <!-- Column headers -->
    <div class="grid grid-cols-[90px_80px_1fr_auto] gap-3 px-4 py-1.5
                text-[0.65rem] uppercase tracking-[0.07em] text-[var(--color-muted)]
                border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-border)_30%,transparent)]">
      <span>Time</span>
      <span>Vehicle</span>
      <span>Event</span>
      <span>Severity</span>
    </div>

    <!-- Virtual list -->
    <RecycleScroller
      v-if="feedStore.filteredFeed.length"
      class="h-[320px]"
      :items="feedStore.filteredFeed"
      :item-size="37"
      key-field="id"
      :buffer="80"
    >
      <template #default="{ item }">
        <FeedRow :entry="item" />
      </template>
    </RecycleScroller>

    <!-- Empty state -->
    <div v-else class="h-[120px] flex items-center justify-center text-[0.75rem] font-mono text-[var(--color-muted)]">
      {{ feedStore.searchTerm ? 'No matching events.' : 'No events yet — stream starting…' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { useFeedStore } from '../../stores/feedStore'
import { useDebounce } from '../../composables/useDebounce'
import FeedRow from './FeedRow.vue'

const feedStore = useFeedStore()
const localSearch = ref('')

const syncSearch = useDebounce((val: string) => {
  feedStore.searchTerm = val
}, 200)

watch(localSearch, val => syncSearch(val))
</script>