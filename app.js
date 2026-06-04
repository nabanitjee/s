// ==========================================================================
// JEE NEXUS CENTRAL APPLICATION CORE ENGINE (SUPABASE CLOUD EDITION)
// ==========================================================================

const SUPABASE_URL = "https://cfiepdxmtojapbryhxzd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_GCKQ1aIwGxqAzmGQ7dXidw_W6OaSQlV";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const USER_ID_KEY = "jee_nexus_master"; 

window.appData = {
  jeeMainDate: "2027-01-01",
  jeeAdvancedDate: "",
  chapters: {},
  journal: [],
  mocks: [],
  clat: [],
  futureNotes: [],
  streak: 0,
  lastActivityDate: "",
  dailyQuest: { task1: "", task2: "", task3: "", done1: false, done2: false, done3: false }, 
  activeMissionsList: [],      
  completedMissionsLog: [],    
  widgetVisibility: {
    mission: true,
    future: true,
    clat: true,
    quest: true
  },
  currentTheme: "theme-blue",
  lastActiveTab: "dashboard-page"
};

// 1. Cloud Storage Core Communication Drivers
async function saveData() {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({ 
        id: USER_ID_KEY, 
        app_data: window.appData,
        updated_at: new Date().toISOString()
      });
      
    if (error) throw error;
    console.log("📊 Cloud Sync Complete: Database profile safely captured upstream.");
  } catch (err) {
    console.error("❌ Cloud sync connection failed. Archiving backup snapshot locally:", err);
    localStorage.setItem("jee_nexus_master_db", JSON.stringify(window.appData));
  }
}

async function loadData() {
  try {
    console.log("🔄 Initializing cloud handshake with Supabase query blocks...");
    const { data, error } = await supabase
      .from('user_profiles')
      .select('app_data')
      .eq('id', USER_ID_KEY)
      .maybeSingle(); 

    if (!data || error) {
      console.log("⚠️ No active cloud sync profile discovered. Commencing local migration audit...");
      const localRaw = localStorage.getItem("jee_nexus_master_db");
      
      if (localRaw) {
        console.log("🚚 Legacy client history found! Moving chapter properties to cloud array instantly...");
        const parsedLocal = JSON.parse(localRaw);
        if (parsedLocal) {
          Object.assign(window.appData, parsedLocal);
          await saveData(); 
          return;
        }
      }
      console.log("🎯 Fresh cloud initialization confirmed. App structure running default parameters.");
      return;
    }

    const cloudData = data.app_data;
    if (cloudData) {
      window.appData.jeeMainDate = cloudData.jeeMainDate || "2027-01-01";
      window.appData.jeeAdvancedDate = cloudData.jeeAdvancedDate || "";
      window.appData.chapters = cloudData.chapters || {};
      window.appData.journal = cloudData.journal || [];
      window.appData.mocks = cloudData.mocks || [];
      window.appData.clat = cloudData.clat || [];
      window.appData.futureNotes = cloudData.futureNotes || [];
      window.appData.streak = cloudData.streak !== undefined ? cloudData.streak : 0;
      window.appData.lastActivityDate = cloudData.lastActivityDate || "";
      window.appData.dailyQuest = cloudData.dailyQuest || { task1: "", task2: "", task3: "", done1: false, done2: false, done3: false }; 
      window.appData.activeMissionsList = cloudData.activeMissionsList || []; 
      window.appData.completedMissionsLog = cloudData.completedMissionsLog || []; 
      window.appData.currentTheme = cloudData.currentTheme || "theme-blue";
      window.appData.lastActiveTab = cloudData.lastActiveTab || "dashboard-page";

      if (cloudData.widgetVisibility) {
        window.appData.widgetVisibility.mission = cloudData.widgetVisibility.mission !== false;
        window.appData.widgetVisibility.future = cloudData.widgetVisibility.future !== false;
        window.appData.widgetVisibility.clat = cloudData.widgetVisibility.clat !== false;
        window.appData.widgetVisibility.quest = cloudData.widgetVisibility.quest !== false;
      }
      console.log("✅ Cloud Sync Active. Data models fully populated from Supabase cluster.");
    }
  } catch (e) {
    console.error("💥 Cloud engine fault tree trigger. Deploying local recovery array fallback:", e);
    const fallbackRaw = localStorage.getItem("jee_nexus_master_db");
    if (fallbackRaw) Object.assign(window.appData, JSON.parse(fallbackRaw));
  }
}

