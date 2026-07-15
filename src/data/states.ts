export interface StateData {
  name: string;
  abbreviation: string;
  slug: string;
  offered: boolean;
  allowsMedicalExemption: boolean;
  price: number;
  originalPrice: number;
  heroTitle: string;
  heroDescription: string;
  tintLaws: {
    frontWindshield: string;
    frontSideWindows: string;
    backSideWindows: string;
    rearWindow: string;
  };
  ticketFine: string;
  dmvFiling: string;
  exemptionDuration: string;
  qualifyingConditions: {
    name: string;
    description: string;
  }[];
  howToSteps: {
    title: string;
    description: string;
  }[];
  understandingSection: string;
  whatIsExemption: string;
  tintLawsDescription: string;
  pulledOverAdvice: string;
  commonMistakes: {
    title: string;
    description: string;
  }[];
  faq: {
    question: string;
    answer: string;
  }[];
  nearbyStates: {
    name: string;
    abbreviation: string;
    slug: string;
  }[];
}

function stateHeroTitle(stateName: string): string {
  return `${stateName} Medical Window Tint Information`;
}

function stateHeroDescription(stateName: string): string {
  return `Review an educational summary of ${stateName} window-tint rules, documentation considerations, and the intake process coordinated through MyEyeRx. Verify current requirements with the responsible state agency before changing a vehicle.`;
}

function buildRelevantConditions(): StateData["qualifyingConditions"] {
  return [
    { name: "Photosensitivity or Photophobia", description: "Documented light-related symptoms may be relevant to a clinician's individualized review. The symptom alone does not establish state eligibility." },
    { name: "Autoimmune Conditions", description: "Some autoimmune conditions can involve light sensitivity. A reviewing clinician must consider the applicant's own history and supporting records." },
    { name: "Eye or Neurologic Conditions", description: "Certain eye or neurologic conditions may involve glare or light sensitivity. Only a qualified clinician can assess the individual's situation." },
    { name: "Skin or Photosensitive Conditions", description: "Some skin conditions or treatments may be affected by light exposure. State standards and accepted documentation vary." },
    { name: "Surgery or Treatment-Related Concerns", description: "Recent surgery, treatment, or medication effects may be relevant when supported by a record from the treating clinician or facility." },
  ];
}

function stateOverview(stateName: string): string {
  return `Window-tint rules and medical-documentation procedures vary by state and can change. This page gives a general overview for ${stateName}; it is not legal or medical advice and is not an official state publication. A medical condition or supporting record may be relevant to an independent clinician's review, but it does not by itself establish eligibility or authorize a particular tint. Confirm the current rule, form, vehicle requirements, and filing process with the responsible ${stateName} agency before relying on this summary.`;
}

function stateExemptionExplanation(stateName: string, allowsMedicalExemption = true): string {
  return allowsMedicalExemption
    ? `Where ${stateName} provides a medical window-tint exception or exemption process, the state decides what documentation it accepts and what vehicle-specific limits still apply. MyEyeRx coordinates intake and referral to an independent licensed clinician; the clinician makes the clinical decision, and any state agency or law-enforcement authority makes its own acceptance and enforcement decisions. Review, payment, or possession of medical documentation is not a guarantee of approval, a certificate, agency acceptance, or protection from a citation.`
    : `Our current service table does not list an available medical window-tint pathway for ${stateName}. Because rules and agency interpretations can change, verify that status directly with the responsible state agency or a qualified local attorney. A clinician's note does not independently change vehicle-equipment law or guarantee that an agency or officer will accept it.`;
}

function buildStateSteps(stateName: string, allowsMedicalExemption = true): StateData["howToSteps"] {
  if (!allowsMedicalExemption) {
    return [
      { title: "Verify the Current State Rule", description: `Check the responsible ${stateName} agency's current statute, regulation, forms, and vehicle requirements. This website is not an official source.` },
      { title: "Discuss Light Sensitivity With Your Existing Clinician", description: "Seek individualized medical guidance about symptoms and protective options. A medical record does not itself authorize noncompliant tint." },
      { title: "Use Only Lawful Alternatives", description: "Before installing any product, confirm that it complies with the current rule. A local attorney or the responsible agency can address legal questions." },
    ];
  }

  return [
    { title: "Verify the Current State Requirements", description: `Check the responsible ${stateName} agency for the current rule, accepted professional credentials, required form, vehicle restrictions, filing method, and renewal requirements.` },
    { title: "Gather Relevant Supporting Records", description: "Useful records commonly identify the applicant, the treating clinician or facility, and the relevant condition, symptoms, surgery, or treatment. A brief letter on facility letterhead may help document prior surgery. Do not send medical records through ordinary email or chat." },
    { title: "Complete the Secure Intake", description: "Answer every required screening question accurately. MyEyeRx coordinates the referral, but an independent licensed clinician decides whether the submitted information supports any medical documentation." },
    { title: "Follow the State and Vehicle Process", description: `If documentation is issued, independently confirm the next steps with the responsible ${stateName} agency before changing tint. Approval, agency acceptance, permitted darkness, carrying rules, and renewal are not guaranteed by this service.` },
  ];
}

function enforcementGuidance(stateName: string): string {
  return `If you are stopped or cited in ${stateName}, remain respectful and follow lawful instructions. Keep any current records accessible and provide them only when appropriate, but do not assume they eliminate a citation or establish a legal defense. This site cannot advise you about roadside rights, court procedure, or a specific ticket; contact the issuing authority or a qualified local attorney for guidance.`;
}

