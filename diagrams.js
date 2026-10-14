// SRS Chapter 3 System Design Diagrams Renderer

function renderDiagramView(diagramType, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (diagramType === 'er') {
    container.innerHTML = getERDiagramHTML();
  } else if (diagramType === 'usecase') {
    container.innerHTML = getUseCaseDiagramHTML();
  } else if (diagramType === 'sequence') {
    container.innerHTML = getSequenceDiagramHTML();
  } else if (diagramType === 'activity') {
    container.innerHTML = getActivityDiagramHTML();
  }
}

function getERDiagramHTML() {
  return `
    <div class="diagram-canvas-wrap">
      <div class="diagram-header-bar">
        <h3><i class="lucide-database"></i> Entity-Relationship (ER) Diagram — SkillConnect</h3>
        <p>Interactive schema visualization based on SRS Specification. Click on any entity to view primary keys & relations.</p>
      </div>

      <div class="er-diagram-grid">
        <!-- USER Entity -->
        <div class="er-card primary-entity" onclick="showEntityDetails('USER')">
          <div class="er-title"><span class="entity-type">ENT</span> USER</div>
          <ul class="er-attrs">
            <li class="pk">🔑 UserID (PK)</li>
            <li>Name</li>
            <li>Email</li>
            <li>Password (Encrypted)</li>
            <li>Phone</li>
            <li>UserType (Customer / Provider)</li>
            <li>LocationCoords (Lat, Lng)</li>
          </ul>
        </div>

        <div class="er-relation">
          <span class="rel-badge">1 : N (Offers / Books)</span>
          <div class="rel-line"></div>
        </div>

        <!-- SERVICE_PROVIDER Entity -->
        <div class="er-card accent-entity" onclick="showEntityDetails('SERVICE_PROVIDER')">
          <div class="er-title"><span class="entity-type">ENT</span> SERVICE_PROVIDER</div>
          <ul class="er-attrs">
            <li class="pk">🔑 ProviderID (PK)</li>
            <li class="fk">🔗 UserID (FK)</li>
            <li>SkillsCategory</li>
            <li>OfferedSkillDescription</li>
            <li>SeekingSkill(Barter)</li>
            <li>HourlyRate / BarterFlag</li>
            <li>IsVerified (Bool)</li>
            <li>Rating (Float)</li>
          </ul>
        </div>

        <div class="er-relation">
          <span class="rel-badge">1 : N (Creates)</span>
          <div class="rel-line"></div>
        </div>

        <!-- BOOKING Entity -->
        <div class="er-card success-entity" onclick="showEntityDetails('BOOKING')">
          <div class="er-title"><span class="entity-type">ENT</span> BOOKING</div>
          <ul class="er-attrs">
            <li class="pk">🔑 BookingID (PK)</li>
            <li class="fk">🔗 UserID (FK)</li>
            <li class="fk">🔗 ProviderID (FK)</li>
            <li>BookingDate & Time</li>
            <li>BookingType (Monetary / Barter)</li>
            <li>Status (Pending/Confirmed/Done)</li>
            <li>TotalAmount</li>
          </ul>
        </div>

        <!-- PAYMENT Entity -->
        <div class="er-card warning-entity" onclick="showEntityDetails('PAYMENT')">
          <div class="er-title"><span class="entity-type">ENT</span> PAYMENT / BARTER_DEAL</div>
          <ul class="er-attrs">
            <li class="pk">🔑 PaymentID (PK)</li>
            <li class="fk">🔗 BookingID (FK)</li>
            <li>PaymentMethod (UPI/Card/COD/Skill)</li>
            <li>TransactionID</li>
            <li>PaymentStatus</li>
            <li>BarterOfferedSkillName</li>
          </ul>
        </div>

        <!-- REVIEW Entity -->
        <div class="er-card info-entity" onclick="showEntityDetails('REVIEW')">
          <div class="er-title"><span class="entity-type">ENT</span> REVIEW & RATING</div>
          <ul class="er-attrs">
            <li class="pk">🔑 ReviewID (PK)</li>
            <li class="fk">🔗 BookingID (FK)</li>
            <li>RatingScore (1 - 5)</li>
            <li>Comment</li>
            <li>ReviewDate</li>
          </ul>
        </div>

        <!-- CHAT Entity -->
        <div class="er-card purple-entity" onclick="showEntityDetails('CHAT')">
          <div class="er-title"><span class="entity-type">ENT</span> CHAT_MESSAGE</div>
          <ul class="er-attrs">
            <li class="pk">🔑 ChatID (PK)</li>
            <li class="fk">🔗 SenderID (FK)</li>
            <li class="fk">🔗 ReceiverID (FK)</li>
            <li>MessageText</li>
            <li>SentTimestamp</li>
          </ul>
        </div>
      </div>

      <div id="entityDetailModal" class="entity-detail-box">
        <div class="info-tag">💡 Entity Inspector</div>
        <p id="entityDetailText">Click any entity above to inspect database foreign key relationships and schema definitions.</p>
      </div>
    </div>
  `;
}

