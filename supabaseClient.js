// ============================================================================
// SkillConnect - Supabase Client Configuration
// ============================================================================
// Replace the two placeholders below with your credentials from:
// Supabase Dashboard -> Project Settings -> API
// ============================================================================

const SUPABASE_URL = 'https://wtbejusofayzofxrtias.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SrCDcPKDCL4FF5FrHqLM_Q_40Rqw-Fp';

// Initialize Supabase Client (loaded via CDN in index.html)
let supabaseClient = null;
if (window.supabase && SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL') {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Connected to Supabase Cloud Database!');
} else {
  console.info('ℹ️ Running in local fallback mode. Configure supabaseClient.js with your project credentials to connect to Supabase.');
}
