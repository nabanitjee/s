// ==========================================================================
// JEE NEXUS IMPORT / EXPORT UTILITY LAYER (KEY ALIGNED)
// ==========================================================================

const BACKUP_STORAGE_KEY = "jee_nexus_master_db"; // 👈 EXACT MATCH TO APP.JS

function initBackupSystem() {
  const expBtn = document.getElementById("export-btn");
  const impBtn = document.getElementById("import-btn");

  if (expBtn) {
    expBtn.onclick = function() { triggerDataExport(); };
  }
  if (impBtn) {
    impBtn.onclick = function() { showImportFormOverlay(); };
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBackupSystem);
} else {
  initBackupSystem();
}

// ==========================================================================
// EXPORT PIPELINE
// ==========================================================================
function triggerDataExport() {
  try {
    const dataToExport = window.appData || appData;
    if (!dataToExport) {
      alert("Error: Core database not found in memory layer.");
      return;
    }

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(blob);

    const tempLink = document.createElement("a");
    const stamp = new Date().toISOString().split("T")[0];

    tempLink.href = downloadUrl;
    tempLink.download = `JEE_NEXUS_BACKUP_${stamp}.json`;
    document.body.appendChild(tempLink);
    tempLink.click();

    document.body.removeChild(tempLink);
    URL.revokeObjectURL(downloadUrl);
  } catch (err) {
    alert("Export failed: " + err.message);
  }
}

// ==========================================================================
// IMPORT OVERLAY VIEW
// ==========================================================================
function showImportFormOverlay() {
  const formHTML = `
    <div class="modal-form-container" style="font-family:sans-serif; color:#fff; padding:5px; text-align: left;">
      <h3 style="margin-top:0; color:var(--accent); font-weight:900;">IMPORT RESTORE CAPTURE</h3>
      <p style="font-size:0.85rem; opacity:0.7; margin-bottom:15px; color:var(--weak);">⚠️ Warning: This overrides your current stats completely.</p>
      
      <div style="border: 2px dashed #1b2d57; padding: 20px; border-radius: 14px; text-align: center; background:#081224; margin-bottom: 12px;">
        <label for="file-upload-input" style="cursor:pointer; font-weight:bold; color:var(--accent); margin:0; display:block; width:100%;">📁 SELECT JSON BACKUP FILE</label>
        <input type="file" id="file-upload-input" accept=".json" style="display:none;" onchange="handleBackupFileSelect(event)">
        <div id="file-upload-name" style="font-size:0.8rem; margin-top:6px; opacity:0.5; color:#fff;">No File Chosen</div>
      </div>
      
      <div style="text-align:center; margin:10px 0; font-size:0.75rem; opacity:0.4; font-weight:bold; letter-spacing:1px;">- OR PASTE TEXT CODE STREAM -</div>
      
      <div>
        <textarea id="raw-json-paste" placeholder="Paste your saved export text string right here..." style="font-size:0.85rem; height:90px; background:#1b2d57; border:none; border-radius:12px; padding:12px; color:#fff; width:100%; box-sizing:border-box; margin-top:5px; margin-bottom:15px;"></textarea>
      </div>
      
      <div class="action-row" style="margin-top:15px; display:flex; gap:10px;">
        <button onclick="if(typeof window.closeQuestSystemModal === 'function'){ window.closeQuestSystemModal(); } else if(typeof hideModal === 'function'){ hideModal(); }" style="background:#475569; margin:0; padding:12px 16px; flex:1; border:none; color:#fff; border-radius:8px; cursor:pointer; font-weight:bold;">Cancel</button>
        <button onclick="window.processDataImportSubmit()" style="background:#b91c1c; margin:0; padding:12px 16px; font-weight:bold; flex:1; border:none; color:#fff; border-radius:8px; cursor:pointer;">Override & Restore</button>
      </div>
    </div>
  `;

  if (typeof window.openQuestSystemModal === "function") {
    window.openQuestSystemModal(formHTML);
  } else if (typeof window.showModal === "function") {
    window.showModal(formHTML);
  } else if (typeof showModal === "function") {
    showModal(formHTML);
  } else {
    const overlay = document.getElementById("modal-overlay");
    const contentBox = document.getElementById("modal-content");
    if (overlay && contentBox) {
      contentBox.innerHTML = formHTML;
      overlay.style.display = "flex";
    }
  }
}

function handleBackupFileSelect(event) {
  const file = event.target.files[0];
  const label = document.getElementById("file-upload-name");
  if (file && label) {
    label.innerText = `Selected: ${file.name}`;

    const fileReader = new FileReader();
    fileReader.onload = function(e) {
      const area = document.getElementById("raw-json-paste");
      if (area) area.value = e.target.result;
    };
    fileReader.readAsText(file);
  }
}

function processDataImportSubmit() {
  const codeArea = document.getElementById("raw-json-paste");
  if (!codeArea) return;

  const parsedText = codeArea.value.trim();
  if (!parsedText) { 
    alert("Please upload a backup file or paste your code string first!"); 
    return; 
  }

  try {
    let freshData = JSON.parse(parsedText);

    if (freshData.chapters || freshData.mocks || freshData.journal) {

      // Failsafe schema structure patch check metrics
      if (!freshData.dailyQuest) {
        freshData.dailyQuest = { task1: "", task2: "", task3: "", done1: false, done2: false, done3: false };
      }
      if (!freshData.activeMissionsList) freshData.activeMissionsList = [];
      if (!freshData.completedMissionsLog) freshData.completedMissionsLog = [];
      if (!freshData.clat) freshData.clat = [];
      if (!freshData.futureNotes) freshData.futureNotes = [];
      if (freshData.streak === undefined) freshData.streak = 0;

      // Force instant hard synchronization right onto master configurations space
      window.appData = freshData;
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(freshData));

      if (typeof window.closeQuestSystemModal === "function") window.closeQuestSystemModal();
      else if (typeof window.hideModal === "function") window.hideModal();
      else if (typeof hideModal === "function") hideModal();

      alert("Database Synchronized & Restored Successfully! Rebooting Nexus Workspace...");
      window.location.reload();
    } else {
      alert("Invalid File Format: This text block is missing vital JEE tracking arrays.");
    }
  } catch (error) {
    alert("Parse Failure: The text code data you pasted is corrupted or incomplete.");
  }
}

window.handleBackupFileSelect = handleBackupFileSelect;
window.processDataImportSubmit = processDataImportSubmit;
window.initBackupSystem = initBackupSystem;
