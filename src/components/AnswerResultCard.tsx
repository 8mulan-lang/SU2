import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  FileText, 
  HelpCircle, 
  ShieldAlert, 
  Clock, 
  Building, 
  Coins, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Sparkles,
  Phone,
  MessageSquare,
  Building2,
  Zap,
  HeartHandshake,
  Calendar,
  Bookmark
} from 'lucide-react';
import { AnswerResult, ResponseStyle } from '../types';

interface AnswerResultCardProps {
  result: AnswerResult;
  onStyleChange: (newStyle: ResponseStyle) => void;
  onViewDocument: (docTitle: string, quote?: string, section?: string, docId?: string) => void;
  isRephrasing: boolean;
}

export const AnswerResultCard: React.FC<AnswerResultCardProps> = ({
  result,
  onStyleChange,
  onViewDocument,
  isRephrasing,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.answerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const styleTabs: { id: ResponseStyle; label: string; enLabel: string; icon: any }[] = [
    { id: 'VERY_BRIEF', label: '아주 짧게', enLabel: 'very brief', icon: Zap },
    { id: 'FRIENDLY', label: '친절하게', enLabel: 'friendly', icon: HeartHandshake },
    { id: 'STANDARD', label: '공공기관 표준', enLabel: 'standard public institution', icon: Building2 },
    { id: 'PHONE', label: '전화응대', enLabel: 'phone greeting', icon: Phone },
    { id: 'SMS', label: '문자용', enLabel: 'text message', icon: MessageSquare },
    { id: 'OFFICIAL_DOC', label: '공문·답변서', enLabel: 'official document response', icon: FileText },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all">
      {/* Top Classification Bar */}
      <div className="bg-slate-900 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-teal-400">민원 자동 분류:</span>
          <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-bold">
            {result.category}
          </span>
          <span className="text-slate-400">›</span>
          <span className="font-semibold text-slate-200">{result.subCategory}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span className="flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-teal-400" />
            담당: {result.department}
          </span>
          <span className="text-slate-500">|</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {result.generatedAt}
          </span>
        </div>
      </div>

      {/* Exception Banner if today's status applied */}
      {result.todayContextApplied?.isAffected && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-start gap-2.5 text-xs text-amber-950">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-900">[오늘의 보건지소 운영상황 결합 반영] </span>
            <span>{result.todayContextApplied.reason}</span>
          </div>
        </div>
      )}

      <div className="p-5 sm:p-6 space-y-6">
        {/* 1. Main Citizen Answer Section */}
        <div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 font-bold text-xs border border-teal-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                민원인 전달용 답변
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                (원하는 스타일을 클릭하면 즉시 재작성됩니다)
              </span>
            </div>

            {/* Rephrase 6 Style Switcher */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {styleTabs.map((tab) => {
                const Icon = tab.icon;
                const active = result.style === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onStyleChange(tab.id)}
                    disabled={isRephrasing}
                    title={`${tab.label} (${tab.enLabel})`}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all ${
                      active
                        ? 'bg-white text-teal-900 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <Icon className={`w-3 h-3 ${active ? 'text-teal-600' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Answer Box */}
          <div className="relative rounded-2xl bg-slate-50/80 border border-slate-200 p-4 sm:p-5">
            <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed whitespace-pre-line text-[14.5px]">
              {result.answerText}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                적용 스타일: <strong className="font-semibold text-slate-700">{styleTabs.find(s => s.id === result.style)?.label || result.style}</strong>
                <span className="text-slate-400">({styleTabs.find(s => s.id === result.style)?.enLabel})</span>
              </span>

              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-xs'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>답변 복사</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Staff Reference / Takeaways Section */}
        <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              업무 담당자 참고 사항
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              내부 확인용 가이드
            </span>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
              <div className="text-[11px] text-slate-500">검사/방문 필요</div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                {result.staffTakeaway.testRequired ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> 검사 필요
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-slate-400" /> 불필요
                  </>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
              <div className="text-[11px] text-slate-500">당일 발급 여부</div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                {result.staffTakeaway.sameDayIssuance ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 당일 발급 가능
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-rose-500" /> 당일 발급 불가
                  </>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
              <div className="text-[11px] text-slate-500">예상 소요/발급 기간</div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                {result.staffTakeaway.expectedDuration}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
              <div className="text-[11px] text-slate-500">수수료 / 비용</div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                {result.staffTakeaway.charge}
              </div>
            </div>
          </div>

          {/* Key Bullet Takeaways */}
          {result.staffTakeaway.keyTakeaways && result.staffTakeaway.keyTakeaways.length > 0 && (
            <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
              {result.staffTakeaway.keyTakeaways.map((point, idx) => (
                <li key={idx} className="leading-snug">
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 3. Clarifications Needed Section */}
        {result.clarificationNeeded && result.clarificationNeeded.length > 0 && (
          <div className="rounded-2xl p-4 bg-amber-50/70 border border-amber-200/80">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-2">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              민원인에게 추가 확인이 필요한 사항
            </h4>
            <p className="text-xs text-amber-800 mb-2">
              정확한 응대를 위해 다음 사항을 민원인에게 먼저 확인해 주십시오:
            </p>
            <div className="space-y-1">
              {result.clarificationNeeded.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-amber-900">
                  <span className="font-bold text-amber-700">{idx + 1}.</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Medical Safety Warning Section */}
        {result.safetyWarning && (
          <div className="rounded-2xl p-4 bg-rose-50 border border-rose-200">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-900">
                  위험 답변 방지 및 의료법 준수 안내
                </h4>
                <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                  {result.safetyWarning}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. Grounds & References Section: Titles, Revision Dates, and View Source Document Button */}
        <div className="border-t border-slate-200/80 pt-4">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-teal-600" />
              AI 답변 근거 및 출처 문서 (Source Documents)
            </h4>
            <span className="text-[11px] text-slate-500">
              배방보건지소 공식 지침 기반
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.references.map((ref, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between shadow-2xs hover:border-teal-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1" title={ref.docTitle}>
                      📄 {ref.docTitle}
                    </span>
                    {ref.version && (
                      <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-sm shrink-0">
                        {ref.version}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 mb-2">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      개정·시행일: <strong className="text-slate-800 font-semibold">{ref.effectiveDate}</strong>
                    </span>
                    {ref.section && (
                      <span className="inline-flex items-center gap-1 text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-200">
                        관련 조항: {ref.section}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-700 line-clamp-2 italic bg-white p-2 rounded-lg border border-slate-200/80 leading-relaxed">
                    "{ref.relevantQuote}"
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    인용 조항 직접 연결
                  </span>
                  <button
                    type="button"
                    onClick={() => onViewDocument(ref.docTitle, ref.relevantQuote, ref.section, ref.docId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 active:bg-teal-200 border border-teal-300 shadow-2xs transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-700" />
                    <span>View Source Document (원문 문서 보기)</span>
                    <ExternalLink className="w-3 h-3 text-teal-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
