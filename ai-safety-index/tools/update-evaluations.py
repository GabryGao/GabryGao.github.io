#!/usr/bin/env python3
"""Refresh structured benchmark results from fixed official project pages."""

from __future__ import annotations

import hashlib
from html import unescape
from html.parser import HTMLParser
import json
import math
from pathlib import Path
import re
import ssl
from datetime import datetime, timezone
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "evaluation-data.js"
PROVENANCE_FILE = ROOT / "research-source" / "evaluation-provenance.json"
MAX_BYTES = 2_000_000


BENCHMARKS = {
    "agentdojo": {
        "name": "AgentDojo",
        "object": "Agent",
        "modality": "文本与工具",
        "year": 2024,
        "version": "官方结果页",
        "org": "ETH Zurich / Invariant Labs",
        "url": "https://agentdojo.spylab.ai/results/",
        "desc": "在工具环境中同时记录正常效用、受攻击效用与定向攻击成功率。",
        "tags": ["提示注入", "工具使用", "公开结果"],
        "detail": "结果按模型、提供方、防御和攻击配置分别展示。官方页面明确说明，不同组合并未全部覆盖，因此不应把页面解读为完整排行榜。",
        "measure": "Utility 与 Utility under attack 越高越好；Targeted ASR 越低越好。只比较相同攻击与防御配置。",
        "direction_ids": ["agent-software"],
        "default_metric": "utility_under_attack",
        "default_task": "important_instructions",
        "default_configuration": "Defense: None",
        "pair_metrics": ["utility_under_attack", "targeted_asr"],
    },
    "safevla": {
        "name": "SafeVLA-Bench",
        "object": "物理系统",
        "modality": "机器人与视觉语言动作",
        "year": 2026,
        "version": "官方排行榜",
        "org": "SafeVLA-Bench",
        "url": "https://safevla.org/leaderboard.html",
        "desc": "评估视觉语言动作策略的任务成功与安全规范满足情况。",
        "tags": ["具身智能", "机器人安全", "公开结果"],
        "detail": "官方榜单分别发布 RoboCasa-365 与 LIBERO 结果，并强调 Safety 不是任务成功率。",
        "measure": "Safety 与 SR 越高越好；SBU 与 VSI 越低越好。不同套件分别比较。",
        "direction_ids": ["physical-ai"],
        "default_metric": "safety",
        "default_task": "LIBERO · mean over four suites",
        "default_configuration": "Train: SFT",
        "pair_metrics": ["safety", "sr"],
    },
    "flames": {
        "name": "FLAMES",
        "object": "语言模型",
        "modality": "文本",
        "year": 2023,
        "version": "官方 README 结果表",
        "org": "AI45Lab",
        "url": "https://github.com/AI45Lab/Flames",
        "fetch_url": "https://raw.githubusercontent.com/AI45Lab/Flames/main/README.md",
        "desc": "从公平、安全、道德、法律与数据保护维度评估中文大模型价值观安全。",
        "tags": ["价值观安全", "公平", "公开结果"],
        "detail": "结果表同时给出无害回答比例与无害分数。不同指标含义不同，页面不合成为平台总分。",
        "measure": "Harmless rate 与 Harmless score 越高越好；按同一维度和同一指标比较。",
        "direction_ids": ["foundation-model", "human-societal"],
        "default_metric": "harmless_rate",
        "default_task": "Overall",
        "default_configuration": "Official evaluation",
        "pair_metrics": ["harmless_rate", "harmless_score"],
    },
    "finsafety": {
        "name": "FinSafetyBench",
        "object": "语言模型",
        "modality": "中英文文本",
        "year": 2025,
        "version": "官方 README 结果表",
        "org": "SUSTech NLP",
        "url": "https://github.com/sustech-nlp/FinSafetyBench",
        "fetch_url": "https://raw.githubusercontent.com/sustech-nlp/FinSafetyBench/main/README.md",
        "desc": "评估金融犯罪与职业伦理场景中的中英文越狱攻击成功率。",
        "tags": ["金融安全", "越狱攻击", "双语评测"],
        "detail": "官方表格报告 PAIR、ReNeLLM 与 FlipAttack 在四个领域语言组合上的攻击成功率。",
        "measure": "ASR 越低越好；攻击方法、语言与风险领域必须保持一致。",
        "direction_ids": ["foundation-model", "human-societal"],
        "default_metric": "asr",
        "default_task": "Financial Crimes · En",
        "default_configuration": "PAIR",
        "pair_metrics": [],
    },
}


class TableParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.tables: list[list[list[str]]] = []
        self.table: list[list[str]] | None = None
        self.row: list[str] | None = None
        self.cell: list[str] | None = None

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag == "table":
            self.table = []
        elif tag == "tr" and self.table is not None:
            self.row = []
        elif tag in {"td", "th"} and self.row is not None:
            self.cell = []
        elif tag == "br" and self.cell is not None:
            self.cell.append(" | ")

    def handle_data(self, data: str) -> None:
        if self.cell is not None:
            self.cell.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag in {"td", "th"} and self.cell is not None and self.row is not None:
            self.row.append(clean_text("".join(self.cell)))
            self.cell = None
        elif tag == "tr" and self.row is not None and self.table is not None:
            if self.row:
                self.table.append(self.row)
            self.row = None
        elif tag == "table" and self.table is not None:
            if self.table:
                self.tables.append(self.table)
            self.table = None


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", unescape(value)).strip()


def clean_markdown(value: str) -> str:
    value = re.sub(r"<br\s*/?>", " | ", value, flags=re.I)
    value = re.sub(r"<[^>]+>", "", value)
    value = re.sub(r"[*_`]", "", value)
    return clean_text(value)


def number(value: str) -> float:
    match = re.search(r"-?\d+(?:\.\d+)?", value.replace(",", ""))
    if not match:
        raise ValueError(f"No numeric value in {value!r}")
    return float(match.group())


def record(benchmark_id: str, model: str, task: str, configuration: str,
           metric_id: str, metric: str, value: float, unit: str, better: str,
           source_url: str, reported_date: str = "", provider: str = "") -> dict:
    key = "|".join([benchmark_id, model, task, configuration, metric_id, reported_date])
    return {
        "id": benchmark_id + "-" + hashlib.sha1(key.encode()).hexdigest()[:12],
        "benchmark_id": benchmark_id,
        "model": model,
        "provider": provider,
        "task": task,
        "configuration": configuration,
        "metric_id": metric_id,
        "metric": metric,
        "value": value,
        "unit": unit,
        "better": better,
        "reported_date": reported_date,
        "source_url": source_url,
    }


def parse_agentdojo(text: str) -> list[dict]:
    parser = TableParser()
    parser.feed(text)
    table = next((table for table in parser.tables if table and table[0][:4] == ["Provider", "Model", "Defense", "Attack"]), None)
    if not table:
        raise ValueError("AgentDojo results table not found")
    rows = []
    metrics = [
        ("utility", "Utility", "higher"),
        ("utility_under_attack", "Utility under attack", "higher"),
        ("targeted_asr", "Targeted ASR", "lower"),
    ]
    for cells in table[1:]:
        if len(cells) < 8:
            continue
        provider, model, defense, attack = cells[:4]
        for offset, (metric_id, metric, better) in enumerate(metrics, 4):
            rows.append(record("agentdojo", model, attack, "Defense: " + defense,
                               metric_id, metric, number(cells[offset]), "percent", better,
                               BENCHMARKS["agentdojo"]["url"], cells[7], provider))
    return rows


def parse_safevla(text: str) -> list[dict]:
    parser = TableParser()
    parser.feed(text)
    tables = [table for table in parser.tables if table and "Safety ↑" in table[0]]
    if len(tables) != 2:
        raise ValueError(f"Expected two SafeVLA tables, found {len(tables)}")
    reported = (re.search(r"(20\d{2}-\d{2}-\d{2}).{0,40}last updated", text, re.I | re.S) or [None, ""])[1]
    rows = []
    tasks = ["RoboCasa-365 · Atomic-Seen", "LIBERO · mean over four suites"]
    for table, task in zip(tables, tasks):
        header = table[0]
        indexes = {name: header.index(name) for name in ["Model", "Safety ↑", "SR ↑", "SBU ↓", "VSI ↓"]}
        train_index = header.index("Train") if "Train" in header else None
        for cells in table[1:]:
            model = cells[indexes["Model"]]
            configuration = "Train: " + (cells[train_index] if train_index is not None else "Published checkpoint")
            for column, metric_id, metric, unit, better in [
                ("Safety ↑", "safety", "Safety", "percent", "higher"),
                ("SR ↑", "sr", "Success rate", "percent", "higher"),
                ("SBU ↓", "sbu", "Succ-But-Unsafe", "percent", "lower"),
                ("VSI ↓", "vsi", "Violation Severity Index", "index", "lower"),
            ]:
                rows.append(record("safevla", model, task, configuration, metric_id, metric,
                                   number(cells[indexes[column]]), unit, better,
                                   BENCHMARKS["safevla"]["url"], reported))
    return rows


