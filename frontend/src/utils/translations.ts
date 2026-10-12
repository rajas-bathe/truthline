import type { Verdict } from '../types';

export interface LocalizedVerdictInfo {
  label: string;
  description: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerAction: string;
  gaugeStatus: string;
}

export const TRANSLATIONS: Record<'en' | 'hi' | 'mr', {
  ui: Record<string, string>;
  verdicts: Record<Verdict, LocalizedVerdictInfo>;
}> = {
  en: {
    ui: {
      inputFormat: 'Input Format',
      checkAnother: 'Check Another',
      share: 'Share',
      copied: 'Copied',
      keyFinding: 'Key Finding:',
      completed: 'Completed',
      pipelineTitle: 'Multi-Stage Verification Pipeline',
      stagesExecuted: '8 / 8 Stages Executed',
      claimsChecked: 'Claims Checked',
      processingTime: 'Processing Time',
      language: 'Language',
      claimByClaim: 'Independent Claim-by-Claim Verification',
      claimSubtitle: 'Every statement checked individually against official records',
      noClaims: 'No specific verifiable claims were isolated in this input.',
      rebuttalTitle: '1-Click WhatsApp Debunk Reply',
      rebuttalSubtitle: 'Polite, factual rebuttal formatted for instant sharing in chats and groups',
      copyRebuttal: 'Copy Rebuttal Text',
      shareWhatsApp: 'Share on WhatsApp',
      verifyAnother: 'Verify Another Forward, Document, or Audio',
      truthIndex: 'TruthLine Index',
      factualityGauge: 'FACTUALITY & TRUTH GAUGE',
      evidenceAuthority: 'EVIDENCE AUTHORITY',
      analysisConfidence: 'ANALYSIS CONFIDENCE',
      falsePct: '0% FALSE',
      truePct: '100% TRUE',
      truthScore: 'TRUTH SCORE',
      readyToVerify: 'Ready to verify with live sources',
      verifyClaim: 'Verify Claim',
    },
    verdicts: {
      verified: {
        label: 'Verified',
        description: 'Reliable evidence supports this statement',
        bannerTitle: 'SAFE TO SHARE: CONFIRMED FACTUAL',
        bannerSubtitle: 'This message has been cross-referenced with official records and authoritative reporting. The key claims are factual.',
        bannerAction: 'View supporting evidence sources',
        gaugeStatus: 'CONFIRMED TRUE',
      },
      false: {
        label: 'False',
        description: 'Reliable evidence contradicts this statement',
        bannerTitle: 'DO NOT FORWARD THIS MESSAGE',
        bannerSubtitle: 'This message contains fabricated or debunked claims. Forwarding it causes unnecessary panic and spreads false information.',
        bannerAction: 'Copy Rebuttal to send back to sender',
        gaugeStatus: 'DEBUNKED HOAX / FALSE',
      },
      outdated: {
        label: 'Outdated',
        description: 'This information no longer applies as presented',
        bannerTitle: 'CAUTION: OUTDATED INFORMATION',
        bannerSubtitle: 'This notice was valid in the past, but is no longer true today. Do not forward it as breaking or current news.',
        bannerAction: 'See historical context details',
        gaugeStatus: 'OUTDATED INFORMATION',
      },
      partly_supported: {
        label: 'Partly Supported',
        description: 'Evidence supports a limited version of this statement',
        bannerTitle: 'MISLEADING: PARTIALLY ACCURATE',
        bannerSubtitle: 'Contains real elements mixed with exaggerated or false assertions. Needs context before sharing.',
        bannerAction: 'Inspect verified vs unverified parts',
        gaugeStatus: 'PARTIALLY SUPPORTED',
      },
      cannot_confirm: {
        label: 'Cannot Be Confirmed',
        description: 'Available evidence cannot justify a reliable conclusion',
        bannerTitle: 'UNCONFIRMED: EXERCISE SKEPTICISM',
        bannerSubtitle: 'Insufficient credible public evidence exists to support or refute this claim at this time.',
        bannerAction: 'Review available search queries',
        gaugeStatus: 'CANNOT BE CONFIRMED',
      },
    },
  },
  hi: {
    ui: {
      inputFormat: 'इनपुट प्रारूप',
      checkAnother: 'अन्य दावा जाँचें',
      share: 'साझा करें',
      copied: 'कॉपी हुआ',
      keyFinding: 'मुख्य निष्कर्ष:',
      completed: 'सत्यापन पूर्ण',
      pipelineTitle: 'बहु-स्तरीय सत्यापन प्रणाली',
      stagesExecuted: '8 / 8 स्तर सफलतापूर्वक संपन्न',
      claimsChecked: 'जाँचे गए दावे',
      processingTime: 'विश्लेषण समय',
      language: 'भाषा',
      claimByClaim: 'प्रत्येक दावे की स्वतंत्र जाँच',
      claimSubtitle: 'प्रत्येक कथन की आधिकारिक अभिलेखों व साक्ष्यों के साथ स्वतंत्र पड़ताल',
      noClaims: 'इस संदेश में कोई विशिष्ट सत्यापनीय दावा नहीं मिला।',
      rebuttalTitle: '1-क्लिक व्हाट्सएप खंडन उत्तर',
      rebuttalSubtitle: 'चैट्स और ग्रुप्स में तुरंत भेजने के लिए तैयार विनम्र और तथ्यपरक उत्तर',
      copyRebuttal: 'उत्तर कॉपी करें',
      shareWhatsApp: 'व्हाट्सएप पर भेजें',
      verifyAnother: 'अन्य संदेश, दस्तावेज़ या ऑडियो की जाँच करें',
      truthIndex: 'ट्रूथलाइन सूचकांक',
      factualityGauge: 'सत्यता एवं विश्वसनीयता मापक',
      evidenceAuthority: 'साक्ष्य प्रामाणिकता',
      analysisConfidence: 'विश्लेषण आत्मविश्वास',
      falsePct: '0% असत्य',
      truePct: '100% सत्य',
      truthScore: 'सत्यता स्कोर',
      readyToVerify: 'जीवंत स्रोतों से जाँच के लिए तैयार',
      verifyClaim: 'दावा जाँचें',
    },
    verdicts: {
      verified: {
        label: 'सत्यापित (सत्य)',
        description: 'विश्वसनीय और आधिकारिक साक्ष्य इस कथन की पूर्ण पुष्टि करते हैं',
        bannerTitle: 'साझा करने हेतु सुरक्षित: पूर्णतः सत्य प्रमाणित',
        bannerSubtitle: 'यह संदेश आधिकारिक अभिलेखों और प्रतिष्ठित समाचार स्रोतों द्वारा सत्यापित है। मुख्य दावे तथ्यपरक हैं।',
        bannerAction: 'समर्थक साक्ष्य और स्रोत देखें',
        gaugeStatus: 'पूर्णतः सत्य प्रमाणित',
      },
      false: {
        label: 'असत्य (फर्जी / भ्रामक)',
        description: 'विश्वसनीय साक्ष्य इस कथन का खंडन करते हैं',
        bannerTitle: 'यह संदेश आगे (FORWARD) न भेजें',
        bannerSubtitle: 'इस संदेश में मनगढ़ंत या फर्जी दावे हैं। इसे आगे भेजने से अनावश्यक भ्रम और गलत सूचना फैलती है।',
        bannerAction: 'प्रेषक को भेजने के लिए खंडन उत्तर कॉपी करें',
        gaugeStatus: 'खंडित / फर्जी दावा',
      },
      outdated: {
        label: 'पुराना (अप्रासंगिक)',
        description: 'यह सूचना पुरानी है और वर्तमान संदर्भ में लागू नहीं होती',
        bannerTitle: 'सावधान: पुरानी अथवा कालबाह्य सूचना',
        bannerSubtitle: 'यह परिपत्र पूर्व में सत्य था, परंतु वर्तमान में प्रभावी नहीं है। इसे ताज़ा समाचार समझकर साझा न करें।',
        bannerAction: 'ऐतिहासिक संदर्भ विवरण देखें',
        gaugeStatus: 'पुरानी / कालबाह्य जानकारी',
      },
      partly_supported: {
        label: 'आंशिक रूप से सही',
        description: 'कथन के कुछ अंश सही हैं, परंतु मुख्य विवरण भ्रामक या अतिशयोक्तिपूर्ण हैं',
        bannerTitle: 'भ्रामक: आंशिक रूप से सही',
        bannerSubtitle: 'इसमें कुछ वास्तविक तथ्य हैं किंतु मुख्य आँकड़े अतिशयोक्तिपूर्ण अथवा गलत हैं। संदर्भ आवश्यक है।',
        bannerAction: 'सत्यापित बनाम असत्यापित भाग देखें',
        gaugeStatus: 'आंशिक रूप से सही',
      },
      cannot_confirm: {
        label: 'पुष्टि नहीं हो सकी',
        description: 'उपलब्ध साक्ष्यों के आधार पर निर्णायक निष्कर्ष नहीं निकाला जा सकता',
        bannerTitle: 'अपुष्ट: विवेक व सावधानी बरतें',
        bannerSubtitle: 'सार्वजनिक व आधिकारिक अभिलेखों में इस दावे की पुष्टि या खंडन हेतु पर्याप्त साक्ष्य नहीं मिले।',
        bannerAction: 'उपलब्ध खोज व जाँच विवरण देखें',
        gaugeStatus: 'पुष्टि नहीं हो सकी',
      },
    },
  },
  mr: {
    ui: {
      inputFormat: 'इनपुट स्वरूप',
      checkAnother: 'दुसरा दावा तपासा',
      share: 'शेअर करा',
      copied: 'कॉपी झाले',
      keyFinding: 'मुख्य निष्कर्ष:',
      completed: 'पडताळणी पूर्ण',
      pipelineTitle: 'बहु-स्तरीय पडताळणी प्रणाली',
      stagesExecuted: '8 / 8 टप्पे यशस्वीरित्या पूर्ण',
      claimsChecked: 'तपासलेले दावे',
      processingTime: 'लागलेला वेळ',
      language: 'भाषा',
      claimByClaim: 'प्रत्येक दाव्याची स्वतंत्र पडताळणी',
      claimSubtitle: 'प्रत्येक विधानाची अधिकृत नोंदी आणि पुराव्यांसह स्वतंत्र तपासणी',
      noClaims: 'या मजकुरामध्ये कोणताही विशिष्ट पडताळणीयोग्य दावा आढळला नाही.',
      rebuttalTitle: '1-क्लिक व्हॉट्सअ‍ॅप उत्तर',
      rebuttalSubtitle: 'ग्रुपमध्ये त्वरित पाठवण्यासाठी तयार नम्र आणि वस्तुनिष्ठ उत्तर',
      copyRebuttal: 'उत्तर कॉपी करा',
      shareWhatsApp: 'व्हॉट्सअ‍ॅपवर पाठवा',
      verifyAnother: 'दुसरा मेसेज, कागदपत्र किंवा ऑडिओ तपासा',
      truthIndex: 'ट्रूथलाइन निर्देशांक',
      factualityGauge: 'सत्यता आणि विश्वासार्हता मीटर',
      evidenceAuthority: 'पुराव्याची अधिकृतता',
      analysisConfidence: 'विश्लेषण खात्री',
      falsePct: '0% खोटे',
      truePct: '100% खरे',
      truthScore: 'सत्यता स्कोअर',
      readyToVerify: 'थेट स्रोतांद्वारे तपासणीसाठी तयार',
      verifyClaim: 'दावा तपासा',
    },
    verdicts: {
      verified: {
        label: 'सत्य (पडताळलेले)',
        description: 'विश्वसनीय आणि अधिकृत पुरावे या विधानाची पूर्ण पुष्टी करतात',
        bannerTitle: 'शेअर करण्यास सुरक्षित: पूर्णतः सत्य माहिती',
        bannerSubtitle: 'हा संदेश अधिकृत नोंदी आणि विश्वसनीय वृत्तसंस्थांद्वारे तपासला गेला आहे. मुख्य माहिती खरी आहे.',
        bannerAction: 'समर्थक पुरावे आणि स्रोत पहा',
        gaugeStatus: 'पूर्णतः सत्य माहिती',
      },
      false: {
        label: 'खोटे (अफवा / बनावट)',
        description: 'विश्वसनीय पुरावे या विधानाचा स्पष्ट इन्कार करतात',
        bannerTitle: 'हा संदेश पुढे पाठवू (FORWARD) नका',
        bannerSubtitle: 'या संदेशात बनावट किंवा खोटी माहिती आहे. हा संदेश पुढे पाठवल्याने भीती व गैरसमज पसरतात.',
        bannerAction: 'पाठवणार्‍याला उत्तर देण्यासाठी मजकूर कॉपी करा',
        gaugeStatus: 'खोटी माहिती / अफवा',
      },
      outdated: {
        label: 'जुनी (कालबाह्य माहिती)',
        description: 'ही माहिती जुनी असून आजच्या संदर्भात लागू नाही',
        bannerTitle: 'सावधान: जुनी किंवा कालबाह्य माहिती',
        bannerSubtitle: 'हे परिपत्रक पूर्वी खरे होते, परंतु सद्यस्थितीत लागू नाही. ताज्या बातम्या म्हणून हे पसरवू नका.',
        bannerAction: 'ऐतिहासिक संदर्भाचा तपशील पहा',
        gaugeStatus: 'जुनी / कालबाह्य माहिती',
      },
      partly_supported: {
        label: 'अंशतः खरे',
        description: 'विधानातील काही भाग खरा आहे, पण मुख्य भाग अतिशयोक्त किंवा दिशाभूल करणारा आहे',
        bannerTitle: 'दिशाभूल करणारे: अंशतः खरे',
        bannerSubtitle: 'काही खरी माहिती आणि अतिशयोक्ती यांचे मिश्रण आहे. पूर्ण संदर्भ समजल्याशिवाय शेअर करू नका.',
        bannerAction: 'सत्य आणि असत्य भाग तपासा',
        gaugeStatus: 'अंशतः खरे',
      },
      cannot_confirm: {
        label: 'पुष्टी होऊ शकली नाही',
        description: 'उपलब्ध पुराव्यांच्या आधारे खात्रीशीर निष्कर्ष काढता येत नाही',
        bannerTitle: 'अपुष्ट: सावधगिरी बाळगा',
        bannerSubtitle: 'सार्वजनिक व अधिकृत नोंदींमध्ये या दाव्याची पुष्टी करण्यासाठी पुरेसा पुरावा उपलब्ध नाही.',
        bannerAction: 'उपलब्ध शोध व माहिती पहा',
        gaugeStatus: 'पुष्टी होऊ शकली नाही',
      },
    },
  },
};

