// ============================================================================
// SkillConnect - Supabase Database Layer
// db.js: Loads cloud data into appState, and syncs writes back to Supabase.
// This file is loaded AFTER supabaseClient.js and data.js, BEFORE app.js.
// ============================================================================

// -----------------------------------------------------------------------
// 1. LOAD DATA FROM SUPABASE INTO appState ON STARTUP
// -----------------------------------------------------------------------

async function loadFromSupabase() {
  if (!supabaseClient) {
    // No Supabase connection → stay on local fallback data
    console.info('ℹ️ No Supabase connection. Using local data.');
    return;
  }

  try {
    console.log('⏳ Loading data from Supabase...');

    // Load all tables in parallel for speed
    const [providersRes, bookingsRes, reviewsRes, chatsRes, notificationsRes] = await Promise.all([
      supabaseClient.from('providers').select('*'),
      supabaseClient.from('bookings').select('*').order('created_at', { ascending: false }),
      supabaseClient.from('reviews').select('*').order('created_at', { ascending: false }),
      supabaseClient.from('chats').select('*').order('created_at', { ascending: true }),
      supabaseClient.from('notifications').select('*').order('created_at', { ascending: false }),
    ]);

    if (providersRes.error) throw providersRes.error;
    if (bookingsRes.error) throw bookingsRes.error;
    if (reviewsRes.error) throw reviewsRes.error;
    if (chatsRes.error) throw chatsRes.error;
    if (notificationsRes.error) throw notificationsRes.error;

    // Map snake_case DB columns → camelCase JS fields (matching existing app expectations)
    appState.providers = (providersRes.data || []).map(mapProviderFromDB);
    appState.bookings  = (bookingsRes.data  || []).map(mapBookingFromDB);
    appState.reviews   = (reviewsRes.data   || []);

    // Map chats: group messages by provider_id (matching local data shape)
    appState.chats = buildChatThreads(chatsRes.data || [], appState.providers);

    // Map notifications
    appState.notifications = (notificationsRes.data || []).map(n => ({
      id:           n.id,
      targetUserId: n.target_user_id,
      title:        n.title,
      desc:         n.description,
      time:         n.time,
      read:         n.is_read
    }));

    console.log(`✅ Supabase loaded: ${appState.providers.length} providers, ${appState.bookings.length} bookings, ${appState.chats.length} chats`);
  } catch (err) {
    console.error('❌ Supabase load failed, falling back to local data:', err.message);
  }
}

// -----------------------------------------------------------------------
// 2. FIELD MAPPING HELPERS
// -----------------------------------------------------------------------

function mapProviderFromDB(row) {
  return {
    id:             row.id,
    workerId:       row.worker_id,
    name:           row.name,
    email:          row.email,
    password:       row.password,
    category:       row.category,
    categoryName:   row.category_name,
    avatar:         row.avatar,
    rating:         parseFloat(row.rating) || 5.0,
    reviewsCount:   row.reviews_count || 0,
    distanceKm:     parseFloat(row.distance_km) || 1.0,
    locationName:   row.location_name,
    lat:            parseFloat(row.lat),
    lng:            parseFloat(row.lng),
    hourlyRate:     parseFloat(row.hourly_rate) || 100,
    isVerified:     row.is_verified,
    barterAvailable: row.barter_available,
    offeredSkill:   row.offered_skill,
    seekingSkill:   row.seeking_skill,
    bio:            row.bio,
    completedJobs:  row.completed_jobs || 0
  };
}

function mapBookingFromDB(row) {
  return {
    id:            row.id,
    providerId:    row.provider_id,
    providerName:  row.provider_name,
    categoryName:  row.category_name,
    serviceTitle:  row.service_title,
    type:          row.type,
    offeredSkill:  row.offered_skill,
    paymentMethod: row.payment_method,
    amount:        parseFloat(row.amount) || 0,
    status:        row.status,
    date:          row.date,
    time:          row.time,
    userNotes:     row.user_notes,
    customerId:    row.customer_id,
    customerName:  row.customer_name,
  };
}

function buildChatThreads(messages, providers) {
  // Group flat messages by provider_id
  const threads = {};
  messages.forEach(msg => {
    const pid = msg.provider_id;
    if (!threads[pid]) {
      const provider = providers.find(p => p.id === pid) || {};
      threads[pid] = {
        providerId:   pid,
        providerName: provider.name || pid,
        avatar:       provider.avatar || '',
        messages:     []
      };
    }
    threads[pid].messages.push({
      sender: msg.sender,
      text:   msg.text,
      time:   msg.time,
      dbId:   msg.id
    });
  });
  return Object.values(threads);
}

