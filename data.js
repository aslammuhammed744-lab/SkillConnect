// SkillConnect Initial Data Store - India Edition
// Every Worker has a Unique Worker ID, Unique Email ID, and Unique Password

const initialCategories = [
  { id: 'all', name: 'All Categories', icon: '✨' },
  { id: 'electrician', name: 'Electrician', icon: '⚡' },
  { id: 'plumber', name: 'Plumber', icon: '🔧' },
  { id: 'tutor', name: 'Tutor', icon: '📚' },
  { id: 'designer', name: 'Designer', icon: '🎨' },
  { id: 'carpenter', name: 'Carpenter', icon: '🪚' },
  { id: 'mechanic', name: 'Mechanic', icon: '🚗' },
  { id: 'beautician', name: 'Beautician', icon: '💄' },
  { id: 'freelancer', name: 'Freelancer', icon: '💻' },
  { id: 'driver', name: 'Driver', icon: '🚘' },
  { id: 'homeservice', name: 'Home Services', icon: '🏠' }
];

// Pre-defined Admin and Customer User Accounts
const demoAccounts = {
  admin: {
    id: 'ADM-001',
    name: 'Afsal Haneef (Admin)',
    email: 'admin@skillconnect.in',
    password: 'Admin@2026',
    role: 'admin',
    roleLabel: 'Administrator',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    badge: '🛡️ System Admin'
  },
  user: {
    id: 'USR-001',
    name: 'Rahul Verma',
    email: 'user@skillconnect.in',
    password: 'User@2026',
    role: 'customer',
    roleLabel: 'Customer / Learner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    badge: '👤 Service Customer'
  }
};

