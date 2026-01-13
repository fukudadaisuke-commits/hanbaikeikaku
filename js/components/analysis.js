/* ============================================
   差異分析画面
   
   【画面説明】
   計画と実績の差異を分析する画面。
   月別・カテゴリ別・店舗別の比較表示、
   前年差・計画比の色分け、ドリルダウン分析が可能。
   経営層やMD担当者向けの分析ダッシュボード。
   ============================================ */

const Analysis = {
    viewMode: 'monthly',

    render: function () {
        const data = AppData.planVsActual;
        const categories = AppData.categoryPerformance;

        return `
            <div class="analysis-page">
                <!-- フィルターバー -->
                <div class="filter-bar">
                    <div class="filter-group">
                        <span class="filter-label">分析期間:</span>
                        <select class="form-select">
                            <option value="2026-01">2026年1月</option>
                            <option value="2025-12">2025年12月</option>
                            <option value="2025-q4">2025年 Q4</option>
                            <option value="2025">2025年度</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <span class="filter-label">比較対象:</span>
                        <select class="form-select">
                            <option value="plan">計画比</option>
                            <option value="lastYear">前年比</option>
                        </select>
                    </div>
                    <div class="tabs" style="border: none; margin: 0;">
                        <button class="tab-item ${this.viewMode === 'monthly' ? 'active' : ''}" 
                                onclick="Analysis.setViewMode('monthly')">月別</button>
                        <button class="tab-item ${this.viewMode === 'category' ? 'active' : ''}" 
                                onclick="Analysis.setViewMode('category')">カテゴリ別</button>
                        <button class="tab-item ${this.viewMode === 'store' ? 'active' : ''}" 
                                onclick="Analysis.setViewMode('store')">店舗別</button>
                    </div>
                </div>
                
                <!-- サマリーKPI -->
                <div class="kpi-grid mb-lg">
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <span class="kpi-label">計画</span>
                        </div>
                        <div class="kpi-value">12.5億円</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <span class="kpi-label">実績</span>
                        </div>
                        <div class="kpi-value">11.8億円</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <span class="kpi-label">差異</span>
                        </div>
                        <div class="kpi-value diff-negative">-0.7億円</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <span class="kpi-label">達成率</span>
                        </div>
                        <div class="kpi-value text-warning">94.4%</div>
                    </div>
                </div>
                
                <div class="analysis-grid">
                    <!-- 差異分析チャート -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">計画 vs 実績 推移</h3>
                        </div>
                        <div class="card-body">
                            ${this.renderComparisonChart(data)}
                        </div>
                    </div>
                    
                    <!-- 差異テーブル -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">詳細差異一覧</h3>
                            <button class="btn btn-secondary btn-sm" onclick="Analysis.exportData()">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                                エクスポート
                            </button>
                        </div>
                        <div class="card-body" style="padding: 0;">
                            ${this.renderDifferenceTable()}
                        </div>
                    </div>
                </div>
                
                <!-- カテゴリ別ヒートマップ -->
                <div class="card mt-lg">
                    <div class="card-header">
                        <h3 class="card-title">カテゴリ別 達成状況ヒートマップ</h3>
                    </div>
                    <div class="card-body">
                        ${this.renderHeatmap(categories)}
                    </div>
                </div>
            </div>
            
            <style>
                .analysis-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--spacing-lg);
                }
                
                @media (max-width: 1200px) {
                    .analysis-grid {
                        grid-template-columns: 1fr;
                    }
                }
                
                .comparison-chart {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-around;
                    height: 220px;
                    padding: var(--spacing-md);
                    border-bottom: 2px solid var(--color-border);
                }
                
                .chart-bar-group {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }
                
                .chart-bars {
                    display: flex;
                    align-items: flex-end;
                    gap: 4px;
                    height: 180px;
                }
                
                .chart-bar {
                    width: 28px;
                    border-radius: 4px 4px 0 0;
                    position: relative;
                }
                
                .chart-bar.plan {
                    background: linear-gradient(to top, #93C5FD, #3B82F6);
                }
                
                .chart-bar.actual {
                    background: linear-gradient(to top, #86EFAC, #22C55E);
                }
                
                .chart-bar.negative {
                    background: linear-gradient(to top, #FCA5A5, #EF4444);
                }
                
                .chart-label {
                    font-size: 12px;
                    color: var(--color-text-muted);
                }
                
                .diff-indicator {
                    position: absolute;
                    top: -24px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 10px;
                    font-weight: 600;
                    white-space: nowrap;
                    padding: 2px 4px;
                    border-radius: 4px;
                }
                
                .diff-indicator.positive {
                    background: var(--color-success-light);
                    color: var(--color-success-dark);
                }
                
                .diff-indicator.negative {
                    background: var(--color-danger-light);
                    color: var(--color-danger-dark);
                }
                
                .heatmap-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: var(--spacing-md);
                }
                
                .heatmap-cell {
                    padding: var(--spacing-md);
                    border-radius: var(--radius-md);
                    text-align: center;
                }
                
                .heatmap-cell.excellent {
                    background: linear-gradient(135deg, #86EFAC, #22C55E);
                    color: white;
                }
                
                .heatmap-cell.good {
                    background: linear-gradient(135deg, #BEF264, #84CC16);
                    color: white;
                }
                
                .heatmap-cell.warning {
                    background: linear-gradient(135deg, #FDE047, #F59E0B);
                    color: #78350F;
                }
                
                .heatmap-cell.danger {
                    background: linear-gradient(135deg, #FCA5A5, #EF4444);
                    color: white;
                }
                
                .heatmap-category {
                    font-weight: 600;
                    font-size: 14px;
                    margin-bottom: 4px;
                }
                
                .heatmap-value {
                    font-size: 24px;
                    font-weight: 700;
                }
                
                .heatmap-diff {
                    font-size: 12px;
                    opacity: 0.9;
                }
                
                .legend {
                    display: flex;
                    justify-content: center;
                    gap: var(--spacing-lg);
                    margin-top: var(--spacing-lg);
                    padding-top: var(--spacing-md);
                    border-top: 1px solid var(--color-border-light);
                }
                
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: var(--color-text-muted);
                }
                
                .legend-color {
                    width: 16px;
                    height: 16px;
                    border-radius: 4px;
                }
            </style>
        `;
    },

    renderComparisonChart: function (data) {
        const maxValue = 1600; // 百万円単位

        return `
            <div class="comparison-chart">
                ${data.map(d => {
            const planHeight = (d.plan.sales / 10000000 / maxValue) * 100;
            const actualHeight = (d.actual.sales / 10000000 / maxValue) * 100;
            const diff = ((d.actual.sales - d.plan.sales) / d.plan.sales * 100).toFixed(1);
            const isNegative = parseFloat(diff) < 0;

            return `
                        <div class="chart-bar-group">
                            <div class="chart-bars">
                                <div class="chart-bar plan" style="height: ${planHeight}%"></div>
                                <div class="chart-bar ${isNegative ? 'negative' : 'actual'}" style="height: ${actualHeight}%">
                                    <span class="diff-indicator ${isNegative ? 'negative' : 'positive'}">
                                        ${isNegative ? '' : '+'}${diff}%
                                    </span>
                                </div>
                            </div>
                            <span class="chart-label">${d.month.replace('年', '/').replace('月', '')}</span>
                        </div>
                    `;
        }).join('')}
            </div>
            <div class="legend">
                <div class="legend-item">
                    <div class="legend-color" style="background: linear-gradient(to right, #93C5FD, #3B82F6);"></div>
                    <span>計画</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: linear-gradient(to right, #86EFAC, #22C55E);"></div>
                    <span>実績（達成）</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: linear-gradient(to right, #FCA5A5, #EF4444);"></div>
                    <span>実績（未達）</span>
                </div>
            </div>
        `;
    },

    renderDifferenceTable: function () {
        const data = AppData.planVsActual;

        return `
            <div class="table-container" style="border: none;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>期間</th>
                            <th class="numeric">計画</th>
                            <th class="numeric">実績</th>
                            <th class="numeric">差異</th>
                            <th class="numeric">達成率</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(d => {
            const diff = d.actual.sales - d.plan.sales;
            const rate = (d.actual.sales / d.plan.sales * 100).toFixed(1);
            const diffClass = diff >= 0 ? 'diff-positive' : 'diff-negative';
            const rateClass = parseFloat(rate) >= 100 ? 'text-success' : parseFloat(rate) >= 95 ? 'text-warning' : 'text-danger';

            return `
                                <tr onclick="Analysis.drillDown('${d.month}')" style="cursor: pointer;">
                                    <td>${d.month}</td>
                                    <td class="numeric">${Helpers.formatCurrency(d.plan.sales)}</td>
                                    <td class="numeric">${Helpers.formatCurrency(d.actual.sales)}</td>
                                    <td class="numeric ${diffClass}">
                                        ${diff >= 0 ? '+' : ''}${Helpers.formatCurrency(diff)}
                                    </td>
                                    <td class="numeric ${rateClass}">${rate}%</td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderHeatmap: function (categories) {
        const cells = [];

        categories.forEach(cat => {
            cat.subCategories.forEach(sub => {
                const rate = (sub.actual / sub.plan * 100);
                let cellClass = 'danger';
                if (rate >= 100) cellClass = 'excellent';
                else if (rate >= 98) cellClass = 'good';
                else if (rate >= 95) cellClass = 'warning';

                cells.push({
                    name: sub.name,
                    rate: rate.toFixed(1),
                    diff: ((sub.actual - sub.plan) / sub.plan * 100).toFixed(1),
                    class: cellClass
                });
            });
        });

        return `
            <div class="heatmap-grid">
                ${cells.map(cell => `
                    <div class="heatmap-cell ${cell.class}" onclick="Analysis.showCategoryDetail('${cell.name}')">
                        <div class="heatmap-category">${cell.name}</div>
                        <div class="heatmap-value">${cell.rate}%</div>
                        <div class="heatmap-diff">${parseFloat(cell.diff) >= 0 ? '+' : ''}${cell.diff}%</div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    setViewMode: function (mode) {
        this.viewMode = mode;
        this.refresh();
    },

    drillDown: function (period) {
        App.showModal(`${period} 詳細分析`, `
            <div class="kpi-grid" style="margin-bottom: 16px;">
                <div style="text-align: center;">
                    <div style="font-size: 12px; color: var(--color-text-muted);">売上</div>
                    <div style="font-size: 18px; font-weight: 600;">11.8億円</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 12px; color: var(--color-text-muted);">数量</div>
                    <div style="font-size: 18px; font-weight: 600;">265万点</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 12px; color: var(--color-text-muted);">粗利</div>
                    <div style="font-size: 18px; font-weight: 600;">2.95億円</div>
                </div>
            </div>
            <h4 style="margin-bottom: 8px;">カテゴリ別内訳</h4>
            <table class="data-table" style="font-size: 12px;">
                <tr><td>食品</td><td class="numeric diff-positive">+3.2%</td></tr>
                <tr><td>日用品</td><td class="numeric diff-negative">-1.8%</td></tr>
                <tr><td>化粧品</td><td class="numeric diff-negative">-3.5%</td></tr>
            </table>
        `);
    },

    showCategoryDetail: function (name) {
        App.showToast(`${name}の詳細を表示`, 'info');
    },

    exportData: function () {
        App.showToast('差異分析データをエクスポートしました', 'success');
    },

    refresh: function () {
        const content = document.getElementById('pageContent');
        if (content) {
            content.innerHTML = this.render();
        }
    },

    init: function () {
    }
};

window.Analysis = Analysis;
