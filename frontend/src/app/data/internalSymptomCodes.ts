export type InternalSymptomCode = {
  /** Internal code until official USSD mapping exists */
  code: string;
  promptKiswahili: string;
  promptEnglish: string;
  physicalSymptom: string;
  linkedArticle: string;
  articleTitle: string;
  severity: 'high' | 'medium' | 'low';
  /** Optional hints for later menu design */
  menuPath?: string;
};

/**
 * Draft internal codes derived from the training PDF.
 * Replace with official USSD codes when available.
 */
export const internalSymptomCodes: InternalSymptomCode[] = [
  {
    code: '901',
    promptKiswahili: 'Madoa ya njano/kahawia kwenye majani (utando chini ya jani)',
    promptEnglish: 'Circular yellow/brown spots on leaves (underside webbing)',
    physicalSymptom: 'Persea mite damage',
    linkedArticle: 'KB-PDF-001',
    articleTitle: 'Persea Mites (Oligonychus perseae): Identification, Scouting, and IPM',
    severity: 'high',
    menuPath: 'Draft > Pests > Mites > Leaf spotting/webbing',
  },
  {
    code: '902',
    promptKiswahili: 'Matunda kuanguka mapema na mashimo madogo na kuoza',
    promptEnglish: 'Premature fruit fall with small puncture holes and rotting',
    physicalSymptom: 'Fruit fly infestation',
    linkedArticle: 'KB-PDF-002',
    articleTitle: 'Fruit Flies in Avocado: Monitoring, Sanitation, and Trapping',
    severity: 'high',
    menuPath: 'Draft > Fruit issues > Premature drop/rotting',
  },
  {
    code: '903',
    promptKiswahili: 'Matundu/tundu kwenye tunda na kinyesi (frass) mlangoni',
    promptEnglish: 'Holes/tunnels in fruit with frass at entry point',
    physicalSymptom: 'False codling moth',
    linkedArticle: 'KB-PDF-003',
    articleTitle: 'False Codling Moth (FCM): Identification and Pheromone Trap Management',
    severity: 'high',
    menuPath: 'Draft > Fruit issues > Holes/tunnels (FCM)',
  },
  {
    code: '904',
    promptKiswahili: 'Ukungu mweusi/ute (honeydew) na vivinje kwenye majani/shina na mchwa',
    promptEnglish: 'Sooty mold/honeydew with small bumps on leaves/stems and ants',
    physicalSymptom: 'Scale insects',
    linkedArticle: 'KB-PDF-004',
    articleTitle: 'Scale Insects: Monitoring, Ant Control, and Targeted Treatments',
    severity: 'medium',
    menuPath: 'Draft > Pests > Scales > Honeydew/ants',
  },
  {
    code: '905',
    promptKiswahili: 'Kovu/mikwaruzo kwenye tunda karibu na kikonyo (calyx); ngozi ngumu ya kahawia',
    promptEnglish: 'Fruit scarring starting near calyx; leathery brown skin',
    physicalSymptom: 'Thrips damage',
    linkedArticle: 'KB-PDF-005',
    articleTitle: 'Thrips: Symptoms, Monitoring, and Management',
    severity: 'medium',
    menuPath: 'Draft > Pests > Thrips > Fruit scarring',
  },
  {
    code: '906',
    promptKiswahili: 'Mti kudhoofika; majani kunyauka na kuwa mepesi; matawi kufa; mizizi myeupe kupotea/kuwa nyeusi',
    promptEnglish: 'Tree decline with wilted pale leaves, dieback, and black feeder roots',
    physicalSymptom: 'Phytophthora root rot',
    linkedArticle: 'KB-044',
    articleTitle: 'Phytophthora Root Rot Prevention and Control',
    severity: 'high',
    menuPath: 'Draft > Diseases > Root issues > Root rot',
  },
  {
    code: '907',
    promptKiswahili: 'Alama zilizopauka/zilizozama kwenye tunda; mistari ya njano kwenye majani; gome kupasuka',
    promptEnglish: 'Bleached/sunken marks on fruit; yellow streaks on leaves; cracked bark',
    physicalSymptom: 'Sunblotch viroid (ASBVd)',
    linkedArticle: 'KB-PDF-007',
    articleTitle: 'Avocado Sunblotch Viroid (ASBVd): Identification and Biosecurity',
    severity: 'high',
    menuPath: 'Draft > Diseases > Sunblotch',
  },
  {
    code: '908',
    promptKiswahili: 'Madoa makavu ya kahawia-kiza kwenye tunda; kuoza ndani ya tunda',
    promptEnglish: 'Dark dry spots on fruit skin; internal rot expanding into flesh',
    physicalSymptom: 'Anthracnose',
    linkedArticle: 'KB-PDF-008',
    articleTitle: 'Anthracnose: Post-harvest Fruit Disease Management',
    severity: 'high',
    menuPath: 'Draft > Diseases > Fruit diseases > Anthracnose',
  },
  {
    code: '909',
    promptKiswahili: 'Madoa ya njano kwenye tunda/majani yanayogeuka kahawia-nyekundu na kupasuka',
    promptEnglish: 'Small yellow spots on fruit/leaves turning reddish-brown and cracking',
    physicalSymptom: 'Cercospora fruit spot',
    linkedArticle: 'KB-PDF-009',
    articleTitle: 'Cercospora Fruit Spot: Symptoms and Control Timing',
    severity: 'medium',
    menuPath: 'Draft > Diseases > Fruit diseases > Cercospora',
  },
  {
    code: '910',
    promptKiswahili: 'Madoa meusi yaliyoinuka kwenye matunda machanga yanayokuwa ya “corky”',
    promptEnglish: 'Small raised dark lesions on young fruit that become corky',
    physicalSymptom: 'Avocado scab',
    linkedArticle: 'KB-PDF-010',
    articleTitle: 'Avocado Scab: Identification and Orchard Sanitation',
    severity: 'medium',
    menuPath: 'Draft > Diseases > Fruit diseases > Scab',
  },
];

