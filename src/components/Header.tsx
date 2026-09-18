import React from 'react';
import { 
  Building2, 
  Settings, 
  BookOpen, 
  History, 
  Sparkles,
  LogIn,
  UserCheck
} from 'lucide-react';
import { TodayOperatingStatus, StaffUser } from '../types';

interface HeaderProps {
  operatingStatus: TodayOperatingStatus;
  onOpenStatusModal: () => void;
  onOpenDocManager: () => void;
  onOpenHistory: () => void;
  activeTab: 'MAIN' | 'DOCS' | 'HISTORY';
  setActiveTab: (tab: 'MAIN' | 'DOCS' | 'HISTORY') => void;
  historyCount: number;
  currentUser: StaffUser | null;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  operatingStatus,
  onOpenStatusModal,
  activeTab,
  setActiveTab,
  historyCount,
  currentUser,
  onOpenLogin,
}) => {
  const hasAbnormalStatus = 
    operatingStatus.internalMedicine?.status !== 'NORMAL' || 
    operatingStatus.certificates?.status !== 'NORMAL' ||
    operatingStatus.cognitiveScreening?.status !== 'NORMAL' ||
    operatingStatus.basicHealth?.status !== 'NORMAL' ||
    operatingStatus.driversAptitude?.status !== 'NORMAL' ||
    operatingStatus.maternalChildHealth?.status !== 'NORMAL';

  const getStatusSummary = () => {
    if (operatingStatus.certificates?.status === 'TIME_BOUND') return '제증명 14시 출장';
    if (operatingStatus.internalMedicine?.status === 'ABSENT') return '내과의사 부재';
    if (operatingStatus.driversAptitude?.status === 'ABSENT') return '적성검사 중단';
    if (hasAbnormalStatus) return '일부 업무 변동';
    return '전 부서 정상 운영';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand & Subcenter Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  배방보건지소 민원 AI답변
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  내부 업무용 v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500">
                아산시 배방보건지소 실시간 운영상황 및 최신 업무지침 기반 민원 응대
              </p>
            </div>
          </div>

          {/* Navigation, Status Widget & Login Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Status Button */}
            <button
              onClick={onOpenStatusModal}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                hasAbnormalStatus
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
              }`}
              title="오늘의 운영상황 설정 열기"
            >
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasAbnormalStatus ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${hasAbnormalStatus ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span className="hidden md:inline font-semibold">오늘의 상황:</span>
              <span className="truncate max-w-[150px]">
                {getStatusSummary()}
              </span>
              <Settings className="w-3.5 h-3.5 opacity-60 ml-1" />
            </button>

            {/* Navigation Tabs */}
            <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setActiveTab('MAIN')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'MAIN'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>민원 답변</span>
              </button>

              <button
                onClick={() => setActiveTab('DOCS')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'DOCS'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>업무지침 DB</span>
              </button>

              <button
                onClick={() => setActiveTab('HISTORY')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'HISTORY'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5 text-slate-600" />
                <span>답변 기록</span>
                {historyCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                    {historyCount}
                  </span>
                )}
              </button>
            </nav>

            {/* Login / User Status Button */}
            {currentUser && currentUser.isLoggedIn ? (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 hover:bg-teal-100/80 text-teal-900 text-xs font-semibold transition-colors shadow-2xs"
                title="직원 프로필 및 로그아웃"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span className="hidden sm:inline">{currentUser.name} {currentUser.position}</span>
                <span className="sm:hidden">{currentUser.name}</span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>로그인</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