function buildStateCommonMistakes(stateName: string): StateData["commonMistakes"] {
  return [
    { title: "Relying on an Unofficial or Outdated Summary", description: `Confirm ${stateName}'s current rule and form with the responsible agency before paying, filing, or modifying a vehicle.` },
    { title: "Assuming a Diagnosis Automatically Qualifies", description: "Eligibility depends on the current state standard and an individualized clinical review. A listed condition is not an approval promise." },
    { title: "Submitting Incomplete or Unrelated Records", description: "Provide legible, relevant records that identify you and the treating clinician or facility. Missing information can require follow-up." },
    { title: "Installing Tint Before Verifying Every Requirement", description: "Medical documentation does not by itself establish the permitted VLT, covered windows, vehicle registration, filing, or enforcement treatment." },
    { title: "Sharing Medical Information Insecurely", description: "Use the secure upload in the intake. Do not place medical details in ordinary email, support chat, or public messages." },
  ];
}

function buildStateFaq(
  stateName: string,
  price: number,
  offered: boolean,
  allowsMedicalExemption = true,
): StateData["faq"] {
  const serviceAnswer = offered
    ? `The listed intake price is $${price}. A relevant supporting document is required before checkout for every order. Payment covers the intake and coordination service; it does not guarantee clinical approval, issuance of documentation, state acceptance, or a particular tint allowance.`
    : `OnlineTintExemption is not currently accepting paid intake for ${stateName}. Contact the responsible state agency or a qualified local professional for current options.`;

  return [
    { question: `How do I know whether I qualify in ${stateName}?`, answer: allowsMedicalExemption ? `Check ${stateName}'s current official eligibility standard, then complete an individualized clinical review. A condition named on this site may be relevant, but no diagnosis automatically qualifies and no outcome is guaranteed.` : `Our current service table does not list an available medical window-tint pathway for ${stateName}. Verify the current rule directly with the responsible state agency because requirements can change.` },
    { question: "What supporting documents may be useful?", answer: "In many cases, a record showing your name, the treating clinician or facility, and the relevant medical condition, symptoms, or treatment can support review. For a surgery-related issue, a brief letter on the facility's letterhead confirming treatment may be useful. Exact requirements vary; use the secure upload and contact support if you are unsure." },
    { question: "What does the service cost and when are documents required?", answer: serviceAnswer },
    { question: "How long does review take?", answer: "Timing depends on record completeness, follow-up needs, independent clinician availability, and any state process. No approval, issuance, delivery, or agency-processing time is guaranteed." },
    { question: "Does medical documentation authorize any tint level or prevent a ticket?", answer: `No. Confirm ${stateName}'s current window, VLT, vehicle, filing, carrying, and renewal rules with the responsible agency. Medical documentation is not a promise of agency acceptance, law-enforcement treatment, or protection from a citation.` },
    { question: "What if I am denied or the documentation is not accepted?", answer: "Clinical decisions and government acceptance are outside the site's control. Review the posted refund policy before purchase, and contact support about an order-specific issue. For legal questions or citations, contact the responsible authority or a qualified local attorney." },
  ];
}

