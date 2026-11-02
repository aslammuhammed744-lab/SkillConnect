// SkillConnect Application Core Logic (India Edition - Unique Worker Credentials Support)

// State
let appState = {
  isLoggedIn: false,
  authMode: 'login',
  loggedInUser: null,
  currentRole: 'customer',
  loginSelectedRole: 'worker', // Default to worker tab so user immediately sees worker credentials!
  selectedWorkerLoginId: 'WRK-101', // Default worker select
  activeTab: 'discover',
  selectedCategory: 'all',
  searchQuery: '',
  maxDistanceKm: 10,
  barterOnlyFilter: false,
  activeChatProviderId: 'WRK-101',
  providers: [...initialProviders],
  bookings: [...initialBookings],
  reviews: [...initialReviews],
  chats: [...initialChats],
  notifications: [...initialNotifications],
  selectedProviderForBooking: null,
  bookingType: 'barter',
  platformCommission: {
    workerCommissionPercent: 8,
    customerBookingFee: 20
  }
};

// Global Leaflet Map Instance Variables
let leafletMapInstance = null;
let leafletMarkersGroup = null;
let leafletRadiusCircle = null;

function renderAvatar(name, size = 64, extraClass = '') {
  const cleanName = (name || 'U').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  let initials = 'U';
  if (parts.length >= 2) {
    initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  } else if (parts.length === 1 && parts[0].length >= 2) {
    initials = parts[0].slice(0, 2).toUpperCase();
  } else if (parts.length === 1) {
    initials = parts[0][0].toUpperCase();
  }
  const fontSize = Math.max(11, Math.round(size * 0.38)) + 'px';
  return `<div class="avatar-badge ${extraClass}" style="width: ${size}px; height: ${size}px; font-size: ${fontSize};" title="${cleanName}">${initials}</div>`;
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  renderMain();
  setupEventListeners();
});

function setupEventListeners() {
  const modalOverlay = document.getElementById('bookingModal');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal('bookingModal');
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('bookingModal');
    }
  });
}

function renderMain() {
  renderHeader();
  const container = document.getElementById('tabMainContainer');
  if (!container) return;

  if (appState.authMode === 'registerWorker') {
    container.innerHTML = getWorkerRegisterPageHTML();
    return;
  }

  if (!appState.isLoggedIn) {
    container.innerHTML = getLoginPageHTML();
    return;
  }

  renderCurrentTab();
}

/* ==========================================================================
   AUTHENTICATION & LOGIN / WORKER REGISTRATION SCREENS
   ========================================================================== */

