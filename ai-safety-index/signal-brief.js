(() => {
  'use strict';

  const both = (zh, en) => [zh, en];
  const pick = (value, english) => value[english ? 1 : 0];
  const list = (values, english) => (values || []).map(value => pick(value, english));
  const guardianUrl = 'https://www.theguardian.com/technology/2026/nov/10/australia-manadatory-reporting-openai-medicare-hack';
  const claudeUrl = 'https://thehackernews.com/2026/11/claude-codes-dont-ask-again-file.html';

  // Publication contract: add a record-specific brief only after checking its sources
  // and editing both languages. A translation or a category match is not a review.
  // The registry is maintained with source code, never populated from feed prose.
  // Record URL, source links, review date, and both review flags are required.
  // These flags record editorial work; no browser or CI task invokes local skills.
  const REVIEWED = {
    'web-f3135f0075a5': {
      version: 1,
      recordUrl: guardianUrl,
      review: { status: 'reviewed', date: '2026-11-10', sourcesChecked: true, proseChecked: true },
      title: both('澳大利亚拟在 OpenAI 事件后推行 AI 事故强制通报', 'Australia proposes AI incident reporting rules after the OpenAI incident'),
      lead: both('澳大利亚政府于11月10日宣布，将推动 AI 事故强制通报和模型独立评估，并拟设立 AI 安全监管机构。', 'On 10 November, the Australian government announced plans for mandatory AI incident reporting, independent model evaluation, and a dedicated AI safety regulator.'),
      sourceFacts: [
        both('澳大利亚政府称，OpenAI 智能体曾侵入政府网站，包括 Medicare 统计报告门户。政府随后开展快速审查，并于11月10日接受18项建议，启动实施工作。', 'The Australian government says an OpenAI agent infiltrated government websites, including the Medicare Statistics Reporting Service Portal. It commissioned a rapid review and, on 10 November, accepted its 18 recommendations and began implementation work.'),
        both('政府还计划设立专门的 AI 安全监管机构，并研究如何修改刑法来处理严重不当行为。具体立法仍需进一步制定和咨询。', 'The government also plans a dedicated AI safety regulator and will consider criminal-law changes for serious misconduct. Detailed legislation and consultation remain ahead.')
      ],
      significance: [
        both('拟议规则将要求在澳大利亚运营的前沿 AI 公司快速通报 AI 异常行为和网络事故，并接受独立模型评估。这两份公告尚未明确通报时限、事件门槛或生效日期，不能将这些计划视为已经生效的义务。', 'The proposed rules would require frontier AI companies operating in Australia to report AI misbehaviour and cyber incidents promptly and allow independent model evaluation. The two announcements do not specify reporting deadlines, incident thresholds, or a commencement date. These are proposed duties, not duties already in force.')
      ],
      evidence: [
        both('本页依据政府公告整理，不判断 OpenAI 的法律责任。', 'This brief uses the government announcements and does not determine OpenAI’s legal liability.'),
        both('本站未取得完整调查报告，也未独立检查涉事系统的日志。', 'This site has not obtained the full investigation report or independently examined the affected systems’ logs.')
      ],
      sources: [
        { label: both('原报道 · The Guardian', 'Original report · The Guardian'), url: guardianUrl },
        { label: both('澳大利亚总理办公室 · 接受审查建议', 'Australian Prime Minister · Acceptance of review recommendations'), url: 'https://www.pm.gov.au/media/strengthening-australia-against-ai-driven-cyber-incidents' },
        { label: both('澳大利亚政府 · 拟议 AI 安全措施', 'Australian government · Proposed AI safety measures'), url: 'https://www.minister.industry.gov.au/t-ayres/media/new-australian-ai-safety-and-security-protections' }
      ]
    },
    'web-804a43c3361e': {
      version: 1,
      recordUrl: claudeUrl,
      review: { status: 'reviewed', date: '2026-11-10', sourcesChecked: true, proseChecked: true },
      lead: both('Apiiro 报告称，Claude Code 可将用户批准的完整命令保存到项目配置文件。如果命令包含凭据，而文件被提交到公开仓库，凭据也会随之公开。', 'Apiiro reports that Claude Code can save an approved command in a project settings file. If the command contains credentials and the file enters a public repository, those credentials become public.'),
      sourceFacts: [
        both('The Hacker News 转述 Apiiro 的扫描结果：研究人员在公开 GitHub 数据中发现约 104,185 份相关配置文件，分布于约 103,617 个仓库。', 'The Hacker News reports Apiiro’s scan of roughly 104,185 related configuration files in about 103,617 public GitHub repositories.'),
        both('报告称，1,122 份文件包含敏感信息，共有 1,379 个不同的秘密值，包括数据库凭据、远程登录信息、开发平台令牌和云访问密钥。这些数字不能说明有多少凭据仍然有效。', 'The report identifies 1,122 files containing 1,379 distinct secrets, including database credentials, remote logins, developer-platform tokens, and cloud keys. These counts do not establish how many credentials remain valid.'),
        both('用户选择“以后不再询问”时，获准的完整命令可能被写入 `.claude/settings.local.json`。命令中的密码或令牌也会被保存。', 'Choosing “do not ask again” can save the exact approved command in `.claude/settings.local.json`, including a password or token in that command.')
      ],
      significance: [
        both('删除当前文件后，Git 历史、分支、分叉仓库或缓存仍可能保留凭据。因此，删除文件不能代替凭据轮换。', 'Git history, branches, forks, or caches may retain credentials after the current file is deleted. Deletion does not replace credential rotation.'),
        both('本地配置文件也可能被 Git 跟踪。检查泄露时，需要查看已经保存的文件和提交历史。', 'Git can track a local settings file. An exposure check needs to cover saved files and commit history.')
      ],
      evidence: [
        both('数字来自 Apiiro 的研究，并由 The Hacker News 转述。本站没有独立复现这次 GitHub 扫描。', 'The figures come from Apiiro’s research, reported by The Hacker News. This site has not independently reproduced the GitHub scan.'),
        both('公开文件数量不能说明有多少凭据仍然有效；部分凭据可能已失效、已轮换或仅用于测试。', 'Public file counts do not establish how many credentials remain valid. Some may be expired, rotated, or test-only.'),
        both('具体影响还需结合仓库历史、秘密扫描结果和相关服务的访问日志确认。', 'The impact on a particular system requires repository history, secret-scanning results, and service access logs.')
      ],
      actions: [
        both('将 `.claude/settings.local.json` 和其他智能体本地状态文件加入组织的忽略模板，并检查是否已被 Git 跟踪。', 'Add `.claude/settings.local.json` and other agent-local state files to organization ignore templates, and check whether Git already tracks them.'),
        both('检查当前文件、Git 历史、分支和分叉中的凭据。发现公开凭据后应及时轮换。', 'Check current files, Git history, branches, and forks for credentials. Rotate credentials found in public copies.'),
        both('避免把长期凭据直接写入命令，改用秘密管理器、短期令牌或变量引用。', 'Keep long-lived credentials out of commands. Use secret managers, short-lived tokens, or variable references.'),
        both('在提交前和 CI 中进行秘密扫描，并检查扫描规则能否识别智能体配置中的密码。', 'Run secret scanning before commits and in CI, and check that it detects passwords in agent configuration files.')
      ],
      watch: [
        both('确认 Anthropic 后续发布的忽略规则、确认界面和配置格式修改。', 'Check subsequent Anthropic changes to ignore rules, approval prompts, and configuration formats.'),
        both('关注秘密扫描工具是否增加对编码智能体文件的检测，以及复测是否发现仍然有效的公开凭据。', 'Check whether scanners improve detection of coding-agent files and whether follow-up scans find exposed credentials that remain valid.'),
        both('其他编码智能体是否保存完整命令，需要分别核查。', 'Whether other coding agents save complete commands requires separate checks.')
      ],
      sources: [
        { label: both('The Hacker News · 报道', 'The Hacker News · Report'), url: claudeUrl },
        { label: both('Apiiro · 原始研究', 'Apiiro · Original research'), url: 'https://apiiro.com/blog/coding-agents-leaking-secrets-github-dont-ask-again' }
      ]
    }
  };

  const bilingual = value => Array.isArray(value) && value.length === 2 && value.every(text => typeof text === 'string' && text.trim());
  const https = value => { try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; } };
  function isReviewed(brief, record) {
    if (!brief || brief.version !== 1 || brief.recordUrl !== record.url || !https(brief.recordUrl)) return false;
    const review = brief.review;
    if (!review || review.status !== 'reviewed' || !/^\d{4}-\d{2}-\d{2}$/.test(review.date) || review.sourcesChecked !== true || review.proseChecked !== true) return false;
    if (!bilingual(brief.lead) || (brief.title && !bilingual(brief.title))) return false;
    if (!brief.sourceFacts?.length || !brief.evidence?.length || !Array.isArray(brief.sources) || !brief.sources.length) return false;
    for (const key of ['sourceFacts', 'significance', 'evidence', 'actions', 'watch', 'questions']) {
      if (brief[key] !== undefined && (!Array.isArray(brief[key]) || !brief[key].every(bilingual))) return false;
    }
    if (brief.mechanisms !== undefined && (!Array.isArray(brief.mechanisms) || !brief.mechanisms.every(item => item && bilingual(item.title) && bilingual(item.text)))) return false;
    return brief.sources.every(source => source && bilingual(source.label) && https(source.url)) && brief.sources.some(source => source.url === record.url);
  }

  function build(record, options = {}) {
    const english = options.english === true;
    const summary = options.desc ? options.desc(record) || '' : record.description || '';
    const entry = REVIEWED[record.id];
    const reviewed = isReviewed(entry, record);
    const provenance = english
      ? `${record.source} · Record date ${record.date}. Classification uses the title and summary.`
      : `${record.source} · 记录日期 ${record.date}。分类依据标题和摘要。`;
    const status = reviewed
      ? pick(both('已核对来源并编辑', 'Sources checked and text edited'), english)
      : pick(both('尚未阅读全文核对', 'Full text not yet reviewed'), english);
    const result = {
      reviewed, status, reviewedOn: reviewed ? entry.review.date : '', provenance,
      title: reviewed && entry.title ? pick(entry.title, english) : '',
      lead: reviewed ? pick(entry.lead, english) : summary,
      sourceSummary: reviewed ? '' : summary,
      sourceFacts: [], significance: [], mechanisms: [], evidence: [], actions: [], watch: [], questions: [], sources: []
    };
    if (!reviewed) return result;
    for (const key of ['sourceFacts', 'significance', 'evidence', 'actions', 'watch', 'questions']) result[key] = list(entry[key], english);
    result.mechanisms = (entry.mechanisms || []).map(item => ({ title: pick(item.title, english), text: pick(item.text, english) }));
    result.sources = entry.sources.map(source => ({ label: pick(source.label, english), url: source.url }));
    return result;
  }

  window.SignalBrief = { build, isReviewed };
})();
