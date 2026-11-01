/* ============================================================
   CourtConnect — Draft Library (2000+ legal drafts)
   Filter via topic dropdown + search + sort → open/ edit / copy / download.
   Data: assets/drafts/<slug>.json (lazy-loaded) + catalog JS.
   ============================================================ */
"use strict";

(function () {
  if (typeof window.DRAFTS_CATALOG === "undefined") return;
  const catalog = window.DRAFTS_CATALOG;

  const state = { slug: "", drafts: [], query: "", sort: "az" };

  const $ = (id) => document.getElementById(id);
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
  }

  /* ---------- populate topic dropdown ---------- */
  function initTopicSelect() {
    const sel = $("libTopic");
    if (!sel) return;
    sel.innerHTML =
      '<option value="">All topics (' + catalog.length + ')</option>' +
      catalog.map((c) => `<option value="${c.slug}">${escapeHtml(c.title)} (${c.count})</option>`).join("");
    sel.addEventListener("change", () => setCategory(sel.value));
  }

  /* ---------- category selection ---------- */
  async function setCategory(slug) {
    state.slug = slug;
    state.query = "";
    const search = $("libSearch");
    if (search) search.value = "";

    const status = $("libStatus");
    if (!slug) {
      state.drafts = [];
      if (status) status.textContent = "Choose a topic above to browse its drafts.";
      $("libCount").textContent = "";
      renderGrid();
      return;
    }
    if (status) status.textContent = "Loading…";
    try {
      const res = await fetch("assets/drafts/" + slug + ".json");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      state.drafts = data.drafts || [];
      if (status) status.textContent = "";
      updateCount();
      renderGrid();
    } catch (err) {
      if (status) status.textContent = "Could not load this topic (" + err.message + ").";
    }
  }

  /* ---------- filter + sort ---------- */
  function visibleDrafts() {
    const q = state.query.toLowerCase();
    let list = state.drafts;
    if (q) {
      list = list.filter((d) => d.title.toLowerCase().includes(q));
    }
    const sorted = list.slice();
    if (state.sort === "az") sorted.sort((a, b) => a.title.localeCompare(b.title));
    else sorted.sort((a, b) => b.title.localeCompare(a.title));
    return sorted;
  }

  function updateCount() {
    const count = $("libCount");
    if (!count) return;
    const total = state.slug ? (catalog.find(c => c.slug === state.slug) || {}).count : catalog.reduce((n, c) => n + c.count, 0);
    count.textContent = state.slug + " — " + visibleDrafts().length + " / " + total + " drafts";
  }

  function renderGrid() {
    const grid = $("draftGrid");
    if (!grid) return;
    const list = visibleDrafts();
    if (!list.length) {
      grid.innerHTML = '<p class="disclaimer" style="grid-column:1/-1">No drafts match.</p>';
      return;
    }
    grid.innerHTML = list.map((d, i) => `
      <button type="button" class="draft-card" data-i="${i}" style="cursor:pointer">
        <span class="draft-title">${escapeHtml(d.title)}</span>
        <span class="draft-meta">${escapeHtml(d.file.split("/").pop())}</span>
      </button>`).join("");
    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".draft-card");
      if (!card) return;
      openViewer(list[Number(card.dataset.i)]);
    });
  }

  /* ---------- viewer modal ---------- */
  function openViewer(draft) {
    const modal = $("draftModal");
    if (!modal) return;
    $("dmTitle").textContent = draft.title;
    $("dmMeta").textContent = (state.slug ? (catalog.find(c => c.slug === state.slug) || {}).title : "Library") + " · " + draft.file;
    const ta = $("dmText");
    ta.value = draft.text || "";
    const dl = $("dmDownload");
    dl.href = "drafts-library/" + draft.file;
    dl.setAttribute("download", draft.file.split("/").pop());
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeViewer() {
    const modal = $("draftModal");
    if (!modal) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  function copyViewer() {
    const ta = $("dmText");
    if (!ta) return;
    const text = ta.value;
    const done = () => {
      const btn = $("dmCopy");
      const old = btn.textContent;
      btn.textContent = "✓ Copied";
      setTimeout(() => { btn.textContent = old; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(done);
    } else {
      ta.select();
      try { document.execCommand("copy"); } catch (e) { /* noop */ }
      done();
    }
  }

  /* ---------- init ---------- */
  function init() {
    initTopicSelect();

    const search = $("libSearch");
    if (search) {
      search.addEventListener("input", () => {
        state.query = search.value.trim();
        updateCount();
        renderGrid();
      });
    }

    const sort = $("libSort");
    if (sort) {
      sort.addEventListener("change", () => {
        state.sort = sort.value;
        renderGrid();
        updateCount();
      });
    }

    const modal = $("draftModal");
    if (modal) {
      $("dmClose").addEventListener("click", closeViewer);
      $("dmClose2").addEventListener("click", closeViewer);
      $("dmCopy").addEventListener("click", copyViewer);
      modal.addEventListener("click", (e) => { if (e.target === modal) closeViewer(); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeViewer(); });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
