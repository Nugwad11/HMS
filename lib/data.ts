import type {
  ChatMessage,
  CommunityRoom,
  DenominationImportance,
  MemberProfile,
  NotificationSettings,
  Preferences,
  Profile,
} from "./types";

export const DENOMINATIONS = [
  "Pentecostal",
  "Catholic",
  "Anglican",
  "Baptist",
  "Methodist",
  "Presbyterian",
  "Evangelical",
  "Apostolic",
  "Adventist",
  "Other",
] as const;

// Major cities mix with all 36 states because members identify by either.
export const CITIES = [
  "Abia",
  "Abuja",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benin City",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Ibadan",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Port Harcourt",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

export const ATTENDANCE = ["Weekly+", "Most weeks", "Occasionally"] as const;

export const LANGUAGES = ["English", "Yoruba", "Igbo", "Hausa", "Pidgin", "Igala", "Swahili", "Other"] as const;

export const INTENTS = ["Serious dating", "Christian courtship", "Remarriage", "Marriage"] as const;

export const RELATIONSHIP_STATUSES = ["Never married", "Divorced", "Widowed"] as const;

export const KIDS_OPTIONS = ["No", "Yes", "Want children", "Open"] as const;

export const ALCOHOL_OPTIONS = ["None", "Socially", "Prefer not to say"] as const;
export const SMOKING_OPTIONS = ["None", "Socially", "Prefer not to say"] as const;

export const EDUCATION_LEVELS = ["Secondary", "Diploma", "Bachelor’s degree", "Master’s degree", "Doctorate"] as const;

export const RELOCATE_OPTIONS = ["Open to relocation", "Prefer to stay", "Not sure"] as const;

export const FAMILY_INVOLVEMENT = ["High — family involved early", "Open", "Private for now"] as const;

export const SPIRITUAL_PRACTICES = [
  "Prayer",
  "Bible study",
  "Fasting",
  "Small group involvement",
  "Church service attendance",
] as const;

export const COURTSHIP_VIEWS = [
  "Courtship leads to marriage",
  "Dating with clear intent",
  "Slow, faith-led courtship",
] as const;

export const DENOMINATION_IMPORTANCE: DenominationImportance[] = ["Flexible", "Prefer same", "Required"];

export const PROFILES: Profile[] = [
  {
    id: "p1",
    firstName: "Adaeze",
    age: 29,
    gender: "Female",
    city: "Lagos",
    denomination: "Catholic",
    attendance: "Weekly+",
    job: "Pharmacist",
    bio: "Choir member at my parish. I want a man who prays and plans.",
    verse: "Ruth 1:16",
    verified: 3,
    intent: "Christian courtship",
    kids: "Want children",
    languages: ["English", "Igbo"],
    likesYou: true,
  },
  {
    id: "p2",
    firstName: "Tunde",
    age: 31,
    gender: "Male",
    city: "Abuja",
    denomination: "Anglican",
    attendance: "Most weeks",
    job: "Civil engineer",
    bio: "Sunday school teacher. Quiet, steady, loves jollof debates.",
    verse: "Psalm 37:4",
    verified: 3,
    intent: "Serious dating",
    kids: "Open",
    languages: ["English", "Hausa"],
    likesYou: false,
  },
  {
    id: "p3",
    firstName: "Chiamaka",
    age: 27,
    gender: "Female",
    city: "Lagos",
    denomination: "Pentecostal",
    attendance: "Weekly+",
    job: "Product designer",
    bio: "Cell group leader. Ready for courtship with clear intentions.",
    verse: "Proverbs 3:5",
    verified: 2,
    intent: "Christian courtship",
    kids: "Want children",
    languages: ["English", "Yoruba"],
    likesYou: true,
  },
  {
    id: "p4",
    firstName: "Emeka",
    age: 33,
    gender: "Male",
    city: "Port Harcourt",
    denomination: "Pentecostal",
    attendance: "Weekly+",
    job: "Accountant",
    bio: "Usher and budget nerd. Marriage is the goal, not the hobby.",
    verse: "Joshua 24:15",
    verified: 3,
    intent: "Marriage",
    kids: "Want children",
    languages: ["English"],
    likesYou: true,
  },
  {
    id: "p5",
    firstName: "Hauwa",
    age: 28,
    gender: "Female",
    city: "Kaduna",
    denomination: "Evangelical",
    attendance: "Most weeks",
    job: "Teacher",
    bio: "Love hymns, long walks and honest conversation.",
    verse: "Micah 6:8",
    verified: 2,
    intent: "Serious dating",
    kids: "Open",
    languages: ["English", "Hausa"],
    likesYou: false,
  },
  {
    id: "p6",
    firstName: "Segun",
    age: 30,
    gender: "Male",
    city: "Ibadan",
    denomination: "Baptist",
    attendance: "Weekly+",
    job: "Software developer",
    bio: "Youth fellowship volunteer. Looking for a prayer partner for life.",
    verse: "Ecclesiastes 4:9",
    verified: 2,
    intent: "Christian courtship",
    kids: "Want children",
    languages: ["English", "Yoruba"],
    likesYou: true,
  },
  {
    id: "p7",
    firstName: "Ifeoma",
    age: 35,
    gender: "Female",
    city: "Enugu",
    denomination: "Catholic",
    attendance: "Weekly+",
    job: "Nurse",
    bio: "Widow with one child. Seeking a kind, mature man of faith.",
    verse: "Isaiah 41:10",
    verified: 3,
    intent: "Remarriage",
    kids: "Open",
    languages: ["English", "Igbo"],
    likesYou: false,
  },
  {
    id: "p8",
    firstName: "Bola",
    age: 26,
    gender: "Female",
    city: "Lagos",
    denomination: "Methodist",
    attendance: "Occasionally",
    job: "Marketer",
    bio: "Rebuilding my faith routine and open to growing with someone.",
    verse: "Psalm 46:10",
    verified: 1,
    intent: "Dating with clear intent",
    kids: "Open",
    languages: ["English", "Yoruba", "Pidgin"],
    likesYou: false,
  },
  {
    id: "p9",
    firstName: "Daniel",
    age: 32,
    gender: "Male",
    city: "Abuja",
    denomination: "Pentecostal",
    attendance: "Weekly+",
    job: "Banker",
    bio: "I lead a small group and sing badly but joyfully. Family matters to me.",
    verse: "Proverbs 16:3",
    verified: 3,
    intent: "Marriage",
    kids: "Want children",
    languages: ["English", "Igbo"],
    likesYou: true,
  },
  {
    id: "p10",
    firstName: "Kelechi",
    age: 30,
    gender: "Male",
    city: "Lagos",
    denomination: "Catholic",
    attendance: "Most weeks",
    job: "Architect",
    bio: "Design nerd, weekend volunteer, and a sucker for long conversations.",
    verse: "Colossians 3:23",
    verified: 2,
    intent: "Christian courtship",
    kids: "Open",
    languages: ["English", "Igbo"],
    likesYou: false,
  },
  {
    id: "p11",
    firstName: "Funmilayo",
    age: 31,
    gender: "Female",
    city: "Ibadan",
    denomination: "Baptist",
    attendance: "Weekly+",
    job: "Doctor",
    bio: "Busy but intentional. I want a partner who values prayer and family.",
    verse: "Psalm 139:14",
    verified: 3,
    intent: "Christian courtship",
    kids: "Want children",
    languages: ["English", "Yoruba"],
    likesYou: false,
  },
  {
    id: "p12",
    firstName: "Obinna",
    age: 34,
    gender: "Male",
    city: "Enugu",
    denomination: "Anglican",
    attendance: "Weekly+",
    job: "Entrepreneur",
    bio: "Building a business and a home. My faith is not a side note.",
    verse: "Matthew 6:33",
    verified: 3,
    intent: "Marriage",
    kids: "Open",
    languages: ["English", "Igbo"],
    likesYou: true,
  },
];

export const DEFAULT_MEMBER: MemberProfile = {
  firstName: "",
  email: "",
  dateOfBirth: "",
  age: 28,
  gender: "Female",
  city: "Lagos",
  country: "Nigeria",
  occupation: "",
  education: "",
  languages: ["English"],
  maritalStatus: "Never married",
  kids: "Open",
  relocate: "Open to relocation",
  alcohol: "Prefer not to say",
  smoking: "Prefer not to say",
  careerAmbition: "",
  familyInvolvement: "Open",
  bio: "",
  verse: "",
  intent: "Christian courtship",
  denomination: "Pentecostal",
  churchName: "",
  churchCity: "",
  attendance: "Weekly+",
  bornAgain: "",
  practices: [],
  courtshipViews: "Courtship leads to marriage",
  denominationImportance: "Prefer same",
  hideChurch: false,
  hideCity: false,
  hideEmployer: false,
  photo: null,
};

export const DEFAULT_PREFERENCES: Preferences = {
  ageMin: 24,
  ageMax: 40,
  cities: [],
  attendance: [],
  minVerification: 1,
  denominationImportance: "Prefer same",
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  matches: true,
  messages: true,
  dailyMatches: true,
  productUpdates: false,
};

export const COMMUNITY_ROOMS: CommunityRoom[] = [
  { id: "r1", name: "Lagos singles fellowship", description: "Meetups, prayer and encouragement", topic: "Fellowship" },
  { id: "r2", name: "Prayer requests", description: "Share needs and pray for one another", topic: "Prayer" },
  { id: "r3", name: "Courtship Q&A", description: "Ask about intentions, families and timelines", topic: "Courtship" },
  { id: "r4", name: "Abuja young professionals", description: "Career, faith and community", topic: "Professional" },
];

function seed(fromMe: boolean, author: string, text: string, minutesAgo: number): ChatMessage {
  return {
    id: `seed-${author}-${minutesAgo}`,
    fromMe,
    author,
    text,
    at: Date.now() - minutesAgo * 60_000,
  };
}

export const COMMUNITY_SEED: Record<string, ChatMessage[]> = {
  "room:r1": [
    seed(false, "Chiamaka", "Who’s joining Saturday’s fellowship at Yaba?", 180),
    seed(false, "Segun", "I’ll be there, and bringing two friends.", 165),
  ],
  "room:r2": [
    seed(false, "Adaeze", "Please pray for my mum’s surgery on Thursday.", 320),
    seed(false, "Tunde", "Praying for her recovery and for peace for your family.", 300),
  ],
  "room:r3": [
    seed(false, "Emeka", "How long should courtship run before introducing families?", 90),
    seed(false, "Ifeoma", "It varies — but clear intentions and honest timelines matter more than a number.", 75),
  ],
  "room:r4": [
    seed(false, "Daniel", "Anyone know a good premarital counsellor in Abuja?", 45),
    seed(false, "Bola", "My church runs a programme — I’ll share the details in the group.", 30),
  ],
};

export const PREMIUM_PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    price: "₦500",
    period: "/month",
    months: 1,
    tagline: "Flexible month-by-month",
  },
  {
    id: "quarterly",
    name: "Quarterly",
    price: "₦1,200",
    period: "/3 months",
    months: 3,
    tagline: "Save ₦300 versus monthly",
  },
  {
    id: "annual",
    name: "Annual",
    price: "₦5,000",
    period: "/year",
    months: 12,
    tagline: "Best value — about two months free",
  },
] as const;

export const FREE_FEATURES = [
  "Verified member profile",
  "Browse and filter curated profiles",
  "Save and revisit profiles",
  "Community rooms, reporting and blocking",
  "Safety centre and account notices",
];

export const PREMIUM_FEATURES = [
  "Express interest and open matches",
  "Private chat with mutual matches",
  "Up to 20 expressions of interest per day",
  "See who expressed interest in you",
  "Advanced filters and deal-breakers",
  "Weekly profile boost",
  "Read receipts and priority support",
];

export const PREMIUM_DAILY_INTERESTS = 20;

export const CHAT_OPENERS = [
  "Nice to meet you. How did you come to your church?",
  "What are you praying about in this season?",
  "I’d love to hear what you hope for in a marriage.",
  "What does a good Sunday look like for you?",
];

export const REPORT_REASONS = [
  "Scam or money request",
  "Harassment",
  "Fake profile",
  "Inappropriate content",
  "Underage member",
  "Other",
];

export const ADMIN_ACCESS_CODE = "COVENANT-ADMIN";
