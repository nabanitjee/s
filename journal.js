// ==========================================================================
// JOURNAL MODULE V4 (WITH AUTOMATED ADVANCED PATTERN FILTER SEARCH)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("add-journal-entry")?.addEventListener("click", () => showJournalForm());

  // Attach structural event listener to look for typing inputs in real-time
  const searchBar = document.getElementById("journal-search");
  if (searchBar) {
    searchBar.addEventListener("input", () => renderJournal());
  }

  renderJournal();
});

function showJournalForm(entryId = null) {
  const isEdit = entryId !== null;
  let entry = { hours: "", mood: "7", work: "", notes: "" };

  if (!window.appData) window.appData = { journal: [] };
  if (!window.appData.journal) window.appData.journal = [];

  if (isEdit) {
    const found = window.appData.journal.find(e => e.id === Number(entryId));
    if (found) entry = found;
  }

  const formHTML = `
    <div class="form-container" style="padding:10px; color:#fff; font-family:sans-serif; text-align: left;">
      <h3 style="margin-top:0; color:var(--accent);">${isEdit ? "Edit Daily Log Record" : "Create Daily Journal Entry"}</h3>
      <hr style="border:0; border-top:1px solid #334; margin-bottom:15px;">
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
        <div>
          <label style="display:block; margin-bottom:5px; font-size:0.85rem; color:#4dadff;">Study Duration (Hours)</label>
          <input type="number" id="j-hours" step="0.5" min="0" value="${entry.hours}" placeholder="e.g. 6.5" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box;">
        </div>
        <div>
          <label style="display:block; margin-bottom:5px; font-size:0.85rem; color:#ffb347;">Daily Focus Mood (1-10)</label>
          <input type="number" id="j-mood" min="1" max="10" value="${entry.mood}" placeholder="5" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box;">
        </div>
      </div>

      <div style="margin-bottom:12px;">
        <label style="display:block; margin-bottom:5px; font-size:0.85rem; color:#39d98a;">Core Syllabus Work Done</label>
        <input type="text" id="j-work" value="${entry.work}" placeholder="e.g. Completed KTG & Mole Concept Module" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box;">
      </div>

      <div style="margin-bottom:18px;">
        <label style="display:block; margin-bottom:5px; font-size:0.85rem; color:#6b8cff;">Critical Notes / Self Reflection</label>
        <textarea id="j-notes" placeholder="Formulas to revise, mistakes flagged..." style="width:100%; height:80px; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box; resize:vertical;">${entry.notes}</textarea>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button onclick="if(typeof hideModal === 'function'){ hideModal(); } else { document.getElementById('modal-overlay').style.display='none'; }" style="background:#475569; margin:0; padding:12px; flex:1;">Cancel</button>
        <button onclick="processJournalSubmit(${isEdit ? entry.id : null})" style="background:var(--accent); margin:0; font-weight:bold; padding:12px; flex:1;">Save Journal</button>
      </div>
    </div>
  `;

  if (typeof showModal === "function") {
    showModal(formHTML);
  } else {
    const overlay = document.getElementById("modal-overlay");
    const content = document.getElementById("modal-content");
    if (overlay && content) {
      content.innerHTML = formHTML;
      overlay.style.display = "flex";
    }
  }
}

function processJournalSubmit(existingId = null) {
  if (!window.appData) window.appData = { journal: [] };
  if (!window.appData.journal) window.appData.journal = [];

  const hrVal = document.getElementById("j-hours").value || "0";
  const mdVal = document.getElementById("j-mood").value || "5";
  const wkVal = document.getElementById("j-work").value.trim() || "General Self-Study";
  const ntVal = document.getElementById("j-notes").value.trim() || "";

  if (existingId) {
    const log = window.appData.journal.find(e => e.id === existingId);
    if (log) {
      log.hours = hrVal;
      log.mood = mdVal;
      log.work = wkVal;
      log.notes = ntVal;
    }
  } else {
    window.appData.journal.push({
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      hours: hrVal,
      mood: mdVal,
      work: wkVal,
      notes: ntVal
    });
    if (typeof updateActivity === "function") window.updateActivity();
  }

  if (typeof window.saveData === "function") {
    window.saveData();
  } else {
    localStorage.setItem("jee_nexus_master_db", JSON.stringify(window.appData));
  }

  if (typeof hideModal === "function") {
    hideModal();
  } else {
    const overlay = document.getElementById("modal-overlay");
    if (overlay) overlay.style.display = "none";
  }

  renderJournal();
  if (typeof window.fullyTriggerUIRefresh === "function") {
    window.fullyTriggerUIRefresh();
  }
}

