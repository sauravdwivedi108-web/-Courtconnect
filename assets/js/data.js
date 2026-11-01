/* ============================================================
   CourtConnect — Site data (JSON)
   All official links verified Nov 2026. External links open in
   a new tab; each entry notes the official source.
   ============================================================ */
"use strict";

/* ---------- Delhi District Courts (11 districts) ---------- */
const DISTRICTS = [
  { name: "Central",     complex: "Tis Hazari",  url: "https://centraldelhi.dcourts.gov.in" },
  { name: "West",        complex: "Tis Hazari",  url: "https://westdelhi.dcourts.gov.in" },
  { name: "East",        complex: "Karkardooma", url: "https://eastdelhi.dcourts.gov.in" },
  { name: "North-East",  complex: "Karkardooma", url: "https://northeastdelhi.dcourts.gov.in" },
  { name: "Shahdara",   complex: "Karkardooma", url: "https://shahdara.dcourts.gov.in" },
  { name: "New Delhi",   complex: "Patiala House", url: "https://newdelhi.dcourts.gov.in" },
  { name: "North",       complex: "Rohini",      url: "https://northdelhi.dcourts.gov.in" },
  { name: "North-West",  complex: "Rohini",      url: "https://rohini.dcourts.gov.in" },
  { name: "South",       complex: "Saket",       url: "https://southdelhi.dcourts.gov.in" },
  { name: "South-East",  complex: "Saket",       url: "https://southeastdelhi.dcourts.gov.in" },
  { name: "South-West",  complex: "Dwarka",      url: "https://southwestdelhi.dcourts.gov.in" }
];

/* Per-service deep paths inside each district website (official template) */
const DISTRICT_PATHS = {
  judges: "/list-of-judges",
  onLeave: "/judges-on-leave/",
  duty: "/duty-magistrate",
  bail: "/duty-magistrate" /* bail rosters are published under duty/roster notices */
};

/* ---------- District court services (Lawyers 4 Lawyers) ---------- */
const DISTRICT_SERVICES = [
  {
    icon: "⚖️", title: "Case Status",
    desc: "Track any case in Delhi's district courts by CNR, case number, FIR, party or advocate name on the national eCourts portal.",
    primary: { label: "Open eCourts Case Status", url: "https://services.ecourts.gov.in/ecourtindia_v6/?p=casestatus%2Findex" },
    district: true, districtPath: null, districtHint: "Or open your district court's own case-status search."
  },
  {
    icon: "🧑‍⚖️", title: "Judges List",
    desc: "Current list of judicial officers in every Delhi district — Principal District & Sessions Judge, District Judges, ASJs, CJMs/ACJMs and JMFCs with room numbers.",
    primary: null, district: true, districtPath: DISTRICT_PATHS.judges,
    districtHint: "Choose a district to open its official List of Judges."
  },
  {
    icon: "📋", title: "Causelist",
    desc: "Day-wise cause lists of the Delhi district courts. Use the national eCourts gateway or your district's own cause-list page.",
    primary: { label: "Open eCourts Gateway", url: "https://services.ecourts.gov.in/ecourtindia_v6/" },
    district: true, districtPath: null, districtHint: "Your district court also lists its daily cause list."
  },
  {
    icon: "🌴", title: "Judges on Leave",
    desc: "Which judicial officers are on leave, from when to when, and the nature of leave — updated by each district court.",
    primary: null, district: true, districtPath: DISTRICT_PATHS.onLeave,
    districtHint: "Choose a district to open its official 'Judges on Leave' page."
  },
  {
    icon: "🔒", title: "Bail Roster",
    desc: "Bail duty rosters and bail-matter cause lists notified by district courts (often issued with the monthly duty rosters).",
    primary: null, district: true, districtPath: DISTRICT_PATHS.bail,
    districtHint: "Rosters are published under each district's Duty/Roster section."
  },
  {
    icon: "🕘", title: "Duty Magistrate Roster",
    desc: "Monthly duty rosters of Judicial Magistrates First Class — including regular, evening, weekend traffic and jail duty rosters.",
    primary: null, district: true, districtPath: DISTRICT_PATHS.duty,
    districtHint: "Choose a district to open its official Duty Magistrate page."
  }
];

