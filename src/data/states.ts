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

export const states: Record<string, StateData> = {
  ohio: {
    name: "Ohio",
    abbreviation: "OH",
    slug: "ohio",
    offered: true,
    allowsMedicalExemption: true,
    price: 350,
    originalPrice: 450,
    heroTitle: "Secure Your Medical Tint Exemption in Ohio Today",
    heroDescription: "If you suffer from light sensitivity, navigating Ohio's roads can be a challenge. Learn how to obtain a medical exemption for your vehicle's window tinting needs.",
    tintLaws: {
      frontWindshield: "Non-reflective above AS-1 line",
      frontSideWindows: "50% VLT",
      backSideWindows: "Any darkness",
      rearWindow: "Any darkness",
    },
    ticketFine: "$120",
    dmvFiling: "Not Required",
    exemptionDuration: "Per physician recommendation",
    qualifyingConditions: [
      { name: "Lupus", description: "Lupus is an autoimmune disease that can cause severe skin sensitivity to sunlight. For individuals with lupus, exposure to bright light can trigger painful rashes and systemic flare-ups. Therefore, having darker window tints can significantly alleviate discomfort while driving." },
      { name: "Photosensitivity", description: "Photosensitivity refers to an increased sensitivity to light, which can cause adverse reactions such as rashes, headaches, or even seizures. Those suffering from photosensitivity benefit greatly from darker tints that minimize light exposure during travel." },
      { name: "Albinism", description: "Individuals with albinism often have little to no melanin in their skin, hair, and eyes, making them extremely sensitive to bright lights. They are at a higher risk of sunburn and vision problems, which makes darker window tints essential for safe driving." },
      { name: "Eye Conditions", description: "Certain eye conditions, such as cataracts or macular degeneration, can lead to heightened sensitivity to light. Individuals with these conditions can find relief through the use of tinted windows, which help reduce glare and enhance visual comfort." },
      { name: "Skin Conditions", description: "Skin conditions like polymorphic light eruption can cause painful rashes upon exposure to sunlight. For individuals with these skin conditions, obtaining a medical window tint exemption is crucial to ensure safe driving without triggering their symptoms." },
    ],
    understandingSection: "In Ohio, window tint exemptions are crucial for residents suffering from medical conditions that amplify light sensitivity. Ohio's diverse climate, with its sunny summers and stark winters, can exacerbate symptoms for individuals with conditions like lupus or albinism. The discomfort and potential health risks of exposure to bright sunlight can make driving a daunting task for these individuals. Ohio's window tint laws aim to balance safety and aesthetics, but they can pose a significant challenge for those with light sensitivity. The state's regulations permit certain levels of tinting, but for those who need more protection, obtaining a medical exemption is essential. By securing this exemption, individuals can ensure a safer driving experience, reducing glare and discomfort while navigating the roads. This page will guide you through the legal framework, the exemption process, and why it's vital for Ohio residents to pursue these exemptions.",
    whatIsExemption: "A medical window tint exemption in Ohio allows individuals with specific medical conditions to have darker window tints than what is typically permitted by state law. Under Ohio law, the standard tint restrictions include a non-reflective front windshield above the AS-1 line, a maximum of 50% VLT on front side windows, and no restrictions on back side and rear windows. However, for those with qualifying medical conditions, these limits can be relaxed. To obtain an exemption, individuals must fill out a medical exemption form and have it signed by a licensed physician affirming their need for enhanced protection from sunlight. This exemption not only helps in creating a more comfortable driving environment but also protects individuals from receiving tickets related to non-compliance with standard tint laws.",
    tintLawsDescription: "Ohio's window tint laws are designed to ensure safety while allowing some degree of personal preference. In 2026, these laws stipulate specific limits on the amount of visible light transmitted through vehicle windows, aiming to enhance visibility for drivers and passengers alike.\n\nThe legal limits for tint in Ohio are as follows: front side windows must allow at least 50% of light (VLT), while back side and rear windows have no restrictions. VLT stands for Visible Light Transmission, which measures how much light passes through the window. This percentage is crucial, as too dark a tint can impair visibility and create safety hazards. Enforcement of these laws is primarily the responsibility of law enforcement officers who may issue citations for violations. Drivers found in violation may face fines, typically around $120, if they do not have an exemption.",
    howToSteps: [
      { title: "Consult Your Physician", description: "The first step in obtaining a medical exemption is to consult with your physician. It's essential to discuss your condition and how light sensitivity affects your daily life, especially when driving. Your physician will need to complete and sign the medical exemption form, providing documentation that supports your need for darker window tints." },
      { title: "Complete the Medical Exemption Form", description: "Once your physician has evaluated your condition, you'll need to fill out the official medical exemption form. Ensure that all sections are completed accurately, including personal information and the specific medical condition that qualifies you for the exemption." },
      { title: "Submit Your Application", description: "After completing the form, retain a copy for your records and keep the original signed copy in your vehicle. Although you do not need to file this form with the DMV, it is advisable to carry it whenever you are driving, as it serves as proof of your exemption." },
      { title: "After Your Approval", description: "Once approved, the medical exemption allows you to legally tint your vehicle windows darker than the standard limits set by Ohio law. It's important to keep the signed exemption form in your car at all times, as this serves as your protection if you are stopped by law enforcement. The exemption does not require you to register it with the DMV, but having it accessible can help clarify any misunderstandings during a traffic stop." },
    ],
    pulledOverAdvice: "Being pulled over for window tint violations can be a stressful experience, especially if you have a medical exemption. If you find yourself in this situation, remain calm and respectful. When the officer approaches, inform them that you have a medical exemption for your window tint. Present the signed exemption form promptly. This document is crucial as it confirms your legal right to have darker tints due to medical conditions. Be prepared to explain your condition briefly, as this information can help the officer understand your situation. Know your rights as a driver in Ohio; you are not obligated to answer questions beyond basic identification. If the officer does not recognize your exemption, remain polite, and request to speak to a supervisor if necessary. It's important to keep a copy of your exemption form in your vehicle, as this can often resolve misunderstandings on the spot.",
    commonMistakes: [
      { title: "Not Consulting with a Qualified Physician", description: "One common mistake is failing to consult a qualified physician who understands your condition. It's essential that your physician is able to provide a proper diagnosis and complete the exemption form accurately." },
      { title: "Incomplete Form Submission", description: "Submitting an incomplete medical exemption form can delay the process. Make sure all sections are filled in, and all necessary signatures are included before submitting." },
      { title: "Neglecting to Keep Documentation in Vehicle", description: "After receiving your exemption, some individuals forget to keep a copy of it in their vehicle. It's crucial to have this documentation on hand to avoid fines during traffic stops." },
      { title: "Ignoring the Legal Limits of Tint", description: "Even with an exemption, be aware that there are still legal limits on how dark your tint can be. Make sure your vehicle complies with these regulations to avoid additional penalties." },
      { title: "Failing to Understand the Renewal Process", description: "Some individuals may not realize that medical exemptions can expire. Always check if your exemption needs renewal and understand the process to maintain compliance." },
    ],
    faq: [
      { question: "How do I know if I qualify for a medical window tint exemption?", answer: "To determine if you qualify for a medical window tint exemption in Ohio, you need to have a medical condition that causes light sensitivity. Common qualifying conditions include lupus, photosensitivity, albinism, certain eye conditions, and skin conditions. Consult your physician to discuss your symptoms and obtain the necessary documentation." },
      { question: "Is there a fee for the medical exemption process in Ohio?", answer: "There is no official fee for obtaining a medical window tint exemption in Ohio. However, you may incur costs from your physician for the consultation and completion of the exemption form. It's best to check with your doctor's office regarding any associated costs." },
      { question: "Can I tint my windows darker than the standard limits with an exemption?", answer: "Yes, with a medical exemption, you are allowed to tint your windows darker than the standard limits set by Ohio law. However, it's important to ensure that your tinting complies with the specific requirements outlined in your exemption." },
      { question: "Do I need to carry the exemption form at all times?", answer: "Yes, it is recommended to carry your signed medical exemption form in your vehicle at all times. This will serve as proof of your legal right to have darker tints if you are pulled over by law enforcement." },
      { question: "What should I do if I receive a ticket for my window tint?", answer: "If you receive a ticket for your window tint, remain calm and present your medical exemption form to the officer. If the officer does not recognize your exemption, you may want to appeal the ticket by providing documentation and explaining your situation." },
      { question: "How long is the medical exemption valid?", answer: "The medical exemption does not have a set expiration date, but it's important to periodically review your status with your physician. If your condition changes or if required, you may need to renew the exemption." },
      { question: "Can I transfer my exemption to a different vehicle?", answer: "Yes, you can transfer your medical exemption to a different vehicle. However, you should ensure that the new vehicle complies with the tint regulations and carry your exemption documentation while driving." },
      { question: "What happens if my physician refuses to sign the exemption form?", answer: "If your physician refuses to sign the exemption form, it may be necessary to seek a second opinion or find a physician who understands your condition and the need for the exemption. You must have a qualifying medical professional complete the form for your application to be valid." },
    ],
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
    price: 300,
    originalPrice: 400,
    heroTitle: "Unlock Your Comfort with Texas Window Tint Exemptions",
    heroDescription: "If you suffer from light sensitivity, navigating Texas roads can be a challenge. Learn how to obtain a medical exemption for your vehicle's window tinting needs.",
    tintLaws: {
      frontWindshield: "25% VLT above AS-1 line",
      frontSideWindows: "25% VLT",
      backSideWindows: "25% VLT",
      rearWindow: "Any darkness",
    },
    ticketFine: "$250",
    dmvFiling: "Not Required",
    exemptionDuration: "Per physician recommendation",
    qualifyingConditions: [
      { name: "Lupus", description: "Lupus is an autoimmune disease that causes extreme sensitivity to sunlight and UV radiation. Having darker window tints can significantly reduce flare-ups while driving." },
      { name: "Melanoma", description: "History of skin cancer requiring minimized UV exposure to prevent recurrence. Darker tints provide essential protection during daily commutes." },
      { name: "Photosensitivity", description: "An increased sensitivity to light that can cause adverse reactions. Darker tints minimize light exposure during travel." },
      { name: "Albinism", description: "Individuals with albinism are extremely sensitive to bright lights and at higher risk of sunburn and vision problems." },
      { name: "Porphyria", description: "A group of disorders affecting the nervous system or skin, causing sensitivity to sunlight." },
      { name: "Eye Conditions", description: "Certain eye conditions such as cataracts or macular degeneration can lead to heightened sensitivity to light." },
    ],
    understandingSection: "In Texas, window tint exemptions are vital for residents dealing with medical conditions that amplify light sensitivity. The Lone Star State's intense sun and heat can make driving particularly challenging for those with conditions like lupus, melanoma, or photosensitivity. Texas window tint laws aim to balance safety with personal preference, but they can create difficulties for those who need more protection. Obtaining a medical exemption is essential for ensuring safer, more comfortable driving conditions.",
    whatIsExemption: "A medical window tint exemption in Texas allows individuals with qualifying medical conditions to have darker window tints than standard law permits. Texas law requires a signed statement from a licensed physician confirming the medical necessity. This statement must be kept in the vehicle at all times as proof of the exemption.",
    tintLawsDescription: "Texas window tint laws in 2026 set specific limits on visible light transmission. Front side windows must allow at least 25% VLT, and the windshield can have tint above the AS-1 line with 25% VLT. Back side windows also require 25% VLT, while the rear window has no restrictions. Violations can result in fines up to $250.",
    howToSteps: [
      { title: "Consult with Your Physician", description: "Discuss your condition and how light sensitivity affects your daily life, especially driving. Your physician will provide a signed statement confirming your medical need." },
      { title: "Keep the Exemption Statement in Your Vehicle", description: "Texas does not require DMV filing. Keep the signed physician statement in your vehicle at all times as proof of your medical exemption." },
      { title: "After Your Approval", description: "Once you have your physician's signed statement, you can legally tint your vehicle windows darker than standard limits. Always carry the statement when driving." },
    ],
    pulledOverAdvice: "If pulled over for window tint in Texas, remain calm and respectful. Inform the officer you have a medical exemption and present your physician's signed statement. This document confirms your legal right to darker tints. If the officer doesn't recognize it, politely request to speak with a supervisor.",
    commonMistakes: [
      { title: "Failing to Obtain a Proper Medical Statement", description: "Ensure your physician provides a properly signed statement that meets Texas requirements." },
      { title: "Not Keeping the Exemption Statement in the Vehicle", description: "Always keep your signed physician statement in the vehicle. Without it, you may receive a citation." },
      { title: "Choosing an Inexperienced Tint Installer", description: "Work with a professional installer who understands medical exemption tint levels." },
      { title: "Ignoring Legal Tint Limits", description: "Even with an exemption, understand what limits apply to your specific situation." },
      { title: "Not Understanding Your Rights", description: "Know your rights during traffic stops related to window tint." },
    ],
    faq: [
      { question: "How long does it take to get a medical exemption statement?", answer: "Most patients receive their statement within 24-48 hours of their consultation." },
      { question: "Is there a fee for getting a medical tint exemption?", answer: "There may be costs associated with the physician consultation. Our service is $249 for the complete process." },
      { question: "Can I tint my windows darker than allowed if I have an exemption?", answer: "Yes, with a valid medical exemption, you can have darker tints than standard Texas limits." },
      { question: "Do I need to renew my medical exemption statement?", answer: "This depends on your physician's recommendation. Some statements may need periodic renewal." },
      { question: "What should I do if I get a ticket despite having a medical exemption?", answer: "Present your medical exemption statement and appeal the ticket through the court system." },
      { question: "Can I transfer my exemption to another vehicle?", answer: "The exemption is tied to your medical condition, not a specific vehicle. Carry your statement in whichever vehicle you drive." },
      { question: "What happens if my exemption statement is lost?", answer: "Contact your physician to obtain a replacement statement as soon as possible." },
      { question: "Do I need to inform the DMV about my exemption?", answer: "No, Texas does not require DMV registration of medical tint exemptions." },
    ],
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
    price: 300,
    originalPrice: 400,
    heroTitle: "Secure Your Medical Window Tint Exemption in California",
    heroDescription: "If you suffer from light sensitivity, driving in California's sunny climate can be particularly challenging. Learn how to obtain a medical exemption for your vehicle's window tinting needs.",
    tintLaws: {
      frontWindshield: "70% VLT on top 4 inches",
      frontSideWindows: "70% VLT",
      backSideWindows: "Any darkness",
      rearWindow: "Any darkness",
    },
    ticketFine: "$250",
    dmvFiling: "Not Required",
    exemptionDuration: "Per physician recommendation",
    qualifyingConditions: [
      { name: "Lupus", description: "An autoimmune disease that causes extreme sensitivity to sunlight and UV radiation." },
      { name: "Melanoma", description: "History of skin cancer requiring minimized UV exposure to prevent recurrence." },
      { name: "Severe Photosensitivity", description: "Extreme sensitivity to light causing significant discomfort or medical reactions." },
      { name: "Xeroderma Pigmentosum", description: "A rare genetic disorder where the body cannot repair UV damage." },
      { name: "Porphyria", description: "A group of disorders causing sensitivity to sunlight." },
    ],
    understandingSection: "In California, window tint exemptions are crucial for residents with medical conditions that amplify light sensitivity. California's year-round sunshine can make driving particularly challenging for those with conditions like lupus or melanoma. The state's tint laws are among the strictest in the nation, making medical exemptions especially important for those who need additional protection.",
    whatIsExemption: "A medical window tint exemption in California allows individuals with qualifying conditions to apply tinting that would otherwise exceed legal limits. California requires a certificate signed by a licensed physician specifying the medical necessity for the exemption.",
    tintLawsDescription: "California has strict window tint laws. Front side windows must allow at least 70% VLT. The windshield can only have non-reflective tint on the top 4 inches. Back side and rear windows can be any darkness. Violations can result in fix-it tickets and fines up to $250.",
    howToSteps: [
      { title: "Visit a Licensed Physician", description: "Consult with a physician who can evaluate your condition and provide the necessary medical documentation." },
      { title: "Obtain a Medical Exemption Certificate", description: "Your physician will complete a medical exemption certificate detailing your condition and the need for darker tints." },
      { title: "Keep Your Certificate Ready", description: "Keep the signed certificate in your vehicle at all times as proof of your medical exemption." },
      { title: "After Your Approval", description: "With your certificate, you can legally have your windows tinted darker than standard limits. Always carry the certificate when driving." },
    ],
    pulledOverAdvice: "If pulled over in California for window tint, remain calm and inform the officer of your medical exemption. Present your physician's certificate promptly. California officers are generally familiar with medical exemptions, but having documentation ready is essential.",
    commonMistakes: [
      { title: "Failing to Consult the Right Physician", description: "Ensure your physician understands medical exemptions and can provide proper documentation." },
      { title: "Incorrectly Documenting Your Condition", description: "Make sure all medical documentation accurately reflects your condition." },
      { title: "Neglecting to Keep Your Certificate Accessible", description: "Always keep your exemption certificate in the vehicle." },
      { title: "Ignoring Renewal Requirements", description: "Check if your certificate needs periodic renewal." },
      { title: "Not Understanding Tint Regulations", description: "Even with an exemption, understand the specific limits that apply." },
    ],
    faq: [
      { question: "How can I qualify for a medical window tint exemption in California?", answer: "You need a medical condition that causes light sensitivity, documented by a licensed physician." },
      { question: "Do I need to file my medical exemption with the DMV?", answer: "No, California does not require DMV registration of medical tint exemptions." },
      { question: "What are the risks of driving without a medical exemption?", answer: "You may receive fix-it tickets and fines up to $250 for non-compliant tint without an exemption." },
      { question: "Can I appeal a ticket if I'm pulled over for my tint?", answer: "Yes, present your medical exemption certificate to appeal the citation." },
      { question: "How long does the exemption process take?", answer: "Most patients receive their certificate within 24-48 hours of consultation." },
      { question: "Is there a fee for obtaining a medical exemption certificate?", answer: "Our consultation fee is $249, which includes the physician evaluation and certificate." },
      { question: "What should I do if my medical condition changes?", answer: "Consult your physician to update your documentation as needed." },
      { question: "Are there limits to the darkness of tint I can have?", answer: "Your physician will specify appropriate tint levels based on your medical needs and state regulations." },
    ],
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
    price: 400,
    originalPrice: 500,
    heroTitle: "Get Your Medical Window Tint Exemption in Florida",
    heroDescription: "If you suffer from light sensitivity, Florida's intense sunshine can make driving especially difficult. Learn how to obtain a medical exemption for your vehicle's window tinting needs.",
    tintLaws: {
      frontWindshield: "Non-reflective above AS-1 line",
      frontSideWindows: "28% VLT",
      backSideWindows: "15% VLT",
      rearWindow: "15% VLT",
    },
    ticketFine: "$116",
    dmvFiling: "Required",
    exemptionDuration: "Per DMV approval",
    qualifyingConditions: [
      { name: "Lupus", description: "An autoimmune disease causing extreme sensitivity to sunlight and UV radiation." },
      { name: "Melanoma", description: "History of skin cancer requiring minimized UV exposure to prevent recurrence." },
      { name: "Photosensitivity", description: "Increased sensitivity to light causing adverse reactions." },
      { name: "Certain Skin Conditions", description: "Various dermatological conditions exacerbated by sunlight exposure." },
      { name: "Post-Transplant Patients", description: "Organ transplant recipients on immunosuppressive medications with increased sun sensitivity." },
    ],
    understandingSection: "In Florida, window tint exemptions are essential for residents dealing with medical conditions amplified by the state's intense sunshine. Florida's tropical climate means year-round UV exposure, making driving particularly challenging for those with light-sensitive conditions. The state offers a specific medical exemption process through the DMV.",
    whatIsExemption: "A medical window tint exemption in Florida allows individuals with qualifying conditions to have darker tints than standard law permits. Florida has a specific Sunscreening Medical Exemption form that must be completed by a physician and submitted to the DMV for approval.",
    tintLawsDescription: "Florida allows front side windows with at least 28% VLT and back side and rear windows with at least 15% VLT. The windshield can have non-reflective tint above the AS-1 line. Violations can result in fines of approximately $116.",
    howToSteps: [
      { title: "Obtain the Sunscreening Medical Exemption Form", description: "Get the official Florida medical exemption form from the DMV or download it online." },
      { title: "Complete the Form", description: "Have your physician complete and sign the form, documenting your medical condition and the need for darker tints." },
      { title: "Submit the Form to the DMV", description: "Submit the completed form to the Florida DMV for processing and approval." },
      { title: "Receive Your Exemption Sticker", description: "Upon approval, you'll receive an exemption sticker to display on your vehicle." },
      { title: "After Your Approval", description: "Display the exemption sticker and carry your documentation. The sticker serves as visual proof of your exemption during traffic stops." },
    ],
    pulledOverAdvice: "In Florida, your exemption sticker should be visible to officers. If pulled over, point out the sticker and present your medical documentation. Florida officers are familiar with the DMV exemption program.",
    commonMistakes: [
      { title: "Incomplete Application", description: "Ensure all sections of the Sunscreening Medical Exemption form are completed." },
      { title: "Not Following Up", description: "Follow up with the DMV to ensure your application is processed." },
      { title: "Failing to Display the Exemption Sticker", description: "Always display your DMV-issued exemption sticker on your vehicle." },
      { title: "Ignoring Expiry Dates", description: "Check if your exemption has an expiration date and renew as needed." },
      { title: "Neglecting to Carry Documentation", description: "Keep your medical documentation in the vehicle in addition to the sticker." },
    ],
    faq: [
      { question: "How long does it take to get a medical window tint exemption in Florida?", answer: "Processing time varies, but most applications are processed within a few weeks by the DMV." },
      { question: "Is there a fee for the medical exemption application?", answer: "There may be nominal DMV fees. Our physician consultation is $249." },
      { question: "Can I tint my front windshield with the exemption?", answer: "This depends on your specific medical needs and what your physician documents." },
      { question: "What happens if I get a ticket for window tint before my exemption is approved?", answer: "Present proof of your pending application to the court when contesting the ticket." },
      { question: "Can I transfer my exemption to a different vehicle?", answer: "Contact the Florida DMV about transferring your exemption to a new vehicle." },
      { question: "What should I do if my exemption sticker is lost or damaged?", answer: "Contact the Florida DMV to request a replacement sticker." },
      { question: "Do I need a doctor's note every time I apply for an exemption?", answer: "A new physician statement may be required for renewals." },
      { question: "Are there any limits to how dark I can tint my windows with an exemption?", answer: "Your physician will specify appropriate levels based on your medical needs." },
    ],
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

// Pricing tiers by state abbreviation
// Tier 1: High complexity, require state filing — higher price
// Tier 2: Easy telemedicine, doctor certificate only — $300
// Tier 3: Avoid / careful marketing — not offered through our service
// Unlisted states default to Tier 3 (yellow) unless exemption=false (red)
const stateTiers: Record<string, { tier: 1 | 2 | 3; price: number; originalPrice: number }> = {
  // Tier 1 Revenue States
  NY: { tier: 1, price: 450, originalPrice: 550 },
  AL: { tier: 1, price: 350, originalPrice: 450 },
  NJ: { tier: 1, price: 400, originalPrice: 500 },
  AZ: { tier: 1, price: 350, originalPrice: 450 },
  MD: { tier: 1, price: 350, originalPrice: 450 },
  SC: { tier: 1, price: 350, originalPrice: 450 },
  OH: { tier: 1, price: 350, originalPrice: 450 },
  PA: { tier: 1, price: 400, originalPrice: 500 },
  OK: { tier: 1, price: 400, originalPrice: 500 },
  MT: { tier: 1, price: 350, originalPrice: 450 },
  MS: { tier: 1, price: 400, originalPrice: 500 },
  LA: { tier: 1, price: 350, originalPrice: 450 },
  CT: { tier: 1, price: 350, originalPrice: 450 },
  TN: { tier: 1, price: 350, originalPrice: 450 },
  GA: { tier: 1, price: 400, originalPrice: 500 },
  IN: { tier: 1, price: 350, originalPrice: 450 },
  NV: { tier: 1, price: 350, originalPrice: 450 },
  VT: { tier: 1, price: 400, originalPrice: 500 },
  VA: { tier: 1, price: 350, originalPrice: 450 },
  WY: { tier: 1, price: 350, originalPrice: 450 },
  FL: { tier: 1, price: 400, originalPrice: 500 },
  NC: { tier: 1, price: 350, originalPrice: 450 },
  DE: { tier: 1, price: 350, originalPrice: 450 },
  // Tier 2 Easy Telemedicine States
  MI: { tier: 2, price: 300, originalPrice: 400 },
  TX: { tier: 2, price: 300, originalPrice: 400 },
  WA: { tier: 2, price: 300, originalPrice: 400 },
  OR: { tier: 2, price: 300, originalPrice: 400 },
  MN: { tier: 2, price: 300, originalPrice: 400 },
  AR: { tier: 2, price: 300, originalPrice: 400 },
  CA: { tier: 2, price: 300, originalPrice: 400 },
  NM: { tier: 2, price: 300, originalPrice: 400 },
  WI: { tier: 2, price: 300, originalPrice: 400 },
  IL: { tier: 2, price: 300, originalPrice: 400 },
  WV: { tier: 2, price: 300, originalPrice: 400 },
  // Tier 3 Avoid / Careful Marketing
  CO: { tier: 3, price: 0, originalPrice: 0 },
  HI: { tier: 3, price: 0, originalPrice: 0 },
  AK: { tier: 3, price: 0, originalPrice: 0 },
  KS: { tier: 3, price: 0, originalPrice: 0 },
  KY: { tier: 3, price: 0, originalPrice: 0 },
  ND: { tier: 3, price: 0, originalPrice: 0 },
  SD: { tier: 3, price: 0, originalPrice: 0 },
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
  const tier = stateTiers[base.abbreviation];
  // offered = true only for Tier 1 and Tier 2 states
  const isOffered = tier ? tier.tier <= 2 : false;
  const price = tier ? tier.price : 0;
  const originalPrice = tier ? tier.originalPrice : 0;

  return {
    ...base,
    offered: isOffered,
    allowsMedicalExemption: allowsExemption,
    price,
    originalPrice,
    heroTitle: allowsExemption
      ? `Get Your Medical Window Tint Exemption in ${base.name}`
      : `${base.name} Window Tint Laws — No Medical Exemption Available`,
    heroDescription: allowsExemption
      ? `If you suffer from light sensitivity, driving in ${base.name} can be challenging. Learn how to obtain a medical exemption for your vehicle's window tinting needs.`
      : `${base.name} does not currently offer a medical exemption for window tint. Learn about the state's tint laws and your options.`,
    tintLaws: {
      frontWindshield: td ? td.windshield : "Non-reflective above AS-1 line",
      frontSideWindows: td ? td.front : "Check state law",
      backSideWindows: td ? td.back : "Check state law",
      rearWindow: td ? td.rear : "Check state law",
    },
    ticketFine: td ? td.fine : "Varies by state",
    dmvFiling: td ? td.dmv : "Check state requirements",
    exemptionDuration: td ? td.duration : "Per physician recommendation",
    qualifyingConditions: allowsExemption ? [
      { name: "Lupus", description: "An autoimmune disease that causes extreme sensitivity to sunlight and UV radiation." },
      { name: "Photosensitivity", description: "Increased sensitivity to light causing adverse reactions such as rashes, headaches, or seizures." },
      { name: "Albinism", description: "A genetic condition causing lack of melanin, resulting in extreme sensitivity to sunlight." },
      { name: "Eye Conditions", description: "Conditions such as cataracts or macular degeneration that cause heightened light sensitivity." },
      { name: "Skin Conditions", description: "Dermatological conditions exacerbated by sunlight exposure." },
    ] : [],
    understandingSection: allowsExemption
      ? `In ${base.name}, window tint exemptions are available for residents with medical conditions that cause light sensitivity. Front side windows must allow at least ${td ? td.front : "the state-required VLT"} of light, while back windows require ${td ? td.back : "the state-required VLT"}. Violations can result in fines of ${td ? td.fine : "varying amounts"}. If you have a qualifying medical condition, obtaining an exemption allows you to legally have darker tints for safer, more comfortable driving.`
      : `${base.name} does not currently have a provision for medical window tint exemptions. Even with a doctor's note, the state does not allow darker tints beyond the standard legal limits. Front side windows must allow at least ${td ? td.front : "the required amount"} of light. Violations can result in fines of ${td ? td.fine : "varying amounts"}. If you live in ${base.name} and suffer from light sensitivity, consider other protective measures such as UV-blocking clear film, polarized sunglasses, or sun visors.`,
    whatIsExemption: allowsExemption
      ? `A medical window tint exemption in ${base.name} allows individuals with specific medical conditions to have darker window tints than what is typically permitted by state law. Standard limits require front side windows to allow at least ${td ? td.front : "a certain percentage"} of visible light. With a valid medical exemption from a licensed physician, these limits can be relaxed to accommodate your medical needs.`
      : `${base.name} does not offer medical window tint exemptions. The state's tint laws apply uniformly to all drivers regardless of medical conditions. Front side windows must allow ${td ? td.front : "the required amount"} of light, with no exceptions for medical needs.`,
    tintLawsDescription: td
      ? `${base.name}'s window tint laws in 2026 set specific limits on visible light transmission (VLT). Front side windows must allow at least ${td.front}, back side windows require ${td.back}, and the rear window requires ${td.rear}. The windshield allows ${td.windshield.toLowerCase()}. Violations can result in fines of ${td.fine}.${allowsExemption ? " With a valid medical exemption, you may be permitted darker tints on qualifying windows." : " No medical exemptions are available in this state."}`
      : `${base.name}'s window tint laws are designed to ensure safety while allowing some personal preference. Check your state's specific VLT requirements for each window.`,
    howToSteps: allowsExemption ? [
      { title: "Consult Your Physician", description: `Discuss your condition and how light sensitivity affects your daily life, especially when driving. Your physician will provide the necessary documentation for your ${base.name} medical exemption.` },
      { title: "Complete the Medical Exemption Form", description: "Fill out the required medical exemption paperwork with your physician's help. Ensure all sections are completed accurately with your diagnosis and recommended tint levels." },
      { title: "Submit Your Application", description: `Follow ${base.name}'s specific process for submitting the medical exemption.${td ? ` Filing requirement: ${td.dmv}.` : ""}` },
      { title: "After Your Approval", description: `Keep your exemption documentation in your vehicle at all times. This serves as your legal protection during traffic stops in ${base.name}.${td ? ` Your exemption is valid for: ${td.duration}.` : ""}` },
    ] : [
      { title: "Understand the Limitation", description: `${base.name} does not currently allow medical exemptions for window tint. No doctor's note or medical documentation will permit darker tints beyond standard legal limits.` },
      { title: "Explore Alternatives", description: "Consider UV-blocking clear window film (which doesn't reduce VLT), high-quality polarized sunglasses, or clip-on sun visors for your vehicle." },
      { title: "Check Neighboring States", description: "If you frequently drive in neighboring states that do allow medical exemptions, you may be able to obtain an exemption there, though it may not be honored in your home state." },
    ],
    pulledOverAdvice: allowsExemption
      ? `If pulled over for window tint in ${base.name}, remain calm and respectful. Inform the officer you have a medical exemption and present your documentation promptly. Know your rights and keep your exemption paperwork accessible at all times.`
      : `${base.name} does not offer medical tint exemptions. If pulled over for illegal tint, you may face a fine of ${td ? td.fine : "varying amounts"}. You cannot use a medical condition as a defense for illegal window tint in this state.`,
    commonMistakes: allowsExemption ? [
      { title: "Not Consulting with a Qualified Physician", description: "Ensure your physician can provide proper documentation for your medical exemption." },
      { title: "Incomplete Documentation", description: "Make sure all required paperwork is properly completed and signed." },
      { title: "Not Keeping Documentation in Vehicle", description: "Always carry your exemption documentation in your vehicle." },
      { title: "Ignoring Legal Limits", description: "Even with an exemption, understand the specific limits that apply in your state." },
      { title: "Forgetting About Renewals", description: `Check if your exemption needs periodic renewal.${td ? ` Duration: ${td.duration}.` : ""}` },
    ] : [
      { title: "Assuming a Doctor's Note Is Sufficient", description: `${base.name} does not honor medical exemptions for window tint, regardless of documentation.` },
      { title: "Applying Tint Based on Other States' Laws", description: "Each state has its own laws. An exemption from another state is not valid in a state that doesn't offer them." },
      { title: "Not Knowing Your State's Limits", description: `Front side windows must allow ${td ? td.front : "the required amount"} in ${base.name}. Violations carry fines of ${td ? td.fine : "varying amounts"}.` },
    ],
    faq: allowsExemption ? [
      { question: `How do I know if I qualify for a medical window tint exemption in ${base.name}?`, answer: `To qualify in ${base.name}, you need a medical condition that causes light sensitivity — such as lupus, photophobia, migraines, or skin cancer — documented by a licensed physician. Our service connects you with a physician who can evaluate your condition.` },
      { question: "Is there a fee for the medical exemption process?", answer: `Our consultation fee is $${price}, which includes the physician evaluation and signed exemption certificate. This is a one-time fee.` },
      { question: `What are the tint limits in ${base.name}?`, answer: `Without an exemption, front side windows must allow ${td ? td.front : "the state-required amount"}, back side windows require ${td ? td.back : "the state-required amount"}, and the rear window requires ${td ? td.rear : "the state-required amount"}.` },
      { question: "Do I need to carry the exemption at all times?", answer: `Yes. ${td ? `In ${base.name}: ${td.dmv}.` : "Always keep your medical exemption documentation in your vehicle."}` },
      { question: `What is the fine for illegal tint in ${base.name}?`, answer: `Fines for illegal window tint in ${base.name} are typically ${td ? td.fine : "varying amounts"}. A valid medical exemption protects you from these fines.` },
      { question: `How long is the medical exemption valid in ${base.name}?`, answer: `${td ? td.duration : "Duration varies. Check with your physician."}. You may need to renew it periodically.` },
      { question: "Can I transfer my exemption to a different vehicle?", answer: "In most cases, the exemption is tied to your medical condition, not a specific vehicle. Carry your documentation in whichever vehicle you drive." },
      { question: "What if my physician refuses to sign the exemption?", answer: "Our licensed physicians specialize in evaluating patients for medical tint exemptions. If you have a qualifying condition, we can help." },
    ] : [
      { question: `Does ${base.name} allow medical window tint exemptions?`, answer: `No. ${base.name} does not currently have a provision for medical window tint exemptions. The state's tint laws apply to all drivers regardless of medical conditions.` },
      { question: `What are the tint limits in ${base.name}?`, answer: `Front side windows must allow ${td ? td.front : "the required amount"}, back side windows require ${td ? td.back : "the required amount"}, and the rear window requires ${td ? td.rear : "the required amount"}.` },
      { question: `What is the fine for illegal tint in ${base.name}?`, answer: `Fines for illegal window tint in ${base.name} are ${td ? td.fine : "varying amounts"}.` },
      { question: "What alternatives do I have for light sensitivity?", answer: "Consider UV-blocking clear window film, high-quality polarized sunglasses, clip-on visors, or wearing a wide-brimmed hat while driving." },
      { question: "Can I use an exemption from another state?", answer: `No. An exemption from another state is generally not valid in ${base.name} since the state does not recognize medical tint exemptions.` },
    ],
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
