import React, { useEffect, useRef } from 'react';
import { X, FileText, Calendar, Building, CheckCircle2, Tag, Bookmark, ExternalLink } from 'lucide-react';
import { KnowledgeDocument } from '../types';

interface DocumentModalProps {
  document: KnowledgeDocument | null;
  highlightQuote?: string;
  targetSection?: string;
  onClose: () => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  document,
  highlightQuote,
  targetSection,
  onClose,
}) => {
  const targetElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (targetElementRef.current) {
      setTimeout(() => {
        targetElementRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
    }
  }, [document, highlightQuote, targetSection]);

  if (!document) return null;

  // Split document content into lines or sections for granular highlight
  const contentBlocks = document.content.split('\n\n');

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-teal-800 tracking-wide">
                  배방보건지소 공식 업무지침 원문
                </span>
                <span className="text-[10px] bg-teal-100 text-teal-900 font-semibold px-1.5 py-0.2 rounded-sm">
                  {document.version}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                {document.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Meta Info Bar */}
        <div className="px-5 py-2.5 bg-slate-100/90 border-b border-slate-200 text-xs flex flex-wrap items-center gap-4 text-slate-700">
          <div className="flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <span>담당부서: <strong className="font-semibold text-slate-900">{document.department}</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>개정·시행일: <strong className="font-semibold text-teal-800">{document.effectiveDate}</strong></span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-slate-600">
            <span>문서번호: <span className="font-mono text-slate-800">{document.id}</span></span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm">
          {/* Target Citation / Highlight Banner */}
          {(highlightQuote || targetSection) && (
            <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-950 text-xs flex items-start gap-2.5 shadow-2xs">
              <Bookmark className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-900">
                  📌 AI 답변이 인용한 원문 해당 조항 &amp; 발췌문
                </span>
                {targetSection && (
                  <div className="font-semibold text-amber-800 mt-0.5">
                    조항: {targetSection}
                  </div>
                )}
                {highlightQuote && (
                  <p className="italic font-medium text-amber-950 mt-1 pl-2 border-l-2 border-amber-400">
                    "{highlightQuote}"
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Key processing standards */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              주요 핵심 처리기준
            </h4>
            <ul className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/90 text-xs text-slate-700">
              {document.keyPoints.map((kp, idx) => {
                const isCited = highlightQuote && kp.includes(highlightQuote.slice(0, 15));
                return (
                  <li 
                    key={idx} 
                    className={`flex items-start gap-1.5 p-1 rounded-md transition-colors ${
                      isCited ? 'bg-amber-100 text-amber-950 font-semibold' : ''
                    }`}
                  >
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{kp}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Full content with highlighted target section */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center justify-between">
              <span>업무지침 원문 전문 (관련 조항 자동 연결)</span>
              <span className="text-[11px] text-slate-400 font-normal">
                스크롤하여 전체 조항 열람 가능
              </span>
            </h4>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed max-h-80 overflow-y-auto space-y-3">
              {contentBlocks.map((block, idx) => {
                const isTargetBlock = 
                  (highlightQuote && block.includes(highlightQuote.slice(0, 12))) ||
                  (targetSection && block.includes(targetSection.slice(0, 8)));

                if (isTargetBlock) {
                  return (
                    <div
                      key={idx}
                      ref={targetElementRef}
                      className="p-3 rounded-lg bg-teal-50 border-2 border-teal-500 text-teal-950 shadow-xs relative"
                    >
                      <div className="flex items-center gap-1 text-[11px] font-bold text-teal-800 mb-1">
                        <ExternalLink className="w-3 h-3 text-teal-700" />
                        <span>[직접 연결된 원문 섹션]</span>
                      </div>
                      <p className="whitespace-pre-line font-medium leading-relaxed">
                        {block}
                      </p>
                    </div>
                  );
                }

                return (
                  <p key={idx} className="whitespace-pre-line text-slate-700 leading-relaxed">
                    {block}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {document.tags.map((t, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]">
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            문서 관리자: {document.author} · 최종 업데이트: {document.updatedAt || document.effectiveDate}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