/* ---------- High Court of Delhi services (redirects to DHC pages) ---------- */
const HC_SERVICES = [
  { icon: "📤", title: "E-Filing Portal", desc: "File new cases, applications, replies and caveats online in the Delhi High Court.", url: "https://dhcefiling.nic.in/eFiling/", note: "Official: DHC e-Filing Management System" },
  { icon: "🎫", title: "E-Gate Pass", desc: "Register online for a visitor gate pass to enter the Delhi High Court premises.", url: "https://www.evisitordhc.gov.in/evisitordhcweb/", note: "Official: e-Visitor Pass, DHC" },
  { icon: "📜", title: "Orders", desc: "Search daily orders and orders in a case by case number / type / year.", url: "https://delhihighcourt.nic.in/app/case-number", note: "Official: DHC — Orders by Case Number" },
  { icon: "🔎", title: "Judgment Search", desc: "Search Delhi High Court judgments by date-wise listing or by case number.", url: "https://delhihighcourt.nic.in/app/judgement-dates-wise", note: "Official: DHC — Judgments (Date-wise)" },
  { icon: "📆", title: "Daily Cause List", desc: "Online and PDF cause lists of all benches sitting in the Delhi High Court.", url: "http://delhihighcourt.nic.in/web/cause-lists", note: "Official: DHC Cause Lists" },
  { icon: "🖥️", title: "Physical Display Board", desc: "Live display board of court-hall proceedings, item numbers and VC links (auto-refresh).", url: "https://delhihighcourt.nic.in/app/physical-display-board", note: "Official: DHC Physical Display Board" },
  { icon: "🗓️", title: "Judges' Roster", desc: "Current roster of sitting of the Hon'ble Judges of the Delhi High Court, with archive.", url: "https://www.delhihighcourt.nic.in/web/judges/current?page=0", note: "Official: DHC Judges' Roster" },
  { icon: "🔗", title: "Court Links", desc: "Official DHC links — e-Inspection, e-True Copy, e-DHCR, e-RTI, Gazette, eSCR and more.", url: "https://delhihighcourt.nic.in/web/links", note: "Official: DHC Important Links" }
];

/* ---------- Supreme Court of India services ---------- */
const SC_SERVICES = [
  { icon: "🏛️", title: "Court List / Daily Orders", desc: "Daily orders of the Supreme Court — court-wise, diary-no-wise and case-no-wise.", url: "https://www.sci.gov.in/daily-orders/", note: "Official: Supreme Court of India" },
  { icon: "🖥️", title: "Physical Display Board", desc: "Live display boards of the Supreme Court courtrooms.", url: "https://www.sci.gov.in/display-boards/", note: "Official: SCI Display Boards" },
  { icon: "🎫", title: "E-Gate Pass", desc: "SuSwagatam — apply online for e-passes to enter the Supreme Court complex.", url: "https://suswagatam.sci.gov.in/", note: "Official: SuSwagatam (SCI)" },
  { icon: "🧮", title: "Court Fees Calculator", desc: "Calculate court fees payable in Supreme Court matters.", url: "https://www.sci.gov.in/court-fees-calculator/", note: "Official: SCI Court Fees Calculator" },
  { icon: "📢", title: "Notices & Circulars", desc: "Latest notices, circulars, listing notices and practice directions of the Registry.", url: "https://www.sci.gov.in/notices-and-circulars/", note: "Official: SCI Notices & Circulars" },
  { icon: "📚", title: "Judgments & Orders", desc: "Verdict Finder — free-text search of Supreme Court judgments & orders (eSCR also available).", url: "https://verdictfinder.sci.gov.in/elk_frontend/index.php", note: "Official: Verdict Finder (SCI)" },
  { icon: "📆", title: "Cause List", desc: "Cause lists at a glance — miscellaneous, regular, chamber and weekly lists.", url: "https://www.sci.gov.in/cause-list/", note: "Official: SCI Cause List" },
  { icon: "⚖️", title: "Case Status", desc: "Check case status by case number, diary number, party name, AOR code or caveat.", url: "https://www.sci.gov.in/case-status-case-no/", note: "Official: SCI Case Status" }
];

