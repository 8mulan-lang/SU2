import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  Phone, 
  MessageSquare, 
  FileText, 
  Building2, 
  Zap, 
  HeartHandshake,
  RotateCcw,
  Tag
} from 'lucide-react';
import { ResponseStyle, DocumentCategory } from '../types';

interface QuestionInputSectionProps {
  onGenerate: (question: string, style: ResponseStyle, categoryHint?: DocumentCategory) => void;
  isLoading: boolean;
  activeStyle: ResponseStyle;
  setActiveStyle: (style: ResponseStyle) => void;
}

const exampleQuestions = [
  { text: '보건증 오늘 바로 받을 수 있어요?', category: '제증명' as DocumentCategory },
  { text: '오늘 의사 선생님 안 계신데 진료 가능해요?', category: '진료' as DocumentCategory },
  { text: '오늘 방사선사 없으면 보건증 검사 되나요?', category: '제증명' as DocumentCategory },
  { text: '임신했는데 보건지소에서 받을 수 있는 검사와 혜택이 뭐예요?', category: '모자보건' as DocumentCategory },
  { text: '1종 운전면허 적성검사 받으려면 뭐 가져가야 하나요?', category: '운전면허' as DocumentCategory },
  { text: '치매검사는 몇 살부터 해요? 비용이 드나요?', category: '치매' as DocumentCategory },
  { text: '혈압이 180인데 약 안 먹어도 되나요?', category: '진료' as DocumentCategory }, // safety warning
  { text: '집에 먹다 남은 폐의약품 어디다 버려요?', category: '폐의약품' as DocumentCategory },
];

const stylesConfig: { id: ResponseStyle; label: string; enLabel: string; icon: any; desc: string }[] = [
  { 
    id: 'VERY_BRIEF', 
    label: '아주 짧게', 
    enLabel: 'very brief', 
    icon: Zap, 
    desc: 'very brief: 1~2문장 핵심만 즉시 전달하는 초간결 답변' 
  },
  { 
    id: 'FRIENDLY', 
    label: '친절하게', 
    enLabel: 'friendly', 
    icon: HeartHandshake, 
    desc: 'friendly: 따뜻하고 공감하며 배려하는 어조의 친근한 대화형 답변' 
  },
  { 
    id: 'STANDARD', 
    label: '공공기관 표준', 
    enLabel: 'standard public institution', 
    icon: Building2, 
    desc: 'standard public institution: 격식 있고 정중하며 신뢰성을 주는 표준 행정 공공기관 안내문' 
  },
  { 
    id: 'PHONE', 
    label: '전화응대', 
    enLabel: 'phone greeting', 
    icon: Phone, 
    desc: 'phone greeting: "네, 배방보건지소입니다"로 시작하는 직관적인 음성 통화 응대 스크립트' 
  },
  { 
    id: 'SMS', 
    label: '문자(SMS)', 
    enLabel: 'text message', 
    icon: MessageSquare, 
    desc: 'text message: [배방보건지소] 말머리, 준비물, 문의처가 정돈된 문자 발송 서식' 
  },
  { 
    id: 'OFFICIAL_DOC', 
    label: '공문·답변서', 
    enLabel: 'official document response', 
    icon: FileText, 
    desc: 'official document response: 민원 통지서 규격에 맞춘 공문 및 서면 회신문' 
  },
];

export const QuestionInputSection: React.FC<QuestionInputSectionProps> = ({
  onGenerate,
  isLoading,
  activeStyle,
  setActiveStyle,
}) => {
  const [question, setQuestion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | undefined>(undefined);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim() || isLoading) return;
    onGenerate(question.trim(), activeStyle, selectedCategory);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleChipClick = (q: string, cat: DocumentCategory) => {
    setQuestion(q);
    setSelectedCategory(cat);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs">
      <form onSubmit={handleSubmit}>
        {/* Title and Keyboard Hint */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <label htmlFor="civil-question-input" className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            민원 내용 입력 (전화·방문·문자)
          </label>
          <span className="text-xs text-slate-500">
            Ctrl + Enter 키로 즉시 답변 생성
          </span>
        </div>

        {/* Textarea */}
        <div className="relative rounded-xl border border-slate-300 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100 transition-all bg-slate-50/50">
          <textarea
            id="civil-question-input"
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="민원인의 질문이나 전화 내용을 그대로 입력하세요. (예: '보건증 오늘 바로 받을 수 있어요?', '오늘 의사 선생님 안 계신데 진료 돼요?', '1종 운전면허 적성검사 준비물이 뭔가요?')"
            className="w-full px-4 py-3 text-sm text-slate-800 bg-transparent border-0 focus:outline-hidden resize-none placeholder:text-slate-400"
          />

          <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200/80 bg-white rounded-b-xl">
            <div className="flex items-center gap-2">
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  <Tag className="w-3 h-3" /> {selectedCategory} 힌트 적용
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(undefined)}
                    className="ml-1 text-teal-500 hover:text-teal-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {question.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setQuestion('')}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> 비우기
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>지침 및 당일상황 반영 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI 민원 답변 생성</span>
                  <Send className="w-3 h-3 ml-0.5 opacity-80" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 6 Response Style Selector Chips */}
        <div className="mt-3.5">
          <div className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              답변 스타일 선택 (Response Styles):
            </span>
            <span className="text-[11px] text-teal-700 font-medium truncate max-w-xs">
              {stylesConfig.find(s => s.id === activeStyle)?.desc}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {stylesConfig.map((style) => {
              const Icon = style.icon;
              const isSelected = activeStyle === style.id;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setActiveStyle(style.id)}
                  className={`flex flex-col items-start p-2 rounded-xl text-xs border transition-all text-left ${
                    isSelected
                      ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-2xs ring-1 ring-teal-500/30'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-700' : 'text-slate-500'}`} />
                    <span>{style.label}</span>
                  </div>
                  <span className={`text-[10px] ${isSelected ? 'text-teal-700 font-medium' : 'text-slate-400'}`}>
                    {style.enLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Example Chips */}
        <div className="mt-3.5 pt-3 border-t border-slate-100">
          <div className="text-xs font-medium text-slate-500 mb-1.5">
            자주 묻는 민원 예시 (클릭 시 자동 입력):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {exampleQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(q.text, q.category)}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 border border-slate-200/70 text-slate-700 transition-colors"
              >
                {q.text}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
