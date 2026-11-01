/* ============================================================
   CourtConnect — Admin panel
   Login, custom templates, custom judgments, password change.
   Client-side demo auth (SHA-256 hash stored in localStorage).
   ============================================================ */
"use strict";

(function () {
  const PW_KEY = "cc_admin_pw";
  const DEFAULT_PW = "admin123";
  const SESSION_KEY = "cc_admin_session";

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function msg(el, text, ok) {
    if (!el) return;
    el.innerHTML = "";
    if (!text) return;
    const d = document.createElement("div");
    d.className = "admin-msg " + (ok ? "ok" : "err");
    d.textContent = text;
    el.appendChild(d);
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
  }
  async function hashPw(s) {
    try {
      if (crypto && crypto.subtle) {
        const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
      }
    } catch (e) { /* fall through */ }
    /* fallback: FNV-1a (non-cryptographic, demo only) */
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16) + "-fnv1a";
  }
  function readStoredPw() {
    try { return localStorage.getItem(PW_KEY); } catch (e) { return null; }
  }
  function storePw(h) {
    try { localStorage.setItem(PW_KEY, h); } catch (e) { /* noop */ }
  }
  function isLoggedIn() {
    try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch (e) { return false; }
  }
  function setLoggedIn(v) {
    try { v ? sessionStorage.setItem(SESSION_KEY, "1") : sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* noop */ }
  }

  /* ---------- views ---------- */
  function showLogin() {
    $("loginView").hidden = false;
    $("panelView").hidden = true;
  }
  function showPanel() {
    $("loginView").hidden = true;
    $("panelView").hidden = false;
    renderLists();
  }

  /* ---------- login ---------- */
  async function tryLogin() {
    const pw = $("loginPw").value;
    if (!pw) { msg($("loginMsg"), "Enter the password.", false); return; }
    const h = await hashPw(pw);
    const stored = readStoredPw();
    if (!stored) {
      if (h === await hashPw(DEFAULT_PW)) {
        storePw(h);
        setLoggedIn(true);
        msg($("loginMsg"), ""); $("loginPw").value = "";
        showPanel();
      } else {
        msg($("loginMsg"), "Wrong password.", false);
      }
      return;
    }
    if (h === stored) {
      setLoggedIn(true);
      msg($("loginMsg"), ""); $("loginPw").value = "";
      showPanel();
    } else {
      msg($("loginMsg"), "Wrong password.", false);
    }
  }

  /* ---------- tabs ---------- */
  function initTabs() {
    const tabs = document.querySelectorAll(".admin-tabs button");
    tabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        tabs.forEach(b => b.classList.toggle("active", b === btn));
        ["templates", "judgments", "settings"].forEach(name => {
          const el = $("tab" + name.charAt(0).toUpperCase() + name.slice(1));
          if (el) el.hidden = (btn.dataset.tab !== name);
        });
      });
    });
  }

  /* ---------- templates ---------- */
  function renderTemplates() {
    const list = $("tplList");
    const items = window.CCStore.getTemplates().slice().reverse();
    if (!items.length) {
      list.innerHTML = '<p style="color:var(--ink-soft)">No custom templates yet.</p>';
      return;
    }
    list.innerHTML = items.map((t) => `
      <div class="admin-list-item">
        <h4>${escapeHtml(t.title) || "Untitled"}</h4>
        <p>Added ${new Date(t.addedAt || Date.now()).toLocaleDateString()} · ${tagHtml(t.note)}</p>
        <div class="row-actions">
          <button class="btn btn-outline btn-sm" type="button" data-prev="tpl-${t.id}">Preview / hide</button>
          <button class="btn btn-outline btn-sm" type="button" data-del="tpl-${t.id}" style="color:var(--danger);border-color:var(--danger)">Delete</button>
        </div>
        <div class="preview" id="tpl-${t.id}" hidden></div>
      </div>`).join("");
    items.forEach((t) => {
      const pv = $("tpl-" + t.id);
      if (pv) pv.textContent = t.content || "";
    });
  }
  function tagHtml(note) {
    return note ? "<strong>Note:</strong> " + escapeHtml(note) : "";
  }
  function addTemplate() {
    const title = $("tplTitle").value.trim();
    const content = $("tplContent").value.trim();
    const note = $("tplNote").value.trim();
    if (!title || !content) { msg($("tplMsg"), "Title and document text are required.", false); return; }
    window.CCStore.saveTemplate({
      id: window.CCStore.uid(), title, content, note, addedAt: Date.now()
    });
    msg($("tplMsg"), "Template added — visible on the Drafting Desk.", true);
    $("tplTitle").value = ""; $("tplContent").value = ""; $("tplNote").value = "";
    renderTemplates();
  }

  /* ---------- judgments ---------- */
  function renderJudgments() {
    const list = $("jList");
    const items = window.CCStore.getJudgments().slice().reverse();
    if (!items.length) {
      list.innerHTML = '<p style="color:var(--ink-soft)">No custom judgments yet.</p>';
      return;
    }
    list.innerHTML = items.map((j) => `
      <div class="admin-list-item">
        <h4>${escapeHtml(j.t)}</h4>
        <p><span class="chip">${escapeHtml(j.tag) || "General"}</span> ${escapeHtml(j.hold)}</p>
        <div class="row-actions">
          <button class="btn btn-outline btn-sm" type="button" data-del="judge-${j.id}" style="color:var(--danger);border-color:var(--danger)">Delete</button>
        </div>
      </div>`).join("");
  }
  function addJudgment() {
    const t = $("jTitle").value.trim();
    const tag = $("jTag").value.trim() || "General";
    const hold = $("jHold").value.trim();
    if (!t || !hold) { msg($("jMsg"), "Case name and holding are required.", false); return; }
    window.CCStore.saveJudgment({
      id: window.CCStore.uid(), t, tag, hold, addedAt: Date.now()
    });
    msg($("jMsg"), "Judgment added — visible on Landmark Judgments.", true);
    $("jTitle").value = ""; $("jTag").value = ""; $("jHold").value = "";
    renderJudgments();
  }

  /* ---------- delete delegation ---------- */
  function initDeletes() {
    document.addEventListener("click", (e) => {
      const del = e.target.closest("[data-del]");
      if (!del) return;
      const kind = del.dataset.del.split("-")[0];
      const id = del.dataset.del.split("-").slice(1).join("-");
      if (kind === "tpl") { window.CCStore.removeTemplate(id); renderTemplates(); }
      if (kind === "judge") { window.CCStore.removeJudgment(id); renderJudgments(); }
    });
    document.addEventListener("click", (e) => {
      const pv = e.target.closest("[data-prev]");
      if (!pv) return;
      const el = $(pv.dataset.prev);
      if (!el) return;
      el.hidden = !el.hidden;
      pv.textContent = el.hidden ? "Preview / hide" : "Hide preview";
    });
  }

  /* ---------- settings ---------- */
  async function changePassword() {
    const cur = $("curPw").value;
    const n1 = $("newPw").value;
    const n2 = $("newPw2").value;
    if (!cur || !n1) { msg($("pwMsg"), "Fill current and new password.", false); return; }
    if (n1.length < 6) { msg($("pwMsg"), "New password must be at least 6 characters.", false); return; }
    if (n1 !== n2) { msg($("pwMsg"), "New passwords do not match.", false); return; }
    if (await hashPw(cur) !== (readStoredPw() || await hashPw(DEFAULT_PW))) {
      msg($("pwMsg"), "Current password is incorrect.", false); return;
    }
    storePw(await hashPw(n1));
    msg($("pwMsg"), "Password changed.", true);
    $("curPw").value = ""; $("newPw").value = ""; $("newPw2").value = "";
  }

  /* ---------- render all lists ---------- */
  function renderLists() {
    renderTemplates();
    renderJudgments();
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    $("loginBtn").addEventListener("click", tryLogin);
    $("loginPw").addEventListener("keydown", (e) => { if (e.key === "Enter") tryLogin(); });
    $("tplAddBtn").addEventListener("click", addTemplate);
    $("jAddBtn").addEventListener("click", addJudgment);
    $("changePwBtn").addEventListener("click", changePassword);
    $("logoutBtn").addEventListener("click", () => { setLoggedIn(false); showLogin(); });
    initTabs();
    initDeletes();
    if (isLoggedIn()) showPanel(); else showLogin();
  });
})();
