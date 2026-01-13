/* ============================================
   店舗・エリア別計画画面
   
   【画面説明】
   エリア→店舗の階層で計画を管理。
   チャネル別（旗艦店/標準店/小型店/オンライン）のタブ切替、
   店舗別配分率の設定、按分計算が可能。
   ============================================ */

const StoreArea = {
    currentChannel: 'all',
    currentArea: 'all',

    render: function () {
        const stores = AppData.storeHierarchy;
        const channels = AppData.channels;

        return `
            <div class="store-area-page">
                <!-- アクションバー -->
                <div class="action-bar mb-lg">
                    <div class="flex gap-md">
                        <select class="form-select" id="planSelector">
                            <option value="P2026-003">2026年2月 月次販売計画</option>
                            <option value="P2026-002">2026年1月 月次販売計画</option>
                        </select>
                    </div>
                    <div class="flex gap-sm">
                        <button class="btn btn-secondary" onclick="StoreArea.autoAllocate()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <polyline points="16 3 21 3 21 8"/>
                                <line x1="4" y1="20" x2="21" y2="3"/>
                                <polyline points="21 16 21 21 16 21"/>
                                <line x1="15" y1="15" x2="21" y2="21"/>
                                <line x1="4" y1="4" x2="9" y2="9"/>
                            </svg>
                            自動按分
                        </button>
                        <button class="btn btn-secondary" onclick="StoreArea.exportAll()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            エクスポート
                        </button>
                    </div>
                </div>
                
                <!-- チャネルタブ -->
                <div class="tabs">
                    <button class="tab-item ${this.currentChannel === 'all' ? 'active' : ''}" 
                            onclick="StoreArea.switchChannel('all')">全チャネル</button>
                    ${channels.map(ch => `
                        <button class="tab-item ${this.currentChannel === ch.id ? 'active' : ''}" 
                                onclick="StoreArea.switchChannel('${ch.id}')">${ch.name}</button>
                    `).join('')}
                </div>
                
                <!-- エリアフィルター -->
                <div class="filter-bar">
                    <div class="filter-group">
                        <span class="filter-label">エリア:</span>
                        <select class="form-select" onchange="StoreArea.filterByArea(this.value)">
                            <option value="all">すべてのエリア</option>
                            ${stores.map(area => `
                                <option value="${area.id}">${area.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="flex gap-sm" style="margin-left: auto;">
                        <span class="text-muted">表示単位:</span>
                        <button class="btn btn-sm ${this.viewMode === 'amount' ? 'btn-primary' : 'btn-secondary'}" 
                                onclick="StoreArea.setViewMode('amount')">金額</button>
                        <button class="btn btn-sm ${this.viewMode === 'ratio' ? 'btn-primary' : 'btn-secondary'}" 
                                onclick="StoreArea.setViewMode('ratio')">構成比</button>
                    </div>
                </div>
                
                <!-- サマリーカード -->
                <div class="kpi-grid mb-lg">
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <span class="kpi-label">計画売上合計</span>
                        </div>
                        <div class="kpi-value">12.5億円</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <span class="kpi-label">対象店舗数</span>
                        </div>
                        <div class="kpi-value">9店舗</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <span class="kpi-label">平均計画額</span>
                        </div>
                        <div class="kpi-value">1.39億円</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <span class="kpi-label">按分完了率</span>
                        </div>
                        <div class="kpi-value text-success">100%</div>
                    </div>
                </div>
                
                <!-- エリア・店舗テーブル -->
                <div class="card">
                    <div class="card-body" style="padding: 0;">
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th style="width: 200px;">エリア / 店舗</th>
                                        <th>チャネル</th>
                                        <th class="numeric">配分率</th>
                                        <th class="numeric">前年実績</th>
                                        <th class="numeric">計画売上</th>
                                        <th class="numeric">計画数量</th>
                                        <th class="numeric">前年比</th>
                                        <th style="width: 100px;">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.renderStoreRows(stores)}
                                </tbody>
                                <tfoot>
                                    <tr style="font-weight: 600; background: var(--color-bg-secondary);">
                                        <td colspan="2">合計</td>
                                        <td class="numeric">100.0%</td>
                                        <td class="numeric">11,800,000,000</td>
                                        <td class="numeric">12,500,000,000</td>
                                        <td class="numeric">2,800,000</td>
                                        <td class="numeric diff-positive">+5.9%</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .area-row {
                    background: var(--color-bg-secondary);
                    font-weight: 600;
                }
                
                .area-row td:first-child {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .store-row td:first-child {
                    padding-left: 32px;
                }
                
                .channel-badge {
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 500;
                }
                
                .channel-flagship {
                    background: #DBEAFE;
                    color: #1E40AF;
                }
                
                .channel-standard {
                    background: #E0E7FF;
                    color: #3730A3;
                }
                
                .channel-small {
                    background: #F3E8FF;
                    color: #6B21A8;
                }
                
                .channel-online {
                    background: #CCFBF1;
                    color: #115E59;
                }
                
                .ratio-input {
                    width: 80px;
                    text-align: right;
                    padding: 4px 8px;
                    border: 1px solid var(--color-border);
                    border-radius: 4px;
                }
                
                .ratio-input:focus {
                    border-color: var(--color-primary);
                    outline: none;
                }
            </style>
        `;
    },

    renderStoreRows: function (stores) {
        let rows = '';

        stores.forEach(area => {
            const areaTotal = area.children.reduce((sum, s) => sum + s.salesRatio, 0);

            // エリア行
            rows += `
                <tr class="area-row">
                    <td>
                        <span class="tree-toggle expanded" onclick="StoreArea.toggleArea('${area.id}')">▼</span>
                        ${area.name}
                    </td>
                    <td>-</td>
                    <td class="numeric">${areaTotal.toFixed(1)}%</td>
                    <td class="numeric">${this.formatLargeNumber(3500000000)}</td>
                    <td class="numeric">${this.formatLargeNumber(3800000000)}</td>
                    <td class="numeric">850,000</td>
                    <td class="numeric diff-positive">+8.6%</td>
                    <td></td>
                </tr>
            `;

            // 店舗行
            area.children.forEach(store => {
                const channelLabels = {
                    flagship: { label: '旗艦店', class: 'channel-flagship' },
                    standard: { label: '標準店', class: 'channel-standard' },
                    small: { label: '小型店', class: 'channel-small' },
                    online: { label: 'オンライン', class: 'channel-online' }
                };
                const ch = channelLabels[store.channel] || channelLabels.standard;
                const planSales = Math.round(12500000000 * store.salesRatio / 100);
                const lastYear = Math.round(planSales * 0.94);
                const change = ((planSales - lastYear) / lastYear * 100).toFixed(1);

                rows += `
                    <tr class="store-row" data-area="${area.id}">
                        <td>${store.name}</td>
                        <td><span class="channel-badge ${ch.class}">${ch.label}</span></td>
                        <td class="numeric">
                            <input type="text" class="ratio-input" value="${store.salesRatio}%" 
                                   onchange="StoreArea.updateRatio('${store.id}', this.value)">
                        </td>
                        <td class="numeric">${this.formatLargeNumber(lastYear)}</td>
                        <td class="numeric">${this.formatLargeNumber(planSales)}</td>
                        <td class="numeric">${Math.round(planSales / 4500).toLocaleString()}</td>
                        <td class="numeric diff-positive">+${change}%</td>
                        <td>
                            <button class="btn btn-ghost btn-sm" onclick="StoreArea.editStore('${store.id}')" title="詳細編集">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                    <path d="M12 20h9"/>
                                    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                </svg>
                            </button>
                        </td>
                    </tr>
                `;
            });
        });

        return rows;
    },

    formatLargeNumber: function (value) {
        if (value >= 100000000) {
            return (value / 100000000).toFixed(1) + '億';
        } else if (value >= 10000) {
            return (value / 10000).toFixed(0) + '万';
        }
        return value.toLocaleString();
    },

    switchChannel: function (channel) {
        this.currentChannel = channel;
        this.refresh();
    },

    filterByArea: function (areaId) {
        this.currentArea = areaId;
        // フィルタリング処理
        App.showToast(`${areaId === 'all' ? 'すべてのエリア' : areaId}を表示`, 'info');
    },

    setViewMode: function (mode) {
        this.viewMode = mode;
        this.refresh();
    },

    toggleArea: function (areaId) {
        const rows = document.querySelectorAll(`tr[data-area="${areaId}"]`);
        const toggle = event.currentTarget;

        rows.forEach(row => {
            row.style.display = row.style.display === 'none' ? '' : 'none';
        });
        toggle.textContent = toggle.textContent === '▼' ? '▶' : '▼';
    },

    updateRatio: function (storeId, value) {
        App.showToast(`店舗 ${storeId} の配分率を更新しました`, 'success');
    },

    editStore: function (storeId) {
        App.showModal('店舗詳細編集', `
            <div class="form-group">
                <label class="form-label">店舗名</label>
                <input type="text" class="form-input" value="新宿店" disabled>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">配分率</label>
                    <input type="text" class="form-input" value="12.5%">
                </div>
                <div class="form-group">
                    <label class="form-label">計画売上</label>
                    <input type="text" class="form-input" value="1,562,500,000">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">備考</label>
                <textarea class="form-input" rows="2" placeholder="店舗固有の計画事項"></textarea>
            </div>
        `, [
            { label: 'キャンセル', class: 'btn-secondary', onclick: 'App.closeModal()' },
            { label: '保存', class: 'btn-primary', onclick: 'StoreArea.saveStore(); App.closeModal()' }
        ]);
    },

    saveStore: function () {
        App.showToast('店舗情報を保存しました', 'success');
    },

    autoAllocate: function () {
        App.confirm('前年実績比率で自動按分しますか？現在の配分率は上書きされます。', () => {
            App.showToast('自動按分を実行しました', 'success');
        });
    },

    exportAll: function () {
        App.showToast('店舗別データをエクスポートしました', 'success');
    },

    refresh: function () {
        const content = document.getElementById('pageContent');
        if (content) {
            content.innerHTML = this.render();
        }
    },

    init: function () {
        this.viewMode = 'amount';
    }
};

window.StoreArea = StoreArea;
