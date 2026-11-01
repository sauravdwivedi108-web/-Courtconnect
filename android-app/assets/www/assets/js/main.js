/* ============================================================
   CourtConnect — shared UI behaviour
   ============================================================ */
"use strict";

/* ---------- Mobile navigation ---------- */
function initNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "✕" : "☰";
  });
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("open") && !nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "☰";
    }
  });
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const els = document.querySelectorAll(".fade-up");
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  els.forEach((el, i) => {
    el.style.transitionDelay = Math.min(i % 6, 4) * 60 + "ms";
    io.observe(el);
  });
}

/* ---------- Back to top ---------- */
function initBackTop() {
  const btn = document.getElementById("backTop");
  if (!btn) return;
  const onScroll = () => btn.classList.toggle("show", window.scrollY > 600);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ---------- Footer (rendered from data) ---------- */
function renderFooter() {
  const host = document.getElementById("siteFooter");
  if (!host || typeof PORTALS === "undefined") return;
  host.innerHTML = `
    <div class="container">
      <div class="foot-brand">
        <a class="brand" href="index.html" style="margin-bottom:12px">
          <span class="brand-mark" aria-hidden="true">⚖</span>
          <span class="brand-text"><strong>CourtConnect</strong><span>Legal Services Hub</span></span>
        </a>
        <p>A curated legal toolkit for lawyers, litigants and aspirants — official court portals, judgment search, drafting aids and judicial-services preparation.</p>
      </div>
      <div>
        <h4>Courts</h4>
        ${PORTALS.slice(0, 4).map(p => `<a href="${p.url}" target="_blank" rel="noopener">${p.label} <span class="icon-ext"></span></a>`).join("")}
      </div>
      <div>
        <h4>Resources</h4>
        ${PORTALS.slice(4).map(p => `<a href="${p.url}" target="_blank" rel="noopener">${p.label} <span class="icon-ext"></span></a>`).join("")}
      </div>
      <div>
        <h4>Quick links</h4>
        <a href="district-courts.html">District Courts</a>
        <a href="high-court.html">Delhi High Court</a>
        <a href="supreme-court.html">Supreme Court</a>
        <a href="judgments-orders.html">Judgments &amp; Orders</a>
        <a href="drafting.html">Drafting Desk</a>
        <a href="education.html">Education</a>
        <a href="download.html">Downloads</a>
        <a href="admin.html">Admin</a>
      </div>
    </div>
    <div class="foot-bottom">
      <div class="container">
        <span>© ${new Date().getFullYear()} CourtConnect · A community legal-services guide.</span>
        <span>All external links point to official government portals.</span>
      </div>
    </div>`;
}

/* ---------- District chooser modal ---------- */
function initDistrictModal() {
  const backdrop = document.getElementById("districtModal");
  if (!backdrop || typeof DISTRICTS === "undefined") return;

  const state = { path: DISTRICT_PATHS.judges, title: "" };

  window.openDistrictModal = function (serviceTitle, path, hint) {
    state.path = path || DISTRICT_PATHS.judges;
    state.title = serviceTitle || "District Courts";
    document.getElementById("dmTitle").textContent = "Choose your district — " + state.title;
    document.getElementById("dmHint").textContent = hint || "Opens the official district court website.";
    const list = document.getElementById("dmList");
    list.innerHTML = DISTRICTS.map((d) => `
      <a class="district-row" href="${d.url}${state.path}" target="_blank" rel="noopener">
        <span>${d.name}<small>${d.complex} Courts</small></span>
        <span class="di" aria-hidden="true">↗</span>
      </a>`).join("");
    backdrop.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  const close = () => { backdrop.classList.remove("open"); document.body.style.overflow = ""; };
  document.getElementById("dmClose").addEventListener("click", close);
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  /* Wire any [data-district] buttons on the page */
  document.querySelectorAll("[data-district]").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.openDistrictModal(btn.dataset.title, btn.dataset.path, btn.dataset.hint);
    });
  });
}

