/* ============================================
   計画登録・編集画面
   
   【画面説明】
   販売計画の新規作成・編集を行う画面。
   基本情報入力、期間設定、数値入力（テーブル形式）、
   自動按分・積上げ計算、バージョン管理機能を提供。
   Excel風のテーブル操作でMD担当者が使いやすい設計。
   ============================================ */

const PlanEdit = {
    currentPlan: null,
    isNew: true,

    render: function () {
        const plan = this.currentPlan || {
            id: 'P2026-NEW',
            name: '',
            type: 'monthly',
            status: 'draft',
            version: 'v0.1'
        };

        return `
            <div class="plan-edit-page">
                <!-- ヘッダーアクション -->
                <div class="edit-header mb-lg">
                    <div class="flex items-center gap-md">
                        <button class="btn btn-ghost" onclick="history.back()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <line x1="19" y1="12" x2="5" y2="12"/>
                                <polyline points="12 19 5 12 12 5"/>
                            </svg>
                            戻る
                        </button>
                        <div>
                            <h2 style="font-size: 18px; font-weight: 600;">${this.isNew ? '新規計画作成' : plan.name}</h2>
                            <span class="text-muted" style="font-size: 12px;">${plan.id} | ${plan.version}</span>
                            <span class="badge ${plan.status === 'in_meeting' ? 'badge-warning' : (AppData.planStatuses[plan.status]?.class || '')}" style="margin-left: 8px;">
                                ${plan.status === 'in_meeting' ? '販売会議中' : (AppData.planStatuses[plan.status]?.label || plan.status)}
                            </span>
                        </div>
                    </div>
                    <div class="flex gap-sm">
                        ${this.renderActionButtons(plan.status)}
                    </div>
                </div>
                
                <!-- タブナビゲーション -->
                <div class="tabs">
                    <button class="tab-item active" data-tab="basic" onclick="PlanEdit.switchTab('basic')">基本情報</button>
                    <button class="tab-item" data-tab="plan-data" onclick="PlanEdit.switchTab('plan-data')">計画数値</button>
                    <button class="tab-item" data-tab="allocation" onclick="PlanEdit.switchTab('allocation')">按分設定</button>
                    <button class="tab-item" data-tab="history" onclick="PlanEdit.switchTab('history')">履歴</button>
                </div>
                
                <!-- 基本情報タブ -->
                <div class="tab-content active" id="tab-basic">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">基本情報</h3>
                        </div>
                        <div class="card-body">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label required">計画名</label>
                                    <input type="text" class="form-input" value="${plan.name}" placeholder="例: 2026年2月 月次販売計画">
                                </div>
                                <div class="form-group">
                                    <label class="form-label required">計画タイプ</label>
                                    <select class="form-select form-input">
                                        <option value="yearly" ${plan.type === 'yearly' ? 'selected' : ''}>年次計画</option>
                                        <option value="monthly" ${plan.type === 'monthly' ? 'selected' : ''}>月次計画</option>
                                        <option value="weekly" ${plan.type === 'weekly' ? 'selected' : ''}>週次計画</option>
                                        <option value="seasonal" ${plan.type === 'seasonal' ? 'selected' : ''}>季節計画</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label required">計画期間（開始）</label>
                                    <input type="date" class="form-input" value="2026-02-01">
                                </div>
                                <div class="form-group">
                                    <label class="form-label required">計画期間（終了）</label>
                                    <input type="date" class="form-input" value="2026-02-28">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">対象カテゴリ</label>
                                    <select class="form-select form-input">
                                        <option value="all">全カテゴリ</option>
                                        <option value="C01">食品</option>
                                        <option value="C02">日用品</option>
                                        <option value="C03">化粧品・ビューティー</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">対象エリア</label>
                                    <select class="form-select form-input">
                                        <option value="all">全エリア</option>
                                        <option value="A01">関東エリア</option>
                                        <option value="A02">関西エリア</option>
                                        <option value="A03">中部エリア</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">備考・コメント</label>
                                <textarea class="form-input" rows="3" placeholder="計画に関するメモや注意事項を入力"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 計画数値タブ -->
                <div class="tab-content" id="tab-plan-data">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">計画数値入力</h3>
                            <div class="flex gap-sm">
                                <button class="btn btn-secondary btn-sm" onclick="PlanEdit.copyFromPrevious()">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                    </svg>
                                    前月からコピー
                                </button>
                                <button class="btn btn-secondary btn-sm" onclick="PlanEdit.importExcel()">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                        <polyline points="7 10 12 15 17 10"/>
                                        <line x1="12" y1="15" x2="12" y2="3"/>
                                    </svg>
                                    Excelインポート
                                </button>
                            </div>
                        </div>
                        <div class="card-body" style="padding: 0;">
                            <div class="table-container">
                                <table class="data-table plan-data-table">
                                    <thead>
                                        <tr>
                                            <th style="width: 200px;">カテゴリ / 商品</th>
                                            <th class="numeric">前年実績</th>
                                            <th class="numeric">計画数量</th>
                                            <th class="numeric">計画売上</th>
                                            <th class="numeric">計画粗利</th>
                                            <th class="numeric">前年比</th>
                                            <th style="width: 60px;">戦略</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.renderPlanDataRows()}
                                    </tbody>
                                    <tfoot>
                                        <tr style="font-weight: 600; background: var(--color-bg-secondary);">
                                            <td>合計</td>
                                            <td class="numeric">1,180,000,000</td>
                                            <td class="numeric">2,800,000</td>
                                            <td class="numeric">1,250,000,000</td>
                                            <td class="numeric">312,500,000</td>
                                            <td class="numeric diff-positive">+5.9%</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 按分設定タブ -->
                <div class="tab-content" id="tab-allocation">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">自動按分設定</h3>
                        </div>
                        <div class="card-body">
                            <div class="allocation-options">
                                <div class="form-group">
                                    <label class="form-label">按分基準</label>
                                    <div class="flex gap-lg mt-sm">
                                        <label class="form-check">
                                            <input type="radio" name="allocationBase" value="lastYear" checked>
                                            <span>前年実績比率</span>
                                        </label>
                                        <label class="form-check">
                                            <input type="radio" name="allocationBase" value="avgSales">
                                            <span>平均売上比率</span>
                                        </label>
                                        <label class="form-check">
                                            <input type="radio" name="allocationBase" value="manual">
                                            <span>手動設定</span>
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="form-group mt-lg">
                                    <label class="form-label">按分対象</label>
                                    <div class="flex gap-lg mt-sm">
                                        <label class="form-check">
                                            <input type="checkbox" checked>
                                            <span>店舗別按分</span>
                                        </label>
                                        <label class="form-check">
                                            <input type="checkbox" checked>
                                            <span>週別按分</span>
                                        </label>
                                        <label class="form-check">
                                            <input type="checkbox">
                                            <span>商品別按分</span>
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="mt-lg">
                                    <button class="btn btn-primary" onclick="PlanEdit.executeAllocation()">
                                        按分を実行
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 履歴タブ -->
                <div class="tab-content" id="tab-history">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">バージョン履歴</h3>
                        </div>
                        <div class="card-body" style="padding: 0;">
                            <div class="table-container">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>バージョン</th>
                                            <th>更新日時</th>
                                            <th>更新者</th>
                                            <th>変更内容</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><span class="badge badge-info">現在</span> v0.1</td>
                                            <td>2026-01-08 11:30</td>
                                            <td>田中 太郎</td>
                                            <td>新規作成</td>
                                            <td>-</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .edit-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: var(--spacing-md);
                    border-bottom: 1px solid var(--color-border-light);
                }
                
                .plan-data-table tbody tr:hover {
                    background: var(--color-primary-light);
                }
                
                .plan-data-table .editable {
                    background: #FFFBEB;
                }
                
                .plan-data-table input {
                    width: 100%;
                    padding: 4px 8px;
                    border: 1px solid transparent;
                    background: transparent;
                    text-align: right;
                    font-family: inherit;
                    font-size: inherit;
                }
                
                .plan-data-table input:focus {
                    border-color: var(--color-primary);
                    background: white;
                    outline: none;
                }
                
                .strategic-checkbox {
                    width: 16px;
                    height: 16px;
                    accent-color: var(--color-warning);
                }
                
                .category-row {
                    background: var(--color-bg-secondary);
                    font-weight: 600;
                }
                
                .subcategory-row {
                    background: var(--color-bg);
                }
                
                .sku-row td:first-child {
                    padding-left: 32px;
                }
            </style>
        `;
    },

    renderActionButtons: function (status) {
        let buttons = `
            <button class="btn btn-secondary" onclick="PlanEdit.saveDraft()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                </svg>
                保存
            </button>
        `;

        if (status === 'draft' || status === 'rejected') {
            buttons += `
                <button class="btn btn-primary" onclick="PlanEdit.startMeeting()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 010 7.75"></path>
                    </svg>
                    販売会議へ
                </button>
            `;
        } else if (status === 'in_meeting') {
            buttons += `
                <button class="btn btn-success" onclick="PlanEdit.submitForApproval()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M22 2L11 13"/>
                        <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                    </svg>
                    会議終了・承認申請
                </button>
            `;
        } else {
            // pending or approved (read only actions mostly)
            // buttons only keep save for minor edits? or hidden.
        }
        return buttons;
    },

    renderPlanDataRows: function () {
        const categories = AppData.productHierarchy.children || [];
        let rows = '';

        categories.forEach(cat => {
            // カテゴリ行
            rows += `
                <tr class="category-row">
                    <td>
                        <span class="tree-toggle expanded" onclick="PlanEdit.toggleCategory('${cat.id}')">▶</span>
                        ${cat.name}
                    </td>
                    <td class="numeric">450,000,000</td>
                    <td class="numeric">1,200,000</td>
                    <td class="numeric">480,000,000</td>
                    <td class="numeric">120,000,000</td>
                    <td class="numeric diff-positive">+6.7%</td>
                    <td></td>
                </tr>
            `;

            cat.children.forEach(subcat => {
                // サブカテゴリ行
                rows += `
                    <tr class="subcategory-row" data-parent="${cat.id}">
                        <td style="padding-left: 24px;">
                            <span class="tree-toggle" onclick="PlanEdit.toggleSubcategory('${subcat.id}')">▶</span>
                            ${subcat.name}
                        </td>
                        <td class="numeric">150,000,000</td>
                        <td class="numeric editable"><input type="text" value="400,000"></td>
                        <td class="numeric editable"><input type="text" value="160,000,000"></td>
                        <td class="numeric editable"><input type="text" value="40,000,000"></td>
                        <td class="numeric diff-positive">+6.7%</td>
                        <td></td>
                    </tr>
                `;

                // SKU行（省略、展開時に表示）
                if (subcat.children) {
                    subcat.children.slice(0, 2).forEach(sku => {
                        rows += `
                            <tr class="sku-row" data-parent="${subcat.id}" style="display: none;">
                                <td style="padding-left: 48px;">
                                    ${sku.name}
                                    ${sku.isStrategic ? '<span class="badge badge-pending" style="margin-left: 4px;">戦略</span>' : ''}
                                </td>
                                <td class="numeric">25,000,000</td>
                                <td class="numeric editable"><input type="text" value="65,000"></td>
                                <td class="numeric editable"><input type="text" value="27,000,000"></td>
                                <td class="numeric editable"><input type="text" value="6,750,000"></td>
                                <td class="numeric diff-positive">+8.0%</td>
                                <td class="text-center">
                                    <input type="checkbox" class="strategic-checkbox" ${sku.isStrategic ? 'checked' : ''}>
                                </td>
                            </tr>
                        `;
                    });
                }
            });
        });

        return rows;
    },

    switchTab: function (tabId) {
        // タブボタンの更新
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });

        // タブコンテンツの更新
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabId}`);
        });
    },

    toggleCategory: function (catId) {
        const rows = document.querySelectorAll(`tr[data-parent="${catId}"]`);
        rows.forEach(row => {
            row.style.display = row.style.display === 'none' ? '' : 'none';
        });
    },

    toggleSubcategory: function (subcatId) {
        const rows = document.querySelectorAll(`tr[data-parent="${subcatId}"]`);
        rows.forEach(row => {
            row.style.display = row.style.display === 'none' ? '' : 'none';
        });
    },

    saveDraft: function () {
        App.showToast('下書きを保存しました', 'success');
    },

    submitForApproval: function () {
        App.confirm('この計画を承認申請しますか？', () => {
            App.showToast('承認申請を送信しました', 'success');
            Router.navigate('plan-list');
        });
    },

    copyFromPrevious: function () {
        App.confirm('前月の計画数値をコピーしますか？現在の入力値は上書きされます。', () => {
            App.showToast('前月の計画をコピーしました', 'success');
        });
    },

    startMeeting: function () {
        App.confirm('ステータスを「販売会議中」に変更しますか？', () => {
            if (this.currentPlan) this.currentPlan.status = 'in_meeting';
            App.showToast('販売会議モードに移行しました', 'success');
            this.refresh();
        });
    },

    refresh: function () {
        const content = document.getElementById('pageContent');
        if (content) content.innerHTML = this.render();
    },

    importExcel: function () {
        App.showModal('Excelインポート', `
            <div class="form-group">
                <label class="form-label">ファイルを選択</label>
                <input type="file" class="form-input" accept=".xlsx,.xls,.csv">
            </div>
            <div class="mt-md text-muted" style="font-size: 12px;">
                対応形式: Excel (.xlsx, .xls), CSV (.csv)
            </div>
        `, [
            { label: 'キャンセル', class: 'btn-secondary', onclick: 'App.closeModal()' },
            { label: 'インポート', class: 'btn-primary', onclick: 'PlanEdit.executeImport()' }
        ]);
    },

    executeImport: function () {
        App.closeModal();
        App.showToast('インポートが完了しました', 'success');
    },

    executeAllocation: function () {
        App.confirm('按分を実行しますか？既存の数値は上書きされます。', () => {
            App.showToast('按分を実行しました', 'success');
        });
    },

    loadPlan: function (planId) {
        const plan = AppData.plans.find(p => p.id === planId);
        if (plan) {
            this.currentPlan = plan;
            this.isNew = false;
        }
    },

    init: function () {
    }
};

window.PlanEdit = PlanEdit;
