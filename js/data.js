/* ============================================
   販売計画システム - ダミーデータ
   日本の小売業（食品・日用品）を想定
   ============================================ */

// ============================================
// データ自動生成クラス
// ============================================
const DataGenerator = {
    // ランダム値生成（範囲指定）
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

    // ランダムな変動率を適用
    applyVariation: (base, minPercent, maxPercent) => {
        const variation = 1 + (Math.random() * (maxPercent - minPercent) + minPercent) / 100;
        return Math.round(base * variation);
    },

    // 売上データ生成（億円単位で10-15億の範囲）
    generateSales: () => DataGenerator.randomInt(1000000000, 1500000000),

    // 粗利データ生成（売上の20-28%）
    generateGrossProfit: (sales) => Math.round(sales * (0.20 + Math.random() * 0.08)),

    // 廃棄・値下データ生成
    generateShrinkage: (sales) => Math.round(sales * (0.01 + Math.random() * 0.02)), // 廃棄(1-3%)
    generateMarkdown: (sales) => Math.round(sales * (0.03 + Math.random() * 0.05)), // 値下(3-8%)

    // 数量データ生成
    generateQuantity: () => DataGenerator.randomInt(2500000, 3500000),

    // 進捗率生成
    generateProgress: () => DataGenerator.randomInt(65, 95),

    // 月次トレンドデータを動的生成
    generateMonthlyTrend: () => {
        const months = ['4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月'];
        const basePlan = 1100;
        const seasonalFactors = [1.0, 1.05, 1.02, 1.14, 1.18, 1.07, 1.07, 1.11, 1.32, 1.14, 0.95, 1.15];

        return months.slice(0, 10).map((month, i) => {
            const plan = Math.round(basePlan * seasonalFactors[i]);
            const actualVariation = 0.92 + Math.random() * 0.16; // 92%-108%の変動
            const actual = Math.round(plan * actualVariation);
            return { month, plan, actual };
        });
    },

    // 計画vs実績データを動的生成（詳細版）
    generatePlanVsActual: () => {
        const months = ['2025年10月', '2025年11月', '2025年12月', '2026年1月'];
        const baseSales = [1180000000, 1220000000, 1450000000, 1250000000];

        return months.map((month, i) => {
            const salesPlan = baseSales[i];
            const actualVariation = 0.94 + Math.random() * 0.12;
            const salesActual = Math.round(salesPlan * actualVariation);

            // 粗利
            const gpPlan = Math.round(salesPlan * 0.25);
            const gpActual = Math.round(salesActual * (0.24 + Math.random() * 0.02));

            // 廃棄・値下
            const shrinkageActual = DataGenerator.generateShrinkage(salesActual);
            const markdownActual = DataGenerator.generateMarkdown(salesActual);

            return {
                month,
                plan: {
                    sales: salesPlan,
                    quantity: Math.round(salesPlan / 450),
                    grossProfit: gpPlan,
                    grossProfitRate: 25.0
                },
                actual: {
                    sales: salesActual,
                    quantity: Math.round(salesActual / 445),
                    grossProfit: gpActual,
                    grossProfitRate: ((gpActual / salesActual) * 100).toFixed(1),
                    shrinkage: shrinkageActual, // 廃棄金額
                    markdown: markdownActual,   // 値下金額
                    shrinkageQty: Math.round(shrinkageActual / 300),
                    markdownQty: Math.round(markdownActual / 400)
                }
            };
        });
    },

    // カテゴリ別パフォーマンスを動的生成
    generateCategoryPerformance: () => {
        const categories = [
            { category: '食品', subCategories: ['生鮮食品', '加工食品', '飲料'] },
            { category: '日用品', subCategories: ['洗剤・洗浄剤', '衛生用品'] },
            { category: '化粧品・ビューティー', subCategories: ['スキンケア'] }
        ];

        const basePlans = {
            '生鮮食品': 380000000, '加工食品': 280000000, '飲料': 220000000,
            '洗剤・洗浄剤': 120000000, '衛生用品': 95000000, 'スキンケア': 85000000
        };

        return categories.map(cat => ({
            category: cat.category,
            subCategories: cat.subCategories.map(name => {
                const plan = basePlans[name];
                const actualVariation = 0.92 + Math.random() * 0.16;
                const actual = Math.round(plan * actualVariation);
                const sales = actual;
                const gp = Math.round(sales * 0.25);
                const shrinkage = DataGenerator.generateShrinkage(sales);

                return {
                    name,
                    plan,
                    actual,
                    metrics: {
                        sales: sales,
                        grossProfit: gp,
                        grossProfitRate: 25.0,
                        shrinkage: shrinkage,
                        markdown: DataGenerator.generateMarkdown(sales)
                    }
                };
            })
        }));
    },

    // 現在時刻ベースのタイムスタンプ生成
    generateTimestamp: (daysAgo = 0) => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        const hours = DataGenerator.randomInt(9, 18);
        const minutes = DataGenerator.randomInt(0, 59);
        return date.toISOString().split('T')[0] + ` ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    },

    // KPIサマリーデータを動的生成
    generateKpiSummary: () => {
        const currentSales = DataGenerator.generateSales();
        const lastYearSales = DataGenerator.applyVariation(currentSales, -10, -2);
        const targetSales = DataGenerator.applyVariation(currentSales, -3, 5);

        const currentQuantity = DataGenerator.generateQuantity();
        const lastYearQuantity = DataGenerator.applyVariation(currentQuantity, -8, -2);

        return {
            sales: {
                current: currentSales,
                target: targetSales,
                lastYear: lastYearSales,
                label: '売上高',
                unit: '円'
            },
            grossProfit: {
                current: DataGenerator.generateGrossProfit(currentSales),
                target: DataGenerator.generateGrossProfit(targetSales),
                lastYear: DataGenerator.generateGrossProfit(lastYearSales),
                label: '粗利益',
                unit: '円'
            },
            quantity: {
                current: currentQuantity,
                target: DataGenerator.applyVariation(currentQuantity, -2, 5),
                lastYear: lastYearQuantity,
                label: '販売数量',
                unit: '点'
            },
            planProgress: {
                current: DataGenerator.generateProgress(),
                target: 100,
                label: '計画進捗率',
                unit: '%'
            }
        };
    },

    // 全データを再生成
    regenerateAllData: () => {
        AppData.kpiSummary = DataGenerator.generateKpiSummary();
        AppData.monthlyTrend = DataGenerator.generateMonthlyTrend();
        AppData.planVsActual = DataGenerator.generatePlanVsActual();
        AppData.categoryPerformance = DataGenerator.generateCategoryPerformance();
        console.log('📊 ダミーデータを再生成しました:', new Date().toLocaleTimeString());
    }
};

// ============================================
// アプリケーションデータ
// ============================================
const AppData = {
    // 現在のユーザー情報
    currentUser: {
        id: 'U001',
        name: '田中 太郎',
        department: '本部企画部',
        role: 'manager',
        permissions: ['view', 'edit', 'approve']
    },

    // KPI サマリーデータ（初期値 - 後で動的生成される）
    kpiSummary: {
        sales: { current: 1250000000, target: 1200000000, lastYear: 1180000000, label: '売上高', unit: '円' },
        grossProfit: { current: 312500000, target: 300000000, lastYear: 295000000, label: '粗利益', unit: '円' },
        quantity: { current: 2850000, target: 2800000, lastYear: 2720000, label: '販売数量', unit: '点' },
        planProgress: { current: 78, target: 100, label: '計画進捗率', unit: '%' }
    },

    // 月次トレンドデータ（初期値）
    monthlyTrend: [
        { month: '4月', plan: 1100, actual: 1080 },
        { month: '5月', plan: 1155, actual: 1165 },
        { month: '6月', plan: 1122, actual: 1095 },
        { month: '7月', plan: 1254, actual: 1280 },
        { month: '8月', plan: 1298, actual: 1320 },
        { month: '9月', plan: 1177, actual: 1150 },
        { month: '10月', plan: 1177, actual: 1205 },
        { month: '11月', plan: 1221, actual: 1198 },
        { month: '12月', plan: 1452, actual: 1520 },
        { month: '1月', plan: 1254, actual: 1180 }
    ],

    // 計画vs実績データ（初期値）
    planVsActual: [
        { month: '2025年10月', plan: { sales: 1180000000, quantity: 2622222, grossProfit: 295000000 }, actual: { sales: 1205000000, quantity: 2707865, grossProfit: 301250000 } },
        { month: '2025年11月', plan: { sales: 1220000000, quantity: 2711111, grossProfit: 305000000 }, actual: { sales: 1198000000, quantity: 2692135, grossProfit: 299500000 } },
        { month: '2025年12月', plan: { sales: 1450000000, quantity: 3222222, grossProfit: 362500000 }, actual: { sales: 1520000000, quantity: 3415730, grossProfit: 380000000 } },
        { month: '2026年1月', plan: { sales: 1250000000, quantity: 2777778, grossProfit: 312500000 }, actual: { sales: 1180000000, quantity: 2651685, grossProfit: 295000000 } }
    ],

    // カテゴリ別計画実績（初期値）
    categoryPerformance: [
        { category: '食品', subCategories: [{ name: '生鮮食品', plan: 380000000, actual: 395000000 }, { name: '加工食品', plan: 280000000, actual: 265000000 }, { name: '飲料', plan: 220000000, actual: 232000000 }] },
        { category: '日用品', subCategories: [{ name: '洗剤・洗浄剤', plan: 120000000, actual: 118000000 }, { name: '衛生用品', plan: 95000000, actual: 98000000 }] },
        { category: '化粧品・ビューティー', subCategories: [{ name: 'スキンケア', plan: 85000000, actual: 82000000 }] }
    ],

    // 計画ステータス定義
    planStatuses: {
        draft: { label: '下書き', class: 'badge-draft' },
        in_meeting: { label: '販売会議中', class: 'badge-warning' }, // M5
        pending: { label: '申請中', class: 'badge-pending' },
        approved: { label: '承認済', class: 'badge-approved' },
        rejected: { label: '差戻し', class: 'badge-rejected' }
    },

    // 販売計画一覧
    plans: [
        {
            id: 'P2026-001',
            name: '2026年度 年間販売計画',
            type: 'yearly',
            period: '2026年4月〜2027年3月',
            status: 'approved',
            version: 'v3.2',
            lastUpdated: '2026-01-05',
            updatedBy: '田中 太郎',
            salesTarget: 15000000000,
            category: '全カテゴリ'
        },
        {
            id: 'P2026-002',
            name: '2026年1月 月次販売計画',
            type: 'monthly',
            period: '2026年1月',
            status: 'approved',
            version: 'v2.0',
            lastUpdated: '2025-12-20',
            updatedBy: '佐藤 花子',
            salesTarget: 1250000000,
            category: '全カテゴリ'
        },
        {
            id: 'P2026-003',
            name: '2026年2月 月次販売計画',
            type: 'monthly',
            period: '2026年2月',
            status: 'pending',
            version: 'v1.1',
            lastUpdated: '2026-01-07',
            updatedBy: '田中 太郎',
            salesTarget: 1180000000,
            category: '全カテゴリ'
        },
        {
            id: 'P2026-004',
            name: '第1週 週次販売計画（1/6-1/12）',
            type: 'weekly',
            period: '2026年1月6日〜12日',
            status: 'approved',
            version: 'v1.0',
            lastUpdated: '2026-01-03',
            updatedBy: '鈴木 一郎',
            salesTarget: 285000000,
            category: '食品'
        },
        {
            id: 'P2026-005',
            name: '第2週 週次販売計画（1/13-1/19）',
            type: 'weekly',
            period: '2026年1月13日〜19日',
            status: 'draft',
            version: 'v0.3',
            lastUpdated: '2026-01-08',
            updatedBy: '田中 太郎',
            salesTarget: 290000000,
            category: '食品'
        },
        {
            id: 'P2026-006',
            name: '春季特売計画（3月-5月）',
            type: 'seasonal',
            period: '2026年3月〜5月',
            status: 'draft',
            version: 'v0.1',
            lastUpdated: '2026-01-06',
            updatedBy: '高橋 美咲',
            salesTarget: 4200000000,
            category: '日用品'
        }
    ],

    // 詳細商品マスタ（要件定義に基づく）
    productHierarchy: {
        id: 'ALL',
        name: '全商品',
        children: [
            {
                id: 'C01',
                name: '食品',
                children: [
                    {
                        id: 'C01-01',
                        name: '生鮮食品',
                        children: [
                            // 戦略・定常区分, JAN, 原価情報など
                            { id: 'SKU001', jan: '4901234567890', name: '国産牛ロース', cost: 1800, price: 2980, isStrategic: true, strategyType: '戦略', supplier: '国産ミート株式会社', aggVariety: '牛肉' },
                            { id: 'SKU002', jan: '4901234567891', name: '豚バラ肉', cost: 220, price: 398, isStrategic: false, strategyType: '定常', supplier: '国産ミート株式会社', aggVariety: '豚肉' },
                            { id: 'SKU003', jan: '4901234567892', name: '鶏もも肉', cost: 150, price: 298, isStrategic: false, strategyType: '定常', supplier: 'ABCフーズ', aggVariety: '鶏肉' },
                            { id: 'SKU004', jan: '4901234567893', name: '刺身盛り合わせ', cost: 700, price: 1280, isStrategic: true, strategyType: '戦略', supplier: '海洋水産', aggVariety: '鮮魚セット' }
                        ]
                    },
                    {
                        id: 'C01-02',
                        name: '加工食品',
                        children: [
                            { id: 'SKU005', jan: '4901234567894', name: 'カップラーメン 醤油', cost: 98, price: 198, isStrategic: false, strategyType: '定常', supplier: '日清食品', aggVariety: '即席麺' },
                            { id: 'SKU006', jan: '4901234567895', name: 'レトルトカレー', cost: 120, price: 248, isStrategic: false, strategyType: '定常', supplier: 'ハウス食品', aggVariety: 'レトルト' },
                            { id: 'SKU007', jan: '4901234567896', name: '冷凍餃子 12個入', cost: 180, price: 398, isStrategic: true, strategyType: '戦略', supplier: '味の素冷凍食品', aggVariety: '冷凍調理' }
                        ]
                    },
                    {
                        id: 'C01-03',
                        name: '飲料',
                        children: [
                            { id: 'SKU008', jan: '4901234567897', name: '緑茶 500ml', cost: 58, price: 128, isStrategic: false, strategyType: '定常', supplier: '伊藤園', aggVariety: '日本茶' },
                            { id: 'SKU009', jan: '4901234567898', name: 'コーヒー 缶', cost: 65, price: 138, isStrategic: false, strategyType: '定常', supplier: 'サントリー', aggVariety: 'コーヒー' },
                            { id: 'SKU010', jan: '4901234567899', name: 'ビール 350ml 6本パック', cost: 850, price: 1180, isStrategic: true, strategyType: '戦略', supplier: 'キリンビール', aggVariety: 'ビール' }
                        ]
                    }
                ]
            },
            {
                id: 'C02',
                name: '日用品',
                children: [
                    {
                        id: 'C02-01',
                        name: '洗剤・洗浄剤',
                        children: [
                            { id: 'SKU011', jan: '4901234567900', name: '食器用洗剤', cost: 110, price: 198, isStrategic: false, strategyType: '定常', supplier: '花王', aggVariety: '台所洗剤' },
                            { id: 'SKU012', jan: '4901234567901', name: '洗濯洗剤 詰替え', cost: 190, price: 348, isStrategic: true, strategyType: '戦略', supplier: 'P&G', aggVariety: '洗濯洗剤' },
                            { id: 'SKU013', jan: '4901234567902', name: '浴室用洗剤', cost: 150, price: 298, isStrategic: false, strategyType: '定常', supplier: 'ライオン', aggVariety: '住居洗剤' }
                        ]
                    },
                    {
                        id: 'C02-02',
                        name: '衛生用品',
                        children: [
                            { id: 'SKU014', jan: '4901234567903', name: 'ティッシュペーパー 5箱', cost: 250, price: 398, isStrategic: false, strategyType: '定常', supplier: '大王製紙', aggVariety: 'ティッシュ' },
                            { id: 'SKU015', jan: '4901234567904', name: 'トイレットペーパー 12ロール', cost: 300, price: 498, isStrategic: true, strategyType: '戦略', supplier: '日本製紙クレシア', aggVariety: 'トイレットロール' },
                            { id: 'SKU016', jan: '4901234567905', name: 'ウェットティッシュ', cost: 100, price: 198, isStrategic: false, strategyType: '定常', supplier: 'ユニ・チャーム', aggVariety: 'ウェット' }
                        ]
                    }
                ]
            },
            {
                id: 'C03',
                name: '化粧品・ビューティー',
                children: [
                    {
                        id: 'C03-01',
                        name: 'スキンケア',
                        children: [
                            { id: 'SKU017', name: '化粧水 高保湿タイプ', cost: 800, price: 1480, isStrategic: true, strategyType: '戦略', supplier: '資生堂', aggVariety: '基礎化粧品' },
                            { id: 'SKU018', name: '乳液', cost: 700, price: 1280, isStrategic: false, strategyType: '定常', supplier: '花王', aggVariety: '基礎化粧品' }
                        ]
                    }
                ]
            }
        ]
    },

    // エリア・店舗階層（詳細版）
    storeHierarchy: [
        {
            id: 'A01',
            name: '関東エリア',
            type: 'area',
            children: [
                { id: 'S001', name: '新宿店', type: 'store', channel: 'flagship', salesRatio: 12.5, fmtCode: 'FMT-L', department: '第1営業部' },
                { id: 'S002', name: '渋谷店', type: 'store', channel: 'flagship', salesRatio: 10.8, fmtCode: 'FMT-L', department: '第1営業部' },
                { id: 'S003', name: '池袋店', type: 'store', channel: 'standard', salesRatio: 8.5, fmtCode: 'FMT-M', department: '第2営業部' },
                { id: 'S004', name: '横浜店', type: 'store', channel: 'standard', salesRatio: 7.2, fmtCode: 'FMT-M', department: '第2営業部' }
            ]
        },
        {
            id: 'A02',
            name: '関西エリア',
            type: 'area',
            children: [
                { id: 'S005', name: '梅田店', type: 'store', channel: 'flagship', salesRatio: 9.8, fmtCode: 'FMT-L', department: '関西営業部' },
                { id: 'S006', name: '難波店', type: 'store', channel: 'standard', salesRatio: 7.5, fmtCode: 'FMT-M', department: '関西営業部' },
                { id: 'S007', name: '京都店', type: 'store', channel: 'standard', salesRatio: 5.2, fmtCode: 'FMT-S', department: '関西営業部' }
            ]
        },
        {
            id: 'A03',
            name: '中部エリア',
            type: 'area',
            children: [
                { id: 'S008', name: '名古屋店', type: 'store', channel: 'flagship', salesRatio: 8.0, fmtCode: 'FMT-L', department: '中部営業部' },
                { id: 'S009', name: '栄店', type: 'store', channel: 'standard', salesRatio: 5.5, fmtCode: 'FMT-M', department: '中部営業部' }
            ]
        }
    ],

    // チャネル定義（FMTマスタ相当）
    channels: [
        { id: 'flagship', name: '旗艦店(FMT-L)', ratio: 0.45, fmtCode: 'FMT-L' },
        { id: 'standard', name: '標準店(FMT-M)', ratio: 0.35, fmtCode: 'FMT-M' },
        { id: 'small', name: '小型店(FMT-S)', ratio: 0.12, fmtCode: 'FMT-S' },
        { id: 'online', name: 'オンライン', ratio: 0.08, fmtCode: 'FMT-OL' }
    ],

    // 承認待ちワークフロー
    pendingApprovals: [
        {
            id: 'WF001',
            planId: 'P2026-003',
            planName: '2026年2月 月次販売計画',
            requestedBy: '田中 太郎',
            requestedAt: '2026-01-07 14:30',
            status: 'pending',
            currentApprover: '山田 部長',
            comments: '前月比2%減の計画としました。季節要因を考慮しています。'
        },
        {
            id: 'WF002',
            planId: 'P2026-006',
            planName: '春季特売計画（3月-5月）',
            requestedBy: '高橋 美咲',
            requestedAt: '2026-01-06 10:15',
            status: 'pending',
            currentApprover: '山田 部長',
            comments: '春の新生活需要を見込んだ特売計画です。'
        }
    ],

    // 承認履歴
    approvalHistory: [
        {
            id: 'AH001',
            planId: 'P2026-001',
            planName: '2026年度 年間販売計画',
            action: 'approved',
            actionBy: '山田 部長',
            actionAt: '2026-01-05 16:45',
            comments: '承認します。第2四半期の目標を注視してください。'
        },
        {
            id: 'AH002',
            planId: 'P2026-002',
            planName: '2026年1月 月次販売計画',
            action: 'approved',
            actionBy: '山田 部長',
            actionAt: '2025-12-20 11:30',
            comments: 'OK'
        }
    ],

    // テンプレート一覧
    templates: [
        {
            id: 'T001',
            name: '月次計画テンプレート（標準）',
            description: '標準的な月次販売計画のテンプレート',
            type: 'monthly',
            createdBy: '田中 太郎',
            createdAt: '2025-06-15',
            usageCount: 24
        },
        {
            id: 'T002',
            name: '週次計画テンプレート（食品）',
            description: '食品カテゴリ向けの週次計画テンプレート',
            type: 'weekly',
            createdBy: '佐藤 花子',
            createdAt: '2025-08-22',
            usageCount: 52
        },
        {
            id: 'T003',
            name: '年間計画テンプレート',
            description: '年度計画用の包括的テンプレート',
            type: 'yearly',
            createdBy: '田中 太郎',
            createdAt: '2025-03-01',
            usageCount: 3
        },
        {
            id: 'T004',
            name: '特売計画テンプレート',
            description: 'セール・特売期間用のテンプレート',
            type: 'seasonal',
            createdBy: '高橋 美咲',
            createdAt: '2025-09-10',
            usageCount: 8
        }
    ],

    // マスタ連携状況（要件定義に基づく外部システム連携）
    masterDataStatus: {
        negotiationSystem: {
            name: '生鮮商談システム',
            description: '原価/売価マスタ',
            lastSync: '2026-01-08 06:00',
            status: 'synced',
            message: '正常に連携されました'
        },
        masterDB: {
            name: 'マスタDB',
            description: '商品階層/店舗マスタ',
            lastSync: '2026-01-08 06:00',
            status: 'synced',
            message: '正常に連携されました'
        },
        performanceSystem: {
            name: '実績管理システム',
            description: 'POS実績（商品別・店舗別）',
            lastSync: '2026-01-08 09:30',
            status: 'synced',
            message: '前日分の実績取込完了'
        },
        bulkImportSystem: {
            name: '一括取込システム',
            description: '販売計画データ',
            lastSync: '2026-01-07 18:00',
            status: 'warning',
            message: '一部データ形式エラーあり'
        }
    },

    // インポート履歴
    importHistory: [
        {
            id: 'IMP001',
            fileName: '202601_sales_plan.xlsx',
            type: 'Excel',
            uploadedBy: '田中 太郎',
            uploadedAt: '2026-01-07 15:30',
            status: 'success',
            records: 1250
        },
        {
            id: 'IMP002',
            fileName: 'store_targets.csv',
            type: 'CSV',
            uploadedBy: '佐藤 花子',
            uploadedAt: '2026-01-06 10:15',
            status: 'success',
            records: 245
        },
        {
            id: 'IMP003',
            fileName: 'category_plan_draft.xlsx',
            type: 'Excel',
            uploadedBy: '高橋 美咲',
            uploadedAt: '2026-01-05 14:20',
            status: 'error',
            records: 0,
            error: '列形式エラー: E列のデータ型が不正です'
        }
    ]
};

// ヘルパー関数
const Helpers = {
    // 金額フォーマット
    formatCurrency: (value) => {
        if (value >= 100000000) {
            return (value / 100000000).toFixed(1) + '億円';
        } else if (value >= 10000) {
            return (value / 10000).toFixed(0) + '万円';
        }
        return value.toLocaleString() + '円';
    },

    // 数量フォーマット
    formatNumber: (value) => {
        if (value >= 10000) {
            return (value / 10000).toFixed(1) + '万';
        }
        return value.toLocaleString();
    },

    // パーセンテージ計算
    calcPercentChange: (current, previous) => {
        if (previous === 0) return 0;
        return ((current - previous) / previous * 100).toFixed(1);
    },

    // 差異クラス判定
    getDiffClass: (diff) => {
        if (diff > 0) return 'diff-positive';
        if (diff < 0) return 'diff-negative';
        return 'diff-neutral';
    },

    // 日付フォーマット
    formatDate: (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
};

window.DataGenerator = DataGenerator;
window.AppData = AppData;