// Registered Workers List - EACH WORKER HAS A DIFFERENT UNIQUE ID, EMAIL & PASSWORD
const initialProviders = [
  {
    id: 'WRK-101',
    workerId: 'WRK-101',
    name: 'Rajesh Kumar',
    email: 'rajesh@electrician.in',
    password: 'Rajesh@101',
    category: 'electrician',
    categoryName: 'Electrician & Smart Home Setup',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 38,
    distanceKm: 1.2,
    locationName: 'Indiranagar, Bengaluru (1.2 km away)',
    lat: 12.9784,
    lng: 77.6408,
    hourlyRate: 100,
    isVerified: true,
    barterAvailable: true,
    offeredSkill: 'Electrical Wiring & Fan/Light Fitting',
    seekingSkill: 'Web Development / Python Basics',
    bio: 'Certified electrician in Bengaluru with 8+ years experience. Interested in learning basic web development through skill barter!',
    completedJobs: 142
  },
  {
    id: 'WRK-102',
    workerId: 'WRK-102',
    name: 'Ananya Roy',
    email: 'ananya@tutor.in',
    password: 'Ananya@102',
    category: 'tutor',
    categoryName: 'Math & Science Tutor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewsCount: 52,
    distanceKm: 2.4,
    locationName: 'Koramangala, Bengaluru (2.4 km away)',
    lat: 12.9352,
    lng: 77.6245,
    hourlyRate: 100,
    isVerified: true,
    barterAvailable: true,
    offeredSkill: 'Class 10-12 Maths, Physics & Board Coaching',
    seekingSkill: 'Acoustic Guitar Lessons or Spoken English',
    bio: 'M.Sc Physics graduate offering academic tutoring. Looking to learn acoustic guitar or spoken English in exchange!',
    completedJobs: 98
  },
  {
    id: 'WRK-103',
    workerId: 'WRK-103',
    name: 'Suresh Patel',
    email: 'suresh@plumber.in',
    password: 'Suresh@103',
    category: 'plumber',
    categoryName: 'Master Plumber',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 29,
    distanceKm: 3.1,
    locationName: 'HSR Layout, Bengaluru (3.1 km away)',
    lat: 12.9121,
    lng: 77.6446,
    hourlyRate: 100,
    isVerified: true,
    barterAvailable: false,
    offeredSkill: 'Emergency Plumbing, Pipe Repairs & Tap Fitting',
    seekingSkill: 'None (Paid Service Only)',
    bio: 'Experienced emergency plumber available 24/7 for leak repairs, bathroom fittings, and tank cleaning.',
    completedJobs: 115
  },
  {
    id: 'WRK-104',
    workerId: 'WRK-104',
    name: 'Vikram Joshi',
    email: 'vikram@designer.in',
    password: 'Vikram@104',
    category: 'designer',
    categoryName: 'UI/UX & Graphic Designer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 4.95,
    reviewsCount: 44,
    distanceKm: 0.8,
    locationName: 'MG Road, Bengaluru (0.8 km away)',
    lat: 12.9756,
    lng: 77.6066,
    hourlyRate: 100,
    isVerified: true,
    barterAvailable: true,
    offeredSkill: 'Figma Mobile App Design, Logo & Branding',
    seekingSkill: 'Home Furniture Repair / Woodworking',
    bio: 'Senior UI/UX designer. Offering app wireframes and branding in exchange for custom wooden shelves!',
    completedJobs: 76
  },
  {
    id: 'WRK-105',
    workerId: 'WRK-105',
    name: 'Amit Singh',
    email: 'amit@mechanic.in',
    password: 'Amit@105',
    category: 'mechanic',
    categoryName: 'Two-Wheeler & Car Mechanic',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 31,
    distanceKm: 4.5,
    locationName: 'Whitefield, Bengaluru (4.5 km away)',
    lat: 12.9698,
    lng: 77.7499,
    hourlyRate: 100,
    isVerified: true,
    barterAvailable: true,
    offeredSkill: 'Bike Servicing, Engine Tuning & Brake Repair',
    seekingSkill: 'Social Media Marketing / Poster Design',
    bio: 'Auto mechanic with 10+ years servicing two-wheelers and cars. Looking for marketing assistance to grow my local garage.',
    completedJobs: 160
  },
  {
    id: 'WRK-106',
    workerId: 'WRK-106',
    name: 'Kavita Nair',
    email: 'kavita@beautician.in',
    password: 'Kavita@106',
    category: 'beautician',
    categoryName: 'Professional Beautician & Makeup',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 41,
    distanceKm: 2.0,
    locationName: 'Jayanagar, Bengaluru (2.0 km away)',
    lat: 12.9308,
    lng: 77.5838,
    hourlyRate: 100,
    isVerified: true,
    barterAvailable: true,
    offeredSkill: 'Bridal Makeup, Hair Styling & Skin Care',
    seekingSkill: 'Digital Photography / Portfolio Shoot',
    bio: 'Certified bridal makeup artist & salon stylist. Open to skill barter for photography services.',
    completedJobs: 88
  },
  {
    id: 'WRK-107',
    workerId: 'WRK-107',
    name: 'Ravi Sharma',
    email: 'ravi@carpenter.in',
    password: 'Ravi@107',
    category: 'carpenter',
    categoryName: 'Furniture Carpenter & Woodworker',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    rating: 4.85,
    reviewsCount: 35,
    distanceKm: 3.5,
    locationName: 'BTM Layout, Bengaluru (3.5 km away)',
    lat: 12.9166,
    lng: 77.6101,
    hourlyRate: 100,
    isVerified: true,
    barterAvailable: true,
    offeredSkill: 'Custom Wood Shelves, Wardrobe Repair & Door Fitting',
    seekingSkill: 'Accounting & Tax Filing Consultation',
    bio: 'Experienced carpenter crafting modular kitchen cabinets and furniture. Offering carpentry in exchange for accounting advice!',
    completedJobs: 92
  },
  {
    id: 'WRK-108',
    workerId: 'WRK-108',
    name: 'Pooja Sen',
    email: 'pooja@freelancer.in',
    password: 'Pooja@108',
    category: 'freelancer',
    categoryName: 'Content Writer & SEO Strategist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 4.95,
    reviewsCount: 26,
    distanceKm: 1.5,
    locationName: 'Malleshwaram, Bengaluru (1.5 km away)',
    lat: 12.9968,
    lng: 77.5703,
    hourlyRate: 100,
    isVerified: true,
    barterAvailable: true,
    offeredSkill: 'Blog Writing, SEO Copywriting & Resume Revamp',
    seekingSkill: 'Maths Tutoring for High Schooler',
    bio: 'Freelance writer with 5+ years writing for tech startups. Looking for mathematics tutoring for my child!',
    completedJobs: 64
  },
  {
    id: 'WRK-109',
    workerId: 'WRK-109',
    name: 'Mohammed Farhan',
    email: 'farhan@driver.in',
    password: 'Farhan@109',
    category: 'driver',
    categoryName: 'Professional Chauffeur & City Driver',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 4.75,
    reviewsCount: 48,
    distanceKm: 4.0,
    locationName: 'Electronic City, Bengaluru (4.0 km away)',
    lat: 12.8399,
    lng: 77.6770,
    hourlyRate: 100,
    isVerified: true,
    barterAvailable: false,
    offeredSkill: 'Private Car Driving, Outstation Trips & Airport Drops',
    seekingSkill: 'None (Standard Paid Driving Only)',
    bio: 'Licensed professional driver with 12+ years accident-free driving record across Karnataka.',
    completedJobs: 210
  },
  {
    id: 'WRK-110',
    workerId: 'WRK-110',
    name: 'Sunita Das',
    email: 'sunita@homeservice.in',
    password: 'Sunita@110',
    category: 'homeservice',
    categoryName: 'Deep Cleaning & Home Sanitization',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 39,
    distanceKm: 2.8,
    locationName: 'Rajajinagar, Bengaluru (2.8 km away)',
    lat: 12.9982,
    lng: 77.5530,
    hourlyRate: 100,
    isVerified: true,
    barterAvailable: true,
    offeredSkill: 'Kitchen Deep Clean, Sofa Shampooing & Sanitization',
    seekingSkill: 'Basic Computer / Smartphone Usage Training',
    bio: 'Specialized residential deep cleaner. Offering thorough home cleaning in exchange for digital skills coaching.',
    completedJobs: 105
  }
];

