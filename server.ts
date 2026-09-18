import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { initialOperatingStatus, defaultKnowledgeDocuments } from './src/data/defaultDocuments';
import { TodayOperatingStatus, KnowledgeDocument, ResponseStyle, AnswerResult } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory persistent state during server runtime
let currentOperatingStatus: TodayOperatingStatus = { ...initialOperatingStatus };
let knowledgeDocuments: KnowledgeDocument[] = [...defaultKnowledgeDocuments];

// Helper to normalize any requested style into the canonical 6 ResponseStyle types
function normalizeStyle(style: unknown): ResponseStyle {
  if (!style) return 'PHONE';
  const str = String(style).toUpperCase().trim();
  if (str === 'VERY_BRIEF' || str === 'VERY BRIEF' || str.includes('BRIEF') || str.includes('짧게')) {
    return 'VERY_BRIEF';
  }
  if (str === 'FRIENDLY' || str.includes('친절')) {
    return 'FRIENDLY';
  }
  if (str === 'STANDARD' || str.includes('공공기관') || str.includes('표준')) {
    return 'STANDARD';
  }
  if (str === 'PHONE' || str.includes('전화')) {
    return 'PHONE';
  }
  if (str === 'SMS' || str.includes('문자')) {
    return 'SMS';
  }
  if (str === 'OFFICIAL_DOC' || str.includes('공문') || str.includes('답변서') || str.includes('OFFICIAL')) {
    return 'OFFICIAL_DOC';
  }
  return 'PHONE';
}

// Helper to initialize Gemini client safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    docsCount: knowledgeDocuments.length,
    serverTime: new Date().toISOString(),
  });
});

// 2. Operating status endpoints
app.get('/api/operating-status', (req: Request, res: Response) => {
  res.json(currentOperatingStatus);
});

app.post('/api/operating-status', (req: Request, res: Response) => {
  const updated: Partial<TodayOperatingStatus> = req.body;
  currentOperatingStatus = {
    ...currentOperatingStatus,
    ...updated,
    updatedAt: new Date().toLocaleString('ko-KR', { hour12: false }),
  };
  res.json(currentOperatingStatus);
});

// 3. Knowledge base documents endpoints
app.get('/api/documents', (req: Request, res: Response) => {
  const { category, query } = req.query;
  let docs = [...knowledgeDocuments];

  if (category && category !== '전체') {
    docs = docs.filter(d => d.category === category);
  }

  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    docs = docs.filter(d => 
      d.title.toLowerCase().includes(q) ||
      d.summary.toLowerCase().includes(q) ||
      d.content.toLowerCase().includes(q) ||
      d.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // Sort latest first
  docs.sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
  res.json(docs);
});

app.post('/api/documents', (req: Request, res: Response) => {
  const newDoc: KnowledgeDocument = {
    id: req.body.id || `doc-custom-${Date.now()}`,
    title: req.body.title || '새 업무처리기준',
    category: req.body.category || '기타',
    department: req.body.department || '배방보건지소',
    effectiveDate: req.body.effectiveDate || new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
    version: req.body.version || 'v1.0',
    summary: req.body.summary || '',
    content: req.body.content || '',
    keyPoints: Array.isArray(req.body.keyPoints) ? req.body.keyPoints : [],
    tags: Array.isArray(req.body.tags) ? req.body.tags : [],
    isLatest: true,
    author: req.body.author || '배방보건지소 담당자',
    updatedAt: new Date().toISOString().slice(0, 10),
  };

  const existingIndex = knowledgeDocuments.findIndex(d => d.id === newDoc.id);
  if (existingIndex >= 0) {
    knowledgeDocuments[existingIndex] = newDoc;
  } else {
    knowledgeDocuments.unshift(newDoc);
  }

  res.json({ success: true, document: newDoc });
});

app.delete('/api/documents/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  knowledgeDocuments = knowledgeDocuments.filter(d => d.id !== id);
  res.json({ success: true });
});