// -----------------------------------------------------------------------
// 3. SUPABASE WRITE FUNCTIONS — patch key app actions
// -----------------------------------------------------------------------

// Called after the original handleBookingSubmit pushes a new booking to appState
async function saveBookingToSupabase(booking) {
  if (!supabaseClient) return;
  try {
    const { error } = await supabaseClient.from('bookings').insert([{
      id:             booking.id,
      provider_id:    booking.providerId,
      provider_name:  booking.providerName,
      customer_id:    booking.customerId,
      customer_name:  booking.customerName,
      category_name:  booking.categoryName,
      service_title:  booking.serviceTitle,
      type:           booking.type,
      offered_skill:  booking.offeredSkill,
      payment_method: booking.paymentMethod,
      amount:         booking.amount,
      status:         booking.status,
      date:           booking.date,
      time:           booking.time,
      user_notes:     booking.userNotes,
    }]);
    if (error) throw error;
    console.log('✅ Booking saved to Supabase:', booking.id);
  } catch (err) {
    console.error('❌ Failed to save booking:', err.message);
  }
}

// Called when worker accepts a booking
async function updateBookingStatusInSupabase(bookingId, newStatus) {
  if (!supabaseClient) return;
  try {
    const { error } = await supabaseClient
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);
    if (error) throw error;
    console.log('✅ Booking status updated in Supabase:', bookingId, '→', newStatus);
  } catch (err) {
    console.error('❌ Failed to update booking status:', err.message);
  }
}

// Called when a new worker registers
async function saveProviderToSupabase(provider) {
  if (!supabaseClient) return;
  try {
    const { error } = await supabaseClient.from('providers').insert([{
      id:              provider.id,
      worker_id:       provider.workerId,
      name:            provider.name,
      email:           provider.email,
      password:        provider.password,
      category:        provider.category,
      category_name:   provider.categoryName,
      avatar:          provider.avatar,
      rating:          provider.rating,
      reviews_count:   provider.reviewsCount,
      distance_km:     provider.distanceKm,
      location_name:   provider.locationName,
      lat:             provider.lat,
      lng:             provider.lng,
      hourly_rate:     provider.hourlyRate,
      is_verified:     provider.isVerified,
      barter_available: provider.barterAvailable,
      offered_skill:   provider.offeredSkill,
      seeking_skill:   provider.seekingSkill,
      bio:             provider.bio,
      completed_jobs:  provider.completedJobs
    }]);
    if (error) throw error;
    console.log('✅ New worker saved to Supabase:', provider.id);
  } catch (err) {
    console.error('❌ Failed to save new worker:', err.message);
  }
}

// Called when a chat message is sent
async function saveChatMessageToSupabase(providerId, sender, text, time) {
  if (!supabaseClient) return;
  try {
    const { error } = await supabaseClient.from('chats').insert([{
      provider_id: providerId,
      sender:      sender,
      text:        text,
      time:        time
    }]);
    if (error) throw error;
    console.log('✅ Chat message saved to Supabase');
  } catch (err) {
    console.error('❌ Failed to save chat message:', err.message);
  }
}

// Called when a notification is created
async function saveNotificationToSupabase(notif) {
  if (!supabaseClient) return;
  try {
    const { error } = await supabaseClient.from('notifications').insert([{
      id:             notif.id,
      target_user_id: notif.targetUserId,
      title:          notif.title,
      description:    notif.desc,
      time:           notif.time,
      is_read:        notif.read || false
    }]);
    if (error) throw error;
    console.log('✅ Notification saved to Supabase');
  } catch (err) {
    console.error('❌ Failed to save notification:', err.message);
  }
}


// -----------------------------------------------------------------------
// 4. BOOTSTRAP — load cloud data into appState, then re-render
// -----------------------------------------------------------------------
// NOTE: All Supabase WRITE calls are embedded directly in app.js functions
// (handleWorkerRegisterSubmit, handleBookingSubmit, updateWorkerBookingStatus,
//  sendMessage). No monkey-patching needed here.
// -----------------------------------------------------------------------

async function initSupabaseApp() {
  await loadFromSupabase();
  // Re-render now that appState has live cloud data
  if (typeof renderMain === 'function') {
    renderMain();
  }
}

// Run after DOM + all scripts are ready
document.addEventListener('DOMContentLoaded', () => {
  // app.js DOMContentLoaded fires first (registered before db.js).
  // We wait one tick to let it complete its first render, then load Supabase data.
  setTimeout(initSupabaseApp, 50);
});
