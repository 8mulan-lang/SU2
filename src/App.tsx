import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TodayStatusBanner } from './components/TodayStatusBanner';
import { QuestionInputSection } from './components/QuestionInputSection';
import { AnswerResultCard } from './components/AnswerResultCard';
import { DocumentModal } from './components/DocumentModal';
import { OperatingStatusModal } from './components/OperatingStatusModal';
import { KnowledgeBaseManager } from './components/KnowledgeBaseManager';
import { HistoryDrawer } from './components/HistoryDrawer';
import { LoginModal } from './components/LoginModal';
import { Footer } from './components/Footer';
import { 
  TodayOperatingStatus, 
  KnowledgeDocument, 
  AnswerResult, 
  ResponseStyle, 
  DocumentCategory,
  StaffUser
} from './types';
import { initialOperatingStatus, defaultKnowledgeDocuments } from './data/defaultDocuments';

export default function App() {
  // Application states
  const [operatingStatus, setOperatingStatus] = useState<TodayOperatingStatus>(initialOperatingStatus);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(defaultKnowledgeDocuments);
  const [currentAnswer, setCurrentAnswer] = useState<AnswerResult | null>(null);
  const [activeStyle, setActiveStyle] = useState<ResponseStyle>('PHONE');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRephrasing, setIsRephrasing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'MAIN' | 'DOCS' | 'HISTORY'>('MAIN');
  const [history, setHistory] = useState<AnswerResult[]>([]);

  // User state & Login Modal
  const [currentUser, setCurrentUser] = useState<StaffUser | null>({
    id: 'staff-01',
    name: '이서연',
    position: '주무관',
    department: '민원행정팀 / 보건증·제증명창구',
    isLoggedIn: true,
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Modals
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedDocForModal, setSelectedDocForModal] = useState<KnowledgeDocument | null>(null);
  const [highlightQuote, setHighlightQuote] = useState<string | undefined>(undefined);
  const [targetSection, setTargetSection] = useState<string | undefined>(undefined);

  // Fetch initial data from server API
  useEffect(() => {
    async function loadServerData() {
      try {
        const [statusRes, docsRes] = await Promise.allSettled([
          fetch('/api/operating-status'),
          fetch('/api/documents'),
        ]);

        if (statusRes.status === 'fulfilled' && statusRes.value.ok) {
          const statusData = await statusRes.value.json();
          setOperatingStatus(statusData);
        }

        if (docsRes.status === 'fulfilled' && docsRes.value.ok) {
          const docsData = await docsRes.value.json();
          setDocuments(docsData);
        }
      } catch (err) {
        console.warn('Using local initial data', err);
      }
    }

    loadServerData();

    // Set initial realistic demonstrative result (as featured in PRD)
    const demoInitialAnswer: AnswerResult = {
      id: 'demo-init-1',
      question: '보건증 오늘 바로 받을 수 있어요?',
      category: '제증명',
      subCategory: '건강진단결과서(구 보건증)',
      department: '제증명창구 / 민원실',
      style: 'PHONE',
      answerText: `네, 배방보건지소입니다. 문의하신 건강진단결과서(보건증)에 대해 안내드리겠습니다.\n\n건강진단결과서는 장티푸스 미생물 배양 및 흉부 X-선 영상 판독 절차를 거쳐야 하므로 검사 당일 즉시 발급되지 않으며, 검사일을 제외한 근무일 기준 약 4~5일이 소요됩니다.\n\n또한 금일은 방사선사 관내 출장 부재로 흉부 X-선 검사가 오후 2시 이후부터 가능하오니, 방문 시 참고해 주시기 바랍니다. 검사 시에는 신분증과 수수료 3,000원을 지참해 주셔야 합니다. 추가로 궁금하신 점 있으실까요?`,
      staffTakeaway: {
        serviceName: '건강진단결과서(구 보건증)',
        testRequired: true,
        sameDayIssuance: false,
        expectedDuration: '검사일 제외 근무일 기준 4~5일',
        charge: '3,000원',
        department: '제증명창구 / 민원실',
        keyTakeaways: [
          '신분증 필히 지참 (미지참 시 접수 및 검사 불가)',
          '흉부 X-선 촬영 및 장티푸스 도말배양 검사 필수',
          '당일 발급 불가 (배양·판독 4~5일 소요)',
          'e보건소(공공보건포털) 및 정부24 온라인 무료 출력 가능'
        ],
      },
      clarificationNeeded: [
        '검사 대상자의 신분증 지참 여부 확인',
        '오후 2시 이후 방사선실 복귀 시간대에 방문 가능한지 확인'
      ],
      safetyWarning: null,
      references: [
        {
          docId: 'doc-cert-01',
          docTitle: '배방보건지소 건강진단결과서(구 보건증) 발급 업무처리지침',
          effectiveDate: '2026.09.01',
          version: 'v2.4',
          relevantQuote: '건강진단결과서는 미생물 배양검사 및 영상의학적 판독 절차를 거치므로 검사 당일 즉시 발급은 불가하다.',
          section: '제3조 처리기간 및 당일발급 제한',
        },
        {
          docId: 'doc-special-xray-11',
          docTitle: '배방보건지소 방사선사 부재 시 방사선실 및 제증명 처리기준',
          effectiveDate: '2026.09.01',
          version: 'v2.8',
          relevantQuote: '시간제 부재 시: 금일 방사선사 출장으로 흉부 X선 검사는 14시 이후부터 가능하오니 해당 시간 이후에 방문해 주시면 검사가 가능합니다.',
          section: '제3조 시간제 부재 시 민원 안내 요령',
        }
      ],
      todayContextApplied: {
        isAffected: true,
        reason: '방사선사 09:00~14:00 관내출장 부재로 흉부 X-선 검사는 오후 2시 이후 가능',
      },
      generatedAt: '오전 09:15',
    };

    setCurrentAnswer(demoInitialAnswer);
    setHistory([demoInitialAnswer]);
  }, []);

  // Handler: Generate answer
  const handleGenerateAnswer = async (
    question: string, 
    style: ResponseStyle, 
    categoryHint?: DocumentCategory
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/generate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          style,
          operatingStatus,
          categoryHint,
        }),
      });

      if (!res.ok) {
        throw new Error('답변 생성 실패');
      }

      const answerData: AnswerResult = await res.json();
      setCurrentAnswer(answerData);
      setHistory(prev => [answerData, ...prev]);
      setActiveTab('MAIN');
    } catch (err) {
      console.error('Error in handleGenerateAnswer:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Rephrase current answer in another style
  const handleStyleChange = async (newStyle: ResponseStyle) => {
    if (!currentAnswer || currentAnswer.style === newStyle) return;
    setIsRephrasing(true);
    try {
      const res = await fetch('/api/rephrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentAnswer,
          newStyle,
          operatingStatus,
        }),
      });

      if (res.ok) {
        const rephrased: AnswerResult = await res.json();
        setCurrentAnswer(rephrased);
        setActiveStyle(newStyle);
      }
    } catch (err) {
      console.error('Failed to rephrase:', err);
    } finally {
      setIsRephrasing(false);
    }
  };

  // Handler: Update operating status
  const handleSaveOperatingStatus = async (updated: TodayOperatingStatus) => {
    setOperatingStatus(updated);
    try {
      await fetch('/api/operating-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.warn('Failed to sync status with server', err);
    }
  };

  // Handler: Add document
  const handleAddDocument = async (doc: Partial<KnowledgeDocument>) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(prev => [data.document, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add document:', err);
    }
  };

  // Handler: Delete document
  const handleDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  // Handler: Open document viewer modal by title or ID and link to specific section
  const handleViewDocument = (title: string, quote?: string, section?: string, docId?: string) => {
    let doc: KnowledgeDocument | undefined;
    if (docId) {
      doc = documents.find(d => d.id === docId);
    }
    if (!doc) {
      doc = documents.find(d => d.title.includes(title) || title.includes(d.title));
    }
    if (doc) {
      setSelectedDocForModal(doc);
      setHighlightQuote(quote);
      setTargetSection(section);
    } else if (documents.length > 0) {
      setSelectedDocForModal(documents[0]);
      setHighlightQuote(quote);
      setTargetSection(section);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col">
      {/* Top App Header */}
      <Header
        operatingStatus={operatingStatus}
        onOpenStatusModal={() => setIsStatusModalOpen(true)}
        onOpenDocManager={() => setActiveTab('DOCS')}
        onOpenHistory={() => setActiveTab('HISTORY')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Always display Today's Operating Status Banner for transparency */}
        <TodayStatusBanner
          status={operatingStatus}
          onEdit={() => setIsStatusModalOpen(true)}
          onQuickUpdate={handleSaveOperatingStatus}
        />

        {/* Tab 1: Main AI Question & Answer View */}
        {activeTab === 'MAIN' && (
          <div className="space-y-6">
            {/* Inquiry input section */}
            <QuestionInputSection
              onGenerate={handleGenerateAnswer}
              isLoading={isLoading}
              activeStyle={activeStyle}
              setActiveStyle={setActiveStyle}
            />

            {/* Answer Result Card */}
            {currentAnswer && (
              <AnswerResultCard
                result={currentAnswer}
                onStyleChange={handleStyleChange}
                onViewDocument={handleViewDocument}
                isRephrasing={isRephrasing}
              />
            )}
          </div>
        )}

        {/* Tab 2: Knowledge Base Document Manager */}
        {activeTab === 'DOCS' && (
          <KnowledgeBaseManager
            documents={documents}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
            onViewDoc={(doc) => {
              setSelectedDocForModal(doc);
              setHighlightQuote(undefined);
              setTargetSection(undefined);
            }}
          />
        )}

        {/* Tab 3: History Drawer */}
        {activeTab === 'HISTORY' && (
          <HistoryDrawer
            history={history}
            onSelectResult={(item) => {
              setCurrentAnswer(item);
              setActiveTab('MAIN');
            }}
            onClearHistory={() => setHistory([])}
          />
        )}
      </main>

      {/* Public Health Subcenter Comprehensive Footer */}
      <Footer />

      {/* Staff Login & Account Modal */}
      {isLoginModalOpen && (
        <LoginModal
          currentUser={currentUser}
          onLogin={(user) => setCurrentUser(user)}
          onLogout={() => setCurrentUser(null)}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}

      {/* Operating Status Editor Modal */}
      {isStatusModalOpen && (
        <OperatingStatusModal
          currentStatus={operatingStatus}
          onSave={handleSaveOperatingStatus}
          onClose={() => setIsStatusModalOpen(false)}
        />
      )}

      {/* Document Reference Viewer Modal */}
      {selectedDocForModal && (
        <DocumentModal
          document={selectedDocForModal}
          highlightQuote={highlightQuote}
          targetSection={targetSection}
          onClose={() => {
            setSelectedDocForModal(null);
            setHighlightQuote(undefined);
            setTargetSection(undefined);
          }}
        />
      )}
    </div>
  );
}