/* ---------- Education: Bare Acts library ---------- */
const BARE_ACTS = [
  { group: "Constitutional & Statute", acts: [
    { t: "The Constitution of India", s: "Fundamental Rights, Directive Principles, Writs, Art. 12–35, 226, 32" },
    { t: "The Indian Penal Code, 1860 (→ BNS 2023)", s: "General principles; offences against body, property, state, public order" },
    { t: "The Bharatiya Nyaya Sanhita, 2023", s: "New criminal code replacing IPC (w.e.f. 1 July 2024)" },
    { t: "The Code of Criminal Procedure, 1973 (→ BNSS 2023)", s: "Arrest, bail, trial procedure, appeals, revisions" },
    { t: "The Bharatiya Nagarik Suraksha Sanhita, 2023", s: "New criminal procedure code replacing CrPC" },
    { t: "The Indian Evidence Act, 1872 (→ BSA 2023)", s: "Relevancy, admissibility, presumptions, burden of proof" },
    { t: "The Bharatiya Sakshya Adhiniyam, 2023", s: "New evidence law replacing the Evidence Act" },
    { t: "The Code of Civil Procedure, 1908", s: "Suits, pleadings, summons, injunctions, execution, appeals" },
    { t: "The Limitation Act, 1963", s: "Periods of limitation for suits, appeals and applications" },
    { t: "The General Clauses Act, 1897", s: "Interpretation of statutes, definitions" },
    { t: "The Interpretation of Statutes (principles)", s: "Golden rule, mischief rule, literal rule, ejusdem generis" }
  ]},
  { group: "Commercial & Property", acts: [
    { t: "The Indian Contract Act, 1872", s: "Offer, acceptance, consideration, void contracts, remedies" },
    { t: "The Sale of Goods Act, 1930", s: "Sale, conditions & warranties, transfer of title" },
    { t: "The Negotiable Instruments Act, 1881", s: "Cheques, promissory notes, bills of exchange; S.138 dishonour" },
    { t: "The Companies Act, 2013", s: "Incorporation, management, winding up, NCLT" },
    { t: "The Partnership Act, 1932", s: "Partnership, rights & liabilities, dissolution" },
    { t: "The Transfer of Property Act, 1882", s: "Sale, mortgage, lease, gift, exchange" },
    { t: "The Indian Easements Act, 1882", s: "Easements, licences, remedies" },
    { t: "The Specific Relief Act, 1963", s: "Specific performance, injunctions, declaratory relief" },
    { t: "The Registration Act, 1908", s: "Compulsory registration, effects of non-registration" },
    { t: "The Stamp Act, 1899", s: "Stamp duty, instruments chargeable, impounding" },
    { t: "The Arbitration & Conciliation Act, 1996", s: "Arbitration agreement, tribunal, award, challenge, enforcement" },
    { t: "The Insolvency & Bankruptcy Code, 2016", s: "CIRP, liquidation, individual insolvency" }
  ]},
  { group: "Criminal & Evidence", acts: [
    { t: "The Bharatiya Nyaya Sanhita, 2023", s: "See Constitutional group — core criminal code" },
    { t: "The Bharatiya Nagarik Suraksha Sanhita, 2023", s: "Procedural code — arrest, bail, investigation, trial" },
    { t: "The Bharatiya Sakshya Adhiniyam, 2023", s: "Law of evidence" },
    { t: "The Prevention of Corruption Act, 1988", s: "Offences by public servants, sanction, probe" },
    { t: "The NDPS Act, 1985", s: "Narcotic drugs, bail restrictions, offences" },
    { t: "The Arms Act, 1959", s: "Licensing, possession, offences" },
    { t: "The Unlawful Activities (Prevention) Act, 1967", s: "Terrorism offences, bail restrictions" },
    { t: "The SC/ST (Prevention of Atrocities) Act, 1989", s: "Atrocities offences, special courts" },
    { t: "The Dowry Prohibition Act, 1961", s: "Dowry demand & giving offences" },
    { t: "The Protection of Children from Sexual Offences Act, 2012", s: "POCSO — offences against children, special procedures" },
    { t: "The Juvenile Justice (Care & Protection) Act, 2015", s: "Juvenile offenders, JJB, adoption" },
    { t: "The Motor Vehicles Act, 1988", s: "Road offences, MACT claims, insurance" }
  ]},
  { group: "Family & Labour", acts: [
    { t: "The Hindu Marriage Act, 1955", s: "Marriage, restitution, judicial separation, divorce (S.13)" },
    { t: "The Hindu Succession Act, 1956", s: "Intestate succession, coparcenary, amendments" },
    { t: "The Hindu Minority & Guardianship Act, 1956", s: "Guardianship, custody of minors" },
    { t: "The Indian Divorce Act, 1869", s: "Christian marriages — divorce, judicial separation" },
    { t: "The Parsi Marriage & Divorce Act, 1936", s: "Parsi matrimonial law" },
    { t: "The Special Marriage Act, 1954", s: "Civil marriages across communities" },
    { t: "The Muslim Personal Law (Shariat) Application Act, 1937", s: "Application of Shariat to Muslims in India" },
    { t: "The Guardians & Wards Act, 1890", s: "Guardianship of minors across personal laws" },
    { t: "The Family Courts Act, 1984", s: "Family court jurisdiction & procedure" },
    { t: "The Industrial Disputes Act, 1947", s: "Retrenchment, lay-off, closure, adjudication" },
    { t: "The Factories Act, 1948", s: "Working hours, safety, welfare of workers" },
    { t: "The Minimum Wages Act, 1948", s: "Minimum wage fixation & enforcement" },
    { t: "The Payment of Wages Act, 1936", s: "Timely payment of wages, deductions" },
    { t: "The Workmen's Compensation Act, 1923 (Employees' Compensation)", s: "Compensation for injury/death at work" },
    { t: "The Payment of Gratuity Act, 1972", s: "Gratuity eligibility & quantum" },
    { t: "The Employees' Provident Fund Act, 1952", s: "PF contributions, withdrawal, schemes" },
    { t: "The Maternity Benefit Act, 1961", s: "Maternity leave & benefits" },
    { t: "The Equal Remuneration Act, 1976", s: "Equal pay, anti-discrimination" }
  ]},
  { group: "Tax, Cyber & Environment", acts: [
    { t: "The Income-tax Act, 1961", s: "Heads of income, assessment, appeals, TDS" },
    { t: "The Goods & Services Tax Act, 2017", s: "Supply, levy, input credit, refunds, adjudication" },
    { t: "The Customs Act, 1962", s: "Import/export, duty, confiscation, appeals" },
    { t: "The Information Technology Act, 2000", s: "Cyber offences, electronic evidence, intermediaries" },
    { t: "The Environment (Protection) Act, 1986", s: "Environmental safeguards, NGT-related matters" },
    { t: "The Air (Prevention & Control of Pollution) Act, 1981", s: "Air pollution control, consent regimes" },
    { t: "The Water (Prevention & Control of Pollution) Act, 1974", s: "Water pollution control authorities" },
    { t: "The Wildlife (Protection) Act, 1972", s: "Protected species, offences, trade prohibitions" },
    { t: "The Consumer Protection Act, 2019", s: "Consumer rights, CCPA, district/state/national commissions" },
    { t: "The Right to Information Act, 2005", s: "Public authority records, timelines, exemptions" },
    { t: "The Prevention of Money Laundering Act, 2002", s: "PMLA — attachment, prosecution, bail rigour" },
    { t: "The Benami Transactions (Prohibition) Act, 1988", s: "Benami transactions, confiscation" },
    { t: "The Black Money Act, 2015", s: "Undisclosed foreign income & assets" }
  ]}
];

