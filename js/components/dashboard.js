/* ============================================
   ダッシュボード画面
   
   【画面説明】
   トップ画面として、売上・粗利・数量のKPIサマリー、
   計画進捗状況、月次トレンド、承認待ち通知を表示。
   経営層・MD・企画担当が一目で状況を把握できる構成。
   ============================================ */

const Dashboard = {
    render: function () {
        const kpi = AppData.kpiSummary;
        const plans = AppData.plans;
        const pending = AppData.pendingApprovals;
        const trend = AppData.monthlyTrend;

        return `
            <div class="dashboard">
                <!-- KPIカード群 -->
                <section class="mb-lg">
                    <div class="kpi-grid">
                        ${this.renderKpiCard('sales', kpi.sales, 'primary')}
                        ${this.renderKpiCard('grossProfit', kpi.grossProfit, 'success')}
                        ${this.renderKpiCard('quantity', kpi.quantity, 'warning')}
                        ${this.renderKpiCard('progress', kpi.planProgress, 'info')}
                    </div>
                </section>
                
                <!-- メインコンテンツグリッド -->
                <div class="dashboard-grid">
                    <!-- 月次トレンドチャート -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">月次売上トレンド</h3>
                            <div class="flex gap-md">
                                <span class="badge badge-info">● 計画</span>
                                <span class="badge badge-approved">● 実績</span>
                            </div>
                        </div>
                        <div class="card-body">
                            ${this.renderTrendChart(trend)}
                        </div>
                    </div>
                    
                    <!-- 計画ステータスサマリー -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">計画ステータス</h3>
                            <a href="#plan-list" class="btn btn-ghost btn-sm">すべて見る →</a>
                        </div>
                        <div class="card-body">
                            ${this.renderPlanStatusSummary(plans)}
                        </div>
                    </div>
                    
                    <!-- 承認待ちリスト -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">承認待ち</h3>
                            <span class="badge badge-pending">${pending.length}件</span>
                        </div>
                        <div class="card-body">
                            ${this.renderPendingList(pending)}
                        </div>
                    </div>
                    
                    <!-- カテゴリ別達成状況 -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">カテゴリ別達成状況</h3>
                        </div>
                        <div class="card-body">
                            ${this.renderCategoryProgress()}
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--spacing-lg);
                }
                
                @media (max-width: 1200px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr;
                    }
                }
                
                .trend-chart {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    height: 200px;
                    padding: var(--spacing-md) 0;
                    border-bottom: 1px solid var(--color-border-light);
                }
                
                .trend-bar-group {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex: 1;
                    gap: var(--spacing-xs);
                }
                
                .trend-bars {
                    display: flex;
                    align-items: flex-end;
                    gap: 4px;
                    height: 160px;
                }
                
                .trend-bar {
                    width: 16px;
                    border-radius: 4px 4px 0 0;
                    transition: all var(--transition);
                }
                
                .trend-bar.plan {
                    background: var(--color-primary-light);
                }
                
                .trend-bar.actual {
                    background: var(--color-success);
                }
                
                .trend-bar:hover {
                    opacity: 0.8;
                }
                
                .trend-label {
                    font-size: var(--font-size-xs);
                    color: var(--color-text-muted);
                }
                
                .status-summary {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--spacing-md);
                }
                
                .status-item {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                    padding: var(--spacing-md);
                    background: var(--color-bg);
                    border-radius: var(--radius-md);
                }
                
                .status-count {
                    font-size: var(--font-size-2xl);
                    font-weight: 700;
                }
                
                .pending-item {
                    padding: var(--spacing-md);
                    border-bottom: 1px solid var(--color-border-light);
                }
                
                .pending-item:last-child {
                    border-bottom: none;
                }
                
                .pending-item-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: var(--spacing-xs);
                }
                
                .pending-item-name {
                    font-weight: 500;
                }
                
                .pending-item-meta {
                    font-size: var(--font-size-xs);
                    color: var(--color-text-muted);
                }
                
                .category-progress-item {
                    margin-bottom: var(--spacing-md);
                }
                
                .category-progress-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: var(--spacing-xs);
                }
                
                .category-name {
                    font-weight: 500;
                }
                
                .category-value {
                    font-size: var(--font-size-sm);
                    color: var(--color-text-secondary);
                }
            </style>
        `;
    },

    renderKpiCard: function (key, data, colorClass) {
        let value, change, changeClass, icon;

        if (key === 'progress') {
            value = data.current + '%';
            change = null;
            icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>`;
        } else {
            const diff = Helpers.calcPercentChange(data.current, data.lastYear);
            value = Helpers.formatCurrency(data.current);
            change = diff > 0 ? `+${diff}%` : `${diff}%`;
            changeClass = diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral';

            if (key === 'sales') {
                icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>`;
            } else if (key === 'grossProfit') {
                icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>`;
            } else {
                icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                </svg>`;
            }
        }

        const iconClass = colorClass === 'info' ? 'primary' : colorClass;

        return `
            <div class="kpi-card">
                <div class="kpi-header">
                    <span class="kpi-label">${data.label}</span>
                    <div class="kpi-icon ${iconClass}">${icon}</div>
                </div>
                <div class="kpi-value">${value}</div>
                ${change ? `
                    <div class="kpi-change ${changeClass}">
                        ${changeClass === 'positive' ? '▲' : changeClass === 'negative' ? '▼' : ''}
                        ${change} 前年比
                    </div>
                ` : `
                    <div class="progress-bar" style="margin-top: var(--spacing-sm);">
                        <div class="fill" style="width: ${data.current}%"></div>
                    </div>
                `}
            </div>
        `;
    },

    renderTrendChart: function (trend) {
        const maxValue = Math.max(...trend.map(t => Math.max(t.plan, t.actual)));

        return `
            <div class="trend-chart">
                ${trend.map(t => `
                    <div class="trend-bar-group">
                        <div class="trend-bars">
                            <div class="trend-bar plan" style="height: ${(t.plan / maxValue) * 100}%" title="計画: ${t.plan}百万円"></div>
                            <div class="trend-bar actual" style="height: ${(t.actual / maxValue) * 100}%" title="実績: ${t.actual}百万円"></div>
                        </div>
                        <span class="trend-label">${t.month}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderPlanStatusSummary: function (plans) {
        const counts = {
            draft: plans.filter(p => p.status === 'draft').length,
            pending: plans.filter(p => p.status === 'pending').length,
            approved: plans.filter(p => p.status === 'approved').length,
            rejected: plans.filter(p => p.status === 'rejected').length
        };

        return `
            <div class="status-summary">
                <div class="status-item">
                    <span class="status-count text-muted">${counts.draft}</span>
                    <span class="badge badge-draft">下書き</span>
                </div>
                <div class="status-item">
                    <span class="status-count text-warning">${counts.pending}</span>
                    <span class="badge badge-pending">申請中</span>
                </div>
                <div class="status-item">
                    <span class="status-count text-success">${counts.approved}</span>
                    <span class="badge badge-approved">承認済</span>
                </div>
                <div class="status-item">
                    <span class="status-count text-danger">${counts.rejected}</span>
                    <span class="badge badge-rejected">差戻し</span>
                </div>
            </div>
        `;
    },

    renderPendingList: function (pending) {
        if (pending.length === 0) {
            return '<p class="text-muted">承認待ちの計画はありません</p>';
        }

        return pending.map(p => `
            <div class="pending-item">
                <div class="pending-item-header">
                    <span class="pending-item-name">${p.planName}</span>
                    <span class="badge badge-pending">申請中</span>
                </div>
                <div class="pending-item-meta">
                    申請者: ${p.requestedBy} ・ ${p.requestedAt}
                </div>
            </div>
        `).join('');
    },

    renderCategoryProgress: function () {
        const categories = AppData.categoryPerformance;

        return categories.map(cat => {
            const totalPlan = cat.subCategories.reduce((sum, s) => sum + s.plan, 0);
            const totalActual = cat.subCategories.reduce((sum, s) => sum + s.actual, 0);
            const progress = Math.round((totalActual / totalPlan) * 100);
            const progressClass = progress >= 100 ? 'success' : progress >= 90 ? 'warning' : 'danger';

            return `
                <div class="category-progress-item">
                    <div class="category-progress-header">
                        <span class="category-name">${cat.category}</span>
                        <span class="category-value ${progress >= 100 ? 'text-success' : ''}">${progress}%</span>
                    </div>
                    <div class="progress-bar ${progressClass}">
                        <div class="fill" style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    },

    init: function () {
        // ダッシュボード固有の初期化処理があればここに追加
    }
};

window.Dashboard = Dashboard;
