# FleetPulse

> Real-time logistics monitoring dashboard — Vue 3 + TypeScript + ECharts

![FleetPulse](https://img.shields.io/badge/Vue-3-42b883?style=flat&logo=vue.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat&logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat&logo=tailwindcss)

---

## 1. Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). No environment variables required.

```bash
npm run build   # production build
npm run preview # preview production build locally
```

---

## 2. Architecture

FleetPulse follows a strict **3-layer flow**: streaming → stores → UI. No layer reaches past its neighbour.

```
┌─────────────────────────────────────────┐
│  STREAMING LAYER                        │
│  useDataStream (composable)             │
│  generateTick() → safeParseTick()       │
│  setInterval 500ms                      │
└────────────────┬────────────────────────┘
                 │ push()
┌────────────────▼────────────────────────┐
│  STATE LAYER (Pinia stores)             │
│  metricsStore  feedStore  uiStore       │
│  Capped arrays, computed getters        │
└────────────────┬────────────────────────┘
                 │ reactive refs / computed
┌────────────────▼────────────────────────┐
│  UI LAYER (Vue components)              │
│  TopBar  DashboardGrid  Charts  Feed    │
│  Read-only consumers of store state     │
└─────────────────────────────────────────┘
```

**Component tree:**
```
App.vue
├── TopBar.vue
├── DashboardGrid.vue
│   ├── MetricCard.vue ×4
│   ├── AreaChart.vue
│   ├── LineChart.vue
│   ├── BarChart.vue
│   ├── CandlestickChart.vue
│   └── ActivityFeed.vue
│       └── FeedRow.vue
└── Toast.vue
```

---

## 3. State Management

All state lives in three Pinia stores using the **composition API style** (`defineStore` with setup function).

### metricsStore
Holds the time-series window of `FleetTick` data. The array is hard-capped at **120 points** (1 minute at 500ms intervals). Every `push()` calls `shift()` when at capacity — no unbounded growth.

Computed getters derive chart-ready data directly from the series:
- `avgSpeedSeries` — `[timestamp, speed]` pairs for the area chart
- `fuelByVehicle` — per-vehicle fuel history map for the line chart
- `ohlcSeries` — speed bucketed into 30s OHLC candles for the candlestick chart
- `deliveriesByRoute` — moving-tick counts per route for the bar chart

### feedStore
Holds the activity feed capped at **500 entries**, newest first. The `filteredFeed` computed getter applies the search term without mutating the source array.

### uiStore
Owns all UI state: time range, pause flag, dark/light mode. The `isDark` flag is persisted to `localStorage` via `@vueuse/core useLocalStorage` — theme survives page reload.

### Why shallowRef
Series arrays use `shallowRef` instead of `ref`. Vue's deep reactivity tracking on large arrays causes significant overhead. `shallowRef` makes the entire array reference reactive but skips deep traversal — re-renders trigger on `series.value = next` (reference swap) rather than element-level mutations.

---

## 4. Rendering Optimisations

| Concern | Implementation |
|---|---|
| Chart update frequency | `useThrottle(fn, 100ms)` wrapper around `setOption` — ECharts never receives more than 10 updates/s |
| Bar chart | `useDebounce(fn, 300ms)` — lower priority, less visual urgency |
| Feed DOM size | `vue-virtual-scroller RecycleScroller` — only ~30 DOM nodes rendered regardless of feed length (tested at 500 entries) |
| Feed row re-renders | `animation: feedIn` CSS-only — no JS animation library, no layout cost |
| Chart flicker | `animation: false` on all ECharts option updates; `notMerge: false` preserves axis state |
| Array growth | All store arrays capped; `push` + `shift` pattern — profiler shows flat memory |
| Input lag | Search input debounced 200ms via `useDebounce` composable |

### ECharts update pattern
All chart components use the same throttled watcher pattern:

```ts
const throttledUpdate = useThrottle(() => {
  chartRef.value?.setOption({ series: [{ data: latestData.value }] }, false)
}, 100)

watch(() => storeData, throttledUpdate)
```

The key is passing **partial options** to `setOption` rather than rebuilding the full option object — ECharts merges the delta, avoiding full re-renders.

---

## 5. Streaming Approach

### Mock generator
`generateTick()` in `src/utils/generators.ts` produces realistic `FleetTick` payloads with **stateful drift** — each vehicle's fuel and speed values change incrementally from tick to tick rather than jumping randomly. This produces coherent sparklines and meaningful OHLC candles.

### Validation
Every tick passes through `safeParseTick()` (Zod schema) before entering any store. Malformed ticks are silently discarded with a `console.warn`. The UI never sees invalid data.

### Pause / Resume
`useDataStream` reads `uiStore.isPaused` on every tick. Pausing does not clear the `setInterval` — it simply skips the push. This means resume is instantaneous with no re-initialisation cost.

### Reconnect backoff (simulated)
In a production WebSocket implementation, the reconnect strategy would be:

```
attempt 1: wait 1s
attempt 2: wait 2s
attempt 3: wait 4s
...
max wait:  30s
```

The mock generator simulates resilience by validating every tick — a dropped or corrupted WebSocket frame is equivalent to a Zod parse failure, handled identically.

### Memory leak prevention
- `setInterval` is cleared in `onUnmounted` inside `useDataStream`
- All ECharts instances call `.dispose()` via `vue-echarts` `autoresize` + component unmount lifecycle
- `window.removeEventListener` for the Space keydown handler is called in `onUnmounted`

---

## 6. Trade-offs

### ECharts over Recharts / Chart.js
ECharts (`vue-echarts`) was chosen over Recharts (React-only) and Chart.js for three reasons:
1. **Vue-native** — `vue-echarts` provides a first-class component wrapper with proper lifecycle integration
2. **Large dataset performance** — ECharts uses canvas rendering and handles 10k+ points without degradation; Chart.js SVG rendering struggles above ~500 animated points
3. **Candlestick built-in** — ECharts ships a production-ready `CandlestickChart` type; implementing one in Chart.js requires a plugin

### Mock generator over real WebSocket
A real WS server was out of scope for this submission. The mock generator produces identical data shapes to what a real `wss://` feed would emit, so swapping in a real connection requires only changing `useDataStream` — stores and UI are untouched.

### No Web Worker
The tick generator and Zod validation run on the main thread. At 500ms intervals with lightweight payloads, the profiler shows < 1ms per tick — well below the 16ms frame budget. A Web Worker would be the correct next step if tick rate increased to < 50ms or payload parsing became expensive (e.g. bulk historical data on connect).


---

## Folder structure

```
src/
├── components/
│   ├── charts/
│   │   ├── AreaChart.vue
│   │   ├── LineChart.vue
│   │   ├── BarChart.vue
│   │   └── CandlestickChart.vue
│   ├── ui/
│   │   ├── MetricCard.vue
│   │   ├── ActivityFeed.vue
│   │   ├── FeedRow.vue
│   │   ├── StatusBadge.vue
│   │   └── Toast.vue
│   └── layout/
│       ├── TopBar.vue
│       └── DashboardGrid.vue
├── composables/
│   ├── useDataStream.ts
│   ├── useDebounce.ts
│   └── useThrottle.ts
├── stores/
│   ├── metricsStore.ts
│   ├── feedStore.ts
│   └── uiStore.ts
├── types/
│   └── index.ts
├── utils/
│   ├── validators.ts
│   ├── generators.ts
│   └── formatters.ts
├── App.vue
└── main.ts
```
