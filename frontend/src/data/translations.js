// ================================================================
// RoadWatch — Multilingual Translation Strings
// Supported: en (English), te (Telugu), hi (Hindi), ta (Tamil)
// ================================================================

export const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'te', label: 'TE', name: 'తెలుగు' },
  { code: 'hi', label: 'HI', name: 'हिंदी' },
  { code: 'ta', label: 'TA', name: 'தமிழ்' },
];

// Quick reply helpers — non-English QRs are {label, cmd} objects
// English QRs remain plain strings (backward-compatible with intent engine)
export function getQrLabel(qr) { return typeof qr === 'string' ? qr : qr.label; }
export function getQrCmd(qr)   { return typeof qr === 'string' ? qr : qr.cmd;   }

// ----------------------------------------------------------------
const STRINGS = {

  // ==============================================================
  en: {
    // App tabs
    tabAssistant: 'Assistant',
    tabMap: 'Live Map',
    tabComplaints: 'My Cases',

    // ChatWindow header
    chatHeaderTitle: 'RoadWatch AI',
    chatHeaderSubtitle: 'Civic Transparency Agent',
    inputPlaceholder: 'Type your road query…',
    inputHint: 'Try: "road info NH-65" · "budget SH-1" · "report pothole" · "track #RW-2044"',
    countryBadge: 'Adding a new country = 1 JSON config file',

    // Welcome message
    welcomeText: 'Namaste! 🙏 I am RoadWatch — your civic road assistant.\n\nAsk me about any road, check budget transparency, report a pothole, or track a complaint.',

    // Bot response text (before cards)
    botRoadInfo: 'Here are the details for **{name}**:',
    botBudget: "Here's the budget breakdown for **{name}**:",
    botReport: 'Got it! Fill in the details below to file your complaint:',
    botTrack: "Here's the current status for **{id}**:",
    botNotFound: 'Road not found in our database — you can still file a complaint and it will be manually reviewed.',
    botDefault: 'I couldn\'t detect a specific intent in "{text}". Try asking about road info, budget, reporting an issue, or tracking a complaint.',

    // Quick replies (plain strings — sent directly to intent engine)
    qrDefault:  ['Road info on NH-65', 'Budget for SH-4', 'Report a pothole', 'Urban road info'],
    qrRoadInfo: ['Check its budget →', 'Report an issue here', 'Track a complaint'],
    qrBudget:   ['View road details →', 'Report overdue repair', 'Compare with NH-65'],
    qrReport:   ['Track my complaint', 'Report another issue', 'View road details →'],
    qrTrack:    ['File a new complaint', 'Escalate this issue', 'View road details →'],
    qrNotFound: ['Report an issue here', 'Try NH-65', 'Try SH-1'],

    // Onboarding tour
    onboardingStep1Title: 'Ask about any road →',
    onboardingStep1Body:  'Type a road name, number, or district. Try "road info NH-65" or "budget SH-1".',
    onboardingStep2Title: "See who's responsible →",
    onboardingStep2Body:  'Every road query shows the exact Executive Engineer, their email & complaint portal — auto-routed by law.',
    onboardingStep3Title: 'File a complaint in 30 seconds →',
    onboardingStep3Body:  'Say "report pothole" — attach a photo, detect GPS, choose defect type, and submit. Works offline too.',
    onboardingSkip:   'Skip tour',
    onboardingGotIt:  '✓ Got it!',
    onboardingNext:   'Next {n}/{total}',
    onboardingArrow1: 'Chat input below',
    onboardingArrow2: 'Appears in chat',
    onboardingArrow3: 'Try it in chat',

    // ReportIssueCard
    reportTitle:          'Report Road Issue',
    reportStep1Sub:       'Fill in the details below',
    reportStep2Sub:       'Complaint filed & routed successfully',
    reportStep2SubOffline:'Queued for sync',
    reportStepBadge:      'Step {n}/2',
    reportPhotoLabel:     'Photo Evidence',
    reportPhotoBtn:       'Tap to attach photo',
    reportPhotoAttached:  'photo_evidence.jpg attached',
    reportGpsLabel:       'GPS Location',
    reportGpsBtn:         'Detect my GPS location',
    reportGpsDetecting:   'Detecting…',
    reportDefectLabel:    'Defect Type',
    reportDefectPlaceholder: 'Select defect type…',
    reportSubmitBtn:      'Submit Complaint',
    reportSuccessId:      '{id} filed!',
    reportOfflineId:      '{id} saved offline',
    reportSuccessDesc:    'Complaint registered & auto-routed below',
    reportOfflineDesc:    'Saved offline — will sync when connected',
    reportRoutingLabel:   'Routing complaint to:',
    reportEscalation:     'Escalation to {name} if unresolved in 30 days.',
    reportOfficialPortal: 'Official Portal',
    defects: ['Pothole', 'Crack', 'Waterlogging', 'Road Cave-in', 'Missing Signage'],

    // MyComplaints
    complaintsTitle:       'My Complaints',
    complaintsTotalStat:   '{total} total · {resolved} resolved',
    complaintsStatFiled:   'Filed',
    complaintsStatResolved:'Resolved',
    complaintsStatOverdue: 'Overdue',
    complaintsPendingSync: 'Pending Sync ({n})',
    complaintsAllLabel:    'All Complaints',
    complaintsEmpty:       'No complaints filed yet',
    complaintsEmptyHint:   'Go to the chatbot and say\n"report pothole" to file your first one',
    complaintsEmptyCTA:    'Switch to Assistant tab',
    complaintsFiled:       'Filed:',
    complaintsOverdueBadge:'· OVERDUE',

    // Stage labels (shared between MyComplaints + TrackComplaintCard)
    stageFiled:       'Filed',
    stageUnderReview: 'Under Review',
    stageResolved:    'Resolved',

    // RoadInfoCard
    roadInfoLastRelaid:         'Last Relaid',
    roadInfoContractor:         'Contractor',
    roadInfoMaintenanceHistory: 'Maintenance History',
    roadInfoSource:             'Source',

    // BudgetCard
    budgetSanctioned:      'Sanctioned',
    budgetDisbursed:       'Disbursed',
    budgetUtilisation:     'Utilisation',
    budgetUtilisationPct:  '{pct}% used',
    budgetOverdueAlert:    'Overdue Alert',
    budgetAccidents:       '{count} accidents',
    budgetAccidentsSuffix: 'reported on this stretch',

    // TrackComplaintCard
    trackOverdue:    'OVERDUE',
    trackOnTrack:    'ON TRACK',
    trackExpectedBy: 'Expected By',
    trackElapsed:    'Elapsed',
    trackAuthority:  'Authority',
    trackElapsedDays:'  {n} days',
    trackOverdueBy:  'Overdue by {n} days.',
    trackEscalate:   'Escalate to {name}.',

    // Not found card
    notFoundTitle: 'Road not in database',
    notFoundDesc:  'Generic Executive Engineer assigned for manual review:',

    // MapView
    mapFilters:      'Map Filters',
    mapShow:         'Show',
    mapHide:         'Hide',
    mapAllDistricts: 'All Districts',
    mapAllTypes:     'All Road Types',
    mapAllConditions:'All Conditions',
    mapCondGood:     'Good (<3 years)',
    mapCondDue:      'Due (3-5 years)',
    mapCondOverdue:  'Overdue (>5 years or flagged)',
    mapLegend3yr:    '<3yr',
    mapLegend5yr:    '3–5yr',
    mapLegendFlag:   '>5yr / Flag',
  },

  // ==============================================================
  te: {
    tabAssistant:  'మార్గదర్శి',
    tabMap:        'లైవ్ మ్యాప్',
    tabComplaints: 'నా కేసులు',

    chatHeaderTitle:    'రోడ్‌వాచ్ AI',
    chatHeaderSubtitle: 'పౌర పారదర్శకత సేవకుడు',
    inputPlaceholder:   'మీ రహదారి ప్రశ్న టైప్ చేయండి…',
    inputHint:          'ప్రయత్నించండి: "road info NH-65" · "budget SH-1" · "report pothole"',
    countryBadge:       'కొత్త దేశం జోడించడం = 1 JSON ఫైల్',

    welcomeText: 'నమస్కారం! 🙏 నేను రోడ్‌వాచ్ — మీ పౌర రహదారి సహాయకుడను.\n\nఏదైనా రహదారి గురించి అడగండి, బడ్జెట్ పారదర్శకత చెక్ చేయండి, గుంత నివేదించండి, లేదా ఫిర్యాదు ట్రాక్ చేయండి.',

    botRoadInfo:  '**{name}** వివరాలు ఇవిగో:',
    botBudget:    '**{name}** బడ్జెట్ వివరాలు:',
    botReport:    'సరే! ఫిర్యాదు దాఖలు చేయడానికి వివరాలు పూరించండి:',
    botTrack:     '**{id}** ప్రస్తుత స్థితి:',
    botNotFound:  'మా డేటాబేస్‌లో రహదారి కనుగొనబడలేదు — మీరు ఇప్పటికీ ఫిర్యాదు దాఖలు చేయవచ్చు, అది మాన్యువల్‌గా సమీక్షించబడుతుంది.',
    botDefault:   '"{text}" లో నిర్దిష్ట ఉద్దేశ్యం గుర్తించలేకపోయాను. రహదారి సమాచారం, బడ్జెట్, సమస్య నివేదించడం లేదా ఫిర్యాదు ట్రాక్ చేయడం ప్రయత్నించండి.',

    qrDefault: [
      { label: 'NH-65 రహదారి సమాచారం', cmd: 'Road info on NH-65' },
      { label: 'SH-4 బడ్జెట్',         cmd: 'Budget for SH-4' },
      { label: 'గుంత నివేదించండి',      cmd: 'Report a pothole' },
      { label: 'పట్టణ రహదారి సమాచారం', cmd: 'Urban road info' },
    ],
    qrRoadInfo: [
      { label: 'బడ్జెట్ చెక్ చేయండి →', cmd: 'Check its budget' },
      { label: 'సమస్య నివేదించండి',      cmd: 'Report an issue here' },
      { label: 'ఫిర్యాదు ట్రాక్ చేయండి', cmd: 'Track a complaint' },
    ],
    qrBudget: [
      { label: 'రహదారి వివరాలు →',                cmd: 'View road details' },
      { label: 'గడువు మించిన మరమ్మత్తు నివేదించండి', cmd: 'Report overdue repair' },
      { label: 'NH-65తో పోల్చండి',              cmd: 'Compare with NH-65' },
    ],
    qrReport: [
      { label: 'నా ఫిర్యాదు ట్రాక్ చేయండి',  cmd: 'Track my complaint' },
      { label: 'మరొక సమస్య నివేదించండి',      cmd: 'Report another issue' },
      { label: 'రహదారి వివరాలు →',             cmd: 'View road details' },
    ],
    qrTrack: [
      { label: 'కొత్త ఫిర్యాదు దాఖలు',  cmd: 'File a new complaint' },
      { label: 'సమస్య ఎస్కలేట్ చేయండి', cmd: 'Escalate this issue' },
      { label: 'రహదారి వివరాలు →',       cmd: 'View road details' },
    ],
    qrNotFound: [
      { label: 'సమస్య నివేదించండి',     cmd: 'Report an issue here' },
      { label: 'NH-65 ప్రయత్నించండి',  cmd: 'Try NH-65' },
      { label: 'SH-1 ప్రయత్నించండి',   cmd: 'Try SH-1' },
    ],

    onboardingStep1Title: 'ఏదైనా రహదారి గురించి అడగండి →',
    onboardingStep1Body:  '"road info NH-65" లేదా "budget SH-1" ప్రయత్నించండి.',
    onboardingStep2Title: 'బాధ్యులెవరో చూడండి →',
    onboardingStep2Body:  'ప్రతి రహదారి ప్రశ్న సరైన ఎగ్జిక్యూటివ్ ఇంజినీర్, వారి ఇమెయిల్ & ఫిర్యాదు పోర్టల్ చూపిస్తుంది.',
    onboardingStep3Title: '30 సెకన్లలో ఫిర్యాదు దాఖలు చేయండి →',
    onboardingStep3Body:  '"report pothole" అనండి — ఫోటో జతచేయండి, GPS గుర్తించండి, సమర్పించండి. ఆఫ్‌లైన్‌లో కూడా పని చేస్తుంది.',
    onboardingSkip:   'పర్యటన దాటండి',
    onboardingGotIt:  '✓ అర్థమైంది!',
    onboardingNext:   'తదుపరి {n}/{total}',
    onboardingArrow1: 'క్రింద చాట్ ఇన్‌పుట్',
    onboardingArrow2: 'చాట్‌లో కనిపిస్తుంది',
    onboardingArrow3: 'చాట్‌లో ప్రయత్నించండి',

    reportTitle:           'రహదారి సమస్య నివేదించండి',
    reportStep1Sub:        'వివరాలు పూరించండి',
    reportStep2Sub:        'ఫిర్యాదు దాఖలు & రూటు అయింది',
    reportStep2SubOffline: 'సమకాలీకరణకు క్యూ',
    reportStepBadge:       'దశ {n}/2',
    reportPhotoLabel:      'ఫోటో రుజువు',
    reportPhotoBtn:        'ఫోటో జతచేయడానికి నొక్కండి',
    reportPhotoAttached:   'photo_evidence.jpg జతచేయబడింది',
    reportGpsLabel:        'GPS స్థానం',
    reportGpsBtn:          'నా GPS స్థానం గుర్తించండి',
    reportGpsDetecting:    'గుర్తిస్తోంది…',
    reportDefectLabel:     'లోపం రకం',
    reportDefectPlaceholder: 'లోపం రకం ఎంచుకోండి…',
    reportSubmitBtn:       'ఫిర్యాదు సమర్పించండి',
    reportSuccessId:       '{id} దాఖలైంది!',
    reportOfflineId:       '{id} ఆఫ్‌లైన్‌లో సేవ్ అయింది',
    reportSuccessDesc:     'ఫిర్యాదు నమోదు & స్వయంచాలకంగా రూటు అయింది',
    reportOfflineDesc:     'ఆఫ్‌లైన్‌లో సేవ్ — అనుసంధానమైనప్పుడు సమకాలీకరించబడుతుంది',
    reportRoutingLabel:    'ఫిర్యాదు రూటు చేస్తోంది:',
    reportEscalation:      '{name}కు ఎస్కలేషన్ 30 రోజుల్లో పరిష్కరించకపోతే.',
    reportOfficialPortal:  'అధికారిక పోర్టల్',
    defects: ['గుంత', 'పగుళ్ళు', 'నీటి నిలకడ', 'రహదారి కుంగుట', 'సైన్‌బోర్డ్ లేదు'],

    complaintsTitle:       'నా ఫిర్యాదులు',
    complaintsTotalStat:   '{total} మొత్తం · {resolved} పరిష్కరించబడ్డాయి',
    complaintsStatFiled:   'దాఖలు',
    complaintsStatResolved:'పరిష్కరించబడ్డాయి',
    complaintsStatOverdue: 'గడువు మించాయి',
    complaintsPendingSync: 'సమకాలీకరణ పెండింగ్ ({n})',
    complaintsAllLabel:    'అన్ని ఫిర్యాదులు',
    complaintsEmpty:       'ఇంకా ఫిర్యాదులు దాఖలు కాలేదు',
    complaintsEmptyHint:   'చాట్‌బాట్‌కు వెళ్ళి\n"report pothole" అనండి',
    complaintsEmptyCTA:    'మార్గదర్శి ట్యాబ్‌కు మారండి',
    complaintsFiled:       'దాఖలు:',
    complaintsOverdueBadge:'· గడువు మించింది',

    stageFiled:       'దాఖలైంది',
    stageUnderReview: 'సమీక్షలో',
    stageResolved:    'పరిష్కరించబడింది',

    roadInfoLastRelaid:         'చివరగా పునర్నిర్మించబడింది',
    roadInfoContractor:         'కాంట్రాక్టర్',
    roadInfoMaintenanceHistory: 'నిర్వహణ చరిత్ర',
    roadInfoSource:             'మూలం',

    budgetSanctioned:      'మంజూరైంది',
    budgetDisbursed:       'వ్యయమైంది',
    budgetUtilisation:     'వినియోగం',
    budgetUtilisationPct:  '{pct}% వినియోగించబడింది',
    budgetOverdueAlert:    'గడువు హెచ్చరిక',
    budgetAccidents:       '{count} ప్రమాదాలు',
    budgetAccidentsSuffix: 'ఈ మార్గంలో నివేదించబడ్డాయి',

    trackOverdue:    'గడువు మించింది',
    trackOnTrack:    'సక్రమంగా ఉంది',
    trackExpectedBy: 'అంచనా తేదీ',
    trackElapsed:    'గడిచిన కాలం',
    trackAuthority:  'అధికారం',
    trackElapsedDays:'  {n} రోజులు',
    trackOverdueBy:  '{n} రోజులు ఆలస్యం.',
    trackEscalate:   '{name}కు ఎస్కలేట్ చేయండి.',

    notFoundTitle: 'డేటాబేస్‌లో రహదారి లేదు',
    notFoundDesc:  'మాన్యువల్ సమీక్ష కోసం సాధారణ ఎగ్జిక్యూటివ్ ఇంజినీర్ నియమించబడ్డారు:',

    mapFilters:      'మ్యాప్ ఫిల్టర్లు',
    mapShow:         'చూపించు',
    mapHide:         'దాచు',
    mapAllDistricts: 'అన్ని జిల్లాలు',
    mapAllTypes:     'అన్ని రహదారి రకాలు',
    mapAllConditions:'అన్ని స్థితులు',
    mapCondGood:     'మంచి (<3 సంవత్సరాలు)',
    mapCondDue:      'గడువు (3-5 సంవత్సరాలు)',
    mapCondOverdue:  'గడువు మించింది (>5 సంవత్సరాలు)',
    mapLegend3yr:    '<3 సం.',
    mapLegend5yr:    '3–5 సం.',
    mapLegendFlag:   '>5 సం. / జెండా',
  },

  // ==============================================================
  hi: {
    tabAssistant:  'सहायक',
    tabMap:        'लाइव मानचित्र',
    tabComplaints: 'मेरे मामले',

    chatHeaderTitle:    'रोडवॉच AI',
    chatHeaderSubtitle: 'नागरिक पारदर्शिता सेवक',
    inputPlaceholder:   'अपनी सड़क क्वेरी टाइप करें…',
    inputHint:          'आज़माएं: "road info NH-65" · "budget SH-1" · "report pothole"',
    countryBadge:       'नया देश जोड़ना = 1 JSON कॉन्फ़िग फ़ाइल',

    welcomeText: 'नमस्ते! 🙏 मैं रोडवॉच हूँ — आपका नागरिक सड़क सहायक।\n\nकिसी भी सड़क के बारे में पूछें, बजट पारदर्शिता जाँचें, गड्ढा रिपोर्ट करें, या शिकायत ट्रैक करें।',

    botRoadInfo:  '**{name}** का विवरण यहाँ है:',
    botBudget:    '**{name}** का बजट विवरण:',
    botReport:    'ठीक है! शिकायत दर्ज करने के लिए नीचे विवरण भरें:',
    botTrack:     '**{id}** की वर्तमान स्थिति:',
    botNotFound:  'हमारे डेटाबेस में सड़क नहीं मिली — आप फिर भी शिकायत दर्ज कर सकते हैं, इसकी मैन्युअल समीक्षा होगी।',
    botDefault:   '"{text}" में कोई इरादा नहीं मिला। सड़क जानकारी, बजट, समस्या रिपोर्ट, या ट्रैकिंग आज़माएं।',

    qrDefault: [
      { label: 'NH-65 सड़क जानकारी',  cmd: 'Road info on NH-65' },
      { label: 'SH-4 का बजट',         cmd: 'Budget for SH-4' },
      { label: 'गड्ढा रिपोर्ट करें',  cmd: 'Report a pothole' },
      { label: 'शहरी सड़क जानकारी',   cmd: 'Urban road info' },
    ],
    qrRoadInfo: [
      { label: 'बजट जाँचें →',         cmd: 'Check its budget' },
      { label: 'समस्या रिपोर्ट करें',  cmd: 'Report an issue here' },
      { label: 'शिकायत ट्रैक करें',    cmd: 'Track a complaint' },
    ],
    qrBudget: [
      { label: 'सड़क विवरण →',               cmd: 'View road details' },
      { label: 'देरी से मरम्मत रिपोर्ट करें', cmd: 'Report overdue repair' },
      { label: 'NH-65 से तुलना करें',         cmd: 'Compare with NH-65' },
    ],
    qrReport: [
      { label: 'मेरी शिकायत ट्रैक करें',   cmd: 'Track my complaint' },
      { label: 'दूसरी समस्या रिपोर्ट करें', cmd: 'Report another issue' },
      { label: 'सड़क विवरण →',              cmd: 'View road details' },
    ],
    qrTrack: [
      { label: 'नई शिकायत दर्ज करें', cmd: 'File a new complaint' },
      { label: 'समस्या बढ़ाएं',       cmd: 'Escalate this issue' },
      { label: 'सड़क विवरण →',        cmd: 'View road details' },
    ],
    qrNotFound: [
      { label: 'समस्या रिपोर्ट करें', cmd: 'Report an issue here' },
      { label: 'NH-65 आज़माएं',       cmd: 'Try NH-65' },
      { label: 'SH-1 आज़माएं',        cmd: 'Try SH-1' },
    ],

    onboardingStep1Title: 'किसी भी सड़क के बारे में पूछें →',
    onboardingStep1Body:  '"road info NH-65" या "budget SH-1" आज़माएं।',
    onboardingStep2Title: 'जिम्मेदार कौन है देखें →',
    onboardingStep2Body:  'हर सड़क क्वेरी सटीक कार्यकारी अभियंता, ईमेल & शिकायत पोर्टल दिखाती है — कानून द्वारा स्वतः रूटेड।',
    onboardingStep3Title: '30 सेकंड में शिकायत दर्ज करें →',
    onboardingStep3Body:  '"report pothole" कहें — फोटो जोड़ें, GPS पता करें, जमा करें। ऑफ़लाइन भी काम करता है।',
    onboardingSkip:   'टूर छोड़ें',
    onboardingGotIt:  '✓ समझ गया!',
    onboardingNext:   'अगला {n}/{total}',
    onboardingArrow1: 'नीचे चैट इनपुट',
    onboardingArrow2: 'चैट में दिखेगा',
    onboardingArrow3: 'चैट में आज़माएं',

    reportTitle:           'सड़क समस्या रिपोर्ट करें',
    reportStep1Sub:        'नीचे विवरण भरें',
    reportStep2Sub:        'शिकायत दर्ज & रूट हो गई',
    reportStep2SubOffline: 'सिंक के लिए कतार',
    reportStepBadge:       'चरण {n}/2',
    reportPhotoLabel:      'फोटो साक्ष्य',
    reportPhotoBtn:        'फोटो जोड़ने के लिए टैप करें',
    reportPhotoAttached:   'photo_evidence.jpg जोड़ा गया',
    reportGpsLabel:        'GPS स्थान',
    reportGpsBtn:          'मेरा GPS स्थान पता करें',
    reportGpsDetecting:    'पता हो रहा है…',
    reportDefectLabel:     'दोष प्रकार',
    reportDefectPlaceholder: 'दोष प्रकार चुनें…',
    reportSubmitBtn:       'शिकायत जमा करें',
    reportSuccessId:       '{id} दर्ज हो गई!',
    reportOfflineId:       '{id} ऑफ़लाइन सेव',
    reportSuccessDesc:     'शिकायत पंजीकृत & स्वतः रूट की गई',
    reportOfflineDesc:     'ऑफ़लाइन सेव — कनेक्शन मिलने पर सिंक होगी',
    reportRoutingLabel:    'शिकायत भेजी जा रही है:',
    reportEscalation:      '30 दिन में हल न होने पर {name} को भेजा जाएगा।',
    reportOfficialPortal:  'आधिकारिक पोर्टल',
    defects: ['गड्ढा', 'दरार', 'जलभराव', 'सड़क धसना', 'साइनेज गायब'],

    complaintsTitle:       'मेरी शिकायतें',
    complaintsTotalStat:   '{total} कुल · {resolved} हल',
    complaintsStatFiled:   'दर्ज',
    complaintsStatResolved:'हल',
    complaintsStatOverdue: 'अतिदेय',
    complaintsPendingSync: 'सिंक प्रतीक्षा ({n})',
    complaintsAllLabel:    'सभी शिकायतें',
    complaintsEmpty:       'अभी तक कोई शिकायत दर्ज नहीं',
    complaintsEmptyHint:   'चैटबॉट पर जाएं और\n"report pothole" कहें',
    complaintsEmptyCTA:    'सहायक टैब पर जाएं',
    complaintsFiled:       'दर्ज:',
    complaintsOverdueBadge:'· अतिदेय',

    stageFiled:       'दर्ज',
    stageUnderReview: 'समीक्षाधीन',
    stageResolved:    'हल किया गया',

    roadInfoLastRelaid:         'अंतिम पुनर्निर्माण',
    roadInfoContractor:         'ठेकेदार',
    roadInfoMaintenanceHistory: 'रखरखाव इतिहास',
    roadInfoSource:             'स्रोत',

    budgetSanctioned:      'स्वीकृत',
    budgetDisbursed:       'वितरित',
    budgetUtilisation:     'उपयोग',
    budgetUtilisationPct:  '{pct}% उपयोग',
    budgetOverdueAlert:    'समयसीमा चेतावनी',
    budgetAccidents:       '{count} दुर्घटनाएं',
    budgetAccidentsSuffix: 'इस खंड पर रिपोर्ट की गईं',

    trackOverdue:    'अतिदेय',
    trackOnTrack:    'ट्रैक पर है',
    trackExpectedBy: 'अपेक्षित तिथि',
    trackElapsed:    'बीता समय',
    trackAuthority:  'प्राधिकरण',
    trackElapsedDays:'  {n} दिन',
    trackOverdueBy:  '{n} दिन की देरी।',
    trackEscalate:   '{name} को भेजें।',

    notFoundTitle: 'डेटाबेस में सड़क नहीं',
    notFoundDesc:  'मैन्युअल समीक्षा के लिए सामान्य कार्यकारी अभियंता नियुक्त:',

    mapFilters:      'मानचित्र फ़िल्टर',
    mapShow:         'दिखाएं',
    mapHide:         'छुपाएं',
    mapAllDistricts: 'सभी जिले',
    mapAllTypes:     'सभी सड़क प्रकार',
    mapAllConditions:'सभी स्थितियाँ',
    mapCondGood:     'अच्छा (<3 वर्ष)',
    mapCondDue:      'देय (3-5 वर्ष)',
    mapCondOverdue:  'अतिदेय (>5 वर्ष या फ्लैग)',
    mapLegend3yr:    '<3 वर्ष',
    mapLegend5yr:    '3–5 वर्ष',
    mapLegendFlag:   '>5 वर्ष / फ्लैग',
  },

  // ==============================================================
  ta: {
    tabAssistant:  'உதவியாளர்',
    tabMap:        'நேரலை வரைபடம்',
    tabComplaints: 'என் வழக்குகள்',

    chatHeaderTitle:    'ரோட்வாட்ச் AI',
    chatHeaderSubtitle: 'குடிமை வெளிப்படைத்தன்மை முகவர்',
    inputPlaceholder:   'உங்கள் சாலை கேள்வியை தட்டச்சு செய்யுங்கள்…',
    inputHint:          'முயற்சிக்கவும்: "road info NH-65" · "budget SH-1" · "report pothole"',
    countryBadge:       'புதிய நாடு சேர்க்க = 1 JSON கோப்பு',

    welcomeText: 'வணக்கம்! 🙏 நான் ரோட்வாட்ச் — உங்கள் குடிமை சாலை உதவியாளர்.\n\nயேதாவது சாலையைப் பற்றி கேளுங்கள், பட்ஜெட் வெளிப்படைத்தன்மையை சரிபாருங்கள், குழி புகாரளியுங்கள், அல்லது புகாரை கண்காணியுங்கள்.',

    botRoadInfo:  '**{name}** விவரங்கள் இதோ:',
    botBudget:    '**{name}** பட்ஜெட் விவரம்:',
    botReport:    'சரி! புகாரை பதிவு செய்ய கீழே விவரங்களை நிரப்பவும்:',
    botTrack:     '**{id}** தற்போதைய நிலை:',
    botNotFound:  'எங்கள் தரவுத்தளத்தில் சாலை கிடைக்கவில்லை — நீங்கள் இன்னும் புகாரளிக்கலாம், அது கைமுறையாக மதிப்பாய்வு செய்யப்படும்.',
    botDefault:   '"{text}" இல் குறிப்பிட்ட நோக்கம் கண்டறியவில்லை. சாலை தகவல், பட்ஜெட், புகாரளிக்க அல்லது கண்காணிக்க முயற்சிக்கவும்.',

    qrDefault: [
      { label: 'NH-65 சாலை தகவல்',      cmd: 'Road info on NH-65' },
      { label: 'SH-4 பட்ஜெட்',           cmd: 'Budget for SH-4' },
      { label: 'குழி புகாரளி',            cmd: 'Report a pothole' },
      { label: 'நகர்ப்புற சாலை தகவல்',   cmd: 'Urban road info' },
    ],
    qrRoadInfo: [
      { label: 'பட்ஜெட் சரிபாருங்கள் →',  cmd: 'Check its budget' },
      { label: 'பிரச்சனை புகாரளி',         cmd: 'Report an issue here' },
      { label: 'புகாரை கண்காணி',           cmd: 'Track a complaint' },
    ],
    qrBudget: [
      { label: 'சாலை விவரங்கள் →',           cmd: 'View road details' },
      { label: 'தாமதமான பழுது புகாரளி',      cmd: 'Report overdue repair' },
      { label: 'NH-65 உடன் ஒப்பிடு',         cmd: 'Compare with NH-65' },
    ],
    qrReport: [
      { label: 'என் புகாரை கண்காணி',    cmd: 'Track my complaint' },
      { label: 'மற்றொரு பிரச்சனை புகாரளி', cmd: 'Report another issue' },
      { label: 'சாலை விவரங்கள் →',       cmd: 'View road details' },
    ],
    qrTrack: [
      { label: 'புதிய புகார் பதிவு செய்', cmd: 'File a new complaint' },
      { label: 'பிரச்சனையை அதிகரி',      cmd: 'Escalate this issue' },
      { label: 'சாலை விவரங்கள் →',       cmd: 'View road details' },
    ],
    qrNotFound: [
      { label: 'பிரச்சனை புகாரளி',  cmd: 'Report an issue here' },
      { label: 'NH-65 முயற்சி',     cmd: 'Try NH-65' },
      { label: 'SH-1 முயற்சி',      cmd: 'Try SH-1' },
    ],

    onboardingStep1Title: 'எந்த சாலையையும் பற்றி கேளுங்கள் →',
    onboardingStep1Body:  '"road info NH-65" அல்லது "budget SH-1" முயற்சிக்கவும்.',
    onboardingStep2Title: 'பொறுப்பானவர் யார் என்று பாருங்கள் →',
    onboardingStep2Body:  'ஒவ்வொரு சாலை கேள்வியும் சரியான நிர்வாக பொறியாளர், மின்னஞ்சல் & இணையதளம் காட்டுகிறது.',
    onboardingStep3Title: '30 விநாடிகளில் புகாரளிக்கவும் →',
    onboardingStep3Body:  '"report pothole" சொல்லுங்கள் — புகைப்படம் இணைக்கவும், GPS கண்டறியவும், சமர்ப்பிக்கவும்.',
    onboardingSkip:   'சுற்றுப்பயணம் தவிர்',
    onboardingGotIt:  '✓ புரிந்தது!',
    onboardingNext:   'அடுத்து {n}/{total}',
    onboardingArrow1: 'கீழே சாட் உள்ளீடு',
    onboardingArrow2: 'சாட்டில் தோன்றும்',
    onboardingArrow3: 'சாட்டில் முயற்சி',

    reportTitle:           'சாலை பிரச்சனை புகாரளிக்க',
    reportStep1Sub:        'கீழே விவரங்களை நிரப்பவும்',
    reportStep2Sub:        'புகார் பதிவு & வழிநடத்தப்பட்டது',
    reportStep2SubOffline: 'ஒத்திசைவுக்காக காத்திருக்கிறது',
    reportStepBadge:       'படி {n}/2',
    reportPhotoLabel:      'புகைப்பட ஆதாரம்',
    reportPhotoBtn:        'படம் இணைக்க தட்டவும்',
    reportPhotoAttached:   'photo_evidence.jpg இணைக்கப்பட்டது',
    reportGpsLabel:        'GPS இடம்',
    reportGpsBtn:          'என் GPS இடத்தை கண்டறி',
    reportGpsDetecting:    'கண்டறிகிறது…',
    reportDefectLabel:     'குறைபாடு வகை',
    reportDefectPlaceholder: 'குறைபாடு வகை தேர்வு செய்யுங்கள்…',
    reportSubmitBtn:       'புகாரை சமர்ப்பிக்க',
    reportSuccessId:       '{id} பதிவாகியது!',
    reportOfflineId:       '{id} ஆஃப்லைனில் சேமிக்கப்பட்டது',
    reportSuccessDesc:     'புகார் பதிவு & தானாக வழிநடத்தப்பட்டது',
    reportOfflineDesc:     'ஆஃப்லைனில் சேமிக்கப்பட்டது — இணைப்பு கிடைக்கும்போது ஒத்திசைக்கும்',
    reportRoutingLabel:    'புகார் திருப்பி விடப்படுகிறது:',
    reportEscalation:      '30 நாட்களில் தீர்க்கப்படவில்லை எனில் {name}க்கு அனுப்பப்படும்.',
    reportOfficialPortal:  'அதிகாரப்பூர்வ இணையதளம்',
    defects: ['குழி', 'விரிசல்', 'நீர் தேக்கம்', 'சாலை சரிவு', 'அறிக்கை பலகை இல்லை'],

    complaintsTitle:       'என் புகார்கள்',
    complaintsTotalStat:   '{total} மொத்தம் · {resolved} தீர்க்கப்பட்டது',
    complaintsStatFiled:   'பதிவு',
    complaintsStatResolved:'தீர்க்கப்பட்டது',
    complaintsStatOverdue: 'தாமதம்',
    complaintsPendingSync: 'ஒத்திசைவு நிலுவை ({n})',
    complaintsAllLabel:    'அனைத்து புகார்கள்',
    complaintsEmpty:       'இன்னும் புகார் பதிவு செய்யவில்லை',
    complaintsEmptyHint:   'சாட்பாட்டிற்கு செல்லுங்கள் மற்றும்\n"report pothole" சொல்லுங்கள்',
    complaintsEmptyCTA:    'உதவியாளர் தாவலுக்கு மாறுங்கள்',
    complaintsFiled:       'பதிவு:',
    complaintsOverdueBadge:'· தாமதமானது',

    stageFiled:       'பதிவு செய்யப்பட்டது',
    stageUnderReview: 'மதிப்பீட்டில்',
    stageResolved:    'தீர்க்கப்பட்டது',

    roadInfoLastRelaid:         'கடைசியாக புதுப்பிக்கப்பட்டது',
    roadInfoContractor:         'ஒப்பந்தக்காரர்',
    roadInfoMaintenanceHistory: 'பராமரிப்பு வரலாறு',
    roadInfoSource:             'மூலம்',

    budgetSanctioned:      'அனுமதிக்கப்பட்டது',
    budgetDisbursed:       'வழங்கப்பட்டது',
    budgetUtilisation:     'பயன்பாடு',
    budgetUtilisationPct:  '{pct}% பயன்படுத்தப்பட்டது',
    budgetOverdueAlert:    'கால வரம்பு எச்சரிக்கை',
    budgetAccidents:       '{count} விபத்துக்கள்',
    budgetAccidentsSuffix: 'இந்த பகுதியில் புகாரளிக்கப்பட்டன',

    trackOverdue:    'தாமதமானது',
    trackOnTrack:    'சரியான பாதையில்',
    trackExpectedBy: 'எதிர்பார்க்கப்பட்ட தேதி',
    trackElapsed:    'கடந்த நேரம்',
    trackAuthority:  'ஆணையம்',
    trackElapsedDays:'  {n} நாட்கள்',
    trackOverdueBy:  '{n} நாட்கள் தாமதம்.',
    trackEscalate:   '{name}க்கு அனுப்பு.',

    notFoundTitle: 'தரவுத்தளத்தில் சாலை இல்லை',
    notFoundDesc:  'கைமுறை மதிப்பாய்வுக்காக பொதுவான நிர்வாக பொறியாளர் நியமிக்கப்பட்டார்:',

    mapFilters:      'வரைபட வடிகட்டிகள்',
    mapShow:         'காட்டு',
    mapHide:         'மறைக்க',
    mapAllDistricts: 'அனைத்து மாவட்டங்கள்',
    mapAllTypes:     'அனைத்து சாலை வகைகள்',
    mapAllConditions:'அனைத்து நிலைமைகள்',
    mapCondGood:     'நல்லது (<3 ஆண்டு)',
    mapCondDue:      'நிலுவை (3-5 ஆண்டு)',
    mapCondOverdue:  'தாமதமானது (>5 ஆண்டு)',
    mapLegend3yr:    '<3 ஆண்டு',
    mapLegend5yr:    '3–5 ஆண்டு',
    mapLegendFlag:   '>5 ஆண்டு / கொடி',
  },
};

// ----------------------------------------------------------------
// t(lang, key, vars) — translate a key with optional interpolation
// Falls back to English if key missing in target language
// ----------------------------------------------------------------
export function t(lang, key, vars = {}) {
  const str = STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
  if (typeof str !== 'string') return str; // arrays (defects, qr*) returned as-is
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));
}