/* ---------- Accordions (exam Q&A etc.) ---------- */
function initAccordions() {
  document.querySelectorAll(".acc-head").forEach((head) => {
    head.addEventListener("click", () => {
      const acc = head.closest(".acc");
      const wasOpen = acc.classList.contains("open");
      /* close siblings within same container */
      const group = acc.parentElement;
      group.querySelectorAll(".acc.open").forEach((a) => { if (a !== acc) a.classList.remove("open"); });
      acc.classList.toggle("open", !wasOpen);
      head.setAttribute("aria-expanded", String(!wasOpen));
    });
  });
}

/* ---------- Copy-to-clipboard (drafting) — delegated ---------- */
function handleCopyClick(btn) {
  const target = document.getElementById(btn.dataset.copyTarget);
  if (!target) return;
  const text = target.innerText || target.textContent;
  const done = () => {
    const old = btn.textContent;
    btn.textContent = "✓ Copied";
    setTimeout(() => { btn.textContent = old; }, 1600);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else fallbackCopy(text, done);
}
function fallbackCopy(text, done) {
  const ta = document.createElement("textarea");
  ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
  document.body.appendChild(ta); ta.select();
  try { document.execCommand("copy"); } catch (e) { /* noop */ }
  document.body.removeChild(ta); done();
}
function initCopyButtons() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-copy-target]");
    if (btn) handleCopyClick(btn);
  });
}

/* ============================================================
   Theme switcher (light / dark), persisted in localStorage
   ============================================================ */
const THEME_KEY = "cc_theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* private mode */ }
  const btn = document.getElementById("themeToggle");
  if (btn) {
    const dark = theme === "dark";
    btn.textContent = dark ? "☀️" : "🌙";
    btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  }
}

function initTheme() {
  let theme = "light";
  try { theme = localStorage.getItem(THEME_KEY) || "light"; } catch (e) { /* noop */ }
  applyTheme(theme);

  const bar = document.querySelector(".topbar .tb-links");
  if (!bar) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.id = "themeToggle";
  btn.className = "theme-toggle";
  btn.title = "Change theme";
  btn.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme");
    applyTheme(cur === "dark" ? "light" : "dark");
  });
  bar.prepend(btn);
  applyTheme(document.documentElement.getAttribute("data-theme"));
}

/* ============================================================
   CCStore — localStorage-backed custom content
   (custom drafting templates + custom judgments)
   ============================================================ */
window.CCStore = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* noop */ }
  },
  uid() {
    return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },
  /* custom drafting templates */
  getTemplates() { return this.get("cc_custom_templates", []); },
  saveTemplate(t) { const l = this.getTemplates(); l.push(t); this.set("cc_custom_templates", l); },
  removeTemplate(id) { this.set("cc_custom_templates", this.getTemplates().filter(x => x.id !== id)); },
  /* custom judgments */
  getJudgments() { return this.get("cc_custom_judgments", []); },
  saveJudgment(j) { const l = this.getJudgments(); l.push(j); this.set("cc_custom_judgments", l); },
  removeJudgment(id) { this.set("cc_custom_judgments", this.getJudgments().filter(x => x.id !== id)); }
};

