import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  Clock, 
  Tag, 
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { AnswerResult } from '../types';

interface HistoryDrawerProps {
  history: AnswerResult[];
  onSelectResult: (result: AnswerResult) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onSelectResult,
  onClearHistory,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const handleCopy = async (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = history.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.question.toLowerCase().includes(q) ||
      item.answerText.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.subCategory.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-teal-600" />
              민원 AI 답변 생성 기록
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {history.length}건
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            이번 업무 세션 동안 생성된 민원 답변 내역입니다. 클릭 시 다시 불러오거나 복사할 수 있습니다.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>기록 모두 지우기</span>
          </button>
        )}
      </div>

      {/* Search */}
      {history.length > 0 && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="이전 질문, 답변 내용 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-teal-600 bg-slate-50/50"
          />
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectResult(item)}
            className="p-4 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  {item.category}
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  {item.subCategory}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{item.generatedAt}</span>
              </div>
            </div>

            {/* Question */}
            <div className="text-sm font-bold text-slate-900 mb-2 group-hover:text-teal-900 flex items-start justify-between gap-2">
              <span>Q. {item.question}</span>
              <button
                type="button"
                onClick={(e) => handleCopy(item.id, item.answerText, e)}
                className={`shrink-0 p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                  copiedId === item.id
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="답변 복사"
              >
                {copiedId === item.id ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>

            {/* Snippet */}
            <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
              {item.answerText}
            </p>

            <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-400">
              <span>스타일: {item.style}</span>
              <span className="text-teal-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                불러오기 <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}

        {history.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            아직 생성된 민원 답변 기록이 없습니다. 질문을 입력하면 여기에 자동 저장됩니다.
          </div>
        )}

        {history.length > 0 && filtered.length === 0 && (
          <div className="py-8 text-center text-slate-400 text-xs">
            검색어와 일치하는 답변 기록이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};