export const states: Record<string, StateData> = {
  ohio: {
    name: "Ohio",
    abbreviation: "OH",
    slug: "ohio",
    offered: true,
    allowsMedicalExemption: true,
    price: 250,
    originalPrice: 350,
    heroTitle: stateHeroTitle("Ohio"),
    heroDescription: stateHeroDescription("Ohio"),
    tintLaws: {
      frontWindshield: "Non-reflective above AS-1 line",
      frontSideWindows: "50% VLT",
      backSideWindows: "Any darkness",
      rearWindow: "Any darkness",
    },
    ticketFine: "$120",
    dmvFiling: "Not Required",
    exemptionDuration: "Per physician recommendation",
    qualifyingConditions: buildRelevantConditions(),
    understandingSection: stateOverview("Ohio"),
    whatIsExemption: stateExemptionExplanation("Ohio"),
    tintLawsDescription: "Ohio's window tint laws are designed to ensure safety while allowing some degree of personal preference. In 2026, these laws stipulate specific limits on the amount of visible light transmitted through vehicle windows, aiming to enhance visibility for drivers and passengers alike.\n\nThe legal limits for tint in Ohio are as follows: front side windows must allow at least 50% of light (VLT), while back side and rear windows have no restrictions. VLT stands for Visible Light Transmission, which measures how much light passes through the window. This percentage is crucial, as too dark a tint can impair visibility and create safety hazards. Enforcement of these laws is primarily the responsibility of law enforcement officers who may issue citations for violations. Drivers found in violation may face fines, typically around $120, if they do not have an exemption.",
    howToSteps: buildStateSteps("Ohio"),
    pulledOverAdvice: enforcementGuidance("Ohio"),
    commonMistakes: buildStateCommonMistakes("Ohio"),
    faq: buildStateFaq("Ohio", 250, true),
    nearbyStates: [
      { name: "Indiana", abbreviation: "IN", slug: "indiana" },
      { name: "Kentucky", abbreviation: "KY", slug: "kentucky" },
      { name: "Pennsylvania", abbreviation: "PA", slug: "pennsylvania" },
      { name: "West Virginia", abbreviation: "WV", slug: "west-virginia" },
    ],
  },
  texas: {
    name: "Texas",
    abbreviation: "TX",
    slug: "texas",
    offered: true,
    allowsMedicalExemption: true,
    price: 225,
    originalPrice: 325,
    heroTitle: stateHeroTitle("Texas"),
    heroDescription: stateHeroDescription("Texas"),
    tintLaws: {
      frontWindshield: "25% VLT above AS-1 line",
      frontSideWindows: "25% VLT",
      backSideWindows: "25% VLT",
      rearWindow: "Any darkness",
    },
    ticketFine: "$250",
    dmvFiling: "Not Required",
    exemptionDuration: "Per physician recommendation",
    qualifyingConditions: buildRelevantConditions(),
    understandingSection: stateOverview("Texas"),
    whatIsExemption: stateExemptionExplanation("Texas"),
    tintLawsDescription: "Texas window tint laws in 2026 set specific limits on visible light transmission. Front side windows must allow at least 25% VLT, and the windshield can have tint above the AS-1 line with 25% VLT. Back side windows also require 25% VLT, while the rear window has no restrictions. Violations can result in fines up to $250.",
    howToSteps: buildStateSteps("Texas"),
    pulledOverAdvice: enforcementGuidance("Texas"),
    commonMistakes: buildStateCommonMistakes("Texas"),
    faq: buildStateFaq("Texas", 225, true),
    nearbyStates: [
      { name: "Louisiana", abbreviation: "LA", slug: "louisiana" },
      { name: "Oklahoma", abbreviation: "OK", slug: "oklahoma" },
      { name: "Arkansas", abbreviation: "AR", slug: "arkansas" },
      { name: "New Mexico", abbreviation: "NM", slug: "new-mexico" },
    ],
  },
  california: {
    name: "California",
    abbreviation: "CA",
    slug: "california",
    offered: true,
    allowsMedicalExemption: true,
    price: 250,
    originalPrice: 350,
    heroTitle: stateHeroTitle("California"),
    heroDescription: stateHeroDescription("California"),
    tintLaws: {
      frontWindshield: "70% VLT on top 4 inches",
      frontSideWindows: "70% VLT",
      backSideWindows: "Any darkness",
      rearWindow: "Any darkness",
    },
    ticketFine: "$250",
    dmvFiling: "Not Required",
    exemptionDuration: "Per physician recommendation",
    qualifyingConditions: buildRelevantConditions(),
    understandingSection: stateOverview("California"),
    whatIsExemption: stateExemptionExplanation("California"),
    tintLawsDescription: "California has strict window tint laws. Front side windows must allow at least 70% VLT. The windshield can only have non-reflective tint on the top 4 inches. Back side and rear windows can be any darkness. Violations can result in fix-it tickets and fines up to $250.",
    howToSteps: buildStateSteps("California"),
    pulledOverAdvice: enforcementGuidance("California"),
    commonMistakes: buildStateCommonMistakes("California"),
    faq: buildStateFaq("California", 250, true),
    nearbyStates: [
      { name: "Nevada", abbreviation: "NV", slug: "nevada" },
      { name: "Arizona", abbreviation: "AZ", slug: "arizona" },
      { name: "Oregon", abbreviation: "OR", slug: "oregon" },
    ],
  },
  florida: {
    name: "Florida",
    abbreviation: "FL",
    slug: "florida",
    offered: true,
    allowsMedicalExemption: true,
    price: 250,
    originalPrice: 350,
    heroTitle: stateHeroTitle("Florida"),
    heroDescription: stateHeroDescription("Florida"),
    tintLaws: {
      frontWindshield: "Non-reflective above AS-1 line",
      frontSideWindows: "28% VLT",
      backSideWindows: "15% VLT",
      rearWindow: "15% VLT",
    },
    ticketFine: "$116",
    dmvFiling: "Required",
    exemptionDuration: "Per DMV approval",
    qualifyingConditions: buildRelevantConditions(),
    understandingSection: stateOverview("Florida"),
    whatIsExemption: stateExemptionExplanation("Florida"),
    tintLawsDescription: "Florida allows front side windows with at least 28% VLT and back side and rear windows with at least 15% VLT. The windshield can have non-reflective tint above the AS-1 line. Violations can result in fines of approximately $116.",
    howToSteps: buildStateSteps("Florida"),
    pulledOverAdvice: enforcementGuidance("Florida"),
    commonMistakes: buildStateCommonMistakes("Florida"),
    faq: buildStateFaq("Florida", 250, true),
    nearbyStates: [
      { name: "Georgia", abbreviation: "GA", slug: "georgia" },
      { name: "Alabama", abbreviation: "AL", slug: "alabama" },
      { name: "South Carolina", abbreviation: "SC", slug: "south-carolina" },
    ],
  },
};

