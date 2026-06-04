// ==========================================================================
// JEE NEXUS CHAPTER ENGINE & TRACKER MANAGEMENT
// ==========================================================================

let currentFilterType = "status";
let currentFilterValue = "all";

// Helper function to get a clean local YYYY-MM-DD date string
function getCleanStringDate(offsetDays = 0) {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 1. Calculate and update the dynamic Advanced-only Tracker Card
function updateAdvancedTrackerMetric() {
  const targetText = document.getElementById("advanced-tracker-text");
  if (!targetText) return;

  const chapters = Object.values(window.appData.chapters || {});
  const totalAdvancedUnits = chapters.filter(ch => ch.isAdvancedOnly === true).length;
  const completedAdvancedUnits = chapters.filter(ch => ch.isAdvancedOnly === true && (ch.status === "strong" || ch.status === "mastered")).length;

  if (totalAdvancedUnits === 0) {
    targetText.innerHTML = "No Advanced-only core modules configured inside your active workspace profile.";
    return;
  }

  const calculationPercentage = Math.round((completedAdvancedUnits / totalAdvancedUnits) * 100);
  targetText.innerHTML = `You have completed <strong>${completedAdvancedUnits} out of ${totalAdvancedUnits}</strong> exclusive Advanced-only chapters (<strong>${calculationPercentage}%</strong> complete).`;
}

// 2. Comprehensive Chapter Grid Renderer Block
function renderChapterGrid() {
  const grid = document.getElementById("chapter-grid");
  const countLabel = document.getElementById("chapter-counts");
  if (!grid) return;

  const searchQuery = document.getElementById("chapter-search")?.value.toLowerCase().trim() || "";

  // FIXED: Safely merge from localStorage without wiping appData memory bindings
  const rawSavedData = localStorage.getItem("jee_nexus_master_db");
  if (rawSavedData) {
    try {
      const parsed = JSON.parse(rawSavedData);
      if (parsed && parsed.chapters) {
        window.appData.chapters = parsed.chapters;
      }
    } catch(e) { console.error("Cache merge bypass failure:", e); }
  }

  const chaptersMaster = (window.appData && window.appData.chapters) ? window.appData.chapters : {};
  const items = Object.entries(chaptersMaster);

  let html = "";
  let renderedCount = 0;

  items.forEach(([name, data]) => {
    if (!data) return;

    if (searchQuery && !name.toLowerCase().includes(searchQuery)) return;

    if (currentFilterType === "exam" && currentFilterValue === "advanced-only") {
      if (!data.isAdvancedOnly) return;
    } else if (currentFilterValue !== "all") {
      if (currentFilterType === "priority") {
        const itemPriority = data.priority || "medium";
        if (itemPriority !== currentFilterValue) return;
      } else if (currentFilterType === "status") {
        const itemStatus = data.status || "weak";
        if (itemStatus !== currentFilterValue) return;
      }
    }

    renderedCount++;

    let statusColor = "var(--weak)";
    if (data.status === "average") statusColor = "var(--average)";
    if (data.status === "strong") statusColor = "var(--strong)";
    if (data.status === "mastered") statusColor = "var(--mastered)";

    const priorityColor = data.priority === "high" ? "var(--weak)" : data.priority === "low" ? "var(--mastered)" : "var(--average)";

    html += `
      <div class="chapter-card" onclick="if(typeof showChapterEditModal === 'function') { showChapterEditModal('${name.replace(/'/g, "\\'")}') }" style="border-left: 5px solid ${statusColor}; position: relative;">
        <div class="chapter-title" style="color:#fff; font-size:0.92rem; padding-right: 18px;">${name}</div>
        ${data.isAdvancedOnly ? `<span style="position: absolute; top: 6px; right: 10px; font-size: 0.8rem;" title="JEE Advanced Topic">🚀</span>` : ""}
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.72rem; opacity:0.6; margin-top:8px;">
          <span>${data.subject || 'Physics'}</span>
          <span style="color:${priorityColor}; font-weight:900; text-transform:uppercase; letter-spacing:0.5px;">
            ${data.priority === 'high' ? '🔥' : data.priority === 'low' ? '❄️' : '⚡'} ${data.priority || 'medium'}
          </span>
        </div>
      </div>
    `;
  });

  grid.innerHTML = html || `<div style="grid-column: span 2; text-align:center; opacity:0.4; padding:20px; font-size:0.9rem;">No matching modules found.</div>`;
  if (countLabel) countLabel.textContent = `(${renderedCount})`;

  updateAdvancedTrackerMetric();
}

// 3. Set up click listeners across the filter options menu bar
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".filter-row .filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-row .filter-btn").forEach(b => b.classList.remove("active-filter"));
      btn.classList.add("active-filter");

      currentFilterType = btn.dataset.filterType;
      currentFilterValue = btn.dataset.filter;
      renderChapterGrid();
    });
  });

  const addBtn = document.getElementById("add-custom-chapter-btn");
  if (addBtn) {
    addBtn.onclick = () => {
      const nameInput = document.getElementById("custom-chapter-name");
      const subjectInput = document.getElementById("custom-chapter-subject");
      const advCheckbox = document.getElementById("custom-chapter-adv-only");

      if (!nameInput || !nameInput.value.trim()) {
        alert("Please provide a valid chapter name profile.");
        return;
      }

      const cleanName = nameInput.value.trim();
      if (window.appData.chapters[cleanName]) {
        alert("This chapter entry name already exists inside your active storage.");
        return;
      }

      window.appData.chapters[cleanName] = {
        subject: subjectInput.value,
        status: "weak",
        pyq: 0,
        revision1: false,
        revision2: false,
        revision3: false,
        priority: "medium",
        lastRevised: getCleanStringDate(),
        isAdvancedOnly: advCheckbox ? advCheckbox.checked : false
      };

      // FIXED: Synchronize object nodes securely before writing back to storage
      if (typeof window.saveData === "function") {
        window.saveData();
      } else {
        localStorage.setItem("jee_nexus_master_db", JSON.stringify(window.appData));
      }

      nameInput.value = "";
      if (advCheckbox) advCheckbox.checked = false;

      renderChapterGrid();
      if (typeof window.renderStatusCounts === "function") window.renderStatusCounts();
      if (typeof window.renderPrepIndex === "function") window.renderPrepIndex();
    };
  }

  renderChapterGrid();
});

