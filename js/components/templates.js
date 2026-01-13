/* ============================================
   テンプレート管理画面
   
   【画面説明】
   計画テンプレートの作成・編集・管理を行う画面。
   既存テンプレートの一覧表示、新規作成、
   計画へのテンプレート適用が可能。
   ============================================ */

const Templates = {
    render: function () {
        const templates = AppData.templates;

        return `
            <div class="templates-page">
                <!-- アクションバー -->
                <div class="action-bar mb-lg">
                    <div class="flex gap-md">
                        <button class="btn btn-primary" onclick="Templates.createNew()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            新規テンプレート作成
                        </button>
                    </div>
                    <div class="search-input" style="max-width: 300px;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input type="text" placeholder="テンプレートを検索...">
                    </div>
                </div>
                
                <!-- テンプレート一覧 -->
                <div class="template-grid">
                    ${templates.map(t => this.renderTemplateCard(t)).join('')}
                </div>
            </div>
            
            <style>
                .template-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: var(--spacing-lg);
                }
                
                .template-card {
                    background: var(--color-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-lg);
                    transition: box-shadow var(--transition), transform var(--transition);
                }
                
                .template-card:hover {
                    box-shadow: var(--shadow-md);
                    transform: translateY(-2px);
                }
                
                .template-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: var(--spacing-md);
                }
                
                .template-card-title {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 4px;
                }
                
                .template-card-type {
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 500;
                }
                
                .type-yearly { background: #E0E7FF; color: #3730A3; }
                .type-monthly { background: #DBEAFE; color: #1E40AF; }
                .type-weekly { background: #CCFBF1; color: #115E59; }
                .type-seasonal { background: #FEF3C7; color: #92400E; }
                
                .template-card-desc {
                    font-size: 13px;
                    color: var(--color-text-secondary);
                    margin-bottom: var(--spacing-md);
                    min-height: 40px;
                }
                
                .template-card-meta {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: var(--color-text-muted);
                    padding-top: var(--spacing-md);
                    border-top: 1px solid var(--color-border-light);
                    margin-bottom: var(--spacing-md);
                }
                
                .template-card-actions {
                    display: flex;
                    gap: var(--spacing-sm);
                }
                
                .template-card-actions .btn {
                    flex: 1;
                }
                
                .usage-badge {
                    background: var(--color-bg);
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 11px;
                }
            </style>
        `;
    },

    renderTemplateCard: function (template) {
        const typeLabels = {
            yearly: { label: '年次', class: 'type-yearly' },
            monthly: { label: '月次', class: 'type-monthly' },
            weekly: { label: '週次', class: 'type-weekly' },
            seasonal: { label: '季節', class: 'type-seasonal' }
        };
        const type = typeLabels[template.type] || typeLabels.monthly;

        return `
            <div class="template-card">
                <div class="template-card-header">
                    <div>
                        <div class="template-card-title">${template.name}</div>
                    </div>
                    <span class="template-card-type ${type.class}">${type.label}</span>
                </div>
                <div class="template-card-desc">${template.description}</div>
                <div class="template-card-meta">
                    <span>作成者: ${template.createdBy}</span>
                    <span class="usage-badge">使用回数: ${template.usageCount}</span>
                </div>
                <div class="template-card-actions">
                    <button class="btn btn-secondary btn-sm" onclick="Templates.edit('${template.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <path d="M12 20h9"/>
                            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                        </svg>
                        編集
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="Templates.useTemplate('${template.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        使用する
                    </button>
                </div>
            </div>
        `;
    },

    createNew: function () {
        App.showModal('新規テンプレート作成', `
            <div class="form-group">
                <label class="form-label required">テンプレート名</label>
                <input type="text" class="form-input" placeholder="例: 月次計画テンプレート（食品）">
            </div>
            <div class="form-group">
                <label class="form-label required">計画タイプ</label>
                <select class="form-select form-input">
                    <option value="monthly">月次</option>
                    <option value="weekly">週次</option>
                    <option value="yearly">年次</option>
                    <option value="seasonal">季節</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">説明</label>
                <textarea class="form-input" rows="3" placeholder="テンプレートの用途や特徴を入力"></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">ベースにする計画</label>
                <select class="form-select form-input">
                    <option value="">-- 選択しない --</option>
                    <option value="P2026-002">2026年1月 月次販売計画</option>
                    <option value="P2026-001">2026年度 年間販売計画</option>
                </select>
                <div class="form-helper">既存の計画をベースにテンプレートを作成できます</div>
            </div>
        `, [
            { label: 'キャンセル', class: 'btn-secondary', onclick: 'App.closeModal()' },
            { label: '作成', class: 'btn-primary', onclick: 'Templates.saveNew()' }
        ]);
    },

    saveNew: function () {
        App.closeModal();
        App.showToast('テンプレートを作成しました', 'success');
    },

    edit: function (templateId) {
        const template = AppData.templates.find(t => t.id === templateId);
        if (!template) return;

        App.showModal('テンプレート編集', `
            <div class="form-group">
                <label class="form-label required">テンプレート名</label>
                <input type="text" class="form-input" value="${template.name}">
            </div>
            <div class="form-group">
                <label class="form-label">説明</label>
                <textarea class="form-input" rows="3">${template.description}</textarea>
            </div>
            <div class="form-group">
                <label class="form-check">
                    <input type="checkbox">
                    <span>他のユーザーに公開する</span>
                </label>
            </div>
        `, [
            { label: 'キャンセル', class: 'btn-secondary', onclick: 'App.closeModal()' },
            { label: '削除', class: 'btn-danger', onclick: `Templates.delete('${templateId}')` },
            { label: '保存', class: 'btn-primary', onclick: 'Templates.saveEdit()' }
        ]);
    },

    saveEdit: function () {
        App.closeModal();
        App.showToast('テンプレートを更新しました', 'success');
    },

    delete: function (templateId) {
        App.closeModal();
        App.confirm('このテンプレートを削除しますか？', () => {
            App.showToast('テンプレートを削除しました', 'success');
        });
    },

    useTemplate: function (templateId) {
        App.confirm('このテンプレートを使用して新規計画を作成しますか？', () => {
            Router.navigate('plan-edit');
            App.showToast('テンプレートを適用しました', 'success');
        });
    },

    init: function () {
    }
};

window.Templates = Templates;
