# AI Safety Index

AI 安全性の研究分野、論文、データ、ベンチマーク、公開評価結果を出典付きでつなぐ公開ポータルです。

サイト: https://gabrygao.github.io/ai-safety-index/

[简体中文](README.md) · [English](README.en.md) · 日本語

入口: [研究観測台](https://gabrygao.github.io/ai-safety-index/#watch) · [情報源カタログ](https://gabrygao.github.io/ai-safety-index/#sources) · [論文資料](https://gabrygao.github.io/ai-safety-index/#papers) · [評価ダッシュボード](https://gabrygao.github.io/ai-safety-index/#results) · [研究分野](https://gabrygao.github.io/ai-safety-index/#directions)

## 主な機能

- 過去 72 時間の情報フロー、過去 30 日の分野シグナル、デイリーブリーフ、情報源の状態、JSON/CSV 出力を備えた研究観測台。
- 原資料を確認した 171 件の資料、21 件の参考入口、149 件の過去候補、291 件の結果ファイル検証一覧を備えた情報源カタログ。
- 6 つの研究分野に整理した 490 件の論文記録、データ・ツール、サイト内検索。
- 6 件のベンチマークと、モデル版・テスト設定・原資料を保持した HELM Safety 2024 の過去の評価結果。
- 中国語、英語、日本語、ドイツ語をページ遷移なしで切り替え、現在の絞り込み条件を保持。
- provenance、`status.json`、更新スクリプト、検証スクリプト、GitHub Actions テンプレート。

自動収集したニュース項目は公開メタデータのみで、確認待ちとして明示します。収録は内容への支持を意味しません。

## ローカル実行

```bash
python3 -m http.server 8765
```

`http://localhost:8765/` を開きます。静的サイトのためビルドは不要です。

## 更新と検証

```bash
python3 tools/update-news.py
node tools/build-status.mjs
node tools/verify-framework.mjs
node tools/verify-results.mjs
node tools/verify-compact.mjs
node tools/verify-locales.mjs
node tools/verify-watch.mjs
node tools/verify-sources.mjs
python3 -m unittest discover -s tools -p 'test_update_news.py'
```

稼働中のリポジトリワークフローは `.github/workflows/update-ai-safety-index.yml` です。同じ内容のサイト内テンプレートを `deployment/github-pages-update-news.yml` に保持しています。

## データの範囲

観測台は設定済みの公開フィードと編集部選定資料を対象とし、網羅的なニュース監視ではありません。171 件にはベンチマーク、データセット、ツール、環境、報告、結果入口が含まれ、171 件の正式ベンチマークを意味しません。2,696 件の結果行は 10 プロジェクトの接続サンプルであり、ベンチマーク横断ランキングではありません。再配布権が未確認の証拠・結果スナップショットは複製していません。
