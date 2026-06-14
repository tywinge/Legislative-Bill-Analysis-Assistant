// ── Configuration ──
// Replace this with your Anthropic API key.
// IMPORTANT: Never commit your real API key to GitHub.
// Copy .env.example to .env and add your key there,
// or enter it in the prompt below when you first load the app.
const CONFIG = {
  apiKey: localStorage.getItem('anthropic_api_key') || '',
  model: 'claude-sonnet-4-6',
};

// ── State ──
let allBills = [...SAMPLE_BILLS];
let selectedBill = null;
let generated = { summary: '', brief: '', memo: '', vote: '' };

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  if (!CONFIG.apiKey) {
    const key = prompt(
      'Enter your Anthropic API key to enable AI analysis.\n\n' +
      'Get one at: https://console.anthropic.com\n\n' +
      'Your key is stored only in your browser (localStorage) and never sent anywhere except directly to Anthropic.'
    );
    if (key && key.trim()) {
      CONFIG.apiKey = key.trim();
      localStorage.setItem('anthropic_api_key', CONFIG.apiKey);
    }
  }
  renderBills();
  setupSidebar();
});

// ── Sidebar mobile toggle ──
function setupSidebar() {
  document.getElementById('menu-btn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
  document.getElementById('sidebar-close').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
  });
}

// ── Bill rendering ──
function renderBills() {
  const q = (document.getElementById('search-input')?.value || '').toLowerCase();
  const topic = document.getElementById('topic-filter')?.value || '';

  const filtered = allBills.filter(b => {
    const matchQ = !q || b.title.toLowerCase().includes(q) || b.id.toLowerCase().includes(q);
    const matchT = !topic || b.topic === topic;
    return matchQ && matchT;
  });

  const list = document.getElementById('bill-list');
  if (!filtered.length) {
    list.innerHTML = '<div class="bill-list-empty">No bills match your search.</div>';
    return;
  }

  list.innerHTML = filtered.map(b => `
    <div class="bill-card${selectedBill && selectedBill.id === b.id ? ' selected' : ''}"
         role="listitem"
         tabindex="0"
         onclick="selectBill('${b.id}')"
         onkeydown="if(event.key==='Enter') selectBill('${b.id}')">
      <div class="bill-card-top">
        <span class="bill-id-badge">${b.id}</span>
        <span class="topic-badge topic-${b.topic}">${topicLabel(b.topic)}</span>
      </div>
      <div class="bill-card-title">${b.title}</div>
      <div class="bill-card-meta">
        <span>${b.sponsor}</span>
        <span>${b.status}</span>
      </div>
    </div>
  `).join('');
}

function topicLabel(t) {
  return { ai: 'AI', tech: 'Tech', commerce: 'Commerce', telecom: 'Telecom' }[t] || t;
}

function filterBills() { renderBills(); }

// ── Select bill ──
function selectBill(id) {
  selectedBill = allBills.find(b => b.id === id);
  if (!selectedBill) return;

  // Reset generated content
  generated = { summary: '', brief: '', memo: '', vote: '' };

  // Update topbar
  document.getElementById('topbar-title').textContent = `${selectedBill.id} · ${selectedBill.title}`;
  document.getElementById('topbar-title').style.color = 'var(--color-text)';

  // Update congress link
  const link = document.getElementById('congress-link');
  if (selectedBill.url) { link.href = selectedBill.url; link.style.display = 'flex'; }
  else { link.style.display = 'none'; }

  // Update hero
  document.getElementById('hero-id').textContent = selectedBill.id;
  document.getElementById('hero-title').textContent = selectedBill.title;
  document.getElementById('hero-meta').innerHTML = `
    <span><strong>Sponsor:</strong> ${selectedBill.sponsor}</span>
    <span><strong>Status:</strong> ${selectedBill.status}</span>
    <span><strong>Topic:</strong> ${topicLabel(selectedBill.topic)}</span>
  `;

  // Show/hide panels
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('analysis-area').style.display = 'flex';

  // Clear old content
  ['summary','brief','memo'].forEach(t => {
    document.getElementById(t + '-content').textContent = '';
  });
  document.getElementById('vote-rationale').textContent = '';
  document.getElementById('vote-output').style.display = 'none';
  document.getElementById('summary-actions').style.display = 'none';

  // Switch to summary tab and generate
  switchTab('summary', document.querySelector('.tab'));
  generateContent('summary');

  // Close sidebar on mobile
  document.getElementById('sidebar').classList.remove('open');

  renderBills();
}