function getLoginPageHTML() {
  const selectedRole = appState.loginSelectedRole;
  
  let prefillEmail = 'user@skillconnect.in';
  let prefillPass = 'User@2026';
  let inputLabel = 'Email Address / User ID';

  if (selectedRole === 'admin') {
    prefillEmail = 'admin@skillconnect.in';
    prefillPass = 'Admin@2026';
    inputLabel = 'Admin ID or Email (ADM-001 / admin@skillconnect.in)';
  } else if (selectedRole === 'worker') {
    const w = appState.providers.find(p => p.id === appState.selectedWorkerLoginId) || appState.providers[0];
    prefillEmail = w.workerId || w.id;
    prefillPass = w.password;
    inputLabel = 'Worker ID or Email (e.g. ' + (w.workerId || w.id) + ' or ' + w.email + ')';
  } else {
    inputLabel = 'Customer ID or Email (USR-001 / user@skillconnect.in)';
  }

  return `
    <div class="login-screen-wrap">
      <div class="login-card" style="max-width: 580px;">
        <div class="login-header">
          <div class="login-logo-icon">🤝</div>
          <h2 class="login-title">SkillConnect India</h2>
          <p class="login-subtitle">Skill Exchange & Local Service Provider Platform</p>
        </div>

        <!-- Role Selector Tabs -->
        <div>
          <label class="form-label" style="text-align: center; margin-bottom: 0.6rem;">Select Login Account Role:</label>
          <div class="role-tabs-grid">
            <button class="role-tab-btn ${selectedRole === 'worker' ? 'active' : ''}" onclick="setLoginRole('worker')">
              <span>🛠️</span> Worker Pro
            </button>
            <button class="role-tab-btn ${selectedRole === 'user' ? 'active' : ''}" onclick="setLoginRole('user')">
              <span>👤</span> Customer
            </button>
            <button class="role-tab-btn ${selectedRole === 'admin' ? 'active' : ''}" onclick="setLoginRole('admin')">
              <span>🛡️</span> Admin
            </button>
          </div>
        </div>

        ${selectedRole === 'worker' ? `
          <div class="form-group" style="background: #F8FAFC; padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <label class="form-label" style="color: var(--text-main); margin: 0; font-weight: 700;">Quick Worker Account Selector:</label>
              <span style="font-size: 0.72rem; color: var(--text-muted);">${appState.providers.length} registered workers</span>
            </div>
            <select class="form-select" onchange="selectWorkerForLogin(this.value)">
              ${appState.providers.map(p => `
                <option value="${p.id}" ${p.id === appState.selectedWorkerLoginId ? 'selected' : ''}>
                  ${p.workerId || p.id} • ${p.name} (${p.categoryName.split(' ')[0]}) — Pass: ${p.password}
                </option>
              `).join('')}
            </select>
          </div>
        ` : ''}

        <!-- Credentials Form -->
        <form onsubmit="handleLoginFormSubmit(event)">
          <div class="form-group">
            <label class="form-label">${inputLabel}</label>
            <input type="text" id="loginEmailInput" class="form-input" required value="${prefillEmail}">
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="text" id="loginPasswordInput" class="form-input" required value="${prefillPass}">
          </div>

          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 0.95rem; margin-top: 0.5rem;">
            Sign In as ${selectedRole === 'admin' ? 'Administrator' : selectedRole === 'worker' ? 'Worker Pro' : 'Customer'}
          </button>
        </form>

        ${selectedRole === 'worker' ? `
          <!-- Full Registered Workers Directory Table with Unique IDs & Passwords -->
          <div class="quick-login-box" style="margin-top: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <div class="quick-login-title" style="margin: 0;">🔑 Worker ID & Password Directory (${appState.providers.length} Workers):</div>
            </div>
            
            <div class="worker-table-wrap">
              <table class="worker-cred-table">
                <thead>
                  <tr>
                    <th>Worker Name</th>
                    <th>Worker ID</th>
                    <th>Password</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${appState.providers.map(p => `
                    <tr>
                      <td>
                        <strong>${p.name}</strong>
                        <div style="color: var(--text-muted); font-size: 0.7rem;">${p.categoryName.split(' ')[0]}</div>
                      </td>
                      <td>
                        <span class="worker-id-badge">${p.workerId || p.id}</span>
                      </td>
                      <td>
                        <span class="worker-pass-badge">${p.password}</span>
                      </td>
                      <td>
                        <button type="button" class="btn-sm-barter" style="padding: 0.3rem 0.6rem; font-size: 0.72rem;" onclick="loginAsSpecificWorker('${p.id}')">
                          Login ➔
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : `
          <!-- Quick Info for Customer & Admin -->
          <div class="quick-login-box">
            <div class="quick-login-title">⚡ Demo Credentials:</div>
            <div class="quick-btn-group">
              <button class="quick-user-btn" onclick="quickLogin('user')">
                <div>
                  <strong>👤 Customer: Rahul Verma</strong>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">ID: USR-001 (user@skillconnect.in) • Pass: User@2026</div>
                </div>
                <span style="color: var(--text-main); font-weight: 700;">Login ➔</span>
              </button>
              <button class="quick-user-btn" onclick="quickLogin('admin')">
                <div>
                  <strong>🛡️ Admin: Afsal Haneef</strong>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">ID: ADM-001 (admin@skillconnect.in) • Pass: Admin@2026</div>
                </div>
                <span style="color: var(--text-main); font-weight: 700;">Login ➔</span>
              </button>
            </div>
          </div>
        `}

        <!-- Switch to Worker Registration Banner -->
        <div style="text-align: center; border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 0.5rem;">
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">Are you a new skilled professional?</p>
          <button class="btn-secondary" style="width: 100%; justify-content: center;" onclick="switchAuthMode('registerWorker')">
            🛠️ Register as a New Skilled Worker Pro
          </button>
        </div>
      </div>
    </div>
  `;
}

function selectWorkerForLogin(workerId) {
  appState.selectedWorkerLoginId = workerId;
  const w = appState.providers.find(p => p.id === workerId);
  if (w) {
    const emailInput = document.getElementById('loginEmailInput');
    const passInput = document.getElementById('loginPasswordInput');
    if (emailInput) emailInput.value = w.workerId || w.id;
    if (passInput) passInput.value = w.password;
  }
}

function loginAsSpecificWorker(workerId) {
  appState.selectedWorkerLoginId = workerId;
  appState.loginSelectedRole = 'worker';
  const worker = appState.providers.find(p => p.id === workerId);
  if (worker) {
    loginWithWorkerProfile(worker);
  }
}

function getWorkerRegisterPageHTML() {
  const nextWorkerNum = 100 + appState.providers.length + 1;
  const suggestedWorkerId = 'WRK-' + nextWorkerNum;

  return `
    <div class="login-screen-wrap" style="padding: 2rem 0;">
      <div class="login-card" style="max-width: 580px;">
        <div class="login-header">
          <div class="login-logo-icon">🛠️</div>
          <h2 class="login-title">Worker Pro Registration</h2>
          <p class="login-subtitle">List your skill on SkillConnect India & get your unique Worker ID</p>
        </div>

        <form id="workerRegisterForm" onsubmit="handleWorkerRegisterSubmit(event)">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input type="text" id="regNameInput" class="form-input" required placeholder="e.g. Ramesh Patel">
            </div>
            <div class="form-group">
              <label class="form-label">Assigned Worker ID</label>
              <input type="text" id="regWorkerIdInput" class="form-input" value="${suggestedWorkerId}" readonly style="background: #F1F5F9; font-weight: 800; color: #09090B;">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Email Address (Login ID) *</label>
              <input type="email" id="regEmailInput" class="form-input" required placeholder="ramesh@electrician.in">
            </div>
            <div class="form-group">
              <label class="form-label">Create Your Password *</label>
              <input type="text" id="regPasswordInput" class="form-input" required value="Ramesh@${nextWorkerNum}">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Primary Skill Category *</label>
              <select id="regCategorySelect" class="form-select" required>
                ${initialCategories.filter(c => c.id !== 'all').map(cat => `
                  <option value="${cat.id}">${cat.icon ? cat.icon + ' ' : ''}${cat.name}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Experience Level *</label>
              <select id="regExpSelect" class="form-select">
                <option value="1-3 years">1 - 3 Years Experience</option>
                <option value="3-5 years" selected>3 - 5 Years Experience</option>
                <option value="5+ years">5+ Years Professional</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Offered Service / Skill Description *</label>
            <input type="text" id="regOfferedSkillInput" class="form-input" required placeholder="e.g. AC Repairing, Fan Wiring & Circuit Setup">
          </div>

          <div class="form-group">
            <label class="form-label">Skill You Want to Learn (For Skill Exchange/Barter)</label>
            <input type="text" id="regSeekingSkillInput" class="form-input" placeholder="e.g. Spoken English, Guitar Lessons, Python Basics">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Locality / City *</label>
              <input type="text" id="regLocationInput" class="form-input" required placeholder="e.g. Koramangala, Bengaluru">
            </div>
            <div class="form-group">
              <label class="form-label">Hourly Working Rate (₹/hr) *</label>
              <div style="position: relative;">
                <span style="position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%); font-weight: 800; color: #09090B;">₹</span>
                <input type="number" id="regHourlyRateInput" class="form-input" required min="50" max="10000" step="10" value="200" style="padding-left: 2.2rem; font-weight: 700;">
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Bio & Work Experience Summary</label>
            <textarea id="regBioInput" class="form-textarea" placeholder="Describe your years of experience, tools, and background..."></textarea>
          </div>

          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label class="toggle-switch">
              <input type="checkbox" id="regBarterCheckbox" checked>
              <span class="toggle-slider"></span>
              <span style="color: var(--text-main); font-weight: 700;">🤝 Enable Skill Exchange (Barter) Offers</span>
            </label>
          </div>

          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 0.95rem;">
            ✓ Complete Worker Registration & Go to Dashboard
          </button>
        </form>

        <div style="text-align: center; border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 0.5rem;">
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">Already registered?</p>
          <button class="btn-secondary" style="width: 100%; justify-content: center;" onclick="switchAuthMode('login')">
            ${appState.isLoggedIn ? '← Back to Platform' : 'Back to Sign In'}
          </button>
        </div>
      </div>
    </div>
  `;
}

function switchAuthMode(mode) {
  appState.authMode = mode;
  renderMain();
}

function setLoginRole(role) {
  appState.loginSelectedRole = role;
  renderMain();
}

function handleLoginFormSubmit(e) {
  e.preventDefault();
  const input = (document.getElementById('loginEmailInput')?.value || '').trim();
  const pass = (document.getElementById('loginPasswordInput')?.value || '').trim();

  if (appState.loginSelectedRole === 'admin') {
    if ((input.toLowerCase() === 'admin@skillconnect.in' || input.toUpperCase() === 'ADM-001') && pass === 'Admin@2026') {
      quickLogin('admin');
    } else {
      showToast('❌ Invalid Admin ID or Password! Use ADM-001 & Admin@2026');
    }
    return;
  }

  if (appState.loginSelectedRole === 'user') {
    if ((input.toLowerCase() === 'user@skillconnect.in' || input.toUpperCase() === 'USR-001') && pass === 'User@2026') {
      quickLogin('user');
    } else {
      showToast('❌ Invalid Customer ID or Password! Use USR-001 & User@2026');
    }
    return;
  }

  // Worker Login Search by Worker ID OR Email
  const query = input.toLowerCase();
  const matchedWorker = appState.providers.find(p => 
    (p.workerId && p.workerId.toLowerCase() === query) ||
    p.id.toLowerCase() === query ||
    p.email.toLowerCase() === query
  );

  if (!matchedWorker) {
    showToast(`❌ No worker found with ID or Email: "${input}". Check the directory table below.`);
    return;
  }

  // Password Verification for the specific worker
  if (matchedWorker.password !== pass) {
    showToast(`❌ Incorrect password for ${matchedWorker.name}! Their password is: ${matchedWorker.password}`);
    return;
  }

  // Successful Login
  loginWithWorkerProfile(matchedWorker);
}

function loginWithWorkerProfile(worker) {
  const workerAccount = {
    id: worker.id,
    workerId: worker.workerId || worker.id,
    name: worker.name,
    email: worker.email,
    password: worker.password,
    role: 'worker',
    roleLabel: `Worker (${worker.categoryName.split(' ')[0]})`,
    categoryName: worker.categoryName,
    avatar: worker.avatar,
    badge: `⚡ Pro Worker (${worker.workerId || worker.id})`,
    hourlyRate: worker.hourlyRate || 100,
    offeredSkill: worker.offeredSkill,
    seekingSkill: worker.seekingSkill
  };

  appState.isLoggedIn = true;
  appState.authMode = 'login';
  appState.loggedInUser = workerAccount;
  appState.currentRole = 'worker';
  appState.activeTab = 'worker';

  showToast(`Welcome back, ${worker.name}! Logged in as ${worker.workerId || worker.id}`);
  renderMain();
}

function quickLogin(role) {
  if (role === 'worker') {
    const w = appState.providers.find(p => p.id === appState.selectedWorkerLoginId) || appState.providers[0];
    loginWithWorkerProfile(w);
    return;
  }

  appState.isLoggedIn = true;
  appState.loggedInUser = demoAccounts[role];
  appState.currentRole = role;

  if (role === 'admin') {
    appState.activeTab = 'admin';
  } else {
    appState.activeTab = 'discover';
  }

  showToast(`Welcome back, ${appState.loggedInUser.name}! (${appState.loggedInUser.roleLabel})`);
  renderMain();
}

async function handleWorkerRegisterSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('regNameInput')?.value || 'New Skilled Worker';
  // Use timestamp suffix to guarantee uniqueness — avoids duplicate ID collisions in Supabase
  const workerIdInput = document.getElementById('regWorkerIdInput')?.value || '';
  const workerId = workerIdInput || ('WRK-' + (Date.now()));
  const email = document.getElementById('regEmailInput')?.value || `worker_${Date.now()}@skillconnect.in`;
  const password = document.getElementById('regPasswordInput')?.value || 'Pass@123';
  const category = document.getElementById('regCategorySelect')?.value || 'electrician';
  const offeredSkill = document.getElementById('regOfferedSkillInput')?.value || 'Skilled Services';
  const seekingSkill = document.getElementById('regSeekingSkillInput')?.value || 'Skill Exchange';
  const locationName = document.getElementById('regLocationInput')?.value || 'Bengaluru';
  const hourlyRateInput = parseFloat(document.getElementById('regHourlyRateInput')?.value);
  const hourlyRate = (!isNaN(hourlyRateInput) && hourlyRateInput > 0) ? hourlyRateInput : 150;
  const bio = document.getElementById('regBioInput')?.value || 'Experienced skilled professional.';
  const barterAvailable = document.getElementById('regBarterCheckbox')?.checked ?? true;

  const categoryObj = initialCategories.find(c => c.id === category) || { name: 'Skilled Pro' };

  const newProvider = {
    id: workerId,
    workerId: workerId,
    name: name,
    email: email,
    password: password,
    category: category,
    categoryName: categoryObj.name,
    avatar: '',
    rating: 5.0,
    reviewsCount: 1,
    distanceKm: 0.5,
    locationName: `${locationName} (0.5 km away)`,
    lat: 12.9716,
    lng: 77.5946,
    hourlyRate: hourlyRate,
    isVerified: true,
    barterAvailable: barterAvailable,
    offeredSkill: offeredSkill,
    seekingSkill: seekingSkill,
    bio: bio,
    completedJobs: 0
  };

  appState.providers.unshift(newProvider);
  appState.selectedWorkerLoginId = newProvider.id;

  // ── Supabase: Save new provider to cloud database ──────────────────────
  if (typeof saveProviderToSupabase === 'function') {
    await saveProviderToSupabase(newProvider);
  }

  loginWithWorkerProfile(newProvider);
  showToast(`🎉 Registration successful! Your Worker ID is ${workerId} and Password is ${password}`);
}

function logout() {
  appState.isLoggedIn = false;
  appState.authMode = 'login';
  appState.loggedInUser = null;
  appState.activeTab = 'discover';
  showToast('Logged out successfully.');
  renderMain();
}

/* ==========================================================================
   HEADER & NAVIGATION
   ========================================================================== */

function renderHeader() {
  const header = document.querySelector('.app-header');
  if (!header) return;

  if (!appState.isLoggedIn) {
    header.innerHTML = `
      <div class="brand-logo" onclick="switchAuthMode('login')">
        <div class="logo-icon">🤝</div>
        <div>
          <div class="logo-text">SkillConnect</div>
          <div class="logo-tagline">Skill Exchange & Services (India)</div>
        </div>
      </div>
      <div style="display: flex; gap: 0.8rem; align-items: center;">
        <button class="btn-secondary" style="padding: 0.45rem 0.9rem; font-size: 0.8rem;" onclick="switchAuthMode('login')">Sign In</button>
        <button class="btn-primary" style="padding: 0.45rem 0.9rem; font-size: 0.8rem;" onclick="switchAuthMode('registerWorker')">🛠️ Register as Worker</button>
      </div>
    `;
    return;
  }

  const u = appState.loggedInUser;

  header.innerHTML = `
    <div class="brand-logo" onclick="switchTab('discover')">
      <div class="logo-icon">🤝</div>
      <div>
        <div class="logo-text">SkillConnect</div>
        <div class="logo-tagline">${u.roleLabel} Dashboard</div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <nav class="nav-tabs">
      <button class="nav-tab ${appState.activeTab === 'discover' ? 'active' : ''}" data-tab="discover" onclick="switchTab('discover')">
        🔍 Discover & Radar
      </button>
      <button class="nav-tab ${appState.activeTab === 'barter' ? 'active' : ''}" data-tab="barter" onclick="switchTab('barter')">
        🤝 Skill Barter Hub
      </button>

      ${u.role === 'worker' ? `
        <button class="nav-tab ${appState.activeTab === 'worker' ? 'active' : ''}" data-tab="worker" onclick="switchTab('worker')">
          🛠️ Worker Jobs & Requests
        </button>
      ` : `
        <button class="nav-tab ${appState.activeTab === 'bookings' ? 'active' : ''}" data-tab="bookings" onclick="switchTab('bookings')">
          📅 My Bookings
        </button>
      `}

      <button class="nav-tab ${appState.activeTab === 'chat' ? 'active' : ''}" data-tab="chat" onclick="switchTab('chat')">
        💬 Messages
      </button>

      ${u.role === 'admin' ? `
        <button class="nav-tab ${appState.activeTab === 'admin' ? 'active' : ''}" data-tab="admin" onclick="switchTab('admin')">
          🛡️ Admin Panel
        </button>
      ` : ''}
    </nav>

    <!-- Header User Info & Switch Account -->
    <div class="header-actions" style="position: relative;">
      <!-- Notifications -->
      <div class="notif-bell" id="notifBellBtn" title="Notifications for ${u.name}" onclick="toggleNotificationDropdown(event)">
        🔔
        ${(() => {
          const userNotifs = appState.notifications.filter(n => n.targetUserId === u.id || (u.workerId && n.targetUserId === u.workerId) || n.targetUserId === 'all');
          const unreadCount = userNotifs.filter(n => !n.read).length;
          return unreadCount > 0 ? `<div class="notif-badge">${unreadCount}</div>` : '';
        })()}
      </div>

      <!-- Real Notification Dropdown Card -->
      <div class="notif-dropdown-card" id="notifDropdown">
        ${(() => {
          const userNotifs = appState.notifications.filter(n => n.targetUserId === u.id || (u.workerId && n.targetUserId === u.workerId) || n.targetUserId === 'all');
          return `
            <div class="notif-header">
              <div style="font-weight: 800; font-size: 0.88rem; color: #09090B;">
                🔔 Notifications ${userNotifs.length > 0 ? `(${userNotifs.length})` : ''}
              </div>
              ${userNotifs.length > 0 ? `
                <button type="button" onclick="markAllNotificationsAsRead(event)" style="background: none; border: none; font-size: 0.72rem; color: var(--text-muted); cursor: pointer; text-decoration: underline; font-weight: 600;">
                  Mark all read
                </button>
              ` : ''}
            </div>
            <div class="notif-list">
              ${userNotifs.length === 0 ? `
                <div style="padding: 2.2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.82rem;">
                  <div style="font-size: 1.6rem; margin-bottom: 0.4rem;">🔕</div>
                  <strong style="color: #09090B; display: block; margin-bottom: 0.2rem;">No notifications for your profile</strong>
                  <span style="font-size: 0.74rem;">Requests specifically sent to you (${u.workerId || u.id}) will appear here exclusively.</span>
                </div>
              ` : userNotifs.map(n => `
                <div class="notif-item ${!n.read ? 'unread' : ''}" onclick="openNotificationItem('${n.id}')">
                  <div style="font-size: 1.2rem; line-height: 1;">${n.title.includes('Request') ? '📥' : n.title.includes('Accepted') ? '✓' : '🔔'}</div>
                  <div style="flex: 1;">
                    <div class="notif-title">${n.title}</div>
                    <div class="notif-desc">${n.desc}</div>
                    <div class="notif-time">${n.time}</div>
                  </div>
                  ${!n.read ? `<div style="width: 7px; height: 7px; border-radius: 50%; background: #09090B; margin-top: 5px;" title="Unread"></div>` : ''}
                </div>
              `).join('')}
            </div>
          `;
        })()}
      </div>

      <!-- User Profile Card & Logout -->
      <div class="user-badge-pill">
        ${renderAvatar(u.name, 32, 'user-avatar')}
        <div>
          <div style="font-size: 0.85rem; font-weight: 700; color: #09090B;">${u.name}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">${u.badge}</div>
        </div>
        <button onclick="logout()" style="margin-left: 0.5rem; background: #09090B; border: 1px solid #09090B; color: #FFFFFF; padding: 0.3rem 0.6rem; border-radius: 20px; font-size: 0.72rem; font-weight: 700; cursor: pointer;" title="Logout / Switch Account">
          Switch User
        </button>
      </div>
    </div>
  `;
}

function switchTab(tabId) {
  appState.activeTab = tabId;
  renderMain();
}

function renderCurrentTab() {
  const container = document.getElementById('tabMainContainer');
  if (!container) return;

  switch (appState.activeTab) {
    case 'discover':
      container.innerHTML = getDiscoverViewHTML();
      setupDiscoverFilters();
      renderProvidersGrid();
      setTimeout(initOrUpdateLeafletMap, 100);
      break;

    case 'barter':
      container.innerHTML = getBarterHubViewHTML();
      break;

    case 'bookings':
      container.innerHTML = getBookingsViewHTML();
      break;

    case 'worker':
      container.innerHTML = getWorkerViewHTML();
      break;

    case 'chat':
      container.innerHTML = getChatViewHTML();
      setupChatListeners();
      break;

    case 'admin':
      container.innerHTML = getAdminDashboardViewHTML();
      break;
  }
}

/* ==========================================================================
   WORKER / SERVICE PROVIDER WORKSPACE VIEW
   ========================================================================== */

function getWorkerViewHTML() {
  const workerProfile = appState.providers.find(p => p.id === appState.loggedInUser.id) || appState.providers[0];
  const workerBookings = appState.bookings.filter(b => b.providerId === workerProfile.id || b.providerId === workerProfile.workerId);
  
  // Calculate worker working hours and commission payment stats
  const completedOrLoggedBookings = workerBookings.filter(b => b.type !== 'barter' && (b.status === 'Completed' || b.hoursLogged));
  const totalHoursBilled = workerBookings.reduce((sum, b) => {
    if (b.type === 'barter') return sum + (parseFloat(b.hours) || 2);
    if (b.status === 'Completed' || b.hoursLogged) return sum + (parseFloat(b.hours) || 0);
    return sum;
  }, 0);
  const totalGrossEarnings = completedOrLoggedBookings.reduce((sum, b) => sum + (parseFloat(b.grossAmount) || 0), 0);
  const totalWorkerCommissionsPaid = completedOrLoggedBookings.reduce((sum, b) => sum + (parseFloat(b.workerCommission) || 0), 0);
  const totalNetTakeHome = totalGrossEarnings - totalWorkerCommissionsPaid;

  return `
    <div class="diagram-canvas-wrap" style="margin-bottom: 2rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 1.2rem;">
          ${renderAvatar(workerProfile.name, 70)}
          <div>
            <h2>🛠️ Worker Portal: ${workerProfile.name}</h2>
            <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; margin-top: 0.35rem;">
              <span class="worker-id-badge" style="font-size: 0.78rem;">ID: ${workerProfile.workerId || workerProfile.id}</span>
              <span class="worker-pass-badge" style="font-size: 0.78rem;">🔑 Pass: ${workerProfile.password}</span>
              <span style="color: var(--text-muted); font-size: 0.78rem;">📧 ${workerProfile.email}</span>
            </div>
            <div style="color: var(--text-muted); font-weight: 700; margin-top: 0.3rem;">${workerProfile.categoryName}</div>
            
            <!-- Working Hourly Rate Badge & Quick Edit Button -->
            <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; margin-top: 0.5rem;">
              <span class="hourly-rate-pill" style="font-size: 0.85rem; padding: 0.35rem 0.8rem;">
                ⏱️ Base Rate: ₹${workerProfile.hourlyRate || 150} / hour
              </span>
              <span class="payout-tag" style="font-size: 0.78rem;">
                💰 92% Net Take-Home (8% Platform Commission)
              </span>
              <button class="btn-sm-barter" style="padding: 0.35rem 0.8rem; font-size: 0.78rem;" onclick="openEditWorkerRateModal('${workerProfile.id}')">
                ✏️ Edit Working Rate
              </button>
            </div>
          </div>
        </div>
        <div style="text-align: right;">
          <span class="barter-badge" style="margin: 0; padding: 0.5rem 1rem; font-size: 0.85rem;">
            🤝 Barter Status: Active (0% Free)
          </span>
          <div style="margin-top: 0.5rem; font-weight: 800; font-size: 1.1rem; color: #09090B;">
            ⭐ ${workerProfile.rating} <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">(${workerProfile.completedJobs || 120}+ jobs completed)</span>
          </div>
        </div>
      </div>

      <!-- Worker Working Hours, Gross & Net Take-Home Metrics -->
      <div class="worker-earnings-grid">
        <div class="worker-stat-card">
          <span class="worker-stat-title">⏱️ Base Working Rate</span>
          <span class="worker-stat-value">₹${workerProfile.hourlyRate || 150}<span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;"> / hr</span></span>
          <span class="worker-stat-sub">Billed to customers per working hour</span>
        </div>
        <div class="worker-stat-card">
          <span class="worker-stat-title">⏳ Total Billed Hours</span>
          <span class="worker-stat-value">${totalHoursBilled} <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">hrs</span></span>
          <span class="worker-stat-sub">Across all customer booking requests</span>
        </div>
        <div class="worker-stat-card">
          <span class="worker-stat-title">💼 Gross Service Bookings</span>
          <span class="worker-stat-value">₹${totalGrossEarnings}</span>
          <span class="worker-stat-sub" style="color: #DC2626;">-₹${totalWorkerCommissionsPaid} (8% Platform Commission)</span>
        </div>
        <div class="worker-stat-card" style="background: #F0FDF4; border-color: #86EFAC;">
          <span class="worker-stat-title" style="color: #166534;">💰 Net Take-Home Payout</span>
          <span class="worker-stat-value" style="color: #15803D;">₹${totalNetTakeHome}</span>
          <span class="worker-stat-sub" style="color: #166534; font-weight: 700;">Direct earnings in worker pocket</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem; background: #F8FAFC; padding: 1.2rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <div>
          <strong style="color: #09090B; font-size: 0.85rem;">⚡ Skill You Offer:</strong>
          <div style="font-size: 0.95rem; margin-top: 0.3rem; color: #09090B;">${workerProfile.offeredSkill}</div>
        </div>
        <div>
          <strong style="color: #09090B; font-size: 0.85rem;">🎓 Skill You Want to Learn (Barter):</strong>
          <div style="font-size: 0.95rem; margin-top: 0.3rem; color: var(--text-muted);">${workerProfile.seekingSkill}</div>
        </div>
      </div>
    </div>

    <!-- Incoming Job Requests Table -->
    <div class="diagram-canvas-wrap">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
        <h3>📥 Requests Specifically Sent to You (${workerProfile.name})</h3>
        <span class="badge-pill" style="margin: 0; background: #09090B; color: #FFFFFF; font-size: 0.75rem;">
          🎯 ${workerBookings.length} ${workerBookings.length === 1 ? 'Request' : 'Requests'} for ${workerProfile.workerId || workerProfile.id}
        </span>
      </div>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.2rem;">
        Private Worker Inbox: Only customer requests submitted directly to your Worker ID (${workerProfile.workerId || workerProfile.id}) appear here. Review working hours, 8% commission deductions, and net take-home payouts.
      </p>

      <div class="table-responsive">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.82rem; text-transform: uppercase;">
              <th style="padding: 1rem;">Booking ID</th>
              <th style="padding: 1rem;">Customer</th>
              <th style="padding: 1rem;">Requested Service</th>
              <th style="padding: 1rem;">Working Hours</th>
              <th style="padding: 1rem;">Gross & Commission</th>
              <th style="padding: 1rem;">Net Take-Home</th>
              <th style="padding: 1rem;">Date & Time</th>
              <th style="padding: 1rem;">Status</th>
              <th style="padding: 1rem;">Worker Actions</th>
            </tr>
          </thead>
          <tbody>
            ${workerBookings.length === 0 ? `
              <tr>
                <td colspan="9" style="text-align: center; padding: 3rem 1.5rem; color: var(--text-muted);">
                  <div style="font-size: 2.2rem; margin-bottom: 0.6rem;">📭</div>
                  <strong style="color: #09090B; font-size: 1.05rem; display: block; margin-bottom: 0.35rem;">No customer requests for your profile yet</strong>
                  <p style="font-size: 0.85rem; max-width: 500px; margin: 0 auto; line-height: 1.4;">
                    Customer requests are private and strictly routed to the requested worker only. When a customer books working hours specifically with <strong>${workerProfile.name}</strong> (${workerProfile.workerId || workerProfile.id}), their request will appear here directly.
                  </p>
                </td>
              </tr>
            ` : workerBookings.map(b => {
              const isBarter = b.type === 'barter';
              const rate = b.hourlyRate || workerProfile.hourlyRate || 150;
              const hasHours = isBarter || b.status === 'Completed' || b.hoursLogged;
              const hours = b.hours || (isBarter ? 2 : 0);
              const gross = isBarter ? 0 : (b.grossAmount || Math.round(hours * rate));
              const commission = isBarter ? 0 : (b.workerCommission ?? Math.round(gross * 0.08));
              const netPayout = isBarter ? 0 : (b.workerNetPayout ?? (gross - commission));

              return `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 1rem; font-weight: 700; color: #09090B;">${b.id}</td>
                <td style="padding: 1rem; font-weight: 700;">${b.customerName || 'Rahul Verma'}</td>
                <td style="padding: 1rem;">
                  <strong>${b.serviceTitle}</strong>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">${b.userNotes || 'No special notes'}</div>
                </td>
                <td style="padding: 1rem;">
                  ${isBarter ? `
                    <span class="barter-badge" style="margin: 0;">🤝 ${hours} hr Barter</span>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">Mutual Exchange</div>
                  ` : hasHours ? `
                    <div style="font-weight: 700; color: #09090B; font-size: 0.92rem;">⏱️ ${hours} ${hours === 1 ? 'Hour' : 'Hours'}</div>
                    <div style="font-size: 0.75rem; color: #16A34A; font-weight: 600;">✓ Completed Log (@ ₹${rate}/hr)</div>
                  ` : `
                    <span class="badge-pill" style="background: #FEF3C7; color: #92400E; font-size: 0.72rem;">⏳ Time Not Yet Logged</span>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">Rate: ₹${rate}/hr</div>
                  `}
                </td>
                <td style="padding: 1rem;">
                  ${isBarter ? `
                    <span style="color: var(--text-muted); font-size: 0.85rem;">Skill Barter (₹0)</span>
                  ` : hasHours ? `
                    <div style="font-size: 0.85rem; font-weight: 700; color: #09090B;">Gross: ₹${gross}</div>
                    <span class="commission-badge">-₹${commission} (8% Comm)</span>
                  ` : `
                    <span style="font-size: 0.78rem; color: var(--text-muted);">Calculated on finish</span>
                  `}
                </td>
                <td style="padding: 1rem;">
                  ${isBarter ? `
                    <strong style="color: #09090B;">Zero Cash</strong>
                  ` : hasHours ? `
                    <strong class="payout-tag">₹${netPayout} Net</strong>
                    <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.15rem;">via ${b.paymentMethod ? b.paymentMethod.split(' ')[0] : 'UPI'}</div>
                  ` : `
                    <span style="font-size: 0.78rem; color: var(--text-muted);">Log hours to finalize</span>
                  `}
                </td>
                <td style="padding: 1rem; color: var(--text-muted);">${b.date} at ${b.time}</td>
                <td style="padding: 1rem;">
                  ${b.status === 'Confirmed' ? `<span style="color: #09090B; font-weight: 700;">● Accepted</span>` : ''}
                  ${b.status === 'Pending' ? `<span style="color: #D97706; font-weight: 700;">● Pending Response</span>` : ''}
                  ${b.status === 'Completed' ? `<span style="color: #16A34A; font-weight: 700;">✓ Completed</span>` : ''}
                </td>
                <td style="padding: 1rem;">
                  <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                    ${b.status === 'Pending' ? `
                      <button class="btn-sm-barter" onclick="updateWorkerBookingStatus('${b.id}', 'Confirmed')">✓ Accept</button>
                    ` : ''}
                    ${b.status !== 'Completed' && !isBarter ? `
                      <button class="btn-sm-barter" style="background: #16A34A; border-color: #16A34A;" onclick="openLogWorkerHoursModal('${b.id}')">⏱️ Log Hours & Complete</button>
                    ` : ''}
                    ${b.status !== 'Completed' && isBarter ? `
                      <button class="btn-sm-barter" onclick="updateWorkerBookingStatus('${b.id}', 'Completed')">✓ Complete Barter</button>
                    ` : ''}
                    <button class="btn-sm-book" onclick="openChatWithProvider('${b.providerId}')">💬 Chat</button>
                    <button class="btn-sm-book" style="background: #F1F5F9; color: #09090B; border: 1px solid var(--border-color);" onclick="showBookingReceipt('${b.id}')">🧾 Receipt</button>
                  </div>
                </td>
              </tr>
            `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function updateWorkerBookingStatus(bookingId, newStatus) {
  const b = appState.bookings.find(bok => bok.id === bookingId);
  if (b) {
    b.status = newStatus;
    const workerProfile = appState.providers.find(p => p.id === b.providerId) || { name: 'Worker' };

    // Route status notification specifically to the customer!
    const customerNotif = {
      id: `notif-${Date.now()}`,
      targetUserId: b.customerId || 'USR-001',
      title: newStatus === 'Confirmed' ? '✓ Request Accepted!' : `Booking ${newStatus}`,
      desc: `${workerProfile.name} accepted your request for "${b.serviceTitle}". Scheduled for ${b.date} at ${b.time}.`,
      time: 'Just now',
      read: false,
      bookingId: b.id
    };
    appState.notifications.unshift(customerNotif);

    // ── Supabase: Update booking status & save notification in cloud ───────
    if (typeof updateBookingStatusInSupabase === 'function') {
      await updateBookingStatusInSupabase(bookingId, newStatus);
    }
    if (typeof saveNotificationToSupabase === 'function') {
      await saveNotificationToSupabase(customerNotif);
    }

    showToast(`Request ${bookingId} has been ${newStatus}!`);
    renderMain();
  }
}

/* ==========================================================================
   DISCOVER & SEARCH VIEW WITH LEAFLET MAP
   ========================================================================== */

function getDiscoverViewHTML() {
  return `
    <!-- Hero Banner -->
    <div class="hero-banner">
      <div class="hero-content">
        <div class="badge-pill">🇮🇳 Skill Exchange & Local Services (India)</div>
        <h1 class="hero-title">Connect Nearby. <span>Exchange Skills.</span> Get Work Done.</h1>
        <p class="hero-desc">Find verified electricians, plumbers, tutors, designers, and mechanics in your locality. Exchange your skills zero-fee or connect with verified professionals directly!</p>
        <div class="hero-actions">
          <button class="btn-primary" onclick="switchTab('barter')">🤝 Post Skill Barter</button>
          <button class="btn-secondary" onclick="switchAuthMode('registerWorker')">🛠️ Register as Worker Pro</button>
        </div>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="filter-bar">
      <div class="filter-row">
        <div class="search-input-wrap">
          <span class="search-icon">🔍</span>
          <input type="text" id="searchInput" placeholder="Search by name, category, or skill (e.g., Electrician, Maths, Figma)..." value="${appState.searchQuery}">
        </div>
      </div>

      <!-- Category Chips -->
      <div class="category-chips">
        ${initialCategories.map(cat => `
          <button class="chip ${appState.selectedCategory === cat.id ? 'active' : ''}" onclick="selectCategory('${cat.id}')">
            <span>${cat.icon}</span> ${cat.name}
          </button>
        `).join('')}
      </div>

      <!-- Controls & Sliders -->
      <div class="filter-controls">
        <div class="slider-group">
          <span>📍 Radius:</span>
          <input type="range" id="distanceSlider" min="1" max="20" step="0.5" value="${appState.maxDistanceKm}">
          <strong id="distanceLabel">${appState.maxDistanceKm} km</strong>
        </div>

        <label class="toggle-switch">
          <input type="checkbox" id="barterToggle" ${appState.barterOnlyFilter ? 'checked' : ''} onchange="toggleBarterFilter(this.checked)">
          <span class="toggle-slider"></span>
          <span>🤝 Show Skill Exchange (Barter) Only</span>
        </label>
      </div>
    </div>

    <!-- Providers Grid Section -->
    <div class="section-title-wrap" style="margin-bottom: 1.2rem; display: flex; align-items: center; justify-content: space-between;">
      <h3><i class="lucide-users"></i> Nearby Skilled Professionals</h3>
      <span id="resultsCountBadge" class="badge-pill" style="margin-bottom: 0;">Showing ${appState.providers.length} pros</span>
    </div>

    <div id="providersGridContainer" class="providers-grid"></div>

    <!-- Interactive Leaflet Map Box -->
    <div class="map-view-box">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
        <h4>🗺️ Live Interactive GPS Map Radar (Bengaluru & Locality)</h4>
        <span style="font-size: 0.8rem; color: var(--text-muted);">Real OpenStreetMap tiles with custom markers & radius circle</span>
      </div>
      <div id="leafletMapContainer"></div>
    </div>
  `;
}

function setupDiscoverFilters() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      appState.searchQuery = e.target.value;
      renderProvidersGrid();
      initOrUpdateLeafletMap();
    });
  }

  const slider = document.getElementById('distanceSlider');
  if (slider) {
    slider.addEventListener('input', (e) => {
      appState.maxDistanceKm = parseFloat(e.target.value);
      const label = document.getElementById('distanceLabel');
      if (label) label.innerText = `${appState.maxDistanceKm} km`;
      renderProvidersGrid();
      initOrUpdateLeafletMap();
    });
  }
}

function selectCategory(catId) {
  appState.selectedCategory = catId;
  renderMain();
}

function toggleBarterFilter(isChecked) {
  appState.barterOnlyFilter = isChecked;
  renderProvidersGrid();
  initOrUpdateLeafletMap();
}

function getFilteredProviders() {
  return appState.providers.filter(p => {
    if (appState.selectedCategory !== 'all' && p.category !== appState.selectedCategory) return false;
    if (p.distanceKm > appState.maxDistanceKm) return false;
    if (appState.barterOnlyFilter && !p.barterAvailable) return false;
    if (appState.searchQuery.trim() !== '') {
      const q = appState.searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCat = p.categoryName.toLowerCase().includes(q);
      const matchOffered = p.offeredSkill.toLowerCase().includes(q);
      const matchSeeking = p.seekingSkill.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchOffered && !matchSeeking) return false;
    }
    return true;
  });
}

function renderProvidersGrid() {
  const grid = document.getElementById('providersGridContainer');
  const countBadge = document.getElementById('resultsCountBadge');
  if (!grid) return;

  const filtered = getFilteredProviders();

  if (countBadge) {
    countBadge.innerText = `Showing ${filtered.length} pros`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
        <h4>No skilled professionals found in this range</h4>
        <p style="color: var(--text-muted); margin-top: 0.4rem;">Try expanding your search radius slider or clearing category filters.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="provider-card">
      <div>
        <div class="card-top">
          <div class="provider-img-wrap">
            ${renderAvatar(p.name, 64, 'provider-img')}
            ${p.isVerified ? `<div class="verified-badge" title="Verified Professional">✓</div>` : ''}
          </div>
          <div class="provider-meta">
            <h4 class="provider-name">${p.name}</h4>
            <div class="provider-cat">${p.categoryName}</div>
            <div class="rating-row">
              <span class="star-rating">★ ${p.rating}</span>
              <span style="color: var(--text-muted);">(${p.reviewsCount} reviews) • ${p.distanceKm} km</span>
            </div>
          </div>
        </div>

        ${p.barterAvailable ? `
          <div class="barter-badge">
            🤝 Skill Barter Available
          </div>
        ` : `
          <div class="barter-badge" style="background: #F1F5F9; color: var(--text-muted); border-color: var(--border-color);">
            💳 Direct Booking
          </div>
        `}

        <div class="skill-details-box">
          <div class="offered-line"><strong>Offers:</strong> ${p.offeredSkill}</div>
          ${p.barterAvailable ? `<div class="seeking-line"><strong>Wants:</strong> ${p.seekingSkill}</div>` : ''}
        </div>
      </div>

      <div class="card-footer">
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          <div class="hourly-rate-pill" style="align-self: flex-start;">
            ⏱️ ₹${p.hourlyRate || 150} / hr
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">
            ${p.barterAvailable ? '🤝 Barter or Hourly Pay' : '⚡ Hourly Payment'}
          </div>
        </div>
        <div class="card-btn-group">
          ${p.barterAvailable ? `
            <button class="btn-sm-barter" onclick="openBookingModal('${p.id}', 'barter')">🤝 Barter</button>
          ` : ''}
          <button class="btn-sm-book" onclick="openBookingModal('${p.id}', 'monetary')">⏱️ Hire Worker (₹${p.hourlyRate || 150}/hr)</button>
        </div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   REAL LEAFLET MAP INITIALIZATION & UPDATE
   ========================================================================== */

function initOrUpdateLeafletMap() {
  const mapContainer = document.getElementById('leafletMapContainer');
  if (!mapContainer || typeof L === 'undefined') return;

  const centerLat = 12.9716;
  const centerLng = 77.5946;

  if (!leafletMapInstance) {
    leafletMapInstance = L.map('leafletMapContainer', {
      center: [centerLat, centerLng],
      zoom: 12,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(leafletMapInstance);

    leafletMarkersGroup = L.layerGroup().addTo(leafletMapInstance);
  } else {
    leafletMapInstance.invalidateSize();
  }

  if (leafletMarkersGroup) leafletMarkersGroup.clearLayers();
  if (leafletRadiusCircle) leafletMapInstance.removeLayer(leafletRadiusCircle);

  leafletRadiusCircle = L.circle([centerLat, centerLng], {
    radius: appState.maxDistanceKm * 1000,
    color: '#09090B',
    weight: 2,
    opacity: 0.6,
    fillColor: '#09090B',
    fillOpacity: 0.05
  }).addTo(leafletMapInstance);

  const filtered = getFilteredProviders();

  filtered.forEach(p => {
    const customIcon = L.divIcon({
      className: 'custom-map-pin-wrap',
      html: `<div class="custom-map-icon"><span>⚡</span> ${p.name.split(' ')[0]} (${p.distanceKm}km)</div>`,
      iconSize: [120, 30],
      iconAnchor: [60, 15]
    });

    const popupHTML = `
      <div class="map-popup-card">
        <h4>${p.name}</h4>
        <div class="cat">${p.categoryName} • ★ ${p.rating}</div>
        <div class="skills">
          <div><strong>Offers:</strong> ${p.offeredSkill}</div>
          ${p.barterAvailable ? `<div style="color: #64748B; margin-top: 2px;"><strong>Wants:</strong> ${p.seekingSkill}</div>` : ''}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.6rem;">
          <span class="hourly-rate-pill" style="font-size: 0.75rem;">⏱️ ₹${p.hourlyRate || 150}/hr</span>
          <button class="btn-sm-barter" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;" onclick="openBookingModal('${p.id}', 'monetary')">
            ⏱️ Hire Worker
          </button>
        </div>
      </div>
    `;

    const marker = L.marker([p.lat, p.lng], { icon: customIcon })
      .bindPopup(popupHTML);

    leafletMarkersGroup.addLayer(marker);
  });
}

/* ==========================================================================
   SKILL BARTER HUB VIEW
   ========================================================================== */

function getBarterHubViewHTML() {
  const barterPros = appState.providers.filter(p => p.barterAvailable);

  return `
    <div class="diagram-canvas-wrap" style="margin-bottom: 2rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2>🤝 Skill Exchange (Barter) Marketplace</h2>
          <p style="color: var(--text-muted); margin-top: 0.3rem;">Exchange knowledge & services with local neighbors without monetary payment!</p>
        </div>
        <button class="btn-primary" onclick="switchAuthMode('registerWorker')">+ Register as Worker Pro</button>
      </div>
    </div>

    <div class="providers-grid">
      ${barterPros.map(p => `
        <div class="provider-card">
          <div>
            <div class="card-top">
              <div class="provider-img-wrap">
                ${renderAvatar(p.name, 64, 'provider-img')}
              </div>
              <div class="provider-meta">
                <h4 class="provider-name">${p.name}</h4>
                <div class="provider-cat">${p.categoryName}</div>
                <div class="rating-row">
                  <span class="star-rating">★ ${p.rating}</span>
                  <span style="color: var(--text-muted);">${p.locationName}</span>
                </div>
              </div>
            </div>

            <div class="barter-badge">
              🤝 Active Skill Exchange Offer
            </div>

            <div class="skill-details-box">
              <div class="offered-line"><strong>Offered Service:</strong> ${p.offeredSkill}</div>
              <div class="seeking-line" style="margin-top: 0.4rem;"><strong>Wants in Exchange:</strong> ${p.seekingSkill}</div>
            </div>
            
            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 1rem;">"${p.bio}"</p>
          </div>

          <div class="card-footer">
            <span style="font-size: 0.82rem; color: var(--text-main); font-weight: 700;">Zero Monetary Payment</span>
            <button class="btn-sm-barter" onclick="openBookingModal('${p.id}', 'barter')">Propose Exchange</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ==========================================================================
   BOOKINGS TRACKER VIEW
   ========================================================================== */

function getBookingsViewHTML() {
  return `
    <div class="diagram-canvas-wrap">
      <div class="diagram-header-bar" style="margin-bottom: 1.5rem;">
        <h3>📅 My Service Bookings & Skill Barter Contracts</h3>
        <p>Track pending requests, active working hours, hourly payment breakdowns, and official receipts.</p>
      </div>

      <div class="table-responsive">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.82rem; text-transform: uppercase;">
              <th style="padding: 1rem;">Booking ID</th>
              <th style="padding: 1rem;">Service Provider</th>
              <th style="padding: 1rem;">Working Hours & Rate</th>
              <th style="padding: 1rem;">Payment Option & Total</th>
              <th style="padding: 1rem;">Date & Time</th>
              <th style="padding: 1rem;">Status</th>
              <th style="padding: 1rem;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${appState.bookings.map(b => {
              const isBarter = b.type === 'barter';
              const rate = b.hourlyRate || 150;
              const hasHours = isBarter || b.status === 'Completed' || b.hoursLogged;
              const hours = b.hours || (isBarter ? 2 : 0);
              const totalAmount = isBarter ? 0 : (b.amount || Math.round(hours * rate));

              return `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 1rem; font-weight: 700; color: #09090B;">${b.id}</td>
                <td style="padding: 1rem;">
                  <strong style="display: block;">${b.providerName}</strong>
                  <span style="font-size: 0.78rem; color: var(--text-muted);">${b.serviceTitle}</span>
                </td>
                <td style="padding: 1rem;">
                  ${isBarter ? `
                    <span class="barter-badge" style="margin: 0;">🤝 ${hours} hr Barter Session</span>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">Offer: ${b.offeredSkill}</div>
                  ` : hasHours ? `
                    <div style="font-weight: 700; color: #09090B; font-size: 0.92rem;">⏱️ ${hours} ${hours === 1 ? 'Hour' : 'Hours'}</div>
                    <div style="font-size: 0.78rem; color: #16A34A; font-weight: 600;">✓ Completed by Worker (@ ₹${rate}/hr)</div>
                  ` : `
                    <div style="font-weight: 700; color: #09090B;">Rate: ₹${rate}/hr</div>
                    <span style="font-size: 0.75rem; color: #D97706; font-weight: 600;">⏳ Worker will log time on completion</span>
                  `}
                </td>
                <td style="padding: 1rem;">
                  ${isBarter ? `
                    <strong style="color: #09090B;">₹0 (Skill Barter)</strong>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Zero Monetary Fee</div>
                  ` : hasHours ? `
                    <strong style="color: #09090B; font-size: 0.98rem;">₹${totalAmount}</strong>
                    <div style="font-size: 0.75rem; color: #16A34A; font-weight: 700;">✓ Finalized Bill</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      💳 ${b.paymentMethod || 'UPI Hourly'}
                    </div>
                  ` : `
                    <strong style="color: #09090B;">Pending Hours Log</strong>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">+₹${b.customerFee || 20} Booking Fee</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      💳 ${b.paymentMethod || 'Pay after completion'}
                    </div>
                  `}
                </td>
                <td style="padding: 1rem; color: var(--text-muted);">${b.date} at ${b.time}</td>
                <td style="padding: 1rem;">
                  ${b.status === 'Confirmed' ? `<span style="color: #09090B; font-weight: 700;">● Confirmed</span>` : ''}
                  ${b.status === 'Pending' ? `<span style="color: var(--text-muted); font-weight: 700;">● Pending Approval</span>` : ''}
                  ${b.status === 'Completed' ? `<span style="color: #16A34A; font-weight: 700;">✓ Completed</span>` : ''}
                </td>
                <td style="padding: 1rem;">
                  <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                    <button class="btn-sm-book" onclick="openChatWithProvider('${b.providerId}')">💬 Chat</button>
                    <button class="btn-sm-book" style="background: #F1F5F9; color: #09090B; border: 1px solid var(--border-color);" onclick="showBookingReceipt('${b.id}')">🧾 Receipt</button>
                    ${b.status !== 'Completed' ? `
                      ${isBarter ? `
                        <button class="btn-sm-barter" onclick="markBookingComplete('${b.id}')">✓ Done</button>
                      ` : `
                        <button class="btn-sm-book" style="font-size: 0.75rem;" onclick="showToast('Worker logs actual working time on-site to finalize your bill!')">ℹ️ Info</button>
                      `}
                    ` : `
                      <button class="btn-sm-book" onclick="openReviewModal('${b.providerId}')">★ Review</button>
                    `}
                  </div>
                </td>
              </tr>
            `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function markBookingComplete(bookingId) {
  const bok = appState.bookings.find(b => b.id === bookingId);
  if (bok) {
    bok.status = 'Completed';
    showToast(`Booking ${bookingId} marked as Completed!`);
    renderMain();
  }
}

/* ==========================================================================
   CHAT MESSAGING VIEW
   ========================================================================== */

function getChatViewHTML() {
  const activeChat = appState.chats.find(c => c.providerId === appState.activeChatProviderId) || appState.chats[0];

  return `
    <div class="chat-container">
      <!-- Sidebar -->
      <div class="chat-sidebar">
        <div style="padding: 1rem; border-bottom: 1px solid var(--border-color); font-weight: 800; font-size: 0.95rem;">
          💬 Active Conversations
        </div>
        ${appState.chats.map(c => `
          <div class="chat-user-item ${c.providerId === activeChat.providerId ? 'active' : ''}" onclick="selectChatProvider('${c.providerId}')">
            ${renderAvatar(c.providerName, 40, 'provider-img')}
            <div>
              <div style="font-weight: 700; font-size: 0.9rem;">${c.providerName}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); text-overflow: ellipsis; white-space: nowrap; overflow: hidden; max-width: 170px;">
                ${c.messages[c.messages.length - 1]?.text || 'No messages yet'}
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Main Chat Area -->
      <div class="chat-main">
        <div class="chat-header">
          ${renderAvatar(activeChat.providerName, 38, 'provider-img')}
          <div>
            <div style="font-weight: 800;">${activeChat.providerName}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">● Online | Verified Skill Provider</div>
          </div>
        </div>

        <div class="chat-messages" id="chatMessagesBox">
          ${activeChat.messages.map(m => `
            <div class="chat-bubble ${m.sender}">
              <div>${m.text}</div>
              <small style="display: block; font-size: 0.65rem; opacity: 0.7; margin-top: 0.3rem; text-align: right;">${m.time}</small>
            </div>
          `).join('')}
        </div>

        <div class="chat-input-bar">
          <input type="text" id="chatInputText" class="form-input" placeholder="Type a message or discuss skill exchange details..." onkeypress="handleChatKeyPress(event)">
          <button class="btn-primary" onclick="sendMessage()">Send</button>
        </div>
      </div>
    </div>
  `;
}

function selectChatProvider(providerId) {
  appState.activeChatProviderId = providerId;
  renderMain();
}

function openChatWithProvider(providerId) {
  let chat = appState.chats.find(c => c.providerId === providerId);
  if (!chat) {
    const provider = appState.providers.find(p => p.id === providerId);
    if (provider) {
      chat = {
        providerId: provider.id,
        providerName: provider.name,
        avatar: provider.avatar,
        messages: [{ sender: 'provider', text: `Namaste! Thanks for reaching out regarding ${provider.categoryName}. How can I help?`, time: 'Just now' }]
      };
      appState.chats.push(chat);
    }
  }
  appState.activeChatProviderId = providerId;
  switchTab('chat');
}

function setupChatListeners() {
  const box = document.getElementById('chatMessagesBox');
  if (box) box.scrollTop = box.scrollHeight;
}

function handleChatKeyPress(e) {
  if (e.key === 'Enter') sendMessage();
}

async function sendMessage() {
  const input = document.getElementById('chatInputText');
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  const providerId = appState.activeChatProviderId;
  input.value = '';

  const activeChat = appState.chats.find(c => c.providerId === providerId);
  if (activeChat) {
    activeChat.messages.push({ sender: 'user', text: text, time: 'Just now' });
    renderMain();

    // ── Supabase: Save chat message to cloud ──────────────────────────────
    if (typeof saveChatMessageToSupabase === 'function') {
      await saveChatMessageToSupabase(providerId, 'user', text, 'Just now');
    }

    setTimeout(() => {
      activeChat.messages.push({ sender: 'provider', text: `Ji, received your message! Will confirm time slot shortly.`, time: 'Just now' });
      renderMain();
    }, 1200);
  }
}

/* ==========================================================================
   ADMIN DASHBOARD VIEW
   ========================================================================== */

function getAdminDashboardViewHTML() {
  const totalGMV = appState.bookings.reduce((sum, b) => sum + (b.grossAmount || (b.type === 'monetary' ? b.amount : 0) || 0), 0);
  const totalPlatformRevenue = appState.bookings.reduce((sum, b) => sum + (b.platformRevenue || 0), 0);
  const totalWorkerCommission = appState.bookings.reduce((sum, b) => sum + (b.workerCommission || 0), 0);
  const totalCustomerFees = appState.bookings.reduce((sum, b) => sum + (b.customerFee || 0), 0);
  const totalWorkerPayouts = appState.bookings.reduce((sum, b) => sum + (b.workerNetPayout || 0), 0);
  const commPercent = appState.platformCommission?.workerCommissionPercent ?? 8;
  const custFee = appState.platformCommission?.customerBookingFee ?? 20;

  return `
    <div class="diagram-canvas-wrap" style="margin-bottom: 2rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2>🛡️ Administrator & Monetization Control Center</h2>
          <p style="color: var(--text-muted); margin-top: 0.3rem;">Platform Revenue Analytics, Worker Commission Ledger, & Account Moderation.</p>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="badge-pill" style="background: #16A34A; color: #FFFFFF;">● Live Monetization Engine</span>
          <span class="badge-pill" style="background: #09090B; color: #FFFFFF;">● Admin Privileges Active</span>
        </div>
      </div>

      <!-- Financial & Platform KPIs Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1.2rem; margin-top: 1.5rem;">
        <div style="background: linear-gradient(135deg, #09090B 0%, #1E293B 100%); color: #FFFFFF; padding: 1.3rem; border-radius: var(--radius-md); box-shadow: 0 4px 15px rgba(0,0,0,0.12);">
          <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: #94A3B8;">Total Platform Revenue</div>
          <div style="font-size: 1.9rem; font-weight: 800; color: #4ADE80; margin-top: 0.4rem;">₹${totalPlatformRevenue.toLocaleString('en-IN')}</div>
          <div style="font-size: 0.72rem; color: #CBD5E1; margin-top: 0.3rem;">Worker Commissions + Booking Fees</div>
        </div>

        <div style="background: #F8FAFC; border: 1px solid var(--border-color); padding: 1.2rem; border-radius: var(--radius-md);">
          <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">Gross Service GMV</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: #09090B; margin-top: 0.4rem;">₹${totalGMV.toLocaleString('en-IN')}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">Total gross customer billing</div>
        </div>

        <div style="background: #F8FAFC; border: 1px solid var(--border-color); padding: 1.2rem; border-radius: var(--radius-md);">
          <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">Worker Commissions (${commPercent}%)</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: #DC2626; margin-top: 0.4rem;">₹${totalWorkerCommission.toLocaleString('en-IN')}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">Retained from worker payouts</div>
        </div>

        <div style="background: #F8FAFC; border: 1px solid var(--border-color); padding: 1.2rem; border-radius: var(--radius-md);">
          <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">Customer Booking Fees (₹${custFee})</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: #2563EB; margin-top: 0.4rem;">₹${totalCustomerFees.toLocaleString('en-IN')}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">Platform safety & service charges</div>
        </div>

        <div style="background: #F8FAFC; border: 1px solid var(--border-color); padding: 1.2rem; border-radius: var(--radius-md);">
          <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">Net Worker Payouts</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: #16A34A; margin-top: 0.4rem;">₹${totalWorkerPayouts.toLocaleString('en-IN')}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">Disbursed directly to workers</div>
        </div>
      </div>
    </div>

    <!-- Monetization Settings & Commission Control Box -->
    <div class="diagram-canvas-wrap" style="margin-bottom: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.2rem;">
        <div>
          <h3>⚙️ Platform Monetization & Commission Rate Settings</h3>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.2rem;">Configure platform cut rates. Changes apply immediately to new customer bookings.</p>
        </div>
        <span class="badge-pill" style="background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE;">🤝 Barter Skill Exchanges: ₹0 (100% Free)</span>
      </div>

      <form onsubmit="updatePlatformCommissionSettings(event)" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.2rem; align-items: end; background: #F8FAFC; padding: 1.25rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="font-size: 0.82rem;">Worker Booking Commission (%) *</label>
          <div style="position: relative;">
            <input type="number" id="adminWorkerCommissionInput" class="form-input" min="0" max="50" step="0.5" value="${commPercent}" required style="font-weight: 800; padding-right: 2.5rem;">
            <span style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); font-weight: 800; color: var(--text-muted);">%</span>
          </div>
          <small style="color: var(--text-muted); display: block; margin-top: 0.3rem;">Deducted from completed worker service fees</small>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="font-size: 0.82rem;">Customer Platform Booking Fee (₹) *</label>
          <div style="position: relative;">
            <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-weight: 800; color: #09090B;">₹</span>
            <input type="number" id="adminCustomerFeeInput" class="form-input" min="0" max="500" step="5" value="${custFee}" required style="font-weight: 800; padding-left: 2.2rem;">
          </div>
          <small style="color: var(--text-muted); display: block; margin-top: 0.3rem;">Flat convenience & safety fee charged per booking</small>
        </div>

        <div>
          <button type="submit" class="btn-primary" style="width: 100%; height: 44px;">💾 Update Commission Rates</button>
        </div>
      </form>
    </div>

    <!-- Live Commission Ledger & Transaction Audit -->
    <div class="diagram-canvas-wrap" style="margin-bottom: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.8rem;">
        <div>
          <h3>💼 Platform Commission Ledger & Financial Audit</h3>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.2rem;">Real-time breakdown of all bookings, gross billing, fees, commissions, and worker payouts.</p>
        </div>
        <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">${appState.bookings.length} Total Bookings Recorded</span>
      </div>

      <div class="table-responsive">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-muted); background: #F8FAFC;">
              <th style="padding: 0.75rem;">Booking</th>
              <th style="padding: 0.75rem;">Worker & Service</th>
              <th style="padding: 0.75rem;">Customer</th>
              <th style="padding: 0.75rem; text-align: right;">Gross Billed</th>
              <th style="padding: 0.75rem; text-align: right;">Customer Fee</th>
              <th style="padding: 0.75rem; text-align: right;">Worker Comm. (${commPercent}%)</th>
              <th style="padding: 0.75rem; text-align: right;">Platform Rev.</th>
              <th style="padding: 0.75rem; text-align: right;">Worker Payout</th>
              <th style="padding: 0.75rem; text-align: center;">Audit Bill</th>
            </tr>
          </thead>
          <tbody>
            ${appState.bookings.map(b => {
              const isBarter = b.type === 'barter';
              const gross = b.grossAmount ?? (isBarter ? 0 : (b.hours * b.hourlyRate));
              const fee = b.customerFee ?? (isBarter ? 0 : custFee);
              const comm = b.workerCommission ?? (isBarter ? 0 : Math.round(gross * (commPercent / 100)));
              const rev = b.platformRevenue ?? (fee + comm);
              const net = b.workerNetPayout ?? (isBarter ? 0 : (gross - comm));

              return `
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 0.75rem;">
                    <div style="font-weight: 800; color: #09090B;">${b.id}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${b.date}</div>
                  </td>
                  <td style="padding: 0.75rem;">
                    <div style="font-weight: 700; color: #09090B;">${b.providerName}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${b.serviceTitle} (${b.hours} hrs)</div>
                  </td>
                  <td style="padding: 0.75rem; color: #09090B; font-weight: 600;">
                    ${b.customerName || 'Rahul Verma'}
                  </td>
                  <td style="padding: 0.75rem; text-align: right; font-weight: 800; color: #09090B;">
                    ${isBarter ? '<span style="color: #64748B;">🤝 Barter</span>' : `₹${gross}`}
                  </td>
                  <td style="padding: 0.75rem; text-align: right; font-weight: 700; color: #2563EB;">
                    ${isBarter ? '₹0' : `+₹${fee}`}
                  </td>
                  <td style="padding: 0.75rem; text-align: right;">
                    ${isBarter ? '₹0' : `<span class="commission-badge">-₹${comm}</span>`}
                  </td>
                  <td style="padding: 0.75rem; text-align: right; font-weight: 800; color: #16A34A;">
                    ${isBarter ? '₹0' : `₹${rev}`}
                  </td>
                  <td style="padding: 0.75rem; text-align: right;">
                    ${isBarter ? '<span style="color: #64748B;">Skill Exchange</span>' : `<span class="payout-tag">₹${net}</span>`}
                  </td>
                  <td style="padding: 0.75rem; text-align: center;">
                    <button class="btn-sm-book" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="showBookingReceipt('${b.id}')">🧾 Receipt</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Moderate Providers List -->
    <div class="diagram-canvas-wrap">
      <h3>User Verification & Account Security</h3>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem;">Toggle identity verification badges or suspend suspicious service profiles.</p>

      <div class="table-responsive">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
              <th style="padding: 0.8rem;">Provider Name</th>
              <th style="padding: 0.8rem;">Category</th>
              <th style="padding: 0.8rem;">Rating</th>
              <th style="padding: 0.8rem;">Verification Status</th>
              <th style="padding: 0.8rem;">Admin Action</th>
            </tr>
          </thead>
          <tbody>
            ${appState.providers.map(p => `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.8rem; font-weight: 700; color: #09090B;">${p.name}</td>
                <td style="padding: 0.8rem; color: var(--text-muted);">${p.categoryName}</td>
                <td style="padding: 0.8rem; color: #09090B;">★ ${p.rating}</td>
                <td style="padding: 0.8rem;">
                  ${p.isVerified ? `
                    <span style="color: #09090B; font-weight: 700;">✓ Verified ID</span>
                  ` : `
                    <span style="color: var(--text-muted); font-weight: 700;">⚠️ Unverified</span>
                  `}
                </td>
                <td style="padding: 0.8rem;">
                  <button class="btn-sm-book" onclick="toggleProviderVerification('${p.id}')">
                    ${p.isVerified ? 'Revoke Badge' : 'Approve & Verify'}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.updatePlatformCommissionSettings = function(e) {
  e.preventDefault();
  const workerPct = parseFloat(document.getElementById('adminWorkerCommissionInput')?.value);
  const custFee = parseFloat(document.getElementById('adminCustomerFeeInput')?.value);
  if (isNaN(workerPct) || workerPct < 0 || isNaN(custFee) || custFee < 0) {
    showToast('Please enter valid numbers for commission rates');
    return;
  }
  appState.platformCommission = {
    workerCommissionPercent: workerPct,
    customerBookingFee: custFee
  };
  showToast(`✅ Monetization updated: ${workerPct}% worker commission & ₹${custFee} booking fee!`);
  renderMain();
};

function toggleProviderVerification(providerId) {
  const p = appState.providers.find(prov => prov.id === providerId);
  if (p) {
    p.isVerified = !p.isVerified;
    showToast(`Verification status updated for ${p.name}`);
    renderMain();
  }
}

/* ==========================================================================
   MODALS & SUBMISSIONS
   ========================================================================== */

function isPreBookedHoursCategory(category) {
  const sessionCategories = ['tutor', 'designer', 'freelancer', 'frontend', 'web-developer', 'photographer', 'videographer', 'dj'];
  return sessionCategories.includes(category);
}

function openBookingModal(providerId, defaultType = 'monetary') {
  const p = appState.providers.find(prov => prov.id === providerId);
  if (!p) return;

  appState.selectedProviderForBooking = p;
  appState.bookingType = defaultType;

  const modal = document.getElementById('bookingModal');
  const modalBody = document.getElementById('bookingModalBody');
  const hourlyRate = p.hourlyRate || 150;
  const isPreBooked = isPreBookedHoursCategory(p.category);
  const initialHours = 2;
  const initialGross = Math.round(hourlyRate * initialHours);
  const customerFee = appState.platformCommission?.customerBookingFee ?? 20;
  const commissionPercent = appState.platformCommission?.workerCommissionPercent ?? 8;
  const initialWorkerCommission = Math.round(initialGross * (commissionPercent / 100));
  const initialWorkerNet = initialGross - initialWorkerCommission;
  const initialCustomerTotal = initialGross + customerFee;

  if (modal && modalBody) {
    modalBody.innerHTML = `
      <div class="modal-header">
        <div>
          <h3 class="modal-title">Request Service: ${p.name}</h3>
          <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">Worker ID: ${p.workerId || p.id} • ${p.categoryName}</span>
        </div>
        <button class="modal-close" onclick="closeModal('bookingModal')">✕</button>
      </div>

      <div style="display: flex; gap: 0.5rem; margin-bottom: 1.2rem; background: #F1F5F9; padding: 0.35rem; border-radius: var(--radius-sm);">
        <button class="nav-tab ${defaultType === 'monetary' ? 'active' : ''}" style="flex: 1; justify-content: center; font-size: 0.85rem;" onclick="switchModalBookingType('monetary')">
          ${isPreBooked ? '⏱️ Book Working Hours' : '🛠️ Request Service (Pay After Duty)'}
        </button>
        ${p.barterAvailable ? `
          <button class="nav-tab ${defaultType === 'barter' ? 'active' : ''}" style="flex: 1; justify-content: center; font-size: 0.85rem;" onclick="switchModalBookingType('barter')">
            🤝 Skill Exchange (Barter)
          </button>
        ` : ''}
      </div>

      <form id="bookingForm" onsubmit="handleBookingSubmit(event)">
        <div class="form-group">
          <label class="form-label">Requested Service Title *</label>
          <input type="text" id="serviceTitleInput" class="form-input" required value="${p.offeredSkill.split('&')[0]}">
        </div>

        ${defaultType === 'barter' ? `
          <div class="form-group" style="background: #F8FAFC; border: 1px solid var(--border-color); padding: 1rem; border-radius: var(--radius-sm);">
            <label class="form-label" style="color: var(--text-main);">Your Offered Skill in Return (Barter Offer) *</label>
            <input type="text" id="offeredSkillInput" class="form-input" required placeholder="e.g. Python Programming, Guitar Basics, Spoken English">
            <small style="color: var(--text-muted); display: block; margin-top: 0.4rem;">Worker looking to learn: <strong>${p.seekingSkill}</strong></small>
          </div>

          <div class="form-group">
            <label class="form-label">Mutual Barter Session Duration</label>
            <div class="hour-chips-grid">
              <button type="button" class="btn-hour-chip" data-barter-hours="1" onclick="selectBarterHours(1)">1 hr Session</button>
              <button type="button" class="btn-hour-chip active" data-barter-hours="2" onclick="selectBarterHours(2)">2 hrs Session</button>
              <button type="button" class="btn-hour-chip" data-barter-hours="3" onclick="selectBarterHours(3)">3 hrs Session</button>
              <button type="button" class="btn-hour-chip" data-barter-hours="4" onclick="selectBarterHours(4)">4 hrs Session</button>
            </div>
            <input type="hidden" id="barterHoursInput" value="2">
          </div>
        ` : isPreBooked ? `
          <!-- Worker Standard Hourly Rate Banner for Pre-booked Hours (Tutors, Designers, etc.) -->
          <div style="background: #F8FAFC; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.85rem 1rem; margin-bottom: 1.1rem; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); font-weight: 700; display: block;">Session Hourly Rate</span>
              <span style="font-size: 1.3rem; font-weight: 800; color: #09090B;">₹${hourlyRate} <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-muted);">/ hour</span></span>
            </div>
            <div style="text-align: right;">
              <span class="hourly-rate-pill" style="font-size: 0.78rem;">⏱️ Scheduled Hours</span>
              <div style="font-size: 0.72rem; color: #2563EB; font-weight: 700; margin-top: 0.2rem;">₹${customerFee} Platform Booking Fee</div>
            </div>
          </div>

          <!-- Working Hours Needed Selector for Specified Workers -->
          <div class="form-group">
            <label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">
              <span>Working Hours Required *</span>
              <span id="hoursDisplayLabel" style="font-weight: 800; color: #09090B; font-size: 0.95rem;">${initialHours} Hours</span>
            </label>
            <div class="hour-chips-grid">
              <button type="button" class="btn-hour-chip" data-hours="1" onclick="selectBookingHours(1)">1 hr</button>
              <button type="button" class="btn-hour-chip active" data-hours="2" onclick="selectBookingHours(2)">2 hrs</button>
              <button type="button" class="btn-hour-chip" data-hours="3" onclick="selectBookingHours(3)">3 hrs</button>
              <button type="button" class="btn-hour-chip" data-hours="4" onclick="selectBookingHours(4)">4 hrs (Half Day)</button>
              <button type="button" class="btn-hour-chip" data-hours="6" onclick="selectBookingHours(6)">6 hrs</button>
              <button type="button" class="btn-hour-chip" data-hours="8" onclick="selectBookingHours(8)">8 hrs (Full Day)</button>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-top: 0.4rem;">
              <input type="range" id="bookingHoursSlider" min="0.5" max="12" step="0.5" value="${initialHours}" class="form-range" style="flex: 1; accent-color: #09090B; cursor: pointer;" oninput="onHoursSliderChange(this.value)">
              <div style="display: flex; align-items: center; gap: 0.3rem;">
                <input type="number" id="bookingHoursInput" min="0.5" max="24" step="0.5" value="${initialHours}" class="form-input" style="width: 75px; text-align: center; font-weight: 800; padding: 0.45rem 0.5rem;" oninput="onHoursInputChange(this.value)">
                <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted);">hrs</span>
              </div>
            </div>
          </div>

          <!-- Dynamic Live Hourly Payment & Commission Calculation Breakdown -->
          <div class="hourly-calc-box">
            <div class="calc-line">
              <span>Worker Service Rate (₹${hourlyRate}/hr × <span id="summaryHours">${initialHours}</span> hrs)</span>
              <span id="summaryGross" style="font-weight: 700; color: #FFFFFF;">₹${initialGross}</span>
            </div>
            <div class="calc-line">
              <span>SkillConnect Platform & Safety Fee (Fixed)</span>
              <span id="summaryCustomerFee" style="color: #60A5FA; font-weight: 700;">+₹${customerFee}</span>
            </div>
            <div class="calc-total-row">
              <div>
                <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: #94A3B8;">Total Customer Payable</div>
                <div style="font-size: 0.72rem; color: #CBD5E1;">Service charge + secure booking fee</div>
              </div>
              <div class="calc-total-amount" id="summaryTotalAmount">
                ₹${initialCustomerTotal}
              </div>
            </div>
            <div style="margin-top: 0.75rem; padding-top: 0.6rem; border-top: 1px dashed rgba(255,255,255,0.15); display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #94A3B8;">
              <span>Worker Take-Home Payout (${commissionPercent}% platform commission):</span>
              <span id="summaryWorkerNet" style="color: #4ADE80; font-weight: 800;">₹${initialWorkerNet}</span>
            </div>
          </div>

          <!-- Worker Working Hour Payment Option Selection -->
          <div class="form-group">
            <label class="form-label">Select Payment Option for Working Hours *</label>
            <select id="paymentMethodSelect" class="form-select">
              <option value="UPI (Instant Hourly Transfer via GPay / PhonePe / Paytm)">UPI (Instant Hourly Transfer via GPay / PhonePe / Paytm)</option>
              <option value="Cash to Worker After Work Completion (COD)">Cash to Worker After Work Completion (COD)</option>
              <option value="Credit / Debit Card (Online Secure Gateway)">Credit / Debit Card (Online Secure Gateway)</option>
              <option value="Net Banking (Direct Bank Payout)">Net Banking (Direct Bank Payout)</option>
              <option value="SkillConnect Escrow Hold (Released on Job Signoff)">SkillConnect Escrow Hold (Released on Job Signoff)</option>
            </select>
          </div>
        ` : `
          <!-- Duty-Based Worker Rate & Pay When Duty Is Over Notice (Electricians, Plumbers, Mechanics, etc.) -->
          <div style="background: #F8FAFC; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 1.1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <div>
                <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); font-weight: 700; display: block;">Worker Duty Rate</span>
                <span style="font-size: 1.3rem; font-weight: 800; color: #09090B;">₹${hourlyRate} <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-muted);">/ hour</span></span>
              </div>
              <span class="badge-pill" style="background: #FEF3C7; color: #92400E; font-size: 0.78rem; font-weight: 700; padding: 0.35rem 0.75rem;">
                ⏱️ Pay When Duty Is Over
              </span>
            </div>

            <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.8rem; margin: 0.6rem 0;">
              <div style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.82rem; color: #09090B; line-height: 1.45;">
                <span style="font-size: 1.1rem; line-height: 1;">ℹ️</span>
                <div>
                  <strong>Hours not required upfront.</strong>
                  <div style="color: var(--text-muted); font-size: 0.76rem; margin-top: 0.15rem;">
                    For ${p.categoryName.toLowerCase()}s and on-site field technicians, duty hours are recorded after inspection and job completion on-site. Final payment is calculated and settled when duty is over.
                  </div>
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; border-top: 1px dashed var(--border-color); padding-top: 0.5rem; color: var(--text-muted);">
              <span>Platform Booking & Safety Fee:</span>
              <span style="font-weight: 700; color: #09090B;">₹${customerFee} (Fixed)</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Payment Method When Duty Is Over *</label>
            <select id="paymentMethodSelect" class="form-select">
              <option value="Cash to Worker After Work Completion (COD)">Cash to Worker After Duty Completion (COD)</option>
              <option value="UPI (Instant Transfer via GPay / PhonePe / Paytm on Job Finish)">UPI (GPay / PhonePe / Paytm on Job Finish)</option>
              <option value="Credit / Debit Card (Online after completion)">Credit / Debit Card (Online after completion)</option>
              <option value="SkillConnect Escrow Hold (Released on Job Signoff)">SkillConnect Escrow Hold (Released on Job Signoff)</option>
            </select>
          </div>
        `}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Preferred Date *</label>
            <input type="date" id="bookingDateInput" class="form-input" required value="2026-09-28">
          </div>
          <div class="form-group">
            <label class="form-label">Start Time Slot *</label>
            <input type="time" id="bookingTimeInput" class="form-input" required value="14:00">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Job Notes & Specific Instructions</label>
          <textarea id="bookingNotesInput" class="form-textarea" placeholder="Describe the job location, tools needed, or specific working hour preferences..."></textarea>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button type="button" class="btn-secondary" style="flex: 1;" onclick="closeModal('bookingModal')">Cancel</button>
          <button type="submit" class="btn-primary" style="flex: 1;">
            ${defaultType === 'barter' 
              ? 'Send Barter Proposal' 
              : isPreBooked 
                ? 'Confirm Request & Pay Hours' 
                : 'Confirm Booking (Pay When Duty Over)'}
          </button>
        </div>
      </form>
    `;
    modal.classList.add('active');
  }
}

function switchModalBookingType(type) {
  if (appState.selectedProviderForBooking) {
    openBookingModal(appState.selectedProviderForBooking.id, type);
  }
}

// ── Interactive Working Hours Selection & Calculation Handlers ─────────
window.selectBookingHours = function(hrs) {
  const slider = document.getElementById('bookingHoursSlider');
  const input = document.getElementById('bookingHoursInput');
  if (slider) slider.value = hrs;
  if (input) input.value = hrs;
  document.querySelectorAll('.btn-hour-chip[data-hours]').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.getAttribute('data-hours')) === parseFloat(hrs));
  });
  updateBookingHourlyCalculation();
};

window.onHoursSliderChange = function(hrs) {
  const input = document.getElementById('bookingHoursInput');
  if (input) input.value = hrs;
  document.querySelectorAll('.btn-hour-chip[data-hours]').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.getAttribute('data-hours')) === parseFloat(hrs));
  });
  updateBookingHourlyCalculation();
};

window.onHoursInputChange = function(hrs) {
  const slider = document.getElementById('bookingHoursSlider');
  const numHrs = parseFloat(hrs) || 0.5;
  if (slider) slider.value = Math.min(12, Math.max(0.5, numHrs));
  document.querySelectorAll('.btn-hour-chip[data-hours]').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.getAttribute('data-hours')) === numHrs);
  });
  updateBookingHourlyCalculation();
};

window.updateBookingHourlyCalculation = function() {
  const p = appState.selectedProviderForBooking;
  if (!p) return;
  const input = document.getElementById('bookingHoursInput');
  const hours = parseFloat(input?.value) || 1;
  const rate = parseFloat(p.hourlyRate) || 150;
  const gross = Math.round(hours * rate);
  const customerFee = appState.platformCommission?.customerBookingFee ?? 20;
  const commissionPercent = appState.platformCommission?.workerCommissionPercent ?? 8;
  const workerCommission = Math.round(gross * (commissionPercent / 100));
  const workerNet = gross - workerCommission;
  const totalCustomerPayable = gross + customerFee;

  const displayHours = document.getElementById('hoursDisplayLabel');
  const summaryHours = document.getElementById('summaryHours');
  const summaryGross = document.getElementById('summaryGross');
  const summaryCustomerFee = document.getElementById('summaryCustomerFee');
  const summaryTotalAmount = document.getElementById('summaryTotalAmount');
  const summaryWorkerNet = document.getElementById('summaryWorkerNet');

  if (displayHours) displayHours.innerText = `${hours} ${hours === 1 ? 'Hour' : 'Hours'}`;
  if (summaryHours) summaryHours.innerText = hours;
  if (summaryGross) summaryGross.innerText = `₹${gross}`;
  if (summaryCustomerFee) summaryCustomerFee.innerText = `+₹${customerFee}`;
  if (summaryTotalAmount) summaryTotalAmount.innerText = `₹${totalCustomerPayable}`;
  if (summaryWorkerNet) summaryWorkerNet.innerText = `₹${workerNet}`;
};

window.selectBarterHours = function(hrs) {
  const hiddenInput = document.getElementById('barterHoursInput');
  if (hiddenInput) hiddenInput.value = hrs;
  document.querySelectorAll('.btn-hour-chip[data-barter-hours]').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.getAttribute('data-barter-hours')) === parseFloat(hrs));
  });
};

// ── Worker Rate Editor Modal & Handler ──────────────────────────────────
window.openEditWorkerRateModal = function(providerId) {
  const p = appState.providers.find(prov => prov.id === providerId) || appState.loggedInUser;
  if (!p) return;

  const modal = document.getElementById('bookingModal');
  const modalBody = document.getElementById('bookingModalBody');
  if (!modal || !modalBody) return;

  modalBody.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">✏️ Update Your Working Hourly Rate</h3>
      <button class="modal-close" onclick="closeModal('bookingModal')">✕</button>
    </div>
    <form onsubmit="handleSaveWorkerRateSubmit(event, '${p.id}')">
      <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1.2rem;">
        Set your customer hourly working rate. Customer bookings will dynamically calculate total payments based on this rate and requested working hours.
      </p>
      <div class="form-group">
        <label class="form-label">Hourly Working Rate (₹ / hour) *</label>
        <div style="position: relative;">
          <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-weight: 800; font-size: 1.1rem; color: #09090B;">₹</span>
          <input type="number" id="editHourlyRateInput" class="form-input" min="50" max="10000" step="10" value="${p.hourlyRate || 150}" required style="padding-left: 2.2rem; font-size: 1.15rem; font-weight: 800;">
        </div>
        <small style="color: var(--text-muted); display: block; margin-top: 0.4rem;">Standard rate for ${p.categoryName || 'professionals'}: ₹150 - ₹500/hr</small>
      </div>

      <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
        <button type="button" class="btn-secondary" style="flex: 1;" onclick="closeModal('bookingModal')">Cancel</button>
        <button type="submit" class="btn-primary" style="flex: 1;">Save Hourly Rate</button>
      </div>
    </form>
  `;
  modal.classList.add('active');
};

window.handleSaveWorkerRateSubmit = async function(e, providerId) {
  e.preventDefault();
  const input = document.getElementById('editHourlyRateInput');
  const newRate = parseFloat(input?.value);
  if (isNaN(newRate) || newRate <= 0) {
    showToast('Please enter a valid hourly rate');
    return;
  }

  const p = appState.providers.find(prov => prov.id === providerId);
  if (p) p.hourlyRate = newRate;
  if (appState.loggedInUser && (appState.loggedInUser.id === providerId || appState.loggedInUser.workerId === providerId)) {
    appState.loggedInUser.hourlyRate = newRate;
  }

  if (typeof updateProviderHourlyRateInSupabase === 'function') {
    await updateProviderHourlyRateInSupabase(providerId, newRate);
  }

  closeModal('bookingModal');
  showToast(`✅ Hourly working rate updated to ₹${newRate}/hr!`);
  renderMain();
};

// ── Duty Completion & Post-Work Hours Logging Modal ─────────────────────
window.openLogWorkerHoursModal = function(bookingId) {
  const b = appState.bookings.find(bok => bok.id === bookingId);
  if (!b) return;

  const modal = document.getElementById('bookingModal');
  const modalBody = document.getElementById('bookingModalBody');
  if (!modal || !modalBody) return;

  const rate = parseFloat(b.hourlyRate) || 150;
  const initialHrs = 2;
  const customerFee = b.customerFee ?? 20;
  const initialGross = Math.round(initialHrs * rate);
  const commissionPercent = appState.platformCommission?.workerCommissionPercent ?? 8;
  const initialCommission = Math.round(initialGross * (commissionPercent / 100));
  const initialNet = initialGross - initialCommission;
  const initialTotal = initialGross + customerFee;

  modalBody.innerHTML = `
    <div class="modal-header">
      <div>
        <h3 class="modal-title">⏱️ Duty Finished: Log Working Hours</h3>
        <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">Booking ID: ${b.id} • Customer: ${b.customerName || 'Customer'}</span>
      </div>
      <button class="modal-close" onclick="closeModal('bookingModal')">✕</button>
    </div>

    <form id="logHoursForm" data-rate="${rate}" data-fee="${customerFee}" onsubmit="handleLogWorkerHoursSubmit(event, '${b.id}')">
      <div style="background: #F8FAFC; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.9rem; margin-bottom: 1.2rem;">
        <div style="font-weight: 700; color: #09090B; font-size: 0.95rem;">${b.serviceTitle}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">Your Agreed Hourly Duty Rate: <strong>₹${rate}/hour</strong></div>
      </div>

      <div class="form-group">
        <label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">
          <span>Actual Duty Hours Completed on Site *</span>
          <span id="logHoursDisplay" style="font-weight: 800; color: #09090B; font-size: 1rem;">${initialHrs} Hours</span>
        </label>
        <div class="hour-chips-grid">
          <button type="button" class="btn-hour-chip" data-log-hours="1" onclick="selectLogDutyHours(1)">1 hr</button>
          <button type="button" class="btn-hour-chip active" data-log-hours="2" onclick="selectLogDutyHours(2)">2 hrs</button>
          <button type="button" class="btn-hour-chip" data-log-hours="3" onclick="selectLogDutyHours(3)">3 hrs</button>
          <button type="button" class="btn-hour-chip" data-log-hours="4" onclick="selectLogDutyHours(4)">4 hrs (Half Day)</button>
          <button type="button" class="btn-hour-chip" data-log-hours="6" onclick="selectLogDutyHours(6)">6 hrs</button>
          <button type="button" class="btn-hour-chip" data-log-hours="8" onclick="selectLogDutyHours(8)">8 hrs (Full Day)</button>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-top: 0.5rem;">
          <input type="range" id="logHoursSlider" min="0.5" max="12" step="0.5" value="${initialHrs}" class="form-range" style="flex: 1; accent-color: #09090B; cursor: pointer;" oninput="onLogHoursSliderChange(this.value)">
          <div style="display: flex; align-items: center; gap: 0.3rem;">
            <input type="number" id="logHoursInput" min="0.5" max="24" step="0.5" value="${initialHrs}" class="form-input" style="width: 80px; text-align: center; font-weight: 800; padding: 0.45rem 0.5rem;" oninput="onLogHoursInputChange(this.value)">
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted);">hrs</span>
          </div>
        </div>
      </div>

      <!-- Live Settle Bill Breakdown -->
      <div class="hourly-calc-box">
        <div class="calc-line">
          <span>Duty Payment (<span id="logSummaryHours">${initialHrs}</span> hrs × ₹${rate}/hr)</span>
          <span id="logSummaryGross" style="font-weight: 700; color: #FFFFFF;">₹${initialGross}</span>
        </div>
        <div class="calc-line">
          <span>Platform Safety Fee</span>
          <span style="color: #60A5FA; font-weight: 700;">+₹${customerFee}</span>
        </div>
        <div class="calc-total-row">
          <div>
            <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: #94A3B8;">Total Customer Bill</div>
            <div style="font-size: 0.72rem; color: #CBD5E1;">Calculated based on completed duty hours</div>
          </div>
          <div class="calc-total-amount" id="logSummaryTotalAmount">
            ₹${initialTotal}
          </div>
        </div>
        <div style="margin-top: 0.75rem; padding-top: 0.6rem; border-top: 1px dashed rgba(255,255,255,0.15); display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #94A3B8;">
          <span>Your Net Take-Home Payout (after 8% platform fee):</span>
          <span id="logSummaryWorkerNet" style="color: #4ADE80; font-weight: 800; font-size: 0.95rem;">₹${initialNet}</span>
        </div>
      </div>

      <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
        <button type="button" class="btn-secondary" style="flex: 1;" onclick="closeModal('bookingModal')">Cancel</button>
        <button type="submit" class="btn-primary" style="flex: 1; background: #16A34A; border-color: #16A34A;">✓ Finalize Duty & Settle Bill</button>
      </div>
    </form>
  `;
  modal.classList.add('active');
};

window.selectLogDutyHours = function(hrs) {
  const slider = document.getElementById('logHoursSlider');
  const input = document.getElementById('logHoursInput');
  if (slider) slider.value = hrs;
  if (input) input.value = hrs;
  document.querySelectorAll('.btn-hour-chip[data-log-hours]').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.getAttribute('data-log-hours')) === parseFloat(hrs));
  });
  updateLogDutyCalculation();
};

window.onLogHoursSliderChange = function(hrs) {
  const input = document.getElementById('logHoursInput');
  if (input) input.value = hrs;
  document.querySelectorAll('.btn-hour-chip[data-log-hours]').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.getAttribute('data-log-hours')) === parseFloat(hrs));
  });
  updateLogDutyCalculation();
};

window.onLogHoursInputChange = function(hrs) {
  const slider = document.getElementById('logHoursSlider');
  const numHrs = parseFloat(hrs) || 0.5;
  if (slider) slider.value = Math.min(12, Math.max(0.5, numHrs));
  document.querySelectorAll('.btn-hour-chip[data-log-hours]').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.getAttribute('data-log-hours')) === numHrs);
  });
  updateLogDutyCalculation();
};

