// ==========================================================================
// FUTURE ME TIME CAPSULE MODULE V4 (WITH INSTANT DASHBOARD RE-RENDERING)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("add-future-note-btn")?.addEventListener("click", () => showFutureNoteForm());
  renderFutureNotes();
  renderMotivationCard(); 
});

function showFutureNoteForm(noteId = null) {
  const isEdit = noteId !== null;
  let note = { title: "", message: "" };

  // Enforce consistent object allocation in window scope
  if (!window.appData) window.appData = { futureNotes: [] };
  if (!window.appData.futureNotes) window.appData.futureNotes = [];

  if (isEdit) {
    const found = window.appData.futureNotes.find(n => n.id === Number(noteId));
    if (found) note = found;
  }

  const formHTML = `
    <div class="form-container" style="padding:10px; color:#fff; font-family:sans-serif;">
      <h3 style="margin-top:0; color:var(--accent);">${isEdit ? "Modify Time Capsule Note" : "Seal a Note for Future Me"}</h3>
      <hr style="border:0; border-top:1px solid #334; margin-bottom:15px;">
      
      <div style="margin-bottom:12px;">
        <label style="display:block; margin-bottom:5px; font-size:0.85rem; color:#4dadff;">Capsule Title / Context</label>
        <input type="text" id="fn-title" value="${note.title}" placeholder="e.g., Read this during November burn-out" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box;">
      </div>

      <div style="margin-bottom:18px;">
        <label style="display:block; margin-bottom:5px; font-size:0.85rem; color:#6b8cff;">Message / Advice to Yourself</label>
        <textarea id="fn-message" placeholder="Remind yourself why you took a drop year..." style="width:100%; height:100px; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box; resize:vertical;">${note.message}</textarea>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button onclick="if(typeof hideModal === 'function'){ hideModal(); } else { document.getElementById('modal-overlay').style.display='none'; }" style="background:#475569; margin:0;">Cancel</button>
        <button onclick="processFutureNoteSubmit(${isEdit ? note.id : null})" style="background:var(--accent); margin:0; font-weight:bold;">Seal Capsule</button>
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

function processFutureNoteSubmit(existingId = null) {
  if (!window.appData) window.appData = { futureNotes: [] };
  if (!window.appData.futureNotes) window.appData.futureNotes = [];

  const tVal = document.getElementById("fn-title").value.trim() || "Untitled Capsule";
  const mVal = document.getElementById("fn-message").value.trim();

  if (!mVal) {
    if (typeof hideModal === "function") hideModal();
    else document.getElementById("modal-overlay").style.display = "none";
    return;
  }

  if (existingId) {
    const item = window.appData.futureNotes.find(n => n.id === existingId);
    if (item) { item.title = tVal; item.message = mVal; }
  } else {
    window.appData.futureNotes.push({
      id: Date.now(), title: tVal, message: mVal,
      createdDate: new Date().toISOString().split("T")[0],
      targetDate: "", opened: false
    });
    if (typeof updateActivity === "function") updateActivity();
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

  renderFutureNotes();
  renderMotivationCard(); 

  // INSTANT HOT RE-RENDER: Synchronize home dashboard view states on submission
  if (typeof window.fullyTriggerUIRefresh === "function") {
    window.fullyTriggerUIRefresh();
  }
}

function deleteFutureNote(id) {
  if (!window.appData || !window.appData.futureNotes) return;
  window.appData.futureNotes = window.appData.futureNotes.filter(note => note.id !== id);

  if (typeof window.saveData === "function") {
    window.saveData();
  } else {
    localStorage.setItem("jee_nexus_master_db", JSON.stringify(window.appData));
  }

  renderFutureNotes();
  renderMotivationCard();

  if (typeof window.fullyTriggerUIRefresh === "function") {
    window.fullyTriggerUIRefresh();
  }
}

function editFutureNote(id) { showFutureNoteForm(id); }

function markFutureNoteOpened(id) {
  if (!window.appData || !window.appData.futureNotes) return;
  const note = window.appData.futureNotes.find(n => n.id === id);
  if (!note) return;

  note.opened = !note.opened;

  if (typeof window.saveData === "function") {
    window.saveData();
  } else {
    localStorage.setItem("jee_nexus_master_db", JSON.stringify(window.appData));
  }

  renderFutureNotes();
  renderMotivationCard();

  if (typeof window.fullyTriggerUIRefresh === "function") {
    window.fullyTriggerUIRefresh();
  }
}

function renderMotivationCard() {
  const target = document.getElementById("motivation-card");
  if (!target) return;

  const baseList = (window.appData && window.appData.futureNotes) ? window.appData.futureNotes : [];
  const unopenedNotes = baseList.filter(n => !n.opened);

  if (unopenedNotes.length === 0) {
    target.innerHTML = `<span style="opacity:0.5; font-style:italic;">No unopened future notes yet. Seal a time capsule to unlock motivation later!</span>`;
    return;
  }

  // Uses a solid math index fallback loop to select structural array components cleanly
  const randomNote = unopenedNotes[Math.floor(Math.random() * unopenedNotes.length)];
  target.innerHTML = `
    <h4 style="margin:0 0 4px 0; color:var(--accent);">🔒 ${randomNote.title}</h4>
    <p style="margin:0; font-size:0.95rem; line-height:1.5; color:#e2e8f0; white-space:pre-wrap;">${randomNote.message}</p>
  `;
}

function renderFutureNotes() {
  const container = document.getElementById("future-note-list");
  if (!container) return;

  let html = "";
  const baseList = (window.appData && window.appData.futureNotes) ? window.appData.futureNotes : [];
  const sorted = [...baseList].sort((a, b) => b.id - a.id);

  sorted.forEach(note => {
    const isOpened = note.opened;
    html += `
      <div class="future-card">
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:4px;">
          <h3 style="margin:0; color:#fff; font-size:1.05rem; max-width:70%;">${note.title}</h3>
          <span style="font-size:0.75rem; color:${isOpened ? '#94a3b8' : 'var(--accent)'}; font-weight:bold;">
            ${isOpened ? "🔒 OPENED" : "✨ SEALED"}
          </span>
        </div>
        <p style="font-size:0.8rem; opacity:0.5; margin-bottom:6px;">📅 Created: ${note.createdDate || "Unknown"}</p>
        <p style="color:#e2e8f0; font-size:0.95rem; line-height:1.4; white-space:pre-wrap; margin-bottom:10px;">${note.message}</p>
        <div class="action-row">
          <button onclick="markFutureNoteOpened(${note.id})" style="background:var(--accent);">${isOpened ? "Reseal" : "Unlock"}</button>
          <button onclick="editFutureNote(${note.id})" style="background:var(--card2);">Edit</button>
          <button onclick="deleteFutureNote(${note.id})" style="background:#b91c1c;">Delete</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html || `<div class="card" style="opacity:0.5; text-align:center; padding:20px;">No Future Notes Found</div>`;
}

// Global configuration hooks for structural index layout mapping
window.showAddFutureNoteModal = showFutureNoteForm;

window.editFutureNote = editFutureNote;
window.deleteFutureNote = deleteFutureNote;
window.markFutureNoteOpened = markFutureNoteOpened;
window.renderMotivationCard = renderMotivationCard;
window.renderFutureNotes = renderFutureNotes;