function getUseCaseDiagramHTML() {
  return `
    <div class="diagram-canvas-wrap">
      <div class="diagram-header-bar">
        <h3><i class="lucide-git-branch"></i> Use Case Diagram — SkillConnect Platform</h3>
        <p>Interaction breakdown across System Actors: Customer / Learner, Skilled Service Provider, and Administrator.</p>
      </div>

      <div class="usecase-container">
        <!-- Actor 1: Customer -->
        <div class="actor-column">
          <div class="actor-card">
            <div class="actor-icon">👤</div>
            <h4>Customer / Learner</h4>
            <span class="actor-role">End User</span>
          </div>
          <div class="actor-usecase-list">
            <div class="uc-bubble">Register / Login</div>
            <div class="uc-bubble highlight">Search Nearby Providers (GPS Radius)</div>
            <div class="uc-bubble highlight">Request Skill Exchange (Barter)</div>
            <div class="uc-bubble">Book Service (Monetary Payment)</div>
            <div class="uc-bubble">In-App Live Chat</div>
            <div class="uc-bubble">Submit Rating & Review</div>
          </div>
        </div>

        <!-- System Boundary Box -->
        <div class="system-boundary">
          <div class="system-boundary-title">SkillConnect Core System</div>
          <div class="usecase-flow-diagram">
            <div class="uc-core-node include-node">&lt;&lt;include&gt;&gt; Validate User Credentials</div>
            <div class="uc-core-node include-node">&lt;&lt;include&gt;&gt; Location Radius Filter</div>
            <div class="uc-core-node extend-node">&lt;&lt;extend&gt;&gt; Barter Skill Agreement Verification</div>
            <div class="uc-core-node extend-node">&lt;&lt;extend&gt;&gt; Payment Gateway Integration</div>
            <div class="uc-core-node include-node">&lt;&lt;include&gt;&gt; Real-Time Socket Notification</div>
          </div>
        </div>

        <!-- Actor 2: Service Provider -->
        <div class="actor-column">
          <div class="actor-card">
            <div class="actor-icon">🛠️</div>
            <h4>Service Provider</h4>
            <span class="actor-role">Skilled Professional</span>
          </div>
          <div class="actor-usecase-list">
            <div class="uc-bubble">Create Skill Profile</div>
            <div class="uc-bubble highlight">Set Barter Preferences (Seeking Skill)</div>
            <div class="uc-bubble">Accept / Reject Service & Barter Requests</div>
            <div class="uc-bubble">Update Booking Status (In-Progress/Done)</div>
            <div class="uc-bubble">Chat with Customers</div>
          </div>
        </div>

        <!-- Actor 3: Admin -->
        <div class="actor-column">
          <div class="actor-card">
            <div class="actor-icon">🛡️</div>
            <h4>Administrator</h4>
            <span class="actor-role">System Admin</span>
          </div>
          <div class="actor-usecase-list">
            <div class="uc-bubble admin-uc">Verify Professional Profiles & Badges</div>
            <div class="uc-bubble admin-uc">Monitor Bookings & Barters</div>
            <div class="uc-bubble admin-uc">Remove Fake Accounts</div>
            <div class="uc-bubble admin-uc">Manage User Complaints</div>
            <div class="uc-bubble admin-uc">View System Analytics Reports</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getSequenceDiagramHTML() {
  return `
    <div class="diagram-canvas-wrap">
      <div class="diagram-header-bar">
        <h3><i class="lucide-arrow-right-left"></i> Sequence Diagram (with Skill Exchange & Payment)</h3>
        <p>Trace the lifecycle of a request from User action down to Database, Location API, and Provider notification.</p>
      </div>

      <div class="sequence-view">
        <div class="seq-lifelines">
          <div class="seq-lifeline"><span>User</span></div>
          <div class="seq-lifeline"><span>SkillConnect UI</span></div>
          <div class="seq-lifeline"><span>Location API</span></div>
          <div class="seq-lifeline"><span>Database</span></div>
          <div class="seq-lifeline"><span>Payment/Barter Hub</span></div>
          <div class="seq-lifeline"><span>Provider</span></div>
        </div>

        <div class="seq-steps-list">
          <div class="seq-step" onclick="highlightSeqStep(1)">
            <span class="seq-num">1</span>
            <div class="seq-content">
              <strong>User enters location & filters nearby providers (e.g. Electrician, Barter = True)</strong>
              <small>User UI ➔ Location API & Database</small>
            </div>
          </div>

          <div class="seq-step" onclick="highlightSeqStep(2)">
            <span class="seq-num">2</span>
            <div class="seq-content">
              <strong>Returns nearby providers matching radius & barter interest</strong>
              <small>Database ➔ SkillConnect UI</small>
            </div>
          </div>

          <div class="seq-step" onclick="highlightSeqStep(3)">
            <span class="seq-num">3</span>
            <div class="seq-content">
              <strong>User selects Skill Exchange (Barter) or Paid Booking and submits request</strong>
              <small>User UI ➔ Payment/Barter Hub</small>
            </div>
          </div>

          <div class="seq-step" onclick="highlightSeqStep(4)">
            <span class="seq-num">4</span>
            <div class="seq-content">
              <strong>System saves pending booking and sends real-time alert to Service Provider</strong>
              <small>SkillConnect UI ➔ Provider</small>
            </div>
          </div>

          <div class="seq-step" onclick="highlightSeqStep(5)">
            <span class="seq-num">5</span>
            <div class="seq-content">
              <strong>Provider confirms booking; live chat channel & schedule locked in DB</strong>
              <small>Provider ➔ SkillConnect UI ➔ Database</small>
            </div>
          </div>

          <div class="seq-step" onclick="highlightSeqStep(6)">
            <span class="seq-num">6</span>
            <div class="seq-content">
              <strong>Service/Skill Exchange completed ➔ Rating & Review recorded</strong>
              <small>User & Provider ➔ Database</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getActivityDiagramHTML() {
  return `
    <div class="diagram-canvas-wrap">
      <div class="diagram-header-bar">
        <h3><i class="lucide-git-commit"></i> Activity Flow Diagram — SkillConnect System</h3>
        <p>Step-by-step flowchart logic covering authentication, discovery, decision pathways (Payment vs Barter), and review lifecycle.</p>
      </div>

      <div class="activity-flow">
        <div class="act-node start-node">⏺ START: Open SkillConnect Platform</div>
        <div class="act-arrow">↓</div>
        <div class="act-node process-node">User Login / Authentication Check</div>
        <div class="act-arrow">↓</div>
        <div class="act-node decision-node">Valid Credentials?</div>

        <div class="act-branch">
          <div class="act-path">
            <span class="path-label">No</span>
            <div class="act-node error-node">Display Login Error & Prompt Signup</div>
          </div>
          <div class="act-path">
            <span class="path-label">Yes</span>
            <div class="act-node process-node">Load Dashboard & User Location</div>
          </div>
        </div>

        <div class="act-arrow">↓</div>
        <div class="act-node process-node">Search Nearby Skilled Professionals by Category / Radius</div>
        <div class="act-arrow">↓</div>
        <div class="act-node decision-node">Selected Service Type?</div>

        <div class="act-branch">
          <div class="act-path">
            <span class="path-label">Skill Exchange (Barter)</span>
            <div class="act-node barter-node">🤝 Select Skill to Offer in Return ➔ Confirm Agreement</div>
          </div>
          <div class="act-path">
            <span class="path-label">Standard Booking</span>
            <div class="act-node payment-node">💳 Choose Payment Option (Card / UPI / NetBanking / COD)</div>
          </div>
        </div>

        <div class="act-arrow">↓</div>
        <div class="act-node process-node">Save Booking to DB & Notify Provider via Push / In-App</div>
        <div class="act-arrow">↓</div>
        <div class="act-node process-node">Service / Skill Exchange Executed & Mark Completed</div>
        <div class="act-arrow">↓</div>
        <div class="act-node process-node">Submit Rating & Written Review for Community Trust</div>
        <div class="act-arrow">↓</div>
        <div class="act-node end-node">⏹ END: Transaction Logged & Analytics Updated</div>
      </div>
    </div>
  `;
}

function showEntityDetails(entityName) {
  const modalText = document.getElementById('entityDetailText');
  if (!modalText) return;

  const descriptions = {
    USER: 'Stores customer and service provider authentication details, role flags, GPS location coordinates, contact phone, and profile creation timestamps.',
    SERVICE_PROVIDER: 'Stores professional qualifications, category classification, hourly monetary rates, custom skill barter exchange offerings, verification status, and cumulative ratings.',
    BOOKING: 'Tracks service/barter appointments. Contains foreign keys referencing User and Provider, status flags (Pending, Confirmed, Completed, Cancelled), date/time, and notes.',
    PAYMENT: 'Handles both monetary payments (Cards, UPI, COD, NetBanking) and barter exchange contracts. Records payment reference tokens and barter skill commitments.',
    REVIEW: 'Stores user ratings (1 to 5 stars), written feedback comments, review timestamps, and updates provider aggregate ratings.',
    CHAT: 'Stores real-time message text exchanges between customers and service providers for quick coordination.'
  };

  modalText.innerHTML = `<strong>${entityName}:</strong> ${descriptions[entityName] || 'Entity details loaded successfully.'}`;
}

function highlightSeqStep(stepNum) {
  const steps = document.querySelectorAll('.seq-step');
  steps.forEach((step, idx) => {
    if (idx + 1 === stepNum) {
      step.classList.add('active-step');
    } else {
      step.classList.remove('active-step');
    }
  });
}
