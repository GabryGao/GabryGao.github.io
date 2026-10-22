#!/usr/bin/env python3
import argparse
import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DIR = ROOT / "research-source" / "catalog-2026-10-22"

DIRECTION_IDS = {
    "数据与隐私安全": "data-privacy",
    "基础模型安全": "foundation-model",
    "智能体与 AI 软件系统安全": "agent-software",
    "物理 AI 安全": "physical-ai",
    "人机交互与社会安全": "human-societal",
    "AI+X 与 AI4Science 安全": "ai-x-science",
}

PUBLIC_FILES = [
    "AI_Safety_Index_数据来源汇总.html",
    "README.txt",
    "summary.json",
    "result-summary.json",
    "source-catalog.json",
    "result-file-manifest.json",
    "result-samples.json",
    "六大方向来源清单.csv",
    "结果接入清单.csv",
    "入口与参考网站.csv",
    "扩展候选线索_149项.csv",
    "评测结果样例.csv",
]


def read_csv(path):
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def public_url(value, label):
    if not value or value == "not available":
        return value
    if value.startswith("http://"):
        return "https://" + value.removeprefix("http://")
    if not value.startswith("https://"):
        raise ValueError(f"{label} must use HTTP(S): {value}")
    return value


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", required=True, type=Path)
    args = parser.parse_args()
    source = args.source_dir.resolve()

    catalog = json.loads((source / "source-catalog.json").read_text(encoding="utf-8"))
    summary = json.loads((source / "summary.json").read_text(encoding="utf-8"))
    portals = read_csv(source / "入口与参考网站.csv")
    candidates = read_csv(source / "扩展候选线索_149项.csv")
    manifest = json.loads((source / "result-file-manifest.json").read_text(encoding="utf-8"))

    resources = catalog["resources"]
    if len(resources) != summary["resources"]:
        raise ValueError("Resource count does not match summary.json")
    if len(portals) != summary["portals"]:
        raise ValueError("Portal count does not match summary.json")
    if len(candidates) != summary["historical_candidates"]:
        raise ValueError("Historical candidate count does not match summary.json")
    if len(manifest) != summary["result_files"]:
        raise ValueError("Result manifest count does not match summary.json")
    if len({item["id"] for item in resources}) != len(resources):
        raise ValueError("Source catalog IDs must be unique")

    prepared = []
    for item in resources:
        if item["direction"] not in DIRECTION_IDS:
            raise ValueError(f"Unknown direction: {item['direction']}")
        normalized = dict(item)
        for field in ["url", "result_url", "evidence_url"]:
            normalized[field] = public_url(item.get(field, ""), f"{item['id']}.{field}")
        normalized["data_entries"] = [
            {**entry, "url": public_url(entry.get("url", ""), f"{item['id']}.data_entries.url")}
            for entry in item.get("data_entries", [])
        ]
        prepared.append({
            **normalized,
            "direction_id": DIRECTION_IDS[item["direction"]],
            "related_direction_ids": [DIRECTION_IDS[name] for name in item.get("related_directions", [])],
        })

    portal_records = []
    for row in portals:
        portal_records.append({
            "id": row["编号"],
            "name": row["入口"],
            "purpose": row["用途"],
            "url": public_url(row["地址"], f"{row['编号']}.地址"),
            "status": row["当前状态"],
            "note": row["说明"],
            "checked_date": row["核验日期"],
        })

    payload = {
        "checked_date": catalog["checked_date"],
        "summary": summary,
        "resources": prepared,
        "portals": portal_records,
    }
    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    (ROOT / "source-catalog.js").write_text(
        "/* Generated from the reviewed 2026-10-22 source package. */\n"
        f"var SourceCatalogData={encoded};\n",
        encoding="utf-8",
    )

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    for name in PUBLIC_FILES:
        text=(source / name).read_text(encoding="utf-8-sig")
        (PUBLIC_DIR / name).write_text(text.replace("\r\n", "\n").replace("\r", "\n"), encoding="utf-8")
    (PUBLIC_DIR / "WEB_README.txt").write_text(
        "AI Safety Index public source package | 2026-10-22\n\n"
        "Published here: source catalogs, summary files, entry lists, historical candidates, "
        "result samples, the result-file checksum manifest, and the offline catalog viewer.\n\n"
        "Not mirrored here: evidence/ and result-files/. Their redistribution permissions vary. "
        "Use the evidence_url, source_url, and resolved_url fields to inspect original public sources.\n\n"
        "The 171 resources include benchmarks, datasets, tools, environments, reports, and result entry points. "
        "They are not 171 benchmark scores. The 2,696 result rows are integration samples from 10 projects, "
        "not a cross-benchmark ranking.\n",
        encoding="utf-8",
    )
    print(
        f"Built source catalog: {len(prepared)} resources, {len(portal_records)} portals, "
        f"{len(candidates)} historical candidates, {len(manifest)} result files in manifest."
    )


if __name__ == "__main__":
    main()