window.updateLogDutyCalculation = function() {
  const form = document.getElementById('logHoursForm');
  if (!form) return;
  const rate = parseFloat(form.getAttribute('data-rate')) || 150;
  const customerFee = parseFloat(form.getAttribute('data-fee')) || 20;
  const hours = parseFloat(document.getElementById('logHoursInput')?.value) || 1;
  const gross = Math.round(hours * rate);
  const commissionPercent = 8;
  const commission = Math.round(gross * (commissionPercent / 100));
  const net = gross - commission;
  const total = gross + customerFee;

  const displayHours = document.getElementById('logHoursDisplay');
  const summaryHours = document.getElementById('logSummaryHours');
  const summaryGross = document.getElementById('logSummaryGross');
  const summaryTotal = document.getElementById('logSummaryTotalAmount');
  const summaryWorkerNet = document.getElementById('logSummaryWorkerNet');

  if (displayHours) displayHours.innerText = `${hours} ${hours === 1 ? 'Hour' : 'Hours'}`;
  if (summaryHours) summaryHours.innerText = hours;
  if (summaryGross) summaryGross.innerText = `₹${gross}`;
  if (summaryTotal) summaryTotal.innerText = `₹${total}`;
  if (summaryWorkerNet) summaryWorkerNet.innerText = `₹${net}`;
};

