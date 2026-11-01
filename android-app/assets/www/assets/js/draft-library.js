/* ============================================================
   CourtConnect — Draft Library (2000+ legal drafts)
   Filter by topic → open → edit → copy / download original.
   Data: assets/drafts/<slug>.json (lazy-loaded) + catalog JS.
   ============================================================ */
"use strict";

(function () {
  if (typeof window.DRAFTS_CATALOG === "undefined") return;
  const catalog = window.DRAFTS_CATALOG;

  const state = { slug: null, drafts: [], query: "" };

  /* ---------- helpers ---------- */
  const $ = (id) => document.getElementById(id);
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
  }

  /* ---------- render category chips ---------- */
  function renderChips() {
    const wrap = $("catChips");
    if (!wrap) return;
    wrap.innerHTML =
      '<button type="button" class="chip cat-chip" data-slug="" style="cursor:pointer">All topics</button>' +
      catalog.map((c) =>
        `<button type="button" class="chip cat-chip" data-slug="${c.slug}" style="cursor:pointer">${escapeHtml(c.title)} <span class="chip-count">${c.count}</span></button>`
      ).join("");
    wrap.addEventListener("click", (e) => {
      const chip = e.target.closest(".cat-chip");
      if (!chip) return;
      setCategory(chip.dataset.slug);
    });
  }

  /* ---------- category selection ---------- */
  async function setCategory(slug) {
    state.slug = slug;
    state.query = "";
    const search = $("libSearch");
    if (search) search.value = "";

    document.querySelectorAll(".cat-chip").forEach((ch) => {
      const on = ch.dataset.slug === slug;
      ch.classList.toggle("active", on);
    });

    const grid = $("draftGrid");
    const status = $("libStatus");
    if (!slug) {
      state.drafts = [];
      if (grid) grid.innerHTML = "";
      if (status) status.textContent = "Select a topic above to browse its drafts.";
      $("libCount").textContent = "";
      return;
    }
    if (status) status.textContent = "Loading…";
    try {
      const res = await fetch("assets/drafts/" + slug + ".json");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      state.drafts = data.drafts || [];
      if (status) status.textContent = "";
      $("libCount").textContent = data.category + " — " + state.drafts.length + " drafts";
      renderGrid();
    } catch (err) {
      if (status) status.textContent = "Could not load this topic (" + err.message + ").";
    }
  }

  /* ---------- filter + grid ---------- */
  function visibleDrafts() {
    const q = state.query.toLowerCase();
    if (!q) return state.drafts;
    return state.drafts.filter((d) =>
      (d.title + " " + (state.slug || "")).toLowerCase().includes(q)
    );
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

  /* ---------- viewer modal (edit / copy / download) ---------- */
  function openViewer(draft) {
    const modal = $("draftModal");
    if (!modal) return;
    $("dmTitle").textContent = draft.title;
    $("dmMeta").textContent = state.slug ? (catalog.find(c => c.slug === state.slug) || {}).title : "" + " · " + draft.file;
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
    renderChips();

    const search = $("libSearch");
    if (search) {
      search.addEventListener("input", () => {
        state.query = search.value.trim();
        const count = $("libCount");
        if (count && state.slug) {
          count.textContent = (catalog.find(c => c.slug === state.slug) || {}).title + " — " + visibleDrafts().length + " drafts";
        }
        renderGrid();
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