// ── Tab switching ──
function switchTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

  if (btn) { btn.classList.add('active'); btn.setAttribute('aria-selected', 'true'); }
  const pane = document.getElementById('tab-' + name);
  if (pane) pane.classList.add('active');
}

// ── AI content generation ──
async function generateContent(type) {
  if (!selectedBill) return;
  if (!CONFIG.apiKey) {
    alert('No API key set. Reload the page to enter your Anthropic API key.');
    return;
  }

  // If already generated, just show it
  if (generated[type]) {
    displayContent(type, generated[type]);
    return;
  }

  showLoading(type, true);

  const prompt = buildPrompt(type, selectedBill);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CONFIG.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: CONFIG.model,
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `API error ${res.status}`);
    }

    const data = await res.json();
    const text = data.content?.map(c => c.text || '').join('') || '';
    generated[type] = text;
    showLoading(type, false);
    displayContent(type, text);

  } catch (err) {
    showLoading(type, false);
    const box = type !== 'vote'
      ? document.getElementById(type + '-content')
      : document.getElementById('vote-rationale');
    if (box) box.textContent = `Error: ${err.message}`;
    if (type === 'vote') document.getElementById('vote-output').style.display = 'block';
  }
}

function buildPrompt(type, bill) {
  const context = `Bill: ${bill.id} — ${bill.title}
Sponsor: ${bill.sponsor}
Status: ${bill.status}
Topic area: ${topicLabel(bill.topic)}
Summary: ${bill.summary}`;

  const prompts = {
    summary: `You are a Senate legislative analyst for the Commerce, Science, and Transportation Committee specializing in technology, commerce, and AI policy.

${context}

Write a 3–4 paragraph analytical summary for a Senate intern briefing. Cover:
1. Core provisions and mechanism of the bill
2. Key policy implications for commerce, technology, or AI
3. Stakeholder landscape — who supports and opposes it and why
4. Likely path forward in committee or on the floor

Be direct, analytical, and professional. Plain text only, no markdown formatting.`,

    brief: `You are a Senate policy analyst for the Commerce, Science, and Transportation Committee.

${context}

Write a one-page policy brief for a Senator's review. Use this exact format with ALL-CAPS section headers followed by a colon and a line break:

OVERVIEW:
[2–3 sentences on what the bill does]

KEY PROVISIONS:
[3–4 bullet points starting with a dash]

POLICY IMPLICATIONS:
[2–3 paragraphs on effects on industry, consumers, federal agencies]

STAKEHOLDER POSITIONS:
[Who supports and who opposes, with brief reasons]

CONSIDERATIONS FOR THE SENATOR:
[Specific angles, constituent impact, political context, suggested posture]

Keep it tight, professional, and actionable. Plain text only.`,

    memo: `You are a Senate legislative aide for the Commerce, Science, and Transportation Committee.

${context}

Draft a formal internal Senate memo using this exact header format:

MEMORANDUM

TO: The Senator
FROM: Legislative Affairs, Commerce & Technology Portfolio
RE: ${bill.id} — ${bill.title}
DATE: June 2025

Then include these sections with bold-style headers using ALL CAPS:

PURPOSE:
[One sentence]

BACKGROUND:
[Context on the issue and how this bill fits in]

KEY ISSUES:
[2–3 issues the Senator should be aware of]

STAFF RECOMMENDATION:
[Clear recommendation on how to engage with the bill]

SUGGESTED TALKING POINTS:
[3 concise talking points for press or constituent conversations]

Professional, direct, and action-oriented. Plain text only.`,

    vote: `You are a nonpartisan Senate policy analyst.

${context}

Provide a structured vote recommendation. Respond ONLY with valid JSON — no markdown, no explanation, no backticks:

{
  "recommendation": "AYE" or "NAY" or "ABSTAIN",
  "aye_case": "One sentence — the strongest argument for voting aye",
  "nay_case": "One sentence — the strongest argument for voting nay",
  "abstain_case": "One sentence — when abstention would be appropriate",
  "rationale": "2–3 paragraph rationale explaining the recommendation. Cover policy merits, political context, and constituent impact. Plain text."
}`,
  };

  return prompts[type];
}

