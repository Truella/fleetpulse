<template>
  <div class="feed">
    <div class="feed__header">
      <span class="feed__title">Activity Feed</span>
      <span class="feed__count font-mono" :key="feedStore.filteredFeed.length" :class="{ 'feed__count--flash': true }">
        {{ feedStore.filteredFeed.length }} events
      </span>
      <div class="feed__search">
        <input
          v-model="localSearch"
          class="feed__input font-mono"
          placeholder="Search vehicle or event…"
          type="search"
          spellcheck="false"
        />
      </div>
    </div>

    <div class="feed__cols">
      <span>Time</span>
      <span>Vehicle</span>
      <span>Event</span>
      <span>Severity</span>
    </div>

    <RecycleScroller
      v-if="feedStore.filteredFeed.length"
      class="feed__scroller"
      :items="feedStore.filteredFeed"
      :item-size="37"
      key-field="id"
      :buffer="80"
    >
      <template #default="{ item }">
        <FeedRow :entry="item" />
      </template>
    </RecycleScroller>

    <div v-else class="feed__empty font-mono">
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

<style scoped>
.feed {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.feed__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.feed__title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text);
  flex-shrink: 0;
}

.feed__count {
  font-size: 0.65rem;
  color: var(--color-muted);
  flex-shrink: 0;
}

/* Subtle amber flash when count changes (keyed element re-mounts) */
.feed__count--flash {
  animation: countFlash 0.4s ease both;
}

@keyframes countFlash {
  0%   { color: var(--color-accent); }
  100% { color: var(--color-muted); }
}

.feed__search {
  margin-left: auto;
}

.feed__input {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.25rem 0.625rem;
  font-size: 0.7rem;
  color: var(--color-text);
  width: 220px;
  outline: none;
  transition: border-color 0.15s;
}

.feed__input::placeholder { color: var(--color-muted); }
.feed__input:focus { border-color: var(--color-accent); }

.feed__cols {
  display: grid;
  grid-template-columns: 90px 80px 1fr auto;
  gap: 0.75rem;
  padding: 0.3rem 1rem;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-muted);
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-border) 30%, transparent);
}

.feed__scroller {
  height: 320px;
}

.feed__empty {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: var(--color-muted);
}

@media (max-width: 767px) {
  .feed__cols {
    grid-template-columns: 70px 70px 1fr auto;
    gap: 0.5rem;
    padding: 0.3rem 0.75rem;
  }
  .feed__input { width: 150px; }
}
</style>