const initialBookings = [
  {
    id: 'BOK-101',
    providerId: 'WRK-101',
    providerName: 'Rajesh Kumar',
    categoryName: 'Electrician',
    serviceTitle: 'Smart Home Light Switch & Fan Setup',
    type: 'barter',
    offeredSkill: 'Python Programming Basics (2 sessions)',
    paymentMethod: 'Skill Exchange (Barter)',
    amount: 0,
    status: 'Confirmed',
    date: '2026-10-08',
    time: '14:00',
    userNotes: 'Looking forward to fitting the smart switches and teaching Python!'
  },
  {
    id: 'BOK-102',
    providerId: 'WRK-104',
    providerName: 'Vikram Joshi',
    categoryName: 'Designer',
    serviceTitle: 'Mobile App Wireframing',
    type: 'monetary',
    paymentMethod: 'UPI / Paytm / PhonePe',
    amount: 100,
    status: 'Completed',
    date: '2026-10-04',
    time: '10:00',
    userNotes: 'App branding deck and Figma design files delivered.'
  },
  {
    id: 'BOK-103',
    providerId: 'WRK-102',
    providerName: 'Ananya Roy',
    categoryName: 'Tutor',
    serviceTitle: 'Mathematics Board Exam Revision',
    type: 'barter',
    offeredSkill: 'Guitar Basics Tutorial',
    paymentMethod: 'Skill Exchange (Barter)',
    amount: 0,
    status: 'Pending',
    date: '2026-10-09',
    time: '16:00',
    userNotes: 'Exchanging maths coaching for acoustic guitar intro.'
  },
  {
    id: 'BOK-104',
    providerId: 'WRK-106',
    providerName: 'Kavita Nair',
    categoryName: 'Beautician',
    serviceTitle: 'Festive Makeup & Hair Styling',
    type: 'barter',
    offeredSkill: 'DSLR Portrait Photoshoot (15 edited photos)',
    paymentMethod: 'Skill Exchange (Barter)',
    amount: 0,
    status: 'Confirmed',
    date: '2026-10-10',
    time: '11:00',
    userNotes: 'Exchanging makeup session for professional portfolio shoot.'
  }
];