/* render custom templates on the Drafting page */
function renderCustomTemplates() {
  const root = document.getElementById("draftRoot");
  if (!root || !window.CCStore) return;
  const customs = window.CCStore.getTemplates();
  customs.forEach((t) => {
    const div = document.createElement("div");
    div.className = "tpl";
    div.id = "tpl-custom-" + t.id;
    const head = document.createElement("div");
    head.className = "tpl-head";
    const h3 = document.createElement("h3");
    h3.textContent = "Custom · " + (t.title || "Untitled template");
    const btn = document.createElement("button");
    btn.className = "btn btn-navy btn-sm";
    btn.type = "button";
    btn.dataset.copyTarget = "doc-custom-" + t.id;
    btn.textContent = "Copy template";
    head.append(h3, btn);
    const body = document.createElement("div");
    body.className = "tpl-body";
    const doc = document.createElement("div");
    doc.className = "doc";
    doc.id = "doc-custom-" + t.id;
    doc.textContent = t.content || "";
    body.appendChild(doc);
    if (t.note) {
      const note = document.createElement("div");
      note.className = "tpl-note";
      note.innerHTML = "<strong>Admin note:</strong> " + escapeHtml(t.note);
      body.appendChild(note);
    }
    div.append(head, body);
    root.appendChild(div);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

/* ---------- PWA hookup (manifest + service worker) ---------- */
function initPwa() {
  if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement("link");
    link.rel = "manifest";
    link.href = "manifest.webmanifest";
    document.head.appendChild(link);
  }
  if (!document.querySelector('meta[name="theme-color"]')) {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "#0d2140";
    document.head.appendChild(meta);
  }
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => { /* offline enhancement only */ });
  }
}

/* ---------- Hero interactive visual: auto-rotate + mouse parallax ---------- */
function initHeroVisual() {
  const visual = document.getElementById("heroVisual");
  if (!visual || typeof window.matchMedia === "undefined") return;
  if (window.matchMedia("(max-width: 820px)").matches) return;

  const stage = document.getElementById("hvStage") || visual.querySelector(".hv-stage");
  const slides = Array.from(visual.querySelectorAll(".hv-slide"));
  if (!stage || slides.length < 2) return;

  let current = 0;
  const INTERVAL = 5000;

  /* auto-rotate with crossfade */
  setInterval(() => {
    slides[current].classList.remove("active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("active");
  }, INTERVAL);

  /* mouse parallax on the whole stack */
  let tx = 0, ty = 0, targetX = 0, targetY = 0, ticking = false;

  function apply() {
    stage.style.transform =
      `translate3d(${tx * 34}px, ${ty * 22}px, 0) rotateY(${targetX * 6}deg) rotateX(${-targetY * 5}deg)`;
  }

  function tick() {
    tx += (targetX - tx) * 0.12;
    ty += (targetY - ty) * 0.12;
    apply();
    if (Math.abs(targetX - tx) > 0.001 || Math.abs(targetY - ty) > 0.001) {
      setTimeout(tick, 16);
    } else {
      ticking = false;
      tx = targetX; ty = targetY;
      apply();
    }
  }

  function start() {
    if (!ticking) { ticking = true; setTimeout(tick, 16); }
  }

  const hero = visual.closest(".hero");
  if (hero) {
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      targetX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      targetY = ((e.clientY - r.top) / r.height - 0.5) * 2;
      start();
    });
    hero.addEventListener("mouseleave", () => {
      targetX = 0; targetY = 0; start();
    });
  }
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initReveal();
  initBackTop();
  renderFooter();
  initDistrictModal();
  initAccordions();
  initCopyButtons();
  initQuickSearch();
  initTheme();
  renderCustomTemplates();
  initPwa();
  initHeroVisual();
});
function initQuickSearch() {
  const input = document.getElementById("quickSearchInput");
  const box = document.getElementById("quickSearchResults");
  if (!input || !box || typeof SEARCH_INDEX === "undefined") return;

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { box.classList.remove("open"); box.innerHTML = ""; return; }
    const hits = SEARCH_INDEX
      .filter((s) => (s.t + " " + s.c + " " + s.d).toLowerCase().includes(q))
      .slice(0, 7);
    box.innerHTML = hits.map((h) => `
      <a class="qr-card" href="${h.u}" ${h.u.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>
        <span>
          <span class="qr-tag">${h.c}</span>
          <b>${h.t}</b>
          <span>${h.d}</span>
        </span>
      </a>`).join("") || `<div class="qr-card"><span>No matches for “${input.value}”. Try “bail”, “cause list”, “viva”…</span></div>`;
    box.classList.add("open");
  });
  document.addEventListener("click", (e) => {
    if (!box.contains(e.target) && e.target !== input) box.classList.remove("open");
  });
}