function deleteJournalEntry(id) {
  window.appData.journal = window.appData.journal.filter(entry => entry.id !== id);

  if (typeof window.saveData === "function") {
    window.saveData();
  } else {
    localStorage.setItem("jee_nexus_master_db", JSON.stringify(window.appData));
  }

  renderJournal();
  if (typeof window.fullyTriggerUIRefresh === "function") {
    window.fullyTriggerUIRefresh();
  }
}

function editJournalEntry(id) {
  showJournalForm(id);
}

function filterJournal() {
  const q = document.getElementById("journal-search")?.value.toLowerCase().trim() || "";
  const baseList = (window.appData && window.appData.journal) ? window.appData.journal : [];

  if (!q) return baseList;

  // Search parameters include date string checks, work content fields, and note string properties
  return baseList.filter(entry => {
    return entry.date.toLowerCase().includes(q) || 
           entry.work.toLowerCase().includes(q) || 
           entry.notes.toLowerCase().includes(q);
  });
}

function renderJournal() {
  const container = document.getElementById("journal-list");
  if (!container) return;

  const entries = filterJournal();
  const sorted = [...entries].sort((a, b) => b.id - a.id);

  let html = "";

  sorted.forEach(entry => {
    html += `
      <div class="journal-card" style="text-align: left; margin-bottom:12px;">
        <h3 style="color:var(--accent); margin-bottom:6px; font-size:1.05rem;">📅 Day Log: ${entry.date}</h3>
        <p style="margin:4px 0; font-size:0.9rem;">⏱ Hours: <strong style="color:#fff;">${entry.hours} hours</strong></p>
        <p style="margin:4px 0; font-size:0.9rem;">😊 Mood: <strong style="color:#fff;">${entry.mood}/10</strong></p>
        <p style="margin:6px 0; font-size:0.95rem; color:#e2e8f0; line-height:1.4;">📚 Work: ${entry.work}</p>
        ${entry.notes ? `<p style="margin:6px 0; font-size:0.9rem; color:#94a3b8; background:rgba(0,0,0,0.15); padding:10px; border-radius:8px; line-height:1.4; white-space:pre-wrap;">📝 Notes: ${entry.notes}</p>` : ""}
        <div class="action-row" style="margin-top:12px; display:flex; gap:8px;">
          <button onclick="editJournalEntry(${entry.id})" style="background:var(--card2); padding:8px 14px; margin:0;">Edit</button>
          <button onclick="deleteJournalEntry(${entry.id})" style="background:#b91c1c; padding:8px 14px; margin:0;">Delete</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html || `<div class="card" style="opacity:0.5; text-align:center; padding:20px;">No Matching Log Entries Found</div>`;
}

function getTotalStudyHours() {
  const baseList = (window.appData && window.appData.journal) ? window.appData.journal : [];
  return baseList.reduce((sum, entry) => sum + Number(entry.hours || 0), 0);
}

// Global script navigation layout mapping references
window.showAddJournalModal = showJournalForm;
window.showJournalForm = showJournalForm;
window.processJournalSubmit = processJournalSubmit;
window.editJournalEntry = editJournalEntry;
window.deleteJournalEntry = deleteJournalEntry;
window.renderJournal = renderJournal;
window.getTotalStudyHours = getTotalStudyHours;
