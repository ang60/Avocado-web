export const articleData: Record<string, any> = {
  'KB-045': {
    id: 'KB-045',
    title: 'Avocado Thrips: Identification and Management',
    category: 'Pest Management',
    tags: ['Thrips', 'IPM', 'Treatment'],
    lastUpdated: 'Mar 10, 2026',
    views: 1247,
    severity: 'high',
    activeUses: 14,
    approvedContent: true,
    ussdCode: '102',
    chemicalGate: 'gated',
    ipmLevel: 3,
    
    advisorySnippetEN: 'AvoGuard: Manage Thrips by pruning lower branches & removing fallen fruit. Inspect weekly. Avoid chemicals within 14 days of harvest.',
    advisorySnippetSW: 'AvoGuard: Simamia Thrips kwa kukata matawi ya chini & kuondoa matunda yaliyoanguka. Kagua kila wiki. Epuka kemikali siku 14 kabla ya kuvuna.',
    
    fieldPhotos: [
      { title: 'Thrips Scarring on Fruit', description: 'Silver-bronze scarring characteristic of thrips feeding damage', stage: 'Identification' },
      { title: 'Leaf Damage', description: 'Distorted young leaves with brown edges from thrips feeding', stage: 'Identification' },
      { title: 'Adult Thrips (Magnified)', description: 'Tiny yellow-brown insects visible with 10x hand lens', stage: 'Identification' },
      { title: 'Severe Infestation', description: 'Heavy damage requiring immediate intervention', stage: 'Severity Assessment' },
    ],
    
    ipmLadder: {
      level1: {
        title: 'Level 1: Cultural Controls',
        icon: 'cultural',
        status: 'open',
        practices: [
          { name: 'Orchard Sanitation', description: 'Remove and destroy fallen fruit and pruned branches immediately. These harbor thrips populations.', frequency: 'Weekly', effectiveness: 'Medium' },
          { name: 'Strategic Pruning', description: 'Prune lower branches to improve air circulation and reduce humidity, which favors thrips development.', frequency: 'Bi-annually', effectiveness: 'Medium' },
          { name: 'Water Management', description: 'Avoid overhead irrigation which increases humidity. Use drip irrigation to keep canopy dry.', frequency: 'Ongoing', effectiveness: 'Low-Medium' },
        ],
      },
      level2: {
        title: 'Level 2: Biological Controls',
        icon: 'biological',
        status: 'open',
        practices: [
          { name: 'Predatory Mites (Neoseiulus cucumeris)', description: 'Release predatory mites that feed on thrips larvae. Effective for moderate infestations.', frequency: 'Every 2-3 weeks during thrips season', effectiveness: 'High', supplier: 'Kenya Biological Control Centre' },
          { name: 'Lacewing Larvae Release', description: 'Release lacewing larvae which are generalist predators that consume thrips at all life stages.', frequency: 'Monthly', effectiveness: 'Medium-High', supplier: 'Regional IPM Hubs' },
          { name: 'Beauveria bassiana (Entomopathogenic Fungus)', description: 'Apply fungal bio-pesticide that infects and kills thrips. Safe for beneficial insects.', frequency: 'Every 7-10 days during outbreak', effectiveness: 'Medium', supplier: 'Certified agro-input dealers' },
        ],
      },
      level3: {
        title: 'Level 3: Chemical Controls (GATED)',
        icon: 'chemical',
        status: 'gated',
        warning: 'Agronomist approval required. Pre-Harvest Interval (PHI) must be strictly observed.',
        practices: [
          { name: 'Spinosad (e.g., Tracer 480 SC)', description: 'Organically-acceptable insecticide derived from soil bacteria. Effective against thrips.', phi: '7 days', applicationRate: '50-75 ml per 20L water', maxApplications: '3 per season', resistance: 'Low risk if rotated', registrationStatus: 'PCPB Registered' },
          { name: 'Abamectin (e.g., Abathor 18 EC)', description: 'Highly effective against thrips but has longer PHI. Use only for severe infestations.', phi: '14 days', applicationRate: '15-20 ml per 20L water', maxApplications: '2 per season', resistance: 'Medium risk - rotate chemical classes', registrationStatus: 'PCPB Registered' },
          { name: 'Imidacloprid (e.g., Confidor 200 SL)', description: 'Systemic neonicotinoid. Not recommended due to bee toxicity. Use ONLY as last resort.', phi: '21 days', applicationRate: '10 ml per 20L water', maxApplications: '1 per season', resistance: 'High risk - do not repeat applications', registrationStatus: 'PCPB Registered (Restricted use)', warning: 'CAUTION: Toxic to pollinators. Apply in evening only.' },
        ],
      },
    },
    
    identificationSigns: [
      'Silver-bronze scarring on fruit skin',
      'Distorted young leaves with brown edges',
      'Tiny (1-2mm) yellow or brown insects visible with hand lens',
      'Damage concentrated on new growth and developing fruit',
    ],
    
    lifeCycle: 'Avocado thrips complete their life cycle in 14-21 days depending on temperature. Eggs are laid in leaf tissue, larvae feed on tender growth, and adults emerge to repeat the cycle. Peak populations occur during dry, hot weather (January-March in Kenya).',
    
    economicImpact: 'Thrips damage reduces fruit marketability by 30-60% in export markets due to cosmetic scarring. Severe infestations can cause premature fruit drop and reduce next season\'s yield by damaging flowering shoots.',
  },
  'KB-044': {
    id: 'KB-044',
    title: 'Phytophthora Root Rot Prevention and Control',
    category: 'Disease Management',
    tags: ['Root Rot', 'Prevention', 'Drainage'],
    lastUpdated: 'Mar 8, 2026',
    views: 982,
    severity: 'high',
    activeUses: 22,
    approvedContent: true,
    ussdCode: '205',
    chemicalGate: 'gated',
    ipmLevel: 3,
    
    advisorySnippetEN: 'AgriGuard: Prevent root rot through proper drainage, avoiding overwatering, and maintaining soil pH 6-7. Apply mulch but keep away from trunk. Consult agronomist for fungicide use.',
    advisorySnippetSW: 'AgriGuard: Zuia kuoza kwa mizizi kwa mifereji bora, epuka kumwagilia maji mengi, na kudumisha pH ya udongo 6-7. Tumia malazi lakini weka mbali na shina. Wasiliana na mtaalamu kwa matumizi ya dawa za kuuwa kuvu.',
    
    fieldPhotos: [
      { title: 'Wilting Canopy', description: 'Characteristic wilting despite adequate soil moisture', stage: 'Identification' },
      { title: 'Root System Damage', description: 'Black, rotted roots with reduced feeder roots', stage: 'Identification' },
      { title: 'Trunk Canker', description: 'Dark canker at soil line with gum exudation', stage: 'Advanced Stage' },
      { title: 'Poor Drainage Area', description: 'Standing water increases disease risk', stage: 'Prevention' },
    ],
    
    ipmLadder: {
      level1: {
        title: 'Level 1: Cultural & Preventive Controls',
        icon: 'cultural',
        status: 'open',
        practices: [
          { name: 'Site Selection & Drainage', description: 'Plant in well-draining soils with slopes >2%. Install drainage systems in flat areas. Avoid low-lying zones with water accumulation.', frequency: 'At establishment', effectiveness: 'Very High' },
          { name: 'Rootstock Selection', description: 'Use Phytophthora-resistant rootstocks like Dusa or Duke 7. Avoid susceptible varieties in high-risk areas.', frequency: 'At planting', effectiveness: 'Very High' },
          { name: 'Irrigation Management', description: 'Use drip irrigation. Avoid overwatering. Monitor soil moisture with sensors. Never irrigate to field capacity in clay soils.', frequency: 'Ongoing', effectiveness: 'High' },
          { name: 'Mulching Practices', description: 'Apply organic mulch 15cm away from trunk. Maintain 10cm depth to regulate soil moisture and temperature.', frequency: 'Bi-annually', effectiveness: 'Medium' },
        ],
      },
      level2: {
        title: 'Level 2: Biological Controls',
        icon: 'biological',
        status: 'open',
        practices: [
          { name: 'Trichoderma Species Application', description: 'Apply Trichoderma harzianum to root zone. Colonizes roots and competes with Phytophthora pathogens.', frequency: 'Every 3 months', effectiveness: 'Medium-High', supplier: 'Kenya Biological Control Centre' },
          { name: 'Phosphite Injections', description: 'Inject phosphite (phosphorous acid) into trunk. Boosts plant immunity against Phytophthora without being a fungicide.', frequency: 'Twice per year', effectiveness: 'High', supplier: 'Certified agro-dealers' },
          { name: 'Compost Tea Applications', description: 'Apply aerated compost tea to soil. Beneficial microbes suppress pathogen activity.', frequency: 'Monthly during rainy season', effectiveness: 'Medium', supplier: 'On-farm production' },
        ],
      },
      level3: {
        title: 'Level 3: Chemical Controls (GATED)',
        icon: 'chemical',
        status: 'gated',
        warning: 'Agronomist approval required. Curative fungicides have limited effectiveness once infection is established.',
        practices: [
          { name: 'Metalaxyl-M (e.g., Ridomil Gold 480 SC)', description: 'Systemic fungicide for soil drenching. Most effective as preventive treatment in high-risk blocks.', phi: 'Not applicable (soil treatment)', applicationRate: '100ml per 20L water, drench 5L per tree', maxApplications: '2 per season', resistance: 'High risk - must rotate', registrationStatus: 'PCPB Registered' },
          { name: 'Fosetyl-Al (e.g., Aliette 80 WP)', description: 'Systemic fungicide with both preventive and curative action. Apply as foliar spray or soil drench.', phi: '30 days', applicationRate: '200g per 20L water', maxApplications: '3 per season', resistance: 'Low risk', registrationStatus: 'PCPB Registered' },
          { name: 'Copper Hydroxide (e.g., Kocide 2000)', description: 'Protective fungicide. Apply to trunk and root crown area. Less effective than systemic options.', phi: '0 days (contact fungicide)', applicationRate: '50g per 20L water', maxApplications: '4 per season', resistance: 'No resistance', registrationStatus: 'PCPB Registered', warning: 'Can accumulate in soil with repeated use' },
        ],
      },
    },
    
    identificationSigns: [
      'Canopy wilting and yellowing despite adequate soil moisture',
      'Reduced vigor, stunted new growth, and leaf drop',
      'Dark brown to black discoloration of roots and root collar',
      'Gummy exudate (sap) oozing from trunk at soil level',
      'Reduced feeder root density when excavating around trunk',
    ],
    
    lifeCycle: 'Phytophthora cinnamomi is a soil-borne oomycete (water mold) that thrives in saturated soils. Zoospores swim through water films to infect roots. Disease severity increases during rainy seasons (March-May, October-December in Kenya) and in poorly drained soils. Once established, the pathogen persists in soil indefinitely.',
    
    economicImpact: 'Root rot is the most economically devastating avocado disease globally, causing 30-40% tree mortality in susceptible orchards. Infected trees show progressive decline over 2-5 years, resulting in total yield loss. Replanting costs exceed KES 15,000 per tree including removal and establishment.',
  },
  'KB-040': {
    id: 'KB-040',
    title: 'Anthracnose Disease Management',
    category: 'Disease Management',
    tags: ['Anthracnose', 'Fungicide', 'Prevention'],
    lastUpdated: 'Feb 25, 2026',
    views: 723,
    severity: 'medium',
    activeUses: 17,
    approvedContent: true,
    ussdCode: '203',
    chemicalGate: 'gated',
    ipmLevel: 3,
    
    advisorySnippetEN: 'AgriGuard: Control anthracnose by removing infected fruit & debris. Apply copper sprays before rains. Harvest at proper maturity. Post-harvest hot water treatment (50°C, 20 min) reduces fruit rot.',
    advisorySnippetSW: 'AgriGuard: Dhibiti anthracnose kwa kuondoa matunda yaliyoathirika na uchafu. Nyunyiza shaba kabla ya mvua. Vuna kwa ukomavu sahihi. Matibabu ya maji ya moto baada ya kuvuna (50°C, dakika 20) inapunguza kuoza kwa matunda.',
    
    fieldPhotos: [
      { title: 'Black Lesions on Fruit', description: 'Circular black spots that expand and coalesce', stage: 'Identification' },
      { title: 'Post-Harvest Rot', description: 'Soft rotting that develops during ripening', stage: 'Post-Harvest' },
      { title: 'Leaf Spots', description: 'Brown angular lesions on leaves near veins', stage: 'Identification' },
      { title: 'Twig Dieback', description: 'Dead twigs with sunken cankers', stage: 'Advanced Stage' },
    ],
    
    ipmLadder: {
      level1: {
        title: 'Level 1: Cultural Controls',
        icon: 'cultural',
        status: 'open',
        practices: [
          { name: 'Orchard Sanitation', description: 'Remove and destroy infected fruit, fallen leaves, and dead twigs. These harbor fungal spores that spread to healthy tissue.', frequency: 'Weekly during rainy season', effectiveness: 'High' },
          { name: 'Canopy Management', description: 'Prune to improve air circulation and reduce humidity. Open canopies dry faster after rain, reducing infection periods.', frequency: 'Annually', effectiveness: 'Medium-High' },
          { name: 'Harvest at Correct Maturity', description: 'Harvest fruit at 23%+ dry matter. Immature fruit is highly susceptible to post-harvest anthracnose.', frequency: 'Per harvest cycle', effectiveness: 'Very High' },
          { name: 'Post-Harvest Handling', description: 'Handle fruit gently to avoid skin damage. Wounds are entry points for Colletotrichum spores.', frequency: 'Every harvest', effectiveness: 'High' },
        ],
      },
      level2: {
        title: 'Level 2: Physical & Biological Controls',
        icon: 'biological',
        status: 'open',
        practices: [
          { name: 'Hot Water Treatment', description: 'Dip harvested fruit in 50°C water for 20 minutes. Kills surface spores and reduces post-harvest rot by 70-90%.', frequency: 'Every harvest batch', effectiveness: 'Very High', supplier: 'On-farm equipment' },
          { name: 'Bacillus subtilis Application', description: 'Apply beneficial bacteria that colonize fruit surface and suppress Colletotrichum. OMRI-approved for organic production.', frequency: 'Weekly during fruiting', effectiveness: 'Medium', supplier: 'Bio-pesticide suppliers' },
          { name: 'Prochloraz Smoke Treatment (Pack-house)', description: 'Fumigate packed fruit with prochloraz smoke in sealed rooms. Controls latent infections.', frequency: 'Post-packing', effectiveness: 'High', supplier: 'Export pack-houses only' },
        ],
      },
      level3: {
        title: 'Level 3: Chemical Controls (GATED)',
        icon: 'chemical',
        status: 'gated',
        warning: 'Agronomist approval required. Timing is critical - apply before rain events during flowering and fruit development.',
        practices: [
          { name: 'Copper Hydroxide (e.g., Kocide 2000)', description: 'Broad-spectrum protectant fungicide. Apply before anticipated rain events. Most effective during flowering.', phi: '0 days', applicationRate: '50g per 20L water', maxApplications: '6 per season', resistance: 'No resistance', registrationStatus: 'PCPB Registered' },
          { name: 'Azoxystrobin (e.g., Amistar 250 SC)', description: 'Systemic strobilurin fungicide with protectant and curative action. Highly effective but resistance risk is high.', phi: '14 days', applicationRate: '40ml per 20L water', maxApplications: '2 per season', resistance: 'High risk - rotate MoA', registrationStatus: 'PCPB Registered', warning: 'Must rotate with different modes of action. Do not use consecutive applications.' },
          { name: 'Prochloraz (e.g., Sportak 45 EC)', description: 'Post-harvest dip treatment. Highly effective against latent infections that cause storage rot.', phi: 'Post-harvest only', applicationRate: '1ml per 1L water (dip treatment)', maxApplications: 'Once per harvest batch', resistance: 'Medium risk', registrationStatus: 'PCPB Registered (Post-harvest only)' },
        ],
      },
    },
    
    identificationSigns: [
      'Circular, dark brown to black lesions on fruit surface',
      'Lesions that remain small and dark on immature fruit, then enlarge rapidly during ripening',
      'Soft, sunken rot with salmon-pink spore masses in humid conditions',
      'Brown angular leaf spots along veins',
      'Twig dieback with dark sunken cankers',
    ],
    
    lifeCycle: 'Colletotrichum gloeosporioides survives on dead twigs, mummified fruit, and leaf litter. Spores are spread by rain splash and wind during wet periods. The fungus infects immature fruit but remains dormant (quiescent) until ripening triggers disease development. Peak infection occurs during rainy seasons.',
    
    economicImpact: 'Anthracnose causes 20-50% post-harvest losses in untreated fruit, severely limiting export market access. European and Asian buyers have zero tolerance for anthracnose symptoms. Economic losses include rejected shipments (KES 150-200 per kg export value) and market downgrading to local sales (KES 15-25 per kg).',
  },
  'KB-041': {
    id: 'KB-041',
    title: 'Understanding Persea Mite Biology and Behavior',
    category: 'Pest Biology',
    tags: ['Mites', 'Biology', 'Lifecycle'],
    lastUpdated: 'Feb 28, 2026',
    views: 654,
    severity: 'medium',
    activeUses: 11,
    approvedContent: true,
    ussdCode: '104',
    chemicalGate: 'open',
    ipmLevel: 2,
    
    advisorySnippetEN: 'AgriGuard: Monitor for persea mite by checking leaf undersides for webbing. Release predatory mites (Neoseiulus californicus) for biological control. Avoid broad-spectrum insecticides.',
    advisorySnippetSW: 'AgriGuard: Fuatilia viroboto vya persea kwa kuangalia chini ya majani kwa utando. Achilia viroboto vya mateka (Neoseiulus californicus) kwa udhibiti wa kibiolojia. Epuka dawa za wadudu za kipeo kipeo.',
    
    fieldPhotos: [
      { title: 'Leaf Bronzing', description: 'Bronze discoloration on leaf undersides from mite feeding', stage: 'Identification' },
      { title: 'Webbing on Leaves', description: 'Fine silk webbing protecting mite colonies', stage: 'Identification' },
      { title: 'Mite Under Microscope', description: 'Adult persea mite showing characteristic body shape', stage: 'Biology' },
      { title: 'Defoliation', description: 'Severe leaf drop from prolonged mite damage', stage: 'Advanced Stage' },
    ],
    
    ipmLadder: {
      level1: {
        title: 'Level 1: Cultural & Monitoring',
        icon: 'cultural',
        status: 'open',
        practices: [
          { name: 'Regular Scouting', description: 'Inspect leaf undersides weekly using 10x hand lens. Focus on mature leaves in lower canopy where mites establish first.', frequency: 'Weekly', effectiveness: 'High (for early detection)' },
          { name: 'Dust Control', description: 'Minimize dust on leaves as it interferes with natural predatory mites. Use overhead irrigation or wind breaks near dusty roads.', frequency: 'Ongoing', effectiveness: 'Medium' },
          { name: 'Avoid Broad-Spectrum Pesticides', description: 'Many insecticides kill natural predatory mites, causing mite outbreaks. Use selective products only when necessary.', frequency: 'Ongoing', effectiveness: 'Very High' },
        ],
      },
      level2: {
        title: 'Level 2: Biological Controls',
        icon: 'biological',
        status: 'open',
        practices: [
          { name: 'Neoseiulus californicus Release', description: 'Predatory mite that feeds on persea mite and other pest mites. Establishes well in avocado orchards and provides season-long control.', frequency: 'Initial release + 2 follow-ups', effectiveness: 'Very High', supplier: 'Kenya Biological Control Centre' },
          { name: 'Euseius stipulatus Release', description: 'Generalist predatory mite effective in hot, dry conditions. Supplements Neoseiulus in diverse climates.', frequency: 'Every 2 months in outbreak zones', effectiveness: 'High', supplier: 'Regional IPM suppliers' },
          { name: 'Conservation of Natural Enemies', description: 'Protect naturally occurring predatory mites, lacewings, and ladybird beetles by avoiding harsh chemicals.', frequency: 'Ongoing', effectiveness: 'High', supplier: 'Natural populations' },
        ],
      },
      level3: {
        title: 'Level 3: Chemical Controls (NOT RECOMMENDED)',
        icon: 'chemical',
        status: 'gated',
        warning: 'Chemical control of mites often worsens infestations by killing natural predators. Use only as last resort under agronomist supervision.',
        practices: [
          { name: 'Abamectin (Selective Miticide)', description: 'Selective acaricide with some predatory mite safety. Apply only to hotspot blocks, not entire orchards.', phi: '14 days', applicationRate: '15ml per 20L water', maxApplications: '1 per season', resistance: 'Very High - rapid resistance development', registrationStatus: 'PCPB Registered', warning: 'Single applications often lead to mite resurgence 3-4 weeks later. Combine with predatory mite release.' },
        ],
      },
    },
    
    identificationSigns: [
      'Bronze or silvery discoloration on leaf undersides',
      'Fine silk webbing on lower leaf surfaces',
      'Tiny dark brown or reddish mites visible with hand lens (0.3mm)',
      'Premature leaf drop, especially in hot, dry conditions',
      'Reduced photosynthesis leading to smaller fruit and lower yields',
    ],
    
    lifeCycle: 'Persea mite (Oligonychus perseae) completes its life cycle in 10-14 days in warm weather. Females lay eggs on leaf undersides. Populations explode during hot, dry periods (December-March in Kenya). Natural predators usually keep populations below damaging thresholds unless disrupted by pesticides.',
    
    economicImpact: 'Persea mite reduces photosynthesis by up to 50% in heavily infested trees, leading to fruit size reductions of 15-30% and yield declines of 20-40% over successive seasons. Defoliation weakens trees and reduces flowering. The primary economic impact comes from unnecessary miticide applications (KES 8,000-15,000 per hectare) that disrupt biological control.',
  },
  'KB-038': {
    id: 'KB-038',
    title: 'Scale Management',
    category: 'Pest Management',
    tags: ['Scale Insects', 'IPM', 'Biological Control'],
    lastUpdated: 'Feb 20, 2026',
    views: 534,
    severity: 'medium',
    activeUses: 9,
    approvedContent: true,
    ussdCode: '106',
    chemicalGate: 'gated',
    ipmLevel: 3,
    
    advisorySnippetEN: 'AgriGuard: Control scale insects by pruning heavily infested branches, releasing parasitic wasps, and applying horticultural oil sprays. Monitor for sooty mold on leaves.',
    advisorySnippetSW: 'AgriGuard: Dhibiti wadudu wa maganda kwa kukata matawi yaliyoathirika sana, kuachilia nyigu za parasiti, na kunyunyiza mafuta ya bustani. Fuatilia ukungu mweusi kwenye majani.',
    
    fieldPhotos: [
      { title: 'Armored Scale on Twigs', description: 'Circular brown scales attached to branches', stage: 'Identification' },
      { title: 'Soft Scale on Leaves', description: 'Oval brown scales with honeydew secretion', stage: 'Identification' },
      { title: 'Sooty Mold', description: 'Black fungal growth on honeydew-covered leaves', stage: 'Secondary Damage' },
      { title: 'Parasitized Scales', description: 'Scales with exit holes from parasitic wasps', stage: 'Biological Control' },
    ],
    
    ipmLadder: {
      level1: {
        title: 'Level 1: Cultural Controls',
        icon: 'cultural',
        status: 'open',
        practices: [
          { name: 'Pruning Infested Wood', description: 'Remove and destroy heavily infested branches before scale populations build up. This is the most effective cultural control.', frequency: 'As needed during scouting', effectiveness: 'Very High' },
          { name: 'Ant Management', description: 'Control ants that protect scales from natural enemies. Use boric acid baits or sticky trunk bands.', frequency: 'Ongoing during scale season', effectiveness: 'High' },
          { name: 'Orchard Sanitation', description: 'Remove pruned material immediately. Scale insects can survive on cut branches for weeks.', frequency: 'After each pruning', effectiveness: 'Medium' },
        ],
      },
      level2: {
        title: 'Level 2: Biological & Physical Controls',
        icon: 'biological',
        status: 'open',
        practices: [
          { name: 'Parasitic Wasp Release (Aphytis & Metaphycus spp.)', description: 'Tiny wasps that parasitize scale insects. Very effective for long-term control. Check for parasitism before spraying.', frequency: 'Initial release + 1 follow-up', effectiveness: 'Very High', supplier: 'Kenya Biological Control Centre' },
          { name: 'Horticultural Oil Sprays', description: 'Petroleum-based oils that smother scale insects and eggs. Safe for beneficials if applied carefully. Best in cooler months.', frequency: 'Every 3-4 weeks during outbreak', effectiveness: 'High', supplier: 'Certified agro-dealers' },
          { name: 'Insecticidal Soap', description: 'Contact sprays that disrupt scale insect cell membranes. Must contact insects directly. Multiple applications needed.', frequency: 'Weekly for 3-4 weeks', effectiveness: 'Medium', supplier: 'Organic input suppliers' },
        ],
      },
      level3: {
        title: 'Level 3: Chemical Controls (GATED)',
        icon: 'chemical',
        status: 'gated',
        warning: 'Systemic insecticides kill parasitic wasps and predatory beetles. Use only when biological control has failed and populations threaten tree health.',
        practices: [
          { name: 'Spirotetramat (e.g., Movento 150 OD)', description: 'Systemic insecticide with two-way movement in plants. Effective against crawlers and reduces egg laying. Safer for beneficial insects than older products.', phi: '7 days', applicationRate: '75ml per 20L water', maxApplications: '2 per season', resistance: 'Medium risk', registrationStatus: 'PCPB Registered' },
          { name: 'Imidacloprid Soil Drench (e.g., Confidor)', description: 'Systemic treatment absorbed through roots. Long residual activity but harmful to pollinators and natural enemies.', phi: '14 days', applicationRate: '50ml per tree (soil drench)', maxApplications: '1 per season', resistance: 'High risk', registrationStatus: 'PCPB Registered (Restricted)', warning: 'Do not apply during flowering. Toxic to bees and beneficial insects.' },
        ],
      },
    },
    
    identificationSigns: [
      'Small brown, white, or gray bumps on twigs, branches, and leaf undersides',
      'Sticky honeydew secretion on leaves and fruit',
      'Black sooty mold growing on honeydew',
      'Yellowing leaves and twig dieback in severe infestations',
      'Ants farming scale insects for honeydew',
    ],
    
    lifeCycle: 'Scale insects have multiple overlapping generations per year. Females lay eggs under their protective scales. Mobile "crawler" stage lasts 1-2 days, then insects settle and develop protective coverings. Armored scales are harder to control than soft scales. Natural parasitic wasps attack all life stages.',
    
    economicImpact: 'Heavy scale infestations reduce tree vigor by 30-50% through sap feeding, leading to yield reductions of 20-35%. Sooty mold on fruit renders it unmarketable for export (100% rejection). Branch dieback requires removal of productive wood. Biological control is highly cost-effective (KES 2,000-4,000 per hectare vs. KES 10,000+ for repeated pesticide applications).',
  },
  'KB-032': {
    id: 'KB-032',
    title: 'Fruit Fly Control',
    category: 'Pest Management',
    tags: ['Fruit Flies', 'Trapping', 'Bait Sprays'],
    lastUpdated: 'Feb 15, 2026',
    views: 892,
    severity: 'high',
    activeUses: 18,
    approvedContent: true,
    ussdCode: '105',
    chemicalGate: 'gated',
    ipmLevel: 3,
    
    advisorySnippetEN: 'AgriGuard: Control fruit flies using protein bait traps + GF-120 bait sprays. Harvest ripe fruit promptly. Collect & destroy fallen fruit daily. Export requires intensive trapping protocol.',
    advisorySnippetSW: 'AgriGuard: Dhibiti inzi wa matunda kwa kutumia mitego ya kinywaji cha protini + dawa za GF-120. Vuna matunda mbivu haraka. Kusanya na kuharibu matunda yaliyoanguka kila siku. Usafirishaji unahitaji mpango mkali wa mitego.',
    
    fieldPhotos: [
      { title: 'Adult Fruit Fly', description: 'Mediterranean fruit fly or other pest species', stage: 'Identification' },
      { title: 'Oviposition Sting', description: 'Small puncture mark where female laid eggs', stage: 'Early Damage' },
      { title: 'Larvae in Fruit', description: 'White maggots tunneling through fruit flesh', stage: 'Severe Damage' },
      { title: 'Trapping System', description: 'McPhail trap with protein bait attractant', stage: 'Monitoring' },
    ],
    
    ipmLadder: {
      level1: {
        title: 'Level 1: Cultural & Sanitation',
        icon: 'cultural',
        status: 'open',
        practices: [
          { name: 'Fruit Sanitation', description: 'Collect all fallen fruit daily and destroy (bury >50cm deep or place in sealed plastic bags in sun for 1 week). This breaks the fly life cycle.', frequency: 'Daily during fruiting season', effectiveness: 'Very High' },
          { name: 'Timely Harvest', description: 'Harvest fruit at correct maturity. Do not leave over-ripe fruit on trees as this attracts fruit flies.', frequency: 'Per harvest schedule', effectiveness: 'High' },
          { name: 'Area-Wide Coordination', description: 'Coordinate with neighboring farms for synchronized control. Fruit flies travel 5-10 km, requiring community approach.', frequency: 'Seasonal planning', effectiveness: 'Very High' },
        ],
      },
      level2: {
        title: 'Level 2: Trapping & Bait Sprays',
        icon: 'biological',
        status: 'open',
        practices: [
          { name: 'Protein Bait Traps (McPhail or Similar)', description: 'Deploy traps with hydrolyzed protein attractant at 4-8 traps per hectare. Monitor weekly and replace bait every 2 weeks.', frequency: 'Weekly monitoring', effectiveness: 'High', supplier: 'ICIPE or certified suppliers' },
          { name: 'GF-120 Bait Sprays (Spinosad + Protein)', description: 'Spot-spray bait mixture on tree canopy (NOT entire tree). Flies feed on bait and die. Organically approved. Very effective.', frequency: 'Every 7-10 days', effectiveness: 'Very High', supplier: 'Certified agro-dealers' },
          { name: 'Male Annihilation Technique (MAT)', description: 'Use methyl eugenol or cue-lure traps to mass-trap male fruit flies. Reduces mating potential in orchard.', frequency: 'Ongoing during season', effectiveness: 'High', supplier: 'ICIPE or export pack-houses' },
        ],
      },
      level3: {
        title: 'Level 3: Chemical Controls (GATED)',
        icon: 'chemical',
        status: 'gated',
        warning: 'Cover sprays are rarely recommended due to resistance, environmental impact, and PHI constraints. Bait sprays (Level 2) are far more effective.',
        practices: [
          { name: 'Dimethoate (e.g., Rogor 400 EC)', description: 'Organophosphate insecticide for spot-spray bait applications only. NOT for full canopy sprays. High resistance risk.', phi: '21 days', applicationRate: '150ml per 100L water + protein bait', maxApplications: '2 per season', resistance: 'Very High', registrationStatus: 'PCPB Registered (Restricted)', warning: 'BANNED in EU export markets. Use only for local market fruit.' },
          { name: 'Lambda-cyhalothrin + Protein Bait', description: 'Pyrethroid mixed with protein bait for spot applications. Longer residual than dimethoate but still has resistance issues.', phi: '14 days', applicationRate: '50ml per 100L water + bait', maxApplications: '3 per season', resistance: 'High', registrationStatus: 'PCPB Registered' },
        ],
      },
    },
    
    identificationSigns: [
      'Small puncture marks (oviposition stings) on fruit skin',
      'Soft, rotting areas on maturing fruit',
      'White maggots visible when cutting open infested fruit',
      'Premature fruit drop',
      'Adult flies visible around ripe or damaged fruit',
    ],
    
    lifeCycle: 'Female fruit flies lay eggs in ripening fruit. Larvae (maggots) hatch in 2-3 days and feed on fruit flesh for 7-10 days before dropping to soil to pupate. Adults emerge after 10-14 days. Full cycle takes 25-35 days. Multiple overlapping generations occur year-round in Kenya.',
    
    economicImpact: 'Fruit fly infestation results in 100% rejection for export markets due to zero-tolerance quarantine regulations. Losses include entire shipment value (KES 150-200 per kg) and potential market suspension. Effective IPM programs cost KES 15,000-25,000 per hectare per season but are mandatory for export certification.',
  },
  'KB-033': {
    id: 'KB-033',
    title: 'Post-Harvest Disease Control',
    category: 'Disease Management',
    tags: ['Post-Harvest', 'Storage', 'Quality'],
    lastUpdated: 'Feb 12, 2026',
    views: 671,
    severity: 'medium',
    activeUses: 12,
    approvedContent: true,
    ussdCode: null,
    chemicalGate: 'gated',
    ipmLevel: 3,
    
    advisorySnippetEN: 'AgriGuard: Prevent post-harvest rot with hot water treatment (50°C, 20min), gentle handling, rapid cooling, and proper storage (5-8°C). Inspect for anthracnose and stem-end rot.',
    advisorySnippetSW: 'AgriGuard: Zuia kuoza baada ya kuvuna kwa matibabu ya maji ya moto (50°C, dakika 20), ushikaji wa upole, ubaridi wa haraka, na uhifadhi sahihi (5-8°C). Kagua anthracnose na kuoza kwa ncha ya shina.',
    
    fieldPhotos: [
      { title: 'Stem-End Rot', description: 'Black rot starting at stem attachment point', stage: 'Identification' },
      { title: 'Body Rot (Anthracnose)', description: 'Brown-black lesions spreading across fruit body', stage: 'Identification' },
      { title: 'Hot Water Treatment Tank', description: 'Commercial setup for pathogen kill', stage: 'Prevention' },
      { title: 'Cold Chain Storage', description: 'Proper temperature-controlled storage room', stage: 'Prevention' },
    ],
    
    ipmLadder: {
      level1: {
        title: 'Level 1: Handling & Physical Controls',
        icon: 'cultural',
        status: 'open',
        practices: [
          { name: 'Gentle Handling', description: 'Avoid dropping, pressing, or bruising fruit. All wounds become infection sites. Use padded crates and careful handling throughout chain.', frequency: 'Every handling step', effectiveness: 'Very High' },
          { name: 'Hot Water Treatment', description: 'Dip fruit in 50°C water for exactly 20 minutes within 8 hours of harvest. Kills surface pathogens and insects. Gold standard for export.', frequency: 'Every harvest batch', effectiveness: 'Very High' },
          { name: 'Rapid Cooling', description: 'Cool fruit to 5-8°C within 24 hours of harvest. Cold temperatures slow pathogen development and fruit ripening.', frequency: 'Post-harvest', effectiveness: 'High' },
          { name: 'Proper Storage Conditions', description: 'Store at 5-8°C with 85-90% relative humidity. Monitor with data loggers. Maintain cold chain during transport.', frequency: 'Continuous', effectiveness: 'Very High' },
        ],
      },
      level2: {
        title: 'Level 2: Biological & Low-Risk Treatments',
        icon: 'biological',
        status: 'open',
        practices: [
          { name: 'Bacillus subtilis Treatment', description: 'Apply beneficial bacteria before storage. Colonizes fruit surface and inhibits fungal pathogens. OMRI-approved for organic.', frequency: 'Pre-storage', effectiveness: 'Medium-High', supplier: 'Bio-pesticide suppliers' },
          { name: 'Modified Atmosphere Packaging (MAP)', description: 'Pack fruit in films that create CO2-enriched atmosphere. Slows ripening and pathogen growth. Export standard.', frequency: 'For export shipments', effectiveness: 'High', supplier: 'Packaging suppliers' },
          { name: '1-MCP Treatment (SmartFresh)', description: 'Ethylene inhibitor that delays ripening and extends shelf life. Requires sealed chambers. Export pack-houses only.', frequency: 'For long-distance export', effectiveness: 'Very High', supplier: 'Export pack-houses' },
        ],
      },
      level3: {
        title: 'Level 3: Chemical Treatments (GATED)',
        icon: 'chemical',
        status: 'gated',
        warning: 'Post-harvest fungicides must have zero MRL (Maximum Residue Limit) violations for export markets. Agronomist approval required.',
        practices: [
          { name: 'Prochloraz Dip/Spray (e.g., Sportak)', description: 'Post-harvest fungicide for anthracnose and stem-end rot control. Apply as dip (30 seconds) or spray. EU-approved at low rates.', phi: 'Post-harvest only', applicationRate: '1ml per 1L water (dip)', maxApplications: '1 per batch', resistance: 'Medium risk', registrationStatus: 'PCPB Registered (Post-harvest)' },
          { name: 'Thiabendazole (TBZ) Wax', description: 'Fungicide incorporated into fruit wax coating. Effective against storage rots but has MRL restrictions in some markets.', phi: 'Post-harvest only', applicationRate: 'As per wax formulation', maxApplications: '1 per batch', resistance: 'High risk', registrationStatus: 'PCPB Registered', warning: 'Check destination market MRL limits before use.' },
        ],
      },
    },
    
    identificationSigns: [
      'Stem-end rot: dark brown to black decay starting at stem attachment',
      'Anthracnose body rot: circular lesions that expand during ripening',
      'Soft, watery breakdown of fruit tissue',
      'Off-odors from bacterial or fungal growth',
      'Premature over-ripening during storage',
    ],
    
    lifeCycle: 'Most post-harvest diseases (anthracnose, stem-end rot, Botryosphaeria) infect fruit in the field but remain dormant until ripening. Temperature abuse, handling wounds, and extended storage allow latent infections to develop into visible rot. Proper cold chain breaks this cycle.',
    
    economicImpact: 'Post-harvest losses of 15-30% are common without proper handling and treatment, representing KES 30,000-60,000 loss per hectare for export-grade fruit. Hot water treatment and cold storage infrastructure require initial investment (KES 500,000-2 million) but reduce losses by 70-90% and are mandatory for export certification.',
  },
  'KB-035': {
    id: 'KB-035',
    title: 'False Codling Moth Management',
    category: 'Pest Management',
    tags: ['False Codling Moth', 'Quarantine Pest', 'Trapping'],
    lastUpdated: 'Feb 10, 2026',
    views: 845,
    severity: 'high',
    activeUses: 23,
    approvedContent: true,
    ussdCode: '107',
    chemicalGate: 'gated',
    ipmLevel: 3,
    
    advisorySnippetEN: 'AgriGuard: Control false codling moth with pheromone traps (2-4/ha), fruit sanitation, and GF-120 bait sprays. This is a quarantine pest - zero tolerance for export. Report outbreaks immediately.',
    advisorySnippetSW: 'AgriGuard: Dhibiti nondo wa parachichi kwa mitego ya pheromone (2-4/ha), usafi wa matunda, na dawa za GF-120. Hii ni wadudu wa karantini - hakuna uvumilivu kwa usafirishaji. Ripoti mlipuko mara moja.',
    
    fieldPhotos: [
      { title: 'Larva in Fruit', description: 'Pink-white caterpillar tunneling in avocado fruit', stage: 'Identification' },
      { title: 'Entry Hole', description: 'Small hole in fruit skin with frass (excrement)', stage: 'Damage' },
      { title: 'Pheromone Trap', description: 'Delta trap with FCM lure for monitoring', stage: 'Monitoring' },
      { title: 'Fruit Infestation', description: 'Multiple fruits showing FCM damage', stage: 'Outbreak' },
    ],
    
    ipmLadder: {
      level1: {
        title: 'Level 1: Monitoring & Sanitation',
        icon: 'cultural',
        status: 'open',
        practices: [
          { name: 'Pheromone Trap Monitoring', description: 'Deploy 2-4 pheromone traps per hectare. Check weekly and record moth captures. Action threshold: >2 moths per trap per week.', frequency: 'Weekly monitoring', effectiveness: 'Very High (detection)' },
          { name: 'Fruit Sanitation', description: 'Remove ALL fallen and damaged fruit immediately. Larvae pupate in fallen fruit. Bury >50cm or solar-sterilize in sealed bags.', frequency: 'Daily', effectiveness: 'Very High' },
          { name: 'Harvest Timing', description: 'Harvest fruit at correct maturity. Over-ripe fruit on trees is highly attractive to FCM females for egg-laying.', frequency: 'Per harvest cycle', effectiveness: 'High' },
        ],
      },
      level2: {
        title: 'Level 2: Mating Disruption & Bait Sprays',
        icon: 'biological',
        status: 'open',
        practices: [
          { name: 'Mating Disruption (Pheromone Dispensers)', description: 'Deploy pheromone dispensers at 400-1000 per hectare. Saturates orchard with female pheromone, preventing males from finding females. Export standard.', frequency: 'Replace every 12 weeks', effectiveness: 'Very High', supplier: 'ICIPE or Russell IPM' },
          { name: 'GF-120 Bait Sprays (Spinosad)', description: 'Protein bait with spinosad. Spot-spray tree canopy (1-2 m² per tree). Attracts and kills adult moths before egg-laying.', frequency: 'Weekly during peak season', effectiveness: 'High', supplier: 'Certified agro-dealers' },
          { name: 'Sterile Insect Technique (SIT)', description: 'Release of sterile male moths to suppress wild populations. Area-wide program coordinated by ICIPE. Contact for enrollment.', frequency: 'Weekly releases', effectiveness: 'Very High', supplier: 'ICIPE SIT program' },
        ],
      },
      level3: {
        title: 'Level 3: Chemical Controls (GATED)',
        icon: 'chemical',
        status: 'gated',
        warning: 'Chemical control is difficult because larvae are inside fruit. Foliar sprays target egg-laying adults and young larvae only. Strict PHI enforcement required.',
        practices: [
          { name: 'Indoxacarb (e.g., Steward 300 SC)', description: 'Oxadiazine insecticide effective against Lepidoptera larvae. Apply when trap catches exceed threshold or fruit damage is detected.', phi: '14 days', applicationRate: '40ml per 20L water', maxApplications: '2 per season', resistance: 'Medium risk', registrationStatus: 'PCPB Registered' },
          { name: 'Chlorantraniliprole (e.g., Ampligo)', description: 'Diamide insecticide with long residual. Targets egg and early larval stages. Lower risk to beneficial insects.', phi: '7 days', applicationRate: '30ml per 20L water', maxApplications: '2 per season', resistance: 'Low-Medium risk', registrationStatus: 'PCPB Registered' },
        ],
      },
    },
    
    identificationSigns: [
      'Small entry holes in fruit skin (2-3mm diameter)',
      'Brown frass (excrement) at entry point or inside fruit',
      'Pink-white caterpillars (up to 15mm long) tunneling through fruit flesh',
      'Internal fruit damage not visible from outside until cutting',
      'Premature fruit drop',
    ],
    
    lifeCycle: 'False codling moth (Thaumatotibia leucotreta) completes 4-7 generations per year in Kenya. Females lay eggs on fruit surface. Larvae hatch in 4-7 days and bore into fruit immediately. Feeding lasts 14-28 days. Mature larvae exit fruit and pupate in soil or on tree bark. Adults emerge after 10-20 days. Populations peak during warm, dry periods.',
    
    economicImpact: 'FCM is a quarantine pest for EU, USA, and Asian markets. Detection of a single larva in export consignments results in shipment rejection and potential market suspension. Economic impact includes lost export value (KES 150-200 per kg), market closure costs, and mandatory intensive monitoring (KES 30,000-50,000 per hectare per season). IPM programs with mating disruption cost KES 40,000-80,000/ha but are essential for export certification.',
  },
  'KB-047': {
    id: 'KB-047',
    title: 'Nutrient Deficiency Diagnosis',
    category: 'Crop Nutrition',
    tags: ['Nutrition', 'Deficiency', 'Fertilization'],
    lastUpdated: 'Jan 30, 2026',
    views: 723,
    severity: 'low',
    activeUses: 8,
    approvedContent: true,
    ussdCode: null,
    chemicalGate: 'open',
    ipmLevel: 1,
    
    advisorySnippetEN: 'AgriGuard: Diagnose nutrient deficiencies through leaf symptoms and soil/tissue tests. Common issues: Nitrogen (yellowing), Zinc (small leaves), Iron (interveinal chlorosis). Correct with targeted fertilization.',
    advisorySnippetSW: 'AgriGuard: Tambua upungufu wa virutubishi kupitia dalili za majani na vipimo vya udongo/tishu. Matatizo ya kawaida: Nitrojeni (kuningʼara), Zinc (majani madogo), Chuma (kuningʼara kati ya mishipa). Rekebisha kwa mbolea maalum.',
    
    fieldPhotos: [
      { title: 'Nitrogen Deficiency', description: 'Pale yellow-green leaves, especially older leaves', stage: 'Diagnosis' },
      { title: 'Zinc Deficiency', description: 'Small, narrow leaves with mottled appearance', stage: 'Diagnosis' },
      { title: 'Iron Deficiency', description: 'Yellowing between leaf veins (interveinal chlorosis)', stage: 'Diagnosis' },
      { title: 'Healthy Foliage', description: 'Normal dark green leaves for comparison', stage: 'Reference' },
    ],
    
    ipmLadder: {
      level1: {
        title: 'Level 1: Diagnosis & Testing',
        icon: 'cultural',
        status: 'open',
        practices: [
          { name: 'Visual Symptom Diagnosis', description: 'Identify deficiency patterns: Mobile nutrients (N, P, K) show symptoms in old leaves first. Immobile nutrients (Fe, Zn, Ca) affect young growth.', frequency: 'Monthly scouting', effectiveness: 'Medium (screening)' },
          { name: 'Soil Testing', description: 'Collect soil samples (0-30cm depth) and analyze for pH, macronutrients, and micronutrients. Test every 2-3 years or when problems arise.', frequency: 'Every 2-3 years', effectiveness: 'Very High' },
          { name: 'Leaf Tissue Analysis', description: 'Sample mature leaves (4-6 months old) from non-fruiting terminals. Most accurate diagnostic tool. Send to certified lab.', frequency: 'Annually or when deficiency suspected', effectiveness: 'Very High' },
        ],
      },
      level2: {
        title: 'Level 2: Soil Amendments & Fertilization',
        icon: 'biological',
        status: 'open',
        practices: [
          { name: 'Nitrogen Application (Urea or CAN)', description: 'Split applications of 200-400g per tree per year based on tree age and yield. Apply in 3-4 splits during growing season.', frequency: '3-4 times per year', effectiveness: 'High', supplier: 'Certified agro-dealers' },
          { name: 'Zinc Foliar Sprays', description: 'Apply zinc sulfate at 0.3% (300g per 100L water) as foliar spray. Zinc deficiency is common in alkaline soils (pH >7).', frequency: '2-3 applications per season', effectiveness: 'Very High', supplier: 'Agro-input shops' },
          { name: 'Iron Chelate Application', description: 'For iron deficiency on high pH soils, apply Fe-EDDHA chelate to soil or as foliar spray. Adjust soil pH long-term with sulfur.', frequency: 'As needed', effectiveness: 'High', supplier: 'Specialty fertilizer suppliers' },
          { name: 'Organic Matter Addition', description: 'Apply compost or well-rotted manure (30-50kg per tree annually). Improves nutrient availability and soil biology.', frequency: 'Annually', effectiveness: 'Medium-High', supplier: 'On-farm or suppliers' },
        ],
      },
      level3: {
        title: 'Level 3: Advanced Nutrition Management',
        icon: 'chemical',
        status: 'open',
        practices: [
          { name: 'Fertigation Programs', description: 'Inject water-soluble fertilizers through drip irrigation system. Allows precise nutrient delivery matched to crop demand.', frequency: 'Weekly during growing season', effectiveness: 'Very High', supplier: 'Fertigation specialists' },
          { name: 'Foliar Nutrient Sprays (Complete)', description: 'Apply foliar fertilizers containing N, P, K plus micronutrients. Rapid correction of multiple deficiencies.', frequency: 'Monthly during active growth', effectiveness: 'High', supplier: 'Agro-input dealers' },
          { name: 'Soil pH Adjustment', description: 'Lower high pH with elemental sulfur (200-500g per tree). Raise low pH with lime. Target pH 6.0-6.5 for optimal nutrient availability.', frequency: 'As needed (annual monitoring)', effectiveness: 'Very High', supplier: 'Agro-dealers' },
        ],
      },
    },
    
    identificationSigns: [
      'Nitrogen: Pale yellow-green leaves, starting with older leaves; reduced growth',
      'Phosphorus: Dark green or purplish leaves; stunted growth; poor fruit set',
      'Potassium: Leaf margin necrosis (burn); poor fruit quality',
      'Zinc: Small, narrow leaves in rosette patterns; mottled chlorosis',
      'Iron: Interveinal chlorosis (yellowing between veins) on young leaves',
      'Calcium: Tip burn on young leaves; bitter pit in fruit',
    ],
    
    lifeCycle: 'Nutrient deficiencies develop when soil availability is low, root uptake is impaired (due to poor drainage, root disease, or pH), or crop demand exceeds supply during high-growth periods. Mobile nutrients (N, P, K, Mg) are translocated from old to young tissue, so symptoms appear on older leaves first. Immobile nutrients (Fe, Zn, Ca, B) cannot move, so symptoms appear on new growth.',
    
    economicImpact: 'Nutrient deficiencies reduce yields by 20-50% and fruit quality (size, oil content, shelf life). Nitrogen deficiency can reduce yields by 30-40%. Zinc deficiency causes small fruit (30-50% size reduction) with low oil content, reducing marketability. Soil testing (KES 3,000-8,000) and targeted fertilization (KES 20,000-40,000 per hectare) provide ROI of 3-5x through yield and quality improvements.',
  },
  'KB-051': {
    id: 'KB-051',
    title: 'Trunk Disease Management',
    category: 'Disease Management',
    tags: ['Canker', 'Trunk Rot', 'Dothiorella'],
    lastUpdated: 'Jan 25, 2026',
    views: 456,
    severity: 'medium',
    activeUses: 7,
    approvedContent: true,
    ussdCode: null,
    chemicalGate: 'gated',
    ipmLevel: 3,
    
    advisorySnippetEN: 'AgriGuard: Manage trunk cankers by removing affected bark, applying copper-based wound dressings, and avoiding mechanical damage. Prune out infected branches. Severe cases may require tree removal.',
    advisorySnippetSW: 'AgriGuard: Simamia makovu ya shina kwa kuondoa gome lililoathirika, kuweka dawa za shaba kwenye majeraha, na kuepuka uharibifu wa mitambo. Kata matawi yaliyoambukizwa. Matukio makubwa yanaweza kuhitaji kuondoa mti.',
    
    fieldPhotos: [
      { title: 'Trunk Canker', description: 'Sunken dark lesion on trunk with gum exudate', stage: 'Identification' },
      { title: 'Dothiorella Canker', description: 'Bark cracking and peeling around infection site', stage: 'Advanced Stage' },
      { title: 'Branch Dieback', description: 'Dead branches from vascular blockage', stage: 'Systemic Infection' },
      { title: 'Surgical Removal', description: 'Cutting away diseased tissue to healthy wood', stage: 'Treatment' },
    ],
    
    ipmLadder: {
      level1: {
        title: 'Level 1: Prevention & Sanitation',
        icon: 'cultural',
        status: 'open',
        practices: [
          { name: 'Avoid Mechanical Damage', description: 'Protect trunks from mower, weed-whacker, and implement damage. Wounds are primary infection sites for Dothiorella and other trunk pathogens.', frequency: 'Ongoing', effectiveness: 'Very High' },
          { name: 'Proper Pruning Techniques', description: 'Make clean pruning cuts. Remove stubs which die back and invite trunk rot pathogens. Prune during dry weather.', frequency: 'As needed', effectiveness: 'High' },
          { name: 'Tree Vigor Maintenance', description: 'Maintain tree health through proper nutrition and irrigation. Stressed trees are more susceptible to opportunistic trunk pathogens.', frequency: 'Ongoing', effectiveness: 'Medium-High' },
        ],
      },
      level2: {
        title: 'Level 2: Surgical & Physical Controls',
        icon: 'biological',
        status: 'open',
        practices: [
          { name: 'Canker Excision', description: 'Cut away all diseased bark and wood until healthy tissue (green cambium) is visible. Use sharp, sterilized tools. Shape excision to promote drainage.', frequency: 'As soon as detected', effectiveness: 'High', supplier: 'Farm implements' },
          { name: 'Wound Dressing Application', description: 'Apply copper-based or bordeaux paste to exposed wood. Prevents re-infection and desiccation. Some debate on effectiveness - main benefit is waterproofing.', frequency: 'After excision', effectiveness: 'Medium', supplier: 'Agro-input dealers' },
          { name: 'Branch Removal', description: 'Prune out branches showing dieback from vascular infection. Cut 30cm below visible symptoms into healthy wood.', frequency: 'When symptoms appear', effectiveness: 'High', supplier: 'Farm tools' },
        ],
      },
      level3: {
        title: 'Level 3: Chemical Treatments (GATED)',
        icon: 'chemical',
        status: 'gated',
        warning: 'Fungicides have limited effectiveness against established trunk cankers. Focus on prevention and surgical removal. Systemic fungicides may help in early stages.',
        practices: [
          { name: 'Copper Hydroxide Trunk Sprays', description: 'Preventive trunk sprays during wet season can reduce new infections. Apply to trunk and main scaffold branches.', phi: 'Not applicable (trunk treatment)', applicationRate: '50g per 20L water', maxApplications: '4 per year', resistance: 'No resistance', registrationStatus: 'PCPB Registered' },
          { name: 'Phosphite Trunk Injections', description: 'Inject phosphite into trunk to boost systemic resistance. More effective for Phytophthora trunk canker than Dothiorella.', phi: 'Not applicable', applicationRate: 'Per product label', maxApplications: '2 per year', resistance: 'No resistance', registrationStatus: 'PCPB Registered' },
        ],
      },
    },
    
    identificationSigns: [
      'Sunken, dark cankers on trunk or main branches',
      'Bark cracking, peeling, or gum exudation at infection sites',
      'White fungal growth under bark (Dothiorella)',
      'Branch dieback above canker location',
      'Reduced vigor, wilting, or tree decline',
      'Orange-brown staining of wood beneath bark',
    ],
    
    lifeCycle: 'Trunk canker pathogens (Dothiorella, Botryosphaeria, Phomopsis, Phytophthora) are opportunistic fungi that infect through wounds or weak points. Spores spread by rain splash and wind. Infections are often latent (dormant) in healthy trees and become active when trees are stressed by drought, poor nutrition, or root damage. Disease progresses slowly over months to years.',
    
    economicImpact: 'Trunk cankers cause progressive tree decline over 2-5 years, with yield reductions of 30-60% before tree death. Severe infections may require tree removal and replacement (KES 15,000-25,000 per tree including labor). Early detection and surgical treatment can save 60-80% of affected trees if caught before girdling or vascular blockage occurs.',
  },
};