def markdown_table(text: str, header_prefix: str) -> tuple[list[str], list[list[str]]]:
    lines = text.splitlines()
    start = next((index for index, line in enumerate(lines) if line.strip().startswith(header_prefix)), None)
    if start is None:
        raise ValueError(f"Markdown table {header_prefix!r} not found")
    header = [clean_markdown(cell) for cell in lines[start].strip().strip("|").split("|")]
    rows = []
    for line in lines[start + 2:]:
        if not line.strip().startswith("|"):
            break
        cells = [clean_markdown(cell) for cell in line.strip().strip("|").split("|")]
        if len(cells) == len(header):
            rows.append(cells)
    return header, rows


def parse_flames(text: str) -> list[dict]:
    header, table = markdown_table(text, "| Model")
    tasks = header[2:]
    rows = []
    for cells in table:
        model = cells[0]
        rows.append(record("flames", model, "Overall", "Official evaluation",
                           "harmless_rate", "Harmless rate", number(cells[1]), "percent", "higher",
                           BENCHMARKS["flames"]["url"], "2023-12-11"))
        for task, cell in zip(tasks, cells[2:]):
            values = [number(part) for part in cell.split("/")]
            if len(values) != 2:
                raise ValueError(f"Unexpected FLAMES cell: {cell}")
            rows.append(record("flames", model, task, "Official evaluation",
                               "harmless_rate", "Harmless rate", values[0], "percent", "higher",
                               BENCHMARKS["flames"]["url"], "2023-12-11"))
            rows.append(record("flames", model, task, "Official evaluation",
                               "harmless_score", "Harmless score", values[1], "score", "higher",
                               BENCHMARKS["flames"]["url"], "2023-12-11"))
    return rows


def parse_finsafety(text: str) -> list[dict]:
    header, table = markdown_table(text, "| Target Model")
    tasks = [name.replace(" (", " · ").replace(")", "") for name in header[2:]]
    attacks = ["PAIR", "ReNeLLM", "FlipAttack"]
    rows = []
    for cells in table:
        model = cells[0].split(" | ")[0]
        for task, cell in zip(tasks, cells[2:]):
            values = [float(value) for value in re.findall(r"\d+(?:\.\d+)?", cell)]
            if len(values) < 3:
                raise ValueError(f"Unexpected FinSafetyBench cell: {cell}")
            for attack, value in zip(attacks, values[:3]):
                rows.append(record("finsafety", model, task, attack, "asr", "Attack success rate",
                                   value, "percent", "lower", BENCHMARKS["finsafety"]["url"]))
    return rows


PARSERS = {
    "agentdojo": parse_agentdojo,
    "safevla": parse_safevla,
    "flames": parse_flames,
    "finsafety": parse_finsafety,
}

MINIMUM_RECORDS = {"agentdojo": 30, "safevla": 80, "flames": 150, "finsafety": 60}


def fetch(url: str) -> str:
    request = Request(url, headers={"User-Agent": "AI-Safety-Index/1.0 (+https://gabrygao.github.io/ai-safety-index/)"})
    context = ssl.create_default_context()
    try:
        import certifi
        context = ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        pass
    with urlopen(request, timeout=30, context=context) as response:
        data = response.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise ValueError(f"Response exceeds {MAX_BYTES} bytes")
    return data.decode("utf-8", errors="replace")


def load_previous() -> dict:
    if not DATA_FILE.exists():
        return {"records": [], "sources": []}
    text = DATA_FILE.read_text(encoding="utf-8").strip()
    prefix = "var EvaluationData="
    if not text.startswith(prefix) or not text.endswith(";"):
        return {"records": [], "sources": []}
    return json.loads(text[len(prefix):-1])


