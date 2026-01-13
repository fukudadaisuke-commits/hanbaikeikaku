/* ============================================
   販売計画一覧画面
   
   【画面説明】
   作成済みの販売計画をリスト表示。
   年次・月次・週次のフィルタリング、ステータス別表示、
   検索・ソート機能を提供。新規作成・コピー・削除操作が可能。
   ============================================ */

const PlanList = {
    filters: {
        type: 'all',
        status: 'all',
        search: ''
    },

    render: function () {
        const plans = this.getFilteredPlans();

        return `
            <div class="plan-list-page">
                <!-- アクションバー -->
                <div class="action-bar mb-lg">
                    <div class="flex gap-md">
                        <button class="btn btn-primary" onclick="PlanList.openNewPlanModal()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            新規計画作成
                        </button>
                        <button class="btn btn-secondary" onclick="PlanList.showTemplateSelector()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <path d="M3 9h18M9 21V9"/>
                            </svg>
                            テンプレートから作成
                        </button>
                    </div>
                    <div class="flex gap-sm">
                        <button class="btn btn-secondary" onclick="PlanList.exportPlans()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            エクスポート
                        </button>
                    </div>
                </div>
                
                <!-- フィルターバー -->
                <div class="filter-bar">
                    <div class="search-input">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input type="text" placeholder="計画名で検索..." id="planSearchInput" 
                               value="${this.filters.search}" onkeyup="PlanList.onSearch(this.value)">
                    </div>
                    
                    <div class="filter-group">
                        <span class="filter-label">期間タイプ:</span>
                        <select class="form-select" id="typeFilter" onchange="PlanList.onFilterChange('type', this.value)">
                            <option value="all" ${this.filters.type === 'all' ? 'selected' : ''}>すべて</option>
                            <option value="yearly" ${this.filters.type === 'yearly' ? 'selected' : ''}>年次</option>
                            <option value="monthly" ${this.filters.type === 'monthly' ? 'selected' : ''}>月次</option>
                            <option value="weekly" ${this.filters.type === 'weekly' ? 'selected' : ''}>週次</option>
                            <option value="seasonal" ${this.filters.type === 'seasonal' ? 'selected' : ''}>季節</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <span class="filter-label">ステータス:</span>
                        <select class="form-select" id="statusFilter" onchange="PlanList.onFilterChange('status', this.value)">
                            <option value="all" ${this.filters.status === 'all' ? 'selected' : ''}>すべて</option>
                            <option value="draft" ${this.filters.status === 'draft' ? 'selected' : ''}>下書き</option>
                            <option value="pending" ${this.filters.status === 'pending' ? 'selected' : ''}>申請中</option>
                            <option value="approved" ${this.filters.status === 'approved' ? 'selected' : ''}>承認済</option>
                            <option value="rejected" ${this.filters.status === 'rejected' ? 'selected' : ''}>差戻し</option>
                        </select>
                    </div>
                </div>
                
                <!-- 計画一覧テーブル -->
                <div class="card">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th style="width: 40px;">
                                        <input type="checkbox" id="selectAll" onchange="PlanList.toggleSelectAll(this.checked)">
                                    </th>
                                    <th class="sortable" onclick="PlanList.sort('id')">計画ID</th>
                                    <th class="sortable" onclick="PlanList.sort('name')">計画名</th>
                                    <th class="sortable" onclick="PlanList.sort('type')">タイプ</th>
                                    <th>期間</th>
                                    <th class="sortable" onclick="PlanList.sort('status')">ステータス</th>
                                    <th>バージョン</th>
                                    <th class="numeric">売上目標</th>
                                    <th class="sortable" onclick="PlanList.sort('lastUpdated')">最終更新</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${plans.length > 0 ? plans.map(plan => this.renderPlanRow(plan)).join('') : `
                                    <tr>
                                        <td colspan="10" class="text-center text-muted" style="padding: 40px;">
                                            該当する計画がありません
                                        </td>
                                    </tr>
                                `}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- ページネーション -->
                <div class="pagination mt-lg">
                    <span class="text-muted">全 ${plans.length} 件</span>
                </div>
            </div>
            
            <style>
                .action-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: var(--spacing-md);
                }
                
                .type-badge {
                    padding: 2px 8px;
                    border-radius: var(--radius-sm);
                    font-size: var(--font-size-xs);
                    font-weight: 500;
                }
                
                .type-yearly { background: #E0E7FF; color: #3730A3; }
                .type-monthly { background: #DBEAFE; color: #1E40AF; }
                .type-weekly { background: #CCFBF1; color: #115E59; }
                .type-seasonal { background: #FEF3C7; color: #92400E; }
                
                .row-actions {
                    display: flex;
                    gap: var(--spacing-xs);
                }
                
                .pagination {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
            </style>
        `;
    },

    getFilteredPlans: function () {
        let plans = [...AppData.plans];

        if (this.filters.type !== 'all') {
            plans = plans.filter(p => p.type === this.filters.type);
        }

        if (this.filters.status !== 'all') {
            plans = plans.filter(p => p.status === this.filters.status);
        }

        if (this.filters.search) {
            const search = this.filters.search.toLowerCase();
            plans = plans.filter(p =>
                p.name.toLowerCase().includes(search) ||
                p.id.toLowerCase().includes(search)
            );
        }

        return plans;
    },

    renderPlanRow: function (plan) {
        const statusInfo = AppData.planStatuses[plan.status];
        const typeLabels = {
            yearly: '年次',
            monthly: '月次',
            weekly: '週次',
            seasonal: '季節'
        };

        return `
            <tr data-plan-id="${plan.id}">
                <td>
                    <input type="checkbox" class="plan-checkbox" data-id="${plan.id}">
                </td>
                <td><code>${plan.id}</code></td>
                <td>
                    <a href="#plan-edit" onclick="PlanEdit.loadPlan('${plan.id}')" class="text-primary" style="text-decoration: none; font-weight: 500;">
                        ${plan.name}
                    </a>
                </td>
                <td>
                    <span class="type-badge type-${plan.type}">${typeLabels[plan.type]}</span>
                </td>
                <td>${plan.period}</td>
                <td>
                    <span class="badge ${statusInfo.class}">${statusInfo.label}</span>
                </td>
                <td>${plan.version}</td>
                <td class="numeric">${Helpers.formatCurrency(plan.salesTarget)}</td>
                <td>
                    <span class="text-muted">${plan.lastUpdated}</span><br>
                    <span style="font-size: 11px; color: var(--color-text-light);">${plan.updatedBy}</span>
                </td>
                <td>
                    <div class="row-actions">
                        <button class="btn btn-ghost btn-sm" onclick="PlanList.editPlan('${plan.id}')" title="編集">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <path d="M12 20h9"/>
                                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                            </svg>
                        </button>
                        <button class="btn btn-ghost btn-sm" onclick="PlanList.copyPlan('${plan.id}')" title="コピー">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <rect x="9" y="9" width="13" height="13" rx="2"/>
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                            </svg>
                        </button>
                        <div class="dropdown">
                            <button class="btn btn-ghost btn-sm dropdown-toggle" title="その他">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                    <circle cx="12" cy="12" r="1"/>
                                    <circle cx="19" cy="12" r="1"/>
                                    <circle cx="5" cy="12" r="1"/>
                                </svg>
                            </button>
                            <div class="dropdown-menu">
                                <div class="dropdown-item" onclick="PlanList.submitForApproval('${plan.id}')">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                        <path d="M22 2L11 13"/>
                                        <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                                    </svg>
                                    承認申請
                                </div>
                                <div class="dropdown-item" onclick="PlanList.viewHistory('${plan.id}')">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    履歴
                                </div>
                                <div class="dropdown-divider"></div>
                                <div class="dropdown-item text-danger" onclick="PlanList.deletePlan('${plan.id}')">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                        <path d="M3 6h18"/>
                                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/>
                                        <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                    </svg>
                                    削除
                                </div>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    },

    onSearch: function (value) {
        this.filters.search = value;
        this.refresh();
    },

    onFilterChange: function (filterType, value) {
        this.filters[filterType] = value;
        this.refresh();
    },

    refresh: function () {
        const content = document.getElementById('pageContent');
        if (content) {
            content.innerHTML = this.render();
        }
    },

    toggleSelectAll: function (checked) {
        document.querySelectorAll('.plan-checkbox').forEach(cb => {
            cb.checked = checked;
        });
    },

    openNewPlanModal: function () {
        Router.navigate('plan-edit');
    },

    editPlan: function (planId) {
        Router.navigate('plan-edit');
        // 実際の実装では計画データをロード
    },

    copyPlan: function (planId) {
        App.confirm('この計画をコピーしますか？', () => {
            App.showToast('計画をコピーしました', 'success');
        });
    },

    deletePlan: function (planId) {
        App.confirm('この計画を削除しますか？この操作は取り消せません。', () => {
            App.showToast('計画を削除しました', 'success');
        });
    },

    submitForApproval: function (planId) {
        App.confirm('この計画を承認申請しますか？', () => {
            App.showToast('承認申請を送信しました', 'success');
        });
    },

    viewHistory: function (planId) {
        App.showModal('バージョン履歴', `
            <table class="data-table" style="margin: -16px;">
                <thead>
                    <tr>
                        <th>バージョン</th>
                        <th>更新日時</th>
                        <th>更新者</th>
                        <th>コメント</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>v3.2</td><td>2026-01-05</td><td>田中 太郎</td><td>最終版</td></tr>
                    <tr><td>v3.1</td><td>2026-01-04</td><td>田中 太郎</td><td>Q2目標修正</td></tr>
                    <tr><td>v3.0</td><td>2026-01-03</td><td>佐藤 花子</td><td>全体見直し</td></tr>
                </tbody>
            </table>
        `);
    },

    showTemplateSelector: function () {
        const templates = AppData.templates;
        App.showModal('テンプレートを選択', `
            <div style="max-height: 300px; overflow-y: auto;">
                ${templates.map(t => `
                    <div style="padding: 12px; border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 8px; cursor: pointer;" 
                         onclick="PlanList.createFromTemplate('${t.id}')">
                        <div style="font-weight: 500;">${t.name}</div>
                        <div style="font-size: 12px; color: var(--color-text-muted);">${t.description}</div>
                    </div>
                `).join('')}
            </div>
        `);
    },

    createFromTemplate: function (templateId) {
        App.closeModal();
        Router.navigate('plan-edit');
        App.showToast('テンプレートを適用しました', 'success');
    },

    exportPlans: function () {
        App.showToast('エクスポートを開始しました', 'info');
    },

    sort: function (column) {
        App.showToast(`${column}でソートしました`, 'info');
    },

    init: function () {
    }
};

window.PlanList = PlanList;