/**
 * Automatically maps and localizes backend text and common phrases into Hindi or Marathi
 */
export function localizeContent(text: string | undefined | null, lang: string = 'en'): string {
  if (!text) return '';
  const cleanLang = (lang === 'hi' || lang === 'mr') ? lang : 'en';
  if (cleanLang === 'en') {
    // Ensure old SachCheck brand name is replaced
    return text.replace(/SachCheck/gi, 'TruthLine');
  }

  let result = text.replace(/SachCheck/gi, 'TruthLine');

  if (cleanLang === 'hi') {
    if (result.includes('Insufficient authoritative public documentation') || result.includes('Available evidence cannot justify') || result.includes('insufficient credible public evidence') || result.includes('Under TruthLine policy')) {
      return 'सार्वजनिक अभिलेखों और समाचार रजिस्ट्रीयों में इस दावे की पुष्टि या खंडन के लिए पर्याप्त साक्ष्य उपलब्ध नहीं हैं। ट्रूथलाइन नीति के तहत, केवल साक्ष्य न मिलने पर किसी दावे को फर्जी नहीं माना जाता।';
    }
    if (result.includes('completely fabricated') || result.includes('debunked this exact template') || result.includes('internet hoax') || result.includes('Directly refuted by fact-check')) {
      return 'यह वायरल दावा पूरी तरह मनगढ़ंत और असत्य है। आधिकारिक संस्थाओं और स्वतंत्र तथ्य-जाँच एजेंसियों ने इस संदेश का बार-बार खंडन किया है।';
    }
    if (result.includes('authentic historical circular') || result.includes('earlier year') || result.includes('recirculated out of context')) {
      return 'यह परिपत्र पूर्व का एक वास्तविक ऐतिहासिक आदेश है, जिसे आज की ताज़ा घटना के रूप में भ्रामक ढंग से पुनः साझा किया जा रहा है।';
    }
    if (result.includes('corroborated by official') || result.includes('primary scientific') || result.includes('primary news wire')) {
      return 'यह कथन आधिकारिक रिकॉर्ड, प्राथमिक साक्ष्यों और प्रतिष्ठित अनुसंधान द्वारा पूर्णतः सत्यापित और सत्य है।';
    }
    if (result.includes('Certain core aspects of this claim are accurate') || result.includes('exaggerated or misstated')) {
      return 'इस दावे के कुछ बुनियादी बिंदु सही हैं, लेकिन मुख्य आँकड़ों या विवरणों को बढ़ा-चढ़ाकर या गलत तरीके से प्रस्तुत किया गया है।';
    }
  }

  if (cleanLang === 'mr') {
    if (result.includes('Insufficient authoritative public documentation') || result.includes('Available evidence cannot justify') || result.includes('insufficient credible public evidence') || result.includes('Under TruthLine policy')) {
      return 'सार्वजनिक आणि अधिकृत नोंदींमध्ये या दाव्याची खात्री पटण्यासाठी पुरेसा पुरावा उपलब्ध नाही. ट्रूथलाइन नियमावलीनुसार, फक्त पुरावा न मिळाल्यामुळे कोणताही दावा खोटा ठरवला जात नाही.';
    }
    if (result.includes('completely fabricated') || result.includes('debunked this exact template') || result.includes('internet hoax') || result.includes('Directly refuted by fact-check')) {
      return 'हा व्हायरल दावा पूर्णपणे खोटा आणि अफवा आहे. अधिकृत संस्था आणि स्वतंत्र तथ्य-पडताळणी यंत्रणांनी या संदेशाचे वारंवार खंडन केले आहे.';
    }
    if (result.includes('authentic historical circular') || result.includes('earlier year') || result.includes('recirculated out of context')) {
      return 'हे परिपत्रक पूर्वीचे जुने परिपत्रक आहे, जे आजचे असल्याचे भासवून दिशाभूल करण्यासाठी पुन्हा पसरवले जात आहे.';
    }
    if (result.includes('corroborated by official') || result.includes('primary scientific') || result.includes('primary news wire')) {
      return 'हा दावा अधिकृत नोंदी, वैज्ञानिक माहिती आणि खात्रीशीर वृत्तांद्वारे पूर्णपणे सत्य सिद्ध झाला आहे.';
    }
    if (result.includes('Certain core aspects of this claim are accurate') || result.includes('exaggerated or misstated')) {
      return 'या दाव्यातील काही मूलभूत माहिती खरी आहे, परंतु मुख्य आकडेवारी अतिशयोक्त किंवा चुकीच्या पद्धतीने मांडली गेली आहे.';
    }
  }

  return result;
}

export function getUi(key: string, lang: string = 'en'): string {
  const cleanLang = (lang === 'hi' || lang === 'mr') ? lang : 'en';
  return TRANSLATIONS[cleanLang]?.ui?.[key] || TRANSLATIONS.en.ui[key] || key;
}

export function getVerdictInfo(verdict: Verdict, lang: string = 'en'): LocalizedVerdictInfo {
  const cleanLang = (lang === 'hi' || lang === 'mr') ? lang : 'en';
  return (
    TRANSLATIONS[cleanLang]?.verdicts?.[verdict] ||
    TRANSLATIONS.en.verdicts[verdict] ||
    TRANSLATIONS.en.verdicts.cannot_confirm
  );
}
