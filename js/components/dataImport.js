/* ============================================
   マスタ連携・データ取込画面
   
   【画面説明】
   外部システムとのデータ連携を管理する画面。
   商品マスタ・店舗マスタの同期状況確認、
   Excel/CSVインポート、エクスポート機能を提供。
   ============================================ */

const DataImport = {
    currentTab: 'status',

    render: function () {
        const status = AppData.masterDataStatus;
        const history = AppData.importHistory;

        return `
            <div class="data-import-page">
                <!-- タブ切替 -->
                <div class="tabs">
                    <button class="tab-item ${this.currentTab === 'status' ? 'active' : ''}" 
                            onclick="DataImport.switchTab('status')">連携状況</button>
                    <button class="tab-item ${this.currentTab === 'import' ? 'active' : ''}" 
                            onclick="DataImport.switchTab('import')">データ取込</button>
                    <button class="tab-item ${this.currentTab === 'export' ? 'active' : ''}" 
                            onclick="DataImport.switchTab('export')">エクスポート</button>
                    <button class="tab-item ${this.currentTab === 'history' ? 'active' : ''}" 
                            onclick="DataImport.switchTab('history')">取込履歴</button>
                </div>
                
                <!-- 連携状況タブ -->
                <div id="tab-status" class="tab-content ${this.currentTab === 'status' ? 'active' : ''}">
                    ${this.renderStatusTab(status)}
                </div>
                
                <!-- データ取込タブ -->
                <div id="tab-import" class="tab-content ${this.currentTab === 'import' ? 'active' : ''}">
                    ${this.renderImportTab()}
                </div>
                
                <!-- エクスポートタブ -->
                <div id="tab-export" class="tab-content ${this.currentTab === 'export' ? 'active' : ''}">
                    ${this.renderExportTab()}
                </div>
                
                <!-- 取込履歴タブ -->
                <div id="tab-history" class="tab-content ${this.currentTab === 'history' ? 'active' : ''}">
                    ${this.renderHistoryTab(history)}
                </div>
            </div>
            
            <style>
                .status-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: var(--spacing-lg);
                }
                
                .status-card {
                    background: var(--color-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-lg);
                }
                
                .status-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-md);
                }
                
                .status-card-title {
                    font-size: 16px;
                    font-weight: 600;
                }
                
                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                }
                
                .status-badge.synced {
                    background: var(--color-success-light);
                    color: var(--color-success-dark);
                }
                
                .status-badge.syncing {
                    background: var(--color-warning-light);
                    color: var(--color-warning-dark);
                }
                
                .status-badge.error {
                    background: var(--color-danger-light);
                    color: var(--color-danger-dark);
                }
                
                .status-info {
                    margin-bottom: var(--spacing-md);
                }
                
                .status-info-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid var(--color-border-light);
                    font-size: 13px;
                }
                
                .status-info-row:last-child {
                    border-bottom: none;
                }
                
                .status-info-label {
                    color: var(--color-text-muted);
                }
                
                .upload-area {
                    border: 2px dashed var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-2xl);
                    text-align: center;
                    background: var(--color-bg);
                    cursor: pointer;
                    transition: all var(--transition);
                }
                
                .upload-area:hover {
                    border-color: var(--color-primary);
                    background: var(--color-primary-light);
                }
                
                .upload-area svg {
                    width: 48px;
                    height: 48px;
                    color: var(--color-text-muted);
                    margin-bottom: var(--spacing-md);
                }
                
                .upload-area h3 {
                    font-size: 16px;
                    margin-bottom: var(--spacing-sm);
                }
                
                .upload-area p {
                    color: var(--color-text-muted);
                    font-size: 13px;
                }
                
                .export-options {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: var(--spacing-md);
                }
                
                .export-option {
                    background: var(--color-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-lg);
                    cursor: pointer;
                    transition: all var(--transition);
                }
                
                .export-option:hover {
                    border-color: var(--color-primary);
                    box-shadow: var(--shadow-md);
                }
                
                .export-option-header {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                    margin-bottom: var(--spacing-sm);
                }
                
                .export-option-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: var(--radius-md);
                    background: var(--color-bg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .export-option-icon svg {
                    width: 20px;
                    height: 20px;
                    color: var(--color-primary);
                }
                
                .export-option-title {
                    font-weight: 600;
                }
                
                .export-option-desc {
                    font-size: 13px;
                    color: var(--color-text-muted);
                }
            </style>
        `;
    },

    renderStatusTab: function (status) {
        return `
            <div class="status-grid">
                ${Object.entries(status).map(([key, data]) => `
                    <div class="status-card">
                        <div class="status-card-header">
                            <div>
                                <div class="status-card-title">${data.name}</div>
                                <div class="text-sm text-muted" style="font-size: 11px;">${data.description || ''}</div>
                            </div>
                            <span class="status-badge ${data.status}">
                                ${data.status === 'synced' ? '● 同期済' : data.status === 'syncing' ? '◐ 同期中' : '● ' + (data.status === 'warning' ? '警告' : 'エラー')}
                            </span>
                        </div>
                        <div class="status-info">
                            <div class="status-info-row">
                                <span class="status-info-label">最終同期</span>
                                <span>${data.lastSync}</span>
                            </div>
                            ${data.totalRecords ? `
                            <div class="status-info-row">
                                <span class="status-info-label">レコード数</span>
                                <span>${data.totalRecords.toLocaleString()}件</span>
                            </div>
                            ` : ''}
                            ${data.message ? `
                            <div class="status-info-row">
                                <span class="status-info-label">状態</span>
                                <span style="font-size: 11px;" class="${data.status === 'warning' ? 'text-warning' : ''}">${data.message}</span>
                            </div>
                            ` : ''}
                        </div>
                        <button class="btn btn-secondary btn-sm" style="width: 100%;" onclick="DataImport.syncNow('${key}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <polyline points="23 4 23 10 17 10"/>
                                <polyline points="1 20 1 14 7 14"/>
                                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                            </svg>
                            今すぐ同期
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderImportTab: function () {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">ファイルをアップロード</h3>
                </div>
                <div class="card-body">
                    <div class="upload-area" onclick="DataImport.triggerUpload()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <h3>ファイルをドロップまたはクリックしてアップロード</h3>
                        <p>対応形式: Excel (.xlsx, .xls), CSV (.csv)</p>
                    </div>
                    <input type="file" id="fileInput" style="display: none;" accept=".xlsx,.xls,.csv" onchange="DataImport.handleFile(this)">
                    
                    <div class="mt-lg">
                        <h4 style="margin-bottom: var(--spacing-md);">インポート種別を選択</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">データ種別</label>
                                <select class="form-select form-input">
                                    <option value="plan">計画データ</option>
                                    <option value="target">目標数値</option>
                                    <option value="allocation">店舗配分</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">対象計画</label>
                                <select class="form-select form-input">
                                    <option value="P2026-003">2026年2月 月次販売計画</option>
                                    <option value="P2026-005">第2週 週次販売計画</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card mt-lg">
                <div class="card-header">
                    <h3 class="card-title">テンプレートダウンロード</h3>
                </div>
                <div class="card-body">
                    <p class="text-muted mb-md">インポート用のテンプレートファイルをダウンロードできます</p>
                    <div class="flex gap-sm flex-wrap">
                        <button class="btn btn-secondary" onclick="DataImport.downloadTemplate('plan')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            計画データ用
                        </button>
                        <button class="btn btn-secondary" onclick="DataImport.downloadTemplate('store')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            店舗配分用
                        </button>
                        <button class="btn btn-secondary" onclick="DataImport.downloadTemplate('product')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            商品別計画用
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    renderExportTab: function () {
        return `
            <div class="export-options">
                <div class="export-option" onclick="DataImport.exportData('plan-excel')">
                    <div class="export-option-header">
                        <div class="export-option-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                        </div>
                        <span class="export-option-title">計画データ (Excel)</span>
                    </div>
                    <p class="export-option-desc">選択した計画の全データをExcel形式でエクスポート</p>
                </div>
                
                <div class="export-option" onclick="DataImport.exportData('plan-csv')">
                    <div class="export-option-header">
                        <div class="export-option-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                            </svg>
                        </div>
                        <span class="export-option-title">計画データ (CSV)</span>
                    </div>
                    <p class="export-option-desc">選択した計画のデータをCSV形式でエクスポート</p>
                </div>
                
                <div class="export-option" onclick="DataImport.exportData('analysis')">
                    <div class="export-option-header">
                        <div class="export-option-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="20" x2="18" y2="10"/>
                                <line x1="12" y1="20" x2="12" y2="4"/>
                                <line x1="6" y1="20" x2="6" y2="14"/>
                            </svg>
                        </div>
                        <span class="export-option-title">差異分析レポート</span>
                    </div>
                    <p class="export-option-desc">計画vs実績の差異分析をレポート形式でエクスポート</p>
                </div>
                
                <div class="export-option" onclick="DataImport.exportData('store')">
                    <div class="export-option-header">
                        <div class="export-option-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                        </div>
                        <span class="export-option-title">店舗別データ</span>
                    </div>
                    <p class="export-option-desc">店舗別の計画・配分データをエクスポート</p>
                </div>
            </div>
            
            <div class="card mt-lg">
                <div class="card-header">
                    <h3 class="card-title">エクスポート設定</h3>
                </div>
                <div class="card-body">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">対象計画</label>
                            <select class="form-select form-input">
                                <option value="P2026-003">2026年2月 月次販売計画</option>
                                <option value="P2026-002">2026年1月 月次販売計画</option>
                                <option value="P2026-001">2026年度 年間販売計画</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">出力形式</label>
                            <select class="form-select form-input">
                                <option value="xlsx">Excel (.xlsx)</option>
                                <option value="csv">CSV (.csv)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderHistoryTab: function (history) {
        return `
            <div class="card">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ファイル名</th>
                                <th>種別</th>
                                <th>アップロード者</th>
                                <th>日時</th>
                                <th>ステータス</th>
                                <th class="numeric">レコード数</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${history.map(item => `
                                <tr>
                                    <td>
                                        <code style="font-size: 12px;">${item.fileName}</code>
                                    </td>
                                    <td><span class="badge badge-info">${item.type}</span></td>
                                    <td>${item.uploadedBy}</td>
                                    <td>${item.uploadedAt}</td>
                                    <td>
                                        <span class="badge ${item.status === 'success' ? 'badge-approved' : 'badge-rejected'}">
                                            ${item.status === 'success' ? '成功' : 'エラー'}
                                        </span>
                                    </td>
                                    <td class="numeric">${item.records.toLocaleString()}</td>
                                    <td>
                                        ${item.status === 'error' ? `
                                            <button class="btn btn-ghost btn-sm" onclick="DataImport.showError('${item.id}')">
                                                詳細
                                            </button>
                                        ` : '-'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    switchTab: function (tab) {
        this.currentTab = tab;
        this.refresh();
    },

    syncNow: function (dataType) {
        App.showToast(`${dataType}の同期を開始しました`, 'info');
    },

    triggerUpload: function () {
        document.getElementById('fileInput').click();
    },

    handleFile: function (input) {
        if (input.files.length > 0) {
            const file = input.files[0];
            App.showToast(`${file.name}をアップロード中...`, 'info');
            setTimeout(() => {
                App.showToast('インポートが完了しました', 'success');
            }, 1500);
        }
    },

    downloadTemplate: function (type) {
        App.showToast(`${type}用テンプレートをダウンロードしました`, 'success');
    },

    exportData: function (type) {
        App.showToast('エクスポートを開始しました', 'info');
    },

    showError: function (id) {
        const item = AppData.importHistory.find(h => h.id === id);
        if (item && item.error) {
            App.showModal('エラー詳細', `
                <div class="bg-danger" style="padding: 16px; border-radius: 8px; color: var(--color-danger-dark);">
                    <strong>エラー内容:</strong><br>
                    ${item.error}
                </div>
            `);
        }
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

window.DataImport = DataImport;
