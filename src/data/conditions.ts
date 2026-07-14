export interface ConditionData {
  name: string;
  slug: string;
  shortDescription: string;
  heroTitle: string;
  heroDescription: string;
  understandingSection: string;
  drivingImpact: string;
  whyQualifies: string;
  howToGet: string;
  livingWith: string;
  doctorQuestions: { question: string; reason: string }[];
  faq: { question: string; answer: string }[];
  relatedConditions: { name: string; slug: string; description: string }[];
  metaTitle: string;
}

const conditionHero =
  "Learn how this condition or its symptoms may be considered during an independent medical review and why current state-specific rules still apply. Selecting a condition does not establish eligibility or approval.";
const drivingSafety =
  "Symptoms affect people differently. If symptoms interfere with safe driving, stop driving and consult an appropriate clinician. This educational website cannot assess driving fitness, prescribe tint, or determine a safe or legal tint level.";
const reviewRelevance =
  "Symptoms associated with this condition may be relevant to an independent provider's review, but the condition does not automatically qualify. Eligibility, acceptable documentation, and any agency result depend on current state rules and individual clinical review.";
const reviewProcess =
  "Gather a record that identifies you, the treating professional or facility, and the relevant condition, symptoms, treatment, or surgery. Complete the secure intake and follow current state instructions. An independent provider may approve, deny, or request more information; no documentation or agency result is guaranteed.";
const eligibilityAnswer =
  "This condition or its symptoms may be relevant, but it does not automatically qualify. Current state criteria and an independent provider's review determine the next step.";
const documentationAnswer =
  "Requirements vary. A useful initial record generally identifies you, the treating professional or facility, and the relevant condition, symptoms, treatment, or surgery. The reviewing provider may request more information.";
const tintLimitAnswer =
  "A website cannot recommend a tint level. Permitted windows and limits depend on current state law, any valid documentation, and safe installation; confirm them with the responsible agency and a qualified installer.";
const conditionSupport =
  "Discuss symptom management and driving safety with your established clinician. General comfort measures are not a substitute for individualized medical advice, and this website does not recommend treatment or decide whether a person should drive.";

function safeConditionFaq(conditionName: string): ConditionData["faq"] {
  return [
    {
      question: `Does ${conditionName} automatically qualify for a medical tint exemption?`,
      answer: eligibilityAnswer,
    },
    {
      question: `What documentation may help a ${conditionName} review?`,
      answer: documentationAnswer,
    },
    {
      question: `What tint level is allowed for ${conditionName}?`,
      answer: tintLimitAnswer,
    },
    {
      question: "How long does review take?",
      answer:
        "Timing varies with document completeness, provider availability, clinical review, and any separate agency process. No turnaround time is guaranteed.",
    },
    {
      question: "Will provider documentation be accepted by every state?",
      answer:
        "No result is guaranteed. State forms, professional requirements, permitted windows, filing, carrying, and renewal rules vary and should be confirmed with the responsible agency.",
    },
    {
      question: "What happens if the provider does not approve documentation?",
      answer:
        "The provider may deny the request or ask for more information. Refund requests are handled only under the published refund policy.",
    },
  ];
}

