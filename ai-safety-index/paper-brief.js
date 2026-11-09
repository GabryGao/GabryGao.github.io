(() => {
  'use strict';

  const both = (zh, en) => [zh, en];
  const pick = (value, english) => Array.isArray(value) ? value[english ? 1 : 0] : value;
  const unique = values => [...new Set(values.filter(Boolean))];

  const DIRECTIONS = {
    'data-privacy': {
      significance: both('这项研究与训练数据、隐私边界、秘密暴露或数据完整性有关。阅读时应区分攻击是否真的恢复敏感信息，以及实验是否覆盖现实访问条件。', 'This work concerns training data, privacy boundaries, secret exposure, or data integrity. Check whether sensitive information is actually recovered and whether the experiment reflects realistic access conditions.'),
      next: [both('核对攻击者权限、查询预算、数据先验和成功判定。', 'Check attacker access, query budget, data priors, and success criteria.'), both('同时报告隐私保护效果、正常效用和部署成本。', 'Report privacy protection, normal utility, and deployment cost together.')]
    },
    'foundation-model': {
      significance: both('这项研究直接涉及基础模型的对齐、拒答、越狱、推理可靠性或安全训练。仅看单一安全分数不足以判断稳健性，还要检查误拒、能力保持和攻击自适应。', 'This work directly concerns foundation-model alignment, refusal, jailbreaks, reasoning reliability, or safety training. A single safety score is insufficient; false refusals, retained capability, and adaptive attacks also matter.'),
      next: [both('比较安全提升与正常能力、误拒率之间的权衡。', 'Compare safety gains with normal capability and false-refusal trade-offs.'), both('在不同模型家族、语言和自适应攻击下复测。', 'Retest across model families, languages, and adaptive attacks.')]
    },
    'agent-software': {
      significance: both('这项研究关注模型进入工具、代码、浏览器或多智能体工作流后的系统风险。模型级结果需要与权限、执行环境、日志和人工确认机制一起解释。', 'This work concerns system risk once models enter tool, code, browser, or multi-agent workflows. Model-level results must be interpreted with permissions, execution environments, logging, and human confirmation.'),
      next: [both('复现实验时固定工具权限、环境状态和任务成功标准。', 'Fix tool permissions, environment state, and task-success criteria during reproduction.'), both('记录失败是否停留在文本层，还是转化成真实工具动作。', 'Record whether failure remains textual or becomes a real tool action.')]
    },
    'physical-ai': {
      significance: both('这项研究涉及具身系统、机器人或多模态模型。离线准确率不能单独代表现实安全，需要观察物理后果、恢复能力和分布外条件。', 'This work concerns embodied systems, robotics, or multimodal models. Offline accuracy alone does not establish real-world safety; physical consequences, recovery, and out-of-distribution conditions matter.'),
      next: [both('增加真实环境扰动、传感器异常和失败恢复测试。', 'Add real-world disturbances, sensor faults, and failure-recovery tests.'), both('把任务成功率与碰撞、损伤、越界动作等安全端点分开报告。', 'Report task success separately from collisions, damage, and unsafe actions.')]
    },
    'human-societal': {
      significance: both('这项研究涉及人机互动、群体影响或社会风险。平均结果可能掩盖群体差异、长期影响和申诉成本。', 'This work concerns human interaction, population effects, or societal risk. Average results may hide group differences, long-term effects, and the cost of appeal.'),
      next: [both('按群体、场景和语言分层报告结果。', 'Stratify results by population, scenario, and language.'), both('说明短期实验能否支持长期或大规模部署结论。', 'State whether short experiments support long-term or scaled-deployment claims.')]
    },
    'ai-x-science': {
      significance: both('这项研究把 AI 用于高后果专业领域。能力提升和安全保证需要分开验证，并由领域专家检查错误输出的现实影响。', 'This work applies AI in a high-consequence professional domain. Capability gains and safety guarantees require separate validation, including expert review of real-world error impact.'),
      next: [both('使用独立数据和领域专家复核关键结论。', 'Validate key claims with independent data and domain experts.'), both('报告错误建议进入现实决策后的最坏后果。', 'Report worst-case consequences when incorrect advice reaches real decisions.')]
    }
  };

  const METHOD = /\b(?:we|the authors?)\s+(?:propose|present|introduce|develop|build|construct|design|formalize|create|evaluate|investigate)|\b(?:framework|method|approach|benchmark|dataset|environment|pipeline)\b|我们(?:提出|构建|设计|开发|建立|评估|研究)|本文(?:提出|构建|设计|研究)|框架|方法|基准|数据集|环境|流程/i;
  const RESULT = /\b(?:we|the authors?)\s+(?:find|show|demonstrate|observe|report)|\b(?:results?|outperform|improv|increase|decrease|reduce|achiev|accuracy|auc|rate|percentage|significant)\b|\d+(?:\.\d+)?\s*(?:%|points?|models?|runs?|samples?|examples?)|我们(?:发现|表明|证明|观察到)|结果|优于|提升|增加|下降|降低|达到|准确率|成功率|百分/i;
  const SETUP = /\b(?:experiment|evaluate|evaluation|across|model families|models?|datasets?|benchmarks?|runs?|participants?|samples?|held-out|baseline)\b|实验|评估|模型|数据集|基准|运行|样本|参与者|对照/i;
  const LIMIT = /\b(?:limitation|future work|unknown|unclear|cannot|does not|warning|may not|only|single scenario)\b|局限|限制|未来工作|尚不清楚|不能|无法|警告|仅|单一场景/i;

  function clean(value) {
    return String(value || '')
      .replace(/\\textbf\{([^{}]+)\}/g, '$1')
      .replace(/\\(?:textit|emph)\{([^{}]+)\}/g, '$1')
      .replace(/\$\^\{?([^}$]+)\}?\$/g, '^$1')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function sentences(value) {
    const text = clean(value);
    return (text.match(/[^.!?。！？]+(?:[.!?。！？]+|$)/g) || [text]).map(item => item.trim()).filter(item => item.length > 18);
  }

  function select(items, pattern, limit) {
    return unique(items.filter(item => pattern.test(item))).slice(0, limit);
  }

  function build(paper, options) {
    const english = options.english === true;
    const T = options.T;
    const abstract = clean(options.abstract(paper));
    const parts = sentences(abstract);
    const directions = (paper.direction_ids || []).map(id => DIRECTIONS[id]).filter(Boolean);
    const problemCandidates = parts.filter(item => !METHOD.test(item) && !RESULT.test(item));
    const problem = (problemCandidates.length ? problemCandidates : parts).slice(0, 3);
    const methods = select(parts, METHOD, 4);
    const results = select(parts, RESULT, 4);
    const setup = select(parts, SETUP, 5);
    const reportedLimits = select(parts, LIMIT, 3);
    const hasAbstract = Boolean(abstract);
    const metadataOnly = T(
      '当前记录只有题名、作者、发表处和研究方向等书目信息，尚未保存可核验的作者摘要。方法、实验和结果必须回到原文确认。',
      'This record currently contains bibliographic metadata only. Methods, experiments, and results must be verified in the original paper.'
    );

    const quickRead = hasAbstract ? unique([
      ...problem.slice(0, 1),
      ...methods.slice(0, 1),
      ...results.slice(0, 1)
    ]).slice(0, 3) : [metadataOnly];
    const researchQuestion = hasAbstract ? (problem.length ? problem : [T('作者摘要没有把研究问题单独写出，需要结合引言确认。', 'The abstract does not isolate the research question; consult the introduction.')]) : [metadataOnly];
    const method = hasAbstract ? (methods.length ? methods : [T('作者摘要没有提供足够的方法细节，需要查看正文、附录和代码。', 'The abstract does not provide enough methodological detail; consult the paper, appendices, and code.')]) : [metadataOnly];
    const findings = hasAbstract ? (results.length ? results : [T('作者摘要没有报告可直接提取的量化结果，不能据此推断效果大小。', 'The abstract does not report directly extractable quantitative results, so effect size should not be inferred.')]) : [metadataOnly];
    const experiment = hasAbstract ? (setup.length ? setup : [T('摘要未完整列出模型、数据集、基线和重复次数，实验设置需要回原文核对。', 'The abstract does not fully list models, datasets, baselines, and repetitions; verify the setup in the paper.')]) : [metadataOnly];
    const significance = unique([
      ...directions.map(profile => pick(profile.significance, english)),
      T(
        `本站根据题名、摘要与分类信息将其关联到${(paper.direction_ids || []).length ? (paper.direction_ids || []).map(options.dirName).join('、') : 'AI 安全研究'}。这个归类用于阅读导航，不代替作者对贡献范围的定义。`,
        `Based on title, abstract, and metadata, the site links this paper to ${(paper.direction_ids || []).length ? (paper.direction_ids || []).map(options.dirName).join(', ') : 'AI safety research'}. This is a reading aid, not a substitute for the authors' stated scope.`
      )
    ]);
    const limitations = unique([
      ...reportedLimits,
      hasAbstract
        ? T('当前导读主要依据作者摘要和公开元数据，尚未逐项核查正文、附录、代码、数据与复现实验。', 'This guide is based mainly on the author abstract and public metadata; the full text, appendices, code, data, and reproductions have not been checked item by item.')
        : metadataOnly,
      T('摘要中的结果是作者报告，不等于本站已经独立复现。', 'Results in the abstract are author-reported and have not been independently reproduced by this site.')
    ]);
    const nextSteps = unique([
      ...directions.flatMap(profile => profile.next.map(item => pick(item, english))),
      T('核对正文中的任务定义、数据来源、最强基线、统计方法和失败案例。', 'Check task definitions, data sources, strongest baselines, statistical methods, and failure cases in the full paper.'),
      T('确认代码、数据与评测协议是否公开，以及结果能否被第三方复现。', 'Confirm whether code, data, and evaluation protocols are public and independently reproducible.')
    ]).slice(0, 6);
    const selectionReason = paper.score != null
      ? T(`该论文在本站本周 arXiv 安全关键词筛选中得分 ${paper.score}，并因研究问题与安全评测直接相关而进入列表。`, `The paper scored ${paper.score} in this week's arXiv safety-keyword screening and was included for its direct relevance to safety research or evaluation.`)
      : T(`该论文收录于本站论文库，当前子主题为“${paper.description || '待进一步整理'}”。`, `This paper is included in the site library under “${paper.description || 'pending further review'}.”`);
    const answer = items => items.join(' ');
    const questions = [
      [T('这篇论文试图解决什么问题？', 'What problem does the paper address?'), answer(researchQuestion)],
      [T('作者采用了什么方法？', 'What method does it use?'), answer(method)],
      [T('实验和评测是怎样设置的？', 'How are experiments and evaluations set up?'), answer(experiment)],
      [T('作者报告了哪些主要结果？', 'What main results are reported?'), answer(findings)],
      [T('证据边界和局限是什么？', 'What are the evidence boundaries and limitations?'), answer(limitations)],
      [T('下一步最值得核查什么？', 'What should be checked next?'), answer(nextSteps)]
    ];

    return { hasAbstract, abstract, quickRead, researchQuestion, method, findings, experiment, significance, limitations, nextSteps, selectionReason, questions };
  }

  window.PaperBrief = { build, clean };
})();
