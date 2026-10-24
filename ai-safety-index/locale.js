/* Offline UI translations. Bibliographic titles, author names, URLs and filter values remain source data. */
var SiteLocale = (() => {
'use strict';
const languages=['zh','en','ja','de'];
const rows=`
来源目录|Source catalog|情報源カタログ|Quellenkatalog
AI 安全数据来源目录|AI safety source catalog|AI 安全データ情報源カタログ|Quellenkatalog für KI-Sicherheitsdaten
把基准、数据集、工具、环境、结果入口与核验证据分开记录，先回答资料从哪里来，再讨论能否比较。|Records benchmarks, datasets, tools, environments, result entry points and verification evidence separately. Establish provenance before comparing results.|ベンチマーク、データセット、ツール、環境、結果入口、検証証拠を分けて記録し、比較の前に出典を明確にします。|Erfasst Benchmarks, Datensätze, Tools, Umgebungen, Ergebniseinstiege und Prüfbelege getrennt. Vor Vergleichen wird zuerst die Herkunft geklärt.
打开离线浏览器|Open offline browser|オフライン閲覧版を開く|Offline-Browser öffnen
已核验资源|Reviewed resources|確認済み資料|Geprüfte Ressourcen
参考入口|Reference portals|参照ポータル|Referenzportale
历史候选|Historical candidates|過去の候補|Historische Kandidaten
结果文件清单|Result-file manifest|結果ファイル一覧|Ergebnisdatei-Verzeichnis
资源目录|Resource catalog|資料カタログ|Ressourcenkatalog
公开数据包|Public data package|公開データパッケージ|Öffentliches Datenpaket
来源目录栏目|Source catalog sections|情報源カタログの項目|Bereiche des Quellenkatalogs
来源目录统计|Source catalog statistics|情報源カタログ統計|Statistik des Quellenkatalogs
搜索来源|Search sources|情報源を検索|Quellen durchsuchen
名称、主题、指标或备注|Name, topic, metric or note|名称・分野・指標・注記|Name, Thema, Metrik oder Notiz
结果形态|Result availability|Ergebnisform|Ergebnisform
全部形态|All result types|すべての結果形式|Alle Ergebnisformen
目录优先级|Catalog priority|カタログ優先度|Katalogpriorität
全部优先级|All priorities|すべての優先度|Alle Prioritäten
搜索当前范围内的评测资源|Search evaluation resources in this scope|この範囲の評価資料を検索|Evaluationsressourcen in diesem Bereich durchsuchen
按目录优先级|Catalog priority|カタログ優先度順|Nach Katalogpriorität
来源目录 · 按研究方向筛选|Source catalog · Filtered by research topic|情報源カタログ・研究分野で絞り込み|Quellenkatalog · Nach Forschungsbereich gefiltert
目录记录|Catalog record|カタログ記録|Katalogeintrag
没有符合条件的评测资源|No evaluation resources match the filters|条件に一致する評価資料はありません|Keine Evaluationsressourcen entsprechen den Filtern
调整关键词、结果形态或子方向后重试。|Adjust the query, result availability or subtopic and try again.|キーワード、結果形式、下位分野を変更してください。|Suchbegriff, Ergebnisform oder Unterthema anpassen und erneut versuchen.
项符合当前条件|match the current filters|件が現在の条件に一致|entsprechen den aktuellen Filtern
评测或用途|Evaluation or purpose|評価または用途|Evaluation oder Zweck
接入说明|Integration notes|接続メモ|Integrationshinweise
结果入口|Result source|結果入口|Ergebnisquelle
数据条件与许可|Data conditions and licensing|データ条件とライセンス|Datenbedingungen und Lizenzierung
公开元数据|Public metadata|公開メタデータ|Öffentliche Metadaten
受限访问|Restricted access|アクセス制限あり|Eingeschränkter Zugriff
核验证据|Verification evidence|検証証拠|Prüfbeleg
没有符合条件的来源|No sources match the filters|条件に一致する情報源はありません|Keine Quellen entsprechen den Filtern
调整关键词或筛选条件后重试。|Adjust the query or filters and try again.|キーワードまたは絞り込み条件を変更してください。|Suchbegriff oder Filter anpassen und erneut versuchen.
公开索引与研究接入文件|Public indexes and research integration files|公開索引と研究接続ファイル|Öffentliche Indizes und Forschungsdateien
公开的是目录、摘要、结果接入样例和文件校验清单。许可未确认的网页证据与结果快照不在本站镜像，请从记录中的原始 URL 获取。|The site publishes catalogs, summaries, result-integration samples and checksum manifests. Web evidence and result snapshots with unconfirmed redistribution rights are not mirrored; use the original URLs in each record.|公開するのはカタログ、要約、結果接続サンプル、検証用一覧です。再配布権が未確認のウェブ証拠と結果スナップショットは複製せず、各記録の原 URL を使用してください。|Veröffentlicht werden Kataloge, Zusammenfassungen, Integrationsbeispiele und Prüfsummenlisten. Webbelege und Ergebnis-Snapshots mit ungeklärten Weitergaberechten werden nicht gespiegelt; bitte die Original-URLs verwenden.
使用边界|Usage boundaries|利用上の境界|Nutzungsgrenzen
171 项包含基准、数据集、工具、环境、报告与结果入口，不等于 171 个正式安全基准。|The 171 items include benchmarks, datasets, tools, environments, reports and result entry points; they are not 171 formal safety benchmarks.|171 件にはベンチマーク、データセット、ツール、環境、報告、結果入口が含まれ、171 件の正式な安全ベンチマークを意味しません。|Die 171 Einträge umfassen Benchmarks, Datensätze, Tools, Umgebungen, Berichte und Ergebniseinstiege; sie sind keine 171 formalen Sicherheitsbenchmarks.
2696 条指标是 10 个项目的接入样例，不提供跨基准总分或当前模型排名。|The 2,696 metrics are integration samples from 10 projects, not an overall cross-benchmark score or current model ranking.|2,696 件の指標は 10 プロジェクトの接続サンプルであり、ベンチマーク横断の総合点や現在のモデル順位ではありません。|Die 2.696 Metriken sind Integrationsbeispiele aus 10 Projekten und keine benchmarkübergreifende Gesamtwertung oder aktuelle Modellrangliste.
历史候选来自已停止更新的目录，未逐项重新核验；正式收录前仍需检查版本、许可与原始证据。|Historical candidates come from a discontinued directory and were not rechecked item by item; verify versions, licenses and original evidence before formal inclusion.|過去の候補は更新停止済みのカタログに由来し、個別の再確認は行っていません。正式収録前に版、ライセンス、原証拠を確認してください。|Historische Kandidaten stammen aus einem eingestellten Verzeichnis und wurden nicht einzeln erneut geprüft. Vor formaler Aufnahme sind Version, Lizenz und Originalbelege zu prüfen.
结果比较必须保留基准版本、任务、模型快照、框架、防护、预算与评分器。|Result comparisons must preserve benchmark version, task, model snapshot, framework, safeguards, budget and evaluator.|結果比較では、ベンチマーク版、タスク、モデルスナップショット、フレームワーク、防護、予算、評価器を保持する必要があります。|Ergebnisvergleiche müssen Benchmark-Version, Aufgabe, Modell-Snapshot, Framework, Schutzmaßnahmen, Budget und Bewerter beibehalten.
目录核验日期：|Catalog review date:\u00a0|カタログ確認日：|Prüfdatum des Katalogs:\u00a0
未知值保持为空，抓取日期不视为测试日期，历史成绩不标记为最新排名。|Unknown values remain blank. Retrieval dates are not test dates, and historical results are not labeled as current rankings.|不明値は空欄のままにします。取得日はテスト日ではなく、過去の成績を最新順位として表示しません。|Unbekannte Werte bleiben leer. Abrufdaten sind keine Testdaten, und historische Ergebnisse werden nicht als aktuelle Rangliste bezeichnet.
论文/图表|Paper or figure|論文・図表|Publikation oder Abbildung
公开榜单|Public leaderboard|公開リーダーボード|Öffentliche Rangliste
待核验|Pending verification|確認待ち|Prüfung ausstehend
工具/环境|Tool or environment|ツール・環境|Tool oder Umgebung
已下载结果|Downloaded results|取得済み結果|Heruntergeladene Ergebnisse
公开结果文件|Public result file|公開結果ファイル|Öffentliche Ergebnisdatei
已下载原始输出|Downloaded raw output|取得済み生出力|Heruntergeladene Rohausgabe
P1 看板|P1 dashboard|P1 ダッシュボード|P1 Dashboard
P1 目录|P1 catalog|P1 カタログ|P1 Katalog
P2 扩展|P2 expansion|P2 拡張|P2 Erweiterung
P3 辅助|P3 supporting|P3 補助|P3 Ergänzend
离线来源浏览器|Offline source browser|オフライン情報源ブラウザー|Offline-Quellenbrowser
包含资源、入口与历史候选的独立筛选页面|Standalone filtering page for resources, portals and historical candidates|資料・入口・過去候補を検索できる独立ページ|Eigenständige Filterseite für Ressourcen, Portale und historische Kandidaten
六大方向来源清单 CSV|Six-topic source list CSV|6 分野の情報源一覧 CSV|Quellenliste der sechs Themen als CSV
171 项资源的表格版本|Tabular version of the 171 resources|171 件の資料の表形式版|Tabellarische Fassung der 171 Ressourcen
结构化来源目录 JSON|Structured source catalog JSON|構造化情報源カタログ JSON|Strukturierter Quellenkatalog als JSON
资源、数据入口、许可备注与核验记录|Resources, data entry points, license notes and review records|資料・データ入口・ライセンス注記・確認記録|Ressourcen, Dateneinstiege, Lizenzhinweise und Prüfprotokolle
入口与参考网站 CSV|Portals and reference sites CSV|入口・参考サイト CSV|Portale und Referenzseiten als CSV
21 个聚合入口、知识库与参考站|21 aggregators, knowledge bases and reference sites|21 件の集約入口・知識ベース・参考サイト|21 Aggregatoren, Wissensbasen und Referenzseiten
历史候选线索 CSV|Historical candidate leads CSV|過去候補の手掛かり CSV|Historische Kandidatenhinweise als CSV
149 项未逐项重核的历史目录线索|149 historical directory leads not rechecked item by item|個別再確認していない 149 件の過去カタログ候補|149 historische Verzeichnishinweise ohne Einzelprüfung
结果接入清单 CSV|Result integration list CSV|結果接続一覧 CSV|Liste der Ergebnisintegration als CSV
21 个结果获取路径与访问状态|21 result retrieval paths and access states|21 件の結果取得経路とアクセス状態|21 Abrufpfade und Zugriffsstatus für Ergebnisse
评测结果样例 CSV|Evaluation result samples CSV|評価結果サンプル CSV|Beispiele für Evaluationsergebnisse als CSV
2696 条接入样例；不是跨基准排名|2,696 integration samples; not a cross-benchmark ranking|2,696 件の接続サンプル。ベンチマーク横断順位ではありません|2.696 Integrationsbeispiele; keine benchmarkübergreifende Rangliste
评测结果样例 JSON|Evaluation result samples JSON|評価結果サンプル JSON|Beispiele für Evaluationsergebnisse als JSON
与 CSV 对应的结构化接入样例|Structured integration samples matching the CSV|CSV に対応する構造化接続サンプル|Strukturierte Integrationsbeispiele passend zur CSV
评测结果汇总 JSON|Evaluation result summary JSON|評価結果要約 JSON|Zusammenfassung der Evaluationsergebnisse als JSON
按项目与结果形态整理的汇总信息|Summary grouped by project and result form|プロジェクトと結果形式別の要約|Nach Projekt und Ergebnisform gruppierte Zusammenfassung
结果文件清单 JSON|Result-file manifest JSON|結果ファイル一覧 JSON|Ergebnisdatei-Verzeichnis als JSON
291 份研究快照的原始 URL 与 SHA-256|Original URLs and SHA-256 hashes for 291 research snapshots|291 件の研究スナップショットの原 URL と SHA-256|Original-URLs und SHA-256 für 291 Forschungs-Snapshots
汇总统计 JSON|Summary statistics JSON|集計統計 JSON|Zusammenfassende Statistik als JSON
资源、方向、状态与文件数量|Counts by resource, topic, state and file|資料・分野・状態・ファイル数|Anzahl nach Ressource, Thema, Status und Datei
原始资料包说明|Original package notes|元資料パッケージ説明|Hinweise zum Originalpaket
资料包内容、使用要点与核验边界|Package contents, usage notes and review boundaries|パッケージ内容、利用要点、確認範囲|Paketinhalt, Nutzungshinweise und Prüfgrenzen
公开包说明|Public package notes|公開パッケージ説明|Hinweise zum öffentlichen Paket
已发布文件与未镜像快照的边界说明|Boundary between published files and snapshots not mirrored here|公開ファイルと未複製スナップショットの境界説明|Abgrenzung zwischen veröffentlichten Dateien und nicht gespiegelten Snapshots
动态观察台|Research observatory|研究観測台|Forschungsbeobachtung
最近发生了什么？|What happened recently?|最近の動き|Was ist zuletzt passiert?
从公开来源、研究方向和复核状态进入最新 AI 安全动态。|Enter the latest AI safety updates through public sources, research topics and review status.|公開情報源、研究分野、確認状況から最新の AI 安全動向を確認できます。|Aktuelle Entwicklungen zur KI-Sicherheit nach öffentlichen Quellen, Forschungsthemen und Prüfstatus erkunden.
近 72 小时记录|Records in the last 72 hours|過去 72 時間の資料|Einträge der letzten 72 Stunden
当前主要信号|Leading current signal|現在の主要シグナル|Aktuell stärkstes Signal
打开动态观察台|Open research observatory|研究観測台を開く|Forschungsbeobachtung öffnen
暂无主题信号|No topic signal yet|分野シグナルはまだありません|Noch kein Themensignal
AI 安全动态观察台|AI safety research observatory|AI 安全性リサーチ観測台|Beobachtungsstelle für KI-Sicherheit
把公开资讯、研究方向与来源状态放在同一视图中，快速判断最近发生了什么，并回到原文核对。|See public updates, research topics and source health in one view, understand recent activity, and verify it at the original source.|公開情報・研究分野・情報源の状態を一つの画面で確認し、最近の動きを把握して原文で検証できます。|Öffentliche Meldungen, Forschungsthemen und Quellenstatus in einer Ansicht erfassen und an der Originalquelle prüfen.
当前记录|Current records|現在の資料|Aktuelle Einträge
近 72 小时|Last 72 hours|過去 72 時間|Letzte 72 Stunden
人工精选|Editorial picks|編集部選定|Redaktionell ausgewählt
待复核采集|Collected, pending review|収集済み・確認待ち|Erfasst, Prüfung ausstehend
搜索动态|Search updates|動向を検索|Aktualisierungen suchen
搜索标题、来源或安全议题|Search titles, sources or safety topics|題名・情報源・安全分野を検索|Titel, Quellen oder Sicherheitsthemen suchen
收录方式|Collection method|収録方法|Erfassungsart
全部记录|All records|すべての資料|Alle Einträge
自动采集|Automated collection|自動収集|Automatisch erfasst
筛选|Filter|絞り込む|Filtern
资料更新流程|Resource update workflow|資料更新フロー|Aktualisierungsablauf
公开来源|Public sources|公開情報源|Öffentliche Quellen
元数据筛选|Metadata filtering|メタデータ選別|Metadatenfilterung
研究方向关联|Topic linking|研究分野との関連付け|Themenzuordnung
人工复核|Human review|人による確認|Manuelle Prüfung
来源更新正常|Sources updated successfully|情報源の更新は正常です|Quellen erfolgreich aktualisiert
部分来源更新失败|Some sources failed to update|一部の情報源を更新できませんでした|Einige Quellen konnten nicht aktualisiert werden
使用最近一次成功快照|Using the latest successful snapshot|直近の成功スナップショットを使用|Letzten erfolgreichen Datenstand verwenden
近 72 小时信息流|Updates from the last 72 hours|過去 72 時間の情報フロー|Meldungen der letzten 72 Stunden
按公开来源发布日期排列；自动条目仍需人工复核。|Ordered by publisher date; automated records still require human review.|公開元の発表日順です。自動収集項目は引き続き確認が必要です。|Nach Veröffentlichungsdatum sortiert; automatisch erfasste Einträge müssen noch geprüft werden.
查看全部|View all|すべて見る|Alle ansehen
近期主题信号|Recent topic signals|最近の分野シグナル|Aktuelle Themensignale
按近 30 日记录的研究方向聚合，不代表风险排名。|Grouped by research topic across the last 30 days; this is not a risk ranking.|過去 30 日の研究分野別の集計であり、リスク順位ではありません。|Nach Forschungsthemen der letzten 30 Tage gruppiert; keine Risikorangliste.
每日研究简报|Daily research brief|デイリー研究ブリーフ|Tägliches Forschungsbriefing
同一天的最新记录放在一起，保留原始标题与来源。|Groups the latest records from the same day while preserving original titles and sources.|同日の最新資料をまとめ、原題と情報源を保持します。|Fasst die neuesten Einträge eines Tages zusammen und bewahrt Originaltitel und Quellen.
最新发布日期|Latest publication date|最新の発表日|Letztes Veröffentlichungsdatum
来源与数据状态|Source and data status|情報源とデータの状態|Quellen- und Datenstatus
抓取失败时保留上一次成功快照，不把缺失误写为零。|Keeps the last successful snapshot after a fetch failure instead of reporting missing data as zero.|取得に失敗した場合は直近の成功スナップショットを保持し、欠落をゼロとして扱いません。|Behält bei Abruffehlern den letzten erfolgreichen Datenstand, statt fehlende Daten als null auszugeben.
最近抓取成功|Latest fetch succeeded|直近の取得に成功|Letzter Abruf erfolgreich
抓取失败，保留旧记录|Fetch failed; previous records retained|取得失敗・以前の資料を保持|Abruf fehlgeschlagen; vorherige Einträge beibehalten
导出 JSON|Export JSON|JSON を出力|JSON exportieren
查看来源记录|View provenance|出典記録を見る|Quellennachweis ansehen
当前筛选没有可用记录。|No records match the current filters.|現在の条件に一致する資料はありません。|Keine Einträge entsprechen den aktuellen Filtern.
当前筛选在近 72 小时内没有记录。|No records match the current filters in the last 72 hours.|現在の条件では過去 72 時間の資料がありません。|Keine passenden Einträge in den letzten 72 Stunden.
当前筛选没有主题信号。|No topic signals match the current filters.|現在の条件に一致する分野シグナルはありません。|Keine Themensignale entsprechen den aktuellen Filtern.
其他安全议题|Other safety topics|その他の安全分野|Weitere Sicherheitsthemen
当前仅覆盖已配置的公开来源和人工精选记录，不构成完整新闻监测，也不代表平台认可相关主张。|Coverage is limited to configured public sources and editorial picks. It is not comprehensive news monitoring and does not imply endorsement.|対象は設定済みの公開情報源と編集部選定資料に限られます。網羅的なニュース監視ではなく、内容への支持を意味しません。|Die Abdeckung ist auf konfigurierte öffentliche Quellen und redaktionelle Auswahl begrenzt; sie ist weder vollständig noch eine Billigung der Aussagen.
同一模型，不同测试设置|One model, different test settings|同じモデル、異なるテスト設定|Ein Modell, verschiedene Testeinstellungen
两种设置的分数对比|Score comparison across two settings|2 つの設定のスコア比較|Wertevergleich zwischen zwei Einstellungen
测试设置如何影响结果|How test settings affect results|テスト設定が結果に与える影響|Wie Testeinstellungen die Ergebnisse beeinflussen
相同模型版本与指标，对照两种设置下的分数。|The same model versions and metric, compared across two settings.|同じモデルのバージョンと指標で、2 つの設定のスコアを比較。|Gleiche Modellversionen und Metrik, verglichen unter zwei Einstellungen.
查看数值|View values|数値を見る|Werte anzeigen
精选评测与研究推荐|Selected evaluations and research picks|注目の評価と研究|Ausgewählte Evaluationen und Forschung
研究资讯、解读与成果分享。|Research news, commentary and shared work.|研究ニュース・解説・成果共有。|Forschungsnachrichten, Beiträge und geteilte Ergebnisse.
查看全部|View all|すべて見る|Alle ansehen
评价指标|Evaluation metric|評価指標|Evaluationsmetrik
2024 年历史结果示例|Historical results example · 2024|2024 年の過去の評価例|Historische Beispielergebnisse · 2024
高效查找 AI 安全论文、数据、工具与评测结果。|Find AI safety papers, data, tools and evaluation results efficiently.|AI 安全性の論文・データ・ツール・評価結果を効率よく探す。|Publikationen, Daten, Tools und Evaluationen zur KI-Sicherheit schnell finden.
精选评测|Selected evaluation|注目の評価|Ausgewählte Evaluation
本期推荐|Featured research|今回のおすすめ|Aktuelle Empfehlungen
展示 3 / 9 个模型 · 原报告分数 × 100|Showing 3 of 9 models · Source score × 100|9 モデル中 3 件を表示・原報告のスコア × 100|3 von 9 Modellen · Originalwert × 100
查看完整评测|Open full evaluation|評価全体を見る|Vollständige Evaluation öffnen
评测看板|Evaluation dashboard|評価ダッシュボード|Evaluationsdashboard
评测栏目|Evaluation sections|評価メニュー|Evaluationsbereiche
方法与说明|Methods & guidance|手法と説明|Methoden & Hinweise
六大研究方向|Six research topics|6 つの研究分野|Sechs Forschungsthemen
研究分享|Research sharing|研究の共有|Forschung teilen
近期更新|Recent updates|最近の更新|Neueste Änderungen
资源收录|Resource added|資料収録|Ressource aufgenommen
新闻发布|News published|ニュース公開|Nachricht veröffentlicht
关于平台|About the platform|プラットフォームについて|Über die Plattform
平台更新记录|Platform changelog|プラットフォームの更新履歴|Änderungsprotokoll
完整更新记录|Full changelog|更新履歴をすべて表示|Vollständiges Protokoll
487 条论文元数据已收录，保留原始来源与方向标签。|487 bibliography records imported with original sources and topic tags.|原典と分野タグを保持し、487 件の論文書誌情報を収録。|487 Publikationseinträge mit Originalquellen und Themen-Tags aufgenommen.
OpenTAI 论文目录|OpenTAI paper catalog|OpenTAI 論文目録|OpenTAI-Publikationsverzeichnis
连接研究方向、论文、数据与评测依据，帮助研究者高效找到可追溯的资料，也让团队与社区的优秀研究更容易被发现。|Connect topics, papers, data and evaluation evidence so researchers can find traceable resources and discover work from teams and the wider community.|研究分野・論文・データ・評価の根拠をつなぎ、出典をたどれる資料とチームやコミュニティの研究を見つけやすくします。|Themen, Publikationen, Daten und Evaluationsbelege verbinden, um nachvollziehbare Ressourcen und Forschung aus Teams und der Community leichter zu finden.
按主题查找论文、数据、工具、基准与研究解读。|Find papers, data, tools, benchmarks and research commentary by topic.|分野から論文・データ・ツール・ベンチマーク・研究解説を探す。|Publikationen, Daten, Tools, Benchmarks und Forschungsbeiträge nach Thema finden.
全部主题|All subtopics|すべてのトピック|Alle Unterthemen
数据与工具|Data & tools|データとツール|Daten & Tools
基准与结果|Benchmarks & results|ベンチマークと結果|Benchmarks & Ergebnisse
相关解读|Related commentary|関連する解説|Verwandte Beiträge
方向定义与评价边界|Topic definitions & evaluation limits|分野の定義と評価の限界|Themendefinitionen & Evaluationsgrenzen
已收录基准，暂无结果|Benchmark listed; no results recorded|ベンチマークは収録済み・結果は未登録|Benchmark aufgenommen; noch keine Ergebnisse
选择展示模型|Choose displayed models|表示するモデルを選ぶ|Angezeigte Modelle auswählen
复制筛选链接|Copy filtered link|絞り込みリンクをコピー|Gefilterten Link kopieren
筛选链接已复制。|Filtered link copied.|絞り込みリンクをコピーしました。|Gefilterter Link kopiert.
请复制浏览器地址栏中的链接。|Copy the link from your browser's address bar.|ブラウザーのアドレス欄のリンクをコピーしてください。|Bitte den Link aus der Adressleiste kopieren.
平台创建、建设与维护成员。|People building and maintaining the platform.|プラットフォームの構築・運営メンバー。|Mitglieder, die die Plattform aufbauen und pflegen.
成员研究方向、平台职责及个人主页，将在资料确认后补充。|Research interests, platform responsibilities and personal pages will be added once confirmed.|研究分野・担当・個人ページは確認後に追加します。|Forschungsgebiete, Aufgaben und persönliche Seiten werden nach Bestätigung ergänzt.
最新资讯|Latest news|最新ニュース|Neueste Meldungen
研究解读|Research commentary|研究解説|Forschungsbeiträge
成果分享|Research showcases|研究成果の共有|Forschungsergebnisse teilen
目录核验|Catalog reviewed|カタログ確認|Katalog geprüft
来源目录 · |Source catalog · |情報源カタログ・|Quellenkatalog ·
成果条目来自人工整理与来源目录；结果状态表示资料可访问性，不代表可以跨基准比较。|Showcase entries come from editorial curation and the source catalog. Result availability describes access, not cross-benchmark comparability.|成果項目は編集整理と情報源カタログに基づきます。結果の状態はアクセス可能性を示し、ベンチマーク間の比較可能性を意味しません。|Die Einträge stammen aus redaktioneller Auswahl und dem Quellenkatalog. Der Ergebnisstatus beschreibt die Zugänglichkeit, nicht die Vergleichbarkeit zwischen Benchmarks.
年份|Year|年|Jahr
全部年份|All years|すべての年|Alle Jahre
此栏目暂无已发布内容|No published content in this section|この項目にはまだ公開内容がありません|In diesem Bereich sind noch keine Inhalte veröffentlicht
正式内容发布后会在这里显示。|Content will appear here after publication.|内容は公開後にここへ表示されます。|Inhalte erscheinen hier nach der Veröffentlichung.
自动采集条目仅包含来源元数据，方向与内容仍待复核。|Automatically collected items contain source metadata only; their topics and content await review.|自動収集項目は出典のメタデータのみで、分野と内容は確認待ちです。|Automatisch erfasste Einträge enthalten nur Quellenmetadaten; Themen und Inhalte sind noch zu prüfen.
没有找到匹配内容|No matching content found|一致する内容がありません|Keine passenden Inhalte gefunden
试试更简短的关键词，或切换内容类型。|Try a shorter query or another content type.|短いキーワードか別の種類で検索してください。|Einen kürzeren Suchbegriff oder einen anderen Inhaltstyp versuchen.
搜索论文、作者、主题、工具或成员|Search papers, authors, topics, tools or people|論文・著者・分野・ツール・メンバーを検索|Publikationen, Autoren, Themen, Tools oder Mitglieder suchen
搜索论文、作者、主题、工具、来源或成员|Search papers, authors, topics, tools, sources or people|論文・著者・分野・ツール・情報源・メンバーを検索|Publikationen, Autoren, Themen, Tools, Quellen oder Mitglieder suchen
返回评测看板|Back to evaluation dashboard|評価ダッシュボードへ戻る|Zurück zum Evaluationsdashboard
提交渠道未接通，目前只能下载草稿，尚不能正式提交。|Submission is not connected yet. You can download a draft, but cannot submit it for review.|受付先はまだ接続されていません。下書きは保存できますが、正式な提出はできません。|Der Empfangskanal ist noch nicht verbunden. Ein Entwurf kann heruntergeladen, aber noch nicht zur Prüfung eingereicht werden.
提交类型|Contribution purpose|提出の目的|Zweck des Beitrags
补充资源|Add a resource|資料の追加|Ressource ergänzen
推荐成果|Recommend research|研究成果を推薦|Forschung vorschlagen
资源或成果名称|Resource or research title|資料・研究成果の名称|Titel der Ressource oder Forschung
作者或团队|Authors or team|著者・チーム|Autoren oder Team
说明或推荐理由|Description or recommendation|説明・推薦理由|Beschreibung oder Empfehlungsgrund
评测结果依据|Evaluation evidence|評価結果の根拠|Evaluationsbelege
联系邮箱（选填，不公开）|Email (optional, kept private)|メール（任意・非公開）|E-Mail (optional, nicht öffentlich)
接收渠道由项目负责人确认后开放。审核通过前不会公开内容或联系方式。|Submission opens after the project confirms its receiver. Content and contact information will not be published before review.|受付先の確認後に提出を受け付けます。審査前に内容や連絡先が公開されることはありません。|Die Einreichung wird nach Bestätigung des Empfangskanals freigeschaltet. Inhalte und Kontaktdaten werden vor der Prüfung nicht veröffentlicht.
提交待审核|Submit for review|審査へ提出|Zur Prüfung einreichen
正在提交…|Submitting…|送信中…|Wird eingereicht…
已提交，待审核。|Submitted; awaiting review.|提出済み・審査待ちです。|Eingereicht; Prüfung ausstehend.
提交失败，输入已保留，请稍后重试。|Submission failed. Your input is preserved; please try again.|送信に失敗しました。入力は保持されています。もう一度お試しください。|Einreichung fehlgeschlagen. Die Eingaben bleiben erhalten; bitte erneut versuchen.
左右滑动查看完整表格。|Swipe sideways to see the full table.|横にスクロールして表全体を表示できます。|Seitlich scrollen, um die vollständige Tabelle zu sehen.
2024 年公开历史结果，不代表当前模型排名。|Published historical results from 2024; not a current model ranking.|2024 年の公開結果です。現在のモデル順位を示すものではありません。|Veröffentlichte historische Ergebnisse von 2024; keine aktuelle Modellrangliste.
找到需要的|Find the|必要な|Die passende
AI 安全研究。|AI safety research you need.|AI 安全性の研究を見つける。|KI-Sicherheitsforschung finden.
论文、数据、基准与评测，一站查找。|One place to find papers, data, benchmarks and results.|論文・データ・ベンチマーク・評価結果をまとめて探す。|Publikationen, Daten, Benchmarks und Ergebnisse an einem Ort finden.
搜索论文、基准、数据或工具|Search papers, benchmarks, data or tools|論文・ベンチマーク・データ・ツールを検索|Publikationen, Benchmarks, Daten oder Tools suchen
常用入口|Quick access|よく使う項目|Schnellzugriff
研究推荐|Research picks|注目の研究|Forschungsempfehlungen
浏览全部论文|Browse all papers|すべての論文を見る|Alle Publikationen ansehen
项目与代码|Project & code|プロジェクト・コード|Projekt & Code
让更多人看到你的研究。|Help your research reach more people.|あなたの研究を、より多くの人へ。|Mehr Menschen für Ihre Forschung erreichen.
提供论文、项目或数据的公开链接与研究简介，供推荐栏目整理。|Share a public link and a short introduction to your paper, project or dataset for consideration in research picks.|論文・プロジェクト・データの公開リンクと紹介文を、研究紹介の候補として共有してください。|Öffentlichen Link und Kurzbeschreibung zu Publikation, Projekt oder Datensatz für die Forschungsempfehlungen vorschlagen.
模型表现|Model performance|モデルの評価結果|Modellleistung
无害性分数（0–100）· 越高越好|Harmlessness score (0–100) · Higher is better|無害性スコア（0–100）・高いほど良い|Unschädlichkeitswert (0–100) · Höher ist besser
模型结果柱状图|Model results bar chart|モデル評価の棒グラフ|Balkendiagramm der Modellergebnisse
模型结果明细|Model result details|モデル評価の詳細|Modellergebnisse im Detail
图表将原报告的 0–1 分数乘以 100；不表示模型总体安全程度。|Chart values equal the source's 0–1 scores multiplied by 100; they do not measure overall model safety.|原報告の 0–1 スコアを 100 倍して表示しています。モデル全体の安全性を示すものではありません。|Die Werte entsprechen den Originalwerten von 0–1 mal 100; sie messen nicht die Gesamtsicherheit eines Modells.
分数（0–100）|Score (0–100)|スコア（0–100）|Wert (0–100)
导出 CSV|Export CSV|CSV を出力|CSV exportieren
筛选模型|Filter models|モデルを絞り込む|Modelle filtern
搜索模型名称或版本|Search model name or version|モデル名・バージョンを検索|Modellname oder Version suchen
研发机构|Model developer|開発組織|Modellentwickler
全部机构|All developers|すべての開発組織|Alle Entwickler
查看结果|View result|結果を見る|Ergebnis ansehen
没有匹配的模型|No matching models|一致するモデルがありません|Keine passenden Modelle
调整模型名称或研发机构，查看已收录结果。|Change the model search or developer filter to see recorded results.|モデル名や開発組織の条件を変更して、登録済みの結果をご覧ください。|Modellsuche oder Entwicklerfilter ändern, um erfasste Ergebnisse anzuzeigen.
清除筛选|Clear filters|絞り込みを解除|Filter zurücksetzen
资源信息|Resource details|資料情報|Angaben zur Ressource
下载资源草稿|Download resource draft|資料の下書きをダウンロード|Ressourcenentwurf herunterladen
资源草稿已生成，请保存文件。内容尚未发送。|Your resource draft is ready. Save the file; it has not been sent.|資料の下書きを作成しました。保存してください。内容はまだ送信されていません。|Ihr Ressourcenentwurf ist fertig. Bitte speichern Sie die Datei; der Inhalt wurde noch nicht gesendet.
论文资料|Papers|論文資料|Publikationen
研究方向|Research topics|研究分野|Themen
基准与评测|Benchmarks & results|ベンチマークと評価|Benchmarks & Ergebnisse
研究热点|Highlights|研究トピックス|Aktuelles
关于我们|About|私たちについて|Über uns
首页|Home|ホーム|Startseite
AI 安全研究与评测|AI safety research & evaluation|AI 安全性の研究と評価|Forschung & Evaluation zur KI-Sicherheit
跳到主要内容|Skip to main content|本文へ移動|Zum Hauptinhalt
主导航|Main navigation|メインナビゲーション|Hauptnavigation
全站搜索|Search the site|サイト内検索|Website durchsuchen
检索资料|Find resources|資料を検索|Ressourcen suchen
提交资源|Suggest a resource|資料を提案|Ressource vorschlagen
打开导航|Open navigation|ナビゲーションを開く|Navigation öffnen
关闭导航|Close navigation|ナビゲーションを閉じる|Navigation schließen
语言|Language|言語|Sprache
探索研究|Explore research|研究を探す|Forschung entdecken
六大研究方向|Six research topics|6 つの研究分野|Sechs Forschungsthemen
数据与任务|Data & tasks|データとタスク|Daten & Aufgaben
评测与实践|Evaluation & practice|評価と実践|Evaluation & Praxis
评测基准|Benchmarks|評価ベンチマーク|Benchmarks
公开结果|Published results|公開評価結果|Veröffentlichte Ergebnisse
方法与工具|Methods & tools|手法とツール|Methoden & Werkzeuge
收录与比较原则|Inclusion & comparison policy|収録・比較の方針|Aufnahme- & Vergleichsregeln
关于 Index|About Index|Index について|Über Index
平台与建设团队|Platform & contributors|プラットフォームと運営チーム|Plattform & Mitwirkende
提交资料建议|Suggest a resource|資料を提案|Ressource vorschlagen
页面与资料说明|Site & resource notes|サイトと資料について|Website- & Quellenhinweise
原型使用说明|Prototype guide|プロトタイプの使い方|Prototyp-Leitfaden
研究资料原型|Research resource prototype|研究資料のプロトタイプ|Prototyp für Forschungsressourcen
热点人工精选 · 评测保留来源版本|Curated highlights · Versioned evaluation sources|トピックスは手動選定・評価には出典と版を記載|Redaktionelle Auswahl · Versionierte Evaluationsquellen
AI 安全领域的研究、评测与原始资料。|Research, evaluations and primary sources on AI safety.|AI 安全性に関する研究・評価・一次資料。|Forschung, Evaluationen und Primärquellen zur KI-Sicherheit.
从具体问题出发，理解安全边界。|Start with a question. Understand the limits of safety.|具体的な問いから、安全性の限界を考える。|Von konkreten Fragen zu den Grenzen der Sicherheit.
研究与评测门户|Research & evaluation portal|研究・評価ポータル|Portal für Forschung & Evaluation
数据与隐私安全|Data & privacy security|データ・プライバシー保護|Daten- & Datenschutzsicherheit
基础模型安全|Foundation model safety|基盤モデルの安全性|Sicherheit von Basismodellen
智能体与 AI 软件系统安全|Agent & AI software system safety|エージェント・AI ソフトウェアの安全性|Sicherheit von Agenten & KI-Software
物理 AI 安全|Physical AI safety|フィジカル AI の安全性|Sicherheit physischer KI
人机交互与社会安全|Human–AI interaction & societal safety|人間と AI の対話・社会的安全性|Mensch-KI-Interaktion & gesellschaftliche Sicherheit
AI+X 与 AI4Science 安全|AI+X & AI4Science safety|AI+X・AI4Science の安全性|Sicherheit von AI+X & AI4Science
全部方向|All topics|すべての分野|Alle Themen
全部内容|All content|すべてのコンテンツ|Alle Inhalte
全部对象|All systems|すべての対象|Alle Systeme
研究与综述|Research & surveys|研究論文とサーベイ|Forschung & Übersichten
研究论文|Research paper|研究論文|Forschungsarbeit
综述|Survey|サーベイ|Übersichtsarbeit
文献类型|Publication type|文献の種類|Publikationstyp
搜索|Search|検索|Suchen
上一页|Previous|前へ|Zurück
下一页|Next|次へ|Weiter
来源记录|Source records|出典記録|Quellennachweise
论文目录参考|Bibliography adapted from|論文目録の参照元：|Literaturverzeichnis nach
整理 ·| · Compiled ·|を参照して整理・| · Zusammengestellt ·
导入 ·|imported ·|取り込み・|importiert ·
年份由新到旧|Newest year first|年の新しい順|Neueste Jahre zuerst
搜索题名、作者、研究主题或年份|Search titles, authors, topics or years|題名・著者・研究テーマ・年で検索|Titel, Autoren, Themen oder Jahre suchen
搜索数据集、任务环境或资料库|Search datasets, task environments or repositories|データセット・タスク環境・資料庫を検索|Datensätze, Aufgabenumgebungen oder Sammlungen suchen
按方向筛选资料，切换论文与数据时保留范围。|Filter by topic; keep the same scope when switching between papers and data.|分野で絞り込み、論文とデータを切り替えても対象を維持します。|Nach Thema filtern; der Bereich bleibt beim Wechsel zwischen Publikationen und Daten erhalten.
条目链接到原始论文，研究方向由本站整理。目录收录不代表实验已复现。|Entries link to original papers. Topic tags are assigned by this site. Inclusion does not imply reproduced experiments.|各項目は原論文にリンクします。分野タグは当サイトで整理しており、収録は実験の再現を意味しません。|Einträge verlinken Originalarbeiten. Themen ordnet diese Website zu. Die Aufnahme bedeutet keine Reproduktion der Experimente.
数据集、任务环境和风险资料库分别标注类型；下载、许可与使用条件以原始发布方为准。|Datasets, task environments and risk repositories are labeled separately. Check the original publisher for downloads, licenses and terms.|データセット・タスク環境・リスク資料庫を区別して表示します。ダウンロード・ライセンス・利用条件は公開元をご確認ください。|Datensätze, Aufgabenumgebungen und Risikosammlungen sind getrennt gekennzeichnet. Downloads, Lizenzen und Bedingungen gelten laut Originalquelle.
论文原文|Original paper|原論文|Originalarbeit
数据与文档|Data & documentation|データとドキュメント|Daten & Dokumentation
OpenTAI 目录|OpenTAI bibliography|OpenTAI 論文目録|OpenTAI-Literaturverzeichnis
arXiv 预印本|arXiv preprint|arXiv プレプリント|arXiv-Preprint
查看关联基准|Related benchmark|関連ベンチマーク|Zugehöriger Benchmark
资料分页|Resource pages|資料のページ送り|Seitennavigation
清除筛选|Clear filters|絞り込みを解除|Filter zurücksetzen
试试其他关键词，或清除搜索和文献类型筛选。|Try another keyword or clear the search and publication-type filters.|別のキーワードを試すか、検索と文献種類の条件を解除してください。|Anderes Suchwort versuchen oder Such- und Publikationstypfilter zurücksetzen.
返回方向概览|Back to topic overview|分野の概要へ戻る|Zur Themenübersicht
查看完整列表|View full list|全件表示|Vollständige Liste
这个方向保留研究问题与候选资源，正式资料确认后再加入目录。|Research questions and candidate resources remain here; confirmed resources will be added to the catalog.|研究課題と候補資料を掲載しています。確認後に正式な目録へ追加します。|Forschungsfragen und Quellenkandidaten bleiben hier; bestätigte Ressourcen werden ins Verzeichnis aufgenommen.
方向概览|Topic overview|分野の概要|Themenübersicht
论文|Papers|論文|Publikationen
数据与资料|Data & resources|データと資料|Daten & Ressourcen
数据|Data|データ|Daten
基准|Benchmarks|ベンチマーク|Benchmarks
评测结果|Results|評価結果|Ergebnisse
方向概览 → 论文 / 数据 / 基准 / 结果|Topic overview → papers / data / benchmarks / results|分野の概要 → 論文 / データ / ベンチマーク / 結果|Themenübersicht → Publikationen / Daten / Benchmarks / Ergebnisse
切换方向|Change topic|分野を切り替える|Thema wechseln
专题内容|Topic content|分野の内容|Themeninhalte
概览与资料|Overview & resources|概要と資料|Übersicht & Ressourcen
关联方向|Related topics|関連分野|Verwandte Themen
关联研究方向|Related research topics|関連する研究分野|Verwandte Forschungsthemen
全部论文|All papers|すべての論文|Alle Publikationen
全部数据|All data|すべてのデータ|Alle Daten
查看基准|View benchmarks|ベンチマークを見る|Benchmarks ansehen
查看公开结果|View published results|公開結果を見る|Veröffentlichte Ergebnisse ansehen
阅读相关论文|Read related papers|関連論文を読む|Zugehörige Arbeiten lesen
找到数据与任务|Find data & tasks|データとタスクを探す|Daten & Aufgaben finden
查看报告与指南|Reports & guides|報告書とガイド|Berichte & Leitfäden
查看拟议范围|View proposed scope|提案中の範囲を見る|Vorgeschlagenen Umfang ansehen
查看方向专题|Explore topic|分野の詳細を見る|Thema erkunden
查看全部基准|All benchmarks|すべてのベンチマーク|Alle Benchmarks
浏览基准目录|Browse benchmarks|ベンチマーク目録を見る|Benchmarks durchsuchen
基准目录|Benchmark catalog|ベンチマーク目録|Benchmark-Verzeichnis
全部热点|All highlights|すべてのトピックス|Alle Meldungen
关键词|Keywords|キーワード|Suchbegriffe
内容类型|Content type|コンテンツの種類|Inhaltstyp
按来源发布日期排序|By source publication date|出典の公開日順|Nach Veröffentlichungsdatum
人工精选 · 按来源发布日期排列|Curated · Ordered by source date|手動選定・出典の公開日順|Redaktionelle Auswahl · Nach Quelldatum
人工精选值得关注的论文、项目与报告；按研究方向和关键词筛选。|Curated papers, projects and reports; filter by topic and keyword.|注目すべき論文・プロジェクト・報告を手動選定。分野やキーワードで絞り込めます。|Ausgewählte Arbeiten, Projekte und Berichte; nach Thema und Suchwort filtern.
人工精选，保留来源发布日期；较早内容作为资料归档。方向标签用于关联专题，不代表六份独立的热点列表。|Manually curated with source dates. Older items are archived. Topic tags connect items to research areas, rather than separate news feeds.|出典の公開日を残して手動で選定し、古い項目は資料として保管します。タグは分野への関連付けに使い、分野別に独立したニュース一覧は作りません。|Manuell ausgewählt mit Quelldatum. Ältere Beiträge bleiben im Archiv. Themen-Tags verknüpfen Beiträge mit Forschungsbereichen statt separater Nachrichtenlisten.
当前筛选下暂无已录入动态|No highlights match these filters|この条件に一致するトピックスはありません|Keine Meldungen für diese Filter
打开动态列表|Open highlights|トピックス一覧を開く|Meldungen öffnen
打开原始来源|Open original source|原典を開く|Originalquelle öffnen
原始资料|Primary source|一次資料|Primärquelle
原始来源|Original source|原典|Originalquelle
历史资料|Archive|過去の資料|Archiv
评测方法|Evaluation method|評価手法|Evaluationsmethode
数据与工具|Data & tools|データとツール|Daten & Werkzeuge
论文与项目|Papers & projects|論文とプロジェクト|Arbeiten & Projekte
评测工具发布|Evaluation tool release|評価ツールの公開|Veröffentlichung eines Evaluationswerkzeugs
行为安全报告|Behavioral safety report|行動の安全性に関する報告|Bericht zur Verhaltenssicherheit
评测报告|Evaluation report|評価報告|Evaluationsbericht
报告与指南|Reports & guides|報告書とガイド|Berichte & Leitfäden
查找资料|Find resources|資料を探す|Ressourcen finden
带着问题，查找资料。|Find evidence for your questions.|問いから、資料を探す。|Quellen für konkrete Fragen finden.
研究方向、论文、基准与数据。|Topics, papers, benchmarks and data.|研究分野・論文・ベンチマーク・データ。|Themen, Arbeiten, Benchmarks und Daten.
搜索基准、资料与研究方向|Search benchmarks, resources and topics|ベンチマーク・資料・研究分野を検索|Benchmarks, Ressourcen und Themen suchen
搜索当前范围内的基准|Search benchmarks in this scope|現在の範囲のベンチマークを検索|Benchmarks in diesem Bereich suchen
搜索论文、项目或报告|Search papers, projects or reports|論文・プロジェクト・報告を検索|Arbeiten, Projekte oder Berichte suchen
输入名称或关键词…|Enter a name or keyword…|名称またはキーワードを入力…|Name oder Suchwort eingeben…
输入名称或关键词，例如 AgentDojo|Enter a name or keyword, e.g. AgentDojo|名称・キーワードを入力（例：AgentDojo）|Name oder Suchwort eingeben, z. B. AgentDojo
试试基准名称、研究方向或更简短的关键词。|Try a benchmark name, topic or shorter keyword.|ベンチマーク名、分野名、短いキーワードでお試しください。|Benchmark-Namen, Thema oder kürzeres Suchwort versuchen.
关闭弹窗|Close dialog|ダイアログを閉じる|Dialog schließen
清空|Clear|クリア|Leeren
并排比较|Compare side by side|並べて比較|Nebeneinander vergleichen
对比|Compare|比較|Vergleichen
同协议比较|Compare within protocol|同一プロトコルで比較|Vergleich im selben Protokoll
阅读评测结果|Read evaluation results|評価結果を読む|Evaluationsergebnisse lesen
核对结果条件|Check evaluation conditions|評価条件を確認|Evaluationsbedingungen prüfen
如何阅读结果|How to read results|結果の読み方|Ergebnisse verstehen
选择评测基准|Choose a benchmark|ベンチマークを選ぶ|Benchmark auswählen
指标|Metric|指標|Metrik
结果顺序|Result order|結果の並び順|Ergebnisreihenfolge
排序|Sort|並び替え|Sortierung
分数由高到低|Score: high to low|スコアの高い順|Wert: absteigend
分数由低到高|Score: low to high|スコアの低い順|Wert: aufsteigend
名称 A–Z|Name A–Z|名前 A–Z|Name A–Z
无害性分数|Harmlessness score|無害性スコア|Unbedenklichkeitswert
同一指标|Same metric|同一指標|Gleiche Metrik
模型与版本|Model & version|モデルとバージョン|Modell & Version
任务与设置|Task & configuration|タスクと設定|Aufgabe & Konfiguration
版本|Version|バージョン|Version
任务|Task|タスク|Aufgabe
来源|Source|出典|Quelle
记录版本|Recorded version|記録された版|Erfasste Version
来源日期|Source date|出典の日付|Quelldatum
采集时间|Collected on|収集日|Erfassungsdatum
报告日期|Report date|報告日|Berichtsdatum
原始报告|Original report|原報告|Originalbericht
查看原始证据|View original evidence|原資料を確認|Originalbelege ansehen
完整提示词和来源记录|Full prompts & source records|完全なプロンプトと出典記録|Vollständige Prompts & Quellen
来源收录|Source indexed|出典を収録|Quelle erfasst
来源收录 · 示例|Source indexed · Example|出典収録・例示|Quelle erfasst · Beispiel
资料复核|Source verification|資料の確認|Quellenprüfung
实验复现|Experiment reproduction|実験の再現|Experimentelle Reproduktion
未进行|Not performed|未実施|Nicht durchgeführt
未记录|Not recorded|未記録|Nicht erfasst
待录入|Not yet entered|未登録|Noch nicht erfasst
尚无已录入设置|No configuration recorded|設定は未登録|Keine Konfiguration erfasst
动态文档|Living documentation|随時更新の文書|Laufende Dokumentation
动态资源|Living resource|随時更新の資料|Laufende Ressource
默认设置|Default configuration|既定の設定|Standardkonfiguration
历史报告|Historical report|過去の報告|Historischer Bericht
论文版本|Paper version|論文の版|Publikationsversion
作者团队|authors|著者チーム|Autorenteam
项目文档|documentation|プロジェクト文書|Projektdokumentation
原型未接入采集|Collection is not connected in this prototype|プロトタイプでは収集未接続|Erfassung im Prototyp nicht angebunden
评测对象|System evaluated|評価対象|Evaluiertes System
输入模态|Input modality|入力モダリティ|Eingabemodalität
文本与工具|Text & tools|テキストとツール|Text & Werkzeuge
图像与文本|Images & text|画像とテキスト|Bild & Text
文本|Text|テキスト|Text
语言模型|Language model|言語モデル|Sprachmodell
多模态模型|Multimodal model|マルチモーダルモデル|Multimodales Modell
驾驶仿真|Driving simulation|運転シミュレーション|Fahrsimulation
基准 / 报告|Benchmark / report|ベンチマーク / 報告|Benchmark / Bericht
这个基准评估什么|What this benchmark evaluates|このベンチマークの評価対象|Was dieser Benchmark evaluiert
条目信息|Entry details|項目の詳細|Eintragsdetails
许可信息|License|ライセンス|Lizenz
待核对原始许可|Original license pending verification|原ライセンスの確認待ち|Originallizenz noch zu prüfen
原始链接|Original link|原リンク|Originallink
查看基准资料|Benchmark resources|ベンチマークの資料|Benchmark-Ressourcen
当前范围暂无已录入基准|No benchmarks recorded in this scope|この範囲のベンチマークは未登録|Keine Benchmarks für diesen Bereich erfasst
这个方向尚无已录入评测结果|No results recorded for this topic|この分野の評価結果は未登録|Keine Evaluationsergebnisse für dieses Thema erfasst
这里保留真实空态。基准已收录与评测成绩已录入是两件事。|This is an actual empty state. Listing a benchmark does not mean its results have been entered.|未登録の状態をそのまま表示しています。ベンチマークの収録と評価結果の登録は別です。|Dieser Bereich ist tatsächlich leer. Ein erfasster Benchmark bedeutet noch keine eingetragenen Ergebnisse.
未找到这个页面|Page not found|ページが見つかりません|Seite nicht gefunden
可以返回首页，或打开评测基准目录。|Return home or browse the benchmark catalog.|ホームへ戻るか、ベンチマーク目録をご覧ください。|Zur Startseite oder zum Benchmark-Verzeichnis wechseln.
返回首页|Back home|ホームへ戻る|Zur Startseite
返回门户|Back to portal|ポータルへ戻る|Zurück zum Portal
自动更新评测概览|Automatically updated evaluation overview|自動更新される評価概要|Automatisch aktualisierte Evaluationsübersicht
已接入的公开评测结果|Integrated public evaluation results|収録済みの公開評価結果|Eingebundene öffentliche Evaluationsergebnisse
一眼看懂|Understand at a glance|ひと目でわかる|Auf einen Blick verstehen
AI 安全测评。|AI safety evaluations.|AI 安全性評価。|KI-Sicherheitsevaluationen.
先看同一条件下的直观对比，再进入论文、数据与完整结果。|Start with a direct comparison under identical conditions, then open the papers, data and complete results.|同じ条件での直感的な比較を確認してから、論文・データ・全結果へ進みます。|Zuerst ein direkter Vergleich unter gleichen Bedingungen, danach Publikationen, Daten und vollständige Ergebnisse.
完整评测|Full evaluations|全評価|Vollständige Evaluationen
先看一张能读懂的测评图。|Start with an evaluation chart anyone can read.|まず、読みやすい評価グラフから。|Zuerst ein verständliches Evaluationsdiagramm.
打开完整评测|Open full evaluation|全評価を開く|Vollständige Evaluation öffnen
选择首页评测基准|Choose the homepage benchmark|トップページのベンチマークを選ぶ|Benchmark für die Startseite auswählen
个公开基准| public benchmarks| 件の公開ベンチマーク| öffentliche Benchmarks
安全与任务成功要分开看|Read safety and task success separately|安全性とタスク成功率は分けて読む|Sicherheit und Aufgabenerfolg getrennt lesen
攻击会怎样改变 Agent 表现|How attacks change agent performance|攻撃が Agent の性能をどう変えるか|Wie Angriffe die Agent-Leistung verändern
无害回答比例与程度并不相同|Harmless response rate and degree are different|無害回答の割合と程度は同じではない|Anteil und Ausmaß harmloser Antworten sind verschieden
金融越狱攻击成功率对比|Financial jailbreak attack success rates|金融ジェイルブレイク攻撃成功率の比較|Erfolgsraten finanzieller Jailbreak-Angriffe
读图结论|What the chart shows|グラフの要点|Aussage des Diagramms
成功率最高，不等于最安全。|The highest success rate is not necessarily the safest.|成功率が最高でも、最も安全とは限りません。|Die höchste Erfolgsrate bedeutet nicht die höchste Sicherheit.
能完成任务，不代表能抵抗提示注入。|Completing tasks does not imply resistance to prompt injection.|タスクを完了できても、プロンプトインジェクションに強いとは限りません。|Aufgaben zu lösen bedeutet nicht, Prompt-Injection abzuwehren.
两项无害性指标不能合成一个总分。|The two harmlessness metrics cannot be combined into one score.|2 つの無害性指標を 1 つの総合点にはできません。|Die beiden Unbedenklichkeitsmetriken lassen sich nicht zu einer Gesamtnote verbinden.
攻击成功率越低，代表防护表现越好。|A lower attack success rate indicates better protection.|攻撃成功率が低いほど、防御性能が高いことを示します。|Eine niedrigere Angriffserfolgsrate zeigt besseren Schutz.
安全率|Safety rate|安全率|Sicherheitsrate
任务成功率|Task success rate|タスク成功率|Aufgabenerfolgsrate
受攻击效用|Utility under attack|攻撃下の有用性|Nutzen unter Angriff
定向攻击成功率|Targeted attack success rate|標的型攻撃成功率|Erfolgsrate gezielter Angriffe
无害回答比例|Harmless response rate|無害回答率|Anteil harmloser Antworten
无害程度|Harmlessness score|無害度|Unbedenklichkeitswert
攻击成功率|Attack success rate|攻撃成功率|Angriffserfolgsrate
查看官方来源|View official source|公式情報源を見る|Offizielle Quelle öffnen
这里只比较同一基准、同一任务和同一配置。不同基准不能横向合成“总安全分”。|This view compares only the same benchmark, task and configuration. Different benchmarks cannot be combined into an overall safety score.|同じベンチマーク・タスク・設定だけを比較します。異なるベンチマークを横断した「総合安全スコア」にはできません。|Diese Ansicht vergleicht nur denselben Benchmark, dieselbe Aufgabe und Konfiguration. Verschiedene Benchmarks dürfen nicht zu einer Gesamtsicherheitsnote kombiniert werden.
近期研究|Recent research|最近の研究|Aktuelle Forschung
从结论回到证据。|Trace conclusions back to evidence.|結論から根拠へ戻る。|Von der Aussage zurück zum Beleg.
每张图都保留基准、任务、配置、报告日期与官方来源。需要深入时，再进入完整表格、论文和数据资料。|Every chart keeps the benchmark, task, configuration, report date and official source. Open the full tables, papers and data when more detail is needed.|各グラフにはベンチマーク、タスク、設定、報告日、公式情報源を残しています。詳細が必要な場合は、全表・論文・データを確認できます。|Jedes Diagramm bewahrt Benchmark, Aufgabe, Konfiguration, Berichtsdatum und offizielle Quelle. Für Details stehen vollständige Tabellen, Publikationen und Daten bereit.
先看测评结论，再按需要进入研究资料。|Start with evaluation findings, then open research materials as needed.|まず評価結果を確認し、必要に応じて研究資料へ進みます。|Zuerst Evaluationsergebnisse ansehen, dann bei Bedarf Forschungsmaterialien öffnen.
条指标| metrics| 件の指標| Metriken
个模型条目| model entries| 件のモデル項目| Modelleinträge
个模型| models| モデル| Modelle
不计算跨基准总分|No cross-benchmark aggregate score|ベンチマーク横断の総合点は算出しません|Keine benchmarkübergreifende Gesamtpunktzahl
任务|Task|タスク|Aufgabe
运行配置|Run configuration|実行設定|Laufkonfiguration
评价指标|Metric|評価指標|Metrik
结果顺序|Result order|結果の並び順|Ergebnisreihenfolge
按指标表现|Best metric performance first|指標の成績順|Nach Metrikleistung
反向排序|Reverse order|逆順|Umgekehrte Reihenfolge
官方页面已同步|Official page synchronized|公式ページと同期済み|Offizielle Seite synchronisiert
显示上次成功快照|Showing the last successful snapshot|前回成功時のスナップショットを表示|Letzten erfolgreichen Stand anzeigen
查看官方项目|View official project|公式プロジェクトを見る|Offizielles Projekt öffnen
筛选模型|Filter models|モデルを絞り込む|Modelle filtern
搜索模型或提供方|Search models or providers|モデルまたは提供元を検索|Modelle oder Anbieter suchen
条同协议记录| records under the same protocol| 件の同一プロトコル記録| Einträge mit gleichem Protokoll
越高越好|Higher is better|高いほど良い|Höher ist besser
越低越好|Lower is better|低いほど良い|Niedriger ist besser
双指标对照|Paired metric comparison|2 指標の比較|Vergleich zweier Metriken
分别读取两项指标，不合成为单一分数。|Read both metrics separately; they are not combined into one score.|2 つの指標を別々に読み、単一の点数には統合しません。|Beide Metriken werden getrennt gelesen und nicht zu einer Punktzahl kombiniert.
任务表现矩阵|Task performance matrix|タスク別成績マトリクス|Leistungsmatrix nach Aufgabe
结果明细|Result records|結果の詳細|Ergebnisdetails
导出当前 CSV|Export current CSV|現在の CSV を書き出す|Aktuelle CSV exportieren
每一行保留任务、配置、报告日期和官方来源。左右滑动查看完整表格。|Each row keeps the task, configuration, report date and official source. Scroll horizontally to view the full table.|各行にタスク・設定・報告日・公式情報源を保持します。横にスクロールして表全体を確認できます。|Jede Zeile enthält Aufgabe, Konfiguration, Berichtsdatum und offizielle Quelle. Horizontal scrollen, um die ganze Tabelle zu sehen.
结果仅对应当前基准、任务和配置。不同基准的指标定义、数据分布与评判器不同，本站不生成跨基准“总安全分”。|Results apply only to the selected benchmark, task and configuration. Metric definitions, data distributions and judges differ across benchmarks; this site does not create an aggregate safety score.|結果は選択中のベンチマーク・タスク・設定にのみ対応します。指標定義・データ分布・評価器が異なるため、ベンチマーク横断の「総合安全点」は作りません。|Die Ergebnisse gelten nur für den gewählten Benchmark, die Aufgabe und Konfiguration. Metriken, Datenverteilungen und Bewerter unterscheiden sich; die Website bildet keine Gesamt-Sicherheitsnote.
官方结果|Official results|公式結果|Offizielle Ergebnisse
未标注|Not specified|未記載|Nicht angegeben
官方结果页|Official results page|公式結果ページ|Offizielle Ergebnisseite
官方排行榜|Official leaderboard|公式ランキング|Offizielle Rangliste
官方 README 结果表|Official README results table|公式 README の結果表|Offizielle Ergebnistabelle im README
机器人与视觉语言动作|Robotics and vision-language-action|ロボット・視覚言語行動|Robotik und Vision-Language-Action
中英文文本|Chinese and English text|中国語・英語テキスト|Chinesischer und englischer Text
Utility 与 Utility under attack 越高越好；Targeted ASR 越低越好。只比较相同攻击与防御配置。|Higher Utility and Utility under attack are better; lower Targeted ASR is better. Compare only identical attack and defense configurations.|Utility と攻撃下 Utility は高いほど良く、Targeted ASR は低いほど良い。同じ攻撃・防御設定だけを比較します。|Utility und Utility under attack sind höher besser; Targeted ASR ist niedriger besser. Nur identische Angriffs- und Abwehrkonfigurationen vergleichen.
Safety 与 SR 越高越好；SBU 与 VSI 越低越好。不同套件分别比较。|Higher Safety and SR are better; lower SBU and VSI are better. Compare suites separately.|Safety と SR は高いほど良く、SBU と VSI は低いほど良い。スイートごとに比較します。|Safety und SR sind höher besser; SBU und VSI niedriger besser. Suiten getrennt vergleichen.
Harmless rate 与 Harmless score 越高越好；按同一维度和同一指标比较。|Higher Harmless rate and Harmless score are better; compare the same dimension and metric.|Harmless rate と Harmless score は高いほど良く、同じ次元・指標で比較します。|Harmless rate und Harmless score sind höher besser; gleiche Dimension und Metrik vergleichen.
ASR 越低越好；攻击方法、语言与风险领域必须保持一致。|Lower ASR is better; keep the attack method, language and risk domain identical.|ASR は低いほど良く、攻撃手法・言語・リスク領域をそろえます。|Niedriger ASR ist besser; Angriffsmethode, Sprache und Risikobereich müssen übereinstimmen.
`;
const dictionary=new Map();
function addRows(table){for(const line of table.trim().split('\n')){const [zh,en,ja,de]=line.split('|');if(zh&&en&&ja&&de)dictionary.set(zh,{en,ja,de});else throw new Error('Invalid locale row: '+line)}}
addRows(rows);
addRows(`
理解 AI 安全。|Understanding AI safety.|AI の安全性を理解する。|KI-Sicherheit verstehen.
六个方向，|Six research topics.|6 つの研究分野から、|Sechs Forschungsthemen.
从数据与模型，到系统、人与专业领域。每个专题连接相关论文、数据和评测。|From data and models to systems, people and specialized domains. Each topic connects relevant papers, data and evaluations.|データとモデルからシステム、人、専門領域まで。各分野を関連する論文・データ・評価につなぎます。|Von Daten und Modellen zu Systemen, Menschen und Fachgebieten. Jedes Thema verknüpft Arbeiten, Daten und Evaluationen.
选择关注的领域，在专题内浏览论文、数据、基准与公开结果。|Choose a topic to explore its papers, data, benchmarks and published results.|関心のある分野を選び、論文・データ・ベンチマーク・公開結果を探せます。|Thema auswählen und Publikationen, Daten, Benchmarks und veröffentlichte Ergebnisse erkunden.
六个支柱允许交叉关联；一份资料可以属于多个方向。|The six pillars overlap; one resource can belong to several topics.|6 つの柱は相互に関連し、一つの資料が複数の分野に属することがあります。|Die sechs Säulen überschneiden sich; eine Ressource kann mehreren Themen zugeordnet sein.
论文、数据和评测共享同一方向标签。|Papers, data and evaluations share topic tags.|論文・データ・評価に共通の分野タグを使います。|Publikationen, Daten und Evaluationen teilen dieselben Themen-Tags.
选择方向后，目录、结果和方法共用同一筛选范围。|Selecting a topic applies the same scope to catalogs, results and methods.|分野を選ぶと、目録・結果・手法に同じ絞り込み範囲を適用します。|Ein gewähltes Thema gilt für Verzeichnisse, Ergebnisse und Methoden.
方向决定看哪些材料，协议决定哪些结果可以比较。|Topics guide resource discovery; protocols determine which results are comparable.|分野は資料探しの軸、プロトコルは結果を比較する条件です。|Themen helfen bei der Quellensuche; Protokolle bestimmen die Vergleichbarkeit.
同一主题，连接不同类型的证据。|One topic, different kinds of evidence.|一つのテーマを、異なる種類の根拠につなぐ。|Ein Thema, verschiedene Arten von Belegen.
同一记录 · 方向标签筛选|Shared records · Filtered by topic|共通の記録・分野タグで絞り込み|Gemeinsame Einträge · Nach Thema gefiltert
同一资料可关联多个方向，按唯一记录维护。|A resource may link to several topics but is maintained as one record.|資料は複数の分野に関連付けても、一つの記録として管理します。|Eine Ressource kann mehreren Themen zugeordnet sein und wird einmalig gepflegt.
将论文、项目和报告限定在所选方向。|Limit papers, projects and reports to this topic.|選択した分野の論文・プロジェクト・報告に絞ります。|Arbeiten, Projekte und Berichte auf das gewählte Thema begrenzen.
技术与研究切入点|Technical approaches & research questions|技術と研究の切り口|Technische Ansätze & Forschungsfragen
拟议子方向与评价边界|Proposed subtopics & evaluation limits|提案中の下位分野と評価の限界|Vorgeschlagene Unterthemen & Evaluationsgrenzen
候选评测资源 · PPT 原列|Candidate resources · As listed in the slides|候補の評価資料・スライドの原表記|Quellenkandidaten · Laut Foliensatz
方案中的补充说明|Additional proposal notes|提案の補足説明|Ergänzende Hinweise zum Vorschlag
已录入的相关研究。|Related research in the catalog.|登録済みの関連研究。|Erfasste verwandte Forschung.
从论文进入问题|Start with the papers|論文から問いを探る|Mit den Arbeiten beginnen
实验数据与研究资料入口。|Access experimental data and research resources.|実験データと研究資料への入口。|Zugang zu Versuchsdaten und Forschungsressourcen.
任务数据与环境|Task data & environments|タスクデータと環境|Aufgabendaten & Umgebungen
相关基准|Related benchmarks|関連ベンチマーク|Verwandte Benchmarks
相关结果|Related results|関連結果|Verwandte Ergebnisse
主要指标与使用边界|Key metrics & limits of use|主な指標と利用上の限界|Zentrale Metriken & Nutzungsgrenzen
每条结果，都应有可追溯的依据。|Every result should have traceable evidence.|すべての結果に、たどれる根拠を。|Jedes Ergebnis braucht nachvollziehbare Belege.
每条资料，都保留依据|Keep the evidence behind every resource|すべての資料に根拠を残す|Belege zu jeder Ressource erhalten
相同条件下，并排看结果。|Compare results under the same conditions.|同じ条件の結果を並べて見る。|Ergebnisse unter gleichen Bedingungen vergleichen.
明确协议、模型版本与运行设置，再进行比较。|Check the protocol, model version and run configuration before comparing.|プロトコル・モデルの版・実行設定を確認してから比較します。|Vor dem Vergleich Protokoll, Modellversion und Laufkonfiguration prüfen.
已经找到基准？查看对应模型版本与测试条件下的公开结果。|Found a benchmark? Read published results for the relevant model versions and test conditions.|ベンチマークが見つかったら、モデルの版とテスト条件に対応する公開結果を確認しましょう。|Benchmark gefunden? Veröffentlichte Ergebnisse für die jeweiligen Modellversionen und Testbedingungen ansehen.
从基准目录选择工具，在相同协议下阅读结果。|Choose tools from the benchmark catalog and compare results within the same protocol.|目録からツールを選び、同一プロトコルで結果を読みます。|Werkzeuge im Benchmark-Verzeichnis wählen und Ergebnisse im selben Protokoll lesen.
目录与专题共用记录，通过研究方向关联。原始来源、版本和测试条件仍保留，具体比较方式见网站内“收录与比较原则”。|Catalogs and topic pages share records linked by research area. Original sources, versions and test conditions are preserved; see the inclusion and comparison policy.|目録と分野ページは共通の記録を使います。原典・版・テスト条件を残し、比較方法は「収録・比較の方針」で説明します。|Verzeichnisse und Themenseiten teilen Einträge. Originalquellen, Versionen und Testbedingungen bleiben erhalten; siehe Aufnahme- und Vergleichsregeln.
阅读收录与比较方法|Read inclusion & comparison methods|収録・比較の方法を読む|Aufnahme- & Vergleichsmethoden lesen
收录规范与结果比较原则|Inclusion standards & result comparison|収録基準と結果比較の方針|Aufnahmestandards & Ergebnisvergleich
查看比较原则|View comparison policy|比較の方針を見る|Vergleichsregeln ansehen
不止一个分数|More than a score|スコアだけでなく|Mehr als ein Wert
三项基准，三种不同的测量对象。|Three benchmarks, three different evaluation targets.|3 つのベンチマーク、3 つの異なる評価対象。|Drei Benchmarks, drei unterschiedliche Messgegenstände.
精选基准及完整结果入口。|Selected benchmarks and full results.|選定したベンチマークと全結果への入口。|Ausgewählte Benchmarks und Zugang zu allen Ergebnissen.
一条完整的证据链|A complete evidence trail|一連の根拠をたどる|Eine vollständige Belegkette
任务、版本、指标与来源组成一条完整评测证据|Tasks, versions, metrics and sources form an evaluation evidence trail|タスク・版・指標・出典で評価の根拠を示す|Aufgaben, Versionen, Metriken und Quellen bilden die Evaluationsbelege
评 测 证 据|EVALUATION EVIDENCE|評価の根拠|EVALUATIONSBELEGE
按任务查看分项结果，结合模型版本、评判器和场景解释。|Read results by task, considering model version, evaluator and scenario.|タスク別の結果を、モデルの版・評価器・シナリオと併せて読みます。|Teilergebnisse je Aufgabe unter Berücksichtigung von Modellversion, Bewerter und Szenario lesen.
阅读不同测试设置下的历史结果，理解模型版本、指标与比较边界。|Read historical results across test settings, with model versions, metrics and comparison limits.|異なるテスト設定の過去の結果を、モデルの版・指標・比較可能な範囲と併せて読みます。|Historische Ergebnisse nach Testkonfiguration lesen und Modellversionen, Metriken sowie Vergleichsgrenzen beachten.
这组示例仅用于比较对应历史配置，不代表这些模型的当前表现。|These examples compare historical configurations and do not describe current model performance.|この例は過去の設定の比較用であり、モデルの現在の性能を示しません。|Diese Beispiele vergleichen historische Konfigurationen und zeigen keine aktuelle Modellleistung.
同一方向内也不一定可比。上述结果仅对应所列模型版本、任务、设置与判分方法，不能解读为该研究方向的总分。|Results within a topic are not necessarily comparable. They apply only to the listed model versions, tasks, settings and scoring methods, not a topic-wide score.|同じ分野でも比較可能とは限りません。結果は記載したモデルの版・タスク・設定・採点方法のみを対象とし、分野全体の総合点ではありません。|Auch innerhalb eines Themas sind Ergebnisse nicht zwingend vergleichbar. Sie gelten nur für die genannten Modellversionen, Aufgaben, Einstellungen und Bewertungsverfahren, nicht als Gesamtnote des Themas.
同一基准名并不保证结果可比，需要核对任务子集与攻击配置。|The same benchmark name does not guarantee comparability; check task subsets and attack configurations.|ベンチマーク名が同じでも比較できるとは限りません。タスクの部分集合と攻撃設定を確認してください。|Derselbe Benchmark-Name garantiert keine Vergleichbarkeit; Aufgabenmenge und Angriffskonfiguration prüfen.
明确各模型的具体版本，核对基准版本、任务集、评判器与运行设置。同一评价口径的结果再比较；不同协议单列，缺失值不填 0。|Check exact model and benchmark versions, task sets, evaluators and run settings. Compare only compatible results, separate protocols and never replace missing values with zero.|モデルとベンチマークの版、タスク集合、評価器、実行設定を確認します。同じ評価条件のみを比較し、別プロトコルは分け、欠損値を 0 にしません。|Genaue Modell- und Benchmark-Versionen, Aufgaben, Bewerter und Einstellungen prüfen. Nur kompatible Ergebnisse vergleichen, Protokolle trennen und fehlende Werte nie durch null ersetzen.
资料收录、重要结论复核与实验复现分别记录。|Source inclusion, claim verification and experiment reproduction are recorded separately.|資料の収録・重要な結論の確認・実験の再現を別々に記録します。|Quellenaufnahme, Prüfung zentraler Aussagen und Reproduktion werden getrennt erfasst.
收录原始资料|Index primary sources|一次資料を収録|Primärquellen erfassen
保留原始链接、发布方、版本与来源日期；采集时间单独记录。|Keep original links, publishers, versions and source dates; record collection dates separately.|原リンク・公開元・版・出典の日付を残し、収集日は別に記録します。|Originallinks, Herausgeber, Version und Quelldatum erhalten; Erfassungsdatum separat notieren.
核查重要字段和结论；“资料已核对”与“实验已复现”分别说明，避免混用。|Verify key fields and claims; distinguish source checks from experiment reproduction.|重要な項目と結論を確認し、「資料確認済み」と「実験再現済み」を区別します。|Zentrale Angaben und Aussagen prüfen; Quellenprüfung und experimentelle Reproduktion unterscheiden.
保留发布方、日期、版本与原始链接。|Keep the publisher, date, version and original link.|公開元・日付・版・原リンクを残します。|Herausgeber, Datum, Version und Originallink erhalten.
目录收录说明资料来源，不表示平台已独立复现。尚未录入的字段明确标记，避免被误读为零值。|Catalog inclusion identifies the source, not independent reproduction. Missing fields are labeled explicitly rather than shown as zero.|収録は出典の記録であり、独立した再現を意味しません。未登録項目を明記し、ゼロ値との混同を防ぎます。|Die Aufnahme belegt die Quelle, keine unabhängige Reproduktion. Fehlende Angaben werden gekennzeichnet und nicht als null angezeigt.
专题归类不产生安全分数。新增结果需带有基准版本、完整配置和原始证据。|Topic classification produces no safety score. New results require a benchmark version, full configuration and original evidence.|分野の分類から安全性スコアは生成しません。結果の追加にはベンチマークの版・完全な設定・原資料が必要です。|Themenzuordnung erzeugt keinen Sicherheitswert. Neue Ergebnisse brauchen Benchmark-Version, vollständige Konfiguration und Originalbelege.
候选清单与正式记录分别管理|Manage candidates and confirmed records separately|候補と正式な記録を別々に管理|Kandidaten und bestätigte Einträge getrennt verwalten
PPT 原列包含基准、数据集、环境、工具与框架，尚待逐项核对类型、链接及版本。页面中的候选清单不代表已收录或已复现。|The slides list benchmarks, datasets, environments, tools and frameworks. Types, links and versions still need checking. Candidate lists imply neither inclusion nor reproduction.|スライドにはベンチマーク・データセット・環境・ツール・枠組みが含まれます。種類・リンク・版は確認待ちで、候補一覧は収録や再現を意味しません。|Der Foliensatz nennt Benchmarks, Datensätze, Umgebungen, Werkzeuge und Rahmenwerke. Typen, Links und Versionen sind noch zu prüfen. Kandidatenlisten bedeuten weder Aufnahme noch Reproduktion.
PPT 中的候选评测资源仍在专题概览中保留，核对类型、版本和来源后再加入目录。|Candidate resources from the slides remain in topic overviews until type, version and source are verified.|スライドの候補資料は分野の概要に残し、種類・版・出典の確認後に目録へ追加します。|Quellenkandidaten aus den Folien bleiben in der Themenübersicht, bis Typ, Version und Quelle geprüft sind.
方法与工具集中在这里。|Methods and tools are collected here.|手法とツールをここにまとめています。|Methoden und Werkzeuge sind hier gesammelt.
评测方法、项目文档与数据工具集中在这里。|Evaluation methods, project documentation and data tools in one place.|評価手法・プロジェクト文書・データツールをまとめています。|Evaluationsmethoden, Projektdokumentation und Datenwerkzeuge an einem Ort.
`);
addRows(`
数据如何使用，隐私边界如何守住？|How can data be used while preserving privacy?|データを使いながら、どうプライバシーを守るか？|Wie lassen sich Daten nutzen und Privatsphäre schützen?
作为系统基础，模型如何可靠地回应？|How can foundation models respond reliably?|システムの基盤となるモデルは、どう信頼できる応答をするか？|Wie können Basismodelle zuverlässig antworten?
模型开始调用工具后，如何约束整个系统？|How do we constrain a system once its model starts using tools?|モデルがツールを使うとき、システム全体をどう制御するか？|Wie begrenzen wir Systeme, deren Modelle Werkzeuge nutzen?
进入物理世界后，如何安全地行动？|How can AI act safely in the physical world?|物理世界で、どう安全に行動するか？|Wie handelt KI sicher in der physischen Welt?
AI 如何影响人的判断、权益与社会生活？|How does AI affect judgment, rights and society?|AI は人の判断・権利・社会生活にどう影響するか？|Wie beeinflusst KI Urteile, Rechte und das Zusammenleben?
走向专业应用，哪些错误会造成实质危害？|Which errors cause real harm in specialized applications?|専門分野の応用で、どのような誤りが実害を生むか？|Welche Fehler richten in Fachanwendungen konkreten Schaden an?
贯穿数据、模型与应用的保护要求|Protection across data, models and applications|データ・モデル・応用を横断する保護|Schutz über Daten, Modelle und Anwendungen hinweg
从对齐、拒答到事实性与鲁棒性|From alignment and refusal to factuality and robustness|アラインメント・拒否から事実性・頑健性まで|Von Alignment und Ablehnung bis Faktentreue und Robustheit
从提示输入到工具执行的完整系统|The full system from prompt to tool execution|プロンプト入力からツール実行までのシステム全体|Das Gesamtsystem vom Prompt bis zur Werkzeugausführung
让决策与动作遵守物理安全约束|Keep decisions and actions within physical safety constraints|判断と動作を物理的な安全制約に従わせる|Entscheidungen und Handlungen innerhalb physischer Sicherheitsgrenzen halten
关注不同人群、语言和社会情境|Across populations, languages and social contexts|人々・言語・社会的文脈の違いに注目|Unterschiedliche Gruppen, Sprachen und soziale Kontexte
面向专业领域的风险与可靠性|Risk and reliability in specialized domains|専門領域のリスクと信頼性|Risiken und Zuverlässigkeit in Fachgebieten
关注数据披露、训练数据泄露、成员隐私与数据完整性，并延伸到模型和数据治理。|Covers disclosure, training-data leakage, membership privacy and data integrity, extending to model and data governance.|情報開示・学習データ漏洩・メンバーシップのプライバシー・データ完全性から、モデルとデータのガバナンスまで扱います。|Umfasst Offenlegung, Trainingsdatenlecks, Mitgliedschaftsprivatsphäre und Datenintegrität sowie Modell- und Datengovernance.
围绕模型对齐、有害协助、拒答校准、事实可靠性、偏见与对抗鲁棒性组织研究。|Research on alignment, harmful assistance, refusal calibration, factual reliability, bias and adversarial robustness.|アラインメント・有害な支援・拒否の校正・事実の信頼性・バイアス・敵対的頑健性を研究します。|Forschung zu Alignment, schädlicher Hilfestellung, Ablehnungskalibrierung, Faktentreue, Verzerrungen und adversarialer Robustheit.
把模型、框架、防御和权限作为完整配置，关注提示注入、多步骤行为、计算机操作、工具使用、检索与网络安全。|Treats model, framework, defenses and permissions as one configuration, covering prompt injection, multi-step behavior, computer and tool use, retrieval and cybersecurity.|モデル・枠組み・防御・権限を一体の設定として、プロンプトインジェクション・多段階行動・コンピュータ操作・ツール使用・検索・サイバーセキュリティを扱います。|Betrachtet Modell, Framework, Abwehr und Berechtigungen als Gesamtkonfiguration: Prompt Injection, mehrstufiges Verhalten, Computer- und Werkzeugnutzung, Retrieval und Cybersicherheit.
覆盖导航、交互、操作、约束学习和自动驾驶，分别观察任务完成与真实世界的危害。|Covers navigation, interaction, manipulation, constrained learning and autonomous driving, separating task success from real-world harm.|移動・対話・操作・制約付き学習・自動運転について、タスク達成と現実の危害を分けて評価します。|Umfasst Navigation, Interaktion, Manipulation, beschränktes Lernen und autonomes Fahren; Aufgabenerfolg und reale Schäden werden getrennt betrachtet.
关注公平性、毒性、多语言安全、伦理、谄媚与治理，并为儿童安全、心理健康等专项研究保留扩展空间。|Covers fairness, toxicity, multilingual safety, ethics, sycophancy and governance, with room for child safety and mental health research.|公平性・有害性・多言語の安全性・倫理・迎合・ガバナンスを扱い、子どもの安全やメンタルヘルスへの拡張も想定します。|Umfasst Fairness, Toxizität, mehrsprachige Sicherheit, Ethik, Gefälligkeit und Governance; offen für Kinderschutz und psychische Gesundheit.
面向知识、生物、医疗、区块链、金融与科学推理，将领域能力和安全后果分别分析。|Separates domain capability from safety outcomes in knowledge, biology, healthcare, blockchain, finance and scientific reasoning.|知識・生物・医療・ブロックチェーン・金融・科学的推論において、専門能力と安全上の結果を分けて分析します。|Trennt fachliche Fähigkeiten und Sicherheitsfolgen in Wissen, Biologie, Medizin, Blockchain, Finanzen und wissenschaftlichem Schlussfolgern.
数据与隐私保护贯穿模型、系统与应用|Data and privacy protection span models, systems and applications|データとプライバシー保護はモデル・システム・応用を横断|Daten- und Datenschutz reichen über Modelle, Systeme und Anwendungen
数据与隐私贯穿全局，|Data and privacy span the framework;|データとプライバシーが全体を横断し、|Daten und Datenschutz durchziehen das gesamte Framework;
模型连接系统与应用。|models connect systems and applications.|モデルがシステムと応用をつなぎます。|Modelle verbinden Systeme und Anwendungen.
六个支柱 · 一个关联框架|Six pillars · One connected framework|6 つの柱・一つの関連枠組み|Sechs Säulen · Ein vernetztes Framework
数字系统|Digital systems|デジタルシステム|Digitale Systeme
物理系统|Physical systems|物理システム|Physische Systeme
人与社会|People & society|人と社会|Mensch & Gesellschaft
专业领域|Specialized domains|専門領域|Fachgebiete
贯穿全局|Cross-cutting|全体を横断|Themenübergreifend
模型与系统 / 场景联动|Models & systems / Linked scenarios|モデルとシステム / 場面の連携|Modelle & Systeme / Verknüpfte Szenarien
拟议方向|Proposed topics|提案中の分野|Vorgeschlagene Themen
拟议研究框架|Proposed research framework|提案中の研究枠組み|Vorgeschlagenes Forschungsframework
拟议研究方向关系导航|Proposed topic relationship map|提案中の研究分野の関連図|Vorgeschlagene Themenverknüpfungen
查看六个方向之间的关系|View relationships among the six topics|6 分野の関係を見る|Beziehungen der sechs Themen ansehen
点击探索|Click to explore|クリックして探索|Zum Erkunden klicken
探索全部方向|Explore all topics|すべての分野を探す|Alle Themen erkunden
关系导航依据提供的方案图整理；节点位置不代表研究优先级或安全得分。|The relationship map follows the supplied proposal; node positions indicate neither priority nor safety scores.|関連図は提供された提案に基づきます。ノードの位置は優先度や安全性スコアを示しません。|Die Karte folgt dem bereitgestellten Vorschlag; Knotenpositionen bedeuten weder Priorität noch Sicherheitswerte.
PPT 的关系图表达交叉与联动。专题负责讲清研究问题和评价边界；基准、结果与动态则使用共享记录，通过方向标签进入专题。|The slide diagram shows overlapping relationships. Topics explain research questions and evaluation limits; benchmarks, results and highlights use shared records linked by tags.|スライドの図は分野の重なりを示します。分野ページで研究課題と評価の限界を説明し、ベンチマーク・結果・トピックスは共通の記録をタグで関連付けます。|Das Foliendiagramm zeigt Überschneidungen. Themen erklären Fragen und Evaluationsgrenzen; Benchmarks, Ergebnisse und Meldungen nutzen gemeinsame, mit Tags verknüpfte Einträge.
因此这里不把六个方向当作互斥的分类树，也不生成六项综合安全分数。|The six topics are not mutually exclusive categories and do not yield six aggregate safety scores.|6 分野を排他的な分類にはせず、6 つの総合安全性スコアも作りません。|Die sechs Themen sind keine ausschließenden Kategorien und erzeugen keine sechs Gesamtsicherheitswerte.
数据隐私|Data privacy|データプライバシー|Datenschutz
数据泄露|Data leakage|データ漏洩|Datenlecks
成员隐私|Membership privacy|メンバーシップのプライバシー|Mitgliedschaftsprivatsphäre
数据完整性|Data integrity|データ完全性|Datenintegrität
模型治理|Model governance|モデルガバナンス|Modellgovernance
数据治理|Data governance|データガバナンス|Datengovernance
模型对齐|Model alignment|モデルのアラインメント|Modell-Alignment
有害协助|Harmful assistance|有害な支援|Schädliche Hilfestellung
拒答校准|Refusal calibration|拒否の校正|Ablehnungskalibrierung
事实可靠性|Factual reliability|事実の信頼性|Faktentreue
偏见评估|Bias evaluation|バイアスの評価|Bewertung von Verzerrungen
对抗鲁棒性|Adversarial robustness|敵対的頑健性|Adversariale Robustheit
提示注入|Prompt injection|プロンプトインジェクション|Prompt Injection
智能体风险|Agent risk|エージェントのリスク|Agentenrisiken
计算机操作|Computer use|コンピュータ操作|Computernutzung
工具使用|Tool use|ツール使用|Werkzeugnutzung
检索可靠性|Retrieval reliability|検索の信頼性|Retrieval-Zuverlässigkeit
网络安全|Cybersecurity|サイバーセキュリティ|Cybersicherheit
导航|Navigation|ナビゲーション|Navigation
交互|Interaction|対話|Interaktion
操作|Manipulation|操作|Manipulation
约束学习|Constrained learning|制約付き学習|Lernen unter Nebenbedingungen
自动驾驶|Autonomous driving|自動運転|Autonomes Fahren
公平性|Fairness|公平性|Fairness
毒性|Toxicity|有害性|Toxizität
多语言安全|Multilingual safety|多言語の安全性|Mehrsprachige Sicherheit
伦理|Ethics|倫理|Ethik
谄媚与迎合|Sycophancy|迎合|Gefälligkeit
治理|Governance|ガバナンス|Governance
知识安全|Knowledge safety|知識の安全性|Wissenssicherheit
生物安全|Biosafety|バイオセーフティ|Biosicherheit
医疗安全|Medical safety|医療の安全性|Medizinische Sicherheit
区块链|Blockchain|ブロックチェーン|Blockchain
金融安全|Financial safety|金融の安全性|Finanzielle Sicherheit
科学推理|Scientific reasoning|科学的推論|Wissenschaftliches Schlussfolgern
儿童安全|Child safety|子どもの安全|Kinderschutz
数据安全研究|Data security research|データセキュリティ研究|Datensicherheitsforschung
基础能力|Foundational capabilities|基礎能力|Grundfähigkeiten
风险治理|Risk governance|リスクガバナンス|Risikogovernance
多模态|Multimodal|マルチモーダル|Multimodal
智能体记忆攻击|Agent memory attacks|エージェント記憶への攻撃|Angriffe auf Agentenspeicher
智能体记忆防御|Agent memory defenses|エージェント記憶の防御|Schutz von Agentenspeichern
工具调用攻击|Tool-call attacks|ツール呼び出しへの攻撃|Angriffe auf Werkzeugaufrufe
工具调用防御|Tool-call defenses|ツール呼び出しの防御|Schutz von Werkzeugaufrufen
智能体攻击与防御|Agent attacks & defenses|エージェントへの攻撃と防御|Angriffe & Abwehr bei Agenten
具身智能体攻击|Embodied agent attacks|身体性エージェントへの攻撃|Angriffe auf verkörperte Agenten
具身智能体防御|Embodied agent defenses|身体性エージェントの防御|Schutz verkörperter Agenten
间接提示注入攻击|Indirect prompt injection attacks|間接プロンプトインジェクション攻撃|Indirekte Prompt-Injection-Angriffe
间接提示注入防御|Indirect prompt injection defenses|間接プロンプトインジェクション防御|Abwehr indirekter Prompt Injection
模型内部安全失效|Internal model safety failures|モデル内部の安全性の破綻|Interne Sicherheitsfehler von Modellen
多智能体系统攻击|Multi-agent system attacks|マルチエージェントシステムへの攻撃|Angriffe auf Multiagentensysteme
多智能体系统防御|Multi-agent system defenses|マルチエージェントシステムの防御|Schutz von Multiagentensystemen
视觉语言智能体攻击|Vision-language agent attacks|視覚言語エージェントへの攻撃|Angriffe auf visuell-sprachliche Agenten
视觉语言智能体防御|Vision-language agent defenses|視覚言語エージェントの防御|Schutz visuell-sprachlicher Agenten
人与智能体交互|Human–agent interaction|人とエージェントの対話|Mensch-Agent-Interaktion
多智能体协作|Multi-agent collaboration|マルチエージェント協調|Zusammenarbeit mehrerer Agenten
机器人控制安全|Robot control safety|ロボット制御の安全性|Sicherheit der Robotersteuerung
级联风险|Cascading risks|連鎖的リスク|Kaskadenrisiken
记忆机制安全|Memory mechanism safety|記憶機構の安全性|Sicherheit von Speichermechanismen
自演化系统安全|Self-evolving system safety|自己進化システムの安全性|Sicherheit selbstentwickelnder Systeme
工具与技能使用|Tool & skill use|ツールとスキルの使用|Werkzeug- & Fertigkeitsnutzung
指令理解安全|Instruction understanding safety|指示理解の安全性|Sicherheit beim Anweisungsverständnis
推理可靠性|Reasoning reliability|推論の信頼性|Zuverlässigkeit des Schlussfolgerns
世界模型安全|World model safety|世界モデルの安全性|Sicherheit von Weltmodellen
听觉感知安全|Auditory perception safety|聴覚知覚の安全性|Sicherheit auditiver Wahrnehmung
跨模态感知安全|Cross-modal perception safety|モダリティ横断知覚の安全性|Sicherheit modalitätsübergreifender Wahrnehmung
运动感知安全|Motion perception safety|運動知覚の安全性|Sicherheit der Bewegungswahrnehmung
空间感知安全|Spatial perception safety|空間知覚の安全性|Sicherheit räumlicher Wahrnehmung
视觉感知安全|Visual perception safety|視覚知覚の安全性|Sicherheit visueller Wahrnehmung
多智能体规划安全|Multi-agent planning safety|マルチエージェント計画の安全性|Sicherheit der Multiagentenplanung
任务规划安全|Task planning safety|タスク計画の安全性|Sicherheit der Aufgabenplanung
轨迹规划安全|Trajectory planning safety|軌道計画の安全性|Sicherheit der Trajektorienplanung
对抗攻击|Adversarial attacks|敵対的攻撃|Adversariale Angriffe
对抗防御|Adversarial defenses|敵対的攻撃への防御|Adversariale Abwehr
后门攻击|Backdoor attacks|バックドア攻撃|Backdoor-Angriffe
后门防御|Backdoor defenses|バックドア防御|Backdoor-Abwehr
数据提取攻击|Data extraction attacks|データ抽出攻撃|Datenextraktionsangriffe
能耗与时延攻击|Energy & latency attacks|電力・遅延攻撃|Energie- & Latenzangriffe
越狱攻击|Jailbreak attacks|脱獄攻撃|Jailbreak-Angriffe
越狱防御|Jailbreak defenses|脱獄への防御|Jailbreak-Abwehr
模型提取攻击|Model extraction attacks|モデル抽出攻撃|Modellextraktionsangriffe
提示注入攻击|Prompt injection attacks|プロンプトインジェクション攻撃|Prompt-Injection-Angriffe
提示注入防御|Prompt injection defenses|プロンプトインジェクション防御|Prompt-Injection-Abwehr
安全对齐|Safety alignment|安全性アラインメント|Sicherheits-Alignment
AI 安全综述与研究|AI safety surveys & research|AI 安全性のサーベイと研究|Übersichten & Forschung zur KI-Sicherheit
`);
addRows(`
来源条目年份|Year listed in source|出典記載の年|Jahr laut Quelle
2024 年公开历史结果示例，用于演示比较方式，不是当前模型排名。|Historical results published in 2024 illustrate comparisons, not current model rankings.|2024 年公開の過去の結果で比較方法を示しています。現在のモデル順位ではありません。|Historische Ergebnisse von 2024 zeigen die Vergleichsmethode, keine aktuelle Modellrangliste.
首页热点优先|Featured on the homepage|ホームの注目記事|Auf der Startseite hervorgehoben
3 条方法与工具示例|3 method & tool examples|3 件の手法・ツール例|3 Methoden- & Werkzeugbeispiele
5 个子方向 · 按需展开|5 subtopics · Expand as needed|5 つの下位分野・必要に応じて展開|5 Unterthemen · Bei Bedarf öffnen
6 个子方向 · 按需展开|6 subtopics · Expand as needed|6 つの下位分野・必要に応じて展開|6 Unterthemen · Bei Bedarf öffnen
编辑式视觉改版|Editorial redesign|エディトリアルデザインの改訂|Redaktionelle Neugestaltung
AI Safety Index 旨在连接不同研究方向下的基准、公开结果与研究动态。通过保留来源、版本和评价条件，帮助使用者找到适合自己问题的证据。|AI Safety Index connects benchmarks, published results and research highlights across topics. Sources, versions and evaluation conditions help readers find evidence for their questions.|AI Safety Index は分野を横断してベンチマーク・公開結果・研究トピックスをつなぎます。出典・版・評価条件を残し、問いに合う根拠を探せるようにします。|AI Safety Index verbindet Benchmarks, veröffentlichte Ergebnisse und Forschungsnachrichten. Quellen, Versionen und Evaluationsbedingungen helfen, passende Belege für konkrete Fragen zu finden.
AI 安全领域的研究与评测资料索引|An index of AI safety research and evaluation resources|AI 安全性の研究・評価資料索引|Verzeichnis für Forschung und Evaluation zur KI-Sicherheit
Agent 辅助抓取、去重、提取字段和关联资料。自动收录内容标记“待复核”。|Agents assist with collection, deduplication, field extraction and linking. Automatically collected entries are marked as pending review.|エージェントが収集・重複除去・項目抽出・関連付けを補助し、自動収録は「確認待ち」とします。|Agenten unterstützen Erfassung, Deduplizierung, Extraktion und Verknüpfung. Automatisch erfasste Einträge gelten als noch zu prüfen.
AgentDojo 任务套件|AgentDojo task suite|AgentDojo タスク集|AgentDojo-Aufgabensammlung
AgentDojo：工具环境中的提示注入评测|AgentDojo: evaluating prompt injection in tool environments|AgentDojo：ツール環境でのプロンプトインジェクション評価|AgentDojo: Prompt Injection in Werkzeugumgebungen evaluieren
HELM Safety 方法说明|HELM Safety methodology|HELM Safety の手法|HELM-Safety-Methodik
HELM Safety：从组合评测看模型的安全表现|HELM Safety: model safety through combined evaluations|HELM Safety：複合評価で見るモデルの安全性|HELM Safety: Modellsicherheit durch kombinierte Evaluationen
MEMBER PROFILE / 展示模板|MEMBER PROFILE / Display template|MEMBER PROFILE / 表示テンプレート|MEMBER PROFILE / Darstellungsvorlage
MM-SafetyBench：图文输入下的安全边界|MM-SafetyBench: safety boundaries for image-text inputs|MM-SafetyBench：画像とテキスト入力の安全性の境界|MM-SafetyBench: Sicherheitsgrenzen bei Bild-Text-Eingaben
Model Spec Evals：怎样评估模型是否遵守行为规范？|Model Spec Evals: how do we evaluate adherence to behavioral rules?|Model Spec Evals：モデルの行動規範への準拠をどう評価するか？|Model Spec Evals: Wie lässt sich die Einhaltung von Verhaltensregeln prüfen?
ProPILE, PII-Bench / PLeak类数据集|ProPILE, PII-Bench / PLeak-style datasets|ProPILE・PII-Bench / PLeak 系データセット|ProPILE, PII-Bench / Datensätze nach PLeak-Art
。目录收录不等于全文审核或实验复现。|. Bibliographic inclusion does not imply full-text review or experiment reproduction.|。目録への収録は全文審査や実験再現を意味しません。|. Die Aufnahme bedeutet weder Volltextprüfung noch experimentelle Reproduktion.
不当披露率、情境完整性与隐私边界判断分别报告|Report inappropriate disclosure, contextual integrity and privacy-boundary judgments separately|不適切な開示率・文脈の完全性・プライバシー境界の判断を別々に報告|Unangemessene Offenlegung, kontextuelle Integrität und Datenschutzgrenzen getrennt berichten
与|and|と|und
个人主页入口 · 确认后开放|Personal profile · Available after confirmation|個人ページ・確認後に公開|Persönliches Profil · Nach Bestätigung verfügbar
个人信息提取率、攻击条件、数据许可与暴露严重度|PII extraction rate, attack conditions, data license and exposure severity|個人情報の抽出率・攻撃条件・データライセンス・露出の重大度|Extraktionsrate personenbezogener Daten, Angriffsbedingungen, Datenlizenz und Schwere der Offenlegung
中英文违法违规、不道德请求拒绝, 注明适用法规与地区|Refusal of illegal or unethical requests in Chinese and English; specify applicable laws and regions|中英の違法・非倫理的要求の拒否。適用する法規と地域を明記|Ablehnung illegaler oder unethischer Anfragen auf Chinesisch und Englisch; Rechtsraum angeben
了解 Index 的目标、建设者和证据管理方式。|Learn about Index, its contributors and evidence management.|Index の目的・運営者・根拠の管理方法について。|Ziele, Mitwirkende und Belegverwaltung von Index kennenlernen.
了解研究与评价边界|Understand research & evaluation limits|研究と評価の限界を知る|Forschungs- & Evaluationsgrenzen verstehen
人工复核|Human review|人による確認|Manuelle Prüfung
仅作安全相关能力参考，不与直接领域安全结果混榜|Reference for safety-related capabilities only; separate from direct domain-safety results|安全関連能力の参考とし、領域の直接的な安全結果とは分離|Nur Referenz für sicherheitsrelevante Fähigkeiten; getrennt von direkten Fachsicherheitsergebnissen
从 OpenTAI 公开 GitHub 目录筛选导入 487 条论文书目，总计 490 条。支持方向筛选、作者与题名搜索、综述筛选和分页。原始题名、作者、年份与论文链接保留；来源和筛选统计见|487 bibliographic entries were selected from OpenTAI’s public GitHub catalog, bringing the total to 490. Filter by topic or survey type, search titles and authors, and browse by page. Original titles, authors, years and paper links are retained. Sources and selection statistics:|OpenTAI の公開 GitHub 目録から 487 件を選んで取り込み、合計 490 件を掲載。分野・サーベイの絞り込み、題名・著者の検索、ページ送りに対応します。原題・著者・年・論文リンクを保持。出典と選定統計：|487 Einträge aus dem öffentlichen GitHub-Verzeichnis von OpenTAI wurden ausgewählt, insgesamt sind es 490. Themen- und Übersichtsfilter, Titel- und Autorensuche sowie Seitennavigation sind verfügbar. Originaltitel, Autoren, Jahre und Links bleiben erhalten. Quellen und Auswahlstatistik:
从多模态条件进入安全评测任务、输入设置与原始论文。|Explore multimodal safety tasks, input settings and original papers.|マルチモーダル安全性のタスク・入力設定・原論文を探ります。|Multimodale Sicherheitsaufgaben, Eingabeeinstellungen und Originalarbeiten erkunden.
从评测与内部使用中的案例，观察工具调用、访问限制和任务边界失守的问题。|Cases from evaluation and internal use reveal failures in tool calls, access limits and task boundaries.|評価と内部利用の事例から、ツール呼び出し・アクセス制限・タスク境界の破綻を見ます。|Fälle aus Evaluation und interner Nutzung zeigen Fehler bei Werkzeugaufrufen, Zugriffsbeschränkungen und Aufgabengrenzen.
从问题走向评测|From questions to evaluation|問いから評価へ|Von Fragen zur Evaluation
任务套件、Agent 配置及复现环境的文档入口。|Documentation for task suites, agent configurations and reproduction environments.|タスク集・エージェント設定・再現環境の文書への入口。|Dokumentation zu Aufgabensammlungen, Agentenkonfigurationen und Reproduktionsumgebungen.
任务成功不等于安全, 需要把碰撞、违规和人工接管作为独立结果。|Task success does not imply safety; record collisions, violations and human takeovers separately.|タスク成功は安全性を意味しません。衝突・違反・人の介入を別々に記録します。|Aufgabenerfolg bedeutet keine Sicherheit; Kollisionen, Verstöße und menschliche Übernahmen getrennt erfassen.
任务结果与攻击结果需要按相同环境及配置分别记录。|Record task and attack outcomes separately under the same environment and configuration.|同一環境・設定でタスク結果と攻撃結果を分けて記録します。|Aufgaben- und Angriffsergebnisse in derselben Umgebung und Konfiguration getrennt erfassen.
仿真结果仅描述所测条件，不能直接当作道路安全认证。|Simulation results apply only to tested conditions and are not road-safety certification.|シミュレーション結果は試験条件にのみ適用され、道路安全の認証ではありません。|Simulationsergebnisse gelten nur für getestete Bedingungen und sind keine Verkehrssicherheitszertifizierung.
伦理、事实性和严重错误需专家复核并标注目标地区|Expert review for ethics, factuality and severe errors; specify target region|倫理・事実性・重大な誤りは専門家が確認し、対象地域を記載|Ethik, Faktentreue und schwere Fehler durch Fachleute prüfen; Zielregion angeben
使用图文条件开展多模态模型安全评估。图文配对、模型配置与判分依据是该类条目需要呈现的关键字段。|Evaluates multimodal model safety with image-text inputs. Record image-text pairings, model configuration and scoring rules.|画像・テキスト条件でマルチモーダルモデルの安全性を評価します。組み合わせ・モデル設定・採点基準を記録します。|Evaluiert multimodale Modellsicherheit mit Bild-Text-Eingaben. Paarungen, Modellkonfiguration und Bewertungsregeln erfassen.
使用自托管 Newsreader 与 Noto Serif SC 标题字体；许可证随文件保存于 assets/。正文使用系统无衬线字体。|Headings use self-hosted Newsreader and Noto Serif SC; licenses are in assets/. Body text uses system sans-serif fonts.|見出しは自己ホストの Newsreader と Noto Serif SC を使用し、ライセンスは assets/ に同梱。本文はシステムのサンセリフ体です。|Überschriften nutzen selbst gehostete Newsreader und Noto Serif SC; Lizenzen liegen unter assets/. Fließtext nutzt Systemschriften ohne Serifen.
例如：某项评测基准|e.g. an evaluation benchmark|例：評価ベンチマーク|z. B. ein Evaluationsbenchmark
值得关注的问题、研究与新进展。|Questions, research and developments worth following.|注目したい問い・研究・新たな進展。|Fragen, Forschung und neue Entwicklungen im Blick.
偏好数据集|Preference dataset|選好データセット|Präferenzdatensatz
儿童安全、心理健康、诈骗/操纵与无障碍需专项数据、专家标注和严重度分级, 通用毒性集不能替代。|Child safety, mental health, fraud/manipulation and accessibility need dedicated data, expert labels and severity ratings; general toxicity sets are insufficient.|子どもの安全・メンタルヘルス・詐欺や操作・アクセシビリティには専用データ、専門家の注釈、重大度分類が必要で、一般の有害性データでは代替できません。|Kinderschutz, psychische Gesundheit, Betrug/Manipulation und Barrierefreiheit brauchen eigene Daten, Fachannotationen und Schweregrade; allgemeine Toxizitätsdaten reichen nicht.
儿童权益、适龄保护与 AI 系统设计的指南入口。|Guidance on children’s rights, age-appropriate protection and AI design.|子どもの権利・年齢に応じた保護・AI 設計の指針。|Leitlinien zu Kinderrechten, altersgerechtem Schutz und KI-Design.
公开评测数据与代码，检查模型对拒答、诚实性和指令优先级等行为要求的遵循情况。|Public evaluation data and code examine adherence to refusal, honesty and instruction-priority requirements.|公開された評価データとコードで、拒否・誠実さ・指示優先順位などの要件への準拠を検証します。|Öffentliche Evaluationsdaten und Code prüfen Anforderungen an Ablehnung, Ehrlichkeit und Anweisungspriorität.
六方向目录，进入相关论文、数据、基准和公开结果。|Six-topic catalog linking papers, data, benchmarks and published results.|6 分野から、論文・データ・ベンチマーク・公開結果へ。|Sechs Themen mit Zugang zu Arbeiten, Daten, Benchmarks und veröffentlichten Ergebnissen.
关注方向|Research interests|関心分野|Forschungsinteressen
关注过度安全行为与误拒绝。此类测试应将对危险请求的反应和对正常请求的可用性一起呈现。|Studies excessive safety behavior and false refusals. Show responses to harmful requests alongside usability for benign ones.|過剰な安全行動と誤った拒否を扱います。有害要求への反応と無害要求での有用性を併記します。|Untersucht übermäßiges Sicherheitsverhalten und falsche Ablehnungen. Reaktionen auf schädliche Anfragen und Nutzbarkeit bei harmlosen Anfragen gemeinsam darstellen.
关联相应方向专题，介绍与本平台相关的贡献。|Link relevant topics and describe contributions to this platform.|関連分野をつなぎ、このプラットフォームへの貢献を紹介します。|Relevante Themen verknüpfen und Beiträge zur Plattform beschreiben.
到全站列表查看此筛选|View this filter in the full catalog|この条件で全体の一覧を見る|Diesen Filter im Gesamtverzeichnis öffnen
包含任务套件、工具环境与攻击防御接口。条目需要同时记录正常任务效用和受到攻击后的结果。|Includes task suites, tool environments and attack/defense interfaces. Record normal task utility and outcomes under attack.|タスク集・ツール環境・攻撃防御インターフェースを含みます。通常時の有用性と攻撃時の結果を併記します。|Umfasst Aufgabensammlungen, Werkzeugumgebungen und Angriffs-/Abwehrschnittstellen. Normalen Aufgabennutzen und Ergebnisse unter Angriff erfassen.
区分检索质量、证据忠实性、幻觉与低信任内容注入|Separate retrieval quality, evidence faithfulness, hallucination and untrusted-content injection|検索品質・根拠への忠実性・幻覚・低信頼コンテンツ注入を区別|Retrieval-Qualität, Quellentreue, Halluzinationen und Injektion unvertrauenswürdiger Inhalte trennen
区分模糊/明确语境、开放生成与语言建模能力|Separate ambiguous/explicit contexts, open generation and language modeling|曖昧・明示的文脈、自由生成、言語モデル能力を区別|Mehrdeutige/explizite Kontexte, freie Generierung und Sprachmodellierung trennen
区分输入鲁棒性、视觉越狱与生成安全，声明攻击协议|Separate input robustness, visual jailbreaks and generation safety; state attack protocols|入力の頑健性・視覚的脱獄・生成の安全性を区別し、攻撃手順を明記|Eingaberobustheit, visuelle Jailbreaks und Generierungssicherheit trennen; Angriffsprotokoll angeben
区分迎合用户观点、自我认知与评测情境识别|Separate sycophancy, self-awareness and evaluation-awareness|ユーザーへの迎合・自己認識・評価状況の認識を区別|Gefälligkeit, Selbstwahrnehmung und Erkennung von Evaluationssituationen trennen
医疗、金融、生物、化学：自动裁判只做初筛, 主结论需要专家复核、严重度分级和地域说明。|In medicine, finance, biology and chemistry, automated judges only screen. Main conclusions need expert review, severity ratings and regional context.|医療・金融・生物・化学では自動評価は予備選別に限定し、主な結論には専門家確認・重大度・地域の説明が必要です。|In Medizin, Finanzen, Biologie und Chemie dienen automatische Bewerter nur zur Vorauswahl. Kernaussagen brauchen Fachprüfung, Schweregrade und regionalen Kontext.
危险物体、人身风险、失败严重度与场景约束满足率|Hazardous objects, personal risk, failure severity and scenario-constraint compliance|危険物・身体的リスク・失敗の重大度・場面の制約遵守率|Gefährliche Objekte, Personenrisiken, Fehlerschwere und Einhaltung von Szenariogrenzen
危险知识、可执行有害协助与严重错误建议是三类不同风险。|Hazardous knowledge, actionable harmful assistance and severely incorrect advice are distinct risks.|危険な知識・実行可能な有害支援・重大な誤助言は異なるリスクです。|Gefährliches Wissen, umsetzbare schädliche Hilfe und schwerwiegend falsche Ratschläge sind unterschiedliche Risiken.
原型中的历史结果来自 HELM Safety v1.0 报告。完整方案与字段规则见|Historical results in this prototype come from HELM Safety v1.0. Full methodology and field rules:|このプロトタイプの過去の結果は HELM Safety v1.0 報告によります。全体の手法と項目規則：|Historische Ergebnisse dieses Prototyps stammen aus HELM Safety v1.0. Vollständige Methodik und Feldregeln:
原始项目或论文|Original project or paper|元のプロジェクト・論文|Originalprojekt oder -arbeit
参与创建、学术把关或内容建设等，按确认结果填写。|List confirmed roles in creation, academic oversight or content development.|設立・学術確認・内容制作など、確認済みの役割を記載します。|Bestätigte Rollen bei Aufbau, wissenschaftlicher Prüfung oder Inhaltserstellung angeben.
参与名单尚未确认|Contributors not yet confirmed|参加者は未確定|Mitwirkende noch nicht bestätigt
发布方|Publisher|公開元|Herausgeber
发表年份|Publication year|発表年|Veröffentlichungsjahr
叠加接触力、碰撞、危险动作和控制稳定性指标|Add contact force, collisions, hazardous actions and control stability metrics|接触力・衝突・危険動作・制御安定性の指標を追加|Kontaktkräfte, Kollisionen, gefährliche Handlungen und Regelstabilität ergänzen
只展示有原始来源的内容，不使用无关联材料填补专题。|Only show sourced content; do not fill topics with unrelated material.|原典のある内容のみを表示し、無関係な資料で分野を埋めません。|Nur belegte Inhalte zeigen; Themen nicht mit unpassendem Material füllen.
可追溯到原始材料的风险资料库入口。|A risk repository with links to original materials.|原資料までたどれるリスク資料庫。|Risikosammlung mit nachvollziehbaren Originalquellen.
合约漏洞、攻击成功率、资产损失、共识稳定性与链上隐私分别评估|Evaluate contract flaws, attack success, asset losses, consensus stability and on-chain privacy separately|契約の脆弱性・攻撃成功率・資産損失・合意の安定性・オンチェーンのプライバシーを個別評価|Vertragslücken, Angriffserfolg, Vermögensverluste, Konsensstabilität und On-Chain-Datenschutz getrennt bewerten
同时报告攻击成功率、危害程度及有害回答的可执行性|Report attack success, harm severity and actionability of harmful responses|攻撃成功率・危害の重大度・有害回答の実行可能性を併記|Angriffserfolg, Schadensschwere und Umsetzbarkeit schädlicher Antworten berichten
在工具环境中评估 LLM Agent 的提示注入攻击与防御。|Evaluates prompt-injection attacks and defenses for LLM agents in tool environments.|ツール環境で LLM エージェントへのプロンプトインジェクション攻撃と防御を評価します。|Evaluiert Prompt-Injection-Angriffe und Abwehr für LLM-Agenten in Werkzeugumgebungen.
增加越权点击、敏感数据外传、文件破坏与任务偏离指标|Add unauthorized clicks, sensitive-data exfiltration, file damage and task deviation metrics|権限外クリック・機密データ流出・ファイル破壊・タスク逸脱の指標を追加|Unbefugte Klicks, Datenabfluss, Dateibeschädigung und Aufgabenabweichung ergänzen
复制质量、查询效率、遗忘验证及保留任务能力|Copy quality, query efficiency, unlearning verification and retained task capability|複製品質・照会効率・忘却の検証・保持タスク能力|Kopierqualität, Anfrageeffizienz, Verlernen und erhaltene Aufgabenfähigkeit
姓名待确认|Name pending confirmation|氏名は確認待ち|Name noch zu bestätigen
它评估什么，或为什么值得收录？|What does it evaluate, or why should it be included?|何を評価する資料か、収録すべき理由は？|Was evaluiert es, oder warum sollte es aufgenommen werden?
安全拒答与无害请求误拒分开，避免“拒答越多越安全”|Separate safe refusals from false refusals of harmless requests; more refusal is not inherently safer|安全な拒否と無害要求の誤拒否を分け、拒否の多さを安全性と混同しない|Sichere und falsche Ablehnungen harmloser Anfragen trennen; mehr Ablehnung bedeutet nicht automatisch mehr Sicherheit
安全约束、禁区进入、碰撞率与长时程任务偏离|Safety constraints, restricted-zone entry, collision rate and long-horizon task deviation|安全制約・禁止区域への侵入・衝突率・長期タスクの逸脱|Sicherheitsgrenzen, Sperrzoneneintritte, Kollisionsrate und langfristige Aufgabenabweichung
实验推理、回答准确性、安全建议与双重用途风险|Experimental reasoning, answer accuracy, safety advice and dual-use risk|実験的推論・回答精度・安全助言・デュアルユースリスク|Experimentelles Schlussfolgern, Antwortgenauigkeit, Sicherheitshinweise und Dual-Use-Risiken
将 AI 风险描述关联到原始资料的研究数据库，可从项目页查看和获取；属于风险资料库。|A research database linking AI risks to original sources, accessible from the project page. Classified as a risk repository.|AI リスクを原典に関連付ける研究データベースです。プロジェクトページから閲覧・取得でき、リスク資料庫に分類します。|Forschungsdatenbank, die KI-Risiken mit Originalquellen verknüpft und über die Projektseite zugänglich ist; als Risikosammlung klassifiziert.
属于安全相关能力，不与直接有害行为分数混合|Safety-related capability; separate from scores for directly harmful behavior|安全関連能力として、直接的な有害行動スコアと分離|Sicherheitsrelevante Fähigkeit; getrennt von Werten direkt schädlichen Verhaltens
平台建设团队|Platform contributors|プラットフォーム運営チーム|Plattformteam
平台职责|Platform role|プラットフォームでの役割|Rolle in der Plattform
`);

addRows(`
建议指标：碰撞率｜近失率｜违规动作率｜约束满足率｜危险严重度｜OOD 表现｜人工接管次数。|Suggested metrics: collisions / near misses / violations / constraint compliance / hazard severity / OOD performance / human takeovers.|推奨指標：衝突率・ニアミス率・違反動作率・制約遵守率・危険の重大度・OOD 性能・人の介入回数。|Empfohlene Metriken: Kollisionen / Beinaheunfälle / Verstöße / Grenzeneinhaltung / Gefährdungsschwere / OOD-Leistung / menschliche Übernahmen.
当 Agent 越过任务边界：Anthropic 披露非预期操作|When agents cross task boundaries: Anthropic reports unintended actions|エージェントがタスク境界を越えるとき：Anthropic が想定外の操作を報告|Wenn Agenten Aufgabengrenzen überschreiten: Anthropic berichtet unerwartete Handlungen
必须分别展示：披露率、PII 提取率、成员推断成功率、查询成本、隐私预算、遗忘效果与保留能力。|Show disclosure, PII extraction, membership-inference success, query cost, privacy budget, unlearning and retained capability separately.|開示率・個人情報抽出率・メンバーシップ推論成功率・照会コスト・プライバシー予算・忘却効果・保持能力を別々に示します。|Offenlegung, PII-Extraktion, Mitgliedschaftsinferenz, Anfragekosten, Datenschutzbudget, Verlernen und erhaltene Fähigkeiten getrennt darstellen.
成员确认后按实际平台职责展示；机构任职、研究专长与平台贡献分别说明。|Confirmed members are listed by platform role; affiliations, research expertise and platform contributions are separate.|確認済みの参加者を実際の役割で示し、所属・専門・貢献を区別して説明します。|Bestätigte Mitglieder nach Plattformrolle darstellen; Zugehörigkeit, Expertise und Beiträge separat nennen.
按攻击目标与隐私机制分榜，避免用一个“隐私总分”掩盖不同风险。|Separate rankings by attack goal and privacy mechanism; an overall privacy score can conceal distinct risks.|攻撃目標とプライバシー機構ごとに評価を分け、総合点で異なるリスクを隠さないようにします。|Ranglisten nach Angriffsziel und Datenschutzmechanismus trennen; ein Gesamtwert kann unterschiedliche Risiken verdecken.
按研究问题寻找资料，从原始来源继续阅读与使用。|Find resources by research question, then read and use the original sources.|研究課題から資料を探し、原典で読み進め、利用します。|Quellen nach Forschungsfrage finden und in den Originalquellen weiterlesen.
按群体、语境和语言分层，保留能力与公平性权衡|Stratify by population, context and language; retain capability–fairness trade-offs|集団・文脈・言語で層別し、能力と公平性のトレードオフを残す|Nach Gruppen, Kontext und Sprache aufschlüsseln; Fähigkeit-Fairness-Abwägungen erhalten
按群体、语言与场景报告社会风险，宏平均不能替代专项结论。|Report social risks by population, language and scenario; macro averages cannot replace focused findings.|社会的リスクは集団・言語・場面ごとに報告し、マクロ平均で個別の結論を代替しません。|Gesellschaftliche Risiken nach Gruppen, Sprachen und Szenarien berichten; Makromittelwerte ersetzen keine gezielten Befunde.
按语言单列，不用宏平均掩盖低资源语言安全差异|Report each language separately; macro averages can mask safety gaps in low-resource languages|言語別に表示し、低資源言語の安全性の差をマクロ平均で隠さない|Sprachen einzeln berichten; Sicherheitslücken ressourcenarmer Sprachen nicht in Makromittelwerten verbergen
提交一条资源建议|Suggest a resource|資料を一つ提案する|Eine Ressource vorschlagen
提供原始来源，帮助编辑完善目录。|Provide the original source to help editors improve the catalog.|原典を示して、目録の充実にご協力ください。|Originalquelle angeben, um das Verzeichnis zu verbessern.
提示注入评测的任务、环境与配置入口。使用时需结合运行文档，不能当作独立问答数据集。|Tasks, environments and configurations for prompt-injection evaluation. Read the run documentation; this is not a standalone Q&A dataset.|プロンプトインジェクション評価のタスク・環境・設定への入口です。実行文書と併せて使用し、独立した Q&A データセットとは扱いません。|Aufgaben, Umgebungen und Konfigurationen zur Prompt-Injection-Evaluation. Ausführungsdokumentation beachten; kein eigenständiger Frage-Antwort-Datensatz.
攻击成功率、干净样本性能、检测率与防御代价并列|Report attack success, clean-sample performance, detection rate and defense cost together|攻撃成功率・正常サンプル性能・検出率・防御コストを併記|Angriffserfolg, Leistung auf sauberen Daten, Erkennung und Abwehrkosten gemeinsam zeigen
攻击成功率、查询成本、隐私预算与防御效果按协议建榜|Rank attack success, query cost, privacy budget and defense effects within each protocol|攻撃成功率・照会コスト・プライバシー予算・防御効果をプロトコル別に評価|Angriffserfolg, Anfragekosten, Datenschutzbudget und Abwehrwirkung je Protokoll bewerten
更容易被发现、理解和核对。|easier to discover, understand and verify.|見つけやすく、理解しやすく、確かめやすく。|leichter auffindbar, verständlich und überprüfbar machen.
有用性与无害性偏好数据，供安全对齐研究使用；版本、许可和下载方式见原始数据卡。|Helpfulness and harmlessness preference data for safety-alignment research. See the original data card for versions, licenses and downloads.|安全性アラインメント研究用の有用性・無害性の選好データです。版・ライセンス・取得方法は元のデータカードをご確認ください。|Präferenzdaten zu Hilfreichheit und Unbedenklichkeit für Alignment-Forschung. Versionen, Lizenzen und Downloads laut Original-Datenkarte.
本次选编 2026.10.18|Selection: 2026.10.18|今回の選定：2026.10.18|Auswahl: 18.10.2026
本轮视觉依据|Visual references|今回のデザイン参照|Visuelle Referenzen
机器整理|Automated organization|自動整理|Automatische Aufbereitung
机构、院系与职务 · 待确认|Institution, department & role · Pending confirmation|機関・部局・役職・確認待ち|Einrichtung, Fachbereich & Position · Noch zu bestätigen
查看插画|View illustration|イラストを見る|Illustration ansehen
查看正常任务效用、注入攻击与防御如何在同一环境中评估。|See how normal task utility, injection attacks and defenses are evaluated in the same environment.|同一環境で通常タスクの有用性・注入攻撃・防御をどう評価するかを見ます。|Aufgabennutzen, Injektionsangriffe und Abwehr in derselben Umgebung evaluieren.
根据用户提供的|Based on the user-supplied|ユーザー提供の|Auf Basis der bereitgestellten
概念插画：外部指令越过系统边界。|Concept illustration: external instructions cross a system boundary.|概念図：外部の指示がシステム境界を越える。|Konzeptillustration: Externe Anweisungen überschreiten eine Systemgrenze.
此类条目需要呈现环境、场景、随机种子、驾驶基线及安全指标。仿真和实机证据分层展示。|Record environment, scenario, random seeds, driving baselines and safety metrics. Present simulation and real-world evidence separately.|環境・場面・乱数シード・運転ベースライン・安全指標を記録し、シミュレーションと実機の根拠を分けます。|Umgebung, Szenario, Zufallsstartwerte, Fahrbaseline und Sicherheitsmetriken erfassen. Simulations- und reale Belege getrennt darstellen.
测量伦理判断、欺骗、权力追逐与互动行为风险|Measure ethical judgment, deception, power seeking and interaction risks|倫理判断・欺瞞・権力追求・対話行動のリスクを測定|Ethisches Urteil, Täuschung, Machtstreben und Interaktionsrisiken messen
测量多步骤违规动作、风险识别与防护后的任务完成率|Measure multi-step violations, risk detection and task completion with safeguards|多段階の違反動作・リスク認識・防御後のタスク達成率を測定|Mehrstufige Verstöße, Risikoerkennung und Aufgabenerfüllung mit Schutzmaßnahmen messen
热点为人工精选，当前选入三条已核对原始来源的 2026 年内容；较早记录作为归档。未启用自动或付费热点采集。HELM 模型成绩属于 2024 年历史报告。未接付费热点采集、登录、审核后台或实际资源提交。数据集、任务环境和风险资料库分别标注类型；PPT 候选与正式收录记录分开。|Highlights are manually curated: three source-checked items from 2026, with older items archived. No automated or paid news collection is active. HELM model scores come from a 2024 historical report. Login, a review backend and live submissions are not connected. Datasets, task environments and risk repositories are labeled separately; slide candidates are separate from confirmed records.|トピックスは手動選定で、原典確認済みの 2026 年の 3 件を掲載し、過去の記事は保存しています。自動・有料の収集は未使用です。HELM の成績は 2024 年の報告です。ログイン・審査バックエンド・実際の投稿は未接続。資料の種類と、スライドの候補・正式な記録を区別しています。|Meldungen werden manuell ausgewählt: drei quellengeprüfte Beiträge aus 2026, ältere im Archiv. Keine automatische oder bezahlte Nachrichtenerfassung. HELM-Werte stammen aus einem Bericht von 2024. Anmeldung, Prüfbackend und echte Einreichungen sind nicht angebunden. Ressourcentypen sowie Folienkandidaten und bestätigte Einträge sind getrennt.
热点独立列表，支持按方向、内容类型与关键词筛选。|Highlights have their own list, with topic, content-type and keyword filters.|トピックスは独立した一覧で、分野・内容種類・キーワードで絞り込めます。|Meldungen haben eine eigene Liste mit Themen-, Inhaltstyp- und Suchwortfiltern.
照片位置|Photo placeholder|写真の位置|Fotoplatzhalter
生物、化学与网络危险知识能力, 不能等同于有害协助|Hazardous knowledge in biology, chemistry and cyber domains is not equivalent to harmful assistance|生物・化学・サイバーの危険な知識能力は有害支援と同一ではない|Gefährliches Wissen in Biologie, Chemie und Cyberbereichen ist nicht gleich schädlicher Hilfe
用于数据选择和管线质量, 不直接视为隐私安全得分|For data selection and pipeline quality, not a direct privacy-safety score|データ選択とパイプライン品質のためで、直接的なプライバシー安全スコアではない|Für Datenauswahl und Pipelinequalität, kein direkter Datenschutz-Sicherheitswert
用于理解风险管理活动与评测目的的框架入口。|A framework for understanding risk-management activities and evaluation goals.|リスク管理の活動と評価目的を理解する枠組み。|Framework zum Verständnis von Risikomanagement und Evaluationszielen.
用于自动化红队测试及拒绝稳健性评估的标准化框架。|A standardized framework for automated red teaming and refusal-robustness evaluation.|自動レッドチーミングと拒否の頑健性を評価する標準化枠組み。|Standardisiertes Framework für automatisierte Red-Team-Tests und Ablehnungsrobustheit.
目录中将基准本身与第三方使用该基准发布的结果分开收录。条目链接原始项目与资料，具体运行设置仍需逐条确认。|Benchmarks and third-party results are indexed separately. Entries link to original projects and resources; run settings still require individual checks.|ベンチマーク自体と第三者の結果は分けて収録します。元のプロジェクト・資料にリンクし、実行設定は個別に確認が必要です。|Benchmarks und Ergebnisse Dritter werden getrennt erfasst. Einträge verlinken Originalprojekte und -quellen; Laufkonfigurationen sind einzeln zu prüfen.
直接安全结果优先建榜, 事实性、鲁棒性等安全相关能力单列。|Prioritize direct safety outcomes; report factuality, robustness and other safety-related capabilities separately.|直接的な安全結果を優先し、事実性・頑健性などの安全関連能力は別に表示します。|Direkte Sicherheitsergebnisse priorisieren; Faktentreue, Robustheit und andere sicherheitsrelevante Fähigkeiten separat darstellen.
研究图像加入后，多模态大模型的安全边界如何变化。|Studies how adding images changes multimodal model safety boundaries.|画像の追加でマルチモーダルモデルの安全境界がどう変わるかを研究します。|Untersucht, wie Bilder die Sicherheitsgrenzen multimodaler Modelle verändern.
研究工具环境中的提示注入攻击与防御，同时观察正常任务效用。|Studies prompt-injection attacks and defenses in tool environments alongside normal task utility.|ツール環境でのプロンプトインジェクション攻撃と防御を、通常タスクの有用性と併せて研究します。|Untersucht Prompt-Injection-Angriffe und Abwehr in Werkzeugumgebungen sowie den normalen Aufgabennutzen.
研究微调数据被投毒时，安全分类器的后门与鲁棒性如何变化，以及常规红队测试可能遗漏什么。|Studies backdoors and robustness in safety classifiers under fine-tuning-data poisoning, and what routine red teaming may miss.|微調整データの汚染が安全分類器のバックドアと頑健性に与える影響、および通常のレッドチーム試験の見落としを研究します。|Untersucht Backdoors und Robustheit von Sicherheitsklassifikatoren bei vergifteten Fine-Tuning-Daten sowie mögliche Lücken üblicher Red-Team-Tests.
研究热点置于首页顶部：三条人工精选内容，展示方向标签、发布日期与原始来源。|Three curated highlights appear at the top of the homepage, with topic tags, dates and original sources.|ホーム上部に手動選定の 3 件を表示し、分野タグ・公開日・原典を記載します。|Drei redaktionell ausgewählte Meldungen stehen oben auf der Startseite, mit Themen-Tags, Datum und Originalquellen.
碰撞、近失、交通规则、长尾场景、OOD 与人工接管|Collisions, near misses, traffic rules, long-tail scenarios, OOD and human takeovers|衝突・ニアミス・交通規則・ロングテール場面・OOD・人の介入|Kollisionen, Beinaheunfälle, Verkehrsregeln, seltene Szenarien, OOD und menschliche Übernahmen
系统边界 · 概念插画|System boundaries · Concept illustration|システム境界・概念図|Systemgrenzen · Konzeptillustration
紧凑的全站检索入口。|A compact site-wide search.|コンパクトなサイト内検索。|Kompakte Suche über die gesamte Website.
约束决策、安全探索、违规次数及奖励—安全权衡|Constrained decisions, safe exploration, violations and reward–safety trade-offs|制約付き意思決定・安全な探索・違反回数・報酬と安全のトレードオフ|Begrenzte Entscheidungen, sichere Exploration, Verstöße und Belohnungs-Sicherheits-Abwägungen
组合基准、模型评判与公开评测的适用范围。|Combined benchmarks, model-based judging and limits of public evaluations.|複合ベンチマーク・モデルによる判定・公開評価の適用範囲。|Kombinierte Benchmarks, modellgestützte Bewertung und Grenzen öffentlicher Evaluationen.
组合多项基准，呈现语言模型在不同安全任务中的表现。|Combines benchmarks to show language-model performance across safety tasks.|複数のベンチマークで、言語モデルの各安全タスクでの性能を示します。|Kombiniert Benchmarks, um Sprachmodellleistung über Sicherheitsaufgaben hinweg zu zeigen.
结果按具体任务、模型与输入设置解释，不直接视为一般视觉能力。|Interpret results for specific tasks, models and input settings, not general visual capability.|結果は具体的なタスク・モデル・入力設定に基づいて解釈し、一般的な視覚能力とは見なしません。|Ergebnisse je Aufgabe, Modell und Eingabekonfiguration interpretieren, nicht als allgemeine Sehfähigkeit.
统一场景、危害类别与可信维度, 按版本和协议分别建榜|Align scenarios, harm categories and trust dimensions; rank separately by version and protocol|場面・危害分類・信頼の観点を揃え、版とプロトコルで分けて評価|Szenarien, Schadenskategorien und Vertrauensdimensionen vereinheitlichen; nach Version und Protokoll trennen
能力、实际攻击行为与威胁知识库分别呈现，不直接合榜|Separate capabilities, actual attack behavior and threat knowledge bases|能力・実際の攻撃行動・脅威知識ベースを分けて示す|Fähigkeiten, tatsächliches Angriffsverhalten und Bedrohungswissen getrennt darstellen
能力环境需叠加授权边界、危险调用和策略遵守指标|Add authorization boundaries, dangerous calls and policy-compliance metrics to capability environments|能力評価環境に権限境界・危険な呼び出し・方針遵守の指標を追加|Fähigkeitsumgebungen um Berechtigungsgrenzen, gefährliche Aufrufe und Richtlinientreue ergänzen
行业测试与治理框架用于流程约束，不直接当作单一模型分数|Industry tests and governance frameworks constrain processes; they are not single-model scores|業界の試験・ガバナンス枠組みはプロセスの制約用で、単一モデルのスコアではない|Branchentests und Governance-Frameworks begrenzen Prozesse und sind keine Einzelmodellwerte
补充说明|Additional notes|補足説明|Ergänzende Hinweise
覆盖隐性仇恨、对抗样本和逐项功能诊断|Covers implicit hate, adversarial examples and functional diagnostics|暗黙のヘイト・敵対的サンプル・機能別診断を対象|Umfasst impliziten Hass, adversariale Beispiele und Funktionsdiagnosen
让 AI 安全研究|Making AI safety research|AI 安全性の研究を|KI-Sicherheitsforschung
训练数据投毒，能否给安全分类器植入后门？|Can training-data poisoning implant backdoors in safety classifiers?|学習データの汚染で、安全分類器にバックドアを仕込めるか？|Können vergiftete Trainingsdaten Backdoors in Sicherheitsklassifikatoren einschleusen?
记录判分标准、拒绝类别与任务条件，避免将一律拒绝视为更安全。|Record scoring rules, refusal categories and task conditions; blanket refusal is not inherently safer.|採点基準・拒否の種類・タスク条件を記録し、一律の拒否をより安全とは見なしません。|Bewertungsregeln, Ablehnungskategorien und Aufgabenbedingungen erfassen; pauschale Ablehnung bedeutet nicht mehr Sicherheit.
记录注入入口、工具权限、正常效用及攻击目标成功率|Record injection entry points, tool permissions, normal utility and attack-goal success|注入経路・ツール権限・通常時の有用性・攻撃目標の成功率を記録|Injektionspunkte, Werkzeugberechtigungen, normalen Nutzen und Angriffszielerfolg erfassen
论文目录补充|Bibliography update|論文目録の追加|Ergänzung des Literaturverzeichnisses
设计交接说明|Design handover notes|デザイン引き継ぎ資料|Design-Übergabehinweise
评价原则|Evaluation principles|評価の原則|Evaluationsgrundsätze
评测对象是“模型＋框架＋防御＋权限”的完整配置，而非单一模型。|The evaluated system is the full model + framework + defenses + permissions configuration, not just a model.|評価対象はモデル単体ではなく、モデル＋枠組み＋防御＋権限の完全な設定です。|Evaluiert wird die vollständige Konfiguration aus Modell + Framework + Abwehr + Berechtigungen, nicht nur ein Modell.
资料与功能边界|Resource & feature limits|資料と機能の範囲|Grenzen von Quellen & Funktionen
资料与引用|Sources & references|資料と引用|Quellen & Referenzen
资料入口|Resource links|資料への入口|Ressourcenlinks
资料类型|Resource category|資料の分類|Ressourcenkategorie
资源名称|Resource name|資料名|Ressourcenname
资源类型|Resource type|資料の種類|Ressourcentyp
这一示例展示组合式评测条目的布局。HELM Safety v1.0 将不同任务组织到共同评测框架中，并公开模型、判分及评价局限。|This example shows a combined-evaluation entry. HELM Safety v1.0 organizes different tasks in one framework and publishes models, scoring and limitations.|複合評価項目の表示例です。HELM Safety v1.0 は異なるタスクを共通枠組みにまとめ、モデル・採点・限界を公開しています。|Dieses Beispiel zeigt einen kombinierten Evaluationseintrag. HELM Safety v1.0 bündelt Aufgaben in einem Framework und veröffentlicht Modelle, Bewertung und Grenzen.
这是交互设计演示。填写内容不会发送到服务器，也不会在关闭页面后保存。|This is an interaction demo. Entries are not sent to a server or saved after the page closes.|操作のデモです。入力内容はサーバーに送信せず、ページを閉じた後も保存しません。|Dies ist eine Interaktionsdemo. Eingaben werden weder an einen Server gesendet noch nach dem Schließen gespeichert.
这是成员资料的展示结构，不对应任何已确认的人。拟议名单和公开研究履历不能单独证明参与本平台。|This is a profile template, not a confirmed person. Proposed lists and public research profiles do not establish platform participation.|参加者の表示テンプレートで、確認済みの人物ではありません。候補名簿や公開の研究経歴だけで参加を証明するものではありません。|Dies ist eine Profilvorlage, keine bestätigte Person. Vorschlagslisten und öffentliche Forschungsprofile belegen keine Plattformbeteiligung.
这里介绍参与创建与维护 Index 的教授和共建者。|This section introduces professors and contributors who build and maintain Index.|Index の設立・運営に参加する教員と共同制作者を紹介する欄です。|Hier werden Professoren und Mitwirkende vorgestellt, die Index aufbauen und pflegen.
通过良性与有害边界测试，识别语言模型的过度拒绝。|Tests benign and harmful boundaries to identify excessive refusal in language models.|無害・有害の境界テストで、言語モデルの過剰拒否を特定します。|Prüft harmlose und schädliche Grenzfälle, um übermäßige Ablehnung in Sprachmodellen zu erkennen.
配图与字体|Illustration & typography|イラストと書体|Illustration & Typografie
门户连接原始资料、评测配置与结论。收录状态、复核状态和结果执行方分别记录。|The portal links primary sources, evaluation configurations and conclusions. Inclusion status, review status and evaluation authors are recorded separately.|原資料・評価設定・結論をつなぎ、収録状況・確認状況・評価実施者を分けて記録します。|Das Portal verknüpft Primärquellen, Evaluationskonfigurationen und Schlussfolgerungen. Aufnahme, Prüfung und Evaluationsdurchführende werden getrennt erfasst.
阅读原文|Read original|原文を読む|Original lesen
面向自动驾驶安全评测的场景与测试平台。|Scenarios and a testing platform for autonomous-driving safety.|自動運転の安全性を評価するシナリオと試験基盤。|Szenarien und Testplattform für die Sicherheit autonomen Fahrens.
页面说明 · AI Safety Index|Site notes · AI Safety Index|サイトの説明 · AI Safety Index|Website-Hinweise · AI Safety Index
页面，重做排版：集中主次内容、用真实资料构成页面、收紧控件数量、以字体和留白区分层级。原有信息结构与交互继续保留。|pages, the layout prioritizes primary content, uses real sources, reduces controls and establishes hierarchy through typography and space. The information structure and interactions remain.|ページを参考に、主従を明確にし、実資料を使い、操作部品を絞り、書体と余白で階層を表しました。情報構造と操作を維持しています。|wurde das Layout neu geordnet: klare Prioritäten, echte Quellen, weniger Bedienelemente und Hierarchie durch Schrift und Weißraum. Informationsstruktur und Interaktionen bleiben erhalten.
预览提交反馈|Preview submission feedback|投稿後の表示をプレビュー|Rückmeldung zur Einreichung ansehen
风险资料库|Risk repository|リスク資料庫|Risikosammlung
首屏插图由内置图像生成工具制作，表达外部指令进入系统边界的概念，不是论文图或实验结果。|The opening illustration was made with the built-in image generator to depict external instructions entering a system. It is not a paper figure or experimental result.|冒頭の画像は内蔵の画像生成ツールで制作した概念図で、外部指示がシステムに入る様子を示します。論文図や実験結果ではありません。|Die Einstiegsillustration wurde mit dem integrierten Bildgenerator erstellt und zeigt externe Anweisungen im System. Sie ist weder Forschungsabbildung noch Versuchsergebnis.
首批建议：HarmBench、JailbreakBench、StrongREJECT、XSTest、TruthfulQA、BBQ、MM-SafetyBench。|Initial candidates: HarmBench, JailbreakBench, StrongREJECT, XSTest, TruthfulQA, BBQ, MM-SafetyBench.|最初の候補：HarmBench・JailbreakBench・StrongREJECT・XSTest・TruthfulQA・BBQ・MM-SafetyBench。|Erste Kandidaten: HarmBench, JailbreakBench, StrongREJECT, XSTest, TruthfulQA, BBQ, MM-SafetyBench.
首版 Security Index：同任务、同预算成对测试正常条件与攻击条件, 效用、越权、泄露和成本分别展示。|Initial Security Index: pair normal and adversarial tests with identical tasks and budgets; report utility, unauthorized actions, leakage and cost separately.|初版 Security Index：同じタスクと予算で通常時・攻撃時を対にして試験し、有用性・権限逸脱・漏洩・コストを別々に示します。|Erster Security Index: Normal- und Angriffstests bei gleichen Aufgaben und Budgets paaren; Nutzen, unbefugte Aktionen, Lecks und Kosten separat zeigen.
首页阅读顺序|Homepage reading order|ホームの閲覧順序|Lesereihenfolge der Startseite
`);

addRows(`
推荐资料|Suggested resources|おすすめの資料|Empfohlene Ressourcen
试试基准名称，或更简短的关键词。|Try a benchmark name or a shorter keyword.|ベンチマーク名や短いキーワードでお試しください。|Benchmark-Namen oder kürzeres Suchwort versuchen.
提交反馈演示完成；内容未发送或保存。|Submission demo complete; nothing was sent or saved.|投稿デモが完了しました。内容は送信・保存していません。|Einreichungsdemo abgeschlossen; nichts wurde gesendet oder gespeichert.
这个方向的论文资料正在整理。|Papers for this topic are being organized.|この分野の論文資料を整理中です。|Publikationen für dieses Thema werden aufbereitet.
AI Safety Index 门户交互设计原型：基准、评测结果、研究热点与来源。|AI Safety Index: benchmarks, evaluation results, research highlights and sources.|AI Safety Index：ベンチマーク・評価結果・研究トピックス・出典。|AI Safety Index: Benchmarks, Evaluationsergebnisse, Forschungshighlights und Quellen.
`);
addRows(`
AI Safety Index · 开放的研究与评测门户|AI Safety Index · An open research & evaluation portal|AI Safety Index · 開かれた研究・評価ポータル|AI Safety Index · Offenes Portal für Forschung & Evaluation
AI 安全横跨数据、模型、系统、人与专业领域。我们希望让不同背景的人找到共同的问题和可追溯的依据。|AI safety spans data, models, systems, people and specialized fields. We help people from different backgrounds find shared questions and traceable evidence.|AI の安全性はデータ、モデル、システム、人、専門分野にまたがります。さまざまな背景を持つ人が、共通の問いと出典をたどれる根拠を見つけられる場を目指します。|KI-Sicherheit betrifft Daten, Modelle, Systeme, Menschen und Fachgebiete. Menschen mit unterschiedlichem Hintergrund sollen hier gemeinsame Fragen und nachvollziehbare Belege finden.
一个长期维护的安全研究入口|A lasting resource for AI safety research|継続的に整備する AI 安全性研究の入口|Ein dauerhaft gepflegter Zugang zur KI-Sicherheitsforschung
一步一步，把平台建起来。|Building the platform, step by step.|一歩ずつ、プラットフォームを育てる。|Schritt für Schritt zur gemeinsamen Plattform.
一起完善 AI 安全的研究入口。|Help build a better resource for AI safety research.|AI 安全性研究の入口を、一緒に充実させる。|Gemeinsam den Zugang zur KI-Sicherheitsforschung verbessern.
上传资源|Upload a resource|資料をアップロード|Ressource hochladen
下载联系草稿|Download contact draft|連絡文の下書きをダウンロード|Kontaktentwurf herunterladen
不止于收集链接，也帮助理解问题、方法与证据之间的关系。|Beyond collecting links, we connect research questions, methods and evidence.|リンクの収集に加え、研究の問い・手法・根拠のつながりを伝えます。|Wir sammeln Links und machen die Beziehungen zwischen Forschungsfragen, Methoden und Belegen verständlich.
不用在分散的论文、项目与榜单之间反复寻找。这里把相关资料连在一起。|Find related resources together, without searching across scattered papers, projects and rankings.|分散した論文・プロジェクト・ランキングを行き来せず、関連資料をまとめて探せます。|Zusammengehörige Quellen an einem Ort finden, ohne verstreute Arbeiten, Projekte und Ranglisten einzeln zu durchsuchen.
为研究者、开发者和关注 AI 安全的人，|For researchers, developers and everyone interested in AI safety,|研究者、開発者、AI の安全性に関心を持つすべての人へ、|Für Forschende, Entwickelnde und alle, die sich für KI-Sicherheit interessieren,
了解建设团队|Meet the team|運営チームについて|Das Team kennenlernen
人工精选|Editorial selection|手動選定|Redaktionelle Auswahl
人工精选与归档|Editorial picks & archive|手動選定とアーカイブ|Redaktionelle Auswahl & Archiv
介绍你的背景，或说明资源为什么值得收录。|Describe your background or explain why this resource should be included.|ご自身の背景、または資料を収録すべき理由をお書きください。|Beschreiben Sie Ihren Hintergrund oder warum die Ressource aufgenommen werden sollte.
从你关心的方向进入|Start with a topic that matters to you|関心のある分野から探す|Mit einem Thema Ihres Interesses beginnen
从六大研究方向出发，串起相关论文、数据、任务与评测。|Explore six research topics and their related papers, data, tasks and evaluations.|6 つの研究分野から、関連する論文・データ・タスク・評価をたどれます。|Sechs Forschungsthemen verbinden relevante Arbeiten, Daten, Aufgaben und Evaluationen.
从研究问题，找到可靠依据。|From research questions to reliable evidence.|研究の問いから、確かな根拠へ。|Von Forschungsfragen zu verlässlichen Belegen.
你的姓名|Your name|お名前|Ihr Name
保留来源、版本和测试条件，让结论可以被核对。|Preserve sources, versions and test conditions so conclusions can be checked.|結論を検証できるよう、出典・版・テスト条件を残します。|Quellen, Versionen und Testbedingungen erhalten, damit sich Schlussfolgerungen prüfen lassen.
全部方式|All methods|すべての収集方法|Alle Verfahren
内容筹备中|Content in preparation|コンテンツを準備中|Inhalte in Vorbereitung
准备联系草稿|Prepare a contact draft|連絡文の下書きを作成|Kontaktentwurf vorbereiten
分享团队对 AI 安全研究与实践的思考。|The team's perspectives on AI safety research and practice.|AI の安全性に関する研究と実践について、チームの考えを共有します。|Gedanken des Teams zu Forschung und Praxis der KI-Sicherheit.
加入中文、英文、日文和德文，切换语言时保留当前页面和筛选。|Added Chinese, English, Japanese and German, with language switching that preserves the current page and filters.|中国語・英語・日本語・ドイツ語に対応し、言語を切り替えても現在のページと絞り込み条件を維持します。|Chinesisch, Englisch, Japanisch und Deutsch ergänzt; beim Sprachwechsel bleiben die aktuelle Seite und die Filter erhalten.
加入我们|Join us|参加する|Mitmachen
协作方向|Ways to contribute|協力できる分野|Möglichkeiten zur Mitarbeit
协助完善研究方向框架，核对专业资料与重要结论。|Help refine the research framework and verify specialist sources and key findings.|研究分野の枠組みを整え、専門資料や重要な結論の確認にご協力ください。|Den Forschungsrahmen weiterentwickeln sowie Fachquellen und zentrale Ergebnisse prüfen.
博客暂未发布文章，以上为计划中的内容栏目。|No blog posts have been published yet. The sections above are planned.|ブログ記事はまだ公開していません。上記は予定している記事の区分です。|Bisher wurden keine Blogbeiträge veröffentlicht. Die oben genannten Rubriken sind geplant.
原始来源发布的 AI 安全相关资讯；请进入原文核对内容。|AI safety updates from original publishers. Open the source to verify the content.|公開元からの AI 安全性に関する情報です。内容は原文でご確認ください。|Meldungen zur KI-Sicherheit von den Originalherausgebern. Bitte den Inhalt in der Originalquelle prüfen.
参与平台建设，或分享值得收录的公开资源。|Help build the platform or share public resources worth including.|プラットフォームの整備や、収録すべき公開資料の共有にご参加ください。|Am Aufbau der Plattform mitwirken oder geeignete öffentliche Quellen vorschlagen.
参与平台建设，或推荐值得收录的 AI 安全资源。|Help build the platform or suggest AI safety resources worth including.|プラットフォームの整備や、収録すべき AI 安全性資料の推薦にご参加ください。|Am Aufbau der Plattform mitwirken oder geeignete Quellen zur KI-Sicherheit empfehlen.
参与教授与成员的姓名、机构、研究背景和平台职责将在确认后发布。|Participating professors' and members' names, affiliations, research backgrounds and platform roles will be published after confirmation.|参加する教員・メンバーの氏名、所属、研究背景、担当は確認後に公開します。|Namen, Institutionen, Forschungshintergründe und Aufgaben der beteiligten Professorinnen, Professoren und Mitglieder werden nach Bestätigung veröffentlicht.
名单待确认|Membership pending confirmation|参加者は確認待ち|Mitgliederliste noch zu bestätigen
四种语言切换|Four-language switching|4 言語の切り替え|Wechsel zwischen vier Sprachen
团队成员资料正在确认|Team profiles are being confirmed|チームメンバーの情報を確認中|Teamprofile werden geprüft
在联系我们页面了解加入方式和需要准备的信息。|Visit the contact page for ways to join and the information to prepare.|参加方法や必要な情報は、お問い合わせページをご覧ください。|Auf der Kontaktseite erfahren Sie, wie Sie mitmachen und welche Angaben benötigt werden.
学术与研究|Academic research|学術・研究|Wissenschaft & Forschung
希望参与平台建设？|Want to help build the platform?|プラットフォームの整備に参加しませんか？|Möchten Sie am Aufbau der Plattform mitwirken?
平台博客|Platform blog|プラットフォームのブログ|Plattform-Blog
平台需要哪些协作|Where your help is needed|協力をお願いしたいこと|Wo Unterstützung gebraucht wird
建立研究方向、基准目录、评测结果与研究动态的首版页面。|Built the first pages for research topics, benchmarks, evaluation results and research updates.|研究分野、ベンチマーク目録、評価結果、研究トピックスの初版ページを作成しました。|Erste Seiten für Forschungsthemen, Benchmarks, Evaluationsergebnisse und Forschungsneuigkeiten erstellt.
开始探索|Start exploring|探し始める|Jetzt entdecken
开放公开访问|Opened to the public|一般公開|Öffentlich zugänglich
开放的 AI 安全研究与评测资料|Open resources for AI safety research & evaluation|開かれた AI 安全性の研究・評価資料|Offene Quellen für Forschung & Evaluation zur KI-Sicherheit
彩色漂浮人物插画|Illustration of colorful floating figures|色とりどりの人物が浮かぶイラスト|Illustration mit schwebenden, farbigen Figuren
找到合适的基准|Find the right benchmark|適切なベンチマークを探す|Den passenden Benchmark finden
按方向浏览精选动态和自动采集的原始资讯，回到发布方阅读。|Browse selected updates and automatically collected source feeds by topic, then read them on the publisher's site.|選定したトピックスや自動収集した公開元の情報を分野別に探し、公開元で原文を読めます。|Ausgewählte Meldungen und automatisch erfasste Quellen nach Thema durchsuchen und beim Herausgeber lesen.
按研究问题组织资料，允许一个条目关联多个方向。|Organize resources by research question, allowing each entry to link to several topics.|研究の問いに沿って資料を整理し、一つの項目を複数の分野に関連付けます。|Quellen nach Forschungsfragen ordnen; ein Eintrag kann mehreren Themen zugeordnet sein.
探索研究方向|Explore research topics|研究分野を探す|Forschungsthemen entdecken
探索论文资料|Explore papers|論文資料を探す|Publikationen entdecken
接入 OpenAI 与 Google DeepMind 的公开 RSS，按标题和分类关键词筛选。仅收集元数据，方向标签待复核，不覆盖全部研究进展。|Uses public RSS feeds from OpenAI and Google DeepMind, filtered by title and category keywords. Only metadata is collected. Topic tags await review; coverage is not comprehensive.|OpenAI と Google DeepMind の公開 RSS を題名や分類のキーワードで絞り込みます。収集はメタデータのみで、分野タグは確認待ちです。研究動向を網羅するものではありません。|Öffentliche RSS-Feeds von OpenAI und Google DeepMind werden nach Titel- und Kategoriebegriffen gefiltert. Erfasst werden nur Metadaten. Themen-Tags sind noch zu prüfen; die Abdeckung ist nicht vollständig.
接入 OpenTAI 公开目录中的论文元数据，并保留原始链接和来源记录。|Imported paper metadata from OpenTAI's public catalog, preserving original links and source records.|OpenTAI の公開目録から論文のメタデータを取り込み、原リンクと出典記録を保持しました。|Publikationsmetadaten aus dem öffentlichen OpenTAI-Verzeichnis importiert; Originallinks und Quellennachweise bleiben erhalten.
接收渠道待配置|Contact channel not yet configured|連絡の受付先は準備中|Kontaktkanal noch einzurichten
推荐论文、数据、基准或评测结果。请提供公开原始链接、研究方向和收录理由。|Suggest papers, data, benchmarks or evaluation results. Include a public original-source link, research topic and reason for inclusion.|論文・データ・ベンチマーク・評価結果をご推薦ください。公開されている原資料のリンク、研究分野、収録すべき理由を添えてください。|Arbeiten, Daten, Benchmarks oder Evaluationsergebnisse empfehlen. Bitte öffentlichen Originallink, Forschungsthema und Aufnahmegrund angeben.
收录方式|Collection method|収集方法|Erfassungsverfahren
改进检索、分类与多语言体验，维护平台和更新工具。|Improve search, classification and multilingual access, and maintain the platform and update tools.|検索・分類・多言語での使いやすさを改善し、プラットフォームと更新ツールを保守します。|Suche, Kategorisierung und mehrsprachige Nutzung verbessern sowie Plattform und Aktualisierungswerkzeuge pflegen.
整理共享论文库|Built a shared paper library|共通の論文庫を整備|Gemeinsame Publikationssammlung aufgebaut
整理来源、基准版本和实验条件，补充公开研究资源。|Organize sources, benchmark versions and experimental conditions, and add public research resources.|出典、ベンチマークの版、実験条件を整理し、公開研究資料を追加します。|Quellen, Benchmark-Versionen und Versuchsbedingungen ordnen und öffentliche Forschungsquellen ergänzen.
有据可循。|grounded in evidence.|確かな根拠を。|mit nachvollziehbaren Belegen.
让 AI 安全研究，|AI safety research,|AI 安全性の研究に、|KI-Sicherheitsforschung,
条论文记录|paper records|件の論文記録|Publikationseinträge
查找评测基准|Find evaluation benchmarks|評価ベンチマークを探す|Evaluationsbenchmarks finden
查看研究热点|View research highlights|研究トピックスを見る|Forschungshighlights ansehen
梳理重要论文中的方法、证据与适用边界。|Examine the methods, evidence and limits of key papers.|重要な論文の手法・根拠・適用範囲を整理します。|Methoden, Belege und Geltungsgrenzen wichtiger Arbeiten einordnen.
检索评测对象、任务与指标，查看基准版本、代码和使用条件。|Search evaluation targets, tasks and metrics, and check benchmark versions, code and terms of use.|評価対象・タスク・指標から検索し、ベンチマークの版、コード、利用条件を確認できます。|Nach Evaluationsgegenständen, Aufgaben und Metriken suchen und Benchmark-Versionen, Code sowie Nutzungsbedingungen prüfen.
欢迎参与研究框架、资料整理、评测与平台开发。请介绍你的背景、关注方向和希望参与的工作。|Contribute to the research framework, resource curation, evaluation or platform development. Tell us about your background, interests and the work you would like to do.|研究の枠組み、資料整理、評価、開発への参加を歓迎します。ご自身の背景、関心分野、希望する活動をお知らせください。|Beiträge zum Forschungsrahmen, zur Quellenpflege, Evaluation oder Plattformentwicklung sind willkommen. Stellen Sie Ihren Hintergrund, Ihre Interessen und die gewünschte Mitarbeit vor.
浏览人工精选、归档资料与自动采集的公开资讯，按方向和类型筛选。|Browse editorial picks, archived resources and automatically collected public updates, filtered by topic and type.|手動選定・保存資料・自動収集した公開情報を、分野や種類で絞り込んで探せます。|Redaktionelle Auswahl, Archivquellen und automatisch erfasste öffentliche Meldungen nach Thema und Typ durchsuchen.
理清研究版图|Map the research landscape|研究の全体像をつかむ|Die Forschungslandschaft verstehen
留给更深入的解读、思考与讨论。|A space for deeper analysis, reflection and discussion.|より深い解説、考察、議論のための場です。|Raum für vertiefende Analysen, Gedanken und Diskussionen.
研究团队|Research team|研究チーム|Forschungsteam
研究解读|Research insights|研究の解説|Forschung erklärt
精选与自动采集 · 评测保留来源版本|Editorial picks & automated feeds · Versioned evaluation sources|手動選定・自動収集／評価には出典と版を記載|Redaktionelle Auswahl & automatische Erfassung · Versionierte Evaluationsquellen
结合模型版本和测试设置阅读已发布成绩，了解比较边界。|Read published results with their model versions and test settings to understand the limits of comparison.|公開結果をモデルの版やテスト設定と併せて読み、比較できる範囲を確認します。|Veröffentlichte Ergebnisse mit Modellversionen und Testbedingungen lesen, um Vergleichsgrenzen zu verstehen.
联系我们|Contact us|お問い合わせ|Kontakt
联系目的|Purpose of contact|お問い合わせの目的|Kontaktanliegen
联系邮箱|Email address|メールアドレス|E-Mail-Adresse
联系邮箱或表单地址确认后开放发送。目前可填写并下载草稿，内容不会上传。|Sending will be available once an email address or form is confirmed. For now, fill in and download a draft; nothing is uploaded.|連絡先のメールアドレスまたはフォームを確認後、送信を受け付けます。現在は入力して下書きをダウンロードでき、内容はアップロードされません。|Der Versand wird nach Bestätigung einer E-Mail-Adresse oder eines Formulars freigeschaltet. Bis dahin können Sie einen Entwurf ausfüllen und herunterladen; es wird nichts hochgeladen.
背景或资源说明|Background or resource details|ご自身の背景・資料の説明|Hintergrund oder Angaben zur Ressource
自动采集|Automated collection|自動収集|Automatische Erfassung
自动采集 · 待复核|Automatically collected · Awaiting review|自動収集・確認待ち|Automatisch erfasst · Prüfung ausstehend
自动采集范围|Automated collection scope|自動収集の範囲|Umfang der automatischen Erfassung
草稿只在当前页面处理，不会发送到任何服务器。|Your draft is processed only on this page and is not sent to any server.|下書きはこのページ内でのみ処理し、サーバーには送信しません。|Der Entwurf wird nur auf dieser Seite verarbeitet und an keinen Server gesendet.
观点与讨论|Perspectives & discussion|視点と議論|Perspektiven & Diskussion
解释指标与实验条件，讨论结果意味着什么。|Explain metrics and experimental conditions, and discuss what the results mean.|指標や実験条件を説明し、結果の意味を考えます。|Metriken und Versuchsbedingungen erklären und die Bedeutung der Ergebnisse diskutieren.
让分散的研究，形成共同的视野。|Connecting scattered research into a shared view.|分散した研究を、共通の視野へ。|Verstreute Forschung zu einem gemeinsamen Bild verbinden.
记录已完成的建设节点，后续在这里持续更新。|A record of completed milestones, with further updates to follow.|完了した整備の節目を記録し、今後もここで更新します。|Abgeschlossene Meilensteine dokumentieren; weitere Fortschritte werden hier ergänzt.
设计与开发|Design & development|デザイン・開発|Design & Entwicklung
评测观察|Evaluation notes|評価を読み解く|Einblicke in Evaluationen
请选择方向|Choose a topic|分野を選択してください|Thema auswählen
读懂公开结果|Understand published results|公開結果を読み解く|Veröffentlichte Ergebnisse verstehen
资料与评测|Resources & evaluation|資料と評価|Quellen & Evaluation
资源或个人主页链接|Resource or personal website link|資料・個人サイトのリンク|Link zur Ressource oder persönlichen Website
跟进研究进展|Follow research progress|研究の進展を追う|Forschungsfortschritte verfolgen
近期研究动态|Recent research updates|最近の研究トピックス|Aktuelle Forschungsneuigkeiten
连接不同研究方向，共同建设可追溯的 AI 安全资料平台。|Connect research topics and build a shared AI safety resource platform with traceable sources.|異なる研究分野をつなぎ、出典をたどれる AI 安全性資料の基盤を共に整えます。|Forschungsthemen verbinden und gemeinsam eine Plattform für KI-Sicherheitsquellen mit nachvollziehbaren Belegen aufbauen.
连接研究方向、论文、数据与评测依据。|Connect research topics, papers, data and evaluation evidence.|研究分野・論文・データ・評価の根拠をつなぎます。|Forschungsthemen, Arbeiten, Daten und Evaluationsbelege verbinden.
逐步完善收录与复核，持续补充研究中的空白。|Improve inclusion and review processes over time, and keep filling gaps in research coverage.|収録と確認の仕組みを少しずつ整え、資料の不足を継続的に補います。|Aufnahme und Prüfung schrittweise verbessern und Lücken in der Forschungsabdeckung laufend schließen.
通过 GitHub Pages 发布，让访问者无需登录即可浏览资料。|Published on GitHub Pages so visitors can browse resources without signing in.|GitHub Pages で公開し、ログインなしで資料を閲覧できるようにしました。|Auf GitHub Pages veröffentlicht, damit Quellen ohne Anmeldung zugänglich sind.
门户原型搭建|Portal prototype built|ポータルの試作版を構築|Portal-Prototyp erstellt
项评测基准|evaluation benchmarks|件の評価ベンチマーク|Evaluationsbenchmarks
数据采集时间：|Data collected:|データ収集日時：|Datenerfassung:
热点资料有更新。|Research highlights have been updated.|研究トピックスが更新されました。|Die Forschungshighlights wurden aktualisiert.
刷新列表|Refresh list|一覧を更新|Liste aktualisieren
部分来源更新失败，保留上次数据。|Some sources could not be updated. Their previous data has been kept.|一部の出典を更新できませんでした。前回のデータを保持しています。|Einige Quellen konnten nicht aktualisiert werden. Die bisherigen Daten bleiben erhalten.
联系草稿已生成，请保存文件。内容尚未发送。|Your contact draft is ready. Save the file; it has not been sent.|連絡文の下書きを作成しました。ファイルを保存してください。内容はまだ送信されていません。|Ihr Kontaktentwurf ist fertig. Bitte speichern Sie die Datei; der Inhalt wurde noch nicht gesendet.
`);
addRows(`
AI Safety Index · 研究与评测门户|AI Safety Index · Research & evaluation|AI Safety Index · 研究・評価ポータル|AI Safety Index · Forschung & Evaluation
`);
addRows(`
研究主题概念封面|Conceptual research cover|研究テーマのコンセプト表紙|Konzeptionelles Forschungstitelbild
主题封面|Concept cover|コンセプト表紙|Konzepttitelbild
筛选与搜索|Filter & search|絞り込み・検索|Filtern & suchen
`);
addRows(`
展开子栏目|Expand subcategories|サブメニューを開く|Untermenü öffnen
`);
addRows(`
教授|Professor|教授|Professor
参与成员|Contributing member|参加メンバー|Mitwirkendes Mitglied
香港理工大学|The Hong Kong Polytechnic University|香港理工大学|Hong Kong Polytechnic University
东京理科大学|Tokyo University of Science|東京理科大学|Tokyo University of Science
`);
const ordered=()=>[...dictionary.keys()].sort((a,b)=>b.length-a.length);
let keys,fragmentPattern;
function translate(value,language){
 const text=String(value??'');if(!languages.includes(language)||language==='zh'||!text.trim())return text;
 const core=text.trim(),padStart=text.slice(0,text.length-text.trimStart().length),padEnd=text.slice(text.trimEnd().length);
 if(dictionary.has(core))return padStart+dictionary.get(core)[language]+padEnd;
 const at=(en,ja,de)=>({en,ja,de}[language]);
 let out=core;
 out=out.replace(/来源：safety index\.pptx（2026-10-17 提供与整理）第 (\d+) 页；中文导读为网页整理，英文子方向保留原文。当前仍为拟议框架。/g,(_,n)=>at(`Source: safety index.pptx, slide ${n}, supplied and organized on 2026-10-17. Introductions are editorial; English subtopics retain the original wording. This remains a proposed framework.`,`出典：safety index.pptx 第 ${n} 頁（2026-10-17 提供・整理）。導入文はサイト編集、英語の下位分野は原文を保持。現在も提案段階の枠組みです。`,`Quelle: safety index.pptx, Folie ${n}, bereitgestellt und geordnet am 17.10.2026. Einleitungen sind redaktionell; englische Unterthemen bleiben im Original. Das Framework ist weiterhin ein Vorschlag.`));
 out=out.replace(/年份由新到旧 · /g,at('Newest year first · ','年の新しい順・','Neueste Jahre zuerst · '));
 out=out.replace(/显示 ([\d–]+) 条/g,(_,n)=>at(`Showing ${n}`,`${n} 件を表示`,`Einträge ${n}`));
 out=out.replace(/第 (\d+) \/ (\d+) 页/g,(_,n,total)=>at(`Page ${n} of ${total}`,`${n} / ${total} ページ`,`Seite ${n} von ${total}`));
 out=out.replace(/第 (\d+) 页/g,(_,n)=>at(`Page ${n}`,`${n} ページ`,`Seite ${n}`));
 out=out.replace(/已选 (\d+) 条同协议记录/g,(_,n)=>at(`${n} records selected within one protocol`,`同一プロトコルの ${n} 件を選択`,`${n} Einträge im selben Protokoll ausgewählt`));
 out=out.replace(/(\d+) 条论文记录/g,(_,n)=>at(`${n} paper records`,`${n} 件の論文`,`${n} Publikationseinträge`));
 out=out.replace(/(\d+) 条数据与资料记录/g,(_,n)=>at(`${n} data & resource records`,`${n} 件のデータ・資料`,`${n} Daten- & Ressourceneinträge`));
 out=out.replace(/(\d+) 条基准示例/g,(_,n)=>at(`${n} benchmark examples`,`${n} 件のベンチマーク例`,`${n} Benchmark-Beispiele`));
 out=out.replace(/(\d+) 条已核验评测资源/g,(_,n)=>at(`${n} reviewed evaluation resources`,`${n} 件の確認済み評価資料`,`${n} geprüfte Evaluationsressourcen`));
 out=out.replace(/(\d+) 条精选与归档/g,(_,n)=>at(`${n} curated & archived items`,`${n} 件の選定・保存資料`,`${n} ausgewählte & archivierte Beiträge`));
 out=out.replace(/(\d+) 条记录/g,(_,n)=>at(`${n} records`,`${n} 件の記録`,`${n} Einträge`));
 out=out.replace(/(\d+) 篇论文/g,(_,n)=>at(`${n} papers`,`${n} 本の論文`,`${n} Publikationen`));
 out=out.replace(/等（共 (\d+) 位作者）/g,(_,n)=>at(`et al. (${n} authors)`,`ほか（著者 ${n} 名）`,`u. a. (${n} Autoren)`));
 out=out.replace(/(\d+) 年公开报告/g,(_,n)=>at(`${n} published report`,`${n} 年の公開報告`,`${n} veröffentlichter Bericht`));
 out=out.replace(/选择 (.+?) 进行对比/g,(_,n)=>at(`Select ${n} for comparison`,`${n} を比較に選択`,`${n} zum Vergleich auswählen`));
 out=out.replace(/查看 (.+?) 详情/g,(_,n)=>at(`View ${n} details`,`${n} の詳細を見る`,`${n}: Details ansehen`));
 out=out.replace(/(.+?) 尚无已录入结果/g,(_,n)=>at(`No results recorded for ${n}`,`${n} の結果は未登録`,`Keine Ergebnisse für ${n} erfasst`));
 out=out.replace(/没有找到“(.+?)”/g,(_,n)=>at(`No results for “${n}”`,`「${n}」は見つかりませんでした`,`Keine Ergebnisse für „${n}“`));
 out=out.replace(/没有找到匹配的(论文|数据与资料)/g,(_,n)=>at(`No matching ${n==='论文'?'papers':'data or resources'}`,`一致する${n==='论文'?'論文':'データ・資料'}はありません`,`Keine passenden ${n==='论文'?'Publikationen':'Daten oder Ressourcen'}`));
 out=out.replace(/当前范围暂无(论文|数据与资料)记录/g,(_,n)=>at(`No ${n==='论文'?'papers':'data or resources'} recorded in this scope`,`この範囲の${n==='论文'?'論文':'データ・資料'}は未登録`,`Keine ${n==='论文'?'Publikationen':'Daten oder Ressourcen'} in diesem Bereich erfasst`));
 out=out.replace(/当前范围：/g,at('Current scope: ','現在の範囲：','Aktueller Bereich: '));
 out=out.replace(/这个方向还没有收录 (.+?) 的正式条目。/g,(_,n)=>at(`No confirmed ${n} entries in this topic yet.`,`この分野には ${n} の正式な項目がまだありません。`,`Für ${n} liegen in diesem Thema noch keine bestätigten Einträge vor.`));
 out=out.replace(/(\d+) 个相关(?:记录|示例)/g,(_,n)=>at(`${n} related records`,`${n} 件の関連資料`,`${n} verwandte Einträge`));
 out=out.replace(/(\d+) 条近 30 日记录/g,(_,n)=>at(`${n} records in the last 30 days`,`過去 30 日の資料 ${n} 件`,`${n} Einträge in den letzten 30 Tagen`));
 out=out.replace(/(\d+) 条记录，来自 (\d+) 个公开来源。以下为元数据索引，不代替原文核对。/g,(_,records,sources)=>at(`${records} records from ${sources} public sources. This metadata index does not replace checking the originals.`,`公開情報源 ${sources} 件から ${records} 件。メタデータ索引であり、原文確認の代わりにはなりません。`,`${records} Einträge aus ${sources} öffentlichen Quellen. Dieser Metadatenindex ersetzt nicht die Prüfung der Originale.`));
 // One pass over source fragments: never re-translate translated output.
 keys ||= ordered();
 fragmentPattern ||= new RegExp(keys.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
 out=out.replace(fragmentPattern,key=>dictionary.get(key)[language]);
 return padStart+out+padEnd;
}
function searchText(value){const source=String(value??'');return [source,...languages.slice(1).map(lang=>translate(source,lang))].join(' ')}
const api={languages,translate,searchText};
if(typeof document==='undefined')return api;
let language='zh';try{const saved=localStorage.getItem('ai-safety-index-language');if(languages.includes(saved))language=saved}catch{}
const textSources=new WeakMap(),attributeSources=new WeakMap();
const skipped='script,style,code,pre,[data-keep-original],#site-language';
const observer=new MutationObserver(()=>apply());
function sourceValue(cache,key,current){const saved=cache.get(key);return saved&&current===saved.output?saved.source:current}
function apply(){
 observer.disconnect();
 document.documentElement.lang={zh:'zh-CN',en:'en',ja:'ja',de:'de'}[language];
 for(const option of document.querySelectorAll('option:not([value])'))option.value=option.textContent;
 const walker=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);
 for(let node=walker.nextNode();node;node=walker.nextNode()){
  if(!node.parentElement||node.parentElement.closest(skipped))continue;
  const source=sourceValue(textSources,node,node.nodeValue),output=translate(source,language);
  textSources.set(node,{source,output});if(node.nodeValue!==output)node.nodeValue=output;
 }
 for(const el of document.querySelectorAll('[aria-label],[title],[placeholder],[alt],meta[name="description"]')){
  if(el.closest(skipped))continue;
  let cache=attributeSources.get(el);if(!cache){cache=new Map();attributeSources.set(el,cache)}
  for(const attr of ['aria-label','title','placeholder','alt',...(el.matches('meta[name="description"]')?['content']:[])]){
   if(!el.hasAttribute(attr))continue;
   const source=sourceValue(cache,attr,el.getAttribute(attr)),output=translate(source,language);
   cache.set(attr,{source,output});if(el.getAttribute(attr)!==output)el.setAttribute(attr,output);
  }
 }
 const select=document.getElementById('site-language');if(select)select.value=language;
 observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','placeholder','alt','content']});
}
function setLanguage(next){
 if(!languages.includes(next))return;
 const x=window.scrollX,y=window.scrollY;
 language=next;try{localStorage.setItem('ai-safety-index-language',next)}catch{}
 apply();window.scrollTo({left:x,top:y,behavior:'instant'});
}
document.addEventListener('change',e=>{if(e.target.id==='site-language')setLanguage(e.target.value)});
api.setLanguage=setLanguage;api.current=()=>language;apply();return api;
})();
