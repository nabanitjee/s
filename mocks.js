// ==========================================================================
// MOCK PERFORMANCE SYSTEM V4 (WITH INSTANT DASHBOARD RE-RENDERING)
// ==========================================================================

let performanceCharts = {};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("add-mock-btn")?.addEventListener("click", () => showMockForm());

  document.querySelectorAll(".bottom-nav button").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.page === "mock-page") {
        setTimeout(() => { initMockCharts(); }, 50);
      }
    });
  });

  refreshMockUI();
});

function refreshMockUI() {
  renderMocks();
  renderLatestMock();
  renderMockAnalytics();
  initMockCharts();
}

function showMockForm(mockId = null) {
  const isEdit = mockId !== null && typeof mockId !== 'object';
  let mock = { examName: "", maxMarks: 300, physics: "", chemistry: "", maths: "", remarks: "", errorLog: "" };

  // Safety fallback allocation checks
  if (!window.appData) window.appData = { mocks: [] };
  if (!window.appData.mocks) window.appData.mocks = [];

  if (isEdit) {
    const found = window.appData.mocks.find(m => m.id === Number(mockId));
    if (found) mock = found;
  }

  const formHTML = `
    <div class="form-container" style="padding:10px; color:#fff; font-family:sans-serif;">
      <h3 style="margin-top:0; color:var(--accent);">${isEdit ? "Edit Mock Test Record" : "Enter New Mock Score"}</h3>
      <hr style="border:0; border-top:1px solid #334; margin-bottom:15px;">
      
      <div style="margin-bottom:12px;">
        <label style="display:block; margin-bottom:5px; font-size:0.9em;">Exam / Mock Title</label>
        <input type="text" id="f-name" value="${mock.examName}" placeholder="e.g. Allen AIOT 1" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box;">
      </div>

      <div style="margin-bottom:12px;">
        <label style="display:block; margin-bottom:5px; font-size:0.9em;">Maximum Marks</label>
        <input type="number" id="f-max" value="${mock.maxMarks}" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box;">
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:12px;">
        <div>
          <label style="display:block; margin-bottom:5px; font-size:0.85em; color:var(--weak);">Physics</label>
          <input type="number" id="f-p" value="${mock.physics}" placeholder="0" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box;">
        </div>
        <div>
          <label style="display:block; margin-bottom:5px; font-size:0.85em; color:var(--average);">Chemistry</label>
          <input type="number" id="f-c" value="${mock.chemistry}" placeholder="0" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box;">
        </div>
        <div>
          <label style="display:block; margin-bottom:5px; font-size:0.85em; color:var(--accent);">Maths</label>
          <input type="number" id="f-m" value="${mock.maths}" placeholder="0" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box;">
        </div>
      </div>

      <div style="margin-bottom:12px;">
        <label style="display:block; margin-bottom:5px; font-size:0.9em;">General Remarks</label>
        <input type="text" id="f-remarks" value="${mock.remarks}" placeholder="How did it go?" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box;">
      </div>

      <div style="margin-bottom:18px;">
        <label style="display:block; margin-bottom:5px; font-size:0.9em;">Major Mistakes (Error Log)</label>
        <textarea id="f-errors" placeholder="Conceptual or silly errors..." style="width:100%; height:60px; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box; resize:vertical;">${mock.errorLog}</textarea>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button onclick="if(typeof hideModal === 'function'){ hideModal(); } else { document.getElementById('modal-overlay').style.display='none'; }" style="background:#475569; margin:0;">Cancel</button>
        <button onclick="processMockFormSubmit(${isEdit ? mock.id : null})" style="background:var(--accent); margin:0; font-weight:bold;">Save Entry</button>
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

function processMockFormSubmit(existingId = null) {
  if (!window.appData) window.appData = { mocks: [] };
  if (!window.appData.mocks) window.appData.mocks = [];

  const name = document.getElementById("f-name").value.trim() || "Untitled Mock";
  const max = Number(document.getElementById("f-max").value) || 300;
  const p = Number(document.getElementById("f-p").value) || 0;
  const c = Number(document.getElementById("f-c").value) || 0;
  const m = Number(document.getElementById("f-m").value) || 0;
  const rem = document.getElementById("f-remarks").value.trim();
  const err = document.getElementById("f-errors").value.trim();
  const calcTotal = p + c + m;

  if (existingId) {
    const item = window.appData.mocks.find(mock => mock.id === existingId);
    if (item) {
      item.examName = name; item.maxMarks = max;
      item.physics = p; item.chemistry = c; item.maths = m;
      item.total = calcTotal; item.remarks = rem; item.errorLog = err;
    }
  } else {
    window.appData.mocks.push({
      id: Date.now(), date: new Date().toISOString().split("T")[0],
      examName: name, maxMarks: max, physics: p, chemistry: c, maths: m,
      total: calcTotal, remarks: rem, errorLog: err
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

  refreshMockUI();

  // CRITICAL HOT FIX: Update dashboard metrics layout immediately on save
  if (typeof window.fullyTriggerUIRefresh === "function") {
    window.fullyTriggerUIRefresh();
  }
}

function deleteMock(id) {
  window.appData.mocks = window.appData.mocks.filter(mock => mock.id !== id);

  if (typeof window.saveData === "function") {
    window.saveData();
  } else {
    localStorage.setItem("jee_nexus_master_db", JSON.stringify(window.appData));
  }

  refreshMockUI();

  if (typeof window.fullyTriggerUIRefresh === "function") {
    window.fullyTriggerUIRefresh();
  }
}

function editMock(id) { showMockForm(id); }

function renderLatestMock() {
  const box = document.getElementById("latest-mock");
  if (!box) return;

  const baseList = (window.appData && window.appData.mocks) ? window.appData.mocks : [];

  if (baseList.length === 0) {
    box.innerHTML = "No mocks added yet.";
    return;
  }

  const latest = baseList[baseList.length - 1];
  box.innerHTML = `
    <strong>${latest.examName}</strong>: ${latest.total} / ${latest.maxMarks}<br>
    <small style="opacity:0.8;">P: ${latest.physics} | C: ${latest.chemistry} | M: ${latest.maths}</small>
  `;
}

function renderMocks() {
  const container = document.getElementById("mock-list");
  if (!container) return;

  let html = "";
  const baseList = (window.appData && window.appData.mocks) ? window.appData.mocks : [];
  const sorted = [...baseList].sort((a, b) => b.id - a.id);

  sorted.forEach(mock => {
    html += `
      <div class="mock-card">
        <h3 style="color:var(--accent); margin-bottom:4px;">${mock.examName}</h3>
        <p style="font-size:0.85em; opacity:0.6; margin-bottom:6px;">📅 ${mock.date}</p>
        <p style="font-weight:bold;">🎯 Score: ${mock.total} / ${mock.maxMarks} (${Math.round((mock.total / mock.maxMarks) * 100)}%)</p>
        <div style="font-size:0.9em; margin:6px 0; display:flex; gap:12px;">
          <span>P: <strong style="color:var(--weak);">${mock.physics}</strong></span>
          <span>C: <strong style="color:var(--average);">${mock.chemistry}</strong></span>
          <span>M: <strong style="color:var(--mastered);">${mock.maths}</strong></span>
        </div>
        ${mock.remarks ? `<p style="font-size:0.85rem; opacity:0.8; margin:2px 0;">📝 Remarks: ${mock.remarks}</p>` : ""}
        ${mock.errorLog ? `<p style="font-size:0.85rem; color:#ffa3a3; margin:2px 0;">⚠️ Mistakes: ${mock.errorLog}</p>` : ""}
        <div class="action-row" style="margin-top:10px;">
          <button onclick="editMock(${mock.id})" style="background:var(--card2);">Edit</button>
          <button onclick="deleteMock(${mock.id})" style="background:#b91c1c;">Delete</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html || `<div class="card" style="opacity:0.5; text-align:center; padding:20px;">No Mock Tests Added</div>`;
}