// 2. Countdown Matrix Calculations Engine
function updateCountdowns() {
  const mainLabel = document.getElementById("jee-main-countdown");
  const advLabel = document.getElementById("jee-advanced-countdown");
  const today = new Date().getTime();

  if (mainLabel && window.appData.jeeMainDate) {
    const targetMain = new Date(window.appData.jeeMainDate).getTime();
    const diffMain = targetMain - today;
    mainLabel.textContent = diffMain > 0 ? Math.ceil(diffMain / (1000 * 60 * 60 * 24)) + " Days" : "Released";
  }

  if (advLabel && window.appData.jeeAdvancedDate) {
    const targetAdv = new Date(window.appData.jeeAdvancedDate).getTime();
    const diffAdv = targetAdv - today;
    advLabel.textContent = diffAdv > 0 ? Math.ceil(diffAdv / (1000 * 60 * 60 * 24)) + " Days" : "Passed/TBD";
  }
}

// 3. Drop Day Counter Logic
function renderDropDay() {
  const el = document.getElementById("drop-day");
  if (!el) return;
  const start = new Date("2026-06-05"); 
  const today = new Date();
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  el.textContent = diff >= 0 ? diff + 1 : 0;
}

// 4. Core System Global Metrics Calculation Engines
function renderStatusCounts() {
  const elements = {
    weak: document.getElementById("weak-count"),
    average: document.getElementById("average-count"),
    strong: document.getElementById("strong-count"),
    mastered: document.getElementById("mastered-count")
  };

  const counts = { weak: 0, average: 0, strong: 0, mastered: 0 };
  Object.values(window.appData.chapters || {}).forEach(ch => {
    if (ch && counts[ch.status] !== undefined) counts[ch.status]++;
  });

  Object.keys(elements).forEach(key => {
    if (elements[key]) elements[key].textContent = counts[key];
  });
}

function renderPrepIndex() {
  const bar = document.getElementById("prep-progress");
  const text = document.getElementById("prep-percent");
  if (!bar || !text) return;

  const chapters = Object.values(window.appData.chapters || {});
  if (chapters.length === 0) return;

  let totalScore = 0;
  chapters.forEach(ch => {
    if (ch.status === "weak") totalScore += 10;
    if (ch.status === "average") totalScore += 50;
    if (ch.status === "strong") totalScore += 75;
    if (ch.status === "mastered") totalScore += 100;
  });

  const percent = Math.round(totalScore / chapters.length);
  bar.style.width = percent + "%";
  text.textContent = percent + "%";
}

