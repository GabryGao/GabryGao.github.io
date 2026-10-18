// Proposed framework from user-provided safety index.pptx, received 2026-10-17.
// Candidate resources are source material, not independently verified catalog entries.
const researchDirections = [
  {
    "id": "data-privacy",
    "name": "数据与隐私安全",
    "en": "Data & Privacy Security",
    "short": "贯穿数据、模型与应用的保护要求",
    "question": "数据如何使用，隐私边界如何守住？",
    "description": "关注数据披露、训练数据泄露、成员隐私与数据完整性，并延伸到模型和数据治理。",
    "role": "贯穿全局",
    "children": [
      "数据隐私",
      "数据泄露",
      "成员隐私",
      "数据完整性",
      "模型治理",
      "数据治理"
    ],
    "links": [],
    "sourceSlide": 3,
    "principle": "按攻击目标与隐私机制分榜，避免用一个“隐私总分”掩盖不同风险。",
    "note": "必须分别展示：披露率、PII 提取率、成员推断成功率、查询成本、隐私预算、遗忘效果与保留能力。",
    "topics": [
      {
        "name": "数据隐私",
        "en": "Data Privacy",
        "tech": "Federated Learning,  Privacy boundary inference,  contextual integrity,  disclosure control",
        "candidates": "ConfAIde, PrivacyBench, PrivacyLens",
        "boundary": "不当披露率、情境完整性与隐私边界判断分别报告"
      },
      {
        "name": "数据泄露",
        "en": "Data Leakage",
        "tech": "PII detection,  memorization analysis,  privacy-preserving generation",
        "candidates": "ProPILE, PII-Bench / PLeak类数据集",
        "boundary": "个人信息提取率、攻击条件、数据许可与暴露严重度"
      },
      {
        "name": "成员隐私",
        "en": "Membership Privacy",
        "tech": "Membership inference defense,  privacy leakage measurement",
        "candidates": "Membership Inference 基准",
        "boundary": "攻击成功率、查询成本、隐私预算与防御效果按协议建榜"
      },
      {
        "name": "数据完整性",
        "en": "Data Integrity",
        "tech": "Poisoning detection,  backdoor removal,  robust training",
        "candidates": "BackdoorBench",
        "boundary": "攻击成功率、干净样本性能、检测率与防御代价并列"
      },
      {
        "name": "模型治理",
        "en": "Model Governance",
        "tech": "Model theft defense,  machine unlearning,  retention testing",
        "candidates": "Model Extraction, Machine Unlearning 基准",
        "boundary": "复制质量、查询效率、遗忘验证及保留任务能力"
      },
      {
        "name": "数据治理",
        "en": "Data Governance",
        "tech": "Data provenance,  quality auditing,  privacy governance",
        "candidates": "DataComp, DataPerf",
        "boundary": "用于数据选择和管线质量, 不直接视为隐私安全得分"
      }
    ]
  },
  {
    "id": "foundation-model",
    "name": "基础模型安全",
    "en": "Foundation Model Safety & Security",
    "short": "从对齐、拒答到事实性与鲁棒性",
    "question": "作为系统基础，模型如何可靠地回应？",
    "description": "围绕模型对齐、有害协助、拒答校准、事实可靠性、偏见与对抗鲁棒性组织研究。",
    "role": "基础能力",
    "children": [
      "模型对齐",
      "有害协助",
      "拒答校准",
      "事实可靠性",
      "偏见评估",
      "对抗鲁棒性"
    ],
    "links": [
      "helm-safety",
      "harmbench",
      "xstest",
      "mm-safetybench"
    ],
    "sourceSlide": 4,
    "principle": "直接安全结果优先建榜, 事实性、鲁棒性等安全相关能力单列。",
    "note": "首批建议：HarmBench、JailbreakBench、StrongREJECT、XSTest、TruthfulQA、BBQ、MM-SafetyBench。",
    "topics": [
      {
        "name": "模型对齐",
        "en": "Model Alignment",
        "tech": "Safety alignment,  risk recognition,  multidimensional safety evaluation",
        "candidates": "HELM Safety, AILuminate, TrustLLM, SafetyBench, SALAD-Bench",
        "boundary": "统一场景、危害类别与可信维度, 按版本和协议分别建榜"
      },
      {
        "name": "有害协助",
        "en": "Harmful Assistance",
        "tech": "Jailbreak defense,  prompt injection protection,  harmful request detection",
        "candidates": "HarmBench, JailbreakBench, StrongREJECT, SORRY-Bench",
        "boundary": "同时报告攻击成功率、危害程度及有害回答的可执行性"
      },
      {
        "name": "拒答校准",
        "en": "Refusal Calibration",
        "tech": "Refusal calibration,  safe vs. benign request classification",
        "candidates": "Do-Not-Answer, XSTest, OR-Bench, WildGuardTest",
        "boundary": "安全拒答与无害请求误拒分开，避免“拒答越多越安全”"
      },
      {
        "name": "事实可靠性",
        "en": "Factual Reliability",
        "tech": "Fact verification,  hallucination detection,  knowledge reliability",
        "candidates": "TruthfulQA, SimpleQA, FActScore, HaluEval",
        "boundary": "属于安全相关能力，不与直接有害行为分数混合"
      },
      {
        "name": "偏见评估",
        "en": "Bias Evaluation",
        "tech": "Toxicity detection,  fairness evaluation,  bias measurement",
        "candidates": "RealToxicityPrompts, ToxiGen, BBQ, BOLD, StereoSet",
        "boundary": "按群体、语境和语言分层，保留能力与公平性权衡"
      },
      {
        "name": "对抗鲁棒性",
        "en": "Adversarial Robustness",
        "tech": "Adversarial robustness,  multimodal safety,  visual jailbreak defense",
        "candidates": "RobustBench, DecodingTrust, MM-SafetyBench, FigStep",
        "boundary": "区分输入鲁棒性、视觉越狱与生成安全，声明攻击协议"
      }
    ]
  },
  {
    "id": "agent-software",
    "name": "智能体与 AI 软件系统安全",
    "en": "Agent & AI Software System Safety",
    "short": "从提示输入到工具执行的完整系统",
    "question": "模型开始调用工具后，如何约束整个系统？",
    "description": "把模型、框架、防御和权限作为完整配置，关注提示注入、多步骤行为、计算机操作、工具使用、检索与网络安全。",
    "role": "数字系统",
    "children": [
      "提示注入",
      "智能体风险",
      "计算机操作",
      "工具使用",
      "检索可靠性",
      "网络安全"
    ],
    "links": [
      "agentdojo"
    ],
    "sourceSlide": 5,
    "principle": "评测对象是“模型＋框架＋防御＋权限”的完整配置，而非单一模型。",
    "note": "首版 Security Index：同任务、同预算成对测试正常条件与攻击条件, 效用、越权、泄露和成本分别展示。",
    "topics": [
      {
        "name": "提示注入",
        "en": "Prompt Injection",
        "tech": "Indirect prompt injection,  untrusted-input filtering,  secure tool use",
        "candidates": "AgentDojo, InjecAgent, BIPIA, Tensor Trust",
        "boundary": "记录注入入口、工具权限、正常效用及攻击目标成功率"
      },
      {
        "name": "智能体风险",
        "en": "Agent Risk",
        "tech": "Agent behavior safety,  multi-step task constraints,  risk detection",
        "candidates": "AgentHarm, Agent-SafetyBench, SafeToolBench, R-Judge",
        "boundary": "测量多步骤违规动作、风险识别与防护后的任务完成率"
      },
      {
        "name": "计算机操作",
        "en": "Computer Use",
        "tech": "Browser and OS agent security,  permission control,  data exfiltration prevention",
        "candidates": "BrowserGym, WebArena, OSWorld",
        "boundary": "增加越权点击、敏感数据外传、文件破坏与任务偏离指标"
      },
      {
        "name": "工具使用",
        "en": "Tool Use",
        "tech": "Tool authorization,  policy adherence,  safe API execution",
        "candidates": "τ-bench, ToolSandbox, ToolBench, AgentBench, GAIA",
        "boundary": "能力环境需叠加授权边界、危险调用和策略遵守指标"
      },
      {
        "name": "检索可靠性",
        "en": "Retrieval Reliability",
        "tech": "RAG provenance,  evidence grounding,  retrieval integrity",
        "candidates": "RAGTruth, RGB, ARES",
        "boundary": "区分检索质量、证据忠实性、幻觉与低信任内容注入"
      },
      {
        "name": "网络安全",
        "en": "Cybersecurity",
        "tech": "Secure code generation,  vulnerability detection,  cyber capability risk",
        "candidates": "CyberSecEval 2/3, Cybench, MITRE ATLAS",
        "boundary": "能力、实际攻击行为与威胁知识库分别呈现，不直接合榜"
      }
    ]
  },
  {
    "id": "physical-ai",
    "name": "物理 AI 安全",
    "en": "Physical AI Safety",
    "short": "让决策与动作遵守物理安全约束",
    "question": "进入物理世界后，如何安全地行动？",
    "description": "覆盖导航、交互、操作、约束学习和自动驾驶，分别观察任务完成与真实世界的危害。",
    "role": "物理系统",
    "children": [
      "导航",
      "交互",
      "操作",
      "约束学习",
      "自动驾驶"
    ],
    "links": [
      "safebench"
    ],
    "sourceSlide": 6,
    "principle": "任务成功不等于安全, 需要把碰撞、违规和人工接管作为独立结果。",
    "note": "建议指标：碰撞率｜近失率｜违规动作率｜约束满足率｜危险严重度｜OOD 表现｜人工接管次数。",
    "topics": [
      {
        "name": "导航",
        "en": "Navigation",
        "tech": "Safe planning,  collision avoidance,  navigation constraints",
        "candidates": "SafeAgentBench, Habitat / Habitat-Sim",
        "boundary": "安全约束、禁区进入、碰撞率与长时程任务偏离"
      },
      {
        "name": "交互",
        "en": "Interaction",
        "tech": "Scene understanding,  hazard avoidance,  human proximity safety",
        "candidates": "AI2-THOR, BEHAVIOR-1K",
        "boundary": "危险物体、人身风险、失败严重度与场景约束满足率"
      },
      {
        "name": "操作",
        "en": "Manipulation",
        "tech": "Force and contact control,  safe manipulation,  motion stability",
        "candidates": "RoboSuite, RLBench, ManiSkill",
        "boundary": "叠加接触力、碰撞、危险动作和控制稳定性指标"
      },
      {
        "name": "约束学习",
        "en": "Constrained Learning",
        "tech": "Constrained policy learning,  safe exploration,  violation reduction",
        "candidates": "Safety-Gymnasium",
        "boundary": "约束决策、安全探索、违规次数及奖励—安全权衡"
      },
      {
        "name": "自动驾驶",
        "en": "Autonomous Driving",
        "tech": "Robust perception,  trajectory planning,  traffic-rule compliance",
        "candidates": "CARLA, nuScenes, Waymo Open Dataset",
        "boundary": "碰撞、近失、交通规则、长尾场景、OOD 与人工接管"
      }
    ]
  },
  {
    "id": "human-societal",
    "name": "人机交互与社会安全",
    "en": "Human-AI Interaction & Societal Safety",
    "short": "关注不同人群、语言和社会情境",
    "question": "AI 如何影响人的判断、权益与社会生活？",
    "description": "关注公平性、毒性、多语言安全、伦理、谄媚与治理，并为儿童安全、心理健康等专项研究保留扩展空间。",
    "role": "人与社会",
    "children": [
      "公平性",
      "毒性",
      "多语言安全",
      "伦理",
      "谄媚与迎合",
      "治理"
    ],
    "links": [],
    "sourceSlide": 7,
    "principle": "按群体、语言与场景报告社会风险，宏平均不能替代专项结论。",
    "note": "儿童安全、心理健康、诈骗/操纵与无障碍需专项数据、专家标注和严重度分级, 通用毒性集不能替代。",
    "topics": [
      {
        "name": "公平性",
        "en": "Fairness",
        "tech": "Fairness measurement,  demographic bias analysis,  inclusive evaluation",
        "candidates": "BBQ,BOLD,CrowS-Pairs,StereoSet,HolisticBias",
        "boundary": "区分模糊/明确语境、开放生成与语言建模能力"
      },
      {
        "name": "毒性",
        "en": "Toxicity",
        "tech": "Toxic-content detection,  hate-speech analysis,  harm severity classification",
        "candidates": "ToxiGen, HateCheck",
        "boundary": "覆盖隐性仇恨、对抗样本和逐项功能诊断"
      },
      {
        "name": "多语言安全",
        "en": "Multilingual Safety",
        "tech": "Multilingual moderation,  cross-lingual robustness,  language-specific risk analysis",
        "candidates": "XSafety, PolyGuard, FLAMES",
        "boundary": "按语言单列，不用宏平均掩盖低资源语言安全差异"
      },
      {
        "name": "伦理",
        "en": "Ethics",
        "tech": "Ethical reasoning,  deception detection,  harmful interaction analysis",
        "candidates": "ETHICS, MACHIAVELLI, DeceptionBench",
        "boundary": "测量伦理判断、欺骗、权力追逐与互动行为风险"
      },
      {
        "name": "谄媚与迎合",
        "en": "Sycophancy",
        "tech": "Sycophancy detection,  calibrated responses,  evaluation-context awareness",
        "candidates": "Sycophancy tasks, SAD",
        "boundary": "区分迎合用户观点、自我认知与评测情境识别"
      },
      {
        "name": "治理",
        "en": "Governance",
        "tech": "Risk management,  standardized testing,  governance and audit workflows",
        "candidates": "AILuminate, NIST AI RMF / GenAI Profile",
        "boundary": "行业测试与治理框架用于流程约束，不直接当作单一模型分数"
      }
    ]
  },
  {
    "id": "ai-x-science",
    "name": "AI+X 与 AI4Science 安全",
    "en": "AI+X & AI4Science Safety",
    "short": "面向专业领域的风险与可靠性",
    "question": "走向专业应用，哪些错误会造成实质危害？",
    "description": "面向知识、生物、医疗、区块链、金融与科学推理，将领域能力和安全后果分别分析。",
    "role": "专业领域",
    "children": [
      "知识安全",
      "生物安全",
      "医疗安全",
      "区块链",
      "金融安全",
      "科学推理"
    ],
    "links": [],
    "sourceSlide": 8,
    "principle": "危险知识、可执行有害协助与严重错误建议是三类不同风险。",
    "note": "医疗、金融、生物、化学：自动裁判只做初筛, 主结论需要专家复核、严重度分级和地域说明。",
    "topics": [
      {
        "name": "知识安全",
        "en": "Knowledge Safety",
        "tech": "Dual-use risk assessment,  capability restriction,  knowledge elicitation",
        "candidates": "WMDP",
        "boundary": "生物、化学与网络危险知识能力, 不能等同于有害协助"
      },
      {
        "name": "生物安全",
        "en": "Biosafety",
        "tech": "Biosecurity screening,  chemical safety,  laboratory-risk assessment",
        "candidates": "LAB-Bench,ChemSafetyBench",
        "boundary": "实验推理、回答准确性、安全建议与双重用途风险"
      },
      {
        "name": "医疗安全",
        "en": "Medical Safety",
        "tech": "Clinical fact checking,  harmful-advice detection,  expert review",
        "candidates": "MedSafetyBench,HealthBench ,MedQA ,PubMedQA",
        "boundary": "伦理、事实性和严重错误需专家复核并标注目标地区"
      },
      {
        "name": "区块链",
        "en": "Blockchain",
        "tech": "Smart contract security,  decentralized application security,  consensus and wallet protection",
        "candidates": "SmartBugs,SolidiFI,Ethernaut",
        "boundary": "合约漏洞、攻击成功率、资产损失、共识稳定性与链上隐私分别评估"
      },
      {
        "name": "金融安全",
        "en": "Financial Safety",
        "tech": "Fraud and misconduct detection,  compliant advice,  regional policy checks",
        "candidates": "FinSafetyBench",
        "boundary": "中英文违法违规、不道德请求拒绝, 注明适用法规与地区"
      },
      {
        "name": "科学推理",
        "en": "Scientific Reasoning",
        "tech": "Scientific fact verification,  uncertainty estimation,  reproducibility",
        "candidates": "SciBench,GPQA Diamond,MMLU-Pro",
        "boundary": "仅作安全相关能力参考，不与直接领域安全结果混榜"
      }
    ]
  }
];