// ==========================================================================
// CENTRAL EDIT MODAL INJECTOR ENGINE (WITH ISOLATED RENDER WRAPPERS)
// ==========================================================================

function showChapterEditModal(chapterName) {
  const modalOverlay = document.getElementById("modal-overlay");
  const modalContent = document.getElementById("modal-content");

  if (!modalOverlay || !modalContent) {
    console.error("Critical System Error: Modal layout selectors missing in index.html");
    return;
  }

  const chapterData = window.appData.chapters[chapterName];
  if (!chapterData) {
    alert("Could not locate data for: " + chapterName);
    return;
  }

  const currentStatus = chapterData.status || "weak";
  const currentPriority = chapterData.priority || "medium";
  const currentPYQs = chapterData.pyq !== undefined ? chapterData.pyq : 0;
  const isAdv = chapterData.isAdvancedOnly === true;

  const rev1Checked = chapterData.revision1 === true;
  const rev2Checked = chapterData.revision2 === true;
  const rev3Checked = chapterData.revision3 === true;

  function renderMainEditView() {
    modalContent.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
        <div>
          <h3 style="margin:0; font-size:1.2rem; color:#fff;">Configure Chapter</h3>
          <p style="font-size:0.85rem; color:var(--accent); font-weight:bold; margin:4px 0 0 0;">${chapterName}</p>
        </div>
        <button id="modal-delete-trigger-btn" style="background:#2d1a22; color:var(--weak); padding:8px 12px; margin:0; font-size:0.9rem; border:1px solid rgba(255,91,91,0.2); border-radius:10px;" title="Delete Custom Chapter">🗑️</button>
      </div>

      <label style="font-size:0.8rem; font-weight:bold; opacity:0.8; margin-top:12px;">PREPARATION STATUS</label>
      <select id="edit-chapter-status" style="margin-top:5px; margin-bottom:12px;">
        <option value="weak" ${currentStatus === 'weak' ? 'selected' : ''}>❌ Weak</option>
        <option value="average" ${currentStatus === 'average' ? 'selected' : ''}>⚡ Average</option>
        <option value="strong" ${currentStatus === 'strong' ? 'selected' : ''}>🔥 Strong</option>
        <option value="mastered" ${currentStatus === 'mastered' ? 'selected' : ''}>🏆 Mastered</option>
      </select>

      <label style="font-size:0.8rem; font-weight:bold; opacity:0.8;">HIGH-YIELD WEIGHTED PRIORITY</label>
      <select id="edit-chapter-priority" style="margin-top:5px; margin-bottom:12px;">
        <option value="high" ${currentPriority === 'high' ? 'selected' : ''}>🔥 High Priority</option>
        <option value="medium" ${currentPriority === 'medium' ? 'selected' : ''}>⚡ Medium Priority</option>
        <option value="low" ${currentPriority === 'low' ? 'selected' : ''}>❄️ Low Priority</option>
      </select>

      <label style="font-size:0.8rem; font-weight:bold; opacity:0.8;">TOTAL PYQs SOLVED</label>
      <input type="number" id="edit-chapter-pyq" value="${currentPYQs}" min="0" style="margin-top:5px; margin-bottom:12px;">

      <label style="font-size:0.8rem; font-weight:bold; opacity:0.8; margin-bottom:4px;">REVISION MILESTONES</label>
      <div style="background:var(--card2); padding:10px 14px; border-radius:14px; display:flex; flex-direction:column; gap:10px; margin-bottom:12px;">
        <div class="checkbox-row" style="margin:0;">
          <input type="checkbox" id="edit-chapter-rev1" ${rev1Checked ? 'checked' : ''}>
          <span style="font-size:0.85rem;">🔄 Revision Stage 1 (Formula Check)</span>
        </div>
        <div class="checkbox-row" style="margin:0;">
          <input type="checkbox" id="edit-chapter-rev2" ${rev2Checked ? 'checked' : ''}>
          <span style="font-size:0.85rem;">🔄 Revision Stage 2 (Timed Drilling)</span>
        </div>
        <div class="checkbox-row" style="margin:0;">
          <input type="checkbox" id="edit-chapter-rev3" ${rev3Checked ? 'checked' : ''}>
          <span style="font-size:0.85rem;">🔄 Revision Stage 3 (PYQ Clean-up)</span>
        </div>
      </div>

      <div class="checkbox-row" style="margin-top:5px; margin-bottom:20px;">
        <input type="checkbox" id="edit-chapter-adv-only" ${isAdv ? 'checked' : ''}>
        <span style="font-size:0.85rem;">Tag as Core JEE Advanced Exclusive Unit</span>
      </div>

      <div class="action-row" style="display:flex; gap:10px;">
        <button id="modal-close-btn" style="background:var(--card2); box-shadow:none; margin:0;">Cancel</button>
        <button id="modal-save-btn" style="margin:0;">Save Parameters</button>
      </div>
    `;

    document.getElementById("modal-close-btn").onclick = () => {
      modalOverlay.style.display = "none";
    };

    document.getElementById("modal-delete-trigger-btn").onclick = () => {
      renderInbuiltConfirmDeleteView();
    };

    document.getElementById("modal-save-btn").onclick = () => {
      const nextStatus = document.getElementById("edit-chapter-status").value;
      const nextPriority = document.getElementById("edit-chapter-priority").value;
      const nextPYQs = parseInt(document.getElementById("edit-chapter-pyq").value, 10) || 0;
      const nextAdvFlag = document.getElementById("edit-chapter-adv-only").checked;

      const nextRev1 = document.getElementById("edit-chapter-rev1").checked;
      const nextRev2 = document.getElementById("edit-chapter-rev2").checked;
      const nextRev3 = document.getElementById("edit-chapter-rev3").checked;

      window.appData.chapters[chapterName].status = nextStatus;
      window.appData.chapters[chapterName].priority = nextPriority;
      window.appData.chapters[chapterName].pyq = nextPYQs;
      window.appData.chapters[chapterName].isAdvancedOnly = nextAdvFlag;
      window.appData.chapters[chapterName].revision1 = nextRev1;
      window.appData.chapters[chapterName].revision2 = nextRev2;
      window.appData.chapters[chapterName].revision3 = nextRev3;

      if (nextStatus === "mastered" || nextStatus === "strong") {
        window.appData.chapters[chapterName].lastRevised = getCleanStringDate(365); 
      } else {
        window.appData.chapters[chapterName].lastRevised = getCleanStringDate(); 
      }

      // FIXED: Run systematic storage commit so parent keys preserve tracking states
      if (typeof window.saveData === "function") {
        window.saveData();
      } else {
        localStorage.setItem("jee_nexus_master_db", JSON.stringify(window.appData));
      }

      modalOverlay.style.display = "none";

      // FIXED: Safeguard downstream render nodes via runtime interception blocks
      try { renderChapterGrid(); } catch(e){}
      try { if (typeof window.renderStatusCounts === "function") window.renderStatusCounts(); } catch(e){}
      try { if (typeof window.renderPrepIndex === "function") window.renderPrepIndex(); } catch(e){}
      try { if (typeof window.renderSubjectProgress === "function") window.renderSubjectProgress(); } catch(e){}
      try { if (typeof window.renderLowestPYQList === "function") window.renderLowestPYQList(); } catch(e){}
      try { if (typeof window.renderMasterDirectory === "function") window.renderMasterDirectory(); } catch(e){}
      try { if (typeof window.renderBacklogRevision === "function") window.renderBacklogRevision(); } catch(e){}
    };
  }

  function renderInbuiltConfirmDeleteView() {
    modalContent.innerHTML = `
      <div style="text-align:center; padding:10px 5px;">
        <div style="font-size:2.5rem; margin-bottom:12px;">⚠️</div>
        <h3 style="color:var(--weak); font-size:1.25rem; margin-bottom:6px;">Danger Zone Confirmation</h3>
        <p style="font-size:0.9rem; opacity:0.85; line-height:1.4; color:#e2e8f0; margin-bottom:20px;">
          Are you absolutely sure you want to permanently delete <br><strong style="color:#fff;">"${chapterName}"</strong> from your database? This metric action cannot be undone.
        </p>
        
        <div style="display:flex; flex-direction:column; gap:8px;">
          <button id="inbuilt-confirm-delete-btn" style="background:var(--weak); margin:0; width:100%; padding:12px;">Yes, Delete Permanently</button>
          <button id="inbuilt-cancel-delete-btn" style="background:var(--card2); box-shadow:none; margin:0; width:100%; padding:12px;">No, Keep Chapter</button>
        </div>
      </div>
    `;

    document.getElementById("inbuilt-cancel-delete-btn").onclick = () => {
      renderMainEditView(); 
    };

    document.getElementById("inbuilt-confirm-delete-btn").onclick = () => {
      delete window.appData.chapters[chapterName];

      if (typeof window.saveData === "function") {
        window.saveData();
      } else {
        localStorage.setItem("jee_nexus_master_db", JSON.stringify(window.appData));
      }

      modalOverlay.style.display = "none";

      try { renderChapterGrid(); } catch(e){}
      try { if (typeof window.renderStatusCounts === "function") window.renderStatusCounts(); } catch(e){}
      try { if (typeof window.renderPrepIndex === "function") window.renderPrepIndex(); } catch(e){}
      try { if (typeof window.renderSubjectProgress === "function") window.renderSubjectProgress(); } catch(e){}
      try { if (typeof window.renderLowestPYQList === "function") window.renderLowestPYQList(); } catch(e){}
      try { if (typeof window.renderMasterDirectory === "function") window.renderMasterDirectory(); } catch(e){}
      try { if (typeof window.renderBacklogRevision === "function") window.renderBacklogRevision(); } catch(e){}
    };
  }

  modalOverlay.style.display = "flex";
  renderMainEditView();
}

window.renderChapterGrid = renderChapterGrid;
window.updateAdvancedTrackerMetric = updateAdvancedTrackerMetric;
window.showChapterEditModal = showChapterEditModal;
