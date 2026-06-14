// ── Sample bills for Commerce, Technology & AI portfolio ──
// Add your own bills here or fetch them live from Congress.gov using the URL bar.
// Format: { id, title, sponsor, status, topic, date, summary, url }

const SAMPLE_BILLS = [
  {
    id: "S.2290",
    title: "AI Transparency in Government Act",
    sponsor: "Sen. Wyden (D-OR)",
    status: "In committee",
    topic: "ai",
    date: "Mar 2025",
    summary: "Requires federal agencies to disclose when AI systems are used in government decisions affecting citizens, mandates impact assessments, and creates an AI accountability office within OMB.",
    url: "https://www.congress.gov/bill/119th-congress/senate-bill/2290"
  },
  {
    id: "S.3102",
    title: "Algorithmic Accountability Act",
    sponsor: "Sen. Cantwell (D-WA)",
    status: "Markup",
    topic: "ai",
    date: "Apr 2025",
    summary: "Requires companies deploying high-impact automated decision systems to conduct impact assessments covering accuracy, fairness, bias, privacy, and security, with results reported to the FTC.",
    url: "https://www.congress.gov/bill/119th-congress/senate-bill/3102"
  },
  {
    id: "S.1847",
    title: "Open App Markets Act",
    sponsor: "Sen. Blumenthal (D-CT)",
    status: "Floor vote",
    topic: "tech",
    date: "Feb 2025",
    summary: "Prohibits large app store operators from requiring use of their own payment systems, mandating app pre-installation, or retaliating against developers who offer lower prices elsewhere.",
    url: "https://www.congress.gov/bill/119th-congress/senate-bill/1847"
  },
  {
    id: "S.3756",
    title: "Kids Online Safety Act",
    sponsor: "Sen. Blumenthal (D-CT)",
    status: "Floor vote",
    topic: "tech",
    date: "Apr 2025",
    summary: "Imposes a duty of care on platforms used by minors, requires default privacy settings, mandates tools for minors to limit addictive features, and grants the FTC enforcement authority.",
    url: "https://www.congress.gov/bill/119th-congress/senate-bill/3756"
  },
  {
    id: "S.980",
    title: "American Broadband Deployment Act",
    sponsor: "Sen. Wicker (R-MS)",
    status: "Passed committee",
    topic: "telecom",
    date: "Jan 2025",
    summary: "Streamlines federal permitting for broadband infrastructure on federal lands, preempts certain state regulations, and provides spectrum auction authority to NTIA.",
    url: "https://www.congress.gov/bill/119th-congress/senate-bill/980"
  },
  {
    id: "S.4210",
    title: "CHIPS Implementation Oversight Act",
    sponsor: "Sen. Warner (D-VA)",
    status: "Introduced",
    topic: "commerce",
    date: "May 2025",
    summary: "Establishes an inspector general for CHIPS Act funding, requires quarterly audits of semiconductor manufacturing grants, and mandates clawback provisions for non-compliant recipients.",
    url: "https://www.congress.gov/bill/119th-congress/senate-bill/4210"
  },
  {
    id: "S.5001",
    title: "National AI Research Resource Act",
    sponsor: "Sen. Schumer (D-NY)",
    status: "In committee",
    topic: "ai",
    date: "Jun 2025",
    summary: "Establishes a National AI Research Resource providing academic researchers and small businesses with access to compute, curated datasets, and software tools to democratize AI development.",
    url: "https://www.congress.gov/bill/119th-congress/senate-bill/5001"
  },
  {
    id: "S.2788",
    title: "American Data Privacy and Protection Act",
    sponsor: "Sen. Cantwell (D-WA)",
    status: "Markup",
    topic: "tech",
    date: "Mar 2025",
    summary: "Establishes a national consumer data privacy framework, including data minimization requirements, consumer rights to access and delete data, and civil rights protections against discriminatory data use.",
    url: "https://www.congress.gov/bill/119th-congress/senate-bill/2788"
  }
];
