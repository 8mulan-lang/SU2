import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  FileText, 
  Calendar, 
  Building, 
  Tag, 
  CheckCircle2, 
  Trash2, 
  ExternalLink,
  Sparkles,
  Upload,
  X
} from 'lucide-react';
import { KnowledgeDocument, DocumentCategory } from '../types';

interface KnowledgeBaseManagerProps {
  documents: KnowledgeDocument[];
  onAddDocument: (doc: Partial<KnowledgeDocument>) => void;
  onDeleteDocument: (id: string) => void;
  onViewDoc: (doc: KnowledgeDocument) => void;
}

const categories: (DocumentCategory | '전체')[] = [
  '전체',
  '제증명',
  '진료',
  '운전면허',
  '모자보건',
  '치매',
  '예방접종',
  '기초건강측정',
  '금연',
  '폐의약품',
  '인력부재기준',
  '기타'
];

export const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({
  documents,
  onAddDocument,
  onDeleteDocument,
  onViewDoc,
}) => {
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | '전체'>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New doc form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DocumentCategory>('제증명');
  const [newDepartment, setNewDepartment] = useState('배방보건지소');
  const [newEffectiveDate, setNewEffectiveDate] = useState('2026.09.01');
  const [newVersion, setNewVersion] = useState('v1.0');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newKeyPoints, setNewKeyPoints] = useState('');
  const [newTags, setNewTags] = useState('');

  const filteredDocs = documents.filter((doc) => {
    const matchCategory = activeCategory === '전체' || doc.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchQuery = 
      doc.title.toLowerCase().includes(q) ||
      doc.summary.toLowerCase().includes(q) ||
      doc.content.toLowerCase().includes(q) ||
      doc.tags.some(t => t.toLowerCase().includes(q));
    return matchCategory && matchQuery;
  });

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const points = newKeyPoints
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const tagList = newTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onAddDocument({
      title: newTitle.trim(),
      category: newCategory,
      department: newDepartment.trim(),
      effectiveDate: newEffectiveDate.trim(),
      version: newVersion.trim(),
      summary: newSummary.trim() || newTitle.trim(),
      content: newContent.trim(),
      keyPoints: points.length > 0 ? points : ['세부 업무지침 준수'],
      tags: tagList.length > 0 ? tagList : [newCategory],
      author: '직원 등록',
    });

    setIsAddModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewSummary('');
    setNewContent('');
    setNewKeyPoints('');
    setNewTags('');
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              배방보건지소 업무지식 DB
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              총 {documents.length}개 지침
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            배방보건지소의 실제 업무처리기준 및 최신 지침을 관리합니다. AI는 항상 가장 최신(시행일 기준) 자료를 우선 검색하여 답변을 생성합니다.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>신규 업무지침 등록</span>
        </button>
      </div>

      {/* Category Pills and Search Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="지침명, 키워드 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-indigo-600 bg-slate-50/50"
            />
          </div>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              {/* Category & Date */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {doc.category}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  시행: {doc.effectiveDate} ({doc.version})
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-slate-900 mb-1.5 line-clamp-1" title={doc.title}>
                {doc.title}
              </h3>

              {/* Summary */}
              <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                {doc.summary}
              </p>

              {/* Key points preview */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-3">
                <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-indigo-500" />
                  핵심 기준 1조:
                </div>
                <div className="text-xs text-slate-600 line-clamp-2">
                  {doc.keyPoints[0] || '업무 기준 확인'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                {doc.department}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onViewDoc(doc)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1"
                >
                  <span>원문 보기</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                {doc.id.startsWith('doc-custom') && (
                  <button
                    type="button"
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="지침 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
          검색 조건에 맞는 업무지침이 없습니다.
        </div>
      )}

      {/* Add Document Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  신규 업무처리기준 및 지침 등록
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDoc} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">지침 제목 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 2026 배방보건지소 임산부 교통비 지원 업무기준"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">카테고리</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as DocumentCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {categories.filter(c => c !== '전체').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">담당 부서</label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">시행일 (최신순 우선반영)</label>
                  <input
                    type="text"
                    placeholder="2026.09.01"
                    value={newEffectiveDate}
                    onChange={(e) => setNewEffectiveDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">버전</label>
                  <input
                    type="text"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">한 줄 요약</label>
                <input
                  type="text"
                  placeholder="민원인 응대 시 핵심 안내 요약"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">핵심 처리기준 불릿 (줄바꿈 구분)</label>
                <textarea
                  rows={3}
                  placeholder="예:&#10;신분증 지참 필수&#10;당일 발급 불가 (3~4일 소요)&#10;수수료 3,000원"
                  value={newKeyPoints}
                  onChange={(e) => setNewKeyPoints(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">지침 원문 전문 *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="[제1조 목적] ...&#10;[제2조 처리기준] ..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">검색 태그 (쉼표 구분)</label>
                <input
                  type="text"
                  placeholder="보건증, X-선, 장티푸스"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs"
                >
                  등록 및 AI 지식 DB 반영
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