const initialReviews = [
  {
    id: 'r1',
    providerId: 'WRK-101',
    userName: 'Rahul Verma',
    rating: 5,
    date: '2026-10-02',
    comment: 'Rajesh fixed our living room wiring efficiently. Traded 2 hours of Python coaching for his service — excellent barter system!'
  },
  {
    id: 'r2',
    providerId: 'WRK-102',
    userName: 'Neha Gupta',
    rating: 5,
    date: '2026-10-03',
    comment: 'Ananya is an amazing teacher! Cleared all calculus doubts in just two sessions.'
  }
];

const initialChats = [
  {
    providerId: 'WRK-101',
    providerName: 'Rajesh Kumar',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
    messages: [
      { sender: 'provider', text: 'Namaste! I saw your request for electrical fitting. Are you open for skill barter for Python tutoring?', time: '10:14 AM' },
      { sender: 'user', text: 'Hello Rajesh ji! Yes absolutely, I can teach you Python basics in exchange for the wiring work.', time: '10:16 AM' },
      { sender: 'provider', text: 'Great! Deal confirmed. Will visit on Wednesday at 2 PM.', time: '10:18 AM' }
    ]
  },
  {
    providerId: 'WRK-102',
    providerName: 'Ananya Roy',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    messages: [
      { sender: 'user', text: 'Hi Ananya! Are you free this Thursday for Class 12 Maths revision?', time: 'Yesterday' },
      { sender: 'provider', text: 'Hello Rahul! Yes, Thursday 4 PM works great for me. Let me know the chapters to cover!', time: 'Yesterday' }
    ]
  }
];

const initialNotifications = [
  { id: 'n-wrk101', targetUserId: 'WRK-101', title: '📥 New Booking Request', desc: 'Rahul Verma requested Smart Home Light Switch & Fan Setup for Oct 8.', time: '15 mins ago', read: false },
  { id: 'n-wrk102', targetUserId: 'WRK-102', title: '🤝 Skill Barter Request', desc: 'Rahul Verma offered Guitar Lessons in exchange for Maths Tutoring.', time: '25 mins ago', read: false },
  { id: 'n-wrk104', targetUserId: 'WRK-104', title: '📥 Service Booking Received', desc: 'Rahul Verma requested Mobile App Wireframing.', time: '2 hours ago', read: true },
  { id: 'n-wrk106', targetUserId: 'WRK-106', title: '🤝 Skill Barter Proposal', desc: 'Rahul Verma offered DSLR Photoshoot for Festive Makeup session.', time: '1 day ago', read: false },
  { id: 'n-usr1', targetUserId: 'USR-001', title: '✓ Booking Confirmed!', desc: 'Rajesh Kumar (WRK-101) accepted your smart switch installation request.', time: '10 mins ago', read: false },
  { id: 'n-adm1', targetUserId: 'ADM-001', title: '🛡️ Moderation Alert', desc: 'New worker profiles awaiting verification approval in Bengaluru.', time: '30 mins ago', read: false }
];

const adminStats = {
  totalUsers: 1420,
  verifiedProviders: 840,
  totalBookings: 3120,
  barterExchangesCount: 1290,
  activeComplaints: 3,
  systemHealth: '99.98% Operational'
};