/* Official portals for bare-act texts */
const ACT_PORTS = [
  { label: "India Code (official central acts)", url: "https://www.indiacode.nic.in/" },
  { label: "Legislative Department, Govt. of India", url: "https://legislative.gov.in/" },
  { label: "The Gazette of India", url: "https://www.egazette.gov.in/" },
  { label: "Delhi District Courts — Bare Acts link", url: "https://delhidistrictcourts.nic.in/" }
];

/* ---------- Landmark judgments (Judicial Services) ---------- */
const LANDMARK_CASES = [
  { t: "Kesavananda Bharati v. State of Kerala (1973) 4 SCC 225", tag: "Constitution", hold: "Basic structure doctrine — Parliament cannot amend the basic features of the Constitution." },
  { t: "Maneka Gandhi v. Union of India (1978) 1 SCC 248", tag: "Constitution", hold: "Art. 21 (life & liberty) receives a wide interpretation; procedure must be fair, just and reasonable." },
  { t: "Golak Nath v. State of Punjab (1967) 2 SCR 762", tag: "Constitution", hold: "Amending power under Art. 368 cannot abridge fundamental rights (overruled on basic structure in 1973)." },
  { t: "Minerva Mills v. Union of India (1980) 3 SCC 625", tag: "Constitution", hold: "Arts. 14 & 19 are part of basic structure; limitation on amending power is itself a basic feature." },
  { t: "S.R. Bommai v. Union of India (1994) 3 SCC 1", tag: "Constitution", hold: "Secularism is a basic feature; President's rule under Art. 356 is judicially reviewable." },
  { t: "I.R. Coelho v. State of Tamil Nadu (2007) 2 SCC 1", tag: "Constitution", hold: "Acts placed in the Ninth Schedule after 24 April 1973 are amenable to judicial review against fundamental rights." },
  { t: "Justice K.S. Puttaswamy v. Union of India (2017) 10 SCC 1", tag: "Constitution", hold: "Right to privacy is a fundamental right flowing from Art. 21 and Part III." },
  { t: "Indian Young Lawyers Assn. v. State of Kerala (2018) (Sabarimala)", tag: "Constitution", hold: "Constitutional morality overrides practice; religious practices must not perpetuate discrimination (Art. 25/26)." },
  { t: "Naz Foundation v. Govt. of NCT (2009); Navtej Singh Johar v. UOI (2018) 10 SCC 1", tag: "Constitution", hold: "S. 377 IPC read down — consensual adult same-sex relations are not an offence." },
  { t: "Shayara Bano v. Union of India (2017) 9 SCC 1", tag: "Constitution", hold: "Triple talaq (instant talaq) set aside as manifestly arbitrary and violative of Art. 14." },
  { t: "Joseph Shine v. Union of India (2018) 2 SCC 1", tag: "Criminal / Constitution", hold: "S. 497 IPC (adultery) struck down as violative of Art. 14, 15 & 21." },
  { t: "Vishaka v. State of Rajasthan (1997) 6 SCC 241", tag: "Workplace", hold: "Guidelines on sexual harassment at workplace — binding till legislation (POSH Act, 2013)." },
  { t: "D.K. Basu v. State of W.B. (1997) 1 SCC 416", tag: "Criminal", hold: "Guidelines on arrest, custody and protection against custodial violence; compensation remedies." },
  { t: "Lalita Kumari v. Govt. of U.P. (2014) 2 SCC 1", tag: "Criminal", hold: "Registration of FIR is mandatory when information discloses a cognizable offence (S. 154 CrPC/173 BNSS)." },
  { t: "Arnesh Kumar v. State of Bihar (2014) 8 SCC 273", tag: "Criminal", hold: "Arrest not automatic for offences punishable up to 7 years; S. 41-A CrPC notices; safeguards against blanket arrest." },
  { t: "Satender Kumar Antil v. CBI (2022) 10 SCC 51", tag: "Criminal", hold: "Comprehensive bail jurisprudence — bail is rule, jail is exception; guidelines for compliance." },
  { t: "Hussainara Khatoon v. Home Secy., Bihar (1979) 1 SCC 81", tag: "Criminal", hold: "Right to speedy trial is part of Art. 21; under-trial prisoners' rights." },
  { t: "Rudul Sah v. State of Bihar (1983) 4 SCC 141", tag: "Criminal", hold: "Compensation for illegal detention under Art. 21 — public law remedy." },
  { t: "Olga Tellis v. Bombay Municipal Corpn. (1985) 3 SCC 545", tag: "Constitution", hold: "Right to livelihood is part of the right to life; eviction of pavement dwellers must follow due process." },
  { t: "Bandhua Mukti Morcha v. Union of India (1984) 3 SCC 161", tag: "Labour / Constitution", hold: "Bonded labour is a violation of Art. 21 & 23; PIL for labour rights." },
  { t: "Indra Sawhney v. Union of India (1992) Supp 3 SCC 217", tag: "Constitution", hold: "27% OBC reservation valid; creamy layer excluded; no reservation in promotions (as modified)." },
  { t: "R. Rajagopal v. State of T.N. (1994) 6 SCC 632", tag: "Privacy / Torts", hold: "Right to privacy vs. press freedom; no prior restraint on publication of authorized biographies." },
  { t: "Vineet Narain v. Union of India (1998) 1 SCC 226", tag: "Administrative", hold: "Directions for CBI/CVC autonomy — police conduct and probity in public office." },
  { t: "Anuradha Bhasin v. Union of India (2020) 3 SCC 637", tag: "Constitution", hold: "Internet shutdowns must satisfy proportionality and Art. 19(1)(a); orders must be published." },
  { t: "Mohd. Ahmed Khan v. Shah Bano Begum (1985) 2 SCC 556", tag: "Family", hold: "Maintenance to Muslim wife under S. 125 CrPC is not barred; led to the 1986 Act and later 2019 Act." },
  { t: "Shah Bano / Danial Latifi v. UOI (2001) 7 SCC 740", tag: "Family", hold: "S. 3 of the Muslim Women Act 1986 — 'reasonable and fair provision' must extend beyond iddat period." },
  { t: "Laxmi v. Union of India (2014) 4 SCC 427", tag: "Social Justice", hold: "Regulation of acid sale; compensation and rehabilitation of acid-attack survivors." },
  { t: "Bachpan Bachao Andolan v. Union of India (2011) 5 SCC 1", tag: "Child Rights", hold: "Anti-trafficking directions; protection of children in need of care under JJ Act." },
  { t: "In Re: Article 370 of the Constitution (2023) 11 SCC 1", tag: "Constitution", hold: "Constitutional validity of Presidential Orders that abrogated Art. 370 upheld (5-judge bench)." },
  { t: "A.K. Gopalan v. State of Madras (1950) SCR 88", tag: "Constitution", hold: "Early interpretation of Art. 21 — procedure established by law (partly overruled by Maneka Gandhi)." }
];