window.handleLogWorkerHoursSubmit = async function(e, bookingId) {
  e.preventDefault();
  const b = appState.bookings.find(bok => bok.id === bookingId);
  if (!b) return;

  const hoursInput = document.getElementById('logHoursInput');
  const loggedHours = parseFloat(hoursInput?.value) || 1;
  const rate = parseFloat(b.hourlyRate) || 150;
  const gross = Math.round(loggedHours * rate);
  const commissionPercent = appState.platformCommission?.workerCommissionPercent ?? 8;
  const commission = Math.round(gross * (commissionPercent / 100));
  const netPayout = gross - commission;
  const customerFee = b.customerFee ?? 20;
  const totalAmount = gross + customerFee;

  b.hours = loggedHours;
  b.hoursLogged = true;
  b.grossAmount = gross;
  b.workerCommission = commission;
  b.workerNetPayout = netPayout;
  b.amount = totalAmount;
  b.platformRevenue = customerFee + commission;
  b.status = 'Completed';

  const customerNotification = {
    id: `notif-${Date.now()}`,
    targetUserId: b.customerId || 'USR-001',
    title: `✓ Duty Completed by ${b.providerName}`,
    desc: `${b.providerName} completed duty for "${b.serviceTitle}". Logged ${loggedHours} working hrs. Total bill: ₹${totalAmount}.`,
    time: 'Just now',
    read: false,
    bookingId: b.id
  };
  appState.notifications.unshift(customerNotification);

  if (typeof updateBookingInSupabase === 'function') {
    await updateBookingInSupabase(b);
  }
  if (typeof saveNotificationToSupabase === 'function') {
    await saveNotificationToSupabase(customerNotification);
  }

  closeModal('bookingModal');
  showToast(`🎉 Duty completed! Logged ${loggedHours} hrs. Final bill of ₹${totalAmount} generated.`);
  renderMain();
};

