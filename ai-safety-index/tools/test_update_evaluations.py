"""Parser tests for official benchmark result pages (no network)."""

import importlib.util
from pathlib import Path
import unittest


MODULE = Path(__file__).with_name("update-evaluations.py")
spec = importlib.util.spec_from_file_location("update_evaluations", MODULE)
evaluations = importlib.util.module_from_spec(spec)
spec.loader.exec_module(evaluations)


class EvaluationParserTests(unittest.TestCase):
    def test_agentdojo_table(self):
        html = """<table id="results-table"><tr><th>Provider</th><th>Model</th><th>Defense</th><th>Attack</th><th>Utility</th><th>Utility under attack</th><th>Targeted ASR</th><th>Date</th><th>Traces</th></tr><tr><td>anthropic</td><td>claude-test</td><td>None</td><td>important_instructions</td><td>88.66%</td><td>77.27%</td><td>7.31%</td><td>2025-02-24</td><td></td></tr></table>"""
        rows = evaluations.parse_agentdojo(html)
        self.assertEqual(len(rows), 3)
        self.assertEqual(rows[1]["metric_id"], "utility_under_attack")
        self.assertEqual(rows[2]["value"], 7.31)

    def test_safevla_tables(self):
        html = """<dl><dd>2026-09-26 last updated</dd></dl>
        <table><tr><th>#</th><th>Model</th><th>Safety ↑</th><th>SR ↑</th><th>SBU ↓</th><th>VSI ↓</th></tr><tr><td>1</td><td>Robot-A</td><td>53.1%</td><td>58.4%</td><td>24.0%</td><td>0.222</td></tr></table>
        <table><tr><th>#</th><th>Model</th><th>Train</th><th>Safety ↑</th><th>SR ↑</th><th>SBU ↓</th><th>VSI ↓</th></tr><tr><td>1</td><td>Robot-B</td><td>SFT</td><td>82.0%</td><td>97.6%</td><td>17.0%</td><td>0.104</td></tr></table>"""
        rows = evaluations.parse_safevla(html)
        self.assertEqual(len(rows), 8)
        self.assertEqual(rows[4]["configuration"], "Train: SFT")
        self.assertEqual(rows[7]["metric_id"], "vsi")

    def test_flames_markdown(self):
        text = """| Model | Overall | Fairness | Safety | Morality | Legality | Data protection |
|---|---|---|---|---|---|---|
| ChatGPT | 46.91% | 45.38% / 79.8 | 45.45% / 74.1 | 42.79% / 76.8 | 45.65% / 63.8 | 55.26% / 70.2 |
"""
        rows = evaluations.parse_flames(text)
        self.assertEqual(len(rows), 11)
        self.assertEqual(rows[0]["task"], "Overall")
        self.assertEqual(rows[-1]["value"], 70.2)

    def test_finsafety_markdown(self):
        text = """| Target Model | Attack Method | Financial Crimes (En) | Financial Crimes (Zh) | Ethical Violations (En) | Ethical Violations (Zh) |
|---|---|---|---|---|---|
| **LLaMA-3** <br>*(Meta-Llama-3-8B-Instruct)* | PAIR <br> ReNeLLM <br> FlipAttack <br> **Average** | 34.79 <br> 32.91 <br> 29.16 <br> **32.29** | 78.58 <br> 39.72 <br> 39.65 <br> **52.65** | 45.34 <br> 48.35 <br> 27.99 <br> **40.56** | 61.69 <br> 33.97 <br> 32.05 <br> **42.57** |
"""
        rows = evaluations.parse_finsafety(text)
        self.assertEqual(len(rows), 12)
        self.assertEqual(rows[0]["model"], "LLaMA-3")
        self.assertEqual(rows[1]["configuration"], "ReNeLLM")
        self.assertEqual(rows[-1]["value"], 32.05)


if __name__ == "__main__":
    unittest.main()
