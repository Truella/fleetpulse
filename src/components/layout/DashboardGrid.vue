<template>
  <main class="dashboard">
    <!-- KPI row -->
    <section class="dashboard__kpi">
      <slot name="kpi" />
    </section>

    <!-- Charts row -->
    <section class="dashboard__charts">
      <slot name="chart-area" />
      <slot name="chart-line" />
      <slot name="chart-bar" />
      <slot name="chart-candle" />
    </section>

    <!-- Activity feed -->
    <section class="dashboard__feed">
      <slot name="feed" />
    </section>
  </main>
</template>

<style scoped>
.dashboard {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: calc(100vh - 52px);
  background: var(--color-bg);
}

/* KPI row — 4 cols on desktop */
.dashboard__kpi {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

/* Charts — 2 cols on desktop */
.dashboard__charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

/* Feed — full width */
.dashboard__feed {
  min-height: 320px;
}

/* Tablet */
@media (max-width: 1279px) and (min-width: 768px) {
  .dashboard__kpi {
    grid-template-columns: repeat(2, 1fr);
  }
  .dashboard__charts {
    grid-template-columns: 1fr;
  }
}

/* Mobile */
@media (max-width: 767px) {
  .dashboard {
    padding: 0.75rem;
  }
  .dashboard__kpi {
    grid-template-columns: 1fr;
  }
  .dashboard__charts {
    grid-template-columns: 1fr;
  }
}
</style>