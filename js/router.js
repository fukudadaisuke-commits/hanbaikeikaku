/* ============================================
   販売計画システム - ルーター
   SPA風の画面遷移を管理
   ============================================ */

const Router = {
    currentPage: 'dashboard',

    // ルート定義
    routes: {
        'dashboard': {
            title: 'ダッシュボード',
            component: 'Dashboard'
        },
        'plan-list': {
            title: '販売計画一覧',
            component: 'PlanList'
        },
        'plan-edit': {
            title: '計画登録・編集',
            component: 'PlanEdit'
        },
        'product-hierarchy': {
            title: '商品階層別計画',
            component: 'ProductHierarchy'
        },
        'store-area': {
            title: '店舗・エリア別計画',
            component: 'StoreArea'
        },
        'analysis': {
            title: '差異分析',
            component: 'Analysis'
        },
        'approval': {
            title: '承認ワークフロー',
            component: 'Approval'
        },
        'templates': {
            title: 'テンプレート管理',
            component: 'Templates'
        },
        'data-import': {
            title: 'マスタ連携・取込',
            component: 'DataImport'
        }
    },

    // 初期化
    init: function () {
        // ハッシュ変更イベントをリッスン
        window.addEventListener('hashchange', () => this.handleRoute());

        // ナビゲーションリンクにイベントを追加
        document.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                if (page) {
                    this.navigate(page);
                }
            });
        });

        // 初期ルートを処理
        this.handleRoute();
    },

    // ルート処理
    handleRoute: function () {
        const hash = window.location.hash.slice(1) || 'dashboard';
        const route = this.routes[hash];

        if (route) {
            this.currentPage = hash;
            this.updateNavigation();
            this.updatePageTitle(route.title);
            this.loadComponent(route.component);
        } else {
            // 不明なルートはダッシュボードへ
            this.navigate('dashboard');
        }
    },

    // ページ遷移
    navigate: function (page) {
        window.location.hash = page;
    },

    // ナビゲーション更新
    updateNavigation: function () {
        document.querySelectorAll('.nav-item').forEach(link => {
            const page = link.dataset.page;
            if (page === this.currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },

    // ページタイトル更新
    updatePageTitle: function (title) {
        const titleEl = document.getElementById('pageTitle');
        if (titleEl) {
            titleEl.textContent = title;
        }
        document.title = `${title} | SalesPlan Pro`;
    },

    // コンポーネント読み込み
    loadComponent: function (componentName) {
        const contentEl = document.getElementById('pageContent');
        if (!contentEl) return;

        // コンポーネントが存在するか確認
        if (typeof window[componentName] !== 'undefined' && typeof window[componentName].render === 'function') {
            contentEl.innerHTML = window[componentName].render();

            // コンポーネントの初期化処理があれば実行
            if (typeof window[componentName].init === 'function') {
                window[componentName].init();
            }
        } else {
            contentEl.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 8v4M12 16h.01"/>
                    </svg>
                    <h3>ページを読み込み中...</h3>
                    <p>しばらくお待ちください</p>
                </div>
            `;
        }
    }
};

window.Router = Router;