def validate(rows: list[dict], benchmark_id: str) -> None:
    if len(rows) < MINIMUM_RECORDS[benchmark_id]:
        raise ValueError(f"Only {len(rows)} records parsed for {benchmark_id}")
    if len({row["id"] for row in rows}) != len(rows):
        raise ValueError(f"Duplicate record IDs for {benchmark_id}")
    for row in rows:
        if row["benchmark_id"] != benchmark_id or not row["model"] or not row["metric_id"]:
            raise ValueError(f"Incomplete record for {benchmark_id}")
        if not math.isfinite(row["value"]):
            raise ValueError(f"Non-finite value for {benchmark_id}")
        if row["unit"] == "percent" and not 0 <= row["value"] <= 100:
            raise ValueError(f"Out-of-range percentage for {benchmark_id}: {row['value']}")
        if not row["source_url"].startswith("https://"):
            raise ValueError(f"Unsafe source URL for {benchmark_id}")


def source_summary(benchmark_id: str, rows: list[dict], fetched_on: str, status: str,
                   error: str = "") -> dict:
    spec = BENCHMARKS[benchmark_id]
    return {
        "id": benchmark_id,
        "name": spec["name"],
        "url": spec["url"],
        "fetch_url": spec.get("fetch_url", spec["url"]),
        "status": status,
        "record_count": len(rows),
        "model_count": len({row["model"] for row in rows}),
        "task_count": len({row["task"] for row in rows}),
        "metric_count": len({row["metric_id"] for row in rows}),
        "last_successful_fetch": fetched_on,
        "error": error,
    }


def build(fetcher=fetch) -> dict:
    previous = load_previous()
    previous_records = previous.get("records", [])
    previous_sources = {source["id"]: source for source in previous.get("sources", [])}
    generated_on = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    all_rows = []
    sources = []
    for benchmark_id, spec in BENCHMARKS.items():
        try:
            text = fetcher(spec.get("fetch_url", spec["url"]))
            rows = PARSERS[benchmark_id](text)
            validate(rows, benchmark_id)
            sources.append(source_summary(benchmark_id, rows, generated_on, "ok"))
        except Exception as exc:
            rows = [row for row in previous_records if row.get("benchmark_id") == benchmark_id]
            if not rows:
                raise RuntimeError(f"{benchmark_id} refresh failed without fallback: {exc}") from exc
            previous_source = previous_sources.get(benchmark_id, {})
            sources.append(source_summary(
                benchmark_id, rows, previous_source.get("last_successful_fetch", ""), "stale", str(exc)[:300]
            ))
        all_rows.extend(rows)
    all_rows.sort(key=lambda row: (row["benchmark_id"], row["task"], row["configuration"], row["model"], row["metric_id"]))
    benchmarks = []
    for benchmark_id, spec in BENCHMARKS.items():
        item = {key: value for key, value in spec.items() if key != "fetch_url"}
        item["id"] = benchmark_id
        item["record_count"] = sum(row["benchmark_id"] == benchmark_id for row in all_rows)
        item["model_count"] = len({row["model"] for row in all_rows if row["benchmark_id"] == benchmark_id})
        item["task_count"] = len({row["task"] for row in all_rows if row["benchmark_id"] == benchmark_id})
        item["metric_count"] = len({row["metric_id"] for row in all_rows if row["benchmark_id"] == benchmark_id})
        benchmarks.append(item)
    return {
        "schema_version": 1,
        "generated_on": generated_on,
        "summary": {
            "benchmarks": len(benchmarks),
            "records": len(all_rows),
            "models": len({(row["benchmark_id"], row["model"]) for row in all_rows}),
            "sources_ok": sum(source["status"] == "ok" for source in sources),
        },
        "benchmarks": benchmarks,
        "sources": sources,
        "records": all_rows,
    }


def write(data: dict) -> None:
    DATA_FILE.write_text("var EvaluationData=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    provenance = {
        "schema_version": data["schema_version"],
        "generated_on": data["generated_on"],
        "summary": data["summary"],
        "sources": data["sources"],
    }
    PROVENANCE_FILE.parent.mkdir(parents=True, exist_ok=True)
    PROVENANCE_FILE.write_text(json.dumps(provenance, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    output = build()
    write(output)
    print(
        f"Evaluation data: {output['summary']['benchmarks']} benchmarks, "
        f"{output['summary']['records']} records, {output['summary']['sources_ok']} fresh sources."
    )