/* ---------- Judicial services: Prelim / Mains / Viva ---------- */
const PRELIM = {
  intro: "State judicial services preliminary exams are objective (MCQ), 100–150 marks, screening in nature. Negative marking is common. Delhi Judicial Service (DJS) preliminary covers:",
  subjects: [
    "Constitution of India (Arts. 12–35, 226, 32, 136)",
    "Criminal law — BNSS (CrPC), BNS (IPC), BSA (Evidence)",
    "Civil law — CPC, Limitation, Contract, Torts, Specific Relief",
    "Personal laws — Hindu & Muslim law, Special Marriage Act",
    "Land & property — Transfer of Property, Stamp, Registration, Rent",
    "Current legal affairs & who's who in judiciary",
    "Language paper (Hindi/English) — qualifying only"
  ],
  tips: [
    "Finish the syllabus from bare acts first; treat commentaries as secondary.",
    "Practise 5–8 mock MCQs daily on procedure (BNSS/CPC) — most examiners test procedure.",
    "Track recent Supreme Court judgments — 5–10 MCQs routinely come from them.",
    "Revise limitation periods and service/recruitment rules tables repeatedly.",
    "Attempt previous-year papers (published on Delhi High Court recruitment page)."
  ],
  sample: [
    { q: "Under Article 21 of the Constitution, 'procedure established by law' means:", opts: ["Any procedure enacted by the legislature", "A fair, just and reasonable procedure", "Natural justice only", "Procedure in CPC/CrPC"], a: 1 },
    { q: "A writ of Habeas Corpus lies for:", opts: ["Enforcement of contracts", "Protection of personal liberty against illegal detention", "Quashing of a statute", "Recovery of tax"], a: 1 },
    { q: "Bail is 'rule and jail is exception' was reiterated in:", opts: ["D.K. Basu v. State of W.B.", "Satender Kumar Antil v. CBI", "Lalita Kumari v. U.P.", "Vishaka v. Rajasthan"], a: 1 },
    { q: "Under the Bharatiya Nagarik Suraksha Sanhita, 2023, a police officer's power to arrest without warrant is given in:", opts: ["S. 35", "S. 43", "S. 54", "S. 41"], a: 1 },
    { q: "The period of limitation for an appeal from a decree of a trial court is:", opts: ["30 days", "60 days", "90 days", "180 days"], a: 2 },
    { q: "Which of the following is NOT a 'basic feature' of the Constitution per settled law:", opts: ["Judicial review", "Federalism", "Right to property", "Secularism"], a: 2 },
    { q: "Under S. 138 of the NI Act (cheque dishonour), the notice of demand must be given within:", opts: ["15 days", "30 days", "45 days", "60 days"], a: 1 },
    { q: "A 'decree' under the CPC does NOT include:", opts: ["Dismissal of suit in default", "Determination of a suit", "A formal expression of adjudication", "Appealable determination"], a: 0 },
    { q: "The 'doctrine of eclipse' applies to:", opts: ["Post-constitutional laws", "Pre-constitutional laws violative of Part III", "Taxing statutes", "Amendment Acts"], a: 1 },
    { q: "Who administers the oath of office to the President of India:", opts: ["Chief Justice of India", "Vice-President", "Speaker of Lok Sabha", "Attorney General"], a: 0 },
    { q: "Under the BSA 2023, 'confession' made to a police officer is:", opts: ["Admissible if voluntary", "Inadmissible", "Admissible with corroboration", "Admissible if in writing"], a: 1 },
    { q: "A Magistrate can take cognizance of an offence upon:", opts: ["Complaint only", "Police report only", "Complaint, police report or information", "Mere suspicion"], a: 2 }
  ]
};