function getSubjectAverage(subjectKey) {
  const baseList = (window.appData && window.appData.mocks) ? window.appData.mocks : [];
  if (baseList.length === 0) return 0;
  const sum = baseList.reduce((acc, m) => {
    const score = m[subjectKey] !== undefined ? m[subjectKey] : (m[subjectKey.toLowerCase()] || 0);
    return acc + score;
  }, 0);
  return Math.round(sum / baseList.length);
}

function getAverageMockScore() {
  const baseList = (window.appData && window.appData.mocks) ? window.appData.mocks : [];
  if (baseList.length === 0) return 0;
  return Math.round(baseList.reduce((sum, m) => sum + m.total, 0) / baseList.length);
}

function getBestMockScore() {
  const baseList = (window.appData && window.appData.mocks) ? window.appData.mocks : [];
  if (baseList.length === 0) return 0;
  return Math.max(...baseList.map(m => m.total));
}

function getLatestMockTrend() {
  const baseList = (window.appData && window.appData.mocks) ? window.appData.mocks : [];
  if (baseList.length < 2) return "No Trend";
  const latest = baseList[baseList.length - 1];
  const previous = baseList[baseList.length - 2];
  const diff = latest.total - previous.total;
  return diff > 0 ? `📈 +${diff}` : diff < 0 ? `📉 ${diff}` : "➖ 0";
}

function renderMockAnalytics() {
  const avg = document.getElementById("avg-mock-score");
  const best = document.getElementById("best-mock-score");
  const trend = document.getElementById("mock-trend");
  const pAvg = document.getElementById("avg-p-score");
  const cAvg = document.getElementById("avg-c-score");
  const mAvg = document.getElementById("avg-m-score");

  if (avg) avg.textContent = getAverageMockScore();
  if (best) best.textContent = getBestMockScore();
  if (trend) trend.textContent = getLatestMockTrend();
  if (pAvg) pAvg.textContent = getSubjectAverage("physics");
  if (cAvg) cAvg.textContent = getSubjectAverage("chemistry");
  if (mAvg) mAvg.textContent = getSubjectAverage("maths");
}