// ── Official Service & Hourly Payment Receipt Modal ────────────────────
window.showBookingReceipt = function(bookingId) {
  const b = appState.bookings.find(bok => bok.id === bookingId);
  if (!b) return;

  const modal = document.getElementById('bookingModal');
  const modalBody = document.getElementById('bookingModalBody');
  if (!modal || !modalBody) return;

  const isBarter = b.type === 'barter';
  const hasHours = isBarter || b.status === 'Completed' || b.hoursLogged;
  const hours = b.hours || (isBarter ? 2 : 0);
  const rate = b.hourlyRate || 150;
  const gross = b.grossAmount ?? (isBarter ? 0 : Math.round(hours * rate));
  const customerFee = b.customerFee ?? (isBarter ? 0 : (appState.platformCommission?.customerBookingFee ?? 20));
  const workerCommission = b.workerCommission ?? (isBarter ? 0 : Math.round(gross * ((appState.platformCommission?.workerCommissionPercent ?? 8) / 100)));
  const workerNet = b.workerNetPayout ?? (isBarter ? 0 : gross - workerCommission);
  const totalAmount = isBarter ? 0 : (b.amount ?? (gross + customerFee));

  modalBody.innerHTML = `
    <div class="invoice-card">
      <div class="invoice-header-row">
        <div>
          <div style="font-size: 1.35rem; font-weight: 800; color: #09090B;">🤝 SkillConnect India</div>
          <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Service Invoice & Working Hour Payment Bill</div>
        </div>
        <div style="text-align: right;">
          <button class="modal-close" onclick="closeModal('bookingModal')" style="font-size: 1.3rem; margin-bottom: 0.3rem;">✕</button>
          <div style="font-size: 0.85rem; font-weight: 800; color: #09090B;">ID: ${b.id}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${b.date} at ${b.time}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.2rem; background: #F8FAFC; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
        <div>
          <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; display: block;">Service Professional</span>
          <strong style="color: #09090B; font-size: 0.95rem;">${b.providerName}</strong>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${b.categoryName || 'Worker Pro'} (${b.providerId})</div>
        </div>
        <div>
          <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; display: block;">Customer</span>
          <strong style="color: #09090B; font-size: 0.95rem;">${b.customerName || 'Rahul Verma'}</strong>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Verified Local Client</div>
        </div>
      </div>

      <table class="invoice-table">
        <thead>
          <tr>
            <th>Service Description</th>
            <th style="text-align: center;">Working Hours</th>
            <th style="text-align: right;">Hourly Rate</th>
            <th style="text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${b.serviceTitle}</strong>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${b.userNotes || 'Standard service session'}</div>
            </td>
            <td style="text-align: center; font-weight: 700;">
              ${isBarter ? `${hours} hrs (Barter)` : hasHours ? `${hours} ${hours === 1 ? 'hr' : 'hrs'}` : 'Pending duty completion'}
            </td>
            <td style="text-align: right;">${isBarter ? 'Skill Barter' : `₹${rate} / hr`}</td>
            <td style="text-align: right; font-weight: 800; color: #09090B;">
              ${isBarter ? '₹0 (Barter)' : hasHours ? `₹${gross}` : `₹${rate}/hr (on completion)`}
            </td>
          </tr>
          ${!isBarter ? `
            <tr>
              <td colspan="3" style="color: var(--text-muted); font-size: 0.8rem;">SkillConnect Platform & Safety Booking Fee</td>
              <td style="text-align: right; color: #2563EB; font-weight: 700;">+₹${customerFee}</td>
            </tr>
            ${hasHours ? `
              <tr style="background: #F8FAFC;">
                <td colspan="3" style="color: var(--text-muted); font-size: 0.8rem;">Platform Commission Deducted from Worker (${appState.platformCommission?.workerCommissionPercent ?? 8}%)</td>
                <td style="text-align: right; color: #DC2626; font-weight: 700;">-₹${workerCommission}</td>
              </tr>
            ` : ''}
          ` : `
            <tr>
              <td colspan="3" style="color: var(--text-muted); font-size: 0.8rem;">SkillConnect Barter Fee</td>
              <td style="text-align: right; color: #16A34A; font-weight: 700;">₹0 (Free Community Exchange)</td>
            </tr>
          `}
        </tbody>
        <tfoot>
          <tr style="border-top: 2px solid #09090B;">
            <th colspan="3" style="font-size: 0.95rem; font-weight: 800; color: #09090B; padding-top: 0.8rem;">Total Billed to Customer</th>
            <th style="font-size: 1.3rem; font-weight: 800; color: #09090B; text-align: right; padding-top: 0.8rem;">
              ${isBarter ? '🤝 Skill Exchange' : hasHours ? `₹${totalAmount}` : `₹${customerFee} (Fixed Fee) + Duty Total on Completion`}
            </th>
          </tr>
          ${!isBarter && hasHours ? `
            <tr>
              <th colspan="3" style="font-size: 0.85rem; font-weight: 700; color: #16A34A; padding-top: 0.4rem;">Worker Net Payout (Take-Home)</th>
              <th style="font-size: 1.05rem; font-weight: 800; color: #16A34A; text-align: right; padding-top: 0.4rem;">₹${workerNet}</th>
            </tr>
          ` : ''}
        </tfoot>
      </table>

      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.8rem; background: #F1F5F9; padding: 0.85rem 1rem; border-radius: var(--radius-sm); margin-top: 1rem;">
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Payment Option</span>
          <div style="font-weight: 700; color: #09090B; font-size: 0.85rem;">💳 ${b.paymentMethod || 'Direct Payment'}</div>
        </div>
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Booking Status</span>
          <div style="font-weight: 700; color: #09090B; font-size: 0.85rem;">● ${b.status}</div>
        </div>
      </div>

      <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
        <button class="btn-secondary" style="flex: 1;" onclick="closeModal('bookingModal')">Close</button>
        <button class="btn-primary" style="flex: 1;" onclick="window.print()">🖨️ Print / Save Bill</button>
      </div>
    </div>
  `;
  modal.classList.add('active');
};