const MAINS = {
  intro: "The Mains is the qualifying, descriptive stage. Judgments are evaluated on structure, statutory citations, case law, and clarity. DJS mains papers typically include:",
  papers: [
    { p: "Paper I — Constitution & Administrative Law (150 marks)", s: "Long answers, case comments, drafting of constitutional issues" },
    { p: "Paper II — Substantive Law (150 marks)", s: "Contract, Torts, Criminal law (BNS), Property, Personal laws" },
    { p: "Paper III — Procedure & Evidence (150 marks)", s: "CPC, BNSS, BSA, Limitation, Judgments writing" },
    { p: "Paper IV — Language paper", s: "Hindi/English essay, precis, translation (qualifying)" }
  ],
  tips: [
    "Structure answers: introduction → statutory provision → case law → application → conclusion.",
    "Quote exact section numbers and case names with year.",
    "Practise writing a full judgment skeleton from a set of facts.",
    "Use bare-act margins — cite sections precisely, avoid paraphrasing.",
    "Time-box: 15 min planning + 40 min writing + 5 min review per answer."
  ]
};

const VIVA = [
  { cat: "Personal Profile", q: "Introduce yourself and your academic background.", a: "Keep it crisp: name, education (LL.B/BA LL.B, university, year), any internships, moots or research, and why you want to join the judicial service." },
  { cat: "Personal Profile", q: "Why do you want to become a judge instead of a litigating advocate?", a: "Highlight judicial temperament, interest in resolution over advocacy, and service to justice. Avoid criticizing the Bar." },
  { cat: "Personal Profile", q: "What recent judgments have you read?", a: "Name 2–3 recent Supreme Court matters, state the issue, ratio and why you found it interesting. Authenticity matters more than volume." },
  { cat: "Constitution", q: "What is the basic structure doctrine?", a: "Kesavananda Bharati (1973): Parliament's amending power cannot alter the basic features — judicial review, secularism, federalism, rule of law, democracy, etc." },
  { cat: "Constitution", q: "Difference between 'procedure established by law' and 'due process of law'?", a: "Gopalan (1950) read Art. 21 literally; Maneka Gandhi (1978) imported fairness — procedure must be just, fair and reasonable." },
  { cat: "Constitution", q: "What are the grounds for a writ of Certiorari?", a: "Error of jurisdiction, error apparent on the face of the record, violation of natural justice, and orders of quasi-judicial bodies acting without/with excess jurisdiction." },
  { cat: "Constitution", q: "Article 226 vs Article 32?", a: "Art. 32 — writs to SC for Fundamental Rights (itself a FR); Art. 226 — writs to High Courts for FRs and any other legal right, including against private bodies in limited cases." },
  { cat: "Criminal Law", q: "When is bail 'as of right' and when discretionary?", a: "Bailable offences — bail as of right (1st Schedule, BNSS S. 480). Non-bailable — discretionary, guided by Antil, Bikramjit Singh etc.: flight risk, tampering, gravity, antecedents." },
  { cat: "Criminal Law", q: "What is a 'summary trial'?", a: "Trial of petty offences (up to 2 years imprisonment) — for the procedure; no adjournment unless necessary; no appeal for sentences up to 3 months." },
  { cat: "Criminal Law", q: "Can an accused be convicted solely on a confession?", a: "Confession to a police officer is inadmissible (BSA S. 23). A judicial confession can be the basis of conviction if voluntary and true, but courts seek corroboration in practice." },
  { cat: "Evidence", q: "What is leading evidence? When can it be allowed?", a: "Questions suggesting the answer — normally disallowed in examination-in-chief; allowed in cross-examination and for 'hostile' witnesses with court's permission." },
  { cat: "Evidence", q: "What is 'res gestae'?", a: "Facts forming part of the same transaction (BSA S. 6) — acts/statements contemporaneous with the fact in issue." },
  { cat: "Civil Procedure", q: "What is 'res judicata'?", a: "CPC S. 11 — no court shall try any suit/issue directly and substantially in issue in a former suit between the same parties, decided by a competent court." },
  { cat: "Civil Procedure", q: "Distinguish 'decree' from 'order'.", a: "Decree — formal adjudication conclusively determining parties' rights in a suit (S. 2(2)); it may be preliminary or final. Order — formal expression of every other adjudication." },
  { cat: "Civil Procedure", q: "When can a suit be dismissed in default?", a: "Order IX Rule 8 — plaintiff fails to appear; remedy: restoration within 30 days (Order IX Rule 9)." },
  { cat: "Contract", q: "What is consideration? Is consideration without a contract valid?", a: "S. 2(d) Contract Act — something done/abstained at the promisor's desire. Past consideration is valid in India; 'nudum pactum' (no consideration) agreements are void subject to S. 25 exceptions." },
  { cat: "Contract", q: "What is 'Quantum Meruit'?", a: "\"As much as deserved\" — quasi-contractual recovery (S. 70) where work is done for another and accepted, even without a formal contract." },
  { cat: "Property", q: "What is the difference between a lease and a licence?", a: "Lease — transfer of a right to enjoy immovable property (S. 105 ToP) with exclusive possession; Licence — mere permission to occupy (S. 52 Easements), revocable." },
  { cat: "A", q: "What is the 'doctrine of lis pendens'?", a: "S. 52 ToP — during pendency of a suit, a transferee of contested property takes it subject to the suit's outcome." },
  { cat: "Court Administration", q: "How will you manage your court's pendency?", a: "Categorize matters (disposal-oriented, part-heard, interim), fix effective dates, use proforma scheduling, prioritize aged cases, and use alternative dispute resolution/settlement weeks." },
  { cat: "Current Affairs", q: "What are the new criminal laws and when did they take effect?", a: "BNS, BNSS and BSA — 2023 codes that replaced IPC, CrPC and Evidence Act from 1 July 2024." },
  { cat: "Current Affairs", q: "Say something about eCourts Phase III?", a: "Digitization of all courts, National Judicial Data Grid, e-filing, virtual courts, and paperless courts under the e-Committee blueprint." },
  { cat: "Current Affairs", q: "What is gender justice in recent case law?", a: "Read down of adultery (Joseph Shine), triple talaq (Shayara Bano), and nuanced handling of custody matters; POSH Act 2013 compliance." },
  { cat: "Ethics", q: "What is 'judicial temperament'?", a: "Patience, impartiality, courtesy, dignity, restraint in language, and dignity to every litigant regardless of standing." },
  { cat: "Ethics", q: "What will you do if a senior advocate pressures you for an adjournment?", a: "Decide on the record and law; uniform application of rules; politely refuse where the cause list or public interest requires hearing." },
  { cat: "Ethics", q: "What is your view on delay in delivery of judgments?", a: "Reserve only when necessary; deliver within the working flexibility the law allows; keep dictated-orders brief and reasons clear." },
  { cat: "Family Law", q: "What is 'irretrievable breakdown of marriage'?", a: "A ground recognized in judicial dicta; statutory insertion (Divorce Act / HMA amendment) has been debated; recent SC decisions have exercised Art. 142 powers in exceptional cases." },
  { cat: "Family Law", q: "Can a child's custody be given to a third person rather than a parent?", a: "Yes — welfare of the child is paramount (dominant consideration); parent's right is secondary (Hindu Minority Act S. 6; G&W Act)." },
  { cat: "Misc.", q: "What is 'pre-emption'?", a: "Right to acquire property before a stranger (Muhammadan law / some local statutes) — right attaches when sale is complete." },
  { cat: "Misc.", q: "What is a 'caveat'?", a: "S. 148A CPC — a notice/appearance to ensure no grant/order passes without hearing the caveator; valid for 90 days." }
];