function buildSingleChart(ctxId, labelText, dataPoints, strokeColor) {
  const canvas = document.getElementById(ctxId);
  if (!canvas) return;

  if (performanceCharts[ctxId]) { performanceCharts[ctxId].destroy(); }

  const baseList = (window.appData && window.appData.mocks) ? window.appData.mocks : [];
  const orderedData = [...baseList].sort((a, b) => a.id - b.id);

  performanceCharts[ctxId] = new Chart(canvas, {
    type: 'line',
    data: {
      labels: orderedData.map(m => m.date),
      datasets: [{
        label: labelText, data: orderedData.map(m => dataPoints(m)),
        borderColor: strokeColor, backgroundColor: strokeColor + '15',
        borderWidth: 2, tension: 0.2, fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#fff' } } },
      scales: {
        x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

function initMockCharts() {
  const baseList = (window.appData && window.appData.mocks) ? window.appData.mocks : [];
  if (typeof Chart === "undefined" || baseList.length === 0) return;
  buildSingleChart('chart-overall', 'Overall Score History', m => m.total, '#4f8cff');
  buildSingleChart('chart-physics', 'Physics History', m => m.physics || m.Physics || 0, 'var(--weak)');
  buildSingleChart('chart-chemistry', 'Chemistry History', m => m.chemistry || m.Chemistry || 0, 'var(--average)');
  buildSingleChart('chart-maths', 'Mathematics History', m => m.maths || m.Maths || 0, 'var(--strong)');
}

// Global mapping hooks
window.showAddMockModal = showMockForm;

window.initMockCharts = initMockCharts;
window.renderMocks = renderMocks;
window.renderLatestMock = renderLatestMock;
window.renderMockAnalytics = renderMockAnalytics;
// ==========================================================================
// ADDITION: CONCENTRATED MISTAKE REPOSITORY SYSTEM
// ==========================================================================

function compileMistakeRepository() {
  const overlay = document.getElementById("modal-overlay");
  const contentBox = document.getElementById("modal-content");

  if (!overlay || !contentBox) {
    console.error("Layout target selectors missing in index.html");
    return;
  }

  const baseMocks = (window.appData && window.appData.mocks) ? window.appData.mocks : [];

  // Filter for mocks that actually have logged mistakes
  const mocksWithErrors = baseMocks.filter(m => m.errorLog && m.errorLog.trim() !== "");

  let repositoryHTML = `
    <div class="form-container" style="padding:10px; color:#fff; font-family:sans-serif; text-align:left;">
      <div style="display:flex; justify-content:between; align-items:center; margin-bottom:10px;">
        <h3 style="margin:0; color:#ffa3a3; font-weight:900;">📋 CONCENTRATED MISTAKE REPOSITORY</h3>
      </div>
      <p style="font-size:0.82rem; opacity:0.6; margin-top:4px; margin-bottom:15px; line-height:1.4;">
        A consolidated feed of all conceptual pitfalls and silly errors logged across your custom mock series. Review these before your next test to prevent repeating them.
      </p>
      <hr style="border:0; border-top:1px solid #334; margin-bottom:15px;">
      
      <div style="max-height:320px; overflow-y:auto; padding-right:4px; display:flex; flex-direction:column; gap:12px;">
  `;

  if (mocksWithErrors.length === 0) {
    repositoryHTML += `
      <div style="text-align:center; padding:30px 10px; opacity:0.5; font-size:0.9rem; font-style:italic; line-height:1.5;">
        ✨ No flaws or mistakes flagged in your mock logs yet! <br>
        When you add or edit a mock test score, use the "Major Mistakes" field to populate this review log.
      </div>
    `;
  } else {
    // Render each test mistake log block
    mocksWithErrors.forEach(mock => {
      repositoryHTML += `
        <div style="background:rgba(255,163,163,0.04); border-left:4px solid #ffa3a3; padding:10px 14px; border-radius:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <strong style="color:#fff; font-size:0.92rem;">${mock.examName}</strong>
            <span style="font-size:0.75rem; opacity:0.5;">📅 ${mock.date}</span>
          </div>
          <div style="font-size:0.88rem; color:#e2e8f0; white-space:pre-wrap; line-height:1.4; background:rgba(0,0,0,0.15); padding:8px; border-radius:6px;">${mock.errorLog}</div>
          <div style="font-size:0.75rem; opacity:0.5; margin-top:6px;">
            Test Score: <strong>${mock.total} / ${mock.maxMarks}</strong> (P: ${mock.physics} | C: ${mock.chemistry} | M: ${mock.maths})
          </div>
        </div>
      `;
    });
  }

  repositoryHTML += `
      </div>
      
      <div style="margin-top:20px; display:flex; justify-content:flex-end;">
        <button onclick="if(typeof hideModal === 'function'){ hideModal(); } else { document.getElementById('modal-overlay').style.display='none'; }" style="background:#475569; margin:0; width:100%; padding:12px; font-weight:bold;">Close Repository</button>
      </div>
    </div>
  `;

  // Display the modal frame
  contentBox.innerHTML = repositoryHTML;
  overlay.style.display = "flex";
}

// Bind directly to the global window object so index.html's inline onclick attribute can see it
window.compileMistakeRepository = compileMistakeRepository;
