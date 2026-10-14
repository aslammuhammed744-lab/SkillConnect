-- ============================================================================
-- SkillConnect India - Supabase Database Schema & Initial Data Seed
-- ============================================================================
-- How to run this:
-- 1. Open your project 'SkillConnect' in your Supabase dashboard: https://supabase.com/dashboard
-- 2. Click on 'SQL Editor' in the left sidebar
-- 3. Click 'New query', paste this entire file content, and click 'Run' (Ctrl+Enter / Cmd+Enter)
-- ============================================================================

-- 1. DROP EXISTING TABLES (IF RESETTING)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS providers CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- 2. CREATE CATEGORIES TABLE
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL
);

-- 3. CREATE ACCOUNTS TABLE (Admin & Customer Users)
CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    role_label TEXT NOT NULL,
    avatar TEXT,
    badge TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE SERVICE PROVIDERS / WORKERS TABLE
CREATE TABLE providers (
    id TEXT PRIMARY KEY,
    worker_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    category TEXT REFERENCES categories(id) ON DELETE SET NULL,
    category_name TEXT NOT NULL,
    avatar TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    distance_km NUMERIC(4, 1) DEFAULT 1.0,
    location_name TEXT,
    lat NUMERIC(10, 6),
    lng NUMERIC(10, 6),
    hourly_rate NUMERIC(10, 2) DEFAULT 100,
    is_verified BOOLEAN DEFAULT TRUE,
    barter_available BOOLEAN DEFAULT TRUE,
    offered_skill TEXT,
    seeking_skill TEXT,
    bio TEXT,
    completed_jobs INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE BOOKINGS TABLE
CREATE TABLE bookings (
    id TEXT PRIMARY KEY,
    provider_id TEXT REFERENCES providers(id) ON DELETE CASCADE,
    provider_name TEXT NOT NULL,
    category_name TEXT,
    service_title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('barter', 'monetary')),
    offered_skill TEXT,
    payment_method TEXT,
    amount NUMERIC(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'Pending',
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    user_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CREATE REVIEWS TABLE
CREATE TABLE reviews (
    id TEXT PRIMARY KEY,
    provider_id TEXT REFERENCES providers(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    date TEXT NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CREATE CHATS / MESSAGES TABLE
CREATE TABLE chats (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    provider_id TEXT REFERENCES providers(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'provider')),
    text TEXT NOT NULL,
    time TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CREATE NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    target_user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    time TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- Allows frontend application to read and write data with public anon key
-- ============================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read/Write Categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Accounts" ON accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Providers" ON providers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Chats" ON chats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 10. SEED INITIAL DATA
-- ============================================================================

-- Insert Categories
INSERT INTO categories (id, name, icon) VALUES
('all', 'All Categories', '✨'),
('electrician', 'Electrician', '⚡'),
('plumber', 'Plumber', '🔧'),
('tutor', 'Tutor', '📚'),
('designer', 'Designer', '🎨'),
('carpenter', 'Carpenter', '🪚'),
('mechanic', 'Mechanic', '🚗'),
('beautician', 'Beautician', '💄'),
('freelancer', 'Freelancer', '💻'),
('driver', 'Driver', '🚘'),
('homeservice', 'Home Services', '🏠');

-- Insert Demo Accounts (Admin and Customer)
INSERT INTO accounts (id, name, email, password, role, role_label, avatar, badge) VALUES
('ADM-001', 'Afsal Haneef (Admin)', 'admin@skillconnect.in', 'Admin@2026', 'admin', 'Administrator', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', '🛡️ System Admin'),
('USR-001', 'Rahul Verma', 'user@skillconnect.in', 'User@2026', 'customer', 'Customer / Learner', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', '👤 Service Customer');

-- Insert Providers / Workers
INSERT INTO providers (id, worker_id, name, email, password, category, category_name, avatar, rating, reviews_count, distance_km, location_name, lat, lng, hourly_rate, is_verified, barter_available, offered_skill, seeking_skill, bio, completed_jobs) VALUES
('WRK-101', 'WRK-101', 'Rajesh Kumar', 'rajesh@electrician.in', 'Rajesh@101', 'electrician', 'Electrician & Smart Home Setup', 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80', 4.9, 38, 1.2, 'Indiranagar, Bengaluru (1.2 km away)', 12.9784, 77.6408, 100, true, true, 'Electrical Wiring & Fan/Light Fitting', 'Web Development / Python Basics', 'Certified electrician in Bengaluru with 8+ years experience. Interested in learning basic web development through skill barter!', 142),
('WRK-102', 'WRK-102', 'Ananya Roy', 'ananya@tutor.in', 'Ananya@102', 'tutor', 'Math & Science Tutor', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 5.0, 52, 2.4, 'Koramangala, Bengaluru (2.4 km away)', 12.9352, 77.6245, 100, true, true, 'Class 10-12 Maths, Physics & Board Coaching', 'Acoustic Guitar Lessons or Spoken English', 'M.Sc Physics graduate offering academic tutoring. Looking to learn acoustic guitar or spoken English in exchange!', 98),
('WRK-103', 'WRK-103', 'Suresh Patel', 'suresh@plumber.in', 'Suresh@103', 'plumber', 'Master Plumber', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', 4.8, 29, 3.1, 'HSR Layout, Bengaluru (3.1 km away)', 12.9121, 77.6446, 100, true, false, 'Emergency Plumbing, Pipe Repairs & Tap Fitting', 'None (Paid Service Only)', 'Experienced emergency plumber available 24/7 for leak repairs, bathroom fittings, and tank cleaning.', 115),
('WRK-104', 'WRK-104', 'Vikram Joshi', 'vikram@designer.in', 'Vikram@104', 'designer', 'UI/UX & Graphic Designer', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 4.95, 44, 0.8, 'MG Road, Bengaluru (0.8 km away)', 12.9756, 77.6066, 100, true, true, 'Figma Mobile App Design, Logo & Branding', 'Home Furniture Repair / Woodworking', 'Senior UI/UX designer. Offering app wireframes and branding in exchange for custom wooden shelves!', 76),
('WRK-105', 'WRK-105', 'Amit Singh', 'amit@mechanic.in', 'Amit@105', 'mechanic', 'Two-Wheeler & Car Mechanic', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 4.7, 31, 4.5, 'Whitefield, Bengaluru (4.5 km away)', 12.9698, 77.7499, 100, true, true, 'Bike Servicing, Engine Tuning & Brake Repair', 'Social Media Marketing / Poster Design', 'Auto mechanic with 10+ years servicing two-wheelers and cars. Looking for marketing assistance to grow my local garage.', 160),
('WRK-106', 'WRK-106', 'Kavita Nair', 'kavita@beautician.in', 'Kavita@106', 'beautician', 'Professional Beautician & Makeup', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', 4.9, 41, 2.0, 'Jayanagar, Bengaluru (2.0 km away)', 12.9308, 77.5838, 100, true, true, 'Bridal Makeup, Hair Styling & Skin Care', 'Digital Photography / Portfolio Shoot', 'Certified bridal makeup artist & salon stylist. Open to skill barter for photography services.', 88),
('WRK-107', 'WRK-107', 'Ravi Sharma', 'ravi@carpenter.in', 'Ravi@107', 'carpenter', 'Furniture Carpenter & Woodworker', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', 4.85, 35, 3.5, 'BTM Layout, Bengaluru (3.5 km away)', 12.9166, 77.6101, 100, true, true, 'Custom Wood Shelves, Wardrobe Repair & Door Fitting', 'Accounting & Tax Filing Consultation', 'Experienced carpenter crafting modular kitchen cabinets and furniture. Offering carpentry in exchange for accounting advice!', 92),
('WRK-108', 'WRK-108', 'Pooja Sen', 'pooja@freelancer.in', 'Pooja@108', 'freelancer', 'Content Writer & SEO Strategist', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 4.95, 26, 1.5, 'Malleshwaram, Bengaluru (1.5 km away)', 12.9968, 77.5703, 100, true, true, 'Blog Writing, SEO Copywriting & Resume Revamp', 'Maths Tutoring for High Schooler', 'Freelance writer with 5+ years writing for tech startups. Looking for mathematics tutoring for my child!', 64),
('WRK-109', 'WRK-109', 'Mohammed Farhan', 'farhan@driver.in', 'Farhan@109', 'driver', 'Professional Chauffeur & City Driver', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 4.75, 48, 4.0, 'Electronic City, Bengaluru (4.0 km away)', 12.8399, 77.6770, 100, true, false, 'Private Car Driving, Outstation Trips & Airport Drops', 'None (Standard Paid Driving Only)', 'Licensed professional driver with 12+ years accident-free driving record across Karnataka.', 210),
('WRK-110', 'WRK-110', 'Sunita Das', 'sunita@homeservice.in', 'Sunita@110', 'homeservice', 'Deep Cleaning & Home Sanitization', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80', 4.9, 39, 2.8, 'Rajajinagar, Bengaluru (2.8 km away)', 12.9982, 77.5530, 100, true, true, 'Kitchen Deep Clean, Sofa Shampooing & Sanitization', 'Basic Computer / Smartphone Usage Training', 'Specialized residential deep cleaner. Offering thorough home cleaning in exchange for digital skills coaching.', 105);

-- Insert Initial Bookings
INSERT INTO bookings (id, provider_id, provider_name, category_name, service_title, type, offered_skill, payment_method, amount, status, date, time, user_notes) VALUES
('BOK-101', 'WRK-101', 'Rajesh Kumar', 'Electrician', 'Smart Home Light Switch & Fan Setup', 'barter', 'Python Programming Basics (2 sessions)', 'Skill Exchange (Barter)', 0, 'Confirmed', '2026-10-08', '14:00', 'Looking forward to fitting the smart switches and teaching Python!'),
('BOK-102', 'WRK-104', 'Vikram Joshi', 'Designer', 'Mobile App Wireframing', 'monetary', NULL, 'UPI / Paytm / PhonePe', 100, 'Completed', '2026-10-04', '10:00', 'App branding deck and Figma design files delivered.'),
('BOK-103', 'WRK-102', 'Ananya Roy', 'Tutor', 'Mathematics Board Exam Revision', 'barter', 'Guitar Basics Tutorial', 'Skill Exchange (Barter)', 0, 'Pending', '2026-10-09', '16:00', 'Exchanging maths coaching for acoustic guitar intro.'),
('BOK-104', 'WRK-106', 'Kavita Nair', 'Beautician', 'Festive Makeup & Hair Styling', 'barter', 'DSLR Portrait Photoshoot (15 edited photos)', 'Skill Exchange (Barter)', 0, 'Confirmed', '2026-10-10', '11:00', 'Exchanging makeup session for professional portfolio shoot.');

-- Insert Reviews
INSERT INTO reviews (id, provider_id, user_name, rating, date, comment) VALUES
('r1', 'WRK-101', 'Rahul Verma', 5, '2026-10-02', 'Rajesh fixed our living room wiring efficiently. Traded 2 hours of Python coaching for his service — excellent barter system!'),
('r2', 'WRK-102', 'Neha Gupta', 5, '2026-10-03', 'Ananya is an amazing teacher! Cleared all calculus doubts in just two sessions.');

-- Insert Initial Chat Messages
INSERT INTO chats (provider_id, sender, text, time) VALUES
('WRK-101', 'provider', 'Namaste! I saw your request for electrical fitting. Are you open for skill barter for Python tutoring?', '10:14 AM'),
('WRK-101', 'user', 'Hello Rajesh ji! Yes absolutely, I can teach you Python basics in exchange for the wiring work.', '10:16 AM'),
('WRK-101', 'provider', 'Great! Deal confirmed. Will visit on Wednesday at 2 PM.', '10:18 AM'),
('WRK-102', 'user', 'Hi Ananya! Are you free this Thursday for Class 12 Maths revision?', 'Yesterday'),
('WRK-102', 'provider', 'Hello Rahul! Yes, Thursday 4 PM works great for me. Let me know the chapters to cover!', 'Yesterday');

-- Insert Initial Notifications
INSERT INTO notifications (id, target_user_id, title, description, time, is_read) VALUES
('n-wrk101', 'WRK-101', '📥 New Booking Request', 'Rahul Verma requested Smart Home Light Switch & Fan Setup for Oct 8.', '15 mins ago', false),
('n-wrk102', 'WRK-102', '🤝 Skill Barter Request', 'Rahul Verma offered Guitar Lessons in exchange for Maths Tutoring.', '25 mins ago', false),
('n-wrk104', 'WRK-104', '📥 Service Booking Received', 'Rahul Verma requested Mobile App Wireframing.', '2 hours ago', true),
('n-wrk106', 'WRK-106', '🤝 Skill Barter Proposal', 'Rahul Verma offered DSLR Photoshoot for Festive Makeup session.', '1 day ago', false),
('n-usr1', 'USR-001', '✓ Booking Confirmed!', 'Rajesh Kumar (WRK-101) accepted your smart switch installation request.', '10 mins ago', false),
('n-adm1', 'ADM-001', '🛡️ Moderation Alert', 'New worker profiles awaiting verification approval in Bengaluru.', '30 mins ago', false);
