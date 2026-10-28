/* Catalog extras, datasets, team and hand-added papers for the site pages. */
var SiteData = {
 "generated_from": "Extracted on 2026-10-29 from the retired single-page UI (portal-catalog.js, portal-v5.js, portal-madeo.js, app.js). Edit this file, not those.",
 "cardCopy": {
  "S013": {
   "purpose": "评估语言模型能否定向遗忘指定知识，同时保持未遗忘知识与通用能力。",
   "contents": "遗忘质量、模型效用、保留集与遗忘集表现"
  },
  "S014": {
   "purpose": "从知识移除、隐私泄露与模型效用等方面评估机器遗忘方法。",
   "contents": "遗忘效果、隐私保护、能力保留"
  },
  "S025": {
   "purpose": "从毒性、偏见、隐私、伦理与鲁棒性等维度评估大语言模型可信性。",
   "contents": "毒性、刻板印象、对抗鲁棒性、隐私、伦理与公平性"
  },
  "S027": {
   "purpose": "用分层安全问题和攻击设置评估模型识别与拒绝有害请求的能力。",
   "contents": "基础安全、攻击鲁棒性、风险类别与层级"
  },
  "S043": {
   "purpose": "比较图像模型在标准输入、对抗攻击和常见扰动下的鲁棒性。",
   "contents": "干净准确率、对抗准确率、扰动准确率"
  },
  "S055": {
   "purpose": "在工具调用任务中评估智能体的正常效用、受攻击效用与提示注入风险。",
   "contents": "正常效用、攻击下效用、攻击成功率"
  },
  "S059": {
   "purpose": "用 110 个明确恶意的多步工具任务，检验智能体是否拒绝执行，以及被越狱后还能否完成任务。",
   "contents": "有害任务得分、拒答率、良性对照任务得分"
  },
  "S023": {
   "purpose": "MLCommons 产业级安全基准：按 12 类危害测试对话模型，给出 Poor 到 Excellent 五级评级。",
   "contents": "各危害类别违规率、五级安全评级"
  },
  "S028": {
   "purpose": "从 8 部政府法规和 16 家企业政策整理出 314 个风险类别，检验模型是否拒绝对应请求。",
   "contents": "四级风险分类下各类别的拒答率"
  },
  "S167": {
   "purpose": "约 4.5 万条红队提示，按 6 个大类、32 个细类组织，另有加入越狱攻击的对抗子集。",
   "contents": "32 个细类的安全分数、对抗子集安全分数"
  },
  "S061": {
   "purpose": "在 10 个应用场景、400 多个工具中，比较提示注入、记忆投毒、后门等攻击及其防御。",
   "contents": "各攻击类型成功率、拒答率、无攻击时任务完成率"
  },
  "S016": {
   "purpose": "用统一代码和相同设置复现数十种后门攻击与防御，让不同方法可以直接横向比较。",
   "contents": "攻击成功率 ASR、干净准确率 CA、防御开销"
  },
  "S106": {
   "purpose": "用 9 类社会属性的问答题检验刻板印象：信息不足时是否乱猜，信息充分时是否仍被偏见带偏。",
   "contents": "歧义与消歧情境下的准确率、偏见分数"
  },
  "S163": {
   "purpose": "30 余万条问答对分别标注有害性与帮助性，覆盖 14 类危害，用于训练和评估安全对齐。",
   "contents": "14 类危害标签、无害性与帮助性偏好对"
  },
  "S057": {
   "purpose": "把恶意指令藏进邮件、网页、表格、代码等外部内容，检验模型在五类任务中会不会照做。",
   "contents": "各场景攻击成功率、任务效用"
  },
  "S107": {
   "purpose": "让模型续写 23,679 条维基百科句首，比较不同职业、性别、种族、宗教与政治群体的生成差异。",
   "contents": "情感倾向、毒性、尊重度（regard）、性别极性"
  }
 },
 "topics": [
  {
   "id": "alignment",
   "name": "综合安全与对齐",
   "featuredId": "S022",
   "directionIds": [
    "foundation-model",
    "human-societal"
   ],
   "terms": [
    "综合安全",
    "安全评级",
    "多维可信性",
    "安全知识",
    "安全与责任",
    "多语言安全",
    "政策安全分类",
    "安全偏好",
    "模型对齐",
    "alignment"
   ]
  },
  {
   "id": "jailbreak",
   "name": "越狱与有害协助",
   "featuredId": "S030",
   "directionIds": [
    "foundation-model",
    "agent-software",
    "human-societal",
    "ai-x-science"
   ],
   "terms": [
    "越狱",
    "有害协助",
    "红队",
    "有害指令",
    "严重危害",
    "危害识别",
    "jailbreak",
    "harmful"
   ]
  },
  {
   "id": "refusal",
   "name": "拒答与校准",
   "featuredId": "S033",
   "directionIds": [
    "foundation-model",
    "human-societal",
    "ai-x-science"
   ],
   "terms": [
    "拒答",
    "过度拒答",
    "无害性",
    "refusal",
    "over-refusal"
   ]
  },
  {
   "id": "factuality",
   "name": "事实性与幻觉",
   "featuredId": "S040",
   "directionIds": [
    "foundation-model",
    "agent-software",
    "human-societal",
    "ai-x-science"
   ],
   "terms": [
    "事实",
    "幻觉",
    "真实性",
    "迎合",
    "检索生成",
    "证据忠实",
    "factual",
    "hallucination",
    "truthful"
   ]
  },
  {
   "id": "fairness",
   "name": "公平、偏见与毒性",
   "featuredId": "S106",
   "directionIds": [
    "foundation-model",
    "human-societal"
   ],
   "terms": [
    "偏见",
    "公平",
    "刻板印象",
    "毒性",
    "有毒",
    "仇恨",
    "政治倾向",
    "观点偏见",
    "bias",
    "fairness",
    "toxicity"
   ]
  },
  {
   "id": "privacy",
   "name": "隐私、泄露与遗忘",
   "featuredId": "S013",
   "directionIds": [
    "data-privacy",
    "foundation-model",
    "agent-software",
    "human-societal"
   ],
   "terms": [
    "隐私",
    "泄露",
    "成员推断",
    "遗忘",
    "PII",
    "模型窃取",
    "数据提取",
    "privacy",
    "unlearning"
   ]
  },
  {
   "id": "integrity",
   "name": "投毒、后门与完整性",
   "featuredId": "S016",
   "directionIds": [
    "data-privacy",
    "physical-ai"
   ],
   "terms": [
    "投毒",
    "后门",
    "木马",
    "数据完整性",
    "异常检测",
    "poison",
    "backdoor",
    "trojan"
   ]
  },
  {
   "id": "agents",
   "name": "智能体与工具调用",
   "featuredId": "S060",
   "directionIds": [
    "agent-software"
   ],
   "terms": [
    "智能体",
    "工具调用",
    "工具使用",
    "工具滥用",
    "多步",
    "动态环境",
    "计算机使用",
    "双控制",
    "agent",
    "tool use",
    "computer use"
   ]
  },
  {
   "id": "injection",
   "name": "提示注入与间接攻击",
   "featuredId": "S055",
   "directionIds": [
    "agent-software"
   ],
   "terms": [
    "提示注入",
    "注入防御",
    "工具返回注入",
    "网页智能体提示注入",
    "提示攻击",
    "prompt injection"
   ]
  },
  {
   "id": "cyber",
   "name": "网络与代码安全",
   "featuredId": "S071",
   "directionIds": [
    "agent-software",
    "physical-ai",
    "ai-x-science"
   ],
   "terms": [
    "网络",
    "代码安全",
    "漏洞",
    "攻防",
    "网络能力",
    "cyber",
    "vulnerability",
    "code security"
   ]
  },
  {
   "id": "multimodal",
   "name": "多模态与生成安全",
   "featuredId": "S045",
   "directionIds": [
    "foundation-model"
   ],
   "terms": [
    "多模态",
    "视觉",
    "全模态",
    "视频",
    "文生图",
    "视觉语言",
    "图像生成",
    "multimodal",
    "vision-language"
   ]
  },
  {
   "id": "embodied",
   "name": "具身智能与自动驾驶",
   "featuredId": "S149",
   "directionIds": [
    "physical-ai"
   ],
   "terms": [
    "驾驶",
    "具身",
    "机器人",
    "物理",
    "VLA",
    "强化学习",
    "安全控制",
    "碰撞",
    "危险任务规划",
    "driving",
    "robot"
   ]
  },
  {
   "id": "social",
   "name": "伦理与社会影响",
   "featuredId": "S119",
   "directionIds": [
    "human-societal"
   ],
   "terms": [
    "伦理",
    "社会危害",
    "政治",
    "欺骗",
    "迎合",
    "自我认知",
    "价值测量",
    "ethics",
    "deception"
   ]
  },
  {
   "id": "children",
   "name": "儿童与青少年安全",
   "featuredId": "S158",
   "directionIds": [
    "human-societal"
   ],
   "terms": [
    "未成年人",
    "儿童",
    "青少年",
    "年龄分层",
    "child",
    "teen"
   ]
  },
  {
   "id": "science",
   "name": "生物、医疗与科研安全",
   "featuredId": "S127",
   "directionIds": [
    "ai-x-science"
   ],
   "terms": [
    "生物",
    "医学",
    "医疗",
    "健康",
    "化学",
    "实验室",
    "科研",
    "科学",
    "bio",
    "medical",
    "chemistry",
    "science"
   ]
  },
  {
   "id": "finance",
   "name": "金融与专业领域",
   "featuredId": "S135",
   "directionIds": [
    "ai-x-science"
   ],
   "terms": [
    "金融",
    "法律",
    "专业领域",
    "finance",
    "legal"
   ]
  },
  {
   "id": "infrastructure",
   "name": "工业与关键基础设施",
   "featuredId": "S154",
   "directionIds": [
    "physical-ai",
    "ai-x-science"
   ],
   "terms": [
    "工业",
    "物联网",
    "智能合约",
    "关键基础设施",
    "industrial",
    "IoT",
    "smart contract"
   ]
  }
 ],
 "integrated": {
  "S022": "helm-safety",
  "S055": "agentdojo",
  "S118": "flames",
  "S135": "finsafety",
  "S149": "safevla"
 },
 "stateOrder": {
  "已下载结果": 0,
  "已下载原始输出": 1,
  "公开结果文件": 2,
  "公开榜单": 3,
  "论文/图表": 4,
  "待核验": 5,
  "工具/环境": 6
 },
 "toolCopy": {
  "rules": [
   {
    "pattern": "unlearn|遗忘",
    "flags": "",
    "tag": "机器遗忘",
    "purpose": "用于构建和比较机器遗忘实验。",
    "contents": "遗忘效果、隐私保护、能力保留"
   },
   {
    "pattern": "privacy meter|成员推断|membership inference",
    "flags": "",
    "tag": "隐私审计",
    "purpose": "用于检测训练数据泄露和成员推断风险。",
    "contents": "成员推断、低误报率表现、隐私泄露"
   },
   {
    "pattern": "fedscale|\\bleaf\\b|联邦学习",
    "flags": "",
    "tag": "联邦学习",
    "purpose": "提供联邦学习任务、数据和系统基线。",
    "contents": "任务效用、通信成本、训练效率"
   },
   {
    "pattern": "datacomp|dataperf|数据治理",
    "flags": "",
    "tag": "数据治理",
    "purpose": "用于比较数据选择、清洗和质量治理方法。",
    "contents": "数据质量、下游表现、选择与清洗流程"
   },
   {
    "pattern": "controlarena|智能体控制",
    "flags": "",
    "tag": "智能体控制",
    "purpose": "用于评估智能体控制协议中的安全与效用。",
    "contents": "控制协议、安全表现、任务效用"
   },
   {
    "pattern": "\\bares\\b|检索生成|rag",
    "flags": "",
    "tag": "检索生成评估",
    "purpose": "用于评估检索增强生成系统的相关性与忠实度。",
    "contents": "上下文相关性、答案忠实度、答案相关性"
   },
   {
    "pattern": "omnisafe|安全强化学习",
    "flags": "",
    "tag": "安全强化学习",
    "purpose": "用于比较安全强化学习算法与基线。",
    "contents": "任务回报、安全成本、收敛表现"
   },
   {
    "pattern": "smartbugs|solidifi|ethernaut|智能合约",
    "flags": "",
    "tag": "智能合约安全",
    "purpose": "用于智能合约漏洞检测、注入与攻防实验。",
    "contents": "漏洞检出、误报漏报、运行代价"
   },
   {
    "pattern": "roboguard|机器人安全",
    "flags": "",
    "tag": "机器人安全",
    "purpose": "用于评估机器人任务中的安全约束和防护方法。",
    "contents": "安全规格、违规检测、任务成功率"
   },
   {
    "pattern": "carla|nuscenes|waymo|habitat|ai2-thor|behavior-1k|robosuite|rlbench|maniskill|驾驶|具身|物理 ai",
    "flags": "",
    "tag": "物理 AI 环境",
    "purpose": "提供驾驶、具身或机器人任务的仿真与数据环境。",
    "contents": "任务表现、感知能力、操作能力"
   },
   {
    "pattern": "webarena|osworld|browsergym|toolsandbox|toolbench|agentbench|\\bgaia\\b|智能体任务|工具调用",
    "flags": "",
    "tag": "智能体任务环境",
    "purpose": "提供智能体任务执行和工具调用的可复现实验环境。",
    "contents": "任务成功率、工具使用、系统能力"
   }
  ],
  "fallback": {
   "tag": "工具与运行环境",
   "purpose": "用于搭建安全评测环境、运行任务和复现实验。",
   "contents": "任务运行、工具集成、系统能力与复现流程"
  }
 },
 "datasets": [
  {
   "id": "data-safe-rlhf",
   "name": "PKU-SafeRLHF",
   "description": "有用性与无害性偏好数据，供安全对齐研究使用；版本、许可和下载方式见原始数据卡。",
   "source": "PKU-Alignment",
   "kind": "偏好数据集",
   "url": "https://huggingface.co/datasets/PKU-Alignment/PKU-SafeRLHF",
   "source_url": "https://github.com/PKU-Alignment/safe-rlhf",
   "direction_ids": [
    "foundation-model",
    "human-societal"
   ]
  },
  {
   "id": "data-agentdojo",
   "name": "AgentDojo 任务套件",
   "description": "提示注入评测的任务、环境与配置入口。使用时需结合运行文档，不能当作独立问答数据集。",
   "source": "ETH Zurich / Invariant Labs",
   "kind": "任务数据与环境",
   "url": "https://agentdojo.spylab.ai/",
   "direction_ids": [
    "agent-software"
   ]
  },
  {
   "id": "data-risk-repository",
   "name": "The AI Risk Repository",
   "description": "将 AI 风险描述关联到原始资料的研究数据库，可从项目页查看和获取；属于风险资料库。",
   "source": "MIT AI Risk Initiative",
   "kind": "风险资料库",
   "url": "https://airisk.mit.edu/risks",
   "direction_ids": [
    "data-privacy",
    "foundation-model",
    "agent-software",
    "physical-ai",
    "human-societal",
    "ai-x-science"
   ]
  }
 ],
 "team": [
  {
   "name": "Xinfeng Li",
   "institution": "香港理工大学",
   "role": "教授"
  },
  {
   "name": "Xin Gao",
   "institution": "东京理科大学",
   "role": "参与成员"
  }
 ],
 "handPapers": [
  {
   "id": "paper-agentdojo",
   "title": "AgentDojo: A Dynamic Environment to Evaluate Prompt Injection Attacks and Defenses for LLM Agents",
   "year": "2024",
   "venue": "ETH Zurich / Invariant Labs",
   "url": "https://openreview.net/forum?id=m1YYAQjO3w",
   "direction_ids": [
    "agent-software"
   ],
   "note": "研究工具环境中的提示注入攻击与防御，同时观察正常任务效用。",
   "hand": true
  },
  {
   "id": "paper-mm-safetybench",
   "title": "MM-SafetyBench",
   "year": "2024",
   "venue": "MM-SafetyBench 作者团队",
   "url": "https://arxiv.org/abs/2311.17600",
   "direction_ids": [
    "foundation-model"
   ],
   "note": "研究图像加入后，多模态大模型的安全边界如何变化。",
   "hand": true
  },
  {
   "id": "paper-xstest",
   "title": "XSTest",
   "year": "2024",
   "venue": "NAACL 2024",
   "url": "https://aclanthology.org/2024.naacl-long.301/",
   "direction_ids": [
    "foundation-model",
    "human-societal"
   ],
   "note": "通过良性与有害边界测试，识别语言模型的过度拒绝。",
   "hand": true
  }
 ],
 "legacyBenchmarks": [
  {
   "id": "helm-safety",
   "name": "HELM Safety"
  },
  {
   "id": "agentdojo",
   "name": "AgentDojo"
  },
  {
   "id": "mm-safetybench",
   "name": "MM-SafetyBench"
  },
  {
   "id": "harmbench",
   "name": "HarmBench"
  },
  {
   "id": "xstest",
   "name": "XSTest"
  },
  {
   "id": "safebench",
   "name": "SafeBench"
  }
 ]
};