/* ---------- Education: video channels & topics ---------- */
const VIDEO_CHANNELS = [
  { name: "Delhi High Court — Official YouTube", url: "https://www.youtube.com/@DelhiHighCourt" },
  { name: "Supreme Court of India — Official YouTube", url: "https://www.youtube.com/@SupremeCourtOfIndia" },
  { name: "e-Committee, Supreme Court of India", url: "https://www.youtube.com/@eCommitteeSCI" },
  { name: "LegalEdge — judicial services prep", url: "https://www.youtube.com/@LegalEdgeCLATCoaching" },
  { name: "StudyIQ Judiciary / Law", url: "https://www.youtube.com/@StudyIQJudiciary" },
  { name: "Unacademy Judiciary (free lectures)", url: "https://www.youtube.com/@UnacademyJudiciary" },
  { name: "Drishti Judiciary", url: "https://www.youtube.com/@DrishtiJudiciary" },
  { name: "Law Guru / legal explainers", url: "https://www.youtube.com/@LawGuruOfficial" }
];

const VIDEO_TOPICS = [
  "landmark judgments supreme court india",
  "article 21 right to life lectures",
  "bail law india BNSS lectures",
  "criminal procedure BNSS 2023",
  "evidence act BSA 2023 lectures",
  "transfer of property act lectures",
  "family law hindu marriage act",
  "judicial service prelims mock test",
  "judicial mains answer writing",
  "viva voce judiciary preparation",
  "constitution of india articles explained",
  "code of civil procedure 1908 lectures"
];