async function handleBookingSubmit(e) {
  e.preventDefault();
  const p = appState.selectedProviderForBooking;
  if (!p) return;

  const title = document.getElementById('serviceTitleInput')?.value || p.offeredSkill;
  const date = document.getElementById('bookingDateInput')?.value || '2026-09-28';
  const time = document.getElementById('bookingTimeInput')?.value || '14:00';
  const notes = document.getElementById('bookingNotesInput')?.value || '';

  const isBarter = appState.bookingType === 'barter';
  const isPreBooked = isPreBookedHoursCategory(p.category);
  const offeredSkill = isBarter ? (document.getElementById('offeredSkillInput')?.value || 'Skill Barter Offer') : 'N/A';
  
  const hourlyRate = parseFloat(p.hourlyRate) || 150;
  const customerFee = isBarter ? 0 : (appState.platformCommission?.customerBookingFee ?? 20);
  const commissionPercent = isBarter ? 0 : (appState.platformCommission?.workerCommissionPercent ?? 8);

  let hours = 0;
  let hoursLogged = false;
  let grossAmount = 0;
  let workerCommission = 0;
  let workerNetPayout = 0;
  let totalCustomerAmount = 0;
  let platformRevenue = 0;

  if (isBarter) {
    hours = parseFloat(document.getElementById('barterHoursInput')?.value) || 2;
    hoursLogged = true;
  } else if (isPreBooked) {
    hours = parseFloat(document.getElementById('bookingHoursInput')?.value) || 2;
    hoursLogged = true;
    grossAmount = Math.round(hours * hourlyRate);
    workerCommission = Math.round(grossAmount * (commissionPercent / 100));
    workerNetPayout = grossAmount - workerCommission;
    totalCustomerAmount = grossAmount + customerFee;
    platformRevenue = customerFee + workerCommission;
  } else {
    // Duty-based worker (Electrician, Plumber, etc.)
    // Payment when duty is over!
    hours = 0;
    hoursLogged = false;
    grossAmount = 0;
    workerCommission = 0;
    workerNetPayout = 0;
    totalCustomerAmount = customerFee;
    platformRevenue = customerFee;
  }

  const payMethod = isBarter 
    ? 'Skill Exchange (Barter)' 
    : (document.getElementById('paymentMethodSelect')?.value || 'Cash to Worker After Work Completion (COD)');

  const customerName = appState.loggedInUser?.name || 'Rahul Verma';
  const customerId = appState.loggedInUser?.id || 'USR-001';

  // Use timestamp-based ID to guarantee uniqueness across sessions
  const newBooking = {
    id: `BOK-${Date.now()}`,
    providerId: p.id,
    providerName: p.name,
    customerId: customerId,
    customerName: customerName,
    categoryName: p.categoryName,
    serviceTitle: title,
    type: isBarter ? 'barter' : 'monetary',
    offeredSkill: offeredSkill,
    hours: hours,
    hoursLogged: hoursLogged,
    hourlyRate: hourlyRate,
    grossAmount: grossAmount,
    customerFee: customerFee,
    workerCommission: workerCommission,
    workerNetPayout: workerNetPayout,
    amount: totalCustomerAmount,
    platformRevenue: platformRevenue,
    paymentMethod: payMethod,
    status: 'Pending',
    date: date,
    time: time,
    userNotes: notes,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  appState.bookings.unshift(newBooking);

  // ROUTE NOTIFICATION ONLY TO THE SPECIFIC REQUESTED WORKER!
  const workerNotification = {
    id: `notif-${Date.now() + 1}`,
    targetUserId: p.id,
    title: `📥 New Request from ${customerName}`,
    desc: isBarter
      ? `Customer requested "${title}" (${hours} hr barter session: "${offeredSkill}") for ${date} at ${time}.`
      : isPreBooked
        ? `Customer booked ${hours} working hrs for "${title}" (@ ₹${hourlyRate}/hr = ₹${grossAmount} gross, ₹${workerCommission} platform fee, net take-home: ₹${workerNetPayout}) on ${date} at ${time}.`
        : `Customer requested "${title}" for ${date} at ${time}. (Payment settled when duty is over @ ₹${hourlyRate}/hr).`,
    time: 'Just now',
    read: false,
    bookingId: newBooking.id
  };
  appState.notifications.unshift(workerNotification);

  // ── Supabase: Persist booking and notification to cloud ────────────────
  if (typeof saveBookingToSupabase === 'function') {
    await saveBookingToSupabase(newBooking);
  }
  if (typeof saveNotificationToSupabase === 'function') {
    await saveNotificationToSupabase(workerNotification);
  }

  closeModal('bookingModal');
  showToast(isBarter
    ? `✓ Barter request sent to ${p.name}! (${hours} hrs exchange)`
    : isPreBooked
      ? `✓ Request sent to ${p.name}! (${hours} hrs @ ₹${hourlyRate}/hr = ₹${totalCustomerAmount} total paid, net payout ₹${workerNetPayout})`
      : `✓ Request sent to ${p.name}! Payment will be settled @ ₹${hourlyRate}/hr when duty is over.`
  );

  if (appState.currentRole === 'worker') {
    switchTab('worker');
  } else {
    switchTab('bookings');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function openReviewModal(providerId) {
  const p = appState.providers.find(prov => prov.id === providerId);
  if (!p) return;

  const modal = document.getElementById('bookingModal');
  const modalBody = document.getElementById('bookingModalBody');

  if (modal && modalBody) {
    modalBody.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">Write Review for ${p.name}</h3>
        <button class="modal-close" onclick="closeModal('bookingModal')">✕</button>
      </div>

      <form onsubmit="handleReviewSubmit(event, '${p.id}')">
        <div class="form-group">
          <label class="form-label">Rating</label>
          <select id="reviewRatingSelect" class="form-select">
            <option value="5">★★★★★ (5 Stars - Excellent)</option>
            <option value="4">★★★★☆ (4 Stars - Good)</option>
            <option value="3">★★★☆☆ (3 Stars - Average)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Written Feedback & Barter Experience</label>
          <textarea id="reviewCommentText" class="form-textarea" required placeholder="Share your experience working or skill bartering with ${p.name}..."></textarea>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button type="button" class="btn-secondary" style="flex: 1;" onclick="closeModal('bookingModal')">Cancel</button>
          <button type="submit" class="btn-primary" style="flex: 1;">Submit Review</button>
        </div>
      </form>
    `;
    modal.classList.add('active');
  }
}

function handleReviewSubmit(e, providerId) {
  e.preventDefault();
  const p = appState.providers.find(prov => prov.id === providerId);
  if (p) {
    p.reviewsCount += 1;
    showToast(`Thank you! Your review for ${p.name} has been published.`);
  }
  closeModal('bookingModal');
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.right = '24px';
  toast.style.background = '#09090B';
  toast.style.color = '#FFFFFF';
  toast.style.padding = '0.9rem 1.4rem';
  toast.style.borderRadius = 'var(--radius-md)';
  toast.style.fontWeight = '700';
  toast.style.fontSize = '0.9rem';
  toast.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.25)';
  toast.style.zIndex = '999';
  toast.innerText = msg;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3500);
}

function toggleNotificationDropdown(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('notifDropdown');
  if (dropdown) {
    dropdown.classList.toggle('active');
  }
}

function markAllNotificationsAsRead(e) {
  if (e) e.stopPropagation();
  const u = appState.loggedInUser;
  if (!u) return;

  appState.notifications.forEach(n => {
    if (n.targetUserId === u.id || (u.workerId && n.targetUserId === u.workerId) || n.targetUserId === 'all') {
      n.read = true;
    }
  });

  renderHeader();
  const dropdown = document.getElementById('notifDropdown');
  if (dropdown) dropdown.classList.add('active');
  showToast('✓ All your notifications marked as read.');
}

function openNotificationItem(notifId) {
  const notif = appState.notifications.find(n => n.id === notifId);
  if (notif) {
    notif.read = true;
    const dropdown = document.getElementById('notifDropdown');
    if (dropdown) dropdown.classList.remove('active');

    if (appState.currentRole === 'worker') {
      switchTab('worker');
    } else if (appState.currentRole === 'customer') {
      switchTab('bookings');
    } else if (appState.currentRole === 'admin') {
      switchTab('admin');
    }
    renderHeader();
  }
}

// Close notification dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('notifDropdown');
  const bell = document.getElementById('notifBellBtn');
  if (dropdown && bell && !dropdown.contains(e.target) && !bell.contains(e.target)) {
    dropdown.classList.remove('active');
  }
});
