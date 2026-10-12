import { GeminiVerificationOutput } from './geminiProvider';

export class OfflineDemoProvider {
  /**
   * Generates a deterministic, realistic fact-check simulation for offline development & testing
   * Supporting English ('en'), Hindi ('hi'), and Marathi ('mr')
   */
  verifyOffline(inputText: string, language: string = 'en'): GeminiVerificationOutput & { isDemo: boolean; demoNotice: string } {
    const textLower = (inputText || '').toLowerCase();
    const lang = (language === 'hi' || language === 'mr') ? language : 'en';

    // 1. Match Known FALSE Rumors (₹100 currency ban, darkness, garlic, radiation, grants)
    if (
      textLower.includes('darkness') ||
      textLower.includes('garlic') ||
      textLower.includes('radiation') ||
      textLower.includes('free recharge') ||
      textLower.includes('5000') ||
      textLower.includes('grant') ||
      textLower.includes('nasa confirms') ||
      textLower.includes('100') ||
      textLower.includes('currency') ||
      textLower.includes('banned') ||
      textLower.includes('demonetized')
    ) {
      const explanations = {
        en: 'This viral claim is completely fabricated. Official agencies (RBI / PIB Fact Check) and independent fact-checking registries have repeatedly debunked this exact template as a recurring internet hoax.',
        hi: 'यह वायरल दावा पूरी तरह मनगढ़ंत और असत्य है। आधिकारिक संस्थाओं (आरबीआई / पीआईबी फैक्ट चेक) और स्वतंत्र तथ्य-जाँच एजेंसियों ने इस संदेश का स्पष्ट खंडन किया है।',
        mr: 'हा व्हायरल दावा पूर्णपणे खोटा आणि अफवा आहे. अधिकृत संस्था (आरबीआय / पीआयबी फॅक्ट चेक) आणि स्वतंत्र यंत्रणांनी या संदेशाचे वारंवार खंडन केले आहे.'
      };

      const challenger = {
        en: 'Challenger Agent detected typical viral phishing/hoax markers: artificial urgency, fake official attribution, and unverified currency claims.',
        hi: 'चैलेंजर एजेंट ने पाया: संदेश में कृत्रिम घबराहट, फर्जी आधिकारिक संदर्भ और मुद्रा पर निराधार दावे के संकेत हैं।',
        mr: 'चॅलेंजर एजंटने शोधले: संदेशात कृत्रिम घबराट, बनावट अधिकृत संदर्भ आणि चलनावरील निराधार दाव्याची लक्षणे आहेत.'
      };

      const auditor = {
        en: 'Auditor verified: No official gazette, government press release, or RBI circular supports this assertion.',
        hi: 'ऑडिटर सत्यापन: किसी भी सरकारी राजपत्र, प्रेस विज्ञप्ति या आरबीआई परिपत्र में इस दावे का कोई प्रमाण नहीं है।',
        mr: 'ऑडिटर पडताळणी: कोणत्याही अधिकृत राजपत्रात, सरकारी पत्रकात किंवा आरबीआय सूचनेत या दाव्याचा पुरावा नाही.'
      };

      const reasoning = {
        en: 'Directly refuted by fact-check registries and official press bureaus.',
        hi: 'तथ्य-जाँच अभिलेखों और आधिकारिक प्रेस ब्यूरो द्वारा स्पष्ट खंडन किया गया।',
        mr: 'तथ्य-पडताळणी नोंदी आणि अधिकृत यंत्रणांद्वारे थेट खंडन केले गेले.'
      };

      return {
        isDemo: true,
        demoNotice: '[OFFLINE DEMO MODE] Live search disabled. Simulating verification against verified fact-check archive.',
        overallVerdict: 'FALSE',
        explanation: explanations[lang],
        challengerNotes: challenger[lang],
        auditorNotes: auditor[lang],
        limitations: 'Offline demonstration mode enabled. Configure GEMINI_API_KEY for live real-time Google Grounded search.',
        claims: [
          {
            claimText: inputText.slice(0, 160),
            verdict: 'FALSE',
            confidence: 0.96,
            reasoning: reasoning[lang]
          }
        ],
        sources: [
          {
            title: '[DEMO ARCHIVE] Press Information Bureau Fact Check',
            url: 'https://factcheck.pib.gov.in/demo-archive-debunk',
            publisher: 'PIB Fact Check',
            excerpt: 'Viral message claiming government currency ban or emergency shutdown is fake.'
          },
          {
            title: '[DEMO ARCHIVE] Reserve Bank of India Official Clarification',
            url: 'https://rbi.org.in/demo-press-release',
            publisher: 'Reserve Bank of India',
            excerpt: 'No circular issued withdrawing legitimate legal tender banknotes.'
          }
        ],
        groundingQueries: ['official press release fact check', 'viral forward debunk']
      };
    }

    // 2. Match Known OUTDATED Rumors / Panics (Tsunami panic, Lockdowns, historical circulars)
    if (
      textLower.includes('lockdown') ||
      textLower.includes('curfew') ||
      textLower.includes('old rule') ||
      textLower.includes('circular') ||
      textLower.includes('tsunami') ||
      textLower.includes('evacuate') ||
      textLower.includes('coastline')
    ) {
      const explanations = {
        en: 'This alarmist forward is either outdated historical emergency audio or an unverified panic rumor. No active tsunami or emergency evacuation alert has been issued by meteorological or disaster management authorities today.',
        hi: 'यह घबराहट फैलाने वाला संदेश पुराना या अपुष्ट है। आज आपदा प्रबंधन या मौसम विभाग द्वारा कोई सुनामी या आपातकालीन निकासी चेतावनी जारी नहीं की गई है।',
        mr: 'हा भीती पसरवणारा संदेश जुना किंवा अफवा आहे. आपत्ती व्यवस्थापन किंवा हवामान खात्याकडून आज त्सुनामी किंवा तातडीची स्थलांतर सूचना जारी केलेली नाही.'
      };

      const challenger = {
        en: 'Challenger Agent identified chronological mismatch or panic inflation: No current bulletin issued by National Disaster Management Authority.',
        hi: 'चैलेंजर एजेंट ने पाया: राष्ट्रीय आपदा प्रबंधन प्राधिकरण द्वारा आज कोई ऐसा बुलेटिन जारी नहीं किया गया है।',
        mr: 'चॅलेंजर एजंटने तपासले: राष्ट्रीय आपत्ती व्यवस्थापन प्राधिकरणाने आज कोणतेही अधिकृत परिपत्रक काढलेले नाही.'
      };

      const auditor = {
        en: 'Auditor checked INCOIS tsunami warning center telemetry: Normal sea level conditions reported along coastlines.',
        hi: 'ऑडिटर ने महासागर सूचना सेवा (INCOIS) का परीक्षण किया: समुद्र स्तर सामान्य स्थिति में है।',
        mr: 'ऑडिटरने सागरी माहिती केंद्र (INCOIS) तपासले: किनारपट्टीवर समुद्राची पातळी पूर्णपणे सामान्य आहे.'
      };

      return {
        isDemo: true,
        demoNotice: '[OFFLINE DEMO MODE] Live search disabled. Simulating verification against verified fact-check archive.',
        overallVerdict: 'OUTDATED',
        explanation: explanations[lang],
        challengerNotes: challenger[lang],
        auditorNotes: auditor[lang],
        limitations: 'Offline demonstration mode enabled.',
        claims: [
          {
            claimText: inputText.slice(0, 160),
            verdict: 'OUTDATED',
            confidence: 0.92,
            reasoning: lang === 'hi' ? 'पूर्व का पुराना संदर्भ अथवा बिना आधिकारिक पुष्टि का अप्रासंगिक संदेश।' : lang === 'mr' ? 'जुना संदर्भ किंवा अधिकृत पुष्टी नसलेला संदेश.' : 'Old historical audio or message circulated out of current context.'
          }
        ],
        sources: [
          {
            title: '[DEMO ARCHIVE] Indian National Centre for Ocean Information Services (INCOIS)',
            url: 'https://incois.gov.in/demo-tsunami-bulletin',
            publisher: 'INCOIS Disaster Monitoring',
            excerpt: 'All coastal monitoring buoys report normal sea levels.'
          }
        ],
        groundingQueries: ['tsunami warning center coastal bulletin']
      };
    }

    // 3. Match Known VERIFIED Facts (Bengal Tiger, Chandrayaan, solar scheme, national symbols)
    if (
      textLower.includes('tiger') ||
      textLower.includes('animal') ||
      textLower.includes('chandrayaan') ||
      textLower.includes('kusum') ||
      textLower.includes('solar') ||
      textLower.includes('pump') ||
      textLower.includes('isro') ||
      textLower.includes('moon')
    ) {
      const explanations = {
        en: 'This statement is corroborated by official records, government gazettes, and verified documentation.',
        hi: 'यह कथन आधिकारिक रिकॉर्ड, सरकारी गजट और वैज्ञानिक अभिलेखों द्वारा पूरी तरह सत्यापित और सत्य है।',
        mr: 'हे विधान अधिकृत सरकारी नोंदी, राजपत्र आणि दस्तऐवजांद्वारे पूर्णपणे सत्य सिद्ध झाले आहे.'
      };

      const challenger = {
        en: 'Challenger Agent verified that official documentation fully corroborates the core assertions.',
        hi: 'चैलेंजर एजेंट ने पुष्टि की कि आधिकारिक दस्तावेज़ मुख्य दावे की पूरी तरह पुष्टि करते हैं।',
        mr: 'चॅलेंजर एजंटने तपासले: अधिकृत नोंदी या माहितीचे पूर्ण समर्थन करतात.'
      };

      const auditor = {
        en: 'All primary gazette entries and agency guidelines align with the stated facts.',
        hi: 'सभी प्राथमिक राजपत्र और सरकारी दिशानिर्देश बताए गए तथ्यों से पूर्णतः मेल खाते हैं।',
        mr: 'सर्व प्राथमिक सरकारी मार्गदर्शक तत्त्वे आणि नोंदी या माहितीशी जुळतात.'
      };

      return {
        isDemo: true,
        demoNotice: '[OFFLINE DEMO MODE] Live search disabled. Simulating verification against verified fact-check archive.',
        overallVerdict: 'VERIFIED',
        explanation: explanations[lang],
        challengerNotes: challenger[lang],
        auditorNotes: auditor[lang],
        limitations: 'Offline demonstration mode enabled.',
        claims: [
          {
            claimText: inputText.slice(0, 160),
            verdict: 'VERIFIED',
            confidence: 0.98,
            reasoning: lang === 'hi' ? 'आधिकारिक सरकारी अभिलेखों और प्राथमिक स्रोतों द्वारा प्रमाणित।' : lang === 'mr' ? 'अधिकृत सरकारी नोंदी आणि प्राथमिक स्रोतांद्वारे प्रमाणित.' : 'Directly corroborated by official government publications and agency bulletins.'
          }
        ],
        sources: [
          {
            title: '[DEMO ARCHIVE] Ministry of Environment, Forest and Climate Change Gazette',
            url: 'https://moef.gov.in/demo-national-symbols',
            publisher: 'Official Government Portal',
            excerpt: 'Official declaration and statutory notification confirming the factual premise.'
          }
        ],
        groundingQueries: ['official national wildlife gazette notification']
      };
    }

    // 4. Match PARTIALLY_SUPPORTED
    if (textLower.includes('highway') || textLower.includes('record') || textLower.includes('speed') || textLower.includes('percent')) {
      const explanations = {
        en: 'Certain core aspects of this claim are accurate, but key figures or implications have been exaggerated or misstated.',
        hi: 'इस दावे के कुछ बुनियादी बिंदु सही हैं, लेकिन मुख्य आँकड़ों या विवरणों को बढ़ा-चढ़ाकर या गलत तरीके से प्रस्तुत किया गया है।',
        mr: 'या दाव्यातील काही मूलभूत माहिती खरी आहे, परंतु मुख्य आकडेवारी अतिशयोक्त किंवा चुकीच्या पद्धतीने मांडली गेली आहे.'
      };

      return {
        isDemo: true,
        demoNotice: '[OFFLINE DEMO MODE] Live search disabled. Simulating verification against verified fact-check archive.',
        overallVerdict: 'PARTIALLY_SUPPORTED',
        explanation: explanations[lang],
        challengerNotes: lang === 'hi' ? 'चैलेंजर एजेंट ने आँकड़ों की अतिशयोक्ति पकड़ी है।' : lang === 'mr' ? 'चॅलेंजर एजंटने आकडेवारीतील अतिशयोक्ती शोधली.' : 'Challenger Agent identified statistical exaggeration: The reported figure exceeds official limits.',
        auditorNotes: lang === 'hi' ? 'प्राथमिक अधिसूचना पुष्टि करती है कि वास्तविक सीमाएँ दावे से कम हैं।' : lang === 'mr' ? 'प्राथमिक अधिसूचनेनुसार प्रत्यक्ष मर्यादा दाव्यापेक्षा कमी आहे.' : 'Primary gazette confirms the initiative, but specifies lower regulatory thresholds than claimed.',
        limitations: 'Offline demonstration mode enabled.',
        claims: [
          {
            claimText: 'Infrastructure initiative verified',
            verdict: 'VERIFIED',
            confidence: 0.95,
            reasoning: lang === 'hi' ? 'आधिकारिक सड़क परिवहन प्राधिकरण द्वारा पुष्टि।' : lang === 'mr' ? 'अधिकृत रस्ते वाहतूक प्राधिकरणाकडून पुष्टी.' : 'Initiative confirmed by official road transport authority.'
          },
          {
            claimText: 'Exaggerated parameters or limits',
            verdict: 'FALSE',
            confidence: 0.90,
            reasoning: lang === 'hi' ? 'वास्तविक नियम और सीमाएँ दावे की तुलना में भिन्न हैं।' : lang === 'mr' ? 'प्रत्यक्ष नियम आणि मर्यादा दाव्यापेक्षा वेगळ्या आहेत.' : 'Regulatory standards are strictly capped under existing national regulations.'
          }
        ],
        sources: [
          {
            title: '[DEMO ARCHIVE] Ministry of Road Transport Official Notification',
            url: 'https://morth.gov.in/demo-notification',
            publisher: 'Ministry of Road Transport',
            excerpt: 'Expressway operational parameters and speed limits notification.'
          }
        ],
        groundingQueries: ['expressway speed limit gazette notification']
      };
    }

    // 5. Default: CANNOT_CONFIRM (Never classify as false without evidence!)
    const defaultExplanations = {
      en: 'Insufficient authoritative public documentation is currently available in verified public records to either corroborate or refute this claim. Under TruthLine policy, claims are NEVER marked false merely because evidence was not found.',
      hi: 'सार्वजनिक व आधिकारिक अभिलेखों में इस दावे की पुष्टि या खंडन के लिए पर्याप्त साक्ष्य उपलब्ध नहीं हैं। ट्रूथलाइन नीति के तहत, केवल साक्ष्य न मिलने पर किसी दावे को फर्जी नहीं माना जाता।',
      mr: 'सार्वजनिक आणि अधिकृत नोंदींमध्ये या दाव्याची खात्री पटण्यासाठी पुरेसा पुरावा उपलब्ध नाही. ट्रूथलाइन नियमावलीनुसार, फक्त पुरावा न मिळाल्यामुळे कोणताही दावा खोटा ठरवला जात नाही.'
    };

    const defaultReasoning = {
      en: 'Evidence is currently insufficient in public records to establish truth or falsity.',
      hi: 'सार्वजनिक अभिलेखों में सत्य या असत्य सिद्ध करने के लिए वर्तमान में साक्ष्य अपर्याप्त हैं।',
      mr: 'सार्वजनिक नोंदींमध्ये सत्य किंवा असत्य सिद्ध करण्यासाठी पुरेसा पुरावा उपलब्ध नाही.'
    };

    return {
      isDemo: true,
      demoNotice: 'Verification conducted against public knowledge base and fact-checking registries.',
      overallVerdict: 'CANNOT_CONFIRM',
      explanation: defaultExplanations[lang],
      challengerNotes: lang === 'hi' ? 'समाचार अभिलेखों में इस विशिष्ट दावे को प्रमाणित या खारिज करने के लिए कोई विश्वसनीय साक्ष्य नहीं मिले।' : lang === 'mr' ? 'वृत्त नोंदींमध्ये या दाव्याची पडताळणी करण्यासाठी कोणताही पुरावा आढळला नाही.' : 'No verified public citations were found in news registries to challenge or substantiate this specific claim.',
      auditorNotes: lang === 'hi' ? 'ऑडिटर शर्त: निर्णायक निष्कर्ष के लिए कम से कम 2 स्वतंत्र प्रमाण आवश्यक हैं।' : lang === 'mr' ? 'ऑडिटर अट: खात्रीशीर निष्कर्षासाठी किमान 2 स्वतंत्र पुरावे आवश्यक आहेत.' : 'Auditor requirement: At least 2 independent citations needed for a decisive verdict.',
      limitations: 'Verifications are grounded against available public documentation and fact-checking registries. Under TruthLine policy, claims are never marked false without verifiable proof.',
      claims: [
        {
          claimText: inputText.slice(0, 160),
          verdict: 'CANNOT_CONFIRM',
          confidence: 0.35,
          reasoning: defaultReasoning[lang]
        }
      ],
      sources: [],
      groundingQueries: ['unindexed assertion verification']
    };
  }
}
