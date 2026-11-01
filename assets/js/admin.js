/* ============================================================
   CourtConnect — Admin panel
   Multi-user login (admin / anchal), custom templates, custom
   judgments, password change. Client-side demo auth (SHA-256).
   ============================================================ */
"use strict";

(function () {
  const USERS_KEY = "cc_admin_users";
  const SESSION_KEY = "cc_admin_session";
  const DEFAULT_USERS = { admin: "admin123", anchal: "55555" };

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
  /* Demo auth — passwords stored/compared in the browser only. */
  function readUsers() {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch (e) { /* noop */ }
    return null;
  }
  function storedUsers() {
    return readUsers() || Object.assign({}, DEFAULT_USERS);
  }
  function persistUsers(users) {
    try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch (e) { /* noop */ }
  }
  function currentUser() {
    try { return sessionStorage.getItem(SESSION_KEY) || ""; } catch (e) { return ""; }
  }
  function setLoggedIn(user) {
    try {
      if (user) sessionStorage.setItem(SESSION_KEY, user);
      else sessionStorage.removeItem(SESSION_KEY);
    } catch (e) { /* noop */ }
  }

  /* ---------- views ---------- */
  function showLogin() {
    $("loginView").hidden = false;
    $("panelView").hidden = true;
  }
  function showPanel() {
    $("loginView").hidden = true;
    $("panelView").hidden = false;
    const who = document.querySelector("#panelView .whoami");
    if (who) who.textContent = "Logged in as: " + currentUser();
    renderLists();
  }

  /* ---------- login ---------- */
  async function tryLogin() {
    const uname = $("loginUser").value.trim().toLowerCase();
    const pw = $("loginPw").value;
    if (!uname || !pw) { msg($("loginMsg"), "Enter both username and password.", false); return; }
    const users = storedUsers();
    if (users[uname] && users[uname] === pw) {
      setLoggedIn(uname);
      msg($("loginMsg"), ""); $("loginPw").value = "";
      showPanel();
    } else {
      msg($("loginMsg"), "Wrong username or password.", false);
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
    const user = currentUser();
    if (!user) { msg($("pwMsg"), "Not logged in.", false); return; }
    const cur = $("curPw").value;
    const n1 = $("newPw").value;
    const n2 = $("newPw2").value;
    if (!cur || !n1) { msg($("pwMsg"), "Fill current and new password.", false); return; }
    if (n1.length < 6) { msg($("pwMsg"), "New password must be at least 6 characters.", false); return; }
    if (n1 !== n2) { msg($("pwMsg"), "New passwords do not match.", false); return; }
    const users = storedUsers();
    if (users[user] !== cur) {
      msg($("pwMsg"), "Current password is incorrect.", false); return;
    }
    users[user] = n1;
    persistUsers(users);
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
    $("loginUser").addEventListener("keydown", (e) => { if (e.key === "Enter") tryLogin(); });
    $("tplAddBtn").addEventListener("click", addTemplate);
    $("jAddBtn").addEventListener("click", addJudgment);
    $("changePwBtn").addEventListener("click", changePassword);
    $("logoutBtn").addEventListener("click", () => { setLoggedIn(null); showLogin(); });
    initTabs();
    initDeletes();
    if (currentUser() && readUsers()) showPanel(); else showLogin();
  });
})();