// Real tint law data per state (by abbreviation)
const tintData: Record<string, { front: string; back: string; rear: string; windshield: string; fine: string; exemption: boolean; duration: string; dmv: string }> = {
  AL: { front: "32% VLT", back: "32% VLT", rear: "32% VLT", windshield: "Non-reflective above AS-1 line", fine: "$100–$200", exemption: true, duration: "1 year", dmv: "Keep in vehicle" },
  AK: { front: "70% VLT", back: "40% VLT", rear: "Any darkness", windshield: "Non-reflective above AS-1 line", fine: "Up to $300", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  AZ: { front: "33% VLT", back: "Any darkness", rear: "Any darkness", windshield: "Non-reflective above AS-1 line", fine: "$250", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  AR: { front: "25% VLT", back: "25% VLT", rear: "10% VLT", windshield: "25% VLT above AS-1 line", fine: "$100", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  CA: { front: "70% VLT", back: "Any darkness", rear: "Any darkness", windshield: "70% VLT on top 4 inches", fine: "$250", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  CO: { front: "27% VLT", back: "27% VLT", rear: "27% VLT", windshield: "Non-reflective above AS-1 line", fine: "Up to $500", exemption: true, duration: "2 years", dmv: "Keep in vehicle" },
  CT: { front: "35% VLT", back: "35% VLT", rear: "Any darkness", windshield: "Non-reflective above AS-1 line", fine: "$150", exemption: true, duration: "Per physician recommendation", dmv: "Carry exemption certificate" },
  DE: { front: "70% VLT", back: "70% VLT", rear: "70% VLT", windshield: "Non-reflective above AS-1 line", fine: "$115", exemption: true, duration: "2 years", dmv: "Register with DMV" },
  FL: { front: "28% VLT", back: "15% VLT", rear: "15% VLT", windshield: "Non-reflective above AS-1 line", fine: "$116", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  GA: { front: "32% VLT", back: "32% VLT", rear: "32% VLT", windshield: "Non-reflective above AS-1 line (6 inches)", fine: "$150", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  HI: { front: "35% VLT", back: "35% VLT", rear: "35% VLT", windshield: "Non-reflective above AS-1 line", fine: "$200", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  ID: { front: "35% VLT", back: "20% VLT", rear: "35% VLT", windshield: "Non-reflective above AS-1 line", fine: "$90", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  IL: { front: "35% VLT", back: "35% VLT", rear: "35% VLT", windshield: "Non-reflective above AS-1 line (6 inches)", fine: "$164", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  IN: { front: "30% VLT", back: "30% VLT", rear: "30% VLT", windshield: "Non-reflective above AS-1 line", fine: "$150", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  IA: { front: "70% VLT", back: "Any darkness", rear: "Any darkness", windshield: "Non-reflective above AS-1 line", fine: "$127", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  KS: { front: "35% VLT", back: "35% VLT", rear: "35% VLT", windshield: "Non-reflective above AS-1 line", fine: "$75", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  KY: { front: "35% VLT", back: "18% VLT", rear: "18% VLT", windshield: "Non-reflective above AS-1 line", fine: "$179", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  LA: { front: "40% VLT", back: "25% VLT", rear: "12% VLT", windshield: "Non-reflective above AS-1 line", fine: "$350", exemption: true, duration: "2 years", dmv: "Keep in vehicle" },
  ME: { front: "35% VLT", back: "Any darkness", rear: "Any darkness", windshield: "Non-reflective above AS-1 line", fine: "$100–$200", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  MD: { front: "35% VLT", back: "35% VLT", rear: "35% VLT", windshield: "Non-reflective above AS-1 line", fine: "Up to $500", exemption: true, duration: "Per physician recommendation", dmv: "Register with MVA" },
  MA: { front: "35% VLT", back: "35% VLT", rear: "35% VLT", windshield: "Non-reflective above AS-1 line", fine: "$250", exemption: true, duration: "Per physician recommendation", dmv: "Register with RMV" },
  MI: { front: "Any darkness", back: "Any darkness", rear: "Any darkness", windshield: "4-inch tint strip at top", fine: "$115", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  MN: { front: "50% VLT", back: "Any darkness", rear: "Any darkness", windshield: "Non-reflective above AS-1 line", fine: "$100", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  MS: { front: "28% VLT", back: "28% VLT", rear: "28% VLT", windshield: "Non-reflective above AS-1 line", fine: "$200", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  MO: { front: "35% VLT", back: "Any darkness", rear: "Any darkness", windshield: "Non-reflective above AS-1 line", fine: "$75", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  MT: { front: "24% VLT", back: "14% VLT", rear: "14% VLT", windshield: "Non-reflective above AS-1 line", fine: "$250", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  NE: { front: "35% VLT", back: "20% VLT", rear: "20% VLT", windshield: "Non-reflective above AS-1 line", fine: "$100", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  NV: { front: "35% VLT", back: "Any darkness", rear: "Any darkness", windshield: "Non-reflective above AS-1 line", fine: "$250", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  NH: { front: "70% VLT", back: "35% VLT", rear: "35% VLT", windshield: "Non-reflective tint not permitted below AS-1 line", fine: "$124", exemption: false, duration: "N/A", dmv: "N/A — no medical exemption" },
  NJ: { front: "No tint allowed", back: "Any darkness", rear: "Any darkness", windshield: "No tint allowed", fine: "Up to $1,000", exemption: true, duration: "Per physician recommendation", dmv: "Register with MVC" },
  NM: { front: "20% VLT", back: "20% VLT", rear: "20% VLT", windshield: "Non-reflective above AS-1 line", fine: "$100", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  NY: { front: "70% VLT", back: "70% VLT", rear: "Any darkness", windshield: "Non-reflective above top 6 inches", fine: "$150", exemption: true, duration: "Per physician recommendation", dmv: "Carry Form MV-80W" },
  NC: { front: "35% VLT", back: "35% VLT", rear: "35% VLT", windshield: "Non-reflective above AS-1 line", fine: "$200", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  ND: { front: "50% VLT", back: "Any darkness", rear: "Any darkness", windshield: "Non-reflective above AS-1 line", fine: "$100", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  OH: { front: "50% VLT", back: "Any darkness", rear: "Any darkness", windshield: "Non-reflective above AS-1 line", fine: "$120", exemption: true, duration: "Per physician recommendation", dmv: "Not required" },
  OK: { front: "25% VLT", back: "25% VLT", rear: "25% VLT", windshield: "Non-reflective above AS-1 line", fine: "$200", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  OR: { front: "35% VLT", back: "35% VLT", rear: "Any darkness", windshield: "Non-reflective above AS-1 line", fine: "$360", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  PA: { front: "70% VLT", back: "70% VLT", rear: "70% VLT", windshield: "Non-reflective above AS-1 line", fine: "$110", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  RI: { front: "70% VLT", back: "70% VLT", rear: "70% VLT", windshield: "Non-reflective above AS-1 line", fine: "$85", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  SC: { front: "27% VLT", back: "27% VLT", rear: "27% VLT", windshield: "Non-reflective above AS-1 line", fine: "$200", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  SD: { front: "35% VLT", back: "20% VLT", rear: "20% VLT", windshield: "Non-reflective above AS-1 line", fine: "$100", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  TN: { front: "35% VLT", back: "35% VLT", rear: "35% VLT", windshield: "Non-reflective above AS-1 line", fine: "$100", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  TX: { front: "25% VLT", back: "25% VLT", rear: "Any darkness", windshield: "25% VLT above AS-1 line", fine: "$250", exemption: true, duration: "Per physician recommendation", dmv: "Not required" },
  UT: { front: "43% VLT", back: "Any darkness", rear: "Any darkness", windshield: "Non-reflective above AS-1 line", fine: "$120", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  VT: { front: "No tint allowed", back: "Any darkness", rear: "Any darkness", windshield: "No tint allowed", fine: "$162", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  VA: { front: "50% VLT", back: "35% VLT", rear: "35% VLT", windshield: "Non-reflective above AS-1 line", fine: "$110", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  WA: { front: "24% VLT", back: "24% VLT", rear: "Any darkness", windshield: "Non-reflective above AS-1 line (6 inches)", fine: "$136", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  WV: { front: "35% VLT", back: "35% VLT", rear: "35% VLT", windshield: "Non-reflective above AS-1 line", fine: "$200", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  WI: { front: "50% VLT", back: "35% VLT", rear: "35% VLT", windshield: "Non-reflective above AS-1 line", fine: "$175", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  WY: { front: "28% VLT", back: "28% VLT", rear: "28% VLT", windshield: "Non-reflective above AS-1 line", fine: "$200", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
  DC: { front: "70% VLT", back: "50% VLT", rear: "Any darkness", windshield: "Non-reflective above AS-1 line", fine: "$150", exemption: true, duration: "Per physician recommendation", dmv: "Keep in vehicle" },
};

// Offered states + pricing — mirrors myeyerx.net/shop EXACTLY (the source of
// truth for which states we sell and the price). A state is offered IFF it has
// an entry here. originalPrice is a marketing strike-through anchor (price+100).
// States absent from this map are NOT offered (offered=false, price=0):
//   AL, AK, CO, CT, DE, HI, IA, KY, LA, ME, MA, MS, NE, NH, ND, SD, UT, VT.
const offeredPricing: Record<string, { price: number; originalPrice: number }> = {
  AZ: { price: 275, originalPrice: 375 },
  AR: { price: 225, originalPrice: 325 },
  CA: { price: 250, originalPrice: 350 },
  FL: { price: 250, originalPrice: 350 },
  GA: { price: 250, originalPrice: 350 },
  ID: { price: 225, originalPrice: 325 },
  IL: { price: 225, originalPrice: 325 },
  IN: { price: 250, originalPrice: 350 },
  KS: { price: 250, originalPrice: 350 },
  MD: { price: 250, originalPrice: 350 },
  MI: { price: 225, originalPrice: 325 },
  MN: { price: 225, originalPrice: 325 },
  MO: { price: 250, originalPrice: 350 },
  MT: { price: 250, originalPrice: 350 },
  NV: { price: 250, originalPrice: 350 },
  NJ: { price: 250, originalPrice: 350 },
  NM: { price: 225, originalPrice: 325 },
  NY: { price: 350, originalPrice: 450 },
  NC: { price: 250, originalPrice: 350 },
  OH: { price: 250, originalPrice: 350 },
  OK: { price: 250, originalPrice: 350 },
  OR: { price: 225, originalPrice: 325 },
  PA: { price: 250, originalPrice: 350 },
  RI: { price: 250, originalPrice: 350 },
  SC: { price: 225, originalPrice: 325 },
  TN: { price: 250, originalPrice: 350 },
  TX: { price: 225, originalPrice: 325 },
  VA: { price: 250, originalPrice: 350 },
  WA: { price: 225, originalPrice: 325 },
  WV: { price: 250, originalPrice: 350 },
  WI: { price: 225, originalPrice: 325 },
  WY: { price: 250, originalPrice: 350 },
  DC: { price: 250, originalPrice: 350 },
};

// Generate stub entries for remaining states

const allStatesBase: { name: string; abbreviation: string; slug: string; offered: boolean; nearbyStates: { name: string; abbreviation: string; slug: string }[] }[] = [
  { name: "Alabama", abbreviation: "AL", slug: "alabama", offered: true, nearbyStates: [{ name: "Florida", abbreviation: "FL", slug: "florida" }, { name: "Georgia", abbreviation: "GA", slug: "georgia" }, { name: "Tennessee", abbreviation: "TN", slug: "tennessee" }, { name: "Mississippi", abbreviation: "MS", slug: "mississippi" }] },
  { name: "Alaska", abbreviation: "AK", slug: "alaska", offered: true, nearbyStates: [] },
  { name: "Arizona", abbreviation: "AZ", slug: "arizona", offered: true, nearbyStates: [{ name: "California", abbreviation: "CA", slug: "california" }, { name: "Nevada", abbreviation: "NV", slug: "nevada" }, { name: "New Mexico", abbreviation: "NM", slug: "new-mexico" }, { name: "Utah", abbreviation: "UT", slug: "utah" }] },
  { name: "Arkansas", abbreviation: "AR", slug: "arkansas", offered: true, nearbyStates: [{ name: "Texas", abbreviation: "TX", slug: "texas" }, { name: "Oklahoma", abbreviation: "OK", slug: "oklahoma" }, { name: "Missouri", abbreviation: "MO", slug: "missouri" }, { name: "Tennessee", abbreviation: "TN", slug: "tennessee" }] },
  { name: "Colorado", abbreviation: "CO", slug: "colorado", offered: true, nearbyStates: [{ name: "Kansas", abbreviation: "KS", slug: "kansas" }, { name: "Nebraska", abbreviation: "NE", slug: "nebraska" }, { name: "Wyoming", abbreviation: "WY", slug: "wyoming" }, { name: "New Mexico", abbreviation: "NM", slug: "new-mexico" }] },
  { name: "Connecticut", abbreviation: "CT", slug: "connecticut", offered: true, nearbyStates: [{ name: "New York", abbreviation: "NY", slug: "new-york" }, { name: "Massachusetts", abbreviation: "MA", slug: "massachusetts" }, { name: "Rhode Island", abbreviation: "RI", slug: "rhode-island" }] },
  { name: "Delaware", abbreviation: "DE", slug: "delaware", offered: true, nearbyStates: [{ name: "Pennsylvania", abbreviation: "PA", slug: "pennsylvania" }, { name: "Maryland", abbreviation: "MD", slug: "maryland" }, { name: "New Jersey", abbreviation: "NJ", slug: "new-jersey" }] },
  { name: "Georgia", abbreviation: "GA", slug: "georgia", offered: true, nearbyStates: [{ name: "Florida", abbreviation: "FL", slug: "florida" }, { name: "Alabama", abbreviation: "AL", slug: "alabama" }, { name: "South Carolina", abbreviation: "SC", slug: "south-carolina" }, { name: "Tennessee", abbreviation: "TN", slug: "tennessee" }] },
  { name: "Hawaii", abbreviation: "HI", slug: "hawaii", offered: true, nearbyStates: [] },
  { name: "Idaho", abbreviation: "ID", slug: "idaho", offered: true, nearbyStates: [{ name: "Washington", abbreviation: "WA", slug: "washington" }, { name: "Oregon", abbreviation: "OR", slug: "oregon" }, { name: "Montana", abbreviation: "MT", slug: "montana" }, { name: "Utah", abbreviation: "UT", slug: "utah" }] },
  { name: "Illinois", abbreviation: "IL", slug: "illinois", offered: true, nearbyStates: [{ name: "Indiana", abbreviation: "IN", slug: "indiana" }, { name: "Iowa", abbreviation: "IA", slug: "iowa" }, { name: "Missouri", abbreviation: "MO", slug: "missouri" }, { name: "Wisconsin", abbreviation: "WI", slug: "wisconsin" }] },
  { name: "Indiana", abbreviation: "IN", slug: "indiana", offered: true, nearbyStates: [{ name: "Ohio", abbreviation: "OH", slug: "ohio" }, { name: "Illinois", abbreviation: "IL", slug: "illinois" }, { name: "Michigan", abbreviation: "MI", slug: "michigan" }, { name: "Kentucky", abbreviation: "KY", slug: "kentucky" }] },
  { name: "Iowa", abbreviation: "IA", slug: "iowa", offered: true, nearbyStates: [{ name: "Illinois", abbreviation: "IL", slug: "illinois" }, { name: "Minnesota", abbreviation: "MN", slug: "minnesota" }, { name: "Missouri", abbreviation: "MO", slug: "missouri" }, { name: "Nebraska", abbreviation: "NE", slug: "nebraska" }] },
  { name: "Kansas", abbreviation: "KS", slug: "kansas", offered: true, nearbyStates: [{ name: "Missouri", abbreviation: "MO", slug: "missouri" }, { name: "Oklahoma", abbreviation: "OK", slug: "oklahoma" }, { name: "Colorado", abbreviation: "CO", slug: "colorado" }, { name: "Nebraska", abbreviation: "NE", slug: "nebraska" }] },
  { name: "Kentucky", abbreviation: "KY", slug: "kentucky", offered: true, nearbyStates: [{ name: "Ohio", abbreviation: "OH", slug: "ohio" }, { name: "Indiana", abbreviation: "IN", slug: "indiana" }, { name: "Tennessee", abbreviation: "TN", slug: "tennessee" }, { name: "West Virginia", abbreviation: "WV", slug: "west-virginia" }] },
  { name: "Louisiana", abbreviation: "LA", slug: "louisiana", offered: true, nearbyStates: [{ name: "Texas", abbreviation: "TX", slug: "texas" }, { name: "Mississippi", abbreviation: "MS", slug: "mississippi" }, { name: "Arkansas", abbreviation: "AR", slug: "arkansas" }] },
  { name: "Maine", abbreviation: "ME", slug: "maine", offered: true, nearbyStates: [{ name: "New Hampshire", abbreviation: "NH", slug: "new-hampshire" }, { name: "Massachusetts", abbreviation: "MA", slug: "massachusetts" }] },
  { name: "Maryland", abbreviation: "MD", slug: "maryland", offered: true, nearbyStates: [{ name: "Virginia", abbreviation: "VA", slug: "virginia" }, { name: "Pennsylvania", abbreviation: "PA", slug: "pennsylvania" }, { name: "Delaware", abbreviation: "DE", slug: "delaware" }, { name: "West Virginia", abbreviation: "WV", slug: "west-virginia" }] },
  { name: "Massachusetts", abbreviation: "MA", slug: "massachusetts", offered: true, nearbyStates: [{ name: "Connecticut", abbreviation: "CT", slug: "connecticut" }, { name: "New York", abbreviation: "NY", slug: "new-york" }, { name: "Rhode Island", abbreviation: "RI", slug: "rhode-island" }, { name: "New Hampshire", abbreviation: "NH", slug: "new-hampshire" }] },
  { name: "Michigan", abbreviation: "MI", slug: "michigan", offered: true, nearbyStates: [{ name: "Ohio", abbreviation: "OH", slug: "ohio" }, { name: "Indiana", abbreviation: "IN", slug: "indiana" }, { name: "Wisconsin", abbreviation: "WI", slug: "wisconsin" }] },
  { name: "Minnesota", abbreviation: "MN", slug: "minnesota", offered: true, nearbyStates: [{ name: "Wisconsin", abbreviation: "WI", slug: "wisconsin" }, { name: "Iowa", abbreviation: "IA", slug: "iowa" }, { name: "North Dakota", abbreviation: "ND", slug: "north-dakota" }, { name: "South Dakota", abbreviation: "SD", slug: "south-dakota" }] },
  { name: "Mississippi", abbreviation: "MS", slug: "mississippi", offered: true, nearbyStates: [{ name: "Alabama", abbreviation: "AL", slug: "alabama" }, { name: "Louisiana", abbreviation: "LA", slug: "louisiana" }, { name: "Tennessee", abbreviation: "TN", slug: "tennessee" }, { name: "Arkansas", abbreviation: "AR", slug: "arkansas" }] },
  { name: "Missouri", abbreviation: "MO", slug: "missouri", offered: true, nearbyStates: [{ name: "Illinois", abbreviation: "IL", slug: "illinois" }, { name: "Kansas", abbreviation: "KS", slug: "kansas" }, { name: "Iowa", abbreviation: "IA", slug: "iowa" }, { name: "Arkansas", abbreviation: "AR", slug: "arkansas" }] },
  { name: "Montana", abbreviation: "MT", slug: "montana", offered: true, nearbyStates: [{ name: "Idaho", abbreviation: "ID", slug: "idaho" }, { name: "Wyoming", abbreviation: "WY", slug: "wyoming" }, { name: "North Dakota", abbreviation: "ND", slug: "north-dakota" }, { name: "South Dakota", abbreviation: "SD", slug: "south-dakota" }] },
  { name: "Nebraska", abbreviation: "NE", slug: "nebraska", offered: true, nearbyStates: [{ name: "Iowa", abbreviation: "IA", slug: "iowa" }, { name: "Kansas", abbreviation: "KS", slug: "kansas" }, { name: "Colorado", abbreviation: "CO", slug: "colorado" }, { name: "South Dakota", abbreviation: "SD", slug: "south-dakota" }] },
  { name: "Nevada", abbreviation: "NV", slug: "nevada", offered: true, nearbyStates: [{ name: "California", abbreviation: "CA", slug: "california" }, { name: "Arizona", abbreviation: "AZ", slug: "arizona" }, { name: "Utah", abbreviation: "UT", slug: "utah" }, { name: "Oregon", abbreviation: "OR", slug: "oregon" }] },
  { name: "New Hampshire", abbreviation: "NH", slug: "new-hampshire", offered: true, nearbyStates: [{ name: "Massachusetts", abbreviation: "MA", slug: "massachusetts" }, { name: "Maine", abbreviation: "ME", slug: "maine" }, { name: "Vermont", abbreviation: "VT", slug: "vermont" }] },
  { name: "New Jersey", abbreviation: "NJ", slug: "new-jersey", offered: true, nearbyStates: [{ name: "New York", abbreviation: "NY", slug: "new-york" }, { name: "Pennsylvania", abbreviation: "PA", slug: "pennsylvania" }, { name: "Delaware", abbreviation: "DE", slug: "delaware" }] },
  { name: "New Mexico", abbreviation: "NM", slug: "new-mexico", offered: true, nearbyStates: [{ name: "Texas", abbreviation: "TX", slug: "texas" }, { name: "Arizona", abbreviation: "AZ", slug: "arizona" }, { name: "Colorado", abbreviation: "CO", slug: "colorado" }, { name: "Oklahoma", abbreviation: "OK", slug: "oklahoma" }] },
  { name: "New York", abbreviation: "NY", slug: "new-york", offered: true, nearbyStates: [{ name: "New Jersey", abbreviation: "NJ", slug: "new-jersey" }, { name: "Connecticut", abbreviation: "CT", slug: "connecticut" }, { name: "Pennsylvania", abbreviation: "PA", slug: "pennsylvania" }, { name: "Massachusetts", abbreviation: "MA", slug: "massachusetts" }] },
  { name: "North Carolina", abbreviation: "NC", slug: "north-carolina", offered: true, nearbyStates: [{ name: "South Carolina", abbreviation: "SC", slug: "south-carolina" }, { name: "Virginia", abbreviation: "VA", slug: "virginia" }, { name: "Tennessee", abbreviation: "TN", slug: "tennessee" }, { name: "Georgia", abbreviation: "GA", slug: "georgia" }] },
  { name: "North Dakota", abbreviation: "ND", slug: "north-dakota", offered: true, nearbyStates: [{ name: "South Dakota", abbreviation: "SD", slug: "south-dakota" }, { name: "Montana", abbreviation: "MT", slug: "montana" }, { name: "Minnesota", abbreviation: "MN", slug: "minnesota" }] },
  { name: "Oklahoma", abbreviation: "OK", slug: "oklahoma", offered: true, nearbyStates: [{ name: "Texas", abbreviation: "TX", slug: "texas" }, { name: "Kansas", abbreviation: "KS", slug: "kansas" }, { name: "Arkansas", abbreviation: "AR", slug: "arkansas" }, { name: "Missouri", abbreviation: "MO", slug: "missouri" }] },
  { name: "Oregon", abbreviation: "OR", slug: "oregon", offered: true, nearbyStates: [{ name: "Washington", abbreviation: "WA", slug: "washington" }, { name: "California", abbreviation: "CA", slug: "california" }, { name: "Idaho", abbreviation: "ID", slug: "idaho" }, { name: "Nevada", abbreviation: "NV", slug: "nevada" }] },
  { name: "Pennsylvania", abbreviation: "PA", slug: "pennsylvania", offered: true, nearbyStates: [{ name: "New York", abbreviation: "NY", slug: "new-york" }, { name: "New Jersey", abbreviation: "NJ", slug: "new-jersey" }, { name: "Ohio", abbreviation: "OH", slug: "ohio" }, { name: "West Virginia", abbreviation: "WV", slug: "west-virginia" }] },
  { name: "Rhode Island", abbreviation: "RI", slug: "rhode-island", offered: true, nearbyStates: [{ name: "Massachusetts", abbreviation: "MA", slug: "massachusetts" }, { name: "Connecticut", abbreviation: "CT", slug: "connecticut" }] },
  { name: "South Carolina", abbreviation: "SC", slug: "south-carolina", offered: true, nearbyStates: [{ name: "North Carolina", abbreviation: "NC", slug: "north-carolina" }, { name: "Georgia", abbreviation: "GA", slug: "georgia" }] },
  { name: "South Dakota", abbreviation: "SD", slug: "south-dakota", offered: true, nearbyStates: [{ name: "North Dakota", abbreviation: "ND", slug: "north-dakota" }, { name: "Nebraska", abbreviation: "NE", slug: "nebraska" }, { name: "Minnesota", abbreviation: "MN", slug: "minnesota" }, { name: "Montana", abbreviation: "MT", slug: "montana" }] },
  { name: "Tennessee", abbreviation: "TN", slug: "tennessee", offered: true, nearbyStates: [{ name: "Kentucky", abbreviation: "KY", slug: "kentucky" }, { name: "Georgia", abbreviation: "GA", slug: "georgia" }, { name: "Alabama", abbreviation: "AL", slug: "alabama" }, { name: "North Carolina", abbreviation: "NC", slug: "north-carolina" }] },
  { name: "Utah", abbreviation: "UT", slug: "utah", offered: true, nearbyStates: [{ name: "Colorado", abbreviation: "CO", slug: "colorado" }, { name: "Nevada", abbreviation: "NV", slug: "nevada" }, { name: "Arizona", abbreviation: "AZ", slug: "arizona" }, { name: "Idaho", abbreviation: "ID", slug: "idaho" }] },
  { name: "Vermont", abbreviation: "VT", slug: "vermont", offered: true, nearbyStates: [{ name: "New Hampshire", abbreviation: "NH", slug: "new-hampshire" }, { name: "Massachusetts", abbreviation: "MA", slug: "massachusetts" }, { name: "New York", abbreviation: "NY", slug: "new-york" }] },
  { name: "Virginia", abbreviation: "VA", slug: "virginia", offered: true, nearbyStates: [{ name: "Maryland", abbreviation: "MD", slug: "maryland" }, { name: "North Carolina", abbreviation: "NC", slug: "north-carolina" }, { name: "West Virginia", abbreviation: "WV", slug: "west-virginia" }, { name: "Kentucky", abbreviation: "KY", slug: "kentucky" }] },
  { name: "Washington", abbreviation: "WA", slug: "washington", offered: true, nearbyStates: [{ name: "Oregon", abbreviation: "OR", slug: "oregon" }, { name: "Idaho", abbreviation: "ID", slug: "idaho" }] },
  { name: "West Virginia", abbreviation: "WV", slug: "west-virginia", offered: true, nearbyStates: [{ name: "Ohio", abbreviation: "OH", slug: "ohio" }, { name: "Virginia", abbreviation: "VA", slug: "virginia" }, { name: "Pennsylvania", abbreviation: "PA", slug: "pennsylvania" }, { name: "Kentucky", abbreviation: "KY", slug: "kentucky" }] },
  { name: "Wisconsin", abbreviation: "WI", slug: "wisconsin", offered: true, nearbyStates: [{ name: "Minnesota", abbreviation: "MN", slug: "minnesota" }, { name: "Michigan", abbreviation: "MI", slug: "michigan" }, { name: "Illinois", abbreviation: "IL", slug: "illinois" }, { name: "Iowa", abbreviation: "IA", slug: "iowa" }] },
  { name: "Wyoming", abbreviation: "WY", slug: "wyoming", offered: true, nearbyStates: [{ name: "Montana", abbreviation: "MT", slug: "montana" }, { name: "Colorado", abbreviation: "CO", slug: "colorado" }, { name: "Idaho", abbreviation: "ID", slug: "idaho" }, { name: "Utah", abbreviation: "UT", slug: "utah" }] },
  { name: "Washington DC", abbreviation: "DC", slug: "washington-dc", offered: true, nearbyStates: [{ name: "Virginia", abbreviation: "VA", slug: "virginia" }, { name: "Maryland", abbreviation: "MD", slug: "maryland" }] },
];

function generateDefaultState(base: typeof allStatesBase[0]): StateData {
  const td = tintData[base.abbreviation];
  const allowsExemption = td ? td.exemption : true;
  // offered + pricing mirror myeyerx.net exactly (the source of truth).
  const pricing = offeredPricing[base.abbreviation];
  const isOffered = !!pricing;
  const price = pricing ? pricing.price : 0;
  const originalPrice = pricing ? pricing.originalPrice : 0;

  return {
    ...base,
    offered: isOffered,
    allowsMedicalExemption: allowsExemption,
    price,
    originalPrice,
    heroTitle: stateHeroTitle(base.name),
    heroDescription: stateHeroDescription(base.name),
    tintLaws: {
      frontWindshield: td ? td.windshield : "Non-reflective above AS-1 line",
      frontSideWindows: td ? td.front : "Check state law",
      backSideWindows: td ? td.back : "Check state law",
      rearWindow: td ? td.rear : "Check state law",
    },
    ticketFine: td ? td.fine : "Varies by state",
    dmvFiling: td ? td.dmv : "Check state requirements",
    exemptionDuration: td ? td.duration : "Per physician recommendation",
    qualifyingConditions: allowsExemption ? buildRelevantConditions() : [],
    understandingSection: stateOverview(base.name),
    whatIsExemption: stateExemptionExplanation(base.name, allowsExemption),
    tintLawsDescription: td
      ? `This site's 2026 summary lists ${td.front} for front side windows, ${td.back} for back side windows, ${td.rear} for the rear window, and ${td.windshield.toLowerCase()} for the windshield in ${base.name}. It lists a possible fine of ${td.fine}. These values are educational and may be incomplete, outdated, vehicle-specific, or affected by later legal changes. Verify every value and any medical exception directly with the responsible state agency before relying on it.`
      : `Window-tint rules can differ by window, vehicle, material, and later legal changes. Verify ${base.name}'s current VLT and medical-documentation requirements directly with the responsible state agency before relying on this summary.`,
    howToSteps: buildStateSteps(base.name, allowsExemption),
    pulledOverAdvice: enforcementGuidance(base.name),
    commonMistakes: buildStateCommonMistakes(base.name),
    faq: buildStateFaq(base.name, price, isOffered, allowsExemption),
  };
}

// Populate remaining states with default content
for (const base of allStatesBase) {
  if (!states[base.slug]) {
    states[base.slug] = generateDefaultState(base);
  }
}

export function getStateBySlug(slug: string): StateData | undefined {
  return states[slug];
}

export function getAllStateSlugs(): string[] {
  return Object.keys(states);
}

export function getAllStates(): StateData[] {
  return Object.values(states).sort((a, b) => a.name.localeCompare(b.name));
}

export function getOfferedStates(): StateData[] {
  return getAllStates().filter((s) => s.offered);
}