/* ---------- Key portals (footer / resources) ---------- */
const PORTALS = [
  { label: "Delhi High Court", url: "https://delhihighcourt.nic.in/web/" },
  { label: "Delhi District Courts", url: "https://delhidistrictcourts.nic.in/" },
  { label: "Supreme Court of India", url: "https://www.sci.gov.in/" },
  { label: "eCourts Services (national)", url: "https://services.ecourts.gov.in/ecourtindia_v6/" },
  { label: "India Code (official acts)", url: "https://www.indiacode.nic.in/" },
  { label: "Verdict Finder (SCI judgments)", url: "https://verdictfinder.sci.gov.in/elk_frontend/index.php" },
  { label: "eSCR — Judgments & Orders", url: "https://scr.sci.gov.in/" },
  { label: "DHC Recruitment / Notices", url: "https://delhihighcourt.nic.in/web/recruitment" }
];

/* ---------- Site-wide searchable catalog (for quick search) ---------- */
const SEARCH_INDEX = [
  ...DISTRICT_SERVICES.map(s => ({ t: s.title, c: "District Courts", d: s.desc, u: s.primary ? s.primary.url : (DISTRICTS[0].url + DISTRICT_PATHS.judges) })),
  ...HC_SERVICES.map(s => ({ t: s.title, c: "High Court (Delhi)", d: s.desc, u: s.url })),
  ...SC_SERVICES.map(s => ({ t: s.title, c: "Supreme Court", d: s.desc, u: s.url })),
  { t: "Bare Acts Library", c: "Education", d: "Books of all central acts — official texts.", u: "bare-acts.html" },
  { t: "Landmark Judgments", c: "Education", d: "Important landmark judgments for judicial services.", u: "landmark-judgments.html" },
  { t: "Preliminary Examination", c: "Education", d: "Pattern, syllabus and sample MCQs.", u: "judicial-exams.html#prelim" },
  { t: "Mains Examination", c: "Education", d: "Descriptive papers, pattern and tips.", u: "judicial-exams.html#mains" },
  { t: "Viva-Voce Questions", c: "Education", d: "Common interview questions with model answers.", u: "judicial-exams.html#viva" },
  { t: "Topic-wise Videos", c: "Education", d: "Curated video libraries and YouTube topic gateway.", u: "videos.html" },
  { t: "Drafting Desk", c: "Drafting", d: "Templates: vakalatnama, notice, bail, pleadings.", u: "drafting.html" },
  { t: "Copyright Assignment (Author's Heirs → Publishers)", c: "Drafting", d: "Assignment of book copyright by legal heirs to publishers.", u: "drafting.html#tpl-copyright" },
  { t: "Owner–Architect Agreement", c: "Drafting", d: "Architect appointment: design, approvals, supervision, fees.", u: "drafting.html#tpl-architect" },
  { t: "Building Agreement (Owner supplies plot & materials)", c: "Drafting", d: "Labour contract where the owner provides plot and all materials.", u: "drafting.html#tpl-owner-materials" },
  { t: "Employer–Workman Compromise (Compensation)", c: "Drafting", d: "Settlement of accident compensation under the Employees' Compensation Act.", u: "drafting.html#tpl-compromise" },
  { t: "Turnkey Construction Agreement", c: "Drafting", d: "Full design-build construction at a per-sq.ft. rate.", u: "drafting.html#tpl-turnkey" },
  { t: "Judgments & Orders", c: "Services", d: "Search judgments/orders of DHC & Supreme Court.", u: "judgments-orders.html" }
];
