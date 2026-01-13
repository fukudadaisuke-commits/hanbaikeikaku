/* ============================================
   商品階層別計画画面
   
   【画面説明】
   商品カテゴリ→サブカテゴリ→SKUのドリルダウン表示。
   階層別の計画数値入力・集計、定量商品・戦略商品の
   フラグ設定が可能。左側にツリー表示、右側に詳細テーブル。
   ============================================ */

const ProductHierarchy = {
    selectedCategory: null,

    render: function () {
        const hierarchyData = AppData.productHierarchy;
        const hierarchy = hierarchyData.children || [];

        return `
            <div class="product-hierarchy-page">
                <!-- アクションバー -->
                <div class="action-bar mb-lg">
                    <div class="flex gap-md">
                        <select class="form-select" id="planSelector">
                            <option value="P2026-003">2026年2月 月次販売計画</option>
                            <option value="P2026-002">2026年1月 月次販売計画</option>
                        </select>
                    </div>
                    <div class="flex gap-sm">
                        <button class="btn btn-secondary" onclick="ProductHierarchy.expandAll()">
                            すべて展開
                        </button>
                        <button class="btn btn-secondary" onclick="ProductHierarchy.collapseAll()">
                            すべて折りたたむ
                        </button>
                    </div>
                </div>
                
                <div class="hierarchy-layout">
                    <!-- 左: カテゴリツリー -->
                    <div class="card hierarchy-tree-card">
                        <div class="card-header">
                            <h3 class="card-title">商品階層</h3>
                        </div>
                        <div class="card-body">
                            <div class="tree-view">
                                ${this.renderTreeView(hierarchy)}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 右: 詳細テーブル -->
                    <div class="card hierarchy-detail-card">
                        <div class="card-header">
                            <h3 class="card-title">
                                <span id="detailTitle">カテゴリを選択してください</span>
                            </h3>
                            <div class="flex gap-sm">
                                <button class="btn btn-secondary btn-sm" onclick="ProductHierarchy.exportCategory()">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                        <polyline points="17 8 12 3 7 8"/>
                                        <line x1="12" y1="3" x2="12" y2="15"/>
                                    </svg>
                                    エクスポート
                                </button>
                            </div>
                        </div>
                        <div class="card-body" style="padding: 0;" id="detailContent">
                            ${this.renderCategoryDetail(hierarchy[0])}
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .hierarchy-layout {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: var(--spacing-lg);
                }
                
                @media (max-width: 1024px) {
                    .hierarchy-layout {
                        grid-template-columns: 1fr;
                    }
                }
                
                .hierarchy-tree-card {
                    height: fit-content;
                    max-height: calc(100vh - 200px);
                    overflow-y: auto;
                }
                
                .tree-item {
                    margin-bottom: 2px;
                }
                
                .tree-item-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background var(--transition-fast);
                }
                
                .tree-item-content:hover {
                    background: var(--color-bg-secondary);
                }
                
                .tree-item-content.selected {
                    background: var(--color-primary-light);
                    color: var(--color-primary);
                }
                
                .tree-item-toggle {
                    width: 16px;
                    height: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    color: var(--color-text-muted);
                    transition: transform var(--transition-fast);
                }
                
                .tree-item-toggle.expanded {
                    transform: rotate(90deg);
                }
                
                .tree-item-icon {
                    width: 18px;
                    height: 18px;
                    color: var(--color-text-muted);
                }
                
                .tree-item-name {
                    flex: 1;
                    font-size: 13px;
                }
                
                .tree-item-count {
                    font-size: 11px;
                    color: var(--color-text-muted);
                    background: var(--color-bg-secondary);
                    padding: 2px 6px;
                    border-radius: 10px;
                }
                
                .tree-children {
                    margin-left: 20px;
                    display: none;
                }
                
                .tree-children.expanded {
                    display: block;
                }
                
                .sku-item {
                    padding: 6px 12px;
                    font-size: 12px;
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .sku-item:hover {
                    background: var(--color-bg-secondary);
                }
                
                .strategic-flag {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--color-warning);
                }
                
                .summary-cards {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--spacing-md);
                    padding: var(--spacing-md);
                    background: var(--color-bg);
                    border-bottom: 1px solid var(--color-border-light);
                }
                
                .summary-card-mini {
                    text-align: center;
                }
                
                .summary-card-mini .label {
                    font-size: 11px;
                    color: var(--color-text-muted);
                }
                
                .summary-card-mini .value {
                    font-size: 18px;
                    font-weight: 600;
                    margin-top: 4px;
                }
            </style>
        `;
    },

    renderTreeView: function (hierarchy) {
        return hierarchy.map(cat => `
            <div class="tree-item" data-id="${cat.id}">
                <div class="tree-item-content ${this.selectedCategory === cat.id ? 'selected' : ''}" 
                     onclick="ProductHierarchy.selectCategory('${cat.id}')">
                    <span class="tree-item-toggle" onclick="ProductHierarchy.toggleTree(event, '${cat.id}')">▶</span>
                    <svg class="tree-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                    </svg>
                    <span class="tree-item-name">${cat.name}</span>
                    <span class="tree-item-count">${cat.children.length}</span>
                </div>
                <div class="tree-children" id="tree-${cat.id}">
                    ${cat.children.map(subcat => `
                        <div class="tree-item" data-id="${subcat.id}">
                            <div class="tree-item-content" onclick="ProductHierarchy.selectSubcategory('${subcat.id}', '${cat.id}')">
                                <span class="tree-item-toggle" onclick="ProductHierarchy.toggleTree(event, '${subcat.id}')">▶</span>
                                <svg class="tree-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                                </svg>
                                <span class="tree-item-name">${subcat.name}</span>
                                <span class="tree-item-count">${subcat.children ? subcat.children.length : 0}</span>
                            </div>
                            <div class="tree-children" id="tree-${subcat.id}">
                                ${subcat.children ? subcat.children.map(sku => `
                                    <div class="sku-item" onclick="ProductHierarchy.selectSku('${sku.id}')">
                                        ${sku.isStrategic ? '<span class="strategic-flag"></span>' : ''}
                                        ${sku.name}
                                    </div>
                                `).join('') : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    renderCategoryDetail: function (category) {
        if (!category) {
            return '<div class="empty-state"><p>カテゴリを選択してください</p></div>';
        }

        return `
            <!-- サマリーカード -->
            <div class="summary-cards">
                <div class="summary-card-mini">
                    <div class="label">計画売上</div>
                    <div class="value">4.8億円</div>
                </div>
                <div class="summary-card-mini">
                    <div class="label">計画数量</div>
                    <div class="value">120万点</div>
                </div>
                <div class="summary-card-mini">
                    <div class="label">計画粗利</div>
                    <div class="value">1.2億円</div>
                </div>
                <div class="summary-card-mini">
                    <div class="label">戦略商品</div>
                    <div class="value text-warning">4件</div>
                </div>
            </div>
            
            <!-- 詳細テーブル -->
            <div class="table-container" style="border: none; border-radius: 0;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>サブカテゴリ / 商品</th>
                            <th class="numeric">基準売価</th> <!-- M3 -->
                            <th class="numeric">前年実績</th>
                            <th class="numeric">計画売上</th>
                            <th class="numeric">計画数量</th>
                            <th class="numeric">計画粗利</th>
                            <th class="numeric">前年比</th>
                            <th class="text-center">戦略</th> <!-- M2 -->
                            <th class="text-center">定量</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${category.children ? category.children.map(subcat => `
                            <tr style="background: var(--color-bg-secondary); font-weight: 500;">
                                <td>${subcat.name}</td>
                                <td class="numeric">-</td>
                                <td class="numeric">150,000,000</td>
                                <td class="numeric">160,000,000</td>
                                <td class="numeric">400,000</td>
                                <td class="numeric">40,000,000</td>
                                <td class="numeric diff-positive">+6.7%</td>
                                <td></td>
                                <td></td>
                            </tr>
                            ${subcat.children ? subcat.children.map(sku => `
                                <tr>
                                    <td style="padding-left: 24px;">${sku.name}</td>
                                    <td class="numeric editable">
                                        <input type="number" value="${sku.price}" 
                                               onchange="ProductHierarchy.updatePrice('${sku.id}', this.value)"
                                               style="width: 80px; text-align: right;">
                                    </td>
                                    <td class="numeric">25,000,000</td>
                                    <td class="numeric">27,000,000</td>
                                    <td class="numeric">65,000</td>
                                    <td class="numeric">6,750,000</td>
                                    <td class="numeric ${Math.random() > 0.5 ? 'diff-positive' : 'diff-negative'}">${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 10).toFixed(1)}%</td>
                                    <td class="text-center">
                                        <input type="checkbox" ${sku.isStrategic ? 'checked' : ''} 
                                               onchange="ProductHierarchy.toggleStrategic('${sku.id}', this.checked)">
                                    </td>
                                    <td class="text-center">
                                        <input type="checkbox" onchange="ProductHierarchy.toggleQuantitative('${sku.id}', this.checked)">
                                    </td>
                                </tr>
                            `).join('') : ''}
                        `).join('') : ''}
                    </tbody>
                </table>
            </div>
        `;
    },

    selectCategory: function (catId) {
        const category = (AppData.productHierarchy.children || []).find(c => c.id === catId);
        this.selectedCategory = catId;

        // ツリーの選択状態を更新
        document.querySelectorAll('.tree-item-content').forEach(el => {
            el.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');

        // 詳細を更新
        document.getElementById('detailTitle').textContent = category.name;
        document.getElementById('detailContent').innerHTML = this.renderCategoryDetail(category);
    },

    selectSubcategory: function (subcatId, parentId) {
        // サブカテゴリ選択時の処理
    },

    selectSku: function (skuId) {
        App.showToast(`SKU: ${skuId} を選択しました`, 'info');
    },

    toggleTree: function (event, id) {
        event.stopPropagation();
        const children = document.getElementById(`tree-${id}`);
        const toggle = event.currentTarget;

        if (children) {
            children.classList.toggle('expanded');
            toggle.classList.toggle('expanded');
        }
    },

    expandAll: function () {
        document.querySelectorAll('.tree-children').forEach(el => el.classList.add('expanded'));
        document.querySelectorAll('.tree-item-toggle').forEach(el => el.classList.add('expanded'));
    },

    collapseAll: function () {
        document.querySelectorAll('.tree-children').forEach(el => el.classList.remove('expanded'));
        document.querySelectorAll('.tree-item-toggle').forEach(el => el.classList.remove('expanded'));
    },

    toggleStrategic: function (skuId, checked) {
        // M2: 商品属性変更
        App.showToast(`[M2] 戦略商品フラグを${checked ? '設定' : '解除'}しました`, 'success');
    },

    updatePrice: function (skuId, price) {
        // M3: 基準売価変更
        App.showToast(`[M3] ${skuId} の売価を ${price}円 に更新しました`, 'info');
    },

    toggleQuantitative: function (skuId, checked) {
        App.showToast(`定量商品フラグを${checked ? '設定' : '解除'}しました`, 'success');
    },

    exportCategory: function () {
        App.showToast('カテゴリデータをエクスポートしました', 'success');
    },

    init: function () {
        // 初期カテゴリを選択状態に
    }
};

window.ProductHierarchy = ProductHierarchy;