// 📊 NEON PROGRESS CIRCLE CARD ENGINE
function renderTotalPYQsAndMilestones() {
  const centralCardBtn = document.getElementById("nexus-pyq-card-button");
  const counterDisplay = document.getElementById("dashboard-pyq-counter-value");
  const tierEmojiDisplay = document.getElementById("dashboard-pyq-tier-emoji");
  const tierTitleDisplay = document.getElementById("dashboard-pyq-tier-title");
  const progressRing = document.getElementById("dashboard-pyq-progress-ring");

  if (!centralCardBtn || !counterDisplay) return;

  let totalPYQs = 0;
  Object.values(window.appData.chapters || {}).forEach(ch => {
    if (ch) {
      const rawVal = ch.pyq !== undefined ? ch.pyq : ch.pyqs;
      if (rawVal !== undefined && rawVal !== null) {
        const parsedCount = parseInt(rawVal, 10);
        if (!isNaN(parsedCount)) totalPYQs += parsedCount;
      }
    }
  });

  let rankEmoji = "3️⃣";
  let rankTitle = "Rookie";
  let themeColor = "#38bdf8"; 

  if (totalPYQs >= 600) { rankEmoji = "👑"; rankTitle = "Nexus God"; themeColor = "#f59e0b"; } 
  else if (totalPYQs >= 350) { rankEmoji = "⚡"; rankTitle = "Monster"; themeColor = "#ef4444"; } 
  else if (totalPYQs >= 200) { rankEmoji = "🥇"; rankTitle = "Slayer"; themeColor = "#10b981"; } 
  else if (totalPYQs >= 50) { rankEmoji = "🥈"; rankTitle = "Grinder"; themeColor = "#a855f7"; } 

  counterDisplay.textContent = totalPYQs;
  if (tierEmojiDisplay) tierEmojiDisplay.textContent = rankEmoji;
  if (tierTitleDisplay) {
    tierTitleDisplay.textContent = rankTitle;
    tierTitleDisplay.style.color = themeColor;
  }

  if (progressRing) {
    const targetStep = 50;
    const progressToNext = totalPYQs % targetStep;
    const radius = 26;
    const circumference = 2 * Math.PI * radius; 

    const offsetValue = circumference - (progressToNext / targetStep) * circumference;
    progressRing.style.stroke = themeColor;
    progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
    progressRing.style.strokeDashoffset = offsetValue;

    centralCardBtn.style.boxShadow = `0 4px 20px rgba(0, 0, 0, 0.3), 0 0 12px ${themeColor}15`;
    centralCardBtn.style.borderColor = `${themeColor}30`;
  }

  centralCardBtn.onclick = function(e) {
    e.stopPropagation();

    const targetStep = 50;
    const currentLevel = Math.floor(totalPYQs / targetStep);
    const nextMilestoneTarget = (currentLevel + 1) * targetStep;
    const progressToNext = totalPYQs % targetStep;
    const percentageToNext = Math.min(100, Math.round((progressToNext / targetStep) * 100));

    let historicalRowsHTML = "";
    const stampDate = new Date().toISOString().split("T")[0];

    for (let i = 1; i <= 20; i++) {
      const milestoneValue = i * targetStep;
      const isCleared = totalPYQs >= milestoneValue;

      historicalRowsHTML += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 4px; border-bottom:1px solid rgba(255,255,255,0.04); opacity: ${isCleared ? '1' : '0.35'};">
          <div style="display:flex; align-items:center; gap:8px;">
            <span>${isCleared ? '🏆' : '🔒'}</span>
            <span style="font-size:0.85rem; font-weight:${isCleared ? 'bold' : 'normal'}; color:#fff;">Crushed ${milestoneValue} PYQs</span>
          </div>
          <span style="font-size:0.75rem; color:var(--accent); font-family:monospace;">${isCleared ? stampDate : '--'}</span>
        </div>`;
    }

    const modalHTML = `
      <div style="font-family:sans-serif; text-align:left; color:#fff;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
          <h3 style="margin:0; font-size:1.2rem; color:var(--accent); font-weight:900;">🏆 PYQ RANK METRICS</h3>
          <button onclick="document.getElementById('modal-overlay').style.display='none';" style="background:none; border:none; color:#fff; font-size:1.2rem; cursor:pointer; padding:0; margin:0;">✕</button>
        </div>
        <div style="background:#081224; border:1px solid rgba(255,255,255,0.06); padding:12px; border-radius:12px; margin-bottom:16px;">
          <div style="font-size:0.72rem; font-weight:bold; opacity:0.5; letter-spacing:1px; margin-bottom:6px;">ACTIVE TIER STATUS</div>
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">${rankEmoji}</span>
            <div>
              <h4 style="margin:0; font-size:1.15rem; font-weight:900; color:${themeColor};">${rankTitle}</h4>
              <p style="margin:2px 0 0 0; font-size:0.85rem; color:#94a3b8; font-weight:bold;">Total Solved: ${totalPYQs}</p>
            </div>
          </div>
        </div>
        <div style="margin-bottom:20px; background:rgba(255,255,255,0.02); padding:12px; border-radius:12px;">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:bold; margin-bottom:6px;">
            <span>Next Target: ${nextMilestoneTarget}</span>
            <span style="color:${themeColor};">${percentageToNext}%</span>
          </div>
          <div style="width:100%; height:8px; background:rgba(255,255,255,0.08); border-radius:10px; overflow:hidden;">
            <div style="width:${percentageToNext}%; height:100%; background:${themeColor}; border-radius:10px; transition:width 0.4s ease;"></div>
          </div>
          <div style="font-size:0.72rem; opacity:0.5; margin-top:4px; text-align:right;">${progressToNext} / ${targetStep} questions remaining</div>
        </div>
        <div style="margin-bottom:15px;">
          <div style="font-size:0.75rem; font-weight:bold; opacity:0.6; margin-bottom:8px; letter-spacing:0.5px;">RANK TIER MATRIX LEGEND</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:0.8rem; background:rgba(255,255,255,0.02); padding:10px; border-radius:10px;">
            <div style="opacity:${rankTitle==='Rookie'?'1':'0.5'}; font-weight:${rankTitle==='Rookie'?'bold':'normal'}; color:#38bdf8;">🏅 Rookie (0+)</div>
            <div style="opacity:${rankTitle==='Grinder'?'1':'0.5'}; font-weight:${rankTitle==='Grinder'?'bold':'normal'}; color:#a855f7;">🥈 Grinder (50+)</div>
            <div style="opacity:${rankTitle==='Slayer'?'1':'0.5'}; font-weight:${rankTitle==='Slayer'?'bold':'normal'}; color:#10b981;">🥇 Slayer (200+)</div>
            <div style="opacity:${rankTitle==='Monster'?'1':'0.5'}; font-weight:${rankTitle==='Monster'?'bold':'normal'}; color:#ef4444;">⚡ Monster (350+)</div>
            <div style="grid-column:span 2; opacity:${rankTitle==='Nexus God'?'1':'0.5'}; font-weight:${rankTitle==='Nexus God'?'bold':'normal'}; text-align:center; margin-top:4px; border-top:1px solid rgba(255,255,255,0.05); padding-top:4px; color:#f59e0b;">👑 Nexus God (600+)</div>
          </div>
        </div>
        <div style="max-height:160px; overflow-y:auto; padding-right:4px; background:rgba(0,0,0,0.15); padding:8px; border-radius:10px;">
          ${historicalRowsHTML}
        </div>
      </div>
    `;

    const overlay = document.getElementById("modal-overlay");
    const contentBox = document.getElementById("modal-content");
    if (overlay && contentBox) {
      contentBox.innerHTML = modalHTML;
      overlay.style.display = "flex";
    }
  };
}

// STREAK SUBSYSTEM ENGINE (UI PIPELINE MOUNTED)
function renderStreak() {
  const el = document.getElementById("study-streak");
  if (!el) return;
  el.textContent = window.appData.streak !== undefined ? window.appData.streak : 0;
}

// Active dynamic date milestone automation logic
function updateActivity() {
  if (!window.appData) return;

  const todayStr = new Date().toISOString().split("T")[0];
  if (window.appData.streak === undefined) window.appData.streak = 0;

  if (window.appData.lastActivityDate === todayStr) {
    renderStreak();
    return;
  }

  if (window.appData.lastActivityDate) {
    const lastDate = new Date(window.appData.lastActivityDate);
    const todayDate = new Date(todayStr);

    lastDate.setHours(0,0,0,0);
    todayDate.setHours(0,0,0,0);

    const diffTime = Math.abs(todayDate - lastDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      window.appData.streak++; 
    } else if (diffDays > 1) {
      window.appData.streak = 1; 
    }
  } else {
    window.appData.streak = 1; 
  }

  window.appData.lastActivityDate = todayStr;
  saveData();
  renderStreak();
  window.renderTotalPYQsAndMilestones(); 
}

// 5. Dynamic Controller Visibility Toggles
function toggleWidgetVisibility(widgetKey, isVisible) {
  if (window.appData.widgetVisibility[widgetKey] !== undefined) {
    window.appData.widgetVisibility[widgetKey] = isVisible;
    saveData();
    applyWidgetVisibilityLayouts();
  }
}

// Layout panel component switches
function applyWidgetVisibilityLayouts() {
  const targets = {
    mission: document.getElementById("widget-mission-container"),
    future: document.getElementById("widget-future-container"),
    clat: document.getElementById("widget-clat-container"),
    quest: document.getElementById("widget-quest-container")
  };

  Object.entries(targets).forEach(([key, element]) => {
    const show = window.appData.widgetVisibility[key] !== false;
    if (element) element.style.display = show ? "block" : "none";
    const checkbox = document.getElementById(`toggle-widget-${key}`);
    if (checkbox) checkbox.checked = show;
  });
}

// Theme Engine Accent Switcher
function switchNexusTheme(themeClassName) {
  document.body.className = themeClassName;
  window.appData.currentTheme = themeClassName;
  saveData();

  document.querySelectorAll(".theme-orb").forEach(orb => orb.classList.remove("active-orb"));
  const activeOrb = document.querySelector(`.orb-${themeClassName.replace("theme-", "")}`);
  if (activeOrb) activeOrb.classList.add("active-orb");
}

// Tab Swapping Controller Function
function switchNavigationTab(targetPageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.style.display = "none";
    page.classList.remove("active");
  });

  const targetPageElement = document.getElementById(targetPageId);
  if (targetPageElement) {
    targetPageElement.style.display = "block";
    targetPageElement.classList.add("active");
  }

  const navigationButtons = document.querySelectorAll(".bottom-nav button");
  navigationButtons.forEach(btn => {
    btn.classList.remove("active-nav");
    if (btn.getAttribute("data-page") === targetPageId) {
      btn.classList.add("active-nav");
    }
  });

  window.appData.lastActiveTab = targetPageId;
  saveData();

  try {
    if (targetPageId === "chapters-page" && typeof window.renderChapterGrid === "function") window.renderChapterGrid();
    if (targetPageId === "revision-directory-page" && typeof window.renderMasterDirectory === "function") window.renderMasterDirectory();
    if (targetPageId === "journal-page" && typeof window.renderJournal === "function") window.renderJournal();
    if (targetPageId === "mock-page" && typeof window.renderMocks === "function") window.renderMocks();
    if (targetPageId === "clat-page" && typeof window.renderClat === "function") window.renderClat();
    if (targetPageId === "future-page" && typeof window.renderFutureNotes === "function") window.renderFutureNotes();
  } catch(e) { console.error("Tab Render Exception: ", e); }
}

function fullyTriggerUIRefresh() {
  try { if (typeof window.renderChapterGrid === "function") window.renderChapterGrid(); } catch(e){}
  try { if (typeof window.renderStatusCounts === "function") window.renderStatusCounts(); } catch(e){}
  try { if (typeof window.renderPrepIndex === "function") window.renderPrepIndex(); } catch(e){}
  try { if (typeof window.renderSubjectProgress === "function") window.renderSubjectProgress(); } catch(e){}
  try { if (typeof window.renderLowestPYQList === "function") window.renderLowestPYQList(); } catch(e){}
  try { if (typeof window.renderMasterDirectory === "function") window.renderMasterDirectory(); } catch(e){}
  try { if (typeof window.renderBacklogRevision === "function") window.renderBacklogRevision(); } catch(e){}
  try { if (typeof window.renderSyllabusDistributionBalance === "function") window.renderSyllabusDistributionBalance(); } catch(e){}
  try { if (typeof window.renderMissionBoard === "function") window.renderMissionBoard(); } catch(e){} 
  try { if (typeof window.renderQuest === "function") window.renderQuest(); } catch(e){} 
  try { if (typeof window.renderSettingsMissionHistory === "function") window.renderSettingsMissionHistory(); } catch(e){} 
  try { renderStreak(); } catch(e){}
  try { window.renderTotalPYQsAndMilestones(); } catch(e){} 
}

// Initialization Entry Points 
document.addEventListener("DOMContentLoaded", async () => {
  // 🔥 ASYNC LIFECYCLE BLOCK: Force hold execution sequences until Supabase response yields cloud properties
  await loadData();

  const mainInp = document.getElementById("jee-main-date");
  const advInp = document.getElementById("jee-advanced-date");
  if (mainInp) mainInp.value = window.appData.jeeMainDate || "";
  if (advInp) advInp.value = window.appData.jeeAdvancedDate || "";

  document.body.className = window.appData.currentTheme || "theme-blue";
  switchNexusTheme(window.appData.currentTheme || "theme-blue");

  renderDropDay();
  updateCountdowns();
  renderStatusCounts();
  renderPrepIndex();

  updateActivity(); 

  setTimeout(() => {
    try { window.renderTotalPYQsAndMilestones(); } catch(e){}
  }, 300);

  if (typeof window.renderMissionBoard === "function") window.renderMissionBoard(); 
  if (typeof window.renderQuest === "function") window.renderQuest(); 
  if (typeof window.renderSettingsMissionHistory === "function") window.renderSettingsMissionHistory(); 
  applyWidgetVisibilityLayouts();

  switchNavigationTab(window.appData.lastActiveTab || "dashboard-page");

  setTimeout(fullyTriggerUIRefresh, 150);
  setInterval(updateCountdowns, 60000);

  // 🎯 UNIFORM COMPATIBILITY QUERY SELECTOR LOOP (Grabs target actions seamlessly)
  document.querySelectorAll(".bottom-nav button").forEach(button => {
    button.addEventListener("click", () => {
      const targetPageId = button.getAttribute("data-page");
      if (targetPageId) switchNavigationTab(targetPageId);
    });
  });
});

window.saveData = saveData;
window.toggleWidgetVisibility = toggleWidgetVisibility;
window.applyWidgetVisibilityLayouts = applyWidgetVisibilityLayouts;
window.switchNexusTheme = switchNexusTheme;
window.updateCountdowns = updateCountdowns;
window.renderStatusCounts = renderStatusCounts;
window.renderPrepIndex = renderPrepIndex;
window.fullyTriggerUIRefresh = fullyTriggerUIRefresh;
window.switchNavigationTab = switchNavigationTab;
window.renderStreak = renderStreak;
window.updateActivity = updateActivity;
window.renderTotalPYQsAndMilestones = renderTotalPYQsAndMilestones;