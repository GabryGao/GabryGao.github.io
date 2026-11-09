(() => {
  'use strict';

  const both = (zh, en) => [zh, en];
  const pick = (value, english) => Array.isArray(value) ? value[english ? 1 : 0] : value;
  const unique = values => [...new Set(values.filter(Boolean))];

  const CATEGORY = {
    incident: {
      significance: both('这是一条已经进入真实环境的安全事件。阅读重点不只是问题是否存在，还包括暴露范围、可利用条件、受影响资产以及修复是否覆盖历史副本。', 'This is a safety issue observed in a real environment. The important questions are exposure, exploitability, affected assets, and whether remediation reaches historical copies.'),
      mechanisms: [
        [both('触发条件', 'Trigger'), both('确认问题由默认设置、用户操作、权限边界还是第三方集成触发，避免把多个原因混成一个结论。', 'Separate default behavior, user action, permission boundaries, and third-party integrations instead of treating them as one cause.')],
        [both('扩散路径', 'Propagation'), both('检查配置文件、日志、缓存、代码仓库、镜像和同步服务是否会把一次本地操作变成长期、可复制的暴露。', 'Check whether configuration files, logs, caches, repositories, mirrors, or sync services turn a local action into durable exposure.')],
        [both('实际后果', 'Impact'), both('区分信息暴露、权限滥用、远程访问、数据泄露和供应链影响，并核对是否已有真实利用证据。', 'Separate disclosure, privilege abuse, remote access, data loss, and supply-chain effects, and verify whether exploitation has been observed.')]
      ],
      actions: [both('先确认受影响版本、配置和资产范围，再决定是否轮换凭据或撤销权限。', 'Confirm affected versions, configurations, and assets before rotating credentials or revoking access.'), both('修复当前文件之外，还要检查提交历史、分支、分叉仓库、缓存和自动备份。', 'Inspect commit history, branches, forks, caches, and backups in addition to fixing the current file.'), both('记录发现时间、暴露窗口、处置动作和复核结果，便于后续审计。', 'Record discovery time, exposure window, remediation, and verification for later audit.')]
    },
    attack: {
      significance: both('这条记录描述的是攻击方法、漏洞或可被滥用的能力。判断风险时需要同时看攻击前提、成功率、权限收益和现有防御是否有效。', 'This record concerns an attack method, vulnerability, or misuse capability. Risk depends on prerequisites, success rate, gained privileges, and the effectiveness of existing defenses.'),
      mechanisms: [
        [both('入口', 'Entry point'), both('识别攻击者需要控制的输入、工具、插件、文件、网页或上下文，以及是否需要用户配合。', 'Identify the input, tool, plug-in, file, page, or context the attacker must control and whether user cooperation is required.')],
        [both('能力放大', 'Capability amplification'), both('分析模型、智能体权限或自动化流程如何把一个普通输入转化为更高权限的操作。', 'Analyze how model behavior, agent permissions, or automation turns an ordinary input into a higher-impact action.')],
        [both('防御缺口', 'Defense gap'), both('核对输入过滤、权限隔离、人工确认、审计日志和异常检测在哪一步失效。', 'Locate where filtering, isolation, confirmation, logging, or anomaly detection fails.')]
      ],
      actions: [both('用最小权限重新评估工具调用和数据访问范围。', 'Reassess tool and data access under least privilege.'), both('把攻击样例加入回归测试，并覆盖不同模型、语言和工具配置。', 'Add the attack to regression tests across models, languages, and tool configurations.'), both('明确无法完全阻断时的降级策略和人工接管条件。', 'Define graceful degradation and human takeover when complete prevention is not possible.')]
    },
    policy: {
      significance: both('政策与治理信号的影响通常不会在发布当天全部显现。需要区分正式规则、征求意见、执行指南和政治表态，并追踪适用范围与生效时间。', 'Policy effects rarely appear on publication day. Distinguish binding rules, consultations, guidance, and political statements, then track scope and effective dates.'),
      mechanisms: [
        [both('法律状态', 'Legal status'), both('确认文本是法律、行政命令、标准、草案还是自愿承诺。', 'Determine whether the text is law, an executive action, a standard, a draft, or a voluntary commitment.')],
        [both('适用对象', 'Scope'), both('识别受约束的模型、机构、地区、用途和规模门槛。', 'Identify covered models, organizations, jurisdictions, uses, and scale thresholds.')],
        [both('执行方式', 'Enforcement'), both('观察报告、审计、处罚、采购限制和合规证明如何落地。', 'Track reporting, audits, penalties, procurement restrictions, and compliance evidence.')]
      ],
      actions: [both('建立条款、日期、责任主体和证据要求的对照表。', 'Map provisions, dates, responsible parties, and evidence requirements.'), both('把政策要求对应到现有评测、数据治理和发布流程。', 'Map policy requirements to evaluation, data governance, and release processes.'), both('持续记录后续解释文件和执行案例。', 'Track later interpretations and enforcement cases.')]
    },
    eval: {
      significance: both('评测结果不是一个可以脱离任务、模型版本和设置单独阅读的分数。重点是测试覆盖了什么、遗漏了什么，以及结果能否复现。', 'An evaluation score cannot be read independently of tasks, model versions, and settings. The key questions are coverage, omissions, and reproducibility.'),
      mechanisms: [
        [both('任务覆盖', 'Task coverage'), both('核对数据集、攻击集、语言、工具权限和失败定义是否覆盖实际使用场景。', 'Check whether datasets, attacks, languages, permissions, and failure definitions reflect real use.')],
        [both('实验设置', 'Experimental setup'), both('记录模型版本、提示词、采样参数、系统配置和评测时间。', 'Record model version, prompts, sampling parameters, system configuration, and evaluation date.')],
        [both('指标解释', 'Metric interpretation'), both('确认指标方向、统计不确定性和阈值，避免把局部结果解释成整体安全排名。', 'Confirm metric direction, uncertainty, and thresholds instead of treating a local result as an overall safety ranking.')]
      ],
      actions: [both('保留任务、配置、指标和原始结果的可追溯记录。', 'Keep traceable records of tasks, configurations, metrics, and raw results.'), both('至少复核一个关键结果，确认数据处理和评分脚本。', 'Recheck at least one key result, including preprocessing and scoring.'), both('明确结果适用边界，不跨基准直接合并总分。', 'State applicability limits and avoid combining scores across benchmarks.')]
    },
    defense: {
      significance: both('防御方案需要同时回答有效性、覆盖范围和代价。只展示成功案例不足以说明它在对抗性输入、分布变化和长期运行中仍然可靠。', 'A defense must demonstrate effectiveness, coverage, and cost. Successful examples alone do not establish robustness under adversarial inputs, distribution shift, or long-term operation.'),
      mechanisms: [
        [both('检测', 'Detection'), both('说明系统检测什么信号、误报漏报如何衡量，以及攻击者是否容易绕过。', 'Specify detected signals, false-positive and false-negative measurement, and likely bypasses.')],
        [both('阻断', 'Containment'), both('确认检测后采取拒绝、隔离、降权、人工复核还是权限撤销。', 'Clarify whether detection triggers refusal, isolation, reduced privilege, human review, or revocation.')],
        [both('副作用', 'Trade-offs'), both('评估能力损失、延迟、成本、用户体验和对正常任务的影响。', 'Measure capability loss, latency, cost, user experience, and impact on legitimate tasks.')]
      ],
      actions: [both('使用未参与开发的攻击集做独立验证。', 'Validate with attack sets not used during development.'), both('记录失败样例和绕过方式，而不只发布平均分。', 'Publish failures and bypasses, not only averages.'), both('为防御失效准备隔离和人工处置流程。', 'Prepare isolation and human-response procedures for defense failures.')]
    },
    alignment: {
      significance: both('对齐信号关注模型目标、行为和人类意图之间的偏差。需要区分实验室行为、提示诱导行为和部署后的持续行为。', 'Alignment signals concern gaps between model objectives, behavior, and human intent. Separate laboratory behavior, prompt-induced behavior, and persistent deployment behavior.'),
      mechanisms: [
        [both('目标偏差', 'Objective mismatch'), both('识别训练目标、奖励模型或代理指标与真实任务目标不一致的位置。', 'Locate mismatches between training objectives, reward models, proxy metrics, and the real task.')],
        [both('情境依赖', 'Context dependence'), both('检查行为是否依赖特定提示、角色、工具、记忆或监督强度。', 'Check dependence on prompts, roles, tools, memory, or supervision strength.')],
        [both('持续性', 'Persistence'), both('判断问题是单次异常、可重复模式还是跨任务稳定策略。', 'Determine whether the issue is a one-off anomaly, a reproducible pattern, or a stable cross-task strategy.')]
      ],
      actions: [both('保存完整交互轨迹和实验条件。', 'Preserve full interaction traces and conditions.'), both('使用不同评测者、模型版本和提示重新验证。', 'Revalidate with different evaluators, model versions, and prompts.'), both('把发现转化为可重复的评测任务。', 'Turn the finding into a reproducible evaluation task.')]
    },
    research: {
      significance: both('这是一条研究或产业动态。它是否构成安全进展，取决于方法、证据、可复现性以及与真实部署风险的联系。', 'This is a research or industry development. Its safety value depends on method, evidence, reproducibility, and connection to deployment risk.'),
      mechanisms: [
        [both('研究问题', 'Research question'), both('明确作者试图解释、测量或改进的安全问题。', 'State the safety problem the work attempts to explain, measure, or improve.')],
        [both('证据形式', 'Evidence'), both('区分理论论证、数据分析、实验评测、案例研究和产品声明。', 'Distinguish theory, data analysis, experiments, case studies, and product claims.')],
        [both('外推边界', 'Generalization'), both('检查结论能否跨模型、任务、语言、组织和部署条件成立。', 'Check whether conclusions transfer across models, tasks, languages, organizations, and deployments.')]
      ],
      actions: [both('优先查阅方法、数据和代码，而不只看结论。', 'Prioritize methods, data, and code rather than conclusions alone.'), both('记录无法复现或尚未公开的关键环节。', 'Record critical steps that are unavailable or not reproducible.'), both('将结论与已有研究和相反证据进行比较。', 'Compare claims with prior work and contrary evidence.')]
    }
  };

  const DIRECTION = {
    'data-privacy': {
      significance: both('数据与隐私方向需要特别追踪敏感数据如何进入系统、在哪里持久化、谁能够读取，以及删除后是否仍存在历史副本。', 'For data and privacy, trace how sensitive data enters the system, where it persists, who can read it, and whether historical copies remain after deletion.'),
      questions: [both('是否涉及个人信息、凭据、训练数据或可重新识别的数据？', 'Does it involve personal data, credentials, training data, or re-identifiable information?'), both('删除、撤销和轮换是否覆盖日志、缓存与历史版本？', 'Do deletion, revocation, and rotation cover logs, caches, and history?')]
    },
    'foundation-model': {
      significance: both('基础模型方向应区分模型本身、系统提示、产品层护栏和外部工具的责任边界，避免把产品配置问题简单归因于模型能力。', 'For foundation models, separate the model, system prompt, product guardrails, and external tools instead of attributing every product issue to model capability.'),
      questions: [both('问题来自模型行为、产品默认值还是部署集成？', 'Does the issue originate in model behavior, product defaults, or deployment integration?'), both('不同模型版本和系统配置是否表现一致？', 'Is the behavior consistent across model versions and system configurations?')]
    },
    'agent-software': {
      significance: both('智能体和软件系统把模型输出连接到文件、终端、代码仓库和云服务。风险往往来自权限、持久化状态和自动执行的组合，而不是单次回答本身。', 'Agents connect model output to files, terminals, repositories, and cloud services. Risk often comes from the combination of privilege, persistent state, and automatic execution rather than a single response.'),
      questions: [both('工具权限是否默认过大，敏感操作是否需要重新确认？', 'Are tool permissions overly broad, and do sensitive actions require renewed confirmation?'), both('命令、凭据和上下文会被写入哪些持久化文件？', 'Which persistent files receive commands, credentials, or context?'), both('审计日志能否还原模型、用户和工具各自做了什么？', 'Can audit logs reconstruct what the model, user, and tools each did?')]
    },
    'physical-ai': {
      significance: both('物理 AI 的错误可能直接影响人员、设备和环境，评估必须覆盖感知误差、控制失效、通信中断和紧急接管。', 'Physical-AI failures can affect people, equipment, and environments, so evaluation must cover perception error, control failure, communication loss, and emergency takeover.'),
      questions: [both('系统失效时是否进入安全状态？', 'Does the system enter a safe state on failure?'), both('仿真结果与真实环境之间有哪些差距？', 'What gaps exist between simulation and the real environment?')]
    },
    'human-societal': {
      significance: both('人机交互与社会影响需要同时观察直接伤害、群体差异、行为诱导、信息生态和制度性后果。', 'Human and societal analysis should cover direct harm, group differences, behavioral influence, information ecosystems, and institutional effects.'),
      questions: [both('哪些群体承担更高风险或更少申诉机会？', 'Which groups face higher risk or fewer avenues for appeal?'), both('影响是一次性的，还是会通过规模化部署累积？', 'Is the impact episodic, or does it accumulate through scaled deployment?')]
    },
    'ai-x-science': {
      significance: both('AI+X 与科学方向要把能力提升和领域风险分开分析，尤其关注高后果知识、错误建议和专业责任。', 'For AI-for-science, separate capability gains from domain risk, especially high-consequence knowledge, incorrect advice, and professional responsibility.'),
      questions: [both('输出是否会改变现实实验、医疗、金融或基础设施决策？', 'Could outputs influence real experiments, medical care, finance, or infrastructure decisions?'), both('是否有领域专家和独立数据进行复核？', 'Has the work been reviewed by domain experts and independent data?')]
    }
  };

  const SPECIAL = {
    'web-804a43c3361e': {
      lead: both('这起事件的核心不是 Claude Code 主动“窃取”凭据，而是一个方便用户免除重复确认的产品选项，把完整命令持久化到了项目配置文件。当命令中包含密码、令牌或云密钥，而配置文件又被提交到公开仓库时，本地便利功能就转化成了凭据泄露链条。', 'The issue is not Claude Code autonomously stealing credentials. A convenience option persisted complete commands into project settings; when commands contained secrets and the file entered a public repository, a local workflow became a credential-exposure path.'),
      sourceFacts: [
        both('The Hacker News 转述 Apiiro 的扫描结果：研究人员在公开 GitHub 数据中发现约 104,185 份相关配置文件，分布于约 103,617 个仓库。', 'The Hacker News relays Apiiro findings of roughly 104,185 related configuration files across about 103,617 public repositories.'),
        both('报告称其中 1,122 份文件包含敏感信息，共识别出 1,379 个不同的秘密值，包括数据库凭据、远程登录信息、开发平台令牌和云访问密钥。', 'The report says 1,122 files contained sensitive information, with 1,379 distinct secrets including database credentials, remote logins, developer-platform tokens, and cloud keys.'),
        both('风险入口是用户选择“以后不再询问”后，命令被逐字写入 `.claude/settings.local.json`；如果命令行直接带有秘密值，该秘密也会进入文件。', 'The reported entry point is the “do not ask again” choice, after which commands are written verbatim to `.claude/settings.local.json`; inline secrets therefore enter the file as well.'),
        both('即使后来删除当前文件，已推送的提交历史、分支、分叉仓库和缓存仍可能保留副本，因此处置不能只做一次文件删除。', 'Deleting the current file may not remove copies from history, branches, forks, or caches, so remediation cannot stop at one file deletion.')
      ],
      significance: [
        both('这类问题揭示了编码智能体的一个常见安全盲区：模型输出本身可能没有泄密，但权限确认、配置持久化和版本控制组合后会形成新的泄露面。', 'The case exposes a recurring coding-agent blind spot: the model response may not disclose a secret, yet confirmation UX, persistent configuration, and version control can combine into a new exposure surface.'),
        both('“本地配置文件”并不自动等于“不会进入仓库”。安全默认值需要同时考虑文件命名、忽略规则、界面提示、秘密扫描和提交前检查。', 'A “local settings” filename does not guarantee that it stays out of a repository. Safe defaults must cover naming, ignore rules, UI warnings, secret scanning, and pre-commit checks.')
      ],
      evidence: [
        both('当前数字来自 Apiiro 的研究并由 The Hacker News 报道，本站尚未独立复现其 GitHub 扫描。', 'The figures originate in Apiiro research reported by The Hacker News; this site has not independently reproduced the GitHub scan.'),
        both('公开文件数量不等于仍然有效的凭据数量；部分秘密可能已失效、被轮换或属于测试环境。', 'The number of public files is not the number of still-valid credentials; some secrets may be expired, rotated, or test-only.'),
        both('是否受影响应以仓库历史、秘密扫描结果和对应服务的访问日志为准。', 'Impact should be established through repository history, secret-scanning results, and access logs for the affected services.')
      ],
      actions: [
        both('把 `.claude/settings.local.json` 和其他智能体本地状态文件加入组织级忽略模板与仓库策略。', 'Add `.claude/settings.local.json` and other agent-local state files to organization-wide ignore templates and repository policy.'),
        both('搜索当前文件、Git 历史、分支和分叉中的秘密值；发现后立即轮换，而不是只删除文件。', 'Search current files, Git history, branches, and forks for secrets; rotate exposed credentials instead of only deleting the file.'),
        both('禁止在命令行中直接拼接长期凭据，改用环境变量、短期令牌、秘密管理器或交互式输入。', 'Avoid embedding long-lived credentials directly in commands; use environment variables, short-lived tokens, secret managers, or interactive input.'),
        both('在提交前和 CI 中启用秘密扫描，并为智能体生成文件增加专门规则。', 'Enable secret scanning before commits and in CI, with dedicated rules for agent-generated files.')
      ],
      watch: [
        both('Anthropic 是否调整默认忽略规则、确认界面或配置文件格式。', 'Whether Anthropic changes ignore defaults, confirmation UX, or the configuration format.'),
        both('GitHub 与秘密扫描工具是否新增针对编码智能体状态文件的检测。', 'Whether GitHub and secret scanners add detection for coding-agent state files.'),
        both('后续复测中公开副本和有效凭据数量是否下降。', 'Whether follow-up scans show fewer public copies and live credentials.'),
        both('其他编码智能体是否存在相似的命令历史或权限持久化问题。', 'Whether other coding agents exhibit similar command-history or permission-persistence issues.')
      ]
    }
  };

  function localizedList(values, english) {
    return values.map(value => pick(value, english));
  }

  function localizedMechanisms(values, english) {
    return values.map(([title, text]) => ({ title: pick(title, english), text: pick(text, english) }));
  }

  function build(record, options) {
    const english = options.english === true;
    const translate = options.T;
    const summary = options.desc(record) || '';
    const categoryProfile = CATEGORY[record.category] || CATEGORY[record.kind] || CATEGORY.research;
    const directionProfiles = (record.direction_ids || []).map(id => DIRECTION[id]).filter(Boolean);
    const special = SPECIAL[record.id] || {};
    const directionNames = (record.direction_ids || []).map(options.dirName);
    const organisationNames = (record.orgs || []).map(options.orgName);
    const categoryName = options.category(record);
    const lead = special.lead ? pick(special.lead, english) : translate(
      `这条记录由 ${record.source} 于 ${record.date} 发布，本站将其归入“${categoryName}”并关联到${directionNames.length ? directionNames.join('、') : '基础模型'}。下面把来源陈述、本站分析和仍需核验的问题分开呈现。`,
      `Published by ${record.source} on ${record.date}, this record is classified as ${categoryName} and linked to ${directionNames.length ? directionNames.join(', ') : 'foundation models'}. Source claims, site analysis, and open verification questions are separated below.`
    );
    const sourceFacts = special.sourceFacts ? localizedList(special.sourceFacts, english) : [
      translate(`原始来源为 ${record.source}，发布日期为 ${record.date}。`, `The original source is ${record.source}, dated ${record.date}.`),
      summary ? translate(`来源提供的摘要指出：${summary}`, `The source summary states: ${summary}`) : translate('当前来源没有提供可用摘要，标题和元数据只能说明主题，不能替代原文事实。', 'The source supplied no usable summary; title and metadata identify the topic but cannot replace the original evidence.'),
      translate(`本站根据标题与摘要将其标注为“${categoryName}”，研究方向为${directionNames.length ? directionNames.join('、') : '待进一步确认'}。`, `Based on title and summary, the site labels it ${categoryName}; research directions are ${directionNames.length ? directionNames.join(', ') : 'pending further review'}.`)
    ];
    const significance = unique([
      ...(special.significance ? localizedList(special.significance, english) : []),
      pick(categoryProfile.significance, english),
      ...directionProfiles.map(profile => pick(profile.significance, english)),
      organisationNames.length ? translate(`记录涉及 ${organisationNames.join('、')}。机构名称说明报道对象或相关方，不自动表示责任已经得到独立确认。`, `The record references ${organisationNames.join(', ')}. Named organizations are subjects or relevant parties, not independently confirmed assignments of responsibility.`) : ''
    ]).slice(0, 4);
    const mechanisms = unique([
      ...localizedMechanisms(categoryProfile.mechanisms, english).map(item => JSON.stringify(item)),
      ...directionProfiles.flatMap(profile => localizedList(profile.questions, english).map((text, index) => JSON.stringify({ title: translate(`核验问题 ${index + 1}`, `Verification question ${index + 1}`), text })))
    ]).map(item => JSON.parse(item)).slice(0, 5);
    const evidence = special.evidence ? localizedList(special.evidence, english) : [
      translate(`当前档案主要依据 ${record.source} 的原始页面和公开元数据，本站没有把单一报道当作独立复现。`, `This dossier currently relies on the ${record.source} page and public metadata; a single report is not treated as an independent reproduction.`),
      translate('标题、摘要、类别和研究方向的粒度不同。标题和摘要来自来源，类别与方向由本站规则整理，可能需要人工复核。', 'Title and summary come from the source; category and direction are site classifications and may require manual review.'),
      options.related.length ? translate(`本站找到 ${options.related.length} 条同主题或同方向记录，可用于补充时间线，但不能替代对当前事件的直接证据。`, `${options.related.length} topical or directional records add context to the timeline but do not replace direct evidence for this event.`) : translate('当前没有足够的站内相关记录形成独立交叉验证。', 'There are not enough related site records for independent cross-checking.')
    ];
    const actions = unique([
      ...(special.actions ? localizedList(special.actions, english) : []),
      ...localizedList(categoryProfile.actions, english)
    ]).slice(0, 6);
    const watch = special.watch ? localizedList(special.watch, english) : unique([
      translate('原始发布方是否补充方法、数据、修复状态或更正说明。', 'Whether the original publisher adds methods, data, remediation status, or corrections.'),
      translate('涉及机构是否确认、否认或重新界定影响范围。', 'Whether named organizations confirm, dispute, or redefine the scope.'),
      translate('是否出现独立复现、后续事件或公开评测。', 'Whether independent reproduction, follow-on incidents, or public evaluations appear.'),
      ...directionProfiles.flatMap(profile => localizedList(profile.questions, english))
    ]).slice(0, 6);
    const questions = unique([
      ...directionProfiles.flatMap(profile => localizedList(profile.questions, english)),
      translate('哪些结论是来源直接给出的，哪些是二手报道或本站推断？', 'Which conclusions are direct source claims, secondary reporting, or site inference?'),
      translate('现有证据是否足以估计发生概率、影响规模和可复现性？', 'Is the evidence sufficient to estimate likelihood, impact, and reproducibility?'),
      translate('这条记录能否转化为新的评测任务、监控规则或工程检查项？', 'Can this record become an evaluation task, monitoring rule, or engineering check?')
    ]).slice(0, 6);
    return { lead, sourceFacts, significance, mechanisms, evidence, actions, watch, questions };
  }

  window.SignalBrief = { build };
})();
