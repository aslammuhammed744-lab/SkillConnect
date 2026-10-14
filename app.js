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
  bookingType: 'barter'
};

// Global Leaflet Map Instance Variables
let leafletMapInstance = null;
let leafletMarkersGroup = null;
let leafletRadiusCircle = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  renderMain();
  setupEventListeners();
});

function setupEventListeners() {}

function renderMain() {
  renderHeader();
  const container = document.getElementById('tabMainContainer');
  if (!container) return;

  if (!appState.isLoggedIn) {
    if (appState.authMode === 'registerWorker') {
      container.innerHTML = getWorkerRegisterPageHTML();
    } else {
      container.innerHTML = getLoginPageHTML();
    }
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
                <option value="electrician">Electrician</option>
                <option value="plumber">Plumber</option>
                <option value="tutor">Tutor</option>
                <option value="designer">Designer</option>
                <option value="carpenter">Carpenter</option>
                <option value="mechanic">Mechanic</option>
                <option value="beautician">Beautician</option>
                <option value="freelancer">Freelancer</option>
                <option value="driver">Driver</option>
                <option value="homeservice">Home Services</option>
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

          <div class="form-group">
            <label class="form-label">Locality / City *</label>
            <input type="text" id="regLocationInput" class="form-input" required placeholder="e.g. Koramangala, Bengaluru">
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
            Back to Sign In
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
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewsCount: 1,
    distanceKm: 0.5,
    locationName: `${locationName} (0.5 km away)`,
    lat: 12.9716,
    lng: 77.5946,
    hourlyRate: 100,
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
        <img src="${u.avatar}" alt="${u.name}" class="user-avatar">
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

  return `
    <div class="diagram-canvas-wrap" style="margin-bottom: 2rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 1.2rem;">
          <img src="${workerProfile.avatar}" style="width: 70px; height: 70px; border-radius: 50%; border: 3px solid var(--border-color); object-fit: cover;">
          <div>
            <h2>🛠️ Worker Portal: ${workerProfile.name}</h2>
            <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; margin-top: 0.35rem;">
              <span class="worker-id-badge" style="font-size: 0.78rem;">ID: ${workerProfile.workerId || workerProfile.id}</span>
              <span class="worker-pass-badge" style="font-size: 0.78rem;">🔑 Pass: ${workerProfile.password}</span>
              <span style="color: var(--text-muted); font-size: 0.78rem;">📧 ${workerProfile.email}</span>
            </div>
            <div style="color: var(--text-muted); font-weight: 700; margin-top: 0.3rem;">${workerProfile.categoryName}</div>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.2rem;">Manage incoming service requests & skill barter exchange proposals for your account.</p>
          </div>
        </div>
        <div style="text-align: right;">
          <span class="barter-badge" style="margin: 0; padding: 0.5rem 1rem; font-size: 0.85rem;">
            🤝 Barter Status: Active
          </span>
          <div style="margin-top: 0.5rem; font-weight: 800; font-size: 1.1rem; color: #09090B;">
            ⭐ ${workerProfile.rating} <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">(${workerProfile.completedJobs || 120}+ jobs completed)</span>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; margin-top: 1.5rem; background: #F8FAFC; padding: 1.2rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
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
      ${(() => {
        const workerBookings = appState.bookings.filter(b => b.providerId === workerProfile.id || b.providerId === workerProfile.workerId);
        return `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
            <h3>📥 Requests Specifically Sent to You (${workerProfile.name})</h3>
            <span class="badge-pill" style="margin: 0; background: #09090B; color: #FFFFFF; font-size: 0.75rem;">
              🎯 ${workerBookings.length} ${workerBookings.length === 1 ? 'Request' : 'Requests'} for ${workerProfile.workerId || workerProfile.id}
            </span>
          </div>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.2rem;">
            Private Worker Inbox: Only customer requests submitted directly to your Worker ID (${workerProfile.workerId || workerProfile.id}) appear here. Other workers cannot see or receive your requests.
          </p>

          <div class="table-responsive">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.82rem; text-transform: uppercase;">
                  <th style="padding: 1rem;">Booking ID</th>
                  <th style="padding: 1rem;">Customer</th>
                  <th style="padding: 1rem;">Requested Service</th>
                  <th style="padding: 1rem;">Type / Offer</th>
                  <th style="padding: 1rem;">Date & Time</th>
                  <th style="padding: 1rem;">Status</th>
                  <th style="padding: 1rem;">Worker Actions</th>
                </tr>
              </thead>
              <tbody>
                ${workerBookings.length === 0 ? `
                  <tr>
                    <td colspan="7" style="text-align: center; padding: 3rem 1.5rem; color: var(--text-muted);">
                      <div style="font-size: 2.2rem; margin-bottom: 0.6rem;">📭</div>
                      <strong style="color: #09090B; font-size: 1.05rem; display: block; margin-bottom: 0.35rem;">No customer requests for your profile yet</strong>
                      <p style="font-size: 0.85rem; max-width: 500px; margin: 0 auto; line-height: 1.4;">
                        Customer requests are private and strictly routed to the requested worker only. When a customer books or proposes a barter specifically with <strong>${workerProfile.name}</strong> (${workerProfile.workerId || workerProfile.id}), their request will appear here directly.
                      </p>
                    </td>
                  </tr>
                ` : workerBookings.map(b => `
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 1rem; font-weight: 700; color: #09090B;">${b.id}</td>
                    <td style="padding: 1rem; font-weight: 700;">${b.customerName || 'Rahul Verma'}</td>
                    <td style="padding: 1rem;">
                      <strong>${b.serviceTitle}</strong>
                      <div style="font-size: 0.78rem; color: var(--text-muted);">${b.userNotes || 'No special notes'}</div>
                    </td>
                    <td style="padding: 1rem;">
                      ${b.type === 'barter' ? `
                        <span class="barter-badge" style="margin: 0;">🤝 Offered: ${b.offeredSkill}</span>
                      ` : `
                        <span class="barter-badge" style="margin: 0; background: #F1F5F9; color: #09090B; border: 1px solid var(--border-color);">💳 Direct Booking</span>
                      `}
                    </td>
                    <td style="padding: 1rem; color: var(--text-muted);">${b.date} at ${b.time}</td>
                    <td style="padding: 1rem;">
                      ${b.status === 'Confirmed' ? `<span style="color: #09090B; font-weight: 700;">● Accepted</span>` : ''}
                      ${b.status === 'Pending' ? `<span style="color: #D97706; font-weight: 700;">● Pending Response</span>` : ''}
                      ${b.status === 'Completed' ? `<span style="color: #09090B; font-weight: 700;">✓ Completed</span>` : ''}
                    </td>
                    <td style="padding: 1rem;">
                      <div style="display: flex; gap: 0.4rem;">
                        ${b.status === 'Pending' ? `
                          <button class="btn-sm-barter" onclick="updateWorkerBookingStatus('${b.id}', 'Confirmed')">✓ Accept Request</button>
                          <button class="btn-sm-book" onclick="openChatWithProvider('${b.providerId}')">💬 Chat</button>
                        ` : `
                          <button class="btn-sm-book" onclick="openChatWithProvider('${b.providerId}')">💬 Chat</button>
                        `}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      })()}
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
            <img src="${p.avatar}" alt="${p.name}" class="provider-img">
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
        <div class="rate-tag" style="font-size: 0.85rem; font-weight: 700; color: #09090B;">
          ${p.barterAvailable ? '🤝 Skill Exchange' : '⚡ Direct Hire'}
        </div>
        <div class="card-btn-group">
          ${p.barterAvailable ? `
            <button class="btn-sm-barter" onclick="openBookingModal('${p.id}', 'barter')">🤝 Barter</button>
          ` : ''}
          <button class="btn-sm-book" onclick="openBookingModal('${p.id}', 'monetary')">Book</button>
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
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.5rem;">
          <span style="font-size: 0.8rem; font-weight: 700; color: #09090B;">${p.barterAvailable ? '🤝 Barter Pro' : '⚡ Verified Pro'}</span>
          <button class="btn-sm-barter" style="padding: 0.4rem 0.8rem; font-size: 0.78rem;" onclick="openBookingModal('${p.id}', '${p.barterAvailable ? 'barter' : 'monetary'}')">
            ${p.barterAvailable ? '🤝 Barter / Book' : '💳 Book Now'}
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
              <img src="${p.avatar}" alt="${p.name}" class="provider-img">
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
        <p>Track pending requests, active barter exchanges, payment receipts, and review history.</p>
      </div>

      <div class="table-responsive">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.82rem; text-transform: uppercase;">
              <th style="padding: 1rem;">Booking ID</th>
              <th style="padding: 1rem;">Service Provider</th>
              <th style="padding: 1rem;">Type</th>
              <th style="padding: 1rem;">Date & Time</th>
              <th style="padding: 1rem;">Status</th>
              <th style="padding: 1rem;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${appState.bookings.map(b => `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 1rem; font-weight: 700; color: #09090B;">${b.id}</td>
                <td style="padding: 1rem;">
                  <strong style="display: block;">${b.providerName}</strong>
                  <span style="font-size: 0.78rem; color: var(--text-muted);">${b.serviceTitle}</span>
                </td>
                <td style="padding: 1rem;">
                  ${b.type === 'barter' ? `
                    <span class="barter-badge" style="margin: 0;">🤝 ${b.paymentMethod}</span>
                  ` : `
                    <span class="barter-badge" style="margin: 0; background: #F1F5F9; color: #09090B; border: 1px solid var(--border-color);">💳 Direct Booking</span>
                  `}
                </td>
                <td style="padding: 1rem; color: var(--text-muted);">${b.date} at ${b.time}</td>
                <td style="padding: 1rem;">
                  ${b.status === 'Confirmed' ? `<span style="color: #09090B; font-weight: 700;">● Confirmed</span>` : ''}
                  ${b.status === 'Pending' ? `<span style="color: var(--text-muted); font-weight: 700;">● Pending Approval</span>` : ''}
                  ${b.status === 'Completed' ? `<span style="color: #09090B; font-weight: 700;">✓ Completed</span>` : ''}
                </td>
                <td style="padding: 1rem;">
                  <div style="display: flex; gap: 0.4rem;">
                    <button class="btn-sm-book" onclick="openChatWithProvider('${b.providerId}')">💬 Chat</button>
                    ${b.status !== 'Completed' ? `
                      <button class="btn-sm-barter" onclick="markBookingComplete('${b.id}')">✓ Mark Done</button>
                    ` : `
                      <button class="btn-sm-book" onclick="openReviewModal('${b.providerId}')">★ Review</button>
                    `}
                  </div>
                </td>
              </tr>
            `).join('')}
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
            <img src="${c.avatar}" class="provider-img" style="width: 40px; height: 40px;">
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
          <img src="${activeChat.avatar}" class="provider-img" style="width: 38px; height: 38px;">
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
  return `
    <div class="diagram-canvas-wrap" style="margin-bottom: 2rem;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h2>🛡️ Administrator Control Center</h2>
          <p style="color: var(--text-muted); margin-top: 0.3rem;">System Management, User Verification Moderation, & Complaints.</p>
        </div>
        <span class="badge-pill" style="background: #09090B; color: #FFFFFF;">● Admin Privileges Active</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.2rem; margin-top: 1.5rem;">
        <div style="background: #F8FAFC; border: 1px solid var(--border-color); padding: 1.2rem; border-radius: var(--radius-md);">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Total Registered Users</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: #09090B; margin-top: 0.4rem;">${adminStats.totalUsers}</div>
        </div>
        <div style="background: #F8FAFC; border: 1px solid var(--border-color); padding: 1.2rem; border-radius: var(--radius-md);">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Verified Service Pros</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: #09090B; margin-top: 0.4rem;">${adminStats.verifiedProviders}</div>
        </div>
        <div style="background: #F8FAFC; border: 1px solid var(--border-color); padding: 1.2rem; border-radius: var(--radius-md);">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Total Barter Exchanges</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: #09090B; margin-top: 0.4rem;">${adminStats.barterExchangesCount}</div>
        </div>
        <div style="background: #F8FAFC; border: 1px solid var(--border-color); padding: 1.2rem; border-radius: var(--radius-md);">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Active Complaints</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: #09090B; margin-top: 0.4rem;">${adminStats.activeComplaints}</div>
        </div>
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

function openBookingModal(providerId, defaultType = 'barter') {
  const p = appState.providers.find(prov => prov.id === providerId);
  if (!p) return;

  appState.selectedProviderForBooking = p;
  appState.bookingType = defaultType;

  const modal = document.getElementById('bookingModal');
  const modalBody = document.getElementById('bookingModalBody');

  if (modal && modalBody) {
    modalBody.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">Request Service from ${p.name}</h3>
        <button class="modal-close" onclick="closeModal('bookingModal')">✕</button>
      </div>

      <div style="display: flex; gap: 0.5rem; margin-bottom: 1.2rem; background: rgba(255,255,255,0.04); padding: 0.3rem; border-radius: var(--radius-sm);">
        ${p.barterAvailable ? `
          <button class="nav-tab ${defaultType === 'barter' ? 'active' : ''}" style="flex: 1; justify-content: center;" onclick="switchModalBookingType('barter')">🤝 Skill Exchange (Barter)</button>
        ` : ''}
        <button class="nav-tab ${defaultType === 'monetary' ? 'active' : ''}" style="flex: 1; justify-content: center;" onclick="switchModalBookingType('monetary')">💳 Direct Service Booking</button>
      </div>

      <form id="bookingForm" onsubmit="handleBookingSubmit(event)">
        <div class="form-group">
          <label class="form-label">Requested Service Title</label>
          <input type="text" id="serviceTitleInput" class="form-input" required value="${p.offeredSkill.split('&')[0]}">
        </div>

        ${defaultType === 'barter' ? `
          <div class="form-group" style="background: #F8FAFC; border: 1px solid var(--border-color); padding: 1rem; border-radius: var(--radius-sm);">
            <label class="form-label" style="color: var(--text-main);">Your Offered Skill in Return (Barter Offer)</label>
            <input type="text" id="offeredSkillInput" class="form-input" required placeholder="e.g. Python Programming, Guitar Basics, Spoken English">
            <small style="color: var(--text-muted); display: block; margin-top: 0.4rem;">Provider looking for: <strong>${p.seekingSkill}</strong></small>
          </div>
        ` : `
          <div class="form-group">
            <label class="form-label">Payment Option</label>
            <select id="paymentMethodSelect" class="form-select">
              <option value="UPI / PhonePe / Paytm / GPay">UPI / PhonePe / Paytm / GPay</option>
              <option value="Credit / Debit Card">Credit / Debit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
            </select>
          </div>
        `}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Preferred Date</label>
            <input type="date" id="bookingDateInput" class="form-input" required value="2026-09-28">
          </div>
          <div class="form-group">
            <label class="form-label">Time Slot</label>
            <input type="time" id="bookingTimeInput" class="form-input" required value="14:00">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Additional Notes for Provider</label>
          <textarea id="bookingNotesInput" class="form-textarea" placeholder="Describe job details, area location, or skill exchange preferences..."></textarea>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button type="button" class="btn-secondary" style="flex: 1;" onclick="closeModal('bookingModal')">Cancel</button>
          <button type="submit" class="btn-primary" style="flex: 1;">Confirm Request</button>
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

async function handleBookingSubmit(e) {
  e.preventDefault();
  const p = appState.selectedProviderForBooking;
  if (!p) return;

  const title = document.getElementById('serviceTitleInput')?.value || p.offeredSkill;
  const date = document.getElementById('bookingDateInput')?.value || '2026-09-28';
  const time = document.getElementById('bookingTimeInput')?.value || '14:00';
  const notes = document.getElementById('bookingNotesInput')?.value || '';

  const isBarter = appState.bookingType === 'barter';
  const offeredSkill = isBarter ? (document.getElementById('offeredSkillInput')?.value || 'Skill Barter Offer') : 'N/A';
  const payMethod = isBarter ? 'Skill Exchange (Barter)' : (document.getElementById('paymentMethodSelect')?.value || 'UPI');

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
    paymentMethod: payMethod,
    amount: isBarter ? 0 : 100,
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
    desc: `Customer requested "${title}" (${isBarter ? 'Barter Offer: ' + offeredSkill : 'Direct Booking'}) for ${date} at ${time}.`,
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
  showToast(`✓ Request sent exclusively to ${p.name} (${p.workerId || p.id})!`);

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
