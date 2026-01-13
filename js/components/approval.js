/* ============================================
   承認ワークフロー画面
   
   【画面説明】
   計画の承認依頼・承認・差戻しを管理する画面。
   承認待ち一覧、ステータス遷移表示、コメント機能、
   承認履歴を提供。管理者・承認者向けのワークフロー管理。
   ============================================ */

const Approval = {
    currentTab: 'pending',

    render: function () {
        const pending = AppData.pendingApprovals;
        const history = AppData.approvalHistory;

        return `
            <div class="approval-page">
                <!-- ワークフローサマリー -->
                <div class="kpi-grid mb-lg">
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <span class="kpi-label">承認待ち</span>
                            <div class="kpi-icon warning">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                            </div>
                        </div>
                        <div class="kpi-value">${pending.length}件</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <span class="kpi-label">今月承認済</span>
                            <div class="kpi-icon success">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                            </div>
                        </div>
                        <div class="kpi-value">8件</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <span class="kpi-label">差戻し</span>
                            <div class="kpi-icon danger">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="15" y1="9" x2="9" y2="15"/>
                                    <line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                            </div>
                        </div>
                        <div class="kpi-value">1件</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <span class="kpi-label">平均承認日数</span>
                        </div>
                        <div class="kpi-value">2.3日</div>
                    </div>
                </div>
                
                <!-- タブ切替 -->
                <div class="tabs">
                    <button class="tab-item ${this.currentTab === 'pending' ? 'active' : ''}" 
                            onclick="Approval.switchTab('pending')">
                        承認待ち
                        <span class="badge badge-pending" style="margin-left: 6px;">${pending.length}</span>
                    </button>
                    <button class="tab-item ${this.currentTab === 'history' ? 'active' : ''}" 
                            onclick="Approval.switchTab('history')">承認履歴</button>
                    <button class="tab-item ${this.currentTab === 'my-requests' ? 'active' : ''}" 
                            onclick="Approval.switchTab('my-requests')">自分の申請</button>
                </div>
                
                <!-- 承認待ちリスト -->
                <div id="tab-pending" class="tab-content ${this.currentTab === 'pending' ? 'active' : ''}">
                    ${this.renderPendingList(pending)}
                </div>
                
                <!-- 承認履歴 -->
                <div id="tab-history" class="tab-content ${this.currentTab === 'history' ? 'active' : ''}">
                    ${this.renderHistoryList(history)}
                </div>
                
                <!-- 自分の申請 -->
                <div id="tab-my-requests" class="tab-content ${this.currentTab === 'my-requests' ? 'active' : ''}">
                    ${this.renderMyRequests()}
                </div>
            </div>
            
            <style>
                .approval-card {
                    background: var(--color-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    margin-bottom: var(--spacing-md);
                    overflow: hidden;
                }
                
                .approval-card-header {
                    padding: var(--spacing-md) var(--spacing-lg);
                    background: var(--color-bg);
                    border-bottom: 1px solid var(--color-border-light);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .approval-card-title {
                    font-weight: 600;
                    font-size: 15px;
                }
                
                .approval-card-meta {
                    font-size: 12px;
                    color: var(--color-text-muted);
                }
                
                .approval-card-body {
                    padding: var(--spacing-lg);
                }
                
                .approval-info-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--spacing-md);
                    margin-bottom: var(--spacing-lg);
                }
                
                .approval-info-item {
                    text-align: center;
                }
                
                .approval-info-label {
                    font-size: 11px;
                    color: var(--color-text-muted);
                    margin-bottom: 4px;
                }
                
                .approval-info-value {
                    font-size: 14px;
                    font-weight: 500;
                }
                
                .approval-comment {
                    background: var(--color-bg);
                    padding: var(--spacing-md);
                    border-radius: var(--radius-md);
                    margin-bottom: var(--spacing-md);
                }
                
                .approval-comment-label {
                    font-size: 11px;
                    color: var(--color-text-muted);
                    margin-bottom: 4px;
                }
                
                .approval-card-actions {
                    display: flex;
                    gap: var(--spacing-sm);
                    justify-content: flex-end;
                    padding-top: var(--spacing-md);
                    border-top: 1px solid var(--color-border-light);
                }
                
                .workflow-status {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                    margin-bottom: var(--spacing-lg);
                }
                
                .workflow-step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }
                
                .workflow-step-circle {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 600;
                }
                
                .workflow-step-circle.completed {
                    background: var(--color-success);
                    color: white;
                }
                
                .workflow-step-circle.current {
                    background: var(--color-warning);
                    color: white;
                }
                
                .workflow-step-circle.pending {
                    background: var(--color-bg-secondary);
                    color: var(--color-text-muted);
                }
                
                .workflow-step-label {
                    font-size: 11px;
                    color: var(--color-text-muted);
                }
                
                .workflow-connector {
                    flex: 1;
                    height: 2px;
                    background: var(--color-border);
                    max-width: 80px;
                }
                
                .workflow-connector.completed {
                    background: var(--color-success);
                }
            </style>
        `;
    },

    renderPendingList: function (pending) {
        if (pending.length === 0) {
            return `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <h3>承認待ちの計画はありません</h3>
                    <p>すべての計画が処理済みです</p>
                </div>
            `;
        }

        return pending.map(item => `
            <div class="approval-card">
                <div class="approval-card-header">
                    <div>
                        <div class="approval-card-title">${item.planName}</div>
                        <div class="approval-card-meta">
                            計画ID: ${item.planId} | 申請者: ${item.requestedBy}
                        </div>
                    </div>
                    <span class="badge badge-pending">承認待ち</span>
                </div>
                <div class="approval-card-body">
                    <!-- ワークフローステータス -->
                    <div class="workflow-status">
                        <div class="workflow-step">
                            <div class="workflow-step-circle completed">✓</div>
                            <span class="workflow-step-label">作成</span>
                        </div>
                        <div class="workflow-connector completed"></div>
                        <div class="workflow-step">
                            <div class="workflow-step-circle completed">✓</div>
                            <span class="workflow-step-label">M5販売会議</span>
                        </div>
                        <div class="workflow-connector completed"></div>
                        <div class="workflow-step">
                            <div class="workflow-step-circle completed">✓</div>
                            <span class="workflow-step-label">申請</span>
                        </div>
                        <div class="workflow-connector"></div>
                        <div class="workflow-step">
                            <div class="workflow-step-circle current">3</div>
                            <span class="workflow-step-label">承認</span>
                        </div>
                        <div class="workflow-connector"></div>
                        <div class="workflow-step">
                            <div class="workflow-step-circle pending">4</div>
                            <span class="workflow-step-label">確定</span>
                        </div>
                    </div>
                    
                    <!-- 計画情報 -->
                    <div class="approval-info-grid">
                        <div class="approval-info-item">
                            <div class="approval-info-label">申請日時</div>
                            <div class="approval-info-value">${item.requestedAt}</div>
                        </div>
                        <div class="approval-info-item">
                            <div class="approval-info-label">現在の承認者</div>
                            <div class="approval-info-value">${item.currentApprover}</div>
                        </div>
                        <div class="approval-info-item">
                            <div class="approval-info-label">計画売上</div>
                            <div class="approval-info-value">11.8億円</div>
                        </div>
                        <div class="approval-info-item">
                            <div class="approval-info-label">前年比</div>
                            <div class="approval-info-value diff-positive">+5.2%</div>
                        </div>
                    </div>
                    
                    <!-- 申請者コメント -->
                    <div class="approval-comment">
                        <div class="approval-comment-label">申請者コメント</div>
                        <div>${item.comments}</div>
                    </div>
                    
                    <!-- アクションボタン -->
                    <div class="approval-card-actions">
                        <button class="btn btn-secondary" onclick="Approval.viewDetail('${item.planId}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                            詳細を見る
                        </button>
                        <button class="btn btn-danger" onclick="Approval.reject('${item.id}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                            差戻し
                        </button>
                        <button class="btn btn-success" onclick="Approval.approve('${item.id}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            承認
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    renderHistoryList: function (history) {
        return `
            <div class="card">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>計画名</th>
                                <th>アクション</th>
                                <th>承認者</th>
                                <th>日時</th>
                                <th>コメント</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${history.map(item => `
                                <tr>
                                    <td>
                                        <a href="#plan-edit" class="text-primary" style="text-decoration: none;">
                                            ${item.planName}
                                        </a>
                                    </td>
                                    <td>
                                        <span class="badge ${item.action === 'approved' ? 'badge-approved' : 'badge-rejected'}">
                                            ${item.action === 'approved' ? '承認' : '差戻し'}
                                        </span>
                                    </td>
                                    <td>${item.actionBy}</td>
                                    <td>${item.actionAt}</td>
                                    <td class="text-muted">${item.comments}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderMyRequests: function () {
        return `
            <div class="card">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>計画名</th>
                                <th>ステータス</th>
                                <th>申請日</th>
                                <th>現在の承認者</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>2026年2月 月次販売計画</td>
                                <td><span class="badge badge-pending">申請中</span></td>
                                <td>2026-01-07</td>
                                <td>山田 部長</td>
                                <td>
                                    <button class="btn btn-ghost btn-sm" onclick="Approval.cancelRequest('P2026-003')">
                                        取り下げ
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>2026年1月 月次販売計画</td>
                                <td><span class="badge badge-approved">承認済</span></td>
                                <td>2025-12-18</td>
                                <td>-</td>
                                <td>-</td>
                            </tr>
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

    viewDetail: function (planId) {
        Router.navigate('plan-edit');
    },

    approve: function (workflowId) {
        App.showModal('承認確認', `
            <div class="form-group">
                <label class="form-label">承認コメント（任意）</label>
                <textarea class="form-input" id="approveComment" rows="3" placeholder="承認に関するコメントを入力"></textarea>
            </div>
        `, [
            { label: 'キャンセル', class: 'btn-secondary', onclick: 'App.closeModal()' },
            { label: '承認する', class: 'btn-success', onclick: 'Approval.confirmApprove()' }
        ]);
    },

    confirmApprove: function () {
        App.closeModal();
        App.showToast('計画を承認しました', 'success');
        this.refresh();
    },

    reject: function (workflowId) {
        App.showModal('差戻し', `
            <div class="form-group">
                <label class="form-label required">差戻し理由</label>
                <textarea class="form-input" id="rejectReason" rows="3" placeholder="差戻しの理由を入力してください"></textarea>
            </div>
        `, [
            { label: 'キャンセル', class: 'btn-secondary', onclick: 'App.closeModal()' },
            { label: '差戻す', class: 'btn-danger', onclick: 'Approval.confirmReject()' }
        ]);
    },

    confirmReject: function () {
        App.closeModal();
        App.showToast('計画を差戻しました', 'warning');
        this.refresh();
    },

    cancelRequest: function (planId) {
        App.confirm('この申請を取り下げますか？', () => {
            App.showToast('申請を取り下げました', 'info');
        });
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

window.Approval = Approval;