// Document retrieval matching logic
function findRelevantDocs(question: string, categoryHint?: string): KnowledgeDocument[] {
  const q = question.toLowerCase();
  
  // Scoring
  const scored = knowledgeDocuments.map(doc => {
    let score = 0;
    const cat = doc.category.toLowerCase();
    const title = doc.title.toLowerCase();
    const content = doc.content.toLowerCase();
    const summary = doc.summary.toLowerCase();

    // Category hint match
    if (categoryHint && doc.category === categoryHint) score += 40;

    // Direct question keyword matches
    if (q.includes('보건증') || q.includes('건강진단결과') || q.includes('식품')) {
      if (doc.id === 'doc-cert-01' || doc.id === 'doc-special-xray-11') score += 50;
    }
    if (q.includes('운전면허') || q.includes('적성검사') || q.includes('신체검사') || q.includes('1종') || q.includes('2종')) {
      if (doc.id === 'doc-driver-02' || doc.id === 'doc-special-doctor-10') score += 50;
    }
    if (q.includes('진료') || q.includes('의사') || q.includes('약') || q.includes('처방') || q.includes('감기') || q.includes('혈압') || q.includes('당뇨')) {
      if (doc.id === 'doc-clinic-03' || doc.id === 'doc-special-doctor-10') score += 45;
    }
    if (q.includes('임신') || q.includes('임산부') || q.includes('철분') || q.includes('엽산') || q.includes('유축기') || q.includes('산전')) {
      if (doc.id === 'doc-maternal-04') score += 50;
    }
    if (q.includes('치매') || q.includes('기억력') || q.includes('인지') || q.includes('cist') || q.includes('어르신 검사')) {
      if (doc.id === 'doc-dementia-05') score += 50;
    }
    if (q.includes('예방접종') || q.includes('백신') || q.includes('독감') || q.includes('인플루엔자') || q.includes('폐렴구균') || q.includes('주사')) {
      if (doc.id === 'doc-vaccine-06' || doc.id === 'doc-special-doctor-10') score += 50;
    }
    if (q.includes('기초건강') || q.includes('인바디') || q.includes('체성분') || q.includes('혈당측정')) {
      if (doc.id === 'doc-basic-07') score += 45;
    }
    if (q.includes('금연') || q.includes('담배') || q.includes('패치') || q.includes('니코틴')) {
      if (doc.id === 'doc-smoke-08') score += 50;
    }
    if (q.includes('폐의약품') || q.includes('남은 약') || q.includes('약 버리') || q.includes('버리는')) {
      if (doc.id === 'doc-waste-09') score += 50;
    }
    if (q.includes('의사') && (q.includes('없') || q.includes('부재') || q.includes('안 계') || q.includes('휴무'))) {
      if (doc.id === 'doc-special-doctor-10') score += 60;
    }
    if (q.includes('방사선') || q.includes('엑스레이') || q.includes('x-ray') || q.includes('x선')) {
      if (doc.id === 'doc-special-xray-11' || doc.id === 'doc-cert-01') score += 60;
    }

    // Keyword matches
    doc.tags.forEach(t => {
      if (q.includes(t.toLowerCase())) score += 15;
    });

    const keywords = ['발급', '시간', '검사', '수수료', '준비물', '서류', '신분증', '예약', '출장'];
    keywords.forEach(kw => {
      if (q.includes(kw) && (title.includes(kw) || content.includes(kw))) score += 5;
    });

    return { doc, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const relevant = scored.filter(s => s.score > 0).slice(0, 3).map(s => s.doc);

  if (relevant.length === 0) {
    // Return top 2 default standards
    return knowledgeDocuments.slice(0, 2);
  }
  return relevant;
}

// Check medical danger queries
function detectMedicalSafetyWarning(question: string): string | null {
  const q = question.toLowerCase();
  const dangerKeywords = [
    '약 안 먹어도',
    '약 끊어도',
    '약 중단',
    '혈압이 180',
    '혈압 180',
    '혈압이 190',
    '혈압 200',
    '혈당 400',
    '가슴이 찢어지',
    '숨을 못 쉬',
    '마비가 왔',
    '처방해줘',
    '처방해주세요',
    '치료해줘',
    '진단해줘',
    '진단해주세요',
    '이 병인가요',
  ];

  for (const dk of dangerKeywords) {
    if (q.includes(dk)) {
      return '⚠️ [의료진 판단 필수 안전 경고] 본 안내는 보건지소 행정 절차 안내이며, 임의의 약물 중단, 용량 변경, 질환의 진단 및 처방은 절대 불가합니다. 즉시 보건지소 의과 진료실 내원 또는 응급 시 119/응급의료기관의 전문 진료를 받으셔야 합니다.';
    }
  }
  return null;
}

// Fallback intelligent RAG generator when Gemini key is not configured or fails
function generateFallbackRAG(
  question: string,
  style: ResponseStyle,
  operatingStatus: TodayOperatingStatus,
  relevantDocs: KnowledgeDocument[],
  safetyWarning: string | null
): AnswerResult {
  const q = question.toLowerCase();
  const primaryDoc = relevantDocs[0] || defaultKnowledgeDocuments[0];

  let category = primaryDoc.category;
  let subCategory = primaryDoc.title.replace('배방보건지소 ', '');
  let department = primaryDoc.department;
  let testRequired = false;
  let sameDayIssuance = false;
  let expectedDuration = '즉시 안내';
  let charge = '무료';
  let keyTakeaways: string[] = [];
  let clarificationNeeded: string[] = [];
  let answerCore = '';
  let todayNotice = '';
  let isAffected = false;

  // Question categorization and logic
  if (q.includes('보건증') || q.includes('건강진단결과서')) {
    category = '제증명';
    subCategory = '건강진단결과서(구 보건증)';
    department = '제증명창구 / 민원실';
    testRequired = true;
    sameDayIssuance = false;
    expectedDuration = '검사일 제외 근무일 기준 4~5일';
    charge = '3,000원';
    keyTakeaways = [
      '신분증 필히 지참 (미지참 시 검사 불가)',
      '흉부 X-선 촬영 및 장티푸스 배양 검사 필수',
      '당일 발급 불가 (결과 판독 후 발급)',
      'e보건소 또는 정부24 온라인 무료 발급 가능'
    ];

    // Check today's certificates/X-ray status!
    if (operatingStatus.certificates.status === 'ABSENT') {
      isAffected = true;
      todayNotice = '금일 보건증 등 제증명(흉부 X-선 및 검사) 전일 부재로 신규 검사는 불가합니다. (기 검사 완료건 수령만 가능하며, 아산시보건소 본소 이용 권장)';
    } else if (operatingStatus.certificates.status === 'TIME_BOUND') {
      isAffected = true;
      const resumed = operatingStatus.certificates.resumedAt || '오후 2시';
      todayNotice = `금일 방사선사 출장 부재로 흉부 X-선 검사는 ${resumed} 이후 가능합니다.`;
    }

    if (q.includes('오늘 바로') || q.includes('당일') || q.includes('며칠')) {
      answerCore = '건강진단결과서(구 보건증)는 장티푸스 미생물 배양 및 흉부 X-선 영상 판독 절차로 인해 검사 당일 즉시 발급되지 않으며, 검사일 제외 근무일 기준 약 4~5일이 소요됩니다.';
    } else {
      answerCore = '배방보건지소에서 건강진단결과서(보건증) 발급을 위해서는 신분증과 수수료 3,000원을 지참하시어 흉부 X-선과 장티푸스 검사를 받으셔야 합니다. 결과 확인 후 약 4~5일 뒤 방문 또는 e보건소에서 출력 가능합니다.';
    }

    if (isAffected) {
      answerCore += ` 또한, ${todayNotice}`;
    }

    clarificationNeeded = [
      '검사 받으실 분의 신분증 지참 여부 확인 필요',
      '방문 예정 시간이 제증명 검사 가능 시간(방사선사 복귀 시각)과 맞는지 확인'
    ];
  } else if (q.includes('운전면허') || q.includes('적성검사') || q.includes('신체검사')) {
    category = '운전면허';
    subCategory = '1종 보통 적성검사(신체검사)';
    department = '진료실 / 민원실';
    testRequired = true;
    sameDayIssuance = true;
    expectedDuration = '약 10~15분 (의사 문진 및 시력검사)';
    charge = '6,000원';
    keyTakeaways = [
      '신분증, 6개월 이내 사진 2매(3.5x4.5cm) 지참',
      '공중보건의사 문진 및 시력 측정 필수',
      '의사 부재 시 신체검사 진행 일체 불가'
    ];

    if (operatingStatus.driversAptitude.status === 'ABSENT' || operatingStatus.internalMedicine.status === 'ABSENT') {
      isAffected = true;
      todayNotice = '금일은 의사 부재로 운전면허 신체검사 문진 및 판정이 불가합니다. 아산시보건소 본소나 인근 지정병원을 이용해 주셔야 합니다.';
      answerCore = `현재 배방보건지소는 금일 운전면허 적성검사(신체검사) 의사 문진이 어렵습니다. 긴급하신 경우 아산시보건소 본소(온천동) 또는 관내 지정 의료기관을 방문해 주시기 바랍니다.`;
    } else {
      answerCore = '배방보건지소에서 1종 보통 운전면허 적성검사(신체검사)가 가능합니다. 기존 운전면허증(또는 신분증), 최근 6개월 이내 여권용 사진 2매, 수수료 6,000원을 지참하여 평일 17:30 이전까지 방문해 주시면 됩니다.';
    }

    clarificationNeeded = [
      '1종 보통 적성검사 대상인지 2종 면허 갱신인지 확인 필요',
      '최근 2년 이내 국민건강보험공단 건강검진 기록 유무 (기록이 전산 연동되면 신체검사 면제 가능)'
    ];
  } else if (q.includes('임신') || q.includes('임산부') || q.includes('철분') || q.includes('엽산') || q.includes('유축기')) {
    category = '모자보건';
    subCategory = '임산부 등록 및 영양제 지원';
    department = '모자보건실';
    testRequired = false;
    sameDayIssuance = true;
    expectedDuration = '당일 즉시 수령 (약 10분)';
    charge = '무료';
    keyTakeaways = [
      '임신확인서(또는 산모수첩) + 신분증 지참',
      '엽산제: 임신 초기~12주 (최대 3개월분)',
      '철분제: 임신 16주~출산 전 (최대 5개월분)',
      '산전 초기 혈액검사 무료 지원'
    ];
    if (operatingStatus.maternalChildHealth.status === 'PAUSED' || operatingStatus.maternalChildHealth.status === 'ABSENT') {
      isAffected = true;
      todayNotice = '금일 모자보건실 담당자 부재로 임산부 등록 및 영양제 지원 업무가 일시 중단됩니다.';
      answerCore = `금일 배방보건지소는 모자보건 업무가 일시 중단되어 임산부 등록 및 영양제 수령이 어렵습니다. 긴급한 경우 아산시보건소 본소 모자보건팀을 이용해 주시기 바랍니다.`;
    } else {
      answerCore = '아산시 거주 임산부께서는 임신확인서(또는 산모수첩)와 신분증을 지참하여 배방보건지소 모자보건실을 방문하시면 임산부 등록과 함께 임신 12주까지는 엽산제, 16주 이후부터는 철분제를 무료로 수령하실 수 있습니다. 산전 초기 무료 혈액검사와 유축기 대여도 지원합니다.';
    }
    clarificationNeeded = [
      '현재 임신 주수(12주 이전/16주 이후) 확인',
      '아산시 관내 주민등록 주소지 일치 여부'
    ];
  } else if (q.includes('치매') || q.includes('기억력') || q.includes('cist')) {
    category = '치매';
    subCategory = '치매 조기선별검사(CIST)';
    department = '치매상담실 (치매안심센터 연계)';
    testRequired = true;
    sameDayIssuance = true;
    expectedDuration = '약 15~20분';
    charge = '무료';
    keyTakeaways = [
      '만 60세 이상 어르신 누구나 무료',
      '신분증 지참 필요',
      '문답식 CIST 인지선별검사 실시',
      '결과 이상 시 협약병원 정밀검사비 지원'
    ];
    if (operatingStatus.cognitiveScreening.status === 'ABSENT' || operatingStatus.cognitiveScreening.status === 'PAUSED') {
      isAffected = true;
      todayNotice = '금일 인지선별검사(치매검진)는 담당자 출장으로 일시 중단됩니다.';
      answerCore = `금일 배방보건지소 인지선별검사는 담당자 부재로 진행이 어렵습니다. 아산시 치매안심센터(본소) 또는 다음 진료일에 방문 부탁드립니다.`;
    } else {
      answerCore = '배방보건지소에서는 만 60세 이상 어르신을 대상으로 치매 조기발견을 위한 인지선별검사(CIST)를 무료로 연중 실시하고 있습니다. 신분증을 지참하시고 방문하시면 약 15~20분간 문답식 검사를 받으실 수 있으며, 정밀진단이 필요한 경우 아산시 치매안심센터와 연계하여 검사비도 지원해 드립니다.';
    }
    clarificationNeeded = [
      '어르신의 연령(만 60세 이상 여부)',
      '어르신 본인 직접 방문 가능 여부'
    ];
  } else if (q.includes('폐의약품') || q.includes('약 버리')) {
    category = '폐의약품';
    subCategory = '가정 내 불용의약품 수거';
    department = '보건행정팀';
    testRequired = false;
    sameDayIssuance = true;
    expectedDuration = '즉시 배출 가능';
    charge = '무료';
    keyTakeaways = [
      '배방보건지소 1층 현관 전용수거함 배출',
      '알약: 은박지/포장재 제거 후 알약끼리 모아서 배출',
      '가루약: 포장 그대로 배출',
      '물약: 한 병에 모아 뚜껑을 꽉 닫아 배출'
    ];
    answerCore = '가정에서 복용 후 남은 폐의약품은 배방보건지소 1층 현관 전용 수거함이나 인근 약국, 행정복지센터에 배출하실 수 있습니다. 알약은 PTP 포장재를 벗겨 알약끼리 봉투에 모으고, 물약은 새지 않게 한 병에 모아 마개를 닫은 후 배출해 주시기 바랍니다.';
  } else if ((q.includes('의사') || q.includes('진료') || q.includes('내과')) && (q.includes('없') || q.includes('부재') || q.includes('진료 가능') || q.includes('약 처방'))) {
    category = '진료';
    subCategory = '내과진료 운영 지침';
    department = '내과진료실 / 보건행정';
    testRequired = false;
    sameDayIssuance = false;
    expectedDuration = '당일 처방전 발급';
    charge = '진료비 500원 (만 65세 이상 무료)';
    keyTakeaways = [
      '내과진료 부재 시 일반진료 및 처방전 발행 중단',
      '보건증 등 제증명, 모자보건, 인지선별검사는 정상 운영',
      '진료 필요 시 아산시보건소 본소 또는 관내 의원 안내'
    ];
    if (operatingStatus.internalMedicine.status === 'ABSENT') {
      isAffected = true;
      todayNotice = '금일은 내과 진료 의사 부재일입니다.';
      answerCore = '금일 배방보건지소는 내과 진료 의사 부재로 일반 진료 및 처방전 발급이 불가능합니다. 진료나 처방이 급하신 경우 인근 민간 병·의원 또는 아산시보건소 본소(온천동)를 이용해 주시기 바라며, 보건증 등 제증명, 임산부 영양제, 인지선별검사 등은 정상 가능합니다.';
    } else {
      answerCore = '배방보건지소 내과진료실은 평일 09:00부터 18:00까지 정상 진료 및 만성질환 약 처방을 실시하고 있습니다. (점심시간 12:00~13:00, 당일 접수마감 17:30)';
    }
  } else {
    // General answer
    answerCore = `${primaryDoc.summary}. 구체적인 업무 처리를 위해 신분증을 지참하시고 방문해 주시기 바랍니다.`;
    keyTakeaways = primaryDoc.keyPoints.slice(0, 4);
  }

// Helper to normalize response styles
function normalizeStyle(raw: string | undefined): ResponseStyle {
  if (!raw) return 'PHONE';
  const upper = raw.toUpperCase().replace(/[\s-]/g, '_');
  if (upper.includes('BRIEF') || upper.includes('CONCISE')) return 'VERY_BRIEF';
  if (upper.includes('FRIEND') || upper.includes('KAKAO')) return 'FRIENDLY';
  if (upper.includes('STAND') || upper.includes('PUBLIC')) return 'STANDARD';
  if (upper.includes('PHONE') || upper.includes('GREET')) return 'PHONE';
  if (upper.includes('SMS') || upper.includes('TEXT') || upper.includes('MESSAGE')) return 'SMS';
  if (upper.includes('DOC') || upper.includes('FORMAL') || upper.includes('OFFICIAL')) return 'OFFICIAL_DOC';
  return 'PHONE';
}

  // Format by requested 6 styles
  const effectiveStyle = normalizeStyle(style);
  let finalAnswerText = '';
  switch (effectiveStyle) {
    case 'VERY_BRIEF':
      // 'very brief' (아주 짧게): 1~2문장 핵심만 직답
      finalAnswerText = answerCore;
      break;
    case 'FRIENDLY':
      // 'friendly' (친절하게): 따뜻하고 친절한 공감형 대화체
      finalAnswerText = `안녕하세요! 배방보건지소입니다. 문의주신 내용 친절하게 안내해 드릴게요. 😊\n\n${answerCore}\n\n혹시 더 궁금하시거나 도움이 필요하신 부분이 있다면 언제든 편하게 말씀해 주세요!`;
      break;
    case 'STANDARD':
      // 'standard public institution' (공공기관 표준형): 격식 있고 정중한 공공기관 공식 안내
      finalAnswerText = `안녕하십니까. 아산시 배방보건지소입니다.\n\n문의하신 사항에 대하여 다음과 같이 정중히 안내해 드립니다.\n\n${answerCore}\n\n배방보건지소는 시민 여러분의 건강과 편의를 위하여 최선을 다하겠습니다. 감사합니다.`;
      break;
    case 'PHONE':
      // 'phone greeting' (전화응대형): 전화 수화기 스크립트
      finalAnswerText = `네, 배방보건지소입니다. 문의하신 내용 확인해 드리겠습니다.\n\n${answerCore}\n\n추가로 더 궁금하신 점이 있으실까요?`;
      break;
    case 'SMS':
      // 'text message' (문자용): 말머리와 발송 서식
      finalAnswerText = `[배방보건지소 민원 안내]\n안녕하십니까. 문의하신 사항 안내드립니다.\n\n${answerCore}\n\n- 준비물: 본인 신분증 필히 지참\n- 문의처: 배방보건지소 041-537-3400\n감사합니다.`;
      break;
    case 'OFFICIAL_DOC':
      // 'official document response' (공문·행정 서면 답변서형)
      finalAnswerText = `[민원 처리 결과 통지]\n\n귀하께서 질의하신 민원 사항에 대하여 관련 법령 및 지침에 의거하여 다음과 같이 회신합니다.\n\n1. 관련 근거: ${primaryDoc.title} (시행·개정일: ${primaryDoc.effectiveDate}, ${primaryDoc.version})\n2. 처리 내용: ${answerCore}\n3. 행정 안내: 당일 운영 상황 및 지침에 따라 처리 기준이 상이할 수 있으니 방문 전 사전 확인 바랍니다.\n\n아산시 배방보건지소`;
      break;
    default:
      finalAnswerText = answerCore;
      break;
  }

  return {
    id: `ans-${Date.now()}`,
    question,
    category,
    subCategory,
    department,
    style: effectiveStyle,
    answerText: finalAnswerText,
    staffTakeaway: {
      serviceName: subCategory,
      testRequired,
      sameDayIssuance,
      expectedDuration,
      charge,
      department,
      keyTakeaways,
    },
    clarificationNeeded,
    safetyWarning,
    references: relevantDocs.map(d => ({
      docId: d.id,
      docTitle: d.title,
      effectiveDate: d.effectiveDate,
      version: d.version,
      relevantQuote: d.keyPoints[0] || d.summary,
      section: d.keyPoints[0] ? `핵심기준: ${d.keyPoints[0].slice(0, 40)}` : '제1조 총칙 및 업무기준',
    })),
    todayContextApplied: {
      isAffected,
      reason: todayNotice || '금일 정상 운영 기준이 적용되었습니다.',
    },
    generatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
  };
}

// 4. AI 민원 답변 생성 엔드포인트
app.post('/api/generate-answer', async (req: Request, res: Response) => {
  try {
    const { question, style = 'PHONE', operatingStatus = currentOperatingStatus, categoryHint } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: '민원 질문을 입력해주세요.' });
    }

    const trimmedQuestion = question.trim();
    const safetyWarning = detectMedicalSafetyWarning(trimmedQuestion);
    const relevantDocs = findRelevantDocs(trimmedQuestion, categoryHint);

    const gemini = getGeminiClient();

    // If no Gemini client, run intelligent built-in RAG engine
    if (!gemini) {
      const fallbackResult = generateFallbackRAG(trimmedQuestion, style, operatingStatus, relevantDocs, safetyWarning);
      return res.json(fallbackResult);
    }

    // Prepare structured Gemini prompt
    const docsContext = relevantDocs.map((d, idx) => `
[문서 ${idx + 1}]
- 제목: ${d.title}
- 부서: ${d.department}
- 시행일: ${d.effectiveDate} (${d.version})
- 요약: ${d.summary}
- 핵심 기준:
${d.keyPoints.map(kp => `  * ${kp}`).join('\n')}
- 본문 발췌:
${d.content.slice(0, 500)}
`).join('\n---\n');

    const operatingContext = `
[금일 배방보건지소 실시간 운영 상황 (날짜: ${operatingStatus.date})]
- 1. 내과진료: ${operatingStatus.internalMedicine.status} (${operatingStatus.internalMedicine.timeRange || ''} ${operatingStatus.internalMedicine.note || '정상'})
- 2. 보건증 등 제증명: ${operatingStatus.certificates.status} (${operatingStatus.certificates.timeRange || ''} ${operatingStatus.certificates.note || '정상'}, 재개예정: ${operatingStatus.certificates.resumedAt || '해당없음'})
- 3. 인지선별검사: ${operatingStatus.cognitiveScreening.status} (${operatingStatus.cognitiveScreening.note || '정상'})
- 4. 기초건강측정: ${operatingStatus.basicHealth.status} (${operatingStatus.basicHealth.note || '정상'})
- 5. 운전면허적성검사: ${operatingStatus.driversAptitude.status} (${operatingStatus.driversAptitude.note || '정상'})
- 6. 모자보건업무: ${operatingStatus.maternalChildHealth.status} (${operatingStatus.maternalChildHealth.note || '정상'})
- 당일 특이사항 공지: ${operatingStatus.generalNotice || '특이사항 없음'}
`;

    const normalizedReqStyle = normalizeStyle(style);

    const styleInstructions: Record<ResponseStyle, string> = {
      VERY_BRIEF: 'very brief (아주 짧게): 1~2문장의 가장 핵심적인 직답. 군더더기 없이 결과, 필수 준비물, 가능 여부만 명쾌하게 전달.',
      FRIENDLY: 'friendly (친절하게): 따뜻하고 공감하며 배려하는 어조의 친절한 대화체 ("안녕하세요! 배방보건지소입니다. 문의주신 내용 안내해 드릴게요. 😊" 등).',
      STANDARD: 'standard public institution (공공기관 표준형): 행정 공공기관의 공식적이고 정중한 표준 안내문 ("안녕하십니까. 아산시 배방보건지소입니다...").',
      PHONE: 'phone greeting (전화응대형): 배방보건지소 직원이 수화기를 들고 민원인에게 친절하고 똑부러지게 안내하는 구어체 통화 스크립트 ("네, 배방보건지소입니다. 문의하신 내용 확인해 드리겠습니다... 추가로 궁금하신 점 있으실까요?").',
      SMS: 'text message (문자용): 직원이 복사해서 문자로 바로 보낼 수 있는 공공기관 공식 문자 양식 ([배방보건지소] 말머리, 준비물, 문의처 포함).',
      OFFICIAL_DOC: 'official document response (공문·행정 서면 답변서형): 민원 통지서나 행정 서면에 사용되는 격식 있고 규격화된 회신문 양식 ("귀하께서 질의하신 민원 사항에 대하여 다음과 같이 회신합니다...").',
    };

    const systemPrompt = `
당신은 대한민국 충청남도 아산시 '배방보건지소'의 공식 민원 응대 지원 AI 어시스턴트입니다.
내부 직원이 민원인의 전화/방문 질문을 입력했을 때, 배방보건지소의 실제 업무지침과 [오늘의 실시간 운영 상황]을 결합하여 정확하고 신뢰성 높은 답변을 생성합니다.

[절대 원칙]
1. 최우선 예외 판단: 만약 민원 내용과 관련된 인력/장비(예: 방사선사 09~14시 부재, 의사 부재 등)에 오늘 특이사항이 있다면, 일반 기준만 안내하지 말고 "금일 방사선사 부재로 인해..."처럼 [오늘의 상황]을 반드시 먼저 또는 결합하여 안내하십시오!
2. 질문이 불충분할 때(예: 운전면허 1종인지 2종인지 불분명, 검사 목적 불분명): 억지로 추측하지 말고 직원이 민원인에게 되물어야 할 확인 사항을 clarificationNeeded 배열에 명시하십시오.
3. 의료법 준수 및 진단·처방 금지: 투약 중단, 용량 변경, 질환 진단 요구 시 답변을 거절하고 반드시 의과 진료나 119 안내를 권고하는 안전 안내를 제공하십시오.
4. 반드시 제공된 근거 문서(문서명, 시행일, 발췌문)를 기반으로 답변하며, 임의로 허위 사실을 만들지 마십시오.
`;

    const userPrompt = `
[민원 질문]
"${trimmedQuestion}"

[요청 답변 스타일]
${styleInstructions[normalizedReqStyle] || styleInstructions.PHONE}

${operatingContext}

[배방보건지소 업무지침 DB]
${docsContext}

반드시 JSON 형태로만 응답하세요.
`;

    const response = await gemini.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: '민원 분류 카테고리 (제증명, 진료, 운전면허, 예방접종, 치매, 기초건강측정, 모자보건, 금연, 폐의약품, 인력부재기준, 기타)' },
            subCategory: { type: Type.STRING, description: '세부 업무명 (예: 건강진단결과서 발급)' },
            department: { type: Type.STRING, description: '담당 부서 (예: 제증명창구)' },
            answerText: { type: Type.STRING, description: '민원인에게 전달할 최종 답변 본문' },
            staffTakeaway: {
              type: Type.OBJECT,
              properties: {
                serviceName: { type: Type.STRING },
                testRequired: { type: Type.BOOLEAN, description: '검사 또는 방문 필요 여부' },
                sameDayIssuance: { type: Type.BOOLEAN, description: '당일 발급 가능 여부' },
                expectedDuration: { type: Type.STRING, description: '예상 발급/소요 기간' },
                charge: { type: Type.STRING, description: '수수료 또는 비용' },
                department: { type: Type.STRING, description: '담당 부서' },
                keyTakeaways: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '직원이 알아야 할 핵심 업무 참고 사항 요약 3~4개'
                }
              },
              required: ['serviceName', 'testRequired', 'sameDayIssuance', 'expectedDuration', 'charge', 'department', 'keyTakeaways']
            },
            clarificationNeeded: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '민원인에게 추가로 확인해야 할 사항 (필요 없을 시 빈 배열)'
            },
            safetyWarning: {
              type: Type.STRING,
              description: '의료법상 진단·처방 주의사항 또는 응급 경고 (해당 없으면 null 또는 빈 문자열)'
            },
            references: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  docTitle: { type: Type.STRING, description: '참고 문서 제목' },
                  effectiveDate: { type: Type.STRING, description: '시행일' },
                  version: { type: Type.STRING, description: '버전' },
                  relevantQuote: { type: Type.STRING, description: '원문 발췌' },
                  section: { type: Type.STRING, description: '관련 조항' }
                },
                required: ['docTitle', 'effectiveDate', 'relevantQuote', 'section']
              }
            },
            todayContextApplied: {
              type: Type.OBJECT,
              properties: {
                isAffected: { type: Type.BOOLEAN, description: '오늘의 운영상황(부재 등)이 답변에 적용되었는지 여부' },
                reason: { type: Type.STRING, description: '적용된 운영상황 내용' }
              },
              required: ['isAffected', 'reason']
            }
          },
          required: ['category', 'subCategory', 'department', 'answerText', 'staffTakeaway', 'clarificationNeeded', 'references', 'todayContextApplied']
        }
      }
    });

    const rawText = response.text || '';
    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      console.warn('Failed to parse JSON from Gemini response, using fallback RAG parser', parseErr);
      const fallbackResult = generateFallbackRAG(trimmedQuestion, style, operatingStatus, relevantDocs, safetyWarning);
      return res.json(fallbackResult);
    }

    const finalResult: AnswerResult = {
      id: `ans-${Date.now()}`,
      question: trimmedQuestion,
      category: parsed.category || relevantDocs[0]?.category || '기타',
      subCategory: parsed.subCategory || '보건지소 민원',
      department: parsed.department || '배방보건지소',
      style: normalizedReqStyle,
      answerText: parsed.answerText || '',
      staffTakeaway: parsed.staffTakeaway || {
        serviceName: parsed.subCategory || '민원 안내',
        testRequired: false,
        sameDayIssuance: false,
        expectedDuration: '당일 안내',
        charge: '무료',
        department: parsed.department || '배방보건지소',
        keyTakeaways: ['업무 기준 확인 필요'],
      },
      clarificationNeeded: parsed.clarificationNeeded || [],
      safetyWarning: safetyWarning || (parsed.safetyWarning && parsed.safetyWarning.trim().length > 0 ? parsed.safetyWarning : null),
      references: Array.isArray(parsed.references) && parsed.references.length > 0 ? parsed.references : relevantDocs.map(d => ({
        docId: d.id,
        docTitle: d.title,
        effectiveDate: d.effectiveDate,
        version: d.version,
        relevantQuote: d.keyPoints[0] || d.summary,
        section: d.keyPoints[0] ? `핵심기준: ${d.keyPoints[0].slice(0, 40)}` : '제1조 총칙 및 업무기준',
      })),
      todayContextApplied: parsed.todayContextApplied || {
        isAffected: false,
        reason: '정상 운영 기준 적용',
      },
      generatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    res.json(finalResult);
  } catch (err: any) {
    console.error('Error generating AI answer:', err);
    // Graceful fallback so user never gets blocked
    const fallback = generateFallbackRAG(
      req.body.question || '',
      req.body.style || 'PHONE',
      req.body.operatingStatus || currentOperatingStatus,
      findRelevantDocs(req.body.question || ''),
      detectMedicalSafetyWarning(req.body.question || '')
    );
    res.json(fallback);
  }
});

// 5. Rephrase existing answer in another style
app.post('/api/rephrase', async (req: Request, res: Response) => {
  const { currentAnswer, newStyle }: { currentAnswer: AnswerResult; newStyle: ResponseStyle } = req.body;
  if (!currentAnswer || !newStyle) {
    return res.status(400).json({ error: '필수 데이터가 누락되었습니다.' });
  }

  const normalizedNewStyle = normalizeStyle(newStyle);

  // Convert style directly or with Gemini
  const rephrased = generateFallbackRAG(
    currentAnswer.question,
    normalizedNewStyle,
    currentOperatingStatus,
    findRelevantDocs(currentAnswer.question, currentAnswer.category),
    currentAnswer.safetyWarning
  );

  // Preserve core metadata
  res.json({
    ...currentAnswer,
    style: normalizedNewStyle,
    answerText: rephrased.answerText,
  });
});

// Vite middleware in dev or static files in production
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[배방보건지소 민원 AI답변] Server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch(err => {
  console.error('Failed to start server:', err);
});