function displayContent(type, text) {
  if (type === 'vote') {
    try {
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      document.getElementById('vc-aye-case').textContent = parsed.aye_case || '';
      document.getElementById('vc-nay-case').textContent = parsed.nay_case || '';
      document.getElementById('vc-abstain-case').textContent = parsed.abstain_case || '';
      document.getElementById('vote-rationale').textContent = parsed.rationale || '';

      const rec = (parsed.recommendation || '').toLowerCase();
      ['aye', 'nay', 'abstain'].forEach(v => {
        const card = document.getElementById('vc-' + v);
        if (rec && v !== rec) card.classList.add('dimmed');
        else card.classList.remove('dimmed');
      });

      document.getElementById('vote-output').style.display = 'block';
    } catch (e) {
      document.getElementById('vote-rationale').textContent = text;
      document.getElementById('vote-output').style.display = 'block';
    }
  } else {
    const box = document.getElementById(type + '-content');
    if (box) box.textContent = text;
    if (type === 'summary') {
      document.getElementById('summary-actions').style.display = 'flex';
    }
  }
}

function showLoading(type, show) {
  const el = document.getElementById('loading-' + type);
  if (el) el.classList.toggle('active', show);
}

// ── Regenerate ──
function regenerate(type) {
  generated[type] = '';
  if (type !== 'vote') document.getElementById(type + '-content').textContent = '';
  else { document.getElementById('vote-output').style.display = 'none'; document.getElementById('vote-rationale').textContent = ''; }
  generateContent(type);
}

// ── Copy to clipboard ──
function copyPane(id) {
  const el = document.getElementById(id);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(() => {
    // Visual feedback via button text
    const btn = document.activeElement;
    if (btn && btn.classList.contains('tool-btn')) {
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="ti ti-check"></i> Copied!';
      setTimeout(() => btn.innerHTML = orig, 1800);
    }
  }).catch(() => alert('Could not copy. Try selecting the text manually.'));
}

// ── Export as .txt ──
function exportTxt(type) {
  const text = generated[type];
  if (!text) { alert('Generate the content first before exporting.'); return; }
  const bill = selectedBill;
  const filename = `${bill.id.replace('.', '')}_${type}_${new Date().toISOString().slice(0,10)}.txt`;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Fetch bill from Congress.gov via AI web search ──
async function fetchFromCongress() {
  const url = document.getElementById('congress-url').value.trim();
  const status = document.getElementById('fetch-status');

  if (!url || !url.includes('congress.gov')) {
    status.textContent = 'Please enter a valid congress.gov URL.';
    status.className = 'fetch-status error';
    return;
  }
  if (!CONFIG.apiKey) {
    alert('No API key set. Reload the page to enter your Anthropic API key.');
    return;
  }

  status.textContent = 'Fetching bill...';
  status.className = 'fetch-status';
  document.getElementById('fetch-btn').disabled = true;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CONFIG.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: CONFIG.model,
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{
          role: 'user',
          content: `Look up this Congress.gov bill and extract its key information: ${url}

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "id": "e.g. S.1234 or H.R.5678",
  "title": "Full bill title",
  "sponsor": "e.g. Sen. Smith (D-NY)",
  "status": "e.g. In committee / Floor vote / Passed Senate",
  "topic": "one of: ai, tech, commerce, telecom",
  "date": "e.g. Apr 2025",
  "summary": "2-3 sentence plain-text summary of what the bill does",
  "url": "${url}"
}`
        }],
      }),
    });

    const data = await res.json();
    const textBlocks = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('');

    const clean = textBlocks.replace(/```json|```/g, '').trim();
    const bill = JSON.parse(clean);
    bill.url = url;

    // Add to top of list if not already present
    if (!allBills.find(b => b.id === bill.id)) allBills.unshift(bill);

    document.getElementById('congress-url').value = '';
    status.textContent = `✓ Added: ${bill.id}`;
    status.className = 'fetch-status success';
    renderBills();
    selectBill(bill.id);

  } catch (err) {
    status.textContent = `Could not fetch bill: ${err.message}`;
    status.className = 'fetch-status error';
  } finally {
    document.getElementById('fetch-btn').disabled = false;
  }
}
