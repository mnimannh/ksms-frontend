<template>
  <div class="app-layout">
    <AdminSidebar />

    <main class="page">

      <!-- ── TOP BAR ── -->
      <div class="topbar">
        <div class="topbar-left">
          <p class="topbar-date">{{ today }}</p>
          <h1 class="topbar-title">Alerts & <span class="accent">Insights</span></h1>
        </div>
        <div class="topbar-right">
          <div class="tab-group">
            <button :class="['tab-btn', activeTab === 'alarms' ? 'active' : '']" @click="activeTab = 'alarms'">
              Low Stock Alerts
              <span v-if="unreadCount > 0" class="tab-badge tab-badge--red">{{ unreadCount }}</span>
            </button>
            <button :class="['tab-btn', activeTab === 'insights' ? 'active' : '']" @click="activeTab = 'insights'">
              Operational Insights
              <span v-if="insightUnreadCount > 0" class="tab-badge tab-badge--indigo">{{ insightUnreadCount }}</span>
            </button>
            <button :class="['tab-btn', activeTab === 'analytics' ? 'active' : '']" @click="activeTab = 'analytics'">
              Analytics
            </button>
          </div>
          <div class="live-dot"><span class="pulse" />Live</div>
        </div>
      </div>

      <!-- ── SUMMARY CARDS ── -->
      <div class="summary-row">
        <div class="summary-card">
          <div class="summary-icon" style="background:#fef2f2; color:#ef4444">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ unreadCount }}</p>
            <p class="summary-label">Unread Stock Alerts</p>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon" style="background:#eef2ff; color:#6366f1">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ insightUnreadCount }}</p>
            <p class="summary-label">Unread Insights</p>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon" style="background:#f0fdf4; color:#10b981">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ alarms.filter(a => a.is_read).length }}</p>
            <p class="summary-label">Resolved Alerts</p>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon" style="background:#fffbeb; color:#f59e0b">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ insights.length }}</p>
            <p class="summary-label">Total Insights</p>
          </div>
        </div>
      </div>

      <!-- ── PANEL ── -->
      <div class="panel">
        <div class="card-header">
          <div>
            <p class="card-title">{{ activeTab === 'alarms' ? 'Low Stock Alerts' : 'Operational Insights' }}</p>
            <p class="card-sub">{{ activeTab === 'alarms' ? 'Variants currently below restock threshold' : 'Rule-based analysis of your inventory performance' }}</p>
          </div>
          <div v-if="activeTab !== 'analytics'" class="toolbar-right">
            <div class="time-filter">
              <button v-for="t in timeOptions" :key="t" :class="['time-btn', selectedTime === t ? 'active' : '']" @click="selectedTime = t">{{ t }}</button>
            </div>

            <!-- Alarms: Status filter -->
            <div class="dropdown" v-if="activeTab === 'alarms'">
              <button class="btn-filter" @click.stop="toggleDropdown('alarmStatus')">
                <span class="filter-label">Status</span>
                <span class="filter-value">{{ statusLabel }}</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              </button>
              <div class="dropdown-menu" :class="{ open: openDropdown === 'alarmStatus' }">
                <div @click="statusFilter = 'all'; closeDropdown()" class="dropdown-item" :class="{ active: statusFilter === 'all' }">All</div>
                <div @click="statusFilter = 'unread'; closeDropdown()" class="dropdown-item" :class="{ active: statusFilter === 'unread' }">Unread</div>
                <div @click="statusFilter = 'read'; closeDropdown()" class="dropdown-item" :class="{ active: statusFilter === 'read' }">Read</div>
              </div>
            </div>

            <!-- Insights filters -->
            <template v-if="activeTab === 'insights'">
              <!-- Sort -->
              <div class="dropdown">
                <button class="btn-filter" @click.stop="toggleDropdown('sort')">
                  <span class="filter-label">Sort</span>
                  <span class="filter-value">{{ insightSortOrder === 'latest' ? 'Latest' : 'Oldest' }}</span>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
                <div class="dropdown-menu" :class="{ open: openDropdown === 'sort' }">
                  <div @click="insightSortOrder = 'latest'; closeDropdown()" class="dropdown-item" :class="{ active: insightSortOrder === 'latest' }">Latest</div>
                  <div @click="insightSortOrder = 'oldest'; closeDropdown()" class="dropdown-item" :class="{ active: insightSortOrder === 'oldest' }">Oldest</div>
                </div>
              </div>

              <!-- Rule -->
              <div class="dropdown">
                <button class="btn-filter" @click.stop="toggleDropdown('rule')">
                  <span class="filter-label">Rule</span>
                  <span class="filter-value">{{ insightRuleFilter === 'all' ? 'All' : insightRuleFilter }}</span>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
                <div class="dropdown-menu" :class="{ open: openDropdown === 'rule' }">
                  <div @click="insightRuleFilter = 'all'; closeDropdown()" class="dropdown-item" :class="{ active: insightRuleFilter === 'all' }">All</div>
                  <div v-for="r in insightRules" :key="r" @click="insightRuleFilter = r; closeDropdown()" class="dropdown-item" :class="{ active: insightRuleFilter === r }">{{ ruleLabel(r) }}</div>
                </div>
              </div>

              <!-- Severity -->
              <div class="dropdown">
                <button class="btn-filter" @click.stop="toggleDropdown('severity')">
                  <span class="filter-label">Severity</span>
                  <span class="filter-value">{{ insightSeverityFilter === 'all' ? 'All' : insightSeverityFilter }}</span>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
                <div class="dropdown-menu" :class="{ open: openDropdown === 'severity' }">
                  <div @click="insightSeverityFilter = 'all'; closeDropdown()" class="dropdown-item" :class="{ active: insightSeverityFilter === 'all' }">All</div>
                  <div @click="insightSeverityFilter = 'critical'; closeDropdown()" class="dropdown-item" :class="{ active: insightSeverityFilter === 'critical' }">Critical</div>
                  <div @click="insightSeverityFilter = 'warning'; closeDropdown()" class="dropdown-item" :class="{ active: insightSeverityFilter === 'warning' }">Warning</div>
                  <div @click="insightSeverityFilter = 'info'; closeDropdown()" class="dropdown-item" :class="{ active: insightSeverityFilter === 'info' }">Info</div>
                </div>
              </div>

              <!-- Category -->
              <div class="dropdown">
                <button class="btn-filter" @click.stop="toggleDropdown('category')">
                  <span class="filter-label">Category</span>
                  <span class="filter-value">{{ insightCategoryFilter === 'all' ? 'All' : insightCategoryFilter }}</span>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
                <div class="dropdown-menu" :class="{ open: openDropdown === 'category' }">
                  <div @click="insightCategoryFilter = 'all'; closeDropdown()" class="dropdown-item" :class="{ active: insightCategoryFilter === 'all' }">All</div>
                  <div v-for="cat in insightCategories" :key="cat" @click="insightCategoryFilter = cat; closeDropdown()" class="dropdown-item" :class="{ active: insightCategoryFilter === cat }">{{ cat }}</div>
                </div>
              </div>

              <!-- Status -->
              <div class="dropdown">
                <button class="btn-filter" @click.stop="toggleDropdown('insightStatus')">
                  <span class="filter-label">Status</span>
                  <span class="filter-value">{{ insightStatusFilter === 'all' ? 'All' : insightStatusFilter === 'unread' ? 'Unread' : 'Read' }}</span>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
                <div class="dropdown-menu" :class="{ open: openDropdown === 'insightStatus' }">
                  <div @click="insightStatusFilter = 'all'; closeDropdown()" class="dropdown-item" :class="{ active: insightStatusFilter === 'all' }">All</div>
                  <div @click="insightStatusFilter = 'unread'; closeDropdown()" class="dropdown-item" :class="{ active: insightStatusFilter === 'unread' }">Unread</div>
                  <div @click="insightStatusFilter = 'read'; closeDropdown()" class="dropdown-item" :class="{ active: insightStatusFilter === 'read' }">Read</div>
                </div>
              </div>

              <!-- Reset filters -->
              <button v-if="hasInsightFilters" class="btn-reset" @click="resetInsightFilters">Reset</button>
            </template>

            <div class="search-box">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.5"/><path d="M9.5 9.5L12.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              <input v-model="search" type="text" placeholder="Search..." />
            </div>
          </div>
        </div>

        <!-- Low Stock Table -->
        <div v-if="activeTab === 'alarms'" class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Category</th>
                <th>Product</th>
                <th>Variant</th>
                <th>Stock</th>
                <th>Threshold</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(alarm, i) in filteredAlarms" :key="alarm.id" class="table-row" :class="{ 'row-unread': !alarm.is_read }">
                <td class="td-num">{{ i + 1 }}</td>
                <td class="td-muted">{{ alarm.category_name }}</td>
                <td class="td-product">{{ alarm.product_name }}</td>
                <td>
                  <div class="cell-item">
                    <div class="item-icon" style="background:#eef2ff; color:#6366f1">
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="M4 8h8M8 4v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                    </div>
                    <span class="item-name">{{ alarm.variant }}</span>
                  </div>
                </td>
                <td>
                  <span class="stock-val" :class="alarm.stock <= alarm.threshold ? 'stock-low' : 'stock-ok'">
                    <span class="stock-dot"></span>{{ alarm.stock }}
                  </span>
                </td>
                <td class="td-muted">{{ alarm.threshold }}</td>
                <td>
                  <span class="badge" :class="alarm.is_read ? 'badge-green' : 'badge-red'">
                    <span class="badge-dot"></span>{{ alarm.is_read ? 'Read' : 'Unread' }}
                  </span>
                </td>
                <td class="td-muted">{{ formatDate(alarm.created_at) }}</td>
                <td>
                  <button v-if="!alarm.is_read" class="btn-action" @click="markAsRead(alarm.id)">Mark read</button>
                  <span v-else class="done-check">
                    <svg width="13" height="11" viewBox="0 0 13 11" fill="none"><path d="M1.5 5.5L5 9L11.5 1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </span>
                </td>
              </tr>
              <tr v-if="filteredAlarms.length === 0">
                <td colspan="9" class="empty-state">No alerts found</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Insights Table -->
        <div v-if="activeTab === 'insights'" class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Rule</th>
                <th>Category</th>
                <th>Product</th>
                <th>Variant</th>
                <th>Message</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Detected</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ins, i) in filteredInsights" :key="ins.id" class="table-row" :class="{ 'row-unread': !ins.is_read }">
                <td class="td-num">{{ i + 1 }}</td>
                <td>
                  <div class="rule-chip" :class="`rule-chip--${ins.rule_id.replace('-','').toLowerCase()}`">
                    <span class="rule-sym">{{ ruleIcon(ins.rule_id) }}</span>
                    {{ ruleLabel(ins.rule_id) }}
                  </div>
                </td>
                <td class="td-muted">{{ ins.category_name }}</td>
                <td class="td-product">{{ ins.product_name }}</td>
                <td class="td-muted">{{ ins.variant_name }}</td>
                <td class="td-msg">{{ ins.message }}</td>
                <td>
                  <span class="badge" :class="{
                    'badge-red':    ins.severity === 'critical',
                    'badge-amber':  ins.severity === 'warning',
                    'badge-blue':   ins.severity === 'info'
                  }">
                    <span class="badge-dot"></span>{{ ins.severity }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="ins.is_read ? 'badge-green' : 'badge-red'">
                    <span class="badge-dot"></span>{{ ins.is_read ? 'Read' : 'Unread' }}
                  </span>
                </td>
                <td class="td-muted">{{ formatDate(ins.created_at) }}</td>
                <td>
                  <button v-if="!ins.is_read" class="btn-action" @click="markInsightAsRead(ins.id)">Mark read</button>
                  <span v-else class="done-check">
                    <svg width="13" height="11" viewBox="0 0 13 11" fill="none"><path d="M1.5 5.5L5 9L11.5 1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </span>
                </td>
              </tr>
              <tr v-if="filteredInsights.length === 0">
                <td colspan="10" class="empty-state">No insights detected</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Analytics Tab -->
        <div v-if="activeTab === 'analytics'" class="an-body">

          <!-- ══ STOCK ALERTS ══════════════════════════════════ -->
          <div class="an-section">
            <div class="an-section-head">
              <span class="an-section-pip" style="background:#ef4444"></span>
              <p class="an-section-title">Stock Alerts</p>
            </div>

            <!-- Stat strip -->
            <div class="an-stat-strip">
              <div class="an-stat">
                <p class="an-stat-val" style="color:#ef4444">{{ alarms.filter(a => !Number(a.is_read)).length }}</p>
                <p class="an-stat-lbl">Unread alerts</p>
              </div>
              <div class="an-stat-sep"></div>
              <div class="an-stat">
                <p class="an-stat-val" style="color:#f97316">{{ stockStats.needsRestock }}</p>
                <p class="an-stat-lbl">Below threshold</p>
              </div>
              <div class="an-stat-sep"></div>
              <div class="an-stat">
                <p class="an-stat-val" style="color:#6366f1">{{ stockStats.avgDeficit }}</p>
                <p class="an-stat-lbl">Avg unit deficit</p>
              </div>
              <div class="an-stat-sep"></div>
              <div class="an-stat">
                <p class="an-stat-val an-stat-val--sm">{{ stockStats.topCat || '—' }}</p>
                <p class="an-stat-lbl">Worst category</p>
              </div>
            </div>

            <div class="an-row an-row--2">
              <!-- Deficit ranking bar -->
              <div class="an-card an-card--wide">
                <div class="an-card-header">
                  <div>
                    <p class="an-card-title">Stock Deficit Ranking</p>
                    <p class="an-card-sub">How many units each item is below its restock threshold — worst first</p>
                  </div>
                  <div class="an-legend">
                    <span class="an-leg-item"><span class="an-leg-dot" style="background:#ef4444"></span>Critical ≥75%</span>
                    <span class="an-leg-item"><span class="an-leg-dot" style="background:#f97316"></span>High ≥50%</span>
                    <span class="an-leg-item"><span class="an-leg-dot" style="background:#f59e0b"></span>Moderate</span>
                    <span class="an-leg-item"><span class="an-leg-dot" style="background:#eab308"></span>Low</span>
                  </div>
                </div>
                <div class="an-chart-wrap" style="height:260px; margin-top:12px">
                  <Bar v-if="coloredDeficitData.labels.length" :data="coloredDeficitData" :options="hbarOptions" />
                  <div v-else class="an-empty">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <p>All items are within threshold — great work!</p>
                  </div>
                </div>
              </div>

              <!-- Restock Spotlight -->
              <div class="an-card rs-card">
                <div class="rs-card-head">
                  <div>
                    <p class="an-card-title">Restock Now</p>
                    <p class="an-card-sub">Act on these first — worst deficit items</p>
                  </div>
                  <span v-if="restockSpotlight.length" class="rs-urgent-badge">{{ restockSpotlight.length }} urgent</span>
                </div>

                <div v-if="restockSpotlight.length" class="rs-list">
                  <div
                    v-for="item in restockSpotlight"
                    :key="item.id"
                    class="rs-item"
                    :class="item.stock === 0 ? 'rs--out' : item.ratio >= 0.75 ? 'rs--critical' : 'rs--high'"
                  >
                    <div class="rs-top">
                      <span class="rs-status-dot" :class="item.stock === 0 ? 'dot--out' : item.ratio >= 0.75 ? 'dot--critical' : 'dot--high'"></span>
                      <span class="rs-name">{{ (item.variant || item.product_name || '').slice(0, 24) }}</span>
                      <span class="rs-label" :class="item.stock === 0 ? 'rl--out' : item.ratio >= 0.75 ? 'rl--critical' : 'rl--high'">
                        {{ item.stock === 0 ? 'OUT OF STOCK' : item.ratio >= 0.75 ? 'CRITICAL' : 'HIGH' }}
                      </span>
                    </div>
                    <div class="rs-bar-track">
                      <div
                        class="rs-bar-fill"
                        :style="`width:${Math.min(item.fillPct, 100)}%; background:${item.stock === 0 ? '#ef4444' : item.ratio >= 0.75 ? '#f97316' : '#f59e0b'}`"
                      ></div>
                    </div>
                    <div class="rs-foot">
                      <span class="rs-units">{{ item.stock }} / {{ item.threshold }} units</span>
                      <button class="rs-view-btn" @click="activeTab = 'alarms'">View alert →</button>
                    </div>
                  </div>
                </div>

                <div v-else class="an-empty" style="min-height:160px">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#86efac" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <p style="color:#16a34a;font-weight:600">All items within threshold!</p>
                </div>
              </div>
            </div>
          </div>

          <!-- ══ OPERATIONAL INSIGHTS ══════════════════════════ -->
          <div class="an-section">
            <div class="an-section-head">
              <span class="an-section-pip" style="background:#6366f1"></span>
              <p class="an-section-title">Operational Insights</p>
            </div>

            <div v-if="!insights.length" class="an-no-data">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p>No insights generated yet — open the Insights tab to run the engine.</p>
            </div>

            <template v-else>

              <!-- Critical unread callout -->
              <div v-if="criticalUnreadInsights.length" class="cc-callout">
                <div class="cc-head">
                  <div class="cc-head-left">
                    <span class="cc-pulse"></span>
                    <span class="cc-head-title">{{ criticalUnreadInsights.length }} Unread Critical Insight{{ criticalUnreadInsights.length > 1 ? 's' : '' }} — Needs Attention</span>
                  </div>
                  <span class="cc-head-sub">Mark read to dismiss</span>
                </div>
                <div class="cc-list">
                  <div v-for="ins in criticalUnreadInsights" :key="ins.id" class="cc-item">
                    <div class="cc-item-left">
                      <div class="cc-rule-chip">{{ ruleLabel(ins.rule_id) }} · {{ ins.rule_id }}</div>
                      <p class="cc-product">{{ ins.product_name }}<span v-if="ins.variant_name"> · {{ ins.variant_name }}</span></p>
                      <p class="cc-message">{{ ins.message }}</p>
                    </div>
                    <button class="cc-mark-btn" @click="markInsightAsRead(ins.id)">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Done
                    </button>
                  </div>
                </div>
              </div>

              <!-- Rule breakdown cards -->
              <div class="an-rule-grid">
                <div v-for="rule in ruleCardData" :key="rule.id" class="an-rule-card" :style="`--rc: ${rule.color}`">
                  <div class="arc-top">
                    <div class="arc-icon">{{ rule.icon }}</div>
                    <div class="arc-info">
                      <p class="arc-label">{{ rule.label }}</p>
                      <p class="arc-id">{{ rule.id }}</p>
                    </div>
                    <div class="arc-count">
                      <span class="arc-num">{{ rule.count }}</span>
                      <span class="arc-unit">{{ rule.count === 1 ? 'item' : 'items' }}</span>
                    </div>
                  </div>
                  <div class="arc-track"><div class="arc-fill" :style="`width:${rule.pct}%`"></div></div>
                </div>
              </div>

              <div class="an-row an-row--2">
                <!-- Severity donut -->
                <div class="an-card">
                  <p class="an-card-title">Severity Breakdown</p>
                  <p class="an-card-sub">Distribution of insights by urgency level</p>
                  <div class="an-donut-wrap" style="margin-top:12px">
                    <Doughnut :data="severityDonutData" :options="donutOptions" />
                    <div class="an-donut-center">
                      <span class="an-donut-num">{{ insights.length }}</span>
                      <span class="an-donut-lbl">insights</span>
                    </div>
                  </div>
                </div>

                <!-- Category ranking -->
                <div class="an-card">
                  <div class="an-card-header">
                    <div>
                      <p class="an-card-title">Category Ranking</p>
                      <p class="an-card-sub">Which categories generate the most operational issues</p>
                    </div>
                  </div>
                  <div class="cat-rank-list">
                    <div v-for="(cat, idx) in categoryRankingData" :key="cat.name" class="cat-rank-row">
                      <span class="cat-pos" :class="idx === 0 ? 'cat-pos--1' : idx === 1 ? 'cat-pos--2' : idx === 2 ? 'cat-pos--3' : ''">{{ idx + 1 }}</span>
                      <div class="cat-rank-body">
                        <div class="cat-rank-meta">
                          <span class="cat-rank-name">{{ cat.name }}</span>
                          <span class="cat-rank-count">{{ cat.count }} insight{{ cat.count !== 1 ? 's' : '' }}</span>
                        </div>
                        <div class="cat-track">
                          <div class="cat-fill" :style="`width:${cat.pct}%; background:${idx === 0 ? '#6366f1' : idx === 1 ? '#8b5cf6' : '#a78bfa'}`"></div>
                        </div>
                      </div>
                    </div>
                    <div v-if="!categoryRankingData.length" class="an-empty"><p>No category data</p></div>
                  </div>
                </div>
              </div>
            </template>
          </div>

        </div>

        <div v-if="activeTab !== 'analytics'" class="table-footer">
          <span>Showing <strong>{{ activeTab === 'alarms' ? filteredAlarms.length : filteredInsights.length }}</strong> of <strong>{{ activeTab === 'alarms' ? alarms.length : insights.length }}</strong> {{ activeTab === 'alarms' ? 'alerts' : 'insights' }}</span>
        </div>
      </div>

      <!-- Toast -->
      <transition name="toast">
        <div v-if="toast.show" class="toast">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {{ toast.message }}
        </div>
      </transition>

    </main>
  </div>
</template>

<script>
import API_BASE_URL from "@/services/api";
import AdminSidebar from '@/components/sidebar/AdminSidebar.vue'
import axios from 'axios'
import { Doughnut, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
} from 'chart.js'
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const RULE_META = {
  'INV-002': { label: 'Slow-Moving Stock', icon: '↓' },
  'INV-003': { label: 'Fast-Moving Item',  icon: '↑' },
  'INV-004': { label: 'Revenue Drop',      icon: '!' },
  'INV-005': { label: 'Restock Ignored',   icon: '⊘' },
  'INV-006': { label: 'Never Sold',        icon: '○' },
}

export default {
  name: 'AdminAlarm',
  components: { AdminSidebar, Doughnut, Bar },

  data() {
    const now = new Date()
    return {
      today: now.toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      activeTab: 'alarms',
      insights: [],
      toast: { show: false, message: '' },
      search: '',
      timeOptions: ['All', 'Today', 'Week', 'Month'],
      selectedTime: 'All',
      statusFilter: 'all',
      alarms: [],
      insightSortOrder: 'latest',
      insightRuleFilter: 'all',
      insightSeverityFilter: 'all',
      insightCategoryFilter: 'all',
      insightStatusFilter: 'all',
      openDropdown: null,
    }
  },

  computed: {
    statusLabel() {
      if (this.statusFilter === 'unread') return 'Unread'
      if (this.statusFilter === 'read') return 'Read'
      return 'All'
    },
    unreadCount() { return this.alarms.filter(a => !a.is_read).length },
    insightUnreadCount() { return this.insights.filter(i => !i.is_read).length },

    filteredAlarms() {
      return this.alarms.filter(a => {
        const q = this.search.toLowerCase()
        const matchSearch = (a.variant || '').toLowerCase().includes(q) || (a.product_name || '').toLowerCase().includes(q) || (a.category_name || '').toLowerCase().includes(q)
        const date = new Date(a.created_at); const now = new Date()
        let matchTime = true
        if (this.selectedTime === 'Today') matchTime = date.toDateString() === now.toDateString()
        else if (this.selectedTime === 'Week') matchTime = (now - date) / 86400000 <= 7
        else if (this.selectedTime === 'Month') matchTime = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        const rv = Number(a.is_read)
        let matchStatus = true
        if (this.statusFilter === 'unread') matchStatus = rv === 0
        if (this.statusFilter === 'read') matchStatus = rv === 1
        return matchSearch && matchTime && matchStatus
      })
    },

    insightRules() {
      return [...new Set(this.insights.map(i => i.rule_id))].sort()
    },
    insightCategories() {
      return [...new Set(this.insights.map(i => i.category_name).filter(Boolean))].sort()
    },
    hasInsightFilters() {
      return this.insightSortOrder !== 'latest' || this.insightRuleFilter !== 'all' ||
             this.insightSeverityFilter !== 'all' || this.insightCategoryFilter !== 'all' ||
             this.insightStatusFilter !== 'all'
    },
    filteredInsights() {
      const q = this.search.toLowerCase()
      const now = new Date()
      let list = this.insights.filter(i => {
        const matchSearch = !q ||
          (i.variant_name || '').toLowerCase().includes(q) ||
          (i.message || '').toLowerCase().includes(q) ||
          (i.product_name || '').toLowerCase().includes(q) ||
          (i.category_name || '').toLowerCase().includes(q) ||
          (i.rule_id || '').toLowerCase().includes(q)
        const date = new Date(i.created_at)
        let matchTime = true
        if (this.selectedTime === 'Today') matchTime = date.toDateString() === now.toDateString()
        else if (this.selectedTime === 'Week') matchTime = (now - date) / 86400000 <= 7
        else if (this.selectedTime === 'Month') matchTime = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        const matchRule     = this.insightRuleFilter === 'all'     || i.rule_id === this.insightRuleFilter
        const matchSeverity = this.insightSeverityFilter === 'all' || i.severity === this.insightSeverityFilter
        const matchCategory = this.insightCategoryFilter === 'all' || i.category_name === this.insightCategoryFilter
        const matchStatus   = this.insightStatusFilter === 'all'   ||
                              (this.insightStatusFilter === 'unread' && !Number(i.is_read)) ||
                              (this.insightStatusFilter === 'read'   && Number(i.is_read))
        return matchSearch && matchTime && matchRule && matchSeverity && matchCategory && matchStatus
      })
      list = [...list].sort((a, b) => {
        const diff = new Date(a.created_at) - new Date(b.created_at)
        return this.insightSortOrder === 'latest' ? -diff : diff
      })
      return list
    },

    // ── Analytics ────────────────────────────────────────────────
    stockStats() {
      const needsRestock = this.alarms.filter(a => Math.max(0, a.threshold - a.stock) > 0).length
      const deficits = this.alarms.map(a => Math.max(0, a.threshold - a.stock)).filter(d => d > 0)
      const avgDeficit = deficits.length ? Math.round(deficits.reduce((s, d) => s + d, 0) / deficits.length) : 0
      const catCounts = {}
      this.alarms.forEach(a => { if (a.category_name) catCounts[a.category_name] = (catCounts[a.category_name] || 0) + 1 })
      const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
      return { needsRestock, avgDeficit, topCat }
    },
    restockSpotlight() {
      return [...this.alarms]
        .map(a => ({
          ...a,
          deficit: Math.max(0, a.threshold - a.stock),
          ratio:   Math.max(0, a.threshold - a.stock) / (a.threshold || 1),
          fillPct: Math.round((a.stock / (a.threshold || 1)) * 100),
        }))
        .filter(a => a.deficit > 0)
        .sort((a, b) => b.ratio - a.ratio || b.deficit - a.deficit)
        .slice(0, 3)
    },
    criticalUnreadInsights() {
      return this.insights
        .filter(i => i.severity === 'critical' && !Number(i.is_read))
        .slice(0, 4)
    },
    coloredDeficitData() {
      const items = [...this.alarms]
        .map(a => {
          const deficit = Math.max(0, a.threshold - a.stock)
          const ratio   = deficit / (a.threshold || 1)
          const color   = ratio >= 0.75 ? '#ef4444' : ratio >= 0.5 ? '#f97316' : ratio >= 0.25 ? '#f59e0b' : '#eab308'
          const label   = (a.variant || a.product_name || '').slice(0, 20)
          return { label, deficit, color }
        })
        .filter(a => a.deficit > 0)
        .sort((a, b) => b.deficit - a.deficit)
        .slice(0, 8)
      return {
        labels: items.map(i => i.label),
        datasets: [{ label: 'Units below threshold', data: items.map(i => i.deficit), backgroundColor: items.map(i => i.color), borderRadius: 6 }],
      }
    },
    severityDonutData() {
      const c = this.insights.filter(i => i.severity === 'critical').length
      const w = this.insights.filter(i => i.severity === 'warning').length
      const n = this.insights.filter(i => i.severity === 'info').length
      return {
        labels: ['Critical', 'Warning', 'Info'],
        datasets: [{ data: [c, w, n], backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6'], borderWidth: 0, hoverOffset: 10 }],
      }
    },
    ruleCardData() {
      const COLORS = { 'INV-002': '#f59e0b', 'INV-003': '#10b981', 'INV-004': '#ef4444', 'INV-005': '#f97316', 'INV-006': '#8b5cf6' }
      const counts = {}
      this.insights.forEach(i => { counts[i.rule_id] = (counts[i.rule_id] || 0) + 1 })
      const max = Math.max(...Object.values(counts), 1)
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([id, count]) => ({
          id, count,
          label: RULE_META[id]?.label ?? id,
          icon:  RULE_META[id]?.icon  ?? '•',
          color: COLORS[id] ?? '#6366f1',
          pct:   Math.round((count / max) * 100),
        }))
    },
    categoryRankingData() {
      const counts = {}
      this.insights.forEach(i => { if (i.category_name) counts[i.category_name] = (counts[i.category_name] || 0) + 1 })
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6)
      const max = sorted[0]?.[1] || 1
      return sorted.map(([name, count]) => ({ name, count, pct: Math.round((count / max) * 100) }))
    },
    donutOptions() {
      return {
        responsive: true, maintainAspectRatio: false, cutout: '70%',
        plugins: {
          legend: { position: 'bottom', labels: { font: { family: 'DM Sans', size: 12 }, padding: 16, boxWidth: 10, borderRadius: 3 } },
          tooltip: { callbacks: { label: ctx => `  ${ctx.label}: ${ctx.parsed}` } },
        },
      }
    },
    hbarOptions() {
      return {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `  ${ctx.parsed.x} units below threshold` } } },
        scales: {
          x: { grid: { color: '#f1f5f9' }, ticks: { font: { family: 'DM Sans', size: 11 }, color: '#94a3b8' }, border: { display: false } },
          y: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 11 }, color: '#374151' }, border: { display: false } },
        },
      }
    },
  },

  methods: {
    ruleLabel(id) { return RULE_META[id]?.label ?? id },
    ruleIcon(id)  { return RULE_META[id]?.icon  ?? '•' },

    toggleDropdown(name) {
      this.openDropdown = this.openDropdown === name ? null : name
    },
    closeDropdown() {
      this.openDropdown = null
    },

    resetInsightFilters() {
      this.insightSortOrder = 'latest'
      this.insightRuleFilter = 'all'
      this.insightSeverityFilter = 'all'
      this.insightCategoryFilter = 'all'
      this.insightStatusFilter = 'all'
    },

    async fetchAlarms() {
      try { this.alarms = (await axios.get(`${API_BASE_URL}/api/alarm`)).data }
      catch (e) { console.error(e) }
    },

    async fetchInsights() {
      try {
        const { data } = await axios.post(`${API_BASE_URL}/api/analytics/run`)
        if (data.newInsights > 0) {
          this.toast = { show: true, message: `${data.newInsights} new insight(s) detected` }
          setTimeout(() => { this.toast.show = false }, 4000)
        }
        this.insights = (await axios.get(`${API_BASE_URL}/api/analytics/insights`)).data
      } catch (e) { console.error(e) }
    },

    async markAsRead(id) {
      try {
        await axios.patch(`${API_BASE_URL}/api/alarm/read/${id}`)
        const a = this.alarms.find(a => a.id === id); if (a) a.is_read = 1
      } catch (e) { console.error(e) }
    },

    async markInsightAsRead(id) {
      try {
        await axios.patch(`${API_BASE_URL}/api/analytics/insights/read/${id}`)
        const i = this.insights.find(i => i.id === id); if (i) i.is_read = 1
      } catch (e) { console.error(e) }
    },

    formatDate(d) {
      return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
  },

  mounted() {
    this.fetchAlarms()
    this.fetchInsights()
    document.addEventListener('click', this.closeDropdown)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.closeDropdown)
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
</style>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Base (mobile) ───────────────────────────────────────────── */
.app-layout {
  display: flex; min-height: 100vh;
  background: #f6f7fb; font-family: 'DM Sans', sans-serif; color: #1e293b;
}

.page {
  flex: 1; padding: 20px 16px 40px;
  display: flex; flex-direction: column; gap: 16px; overflow-x: hidden;
}

/* Topbar — stacked on mobile */
.topbar { display: flex; flex-direction: column; gap: 10px; }
.topbar-date  { font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
.topbar-title { font-size: 22px; font-weight: 600; letter-spacing: -.025em; color: #0f172a; }
.topbar-title .accent { color: #6366f1; }
.topbar-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.live-dot {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: #10b981; font-weight: 500;
}
.pulse {
  width: 8px; height: 8px; background: #10b981;
  border-radius: 50%; display: block; animation: pulse 1.8s ease infinite;
}
@keyframes pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,.5); }
  50%      { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
}

/* Tab group — full width on mobile */
.tab-group {
  display: flex; width: 100%;
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 10px; padding: 3px; gap: 2px;
}
.tab-btn {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 8px 10px; border-radius: 7px; border: none;
  background: transparent; font-family: 'DM Sans', sans-serif;
  font-size: 12px; font-weight: 500; cursor: pointer;
  color: #64748b; transition: all .15s;
}
.tab-btn:hover { background: #f8fafc; color: #334155; }
.tab-btn.active { background: #6366f1; color: #fff; }

.tab-badge {
  font-size: 10px; font-weight: 700;
  border-radius: 20px; padding: 1px 6px; line-height: 1.6;
}
.tab-badge--red    { background: #fef2f2; color: #dc2626; }
.tab-badge--indigo { background: #eef2ff; color: #4338ca; }
.tab-btn.active .tab-badge--red    { background: rgba(239,68,68,.25); color: #fca5a5; }
.tab-btn.active .tab-badge--indigo { background: rgba(255,255,255,.2); color: #fff; }

/* Summary — 2 cols on mobile */
.summary-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.summary-card {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 14px;
  padding: 14px 16px; display: flex; align-items: center; gap: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04); animation: fadeUp .35s ease both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.summary-icon {
  width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.summary-val   { font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -.03em; line-height: 1; margin-bottom: 3px; }
.summary-label { font-size: 11px; color: #94a3b8; }

/* Panel */
.panel {
  background: #fff; border: 1px solid #f1f5f9;
  border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.04); overflow: hidden;
}

/* Card header — stacked on mobile */
.card-header {
  display: flex; flex-direction: column; gap: 12px;
  padding: 16px 16px 12px; border-bottom: 1px solid #f8fafc;
}
.card-title { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 2px; }
.card-sub   { font-size: 12px; color: #94a3b8; }

.toolbar-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

/* Time filter */
.time-filter {
  display: flex; background: #f8fafc;
  border: 1px solid #f1f5f9; border-radius: 8px; padding: 3px; gap: 2px;
}
.time-btn {
  font-family: 'DM Sans', sans-serif; font-size: 11.5px; font-weight: 500;
  color: #64748b; background: transparent; border: none;
  padding: 4px 9px; border-radius: 5px; cursor: pointer; transition: all .15s;
}
.time-btn:hover { background: #fff; color: #334155; }
.time-btn.active { background: #fff; color: #0f172a; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,.07); }

/* Dropdown */
.dropdown { position: relative; }
.btn-filter {
  display: flex; align-items: center; gap: 7px;
  background: #f8fafc; border: 1px solid #f1f5f9;
  border-radius: 8px; padding: 7px 11px; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: 12.5px; color: #334151; transition: border-color .15s;
}
.btn-filter:hover { border-color: #e2e8f0; }
.filter-label { color: #94a3b8; font-size: 11.5px; }
.filter-value { font-weight: 500; color: #0f172a; }
.dropdown-menu {
  display: none; position: absolute; top: calc(100% + 4px); right: 0;
  background: #fff; min-width: 140px;
  box-shadow: 0 4px 16px rgba(0,0,0,.08); border: 1px solid #f0f0f0;
  border-radius: 10px; z-index: 100; padding: 4px;
}
.dropdown-menu.open { display: block; }
.dropdown-item { padding: 8px 12px; cursor: pointer; font-size: 13px; color: #374151; border-radius: 6px; transition: background .12s; }
.dropdown-item:hover { background: #f8fafc; }
.dropdown-item.active { background: #f1f5f9; font-weight: 500; color: #0f172a; }

/* Search — full width on mobile */
.search-box {
  display: flex; align-items: center; gap: 7px; flex: 1; min-width: 0;
  background: #f8fafc; border: 1px solid #f1f5f9;
  border-radius: 8px; padding: 7px 11px;
  color: #94a3b8; transition: border-color .18s, box-shadow .18s;
}
.search-box:focus-within { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); background: #fff; }
.search-box input {
  border: none; outline: none; font-family: 'DM Sans', sans-serif;
  font-size: 13px; color: #1e293b; width: 100%; background: transparent;
}
.search-box input::placeholder { color: #c4c9d4; }

/* Table */
.table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 640px; }
.data-table thead tr { border-bottom: 1px solid #f1f5f9; }
.data-table th {
  background: #fafafa; text-align: left;
  padding: 10px 14px; font-size: 10.5px; font-weight: 600;
  letter-spacing: .07em; text-transform: uppercase; color: #94a3b8; white-space: nowrap;
}
.data-table td { padding: 12px 14px; border-bottom: 1px solid #f8fafc; color: #334155; vertical-align: middle; }
.table-row:last-child td { border-bottom: none; }
.table-row:hover td { background: #fafbfc; }
.row-unread td:first-child { border-left: 3px solid #6366f1; }

.td-num { color: #cbd5e1; font-family: 'DM Mono', monospace; font-size: 12px; width: 36px; }
.td-muted { color: #94a3b8; font-size: 12.5px; white-space: nowrap; }
.td-product { font-weight: 500; color: #1e293b; white-space: nowrap; }
.td-msg { max-width: 220px; font-size: 12px; color: #64748b; line-height: 1.55; }

.cell-item { display: flex; align-items: center; gap: 9px; }
.item-icon {
  width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.item-name { font-weight: 500; color: #1e293b; }

.stock-val { display: inline-flex; align-items: center; gap: 6px; font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500; }
.stock-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.stock-low { color: #dc2626; } .stock-low .stock-dot { background: #ef4444; }
.stock-ok  { color: #15803d; } .stock-ok  .stock-dot { background: #22c55e; }

.rule-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 7px;
  font-size: 12px; font-weight: 600; white-space: nowrap; border: 1px solid transparent;
}
.rule-sym { font-family: 'DM Mono', monospace; font-size: 12px; line-height: 1; }
.rule-chip--inv002 { background: #fffbeb; color: #92400e; border-color: #fde68a; }
.rule-chip--inv003 { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
.rule-chip--inv004 { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
.rule-chip--inv005 { background: #fff7ed; color: #c2410c; border-color: #fed7aa; }
.rule-chip--inv006 { background: #f5f3ff; color: #5b21b6; border-color: #ddd6fe; }

.badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px; border-radius: 6px;
  font-size: 11.5px; font-weight: 500; text-transform: capitalize; white-space: nowrap;
}
.badge-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.badge-green { background: #f0fdf4; color: #15803d; } .badge-green .badge-dot { background: #22c55e; }
.badge-red   { background: #fef2f2; color: #dc2626; } .badge-red   .badge-dot { background: #ef4444; }
.badge-amber { background: #fffbeb; color: #b45309; } .badge-amber .badge-dot { background: #f59e0b; }
.badge-blue  { background: #eff6ff; color: #1d4ed8; } .badge-blue  .badge-dot { background: #3b82f6; }

.btn-reset {
  background: #fef2f2; border: 1px solid #fecaca;
  color: #dc2626; padding: 5px 11px; border-radius: 7px;
  font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
  cursor: pointer; transition: all .15s; white-space: nowrap;
}
.btn-reset:hover { background: #dc2626; border-color: #dc2626; color: #fff; }

.btn-action {
  background: transparent; border: 1px solid #e2e8f0;
  color: #475569; padding: 5px 11px; border-radius: 7px;
  font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
  cursor: pointer; transition: all .15s; white-space: nowrap;
}
.btn-action:hover { background: #6366f1; border-color: #6366f1; color: #fff; }

.done-check {
  display: inline-flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; border-radius: 50%; background: #f0fdf4; color: #16a34a;
}

.table-footer { padding: 12px 16px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f8fafc; }
.table-footer strong { color: #475569; }
.empty-state { text-align: center; padding: 48px; color: #cbd5e1; font-size: 13px; }

/* Toast — full width on mobile */
.toast {
  position: fixed; bottom: 16px; left: 16px; right: 16px;
  display: flex; align-items: center; gap: 10px;
  background: #1e293b; color: #fff;
  padding: 13px 16px; border-radius: 12px;
  font-size: 13px; font-weight: 500;
  box-shadow: 0 8px 24px rgba(0,0,0,.18); z-index: 999;
}
.toast-enter-active, .toast-leave-active { transition: all .25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }

/* ── Analytics ────────────────────────────────────────────── */
.an-body { padding: 16px; display: flex; flex-direction: column; gap: 28px; }

.an-section { display: flex; flex-direction: column; gap: 14px; }
.an-section-head { display: flex; align-items: center; gap: 8px; }
.an-section-pip { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.an-section-title { font-size: 11.5px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .09em; }

/* Stat strip */
.an-stat-strip {
  display: flex; align-items: center; gap: 0;
  background: #fff; border: 1px solid #f1f5f9; border-radius: 14px;
  padding: 16px 20px; flex-wrap: wrap; gap: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}
.an-stat { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 80px; }
.an-stat-val { font-size: 26px; font-weight: 700; letter-spacing: -.04em; line-height: 1; }
.an-stat-val--sm { font-size: 16px; }
.an-stat-lbl { font-size: 11px; color: #94a3b8; }
.an-stat-sep { width: 1px; height: 36px; background: #f1f5f9; flex-shrink: 0; }

/* Cards */
.an-row { display: grid; gap: 12px; grid-template-columns: 1fr; }
.an-card {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 14px;
  padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,.04);
}
.an-card--wide { }
.an-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.an-card-title { font-size: 13.5px; font-weight: 600; color: #0f172a; }
.an-card-sub   { font-size: 12px; color: #94a3b8; margin-top: 3px; line-height: 1.5; }

/* Legend */
.an-legend { display: flex; flex-wrap: wrap; gap: 8px 12px; }
.an-leg-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #64748b; white-space: nowrap; }
.an-leg-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }

/* Chart wrap */
.an-chart-wrap { position: relative; }

/* Donut with center text */
.an-donut-wrap { position: relative; height: 230px; }
.an-donut-center {
  position: absolute; top: 42%; left: 50%;
  transform: translate(-50%, -50%);
  text-align: center; pointer-events: none;
}
.an-donut-num { display: block; font-size: 28px; font-weight: 700; color: #0f172a; letter-spacing: -.04em; line-height: 1; }
.an-donut-lbl { display: block; font-size: 11px; color: #94a3b8; margin-top: 2px; }

/* Empty states */
.an-empty {
  height: 100%; min-height: 120px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 10px;
  font-size: 13px; color: #cbd5e1; text-align: center; line-height: 1.5;
}
.an-no-data {
  display: flex; align-items: center; gap: 12px;
  background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px;
  padding: 20px; font-size: 13px; color: #94a3b8;
}

/* ── Restock Spotlight ───────────────────────────────────── */
.rs-card { display: flex; flex-direction: column; gap: 14px; }
.rs-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.rs-urgent-badge {
  flex-shrink: 0; background: #fef2f2; color: #dc2626;
  font-size: 11px; font-weight: 700; padding: 3px 8px;
  border-radius: 20px; border: 1px solid #fecaca;
}

.rs-list { display: flex; flex-direction: column; gap: 10px; }
.rs-item {
  border-radius: 10px; padding: 12px 14px;
  border: 1px solid transparent;
  display: flex; flex-direction: column; gap: 8px;
}
.rs--out      { background: #fff5f5; border-color: #fecaca; }
.rs--critical { background: #fff8f4; border-color: #fed7aa; }
.rs--high     { background: #fffdf0; border-color: #fde68a; }

.rs-top { display: flex; align-items: center; gap: 8px; }
.rs-status-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.dot--out      { background: #ef4444; animation: pulse 1.4s ease infinite; }
.dot--critical { background: #f97316; }
.dot--high     { background: #f59e0b; }

.rs-name { font-size: 13px; font-weight: 600; color: #1e293b; flex: 1; min-width: 0; }
.rs-label {
  font-size: 10px; font-weight: 800; padding: 2px 7px;
  border-radius: 4px; letter-spacing: .06em; flex-shrink: 0;
}
.rl--out      { background: #fef2f2; color: #dc2626; }
.rl--critical { background: #fff7ed; color: #c2410c; }
.rl--high     { background: #fffbeb; color: #b45309; }

.rs-bar-track {
  height: 6px; background: #f1f5f9; border-radius: 99px; overflow: hidden;
}
.rs-bar-fill { height: 100%; border-radius: 99px; transition: width .5s ease; min-width: 2px; }

.rs-foot { display: flex; align-items: center; justify-content: space-between; }
.rs-units { font-size: 11.5px; color: #64748b; font-family: 'DM Mono', monospace; }
.rs-view-btn {
  font-family: 'DM Sans', sans-serif; font-size: 11.5px; font-weight: 600;
  color: #6366f1; background: none; border: none; cursor: pointer;
  padding: 2px 4px; border-radius: 4px; transition: background .15s;
}
.rs-view-btn:hover { background: #eef2ff; }

/* ── Critical Unread Callout ─────────────────────────────── */
.cc-callout {
  background: linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%);
  border: 1.5px solid #fca5a5; border-radius: 14px;
  overflow: hidden;
}
.cc-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: rgba(239,68,68,.06);
  border-bottom: 1px solid #fecaca;
}
.cc-head-left { display: flex; align-items: center; gap: 10px; }
.cc-pulse {
  width: 10px; height: 10px; border-radius: 50%; background: #ef4444;
  flex-shrink: 0; animation: pulse 1.4s ease infinite;
}
.cc-head-title { font-size: 13px; font-weight: 700; color: #991b1b; }
.cc-head-sub   { font-size: 11px; color: #f87171; }

.cc-list { display: flex; flex-direction: column; }
.cc-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px 16px; border-bottom: 1px solid rgba(252,165,165,.3);
}
.cc-item:last-child { border-bottom: none; }
.cc-item-left { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.cc-rule-chip {
  display: inline-flex; width: fit-content;
  font-size: 10.5px; font-weight: 700; color: #dc2626;
  background: #fef2f2; border: 1px solid #fecaca;
  padding: 2px 8px; border-radius: 4px; font-family: 'DM Mono', monospace;
}
.cc-product { font-size: 12.5px; font-weight: 600; color: #1e293b; }
.cc-message { font-size: 12px; color: #64748b; line-height: 1.5; }
.cc-mark-btn {
  flex-shrink: 0; display: inline-flex; align-items: center; gap: 5px;
  font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
  color: #15803d; background: #f0fdf4; border: 1px solid #bbf7d0;
  padding: 5px 10px; border-radius: 7px; cursor: pointer;
  transition: all .15s; white-space: nowrap;
}
.cc-mark-btn:hover { background: #22c55e; border-color: #22c55e; color: #fff; }

/* Rule cards */
.an-rule-grid { display: flex; flex-direction: column; gap: 8px; }
.an-rule-card {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 12px;
  padding: 14px 16px; box-shadow: 0 1px 2px rgba(0,0,0,.04);
  border-left: 3px solid var(--rc);
}
.arc-top { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.arc-icon {
  width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
  background: color-mix(in srgb, var(--rc) 12%, #fff);
  color: var(--rc); font-size: 16px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.arc-info { flex: 1; min-width: 0; }
.arc-label { font-size: 13px; font-weight: 600; color: #0f172a; }
.arc-id { font-size: 11px; color: #94a3b8; font-family: 'DM Mono', monospace; margin-top: 1px; }
.arc-count { text-align: right; flex-shrink: 0; }
.arc-num { display: block; font-size: 22px; font-weight: 700; color: var(--rc); letter-spacing: -.04em; line-height: 1; }
.arc-unit { font-size: 11px; color: #94a3b8; }
.arc-track { height: 5px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
.arc-fill { height: 100%; background: var(--rc); border-radius: 99px; transition: width .6s ease; }

/* Category ranking */
.cat-rank-list { display: flex; flex-direction: column; gap: 12px; margin-top: 14px; }
.cat-rank-row { display: flex; align-items: center; gap: 10px; }
.cat-pos {
  width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
  background: #f1f5f9; color: #64748b;
}
.cat-pos--1 { background: #fef9c3; color: #a16207; }
.cat-pos--2 { background: #f1f5f9; color: #475569; }
.cat-pos--3 { background: #fff7ed; color: #c2410c; }
.cat-rank-body { flex: 1; min-width: 0; }
.cat-rank-meta { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; }
.cat-rank-name  { font-size: 12.5px; font-weight: 500; color: #1e293b; }
.cat-rank-count { font-size: 11px; color: #94a3b8; }
.cat-track { height: 6px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
.cat-fill  { height: 100%; border-radius: 99px; transition: width .6s ease; }

/* ── Tablet (≥ 600px) ─────────────────────────────────────── */
@media (min-width: 600px) {
  .page { padding: 24px 24px 44px; gap: 18px; }
  .topbar { flex-direction: row; align-items: flex-end; justify-content: space-between; }
  .topbar-title { font-size: 24px; }
  .tab-group { width: auto; }
  .tab-btn { flex: none; font-size: 13px; padding: 7px 14px; }
  .summary-row { gap: 12px; }
  .summary-card { padding: 16px 18px; gap: 14px; }
  .summary-icon { width: 42px; height: 42px; border-radius: 11px; }
  .summary-val { font-size: 24px; }
  .summary-label { font-size: 12px; }
  .card-header { flex-direction: row; align-items: center; justify-content: space-between; padding: 18px 20px 14px; }
  .search-box { flex: none; }
  .search-box input { width: 160px; }
  .table-footer { padding: 12px 20px; }
  .toast { left: auto; right: 20px; width: auto; }
  .an-body { padding: 20px; gap: 32px; }
  .an-row--2 { grid-template-columns: 2fr 1fr; }
  .an-rule-grid { display: grid; grid-template-columns: repeat(2, 1fr); }
}

/* ── Desktop (≥ 900px) ────────────────────────────────────── */
@media (min-width: 900px) {
  .page { padding: 32px 36px 48px; gap: 20px; }
  .topbar-title { font-size: 26px; }
  .summary-row { grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .summary-card { padding: 18px 20px; }
  .summary-val { font-size: 26px; }
  .card-header { padding: 20px 22px 16px; }
  .search-box input { width: 180px; }
  .td-msg { max-width: 260px; }
  .table-footer { padding: 12px 22px; }
  .toast { bottom: 28px; right: 28px; }
  .an-body { padding: 28px; }
  .an-rule-grid { grid-template-columns: repeat(3, 1fr); }
}
</style>