export const conditions: Record<string, ConditionData> = {
  migraines: {
    name: "Migraines",
    slug: "migraines",
    shortDescription: "A neurological condition causing severe headaches often triggered by bright light and sunlight.",
    heroTitle: "Finding Relief from Migraines: A Path to Window Tint Exemption",
    heroDescription: conditionHero,
    metaTitle: "Migraines and Window Tint Medical Exemption 2026",
    understandingSection: "Migraines are a neurological condition characterized by recurrent, severe headaches which can be debilitating. Often accompanied by symptoms such as light sensitivity (photophobia), nausea, and visual auras, migraines significantly impact daily life. For many individuals, exposure to bright light and sunlight can trigger or exacerbate these painful episodes. The sensitivity to light is rooted in how migraines affect the brain's processing of visual stimuli, leading to an overwhelming response to bright environments. This condition not only causes physical discomfort but can also hinder day-to-day activities, particularly driving. Individuals with migraines may find it challenging to navigate roads safely when exposed to harsh sunlight or glare, which can lead to hazardous situations. Therefore, protecting oneself from these triggers is essential, and understanding the medical basis for requiring window tinting in vehicles is crucial for those seeking relief.",
    drivingImpact: drivingSafety,
    whyQualifies: reviewRelevance,
    howToGet: reviewProcess,
    livingWith: conditionSupport,
    doctorQuestions: [
      { question: "What triggers your migraines?", reason: "To identify specific causes and tailor management plans." },
      { question: "How often do you experience migraines?", reason: "To assess the severity and frequency of the condition." },
      { question: "What symptoms accompany your migraines?", reason: "To understand the full impact on your daily life." },
      { question: "Have you tried any treatments?", reason: "To evaluate the effectiveness of previous management strategies." },
      { question: "Do you have a family history of migraines?", reason: "To consider genetic factors that may influence your condition." },
      { question: "How do migraines affect your daily activities?", reason: "To gauge how the condition impacts your quality of life." },
    ],
    faq: safeConditionFaq("Migraines"),
    relatedConditions: [
      { name: "Photophobia", slug: "photophobia", description: "Extreme sensitivity to light that causes discomfort or pain when exposed to bright light." },
    ],
  },
  lupus: {
    name: "Lupus (Systemic Lupus Erythematosus)",
    slug: "lupus",
    shortDescription: "An autoimmune disease that causes extreme sensitivity to sunlight and UV radiation.",
    heroTitle: "Navigating Life with Lupus: Securing Your Window Tint Exemption",
    heroDescription: conditionHero,
    metaTitle: "Lupus (Systemic Lupus Erythematosus) Window Tint Exemption 2026",
    understandingSection: "Lupus, or Systemic Lupus Erythematosus (SLE), is a chronic autoimmune disease where the immune system attacks healthy tissue. One of the most significant symptoms for many lupus patients is extreme photosensitivity — an abnormal reaction to sunlight that can trigger severe skin rashes, joint pain, fatigue, and systemic flare-ups. UV radiation from the sun can cause direct damage to skin cells in lupus patients, leading to the characteristic butterfly rash and other dermatological manifestations. This photosensitivity makes everyday activities like driving particularly challenging, as prolonged sun exposure through vehicle windows can trigger painful symptoms.",
    drivingImpact: drivingSafety,
    whyQualifies: reviewRelevance,
    howToGet: reviewProcess,
    livingWith: conditionSupport,
    doctorQuestions: [
      { question: "When were you diagnosed with lupus?", reason: "To establish the duration and progression of the condition." },
      { question: "How does sunlight affect your symptoms?", reason: "To document the specific photosensitivity reactions." },
      { question: "What treatments are you currently taking?", reason: "To understand the current management plan." },
      { question: "How often do you experience flare-ups?", reason: "To assess the frequency and severity of episodes." },
      { question: "Does driving in sunlight trigger your symptoms?", reason: "To directly connect the condition to driving safety." },
      { question: "What protective measures do you currently use?", reason: "To evaluate the need for additional protection like window tinting." },
    ],
    faq: safeConditionFaq("Lupus (Systemic Lupus Erythematosus)"),
    relatedConditions: [],
  },
  photophobia: {
    name: "Photophobia",
    slug: "photophobia",
    shortDescription: "Extreme sensitivity to light that causes discomfort or pain when exposed to bright light.",
    heroTitle: "Finding Relief from Light Sensitivity: Tint Exemptions for Photophobia",
    heroDescription: conditionHero,
    metaTitle: "Photophobia and Window Tint Medical Exemption 2026",
    understandingSection: "Photophobia is a condition characterized by extreme sensitivity to light, causing discomfort, pain, or an aversion to light exposure. It is not an eye disease itself but rather a symptom of various underlying conditions, including migraines, meningitis, corneal abrasions, and certain neurological disorders. For individuals with photophobia, even normal levels of light can cause significant discomfort, leading to squinting, eye pain, headaches, and in severe cases, nausea. The condition affects the trigeminal nerve pathways and can be exacerbated by bright sunlight, fluorescent lighting, and glare from reflective surfaces.",
    drivingImpact: drivingSafety,
    whyQualifies: reviewRelevance,
    howToGet: reviewProcess,
    livingWith: conditionSupport,
    doctorQuestions: [
      { question: "What level of light causes discomfort?", reason: "To assess the severity of your photophobia." },
      { question: "What underlying conditions are associated with your light sensitivity?", reason: "To identify the root cause." },
      { question: "How long have you experienced photophobia?", reason: "To understand the duration and progression." },
      { question: "What triggers your worst episodes?", reason: "To identify specific environmental factors." },
      { question: "How does light sensitivity affect your driving?", reason: "To document the impact on driving safety." },
      { question: "What protective measures have you tried?", reason: "To evaluate existing management strategies." },
    ],
    faq: safeConditionFaq("Photophobia"),
    relatedConditions: [
      { name: "Migraines", slug: "migraines", description: "A neurological condition causing severe headaches often triggered by bright light." },
    ],
  },
  astigmatism: {
    name: "Astigmatism",
    slug: "astigmatism",
    shortDescription: "A common vision condition caused by an irregularly shaped cornea or lens, which can cause sensitivity to bright lights and glare.",
    heroTitle: "Find Relief from Light Sensitivity with a Tint Exemption",
    heroDescription: conditionHero,
    metaTitle: "Astigmatism Window Tint Medical Exemption Guide 2026",
    understandingSection: "Astigmatism is a common vision condition caused by an irregularly shaped cornea or lens, which prevents light from focusing properly on the retina. This results in blurred or distorted vision at all distances and can cause significant sensitivity to bright lights and glare. For individuals with astigmatism, driving can be particularly challenging as sunlight and headlight glare create halos, starbursts, and visual distortions that impair safe driving.",
    drivingImpact: drivingSafety,
    whyQualifies: reviewRelevance,
    howToGet: reviewProcess,
    livingWith: conditionSupport,
    doctorQuestions: [
      { question: "How severe is your astigmatism?", reason: "To assess the degree of vision correction needed." },
      { question: "Do you experience glare sensitivity while driving?", reason: "To document driving-related visual issues." },
      { question: "What corrective measures are you currently using?", reason: "To evaluate existing management strategies." },
      { question: "How does bright light affect your vision?", reason: "To document light sensitivity severity." },
      { question: "Have you noticed worsening symptoms?", reason: "To track the progression of the condition." },
      { question: "Do you have difficulty driving during certain times of day?", reason: "To identify specific driving challenges." },
    ],
    faq: safeConditionFaq("Astigmatism"),
    relatedConditions: [
      { name: "Photophobia", slug: "photophobia", description: "Extreme sensitivity to light that causes discomfort or pain when exposed to bright light." },
    ],
  },
  "lasik-surgery": {
    name: "LASIK/Refractive Surgery",
    slug: "lasik-surgery",
    shortDescription: "Post-surgical light sensitivity following LASIK, PRK, or other refractive eye surgeries.",
    heroTitle: "Finding Relief: Window Tint Exemptions for LASIK/Refractive Surgery",
    heroDescription: conditionHero,
    metaTitle: "LASIK/Refractive Surgery Window Tint Medical Exemption 2026",
    understandingSection: "LASIK and other refractive surgeries reshape the cornea to correct vision. While these procedures are highly successful, many patients experience increased light sensitivity during recovery and sometimes long-term. The cornea's altered shape can cause increased glare sensitivity, halos around lights, and general photophobia. These post-surgical effects can persist for weeks, months, or in some cases, permanently.",
    drivingImpact: drivingSafety,
    whyQualifies: reviewRelevance,
    howToGet: reviewProcess,
    livingWith: conditionSupport,
    doctorQuestions: [
      { question: "When was your LASIK/refractive surgery performed?", reason: "To establish the timeline of symptoms." },
      { question: "What type of procedure was performed?", reason: "To understand the specific surgical approach." },
      { question: "How severe is your light sensitivity?", reason: "To assess the degree of photophobia." },
      { question: "Has the sensitivity improved since surgery?", reason: "To track recovery progress." },
      { question: "How does the sensitivity affect your driving?", reason: "To document driving safety concerns." },
      { question: "What protective measures are you using?", reason: "To evaluate current management strategies." },
    ],
    faq: safeConditionFaq("LASIK/Refractive Surgery"),
    relatedConditions: [
      { name: "Astigmatism", slug: "astigmatism", description: "A common vision condition caused by an irregularly shaped cornea or lens." },
    ],
  },
  vitiligo: {
    name: "Vitiligo",
    slug: "vitiligo",
    shortDescription: "A skin condition causing loss of pigmentation, making affected areas extremely vulnerable to sun damage.",
    heroTitle: "Protect Your Skin: Get a Window Tint Exemption for Vitiligo",
    heroDescription: conditionHero,
    metaTitle: "Vitiligo Window Tint Medical Exemption Guide 2026",
    understandingSection: "Vitiligo is a chronic skin condition where melanocytes (pigment-producing cells) are destroyed, resulting in white patches of skin. These depigmented areas lack the natural protection melanin provides against ultraviolet radiation, making them extremely susceptible to sunburn and UV damage. For individuals with vitiligo, even brief sun exposure through vehicle windows can cause painful sunburn on affected areas.",
    drivingImpact: drivingSafety,
    whyQualifies: reviewRelevance,
    howToGet: reviewProcess,
    livingWith: conditionSupport,
    doctorQuestions: [
      { question: "What percentage of your body is affected by vitiligo?", reason: "To assess the extent of depigmented areas." },
      { question: "Which body areas are most affected?", reason: "To identify areas at risk during driving." },
      { question: "How does sun exposure affect your condition?", reason: "To document UV sensitivity." },
      { question: "What sun protection measures do you currently use?", reason: "To evaluate existing protection strategies." },
      { question: "Have you experienced sunburn while driving?", reason: "To directly connect the condition to driving risk." },
      { question: "Is your vitiligo stable or progressing?", reason: "To understand the condition's trajectory." },
    ],
    faq: safeConditionFaq("Vitiligo"),
    relatedConditions: [
      { name: "Lupus (Systemic Lupus Erythematosus)", slug: "lupus", description: "An autoimmune disease that causes extreme sensitivity to sunlight and UV radiation." },
    ],
  },
  "polymorphous-light-eruption": {
    name: "Polymorphous Light Eruption (PMLE)",
    slug: "polymorphous-light-eruption",
    shortDescription: "A skin condition causing rash and itching when exposed to sunlight.",
    heroTitle: "Seeking a Window Tint Exemption for PMLE? We Can Help!",
    heroDescription: conditionHero,
    metaTitle: "Polymorphous Light Eruption (PMLE) Window Tint Exemption 2026",
    understandingSection: "Polymorphous Light Eruption (PMLE) is a common sun-induced skin condition that causes an itchy, burning rash when skin is exposed to sunlight or UV radiation. The rash typically appears within hours of sun exposure and can last for days. PMLE most commonly affects the chest, arms, and face — areas that receive direct sun exposure through vehicle windows while driving.",
    drivingImpact: drivingSafety,
    whyQualifies: reviewRelevance,
    howToGet: reviewProcess,
    livingWith: conditionSupport,
    doctorQuestions: [
      { question: "When did you first notice PMLE symptoms?", reason: "To establish the onset of the condition." },
      { question: "What types of sun exposure trigger your rash?", reason: "To identify specific triggers." },
      { question: "How severe are your reactions?", reason: "To assess the impact on daily life." },
      { question: "Does driving trigger your symptoms?", reason: "To connect the condition to driving safety." },
      { question: "What treatments have you tried?", reason: "To evaluate management strategies." },
      { question: "How long do your reactions typically last?", reason: "To understand recovery patterns." },
    ],
    faq: safeConditionFaq("Polymorphous Light Eruption (PMLE)"),
    relatedConditions: [],
  },
  "erythropoietic-protoporphyria": {
    name: "Erythropoietic Protoporphyria (EPP)",
    slug: "erythropoietic-protoporphyria",
    shortDescription: "A rare genetic disorder causing extreme sensitivity to sunlight with painful skin reactions.",
    heroTitle: "Navigating Sunlight Sensitivity: Your Window Tint Exemption Guide",
    heroDescription: conditionHero,
    metaTitle: "Erythropoietic Protoporphyria (EPP) Window Tint Exemption 2026",
    understandingSection: "Erythropoietic Protoporphyria (EPP) is a rare inherited disorder caused by a deficiency in the enzyme ferrochelatase, leading to an accumulation of protoporphyrin in the blood, skin, and liver. This accumulation causes extreme sensitivity to sunlight, with even brief exposure leading to severe burning, stinging, and itching of the skin. Unlike sunburn, EPP reactions can occur within minutes of sun exposure and cause deep tissue pain.",
    drivingImpact: drivingSafety,
    whyQualifies: reviewRelevance,
    howToGet: reviewProcess,
    livingWith: conditionSupport,
    doctorQuestions: [
      { question: "When were you diagnosed with EPP?", reason: "To establish the condition history." },
      { question: "How quickly do symptoms appear after sun exposure?", reason: "To document the severity and speed of reactions." },
      { question: "What is the intensity of your pain during reactions?", reason: "To assess symptom severity." },
      { question: "How do you currently manage sun exposure?", reason: "To evaluate existing protective measures." },
      { question: "Can you drive without UV protection?", reason: "To directly document driving limitations." },
      { question: "Are you currently on any EPP-specific treatments?", reason: "To understand the treatment plan." },
    ],
    faq: safeConditionFaq("Erythropoietic Protoporphyria (EPP)"),
    relatedConditions: [],
  },
  melanoma: {
    name: "Melanoma / Skin Cancer History",
    slug: "melanoma",
    shortDescription: "History of skin cancer requiring minimized UV exposure to prevent recurrence.",
    heroTitle: "Protecting Your Health: Window Tint Exemption for Melanoma",
    heroDescription: conditionHero,
    metaTitle: "Melanoma / Skin Cancer History Window Tint Exemption 2026",
    understandingSection: "Melanoma is the most dangerous form of skin cancer, developing from the pigment-producing cells known as melanocytes. Individuals with a history of melanoma or other skin cancers must minimize UV exposure to reduce the risk of recurrence. UV radiation from the sun, even through vehicle windows, can contribute to skin damage and increase cancer risk.",
    drivingImpact: drivingSafety,
    whyQualifies: reviewRelevance,
    howToGet: reviewProcess,
    livingWith: conditionSupport,
    doctorQuestions: [
      { question: "What type and stage of skin cancer were you diagnosed with?", reason: "To understand the severity of your history." },
      { question: "When was your most recent diagnosis or treatment?", reason: "To establish the timeline." },
      { question: "Are you currently in remission?", reason: "To assess your current health status." },
      { question: "What UV protection measures do you currently follow?", reason: "To evaluate existing prevention strategies." },
      { question: "How much time do you spend driving?", reason: "To assess UV exposure risk while driving." },
      { question: "Have you noticed any new or changing skin lesions?", reason: "To monitor for recurrence." },
    ],
    faq: safeConditionFaq("Melanoma / Skin Cancer History"),
    relatedConditions: [],
  },
  albinism: {
    name: "Albinism",
    slug: "albinism",
    shortDescription: "A genetic condition causing lack of melanin, resulting in extreme sensitivity to sunlight.",
    heroTitle: "Navigating Sun Sensitivity: Your Guide to Window Tint Exemptions for Albinism",
    heroDescription: conditionHero,
    metaTitle: "Albinism Window Tint Medical Exemption Guide 2026",
    understandingSection: "Albinism is a genetic condition characterized by a significant reduction or absence of melanin pigment in the skin, hair, and eyes. Without melanin's natural protection, individuals with albinism are extremely sensitive to sunlight and UV radiation. The condition also often affects vision, causing reduced visual acuity, nystagmus (involuntary eye movements), and severe photophobia. These combined effects make sun protection essential for daily activities, especially driving.",
    drivingImpact: drivingSafety,
    whyQualifies: reviewRelevance,
    howToGet: reviewProcess,
    livingWith: conditionSupport,
    doctorQuestions: [
      { question: "What type of albinism do you have?", reason: "To understand the specific variant and its effects." },
      { question: "How does sunlight affect your skin?", reason: "To document UV sensitivity." },
      { question: "Do you experience vision problems in bright light?", reason: "To assess photophobia severity." },
      { question: "What is your current visual acuity?", reason: "To document vision impact on driving." },
      { question: "What sun protection measures do you currently use?", reason: "To evaluate existing protection strategies." },
      { question: "Have you experienced sunburn while driving?", reason: "To directly connect the condition to driving risk." },
    ],
    faq: safeConditionFaq("Albinism"),
    relatedConditions: [
      { name: "Photophobia", slug: "photophobia", description: "Extreme sensitivity to light that causes discomfort or pain when exposed to bright light." },
    ],
  },
  "xeroderma-pigmentosum": {
    name: "Xeroderma Pigmentosum (XP)",
    slug: "xeroderma-pigmentosum",
    shortDescription: "A rare genetic disorder where the body cannot repair UV damage, causing extreme sun sensitivity.",
    heroTitle: "Protecting Your Drive with Xeroderma Pigmentosum (XP)",
    heroDescription: conditionHero,
    metaTitle: "Xeroderma Pigmentosum (XP) Window Tint Exemption 2026",
    understandingSection: "Xeroderma Pigmentosum (XP) is a rare inherited condition where the body's DNA repair mechanisms cannot fix damage caused by ultraviolet light. This means that even minimal sun exposure can cause severe sunburn, freckling, and a dramatically increased risk of skin cancer. XP patients must avoid all UV exposure, making comprehensive protection in vehicles absolutely essential.",
    drivingImpact: drivingSafety,
    whyQualifies: reviewRelevance,
    howToGet: reviewProcess,
    livingWith: conditionSupport,
    doctorQuestions: [
      { question: "When was your XP diagnosis confirmed?", reason: "To establish the condition history." },
      { question: "What type of XP do you have?", reason: "To understand the specific variant." },
      { question: "What UV protection measures are you currently using?", reason: "To evaluate existing protection." },
      { question: "Have you developed any skin cancers?", reason: "To assess the severity of UV damage." },
      { question: "How do you manage daily sun exposure?", reason: "To understand lifestyle adaptations." },
      { question: "Is driving a necessity for you?", reason: "To document the need for vehicle UV protection." },
    ],
    faq: safeConditionFaq("Xeroderma Pigmentosum (XP)"),
    relatedConditions: [],
  },
  porphyria: {
    name: "Porphyria",
    slug: "porphyria",
    shortDescription: "A group of disorders affecting the nervous system or skin, causing sensitivity to sunlight.",
    heroTitle: "Finding Relief: Window Tint Exemption for Porphyria",
    heroDescription: conditionHero,
    metaTitle: "Porphyria and Window Tint Exemption in 2026",
    understandingSection: "Porphyria refers to a group of rare disorders caused by problems with the production of heme, a component of hemoglobin. Several types of porphyria cause extreme sensitivity to sunlight. When porphyrins accumulate in the skin, sun exposure can trigger severe burning, blistering, and scarring. The cutaneous forms of porphyria — including PCT, EPP, and CEP — all involve significant photosensitivity.",
    drivingImpact: drivingSafety,
    whyQualifies: reviewRelevance,
    howToGet: reviewProcess,
    livingWith: conditionSupport,
    doctorQuestions: [
      { question: "What type of porphyria do you have?", reason: "To identify the specific variant and its effects." },
      { question: "How does sunlight affect your skin?", reason: "To document photosensitivity severity." },
      { question: "What treatments are you currently receiving?", reason: "To understand your management plan." },
      { question: "How quickly do reactions occur after sun exposure?", reason: "To assess the urgency of sun protection needs." },
      { question: "Does driving trigger your symptoms?", reason: "To connect the condition to driving safety." },
      { question: "What protective measures do you currently use?", reason: "To evaluate existing protection strategies." },
    ],
    faq: safeConditionFaq("Porphyria"),
    relatedConditions: [
      { name: "Erythropoietic Protoporphyria (EPP)", slug: "erythropoietic-protoporphyria", description: "A rare genetic disorder causing extreme sensitivity to sunlight with painful skin reactions." },
    ],
  },
  "solar-urticaria": {
    name: "Solar Urticaria",
    slug: "solar-urticaria",
    shortDescription: "A rare allergy to sunlight causing hives within minutes of sun exposure.",
    heroTitle: "Navigating Relief: Window Tint Exemption for Solar Urticaria",
    heroDescription: conditionHero,
    metaTitle: "Solar Urticaria and Window Tint Exemption Guide 2026",
    understandingSection: "Solar urticaria is a rare form of physical urticaria (hives) triggered by exposure to sunlight. Within minutes of sun exposure, affected individuals develop itchy, red welts on exposed skin. In severe cases, reactions can include dizziness, headache, nausea, and even anaphylaxis. The condition is caused by an abnormal immune response to specific wavelengths of light.",
    drivingImpact: drivingSafety,
    whyQualifies: reviewRelevance,
    howToGet: reviewProcess,
    livingWith: conditionSupport,
    doctorQuestions: [
      { question: "How quickly do you react to sunlight?", reason: "To assess reaction onset speed." },
      { question: "What wavelengths trigger your reactions?", reason: "To identify specific light triggers." },
      { question: "How severe are your reactions?", reason: "To document symptom severity." },
      { question: "Have you experienced anaphylaxis?", reason: "To assess the risk of severe reactions." },
      { question: "What treatments are you currently using?", reason: "To evaluate management strategies." },
      { question: "Does driving trigger your symptoms?", reason: "To connect the condition to driving safety." },
    ],
    faq: safeConditionFaq("Solar Urticaria"),
    relatedConditions: [],
  },
  cataracts: {
    name: "Cataracts",
    slug: "cataracts",
    shortDescription: "Clouding of the eye's lens causing increased sensitivity to glare and bright light.",
    heroTitle: "Navigating Life with Cataracts: A Path to Relief",
    heroDescription: conditionHero,
    metaTitle: "Cataracts and Window Tint Medical Exemption 2026",
    understandingSection: "Cataracts occur when the eye's natural lens becomes clouded, leading to decreased vision, increased glare sensitivity, and difficulty seeing in bright light. The clouded lens scatters light entering the eye, creating halos, glare, and washed-out colors. Cataracts are most common in older adults but can occur at any age due to injury, genetics, or other factors.",
    drivingImpact: drivingSafety,
    whyQualifies: reviewRelevance,
    howToGet: reviewProcess,
    livingWith: conditionSupport,
    doctorQuestions: [
      { question: "How long have you had cataracts?", reason: "To establish the condition timeline." },
      { question: "How do cataracts affect your daily vision?", reason: "To assess overall visual impact." },
      { question: "Do you experience increased glare while driving?", reason: "To document driving-specific issues." },
      { question: "Are you a candidate for cataract surgery?", reason: "To understand treatment options." },
      { question: "What visual aids are you currently using?", reason: "To evaluate existing management strategies." },
      { question: "Has your vision deteriorated recently?", reason: "To track the progression of cataracts." },
    ],
    faq: safeConditionFaq("Cataracts"),
    relatedConditions: [
      { name: "Macular Degeneration", slug: "macular-degeneration", description: "An eye disease causing loss of central vision, often with light sensitivity." },
    ],
  },
  "macular-degeneration": {
    name: "Macular Degeneration",
    slug: "macular-degeneration",
    shortDescription: "An eye disease causing loss of central vision, often with light sensitivity.",
    heroTitle: "Navigating the Road with Macular Degeneration: A Path to Relief",
    heroDescription: conditionHero,
    metaTitle: "Macular Degeneration Window Tint Exemption Guide 2026",
    understandingSection: "Macular degeneration is a progressive eye condition affecting the macula, the central part of the retina responsible for sharp, detailed vision. It is the leading cause of vision loss in adults over 50. The condition causes central vision to become blurred or distorted, and many patients develop increased sensitivity to bright light and glare. This light sensitivity can make outdoor activities and driving particularly challenging.",
    drivingImpact: drivingSafety,
    whyQualifies: reviewRelevance,
    howToGet: reviewProcess,
    livingWith: conditionSupport,
    doctorQuestions: [
      { question: "What type of macular degeneration do you have?", reason: "To identify whether it's dry or wet AMD." },
      { question: "How has your vision changed over time?", reason: "To track the progression of the condition." },
      { question: "Do you experience increased glare sensitivity?", reason: "To document light sensitivity." },
      { question: "How does your condition affect driving?", reason: "To assess driving safety concerns." },
      { question: "What treatments are you currently receiving?", reason: "To understand the management plan." },
      { question: "Do you use any low-vision aids?", reason: "To evaluate visual support tools." },
    ],
    faq: safeConditionFaq("Macular Degeneration"),
    relatedConditions: [
      { name: "Cataracts", slug: "cataracts", description: "Clouding of the eye's lens causing increased sensitivity to glare and bright light." },
    ],
  },
};

export function getConditionBySlug(slug: string): ConditionData | undefined {
  return conditions[slug];
}

export function getAllConditionSlugs(): string[] {
  return Object.keys(conditions);
}

export function getAllConditions(): ConditionData[] {
  return Object.values(conditions);
}
