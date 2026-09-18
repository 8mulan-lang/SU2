export type StaffRole = 'CIVIL_AFFAIRS' | 'ADMIN';

export type OperatingStatusLevel = 'NORMAL' | 'ABSENT' | 'TIME_BOUND' | 'RESERVATION_ONLY' | 'PAUSED';

export interface UnitStatus {
  status: OperatingStatusLevel;
  timeRange?: string; // e.g. "09:00 ~ 14:00 부재"
  note?: string;      // e.g. "관내 출장으로 인한 부재"
  resumedAt?: string; // e.g. "오후 2시 이후 정상"
}

export interface TodayOperatingStatus {
  date: string;                      // e.g. "2026-09-18"
  internalMedicine: UnitStatus;      // 내과진료
  certificates: UnitStatus;          // 보건증 등 제증명
  cognitiveScreening: UnitStatus;    // 인지선별검사
  basicHealth: UnitStatus;           // 기초건강측정
  driversAptitude: UnitStatus;       // 운전면허적성검사
  maternalChildHealth: UnitStatus;   // 모자보건업무
  generalNotice: string;             // 당일 특이사항
  updatedAt: string;
  updatedBy: string;
}

export interface StaffUser {
  id: string;
  name: string;
  position: string;
  department: string;
  isLoggedIn: boolean;
}

export type DocumentCategory = 
  | '제증명'
  | '진료'
  | '운전면허'
  | '예방접종'
  | '치매'
  | '기초건강측정'
  | '모자보건'
  | '금연'
  | '폐의약품'
  | '인력부재기준'
  | '기타';

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  department: string;
  effectiveDate: string; // e.g. "2026.09.01"
  version: string;       // e.g. "v2.4"
  summary: string;
  content: string;
  keyPoints: string[];
  tags: string[];
  isLatest: boolean;
  author: string;
  updatedAt: string;
}

export type ResponseStyle = 
  | 'VERY_BRIEF'     // very brief (아주 짧게)
  | 'FRIENDLY'       // friendly (친절하게)
  | 'STANDARD'       // standard public institution (공공기관 표준형)
  | 'PHONE'          // phone greeting (전화응대형)
  | 'SMS'            // text message (문자용)
  | 'OFFICIAL_DOC';  // official document response (민원 답변서·공문용)

export interface StaffReference {
  docId?: string;
  docTitle: string;
  effectiveDate: string;
  version?: string;
  relevantQuote: string;
  section: string;
}

export interface StaffTakeaway {
  serviceName: string;
  testRequired: boolean;
  sameDayIssuance: boolean;
  expectedDuration: string;
  charge: string;
  department: string;
  keyTakeaways: string[];
}

export interface AnswerResult {
  id: string;
  question: string;
  category: DocumentCategory;
  subCategory: string;
  department: string;
  style: ResponseStyle;
  answerText: string;
  staffTakeaway: StaffTakeaway;
  clarificationNeeded: string[];
  safetyWarning: string | null;
  references: StaffReference[];
  todayContextApplied: {
    isAffected: boolean;
    reason: string;
  };
  generatedAt: string;
  copiedCount?: number;
}
