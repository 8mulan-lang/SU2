import React, { useState } from 'react';
import { 
  Stethoscope, 
  FileText, 
  Brain, 
  HeartPulse, 
  Car, 
  Baby, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Edit3,
  Sparkles,
  Save,
  Check
} from 'lucide-react';
import { TodayOperatingStatus, OperatingStatusLevel, UnitStatus } from '../types';

interface TodayStatusBannerProps {
  status: TodayOperatingStatus;
  onEdit: () => void;
  onQuickUpdate?: (updated: TodayOperatingStatus) => void;
}

export const TodayStatusBanner: React.FC<TodayStatusBannerProps> = ({ 
  status, 
  onEdit, 
  onQuickUpdate 
}) => {
  const [quickNotice, setQuickNotice] = useState(status.generalNotice || '');
  const [isNoticeSaved, setIsNoticeSaved] = useState(false);

  const handleToggleUnit = (unitKey: keyof Omit<TodayOperatingStatus, 'date' | 'generalNotice' | 'updatedAt' | 'updatedBy'>) => {
    if (!onQuickUpdate) return;
    const current = status[unitKey] as UnitStatus;
    let nextStatus: OperatingStatusLevel = 'NORMAL';
    let nextNote = '정상 운영';
    let nextTimeRange = undefined;
    let nextResumedAt = undefined;

    if (current.status === 'NORMAL') {
      if (unitKey === 'certificates') {
        nextStatus = 'TIME_BOUND';
        nextTimeRange = '09:00 ~ 14:00 방사선사 부재';
        nextNote = '오전 관내출장 (흉부 X-선 검사는 14시 이후 가능)';
        nextResumedAt = '14:00';
      } else if (unitKey === 'internalMedicine') {
        nextStatus = 'ABSENT';
        nextNote = '공보의 학회 부재 (진료·처방 중단)';
      } else if (unitKey === 'driversAptitude') {
        nextStatus = 'ABSENT';
        nextNote = '의사 부재로 적성 신체검사 일시 중단';
      } else {
        nextStatus = 'PAUSED';
        nextNote = '금일 일시 중단';
      }
    } else if (current.status === 'TIME_BOUND') {
      nextStatus = 'ABSENT';
      nextNote = '전일 부재';
    } else {
      nextStatus = 'NORMAL';
      nextNote = '정상 운영';
    }

    const updated: TodayOperatingStatus = {
      ...status,
      [unitKey]: {
        ...current,
        status: nextStatus,
        note: nextNote,
        timeRange: nextTimeRange,
        resumedAt: nextResumedAt,
      },
      updatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    onQuickUpdate(updated);
  };

  const handleSaveNotice = () => {
    if (!onQuickUpdate) return;
    onQuickUpdate({
      ...status,
      generalNotice: quickNotice,
      updatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    });
    setIsNoticeSaved(true);
    setTimeout(() => setIsNoticeSaved(false), 2000);
  };

  const getBadge = (level: string, timeRange?: string) => {
    switch (level) {
      case 'NORMAL':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> 정상 운영
          </span>
        );
      case 'TIME_BOUND':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> {timeRange || '시간대 부재'}
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-300">
            <AlertTriangle className="w-3 h-3 text-rose-500" /> 전일 부재 (중단)
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-300">
            <AlertTriangle className="w-3 h-3 text-rose-500" /> 업무 일시중단
          </span>
        );
      case 'RESERVATION_ONLY':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
            사전 예약제
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            확인 필요
          </span>
        );
    }
  };

  const units: {
    id: keyof Omit<TodayOperatingStatus, 'date' | 'generalNotice' | 'updatedAt' | 'updatedBy'>;
    name: string;
    sub: string;
    icon: any;
    data: UnitStatus;
  }[] = [
    {
      id: 'internalMedicine',
      name: '내과진료',
      sub: '처방전·만성질환·일반진료',
      icon: Stethoscope,
      data: status.internalMedicine,
    },
    {
      id: 'certificates',
      name: '보건증 등 제증명',
      sub: '흉부 X-선·장티푸스·결과서',
      icon: FileText,
      data: status.certificates,
    },
    {
      id: 'cognitiveScreening',
      name: '인지선별검사',
      sub: 'CIST 치매선별·상담',
      icon: Brain,
      data: status.cognitiveScreening,
    },
    {
      id: 'basicHealth',
      name: '기초건강측정',
      sub: '혈압·혈당·인바디측정',
      icon: HeartPulse,
      data: status.basicHealth,
    },
    {
      id: 'driversAptitude',
      name: '운전면허적성검사',
      sub: '1종적성·시력·의사문진',
      icon: Car,
      data: status.driversAptitude,
    },
    {
      id: 'maternalChildHealth',
      name: '모자보건업무',
      sub: '임산부등록·영양제·산전검사',
      icon: Baby,
      data: status.maternalChildHealth,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs transition-all">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 shadow-2xs">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                오늘의 배방보건지소 운영상황 (Daily Operational Status)
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                ({status.date} 기준)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              직원이 입력한 의사·방사선사·각 실별 실시간 가동 상태가 AI 민원 답변 생성에 자동으로 결합됩니다.
            </p>
          </div>
        </div>

        <button
          onClick={onEdit}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors shadow-2xs"
        >
          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
          <span>운영상황 상세 설정 모달</span>
        </button>
      </div>

      {/* Grid of 6 units with quick toggle capability */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3.5">
        {units.map((unit) => {
          const Icon = unit.icon;
          const isWarning = unit.data.status === 'TIME_BOUND' || unit.data.status === 'ABSENT' || unit.data.status === 'PAUSED';

          return (
            <div
              key={unit.id}
              className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                isWarning
                  ? 'bg-amber-50/80 border-amber-300 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${isWarning ? 'text-amber-700' : 'text-slate-600'}`} />
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {unit.name}
                    </span>
                  </div>
                </div>
                <div className="mb-1.5">
                  {getBadge(unit.data.status, unit.data.timeRange)}
                </div>
                <div className="text-[11px] text-slate-600 line-clamp-2 leading-tight" title={unit.data.note || unit.sub}>
                  {unit.data.note || unit.sub}
                </div>
              </div>

              {/* Quick toggle button */}
              <button
                type="button"
                onClick={() => handleToggleUnit(unit.id)}
                className="mt-2 w-full py-1 text-[10px] font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
                title="상태 전환 (정상 ⇄ 부재)"
              >
                클릭 시 상태 전환
              </button>
            </div>
          );
        })}
      </div>

      {/* Inline Quick Notice Input */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 font-semibold shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>당일 긴급 공지/특이사항:</span>
        </div>
        <div className="flex-1 flex items-center gap-1.5">
          <input
            type="text"
            value={quickNotice}
            onChange={(e) => setQuickNotice(e.target.value)}
            placeholder="예: 금일 방사선사 14시 복귀, 독감 백신 잔여 30도즈, 오후 4시 보건교육으로 일부 지연"
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-teal-600 text-slate-800"
          />
          <button
            type="button"
            onClick={handleSaveNotice}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1 shrink-0 transition-colors"
          >
            {isNoticeSaved ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>저장됨</span>
              </>
            ) : (
              <>
                <Save className="w-3 h-3" />
                <span>공지 반영</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
