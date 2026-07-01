export interface Scheme {
  id: string;
  name: string;
  description: string;
  benefits: string;
  required_documents: string[];
  application_link: string;
  tags: string[];
  eligibility_summary: string;
  category: string;
}

export const mockSchemes: Scheme[] = [
  // Farmers
  {
    id: "pm-kisan",
    name: "PM-Kisan Samman Nidhi",
    description: "Financial assistance for landholding farmer families across the country.",
    benefits: "₹6,000 per year transferred in three equal installments of ₹2,000 directly to bank accounts.",
    required_documents: ["Aadhaar Card", "Land holding documents", "Bank account details"],
    application_link: "https://pmkisan.gov.in/",
    tags: ["farmer", "financial", "agriculture"],
    eligibility_summary: "All landholding farmers families, which have cultivable landholding in their names are eligible.",
    category: "Farmers"
  },
  {
    id: "ysr-rythu-bharosa",
    name: "YSR Rythu Bharosa",
    description: "Financial assistance to farmers, including tenant farmers, in Andhra Pradesh.",
    benefits: "₹13,500 per year for five years (includes PM-Kisan benefit).",
    required_documents: ["Aadhaar Card", "Land records / Tenant proof", "Bank account passbook", "Resident proof of AP"],
    application_link: "https://ysrrythubharosa.ap.gov.in/",
    tags: ["farmer", "andhra pradesh", "agriculture"],
    eligibility_summary: "Landowner farmers and tenant farmers belonging to SC, ST, BC, and Minority communities in Andhra Pradesh.",
    category: "Farmers"
  },
  {
    id: "pm-fasal-bima-yojana",
    name: "Pradhan Mantri Fasal Bima Yojana",
    description: "Crop insurance scheme to provide financial support to farmers suffering crop loss/damage arising out of unforeseen events.",
    benefits: "Comprehensive insurance cover against failure of the crop helping in stabilising the income of the farmers.",
    required_documents: ["Aadhaar Card", "Land Records", "Sowing Certificate", "Bank Passbook"],
    application_link: "https://pmfby.gov.in/",
    tags: ["farmer", "insurance", "agriculture"],
    eligibility_summary: "All farmers growing notified crops in a notified area who have an insurable interest in the crop.",
    category: "Farmers"
  },
  {
    id: "kisan-credit-card",
    name: "Kisan Credit Card (KCC)",
    description: "Provides farmers with timely access to credit for agricultural and allied activities.",
    benefits: "Short-term credit limits for crop production, post-harvest expenses, and consumption needs.",
    required_documents: ["Aadhaar Card", "PAN Card", "Land Records", "Passport size photograph"],
    application_link: "https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card",
    tags: ["farmer", "credit", "loan", "agriculture"],
    eligibility_summary: "Farmers, tenant farmers, oral lessees, and sharecroppers.",
    category: "Farmers"
  },
  {
    id: "soil-health-card",
    name: "Soil Health Card Scheme",
    description: "Provides information to farmers on nutrient status of their soil along with recommendations on appropriate dosage of nutrients.",
    benefits: "Improves crop yield by promoting balanced use of fertilizers.",
    required_documents: ["Aadhaar Card", "Land Details"],
    application_link: "https://soilhealth.dac.gov.in/",
    tags: ["farmer", "soil", "agriculture"],
    eligibility_summary: "All farmers in India.",
    category: "Farmers"
  },
  {
    id: "e-nam",
    name: "e-NAM (National Agriculture Market)",
    description: "Pan-India electronic trading portal which networks the existing APMC mandis to create a unified national market for agricultural commodities.",
    benefits: "Better price discovery, transparency, and access to a wider market.",
    required_documents: ["Aadhaar Card", "Bank details", "Mobile number"],
    application_link: "https://enam.gov.in/web/",
    tags: ["farmer", "market", "trading", "agriculture"],
    eligibility_summary: "Farmers, traders, and commission agents.",
    category: "Farmers"
  },
  {
    id: "pm-krishi-sinchai-yojana",
    name: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
    description: "Aims to improve farm productivity and ensure better utilization of the resources in the country.",
    benefits: "Subsidies for micro-irrigation systems (drip and sprinkler).",
    required_documents: ["Aadhaar Card", "Land Records", "Bank Passbook"],
    application_link: "https://pmksy.gov.in/",
    tags: ["farmer", "irrigation", "water", "agriculture"],
    eligibility_summary: "Farmers with cultivable land.",
    category: "Farmers"
  },
  {
    id: "agriculture-mechanization-subsidy",
    name: "Sub-Mission on Agricultural Mechanization (SMAM)",
    description: "Promotes inclusive growth of agricultural mechanization to boost productivity.",
    benefits: "Subsidy up to 50-80% on purchase of agricultural machinery and equipment.",
    required_documents: ["Aadhaar Card", "Land Records", "Quotation of Machinery", "Bank Passbook"],
    application_link: "https://agrimachinery.nic.in/",
    tags: ["farmer", "machinery", "subsidy", "agriculture"],
    eligibility_summary: "All categories of farmers, with preference given to small/marginal farmers, women, SC/ST.",
    category: "Farmers"
  },

  // Pregnant Women
  {
    id: "pmmvy",
    name: "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
    description: "A maternity benefit program providing partial compensation for the wage loss in terms of cash incentives.",
    benefits: "₹5,000 cash incentive in three installments for the first living child.",
    required_documents: ["Aadhaar Card", "MCP Card", "Bank passbook", "Child Birth Certificate (for 3rd installment)"],
    application_link: "https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana",
    tags: ["women", "pregnant", "maternity", "health", "financial"],
    eligibility_summary: "Pregnant women and lactating mothers for their first living child (excluding regular employees of Central/State Govt).",
    category: "Pregnant Women"
  },
  {
    id: "janani-suraksha-yojana",
    name: "Janani Suraksha Yojana (JSY)",
    description: "Safe motherhood intervention under the National Health Mission.",
    benefits: "Cash assistance for institutional delivery (₹1400 in rural areas, ₹1000 in urban areas for Low Performing States).",
    required_documents: ["Aadhaar Card", "JSA Card / BPL Card", "Bank passbook"],
    application_link: "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309",
    tags: ["women", "pregnant", "health", "maternity", "financial"],
    eligibility_summary: "Pregnant women from BPL households delivering in government health facilities.",
    category: "Pregnant Women"
  },
  {
    id: "janani-shishu-suraksha-karyakram",
    name: "Janani Shishu Suraksha Karyakram (JSSK)",
    description: "Ensures absolutely free and no-expense delivery, including C-section.",
    benefits: "Free delivery, free drugs and consumables, free diagnostics, free diet during stay, free provision of blood, and free transport.",
    required_documents: ["Aadhaar Card", "MCP Card"],
    application_link: "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=842&lid=310",
    tags: ["women", "pregnant", "health", "maternity"],
    eligibility_summary: "All pregnant women delivering in public health institutions.",
    category: "Pregnant Women"
  },
  {
    id: "poshan-abhiyaan",
    name: "POSHAN Abhiyaan",
    description: "India's flagship programme to improve nutritional outcomes for children, pregnant women and lactating mothers.",
    benefits: "Nutritional support and health monitoring via Anganwadi centers.",
    required_documents: ["Aadhaar Card"],
    application_link: "https://poshanabhiyaan.gov.in/",
    tags: ["women", "pregnant", "children", "nutrition", "health"],
    eligibility_summary: "Pregnant women, lactating mothers, and children under 6 years.",
    category: "Pregnant Women"
  },
  {
    id: "icds-services",
    name: "Integrated Child Development Services (ICDS)",
    description: "Provides food, preschool education, primary healthcare, immunization, health check-up and referral services.",
    benefits: "Supplementary nutrition, health education, and basic healthcare.",
    required_documents: ["Aadhaar Card (Optional)", "Birth Certificate (for child)"],
    application_link: "https://wcd.nic.in/icds",
    tags: ["women", "pregnant", "children", "health", "education"],
    eligibility_summary: "Children in the age group of 0-6 years, pregnant women and lactating mothers.",
    category: "Pregnant Women"
  },

  // Students
  {
    id: "national-scholarship-portal",
    name: "National Scholarship Portal (NSP) Scholarships",
    description: "A one-stop platform for various scholarships offered by the Central Government, State Governments, and UGC.",
    benefits: "Financial assistance for education (varies by specific scheme applied for).",
    required_documents: ["Aadhaar Card", "Income Certificate", "Caste Certificate (if applicable)", "Previous Year Marksheet", "Bank details"],
    application_link: "https://scholarships.gov.in/",
    tags: ["student", "education", "scholarship", "financial"],
    eligibility_summary: "Students belonging to minority communities, SC/ST/OBC, or low-income families pursuing studies from class 1 to PhD.",
    category: "Students"
  },
  {
    id: "pm-yasasvi",
    name: "PM-YASASVI Scholarship",
    description: "Scholarship scheme for OBC, EBC and DNT students.",
    benefits: "Pre-matric and Post-matric scholarships to help students complete their education.",
    required_documents: ["Aadhaar Card", "Income Certificate (<2.5 Lakhs)", "Caste Certificate", "Marksheet"],
    application_link: "https://yet.nta.ac.in/",
    tags: ["student", "education", "scholarship", "obc"],
    eligibility_summary: "OBC, EBC, and DNT students with family income less than Rs. 2.5 Lakhs per annum.",
    category: "Students"
  },
  {
    id: "aicte-pragati",
    name: "AICTE Pragati Scholarship for Girls",
    description: "Scholarship for girl students pursuing technical education (Degree/Diploma).",
    benefits: "₹50,000 per annum for every year of study.",
    required_documents: ["Aadhaar Card", "Income Certificate (<8 Lakhs)", "10th/12th Marksheet", "Admission Letter"],
    application_link: "https://www.aicte-india.org/schemes/students-development-schemes/Pragati-Scholarship-Scheme",
    tags: ["student", "education", "scholarship", "women", "technical"],
    eligibility_summary: "Girl students (up to two girls per family) admitted to first year of Degree/Diploma level course, family income < 8 lakhs.",
    category: "Students"
  },
  {
    id: "aicte-saksham",
    name: "AICTE Saksham Scholarship",
    description: "Scholarship for specially-abled students pursuing technical education.",
    benefits: "₹50,000 per annum for every year of study.",
    required_documents: ["Aadhaar Card", "Disability Certificate (>40%)", "Income Certificate (<8 Lakhs)", "Admission Letter"],
    application_link: "https://www.aicte-india.org/schemes/students-development-schemes/Saksham-Scholarship-Scheme",
    tags: ["student", "education", "scholarship", "disability", "technical"],
    eligibility_summary: "Differently abled students having disability of not less than 40%, family income < 8 lakhs.",
    category: "Students"
  },
  {
    id: "inspire-scholarship",
    name: "INSPIRE Scholarship",
    description: "Innovation in Science Pursuit for Inspired Research (INSPIRE) aims to attract talent to the study of science.",
    benefits: "₹80,000 per annum (₹60k cash + ₹20k summertime attachment fee).",
    required_documents: ["Aadhaar Card", "Class 12 Marksheet", "Endorsement Certificate from College/University"],
    application_link: "https://online-inspire.gov.in/",
    tags: ["student", "education", "scholarship", "science", "research"],
    eligibility_summary: "Top 1% students in Class 12 board exams pursuing courses in Basic and Natural Sciences at BSc/BS/Int. MSc level.",
    category: "Students"
  },

  // Senior Citizens
  {
    id: "ignoaps",
    name: "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
    description: "Non-contributory old age pension scheme for BPL individuals.",
    benefits: "₹200 per month (age 60-79) and ₹500 per month (age 80+). State governments often add their own contribution.",
    required_documents: ["Aadhaar Card", "BPL Card / Income Certificate", "Age Proof", "Bank Passbook"],
    application_link: "https://nsap.nic.in/",
    tags: ["senior citizen", "pension", "financial", "bpl"],
    eligibility_summary: "Persons aged 60 years or above belonging to a Below Poverty Line (BPL) household.",
    category: "Senior Citizens"
  },
  {
    id: "atal-pension-yojana",
    name: "Atal Pension Yojana (APY)",
    description: "A guaranteed pension scheme administered by PFRDA, focused on unorganized sector workers.",
    benefits: "Guaranteed minimum pension of ₹1000 to ₹5000 per month after age 60.",
    required_documents: ["Aadhaar Card", "Savings Bank Account"],
    application_link: "https://npscra.nsdl.co.in/scheme-details.php",
    tags: ["senior citizen", "pension", "unorganized worker", "financial"],
    eligibility_summary: "Any Indian citizen between 18-40 years of age with a bank account.",
    category: "Senior Citizens"
  },
  {
    id: "senior-citizens-savings-scheme",
    name: "Senior Citizens Savings Scheme (SCSS)",
    description: "A government-backed savings instrument offered to Indian residents aged over 60 years.",
    benefits: "High interest rate (currently ~8.2% p.a.), regular income, and tax benefits under Section 80C.",
    required_documents: ["Aadhaar Card", "PAN Card", "Age Proof", "Photographs"],
    application_link: "https://www.indiapost.gov.in/Financial/pages/content/post-office-saving-schemes.aspx",
    tags: ["senior citizen", "savings", "financial", "investment"],
    eligibility_summary: "Individuals aged 60 years or above. Early retirees (55+) can also invest under specific conditions.",
    category: "Senior Citizens"
  },

  // Unorganized Workers / Labourers
  {
    id: "e-shram",
    name: "e-Shram Portal Registration",
    description: "National Database of Unorganized Workers (NDUW) to facilitate delivery of social security schemes.",
    benefits: "₹2 Lakh Accidental Insurance cover under PMSBY for a year, and access to other social security benefits.",
    required_documents: ["Aadhaar Card", "Bank Account Details", "Mobile Number linked to Aadhaar"],
    application_link: "https://eshram.gov.in/",
    tags: ["labour", "unorganized worker", "insurance", "registration"],
    eligibility_summary: "Any unorganized worker aged 16-59 years not a member of EPFO/ESIC or NPS.",
    category: "Daily Wage Labourers / Unorganized Workers"
  },
  {
    id: "pm-shram-yogi-maandhan",
    name: "Pradhan Mantri Shram Yogi Maandhan (PM-SYM)",
    description: "A voluntary and contributory pension scheme for unorganized workers.",
    benefits: "Assured minimum monthly pension of ₹3,000 after attaining the age of 60 years.",
    required_documents: ["Aadhaar Card", "Savings Bank Account / Jan Dhan Account Details"],
    application_link: "https://maandhan.in/shramyogi",
    tags: ["labour", "unorganized worker", "pension", "financial"],
    eligibility_summary: "Unorganized workers aged 18-40 years with monthly income ≤ ₹15,000.",
    category: "Daily Wage Labourers / Unorganized Workers"
  },
  {
    id: "bocw-welfare",
    name: "Building and Other Construction Workers (BOCW) Welfare Scheme",
    description: "Welfare boards set up by State Governments to provide various benefits to construction workers.",
    benefits: "Assistance for education, marriage, maternity, death/disability, and pension (varies by state).",
    required_documents: ["Aadhaar Card", "Certificate of 90 days work as construction worker", "Age proof", "Bank details"],
    application_link: "https://bocw.ap.gov.in/", // Example link, varies by state
    tags: ["labour", "construction worker", "welfare", "financial"],
    eligibility_summary: "Construction workers aged 18-60 who have worked for at least 90 days in the preceding 12 months.",
    category: "Daily Wage Labourers / Unorganized Workers"
  },

  // Women
  {
    id: "sukanya-samriddhi-yojana",
    name: "Sukanya Samriddhi Yojana",
    description: "A small savings scheme backed by the Government of India targeted at the parents of girl children.",
    benefits: "High interest rate, tax benefits under 80C, and maturity amount for the girl's education/marriage.",
    required_documents: ["Birth Certificate of Girl Child", "Identity and Address proof of Parent/Guardian"],
    application_link: "https://www.indiapost.gov.in/Financial/pages/content/post-office-saving-schemes.aspx",
    tags: ["women", "girl child", "savings", "financial", "education"],
    eligibility_summary: "Parents or legal guardians of a girl child up to the age of 10 years.",
    category: "Women"
  },
  {
    id: "beti-bachao-beti-padhao",
    name: "Beti Bachao Beti Padhao",
    description: "A campaign to address the declining Child Sex Ratio and promote girls' education.",
    benefits: "Awareness, community engagement, and convergence of schemes for girls' welfare.",
    required_documents: [],
    application_link: "https://wcd.nic.in/bbbp-schemes",
    tags: ["women", "girl child", "education", "welfare"],
    eligibility_summary: "All girl children in India.",
    category: "Women"
  },
  {
    id: "stand-up-india",
    name: "Stand-Up India",
    description: "Facilitates bank loans for setting up greenfield enterprises.",
    benefits: "Bank loans between ₹10 lakh and ₹1 Crore.",
    required_documents: ["Aadhaar Card", "PAN Card", "Project Report", "Caste Certificate (if SC/ST)"],
    application_link: "https://www.standupmitra.in/",
    tags: ["women", "sc", "st", "business", "loan", "entrepreneurship"],
    eligibility_summary: "SC/ST and/or women entrepreneurs above 18 years of age.",
    category: "Women"
  },
  {
    id: "ujjwala-yojana",
    name: "Pradhan Mantri Ujjwala Yojana (PMUY)",
    description: "Provides LPG connections to women from Below Poverty Line (BPL) households.",
    benefits: "Deposit-free LPG connection along with financial assistance.",
    required_documents: ["Aadhaar Card", "BPL Ration Card", "Bank Account Details", "Passport size photograph"],
    application_link: "https://www.pmuy.gov.in/",
    tags: ["women", "bpl", "health", "lpg", "cooking"],
    eligibility_summary: "Adult women belonging to BPL families, SC/ST, PMAY(G), AAY, etc., with no existing LPG connection in the household.",
    category: "Women"
  },

  // Persons with Disabilities
  {
    id: "udid",
    name: "Unique Disability ID (UDID)",
    description: "Creating a National Database for PwDs, and to issue a Unique Disability Identity Card to each person with disabilities.",
    benefits: "Single document for availing various benefits, tracking progress, and ensuring transparency.",
    required_documents: ["Aadhaar Card", "Recent color photograph", "Signature / Thumb impression", "Disability Certificate (if any)"],
    application_link: "https://www.swavlambancard.gov.in/",
    tags: ["disability", "id", "welfare"],
    eligibility_summary: "Any person with a disability as defined in the RPwD Act 2016.",
    category: "Persons with Disabilities"
  },
  {
    id: "adip-scheme",
    name: "Assistance to Disabled Persons (ADIP)",
    description: "Assistance to needy disabled persons in procuring durable, sophisticated and scientifically manufactured standard aids and appliances.",
    benefits: "Free or subsidized aids and appliances (like wheelchairs, hearing aids, prosthetics).",
    required_documents: ["UDID / Disability Certificate", "Income Certificate", "Aadhaar Card"],
    application_link: "http://disabilityaffairs.gov.in/content/page/adip.php",
    tags: ["disability", "health", "appliance", "welfare"],
    eligibility_summary: "Indian citizen, with >40% disability, monthly income < ₹20,000 for full subsidy (up to ₹30,000 for 50% subsidy).",
    category: "Persons with Disabilities"
  },

  // Employment
  {
    id: "pm-kaushal-vikas-yojana",
    name: "Pradhan Mantri Kaushal Vikas Yojana (PMKVY)",
    description: "Skill certification scheme to enable a large number of Indian youth to take up industry-relevant skill training.",
    benefits: "Free skill training, certification, and placement assistance.",
    required_documents: ["Aadhaar Card", "Bank Account Details", "Passport size photographs"],
    application_link: "https://www.pmkvyofficial.org/",
    tags: ["employment", "skill", "training", "youth"],
    eligibility_summary: "Any youth of Indian nationality who is unemployed or a school/college dropout.",
    category: "Employment"
  },
  {
    id: "national-career-service",
    name: "National Career Service (NCS)",
    description: "A portal providing a wide variety of employment related services.",
    benefits: "Job matching, career counseling, information on skill development courses, internships etc.",
    required_documents: ["Aadhaar Card / PAN / Voter ID", "Educational Certificates"],
    application_link: "https://www.ncs.gov.in/",
    tags: ["employment", "job", "career", "portal"],
    eligibility_summary: "Job seekers, employers, skill providers, career counselors.",
    category: "Employment"
  },
  {
    id: "mudra-loan",
    name: "Pradhan Mantri MUDRA Yojana (PMMY)",
    description: "Provides loans up to 10 lakhs to the non-corporate, non-farm small/micro enterprises.",
    benefits: "Collateral-free loans in three categories: Shishu (up to ₹50k), Kishore (₹50k-₹5L), Tarun (₹5L-₹10L).",
    required_documents: ["Aadhaar Card", "PAN Card", "Business Plan", "Proof of Identity/Address"],
    application_link: "https://www.mudra.org.in/",
    tags: ["business", "loan", "entrepreneurship", "employment", "financial"],
    eligibility_summary: "Any Indian citizen who has a business plan for a non-farm sector income generating activity.",
    category: "Employment"
  },

  // Healthcare
  {
    id: "ayushman-bharat-pmjay",
    name: "Ayushman Bharat PM-JAY",
    description: "World's largest health insurance/ assurance scheme fully financed by the government.",
    benefits: "Health cover of ₹5 lakhs per family per year for secondary and tertiary care hospitalization.",
    required_documents: ["Aadhaar Card", "Ration Card (for family identification)"],
    application_link: "https://pmjay.gov.in/",
    tags: ["health", "insurance", "medical", "hospitalization", "bpl"],
    eligibility_summary: "Deprived families identified via SECC 2011 data, covering roughly the bottom 40% of the population.",
    category: "Healthcare"
  },
  {
    id: "pm-national-dialysis-programme",
    name: "Pradhan Mantri National Dialysis Programme",
    description: "Provision of free dialysis services to the poor.",
    benefits: "Free dialysis services for BPL patients at district hospitals.",
    required_documents: ["Aadhaar Card", "BPL Card / Income Proof", "Medical Prescription"],
    application_link: "https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=1033&lid=603",
    tags: ["health", "medical", "dialysis", "bpl"],
    eligibility_summary: "BPL patients requiring dialysis.",
    category: "Healthcare"
  }
];
