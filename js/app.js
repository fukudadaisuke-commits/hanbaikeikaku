/* ============================================
   販売計画システム - メインアプリケーション
   ============================================ */

const App = {
    // 初期化
    init: function () {
        console.log('🚀 SalesPlan Pro 初期化開始...');

        try {
            // ダミーデータがあるか確認
            if (typeof AppData === 'undefined') {
                throw new Error('AppData が読み込まれていません');
            }

            // ルーター初期化
            if (typeof Router !== 'undefined') {
                Router.init();
            } else {
                throw new Error('Router が読み込まれていません');
            }

            // サイドバートグル
            this.initSidebarToggle();

            // ドロップダウン初期化
            this.initDropdowns();

            console.log('✅ SalesPlan Pro 初期化完了');
        } catch (error) {
            console.error('❌ 初期化エラー:', error);
            document.getElementById('pageContent').innerHTML = `
                <div class="card" style="margin: 20px; padding: 20px;">
                    <h3 style="color: #dc2626;">初期化エラー</h3>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">再読み込み</button>
                </div>
            `;
        }
    },

    // データ再生成＆画面リフレッシュ
    refreshData: function () {
        if (typeof DataGenerator !== 'undefined') {
            DataGenerator.regenerateAllData();
            Router.loadComponent(Router.routes[Router.currentPage].component);
            this.showToast('データを再生成しました', 'success');
        }
    },

    // サイドバートグル（モバイル対応）
    initSidebarToggle: function () {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');

        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });

            // サイドバー外クリックで閉じる
            document.addEventListener('click', (e) => {
                if (sidebar.classList.contains('open') &&
                    !sidebar.contains(e.target) &&
                    !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            });
        }
    },

    // ドロップダウン初期化
    initDropdowns: function () {
        document.addEventListener('click', (e) => {
            const dropdown = e.target.closest('.dropdown');

            // 他のドロップダウンを閉じる
            document.querySelectorAll('.dropdown.open').forEach(d => {
                if (d !== dropdown) d.classList.remove('open');
            });

            // クリックされたドロップダウンをトグル
            if (dropdown && e.target.closest('.dropdown-toggle')) {
                dropdown.classList.toggle('open');
            }
        });
    },

    // トースト通知表示
    showToast: function (message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button class="btn-icon" onclick="this.parentElement.remove()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;
        container.appendChild(toast);

        // 5秒後に自動削除
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    },

    // モーダル表示
    showModal: function (title, content, actions = []) {
        const container = document.getElementById('modalContainer');
        if (!container) return;

        const actionsHtml = actions.map(a =>
            `<button class="btn ${a.class || 'btn-secondary'}" onclick="${a.onclick}">${a.label}</button>`
        ).join('');

        container.innerHTML = `
            <div class="modal-overlay open" onclick="App.closeModal(event)">
                <div class="modal" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="modal-close" onclick="App.closeModal()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body">${content}</div>
                    ${actionsHtml ? `<div class="modal-footer">${actionsHtml}</div>` : ''}
                </div>
            </div>
        `;
    },

    // モーダル閉じる
    closeModal: function (event) {
        if (event && event.target !== event.currentTarget) return;
        const container = document.getElementById('modalContainer');
        if (container) container.innerHTML = '';
    },

    // 確認ダイアログ
    confirm: function (message, onConfirm) {
        this.showModal('確認', `<p>${message}</p>`, [
            { label: 'キャンセル', class: 'btn-secondary', onclick: 'App.closeModal()' },
            { label: '確認', class: 'btn-primary', onclick: `App.closeModal(); (${onConfirm.toString()})()` }
        ]);
    }
};

window.App = App;

// DOMContentLoaded で初期化
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
