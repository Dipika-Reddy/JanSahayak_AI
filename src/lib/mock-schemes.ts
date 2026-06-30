export interface Scheme {
  id: string;
  name: string;
  description: string;
  benefits: string;
  required_documents: string[];
  application_link: string;
  tags: string[];
  eligibility_summary: string;
}

export const mockSchemes: Scheme[] = [
  {
    id: "pm-kisan",
    name: "PM-Kisan Samman Nidhi",
    description: "Financial assistance for landholding farmer families across the country.",
    benefits: "₹6,000 per year transferred in three equal installments of ₹2,000 directly to bank accounts.",
    required_documents: ["Aadhaar Card", "Land holding documents", "Bank account details"],
    application_link: "https://pmkisan.gov.in/",
    tags: ["farmer", "financial", "agriculture"],
    eligibility_summary: "All landholding farmers families, which have cultivable landholding in their names are eligible."
  },
  {
    id: "ysr-rythu-bharosa",
    name: "YSR Rythu Bharosa",
    description: "Financial assistance to farmers, including tenant farmers, in Andhra Pradesh.",
    benefits: "₹13,500 per year for five years (includes PM-Kisan benefit).",
    required_documents: ["Aadhaar Card", "Land records / Tenant proof", "Bank account passbook", "Resident proof of AP"],
    application_link: "https://ysrrythubharosa.ap.gov.in/",
    tags: ["farmer", "andhra pradesh", "agriculture"],
    eligibility_summary: "Landowner farmers and tenant farmers belonging to SC, ST, BC, and Minority communities in Andhra Pradesh."
  },
  {
    id: "pm-fasal-bima-yojana",
    name: "Pradhan Mantri Fasal Bima Yojana",
    description: "Crop insurance scheme to provide financial support to farmers suffering crop loss/damage arising out of unforeseen events.",
    benefits: "Comprehensive insurance cover against failure of the crop helping in stabilising the income of the farmers.",
    required_documents: ["Aadhaar Card", "Land Records", "Sowing Certificate", "Bank Passbook"],
    application_link: "https://pmfby.gov.in/",
    tags: ["farmer", "insurance", "agriculture"],
    eligibility_summary: "All farmers growing notified crops in a notified area who have an insurable interest in the crop."
  },
  {
    id: "pmmvy",
    name: "Pradhan Mantri Matru Vandana Yojana",
    description: "A maternity benefit program providing partial compensation for the wage loss in terms of cash incentives.",
    benefits: "₹5,000 cash incentive in three installments.",
    required_documents: ["Aadhaar Card", "MCP Card", "Bank passbook"],
    application_link: "https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana",
    tags: ["women", "pregnant", "maternity", "health"],
    eligibility_summary: "Pregnant women and lactating mothers for their first living child."
  }
];
