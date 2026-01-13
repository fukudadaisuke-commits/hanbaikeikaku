# データモデル設計書

本ドキュメントは、販売計画システムのデータ構造とエンティティ関係（ER図）を定義します。

## 1. 概念ER図 (Mermaid)

```mermaid
erDiagram
    %% --- マスタデータ ---

    %% 商品階層
    CATEGORY ||--|{ SUB_CATEGORY : contains
    SUB_CATEGORY ||--|{ PRODUCT : contains
    
    %% 店舗階層
    AREA ||--|{ STORE : contains
    CHANNEL ||--|{ STORE : classifies

    %% --- トランザクションデータ ---

    %% 販売計画
    SALES_PLAN ||--|{ PLAN_DETAIL : has
    
    %% 計画明細は商品またはカテゴリに紐づく
    PLAN_DETAIL }|--|| PRODUCT : targets_sku
    PLAN_DETAIL }|--|| SUB_CATEGORY : targets_subcategory

    %% 実績データ
    ACTUAL_PERFORMANCE }|--|| PRODUCT : reference
    ACTUAL_PERFORMANCE }|--|| STORE : reference

    %% --- エンティティ定義 ---

    PRODUCT {
        string id PK "商品ID/SKU"
        string jan "JANコード"
        string name "商品名"
        int cost "原価"
        int price "売価"
        boolean isStrategic "戦略商品フラグ"
        string strategyType "戦略/定常区分"
        string supplier "仕入先"
        string aggVariety "みなし品種"
    }

    CATEGORY {
        string id PK "カテゴリID"
        string name "カテゴリ名 (例: 食品)"
    }

    SUB_CATEGORY {
        string id PK "サブカテゴリID"
        string name "サブカテゴリ名 (例: 生鮮食品)"
        string parent_id FK
    }

    STORE {
        string id PK "店舗ID"
        string name "店舗名"
        string fmtCode "FMTコード (L/M/S)"
        string department "管轄部門"
        float salesRatio "売上構成比"
    }

    AREA {
        string id PK "エリアID"
        string name "エリア名 (例: 関東)"
    }

    CHANNEL {
        string id PK "チャネルID"
        string name "チャネル名"
        string fmtCode "FMTコード"
    }

    SALES_PLAN {
        string id PK "計画ID"
        string name "計画名"
        string type "計画種別 (yearly/monthly/weekly)"
        string period "対象期間"
        string status "ステータス (draft/pending/approved)"
        string version "バージョン"
        string updatedBy "最終更新者"
    }

    PLAN_DETAIL {
        string planId FK
        string targetId FK "商品IDまたはカテゴリID"
        int sales "計画売上"
        int quantity "計画数量"
        int grossProfit "計画粗利"
    }

    ACTUAL_PERFORMANCE {
        date date "年月/日付"
        string productId FK
        string storeId FK
        int sales "売上実績"
        int quantity "数量実績"
        int grossProfit "粗利実績"
        int shrinkage "廃棄金額"
        int shrinkageQty "廃棄数量"
        int markdown "値下金額"
        int markdownQty "値下数量"
    }
```

## 2. 外部システム連携

システムは以下の外部システムよりデータを取得・同期します。

| システム名 | データ種別 | 連携方向 | 頻度 |
|---|---|---|---|
| **生鮮商談システム** | 原価・売価マスタ | 受信 | 日次 |
| **マスタDB** | 商品階層・店舗マスタ | 受信 | 日次 |
| **実績管理システム** | POS売上・粗利・廃棄・値下 | 受信 | 日次/リアルタイム |
| **一括取込システム** | 外部作成計画データ(Excel/CSV) | 受信 | 随時 |

## 3. データディクショナリ (主なフィールド)

### 商品マスタ (Product)
*   **戦略/定常区分 (`strategyType`)**: 商品が戦略的に売り込む対象か、定番として補充する対象かを区別します。
*   **みなし品種 (`aggVariety`)**: 生鮮品の集計単位（例：牛肉、豚肉）。

### 実績データ (ActualPerformance)
*   **廃棄 (`shrinkage`)**: 商品の廃棄損耗金額。
*   **値下 (`markdown`)**: 売価変更による値下金額。
*   **粗利 (`grossProfit`)**: `売上 - 原価` で算出される利益額。

### 店舗マスタ (Store)
*   **FMTコード (`fmtCode`)**: 店舗の規模や業態を表すフォーマットコード (例: FMT-L=旗艦店)。
