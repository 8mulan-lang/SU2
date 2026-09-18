import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Stethoscope, 
  FileText, 
  Brain, 
  HeartPulse, 
  Car,
  Baby,
  Sparkles,
  Check
} from 'lucide-react';
import { TodayOperatingStatus, OperatingStatusLevel } from '../types';

interface OperatingStatusModalProps {
  currentStatus: TodayOperatingStatus;
  onSave: (updated: TodayOperatingStatus) => void;
  onClose: () => void;
}

export const OperatingStatusModal: React.FC<OperatingStatusModalProps> = ({
  currentStatus,
  onSave,
  onClose,
}) => {
  const [form, setForm] = useState<TodayOperatingStatus>({ ...currentStatus });

  // Quick Presets
  const applyPreset = (type: 'NORMAL_ALL' | 'CERT_ABSENT' | 'MED_ABSENT') => {
    if (type === 'NORMAL_ALL') {
      setForm({
        ...form,
        internalMedicine: { status: 'NORMAL', note: '09:00~18:00 정상 진료 (점심 12:00~13:00)' },
        certificates: { status: 'NORMAL', note: '흉부 X-선 및 장티푸스 정상 접수' },
        cognitiveScreening: { status: 'NORMAL', note: '만 60세 이상 CIST 인지선별검사 정상' },
        basicHealth: { status: 'NORMAL', note: '혈압·혈당·체성분(인바디) 측정실 정상 개방' },
        driversAptitude: { status: 'NORMAL', note: '1종 보통 적성검사(신체검사) 정상 진행' },
        maternalChildHealth: { status: 'NORMAL', note: '임산부 등록 및 엽산·철분제 정상 지급' },
        generalNotice: '금일 전 부서 정상 운영 중입니다.',
      });
    } else if (type === 'CERT_ABSENT') {
      setForm({
        ...form,
        internalMedicine: { status: 'NORMAL', note: '09:00~18:00 정상 진료' },
        certificates: {
          status: 'TIME_BOUND',
          timeRange: '09:00 ~ 14:00 방사선사 부재',
          note: '오전 관내 출장 부재로 흉부 X-선 및 보건증 검사는 14:00 이후 가능',
          resumedAt: '14:00',
        },
        cognitiveScreening: { status: 'NORMAL', note: '정상 검사 진행' },
        basicHealth: { status: 'NORMAL', note: '정상 개방' },
        driversAptitude: { status: 'NORMAL', note: '정상 운영' },
        maternalChildHealth: { status: 'NORMAL', note: '정상 지급' },
        generalNotice: '금일 보건증 등 제증명 흉부 X-선 검사는 방사선사 오전 출장으로 오후 2시 이후 가능합니다. (내과진료·운전면허·모자보건 정상)',
      });
    } else if (type === 'MED_ABSENT') {
      setForm({
        ...form,
        internalMedicine: {
          status: 'ABSENT',
          note: '공중보건의사 학회 참석으로 진료·처방 일체 중단',
        },
        certificates: { status: 'NORMAL', note: '정상 운영' },
        cognitiveScreening: { status: 'NORMAL', note: '정상 운영' },
        basicHealth: { status: 'NORMAL', note: '정상 개방' },
        driversAptitude: {
          status: 'ABSENT',
          note: '의사 부재로 1종 적성 신체검사 중단 (아산시보건소 본소 이용)',
        },
        maternalChildHealth: { status: 'NORMAL', note: '정상 지급' },
        generalNotice: '금일 의사 부재로 내과 진료, 처방전 발행 및 운전면허 신체검사가 중단됩니다. (보건증 등 제증명·치매·모자보건 정상)',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      updatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                오늘의 배방보건지소 운영상황 설정
              </h3>
              <p className="text-xs text-slate-500">
                내과진료 / 보건증 등 제증명 / 인지선별검사 / 기초건강측정 / 운전면허적성검사 / 모자보건업무
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            빠른 시나리오 프리셋:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyPreset('CERT_ABSENT')}
              className="px-2.5 py-1 rounded-lg text-xs bg-amber-50 text-amber-800 border border-amber-300 font-semibold hover:bg-amber-100 transition-colors"
            >
              제증명 14시 출장 (기본)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('MED_ABSENT')}
              className="px-2.5 py-1 rounded-lg text-xs bg-rose-50 text-rose-800 border border-rose-300 font-semibold hover:bg-rose-100 transition-colors"
            >
              내과의사 부재 (진료·적성검사 중단)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('NORMAL_ALL')}
              className="px-2.5 py-1 rounded-lg text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold hover:bg-emerald-100 transition-colors"
            >
              전 부서 정상
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Date */}
          <div className="flex items-center gap-3">
            <label className="font-bold text-slate-700 w-24">운영 일자:</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-teal-600"
            />
          </div>

          <div className="border-t border-slate-200 pt-3">
            <h4 className="font-bold text-slate-800 mb-2.5">
              6대 업무 분야별 실시간 가동 현황
            </h4>

            <div className="space-y-3">
              {/* 1. 내과진료 */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 w-52">
                  <Stethoscope className="w-4 h-4 text-slate-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 block">1. 내과진료</span>
                    <span className="text-[10px] text-slate-400">처방전, 만성질환 진료</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <select
                    value={form.internalMedicine.status}
                    onChange={(e) => setForm({
                      ...form,
                      internalMedicine: { ...form.internalMedicine, status: e.target.value as OperatingStatusLevel }
                    })}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium text-xs"
                  >
                    <option value="NORMAL">정상 진료</option>
                    <option value="ABSENT">전일 부재 (진료·처방 불가)</option>
                    <option value="TIME_BOUND">오전만 진료</option>
                    <option value="PAUSED">일시 중단</option>
                  </select>
                  <input
                    type="text"
                    placeholder="세부 메모 (예: 09:00~18:00 정상 진료)"
                    value={form.internalMedicine.note || ''}
                    onChange={(e) => setForm({
                      ...form,
                      internalMedicine: { ...form.internalMedicine, note: e.target.value }
                    })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* 2. 보건증 등 제증명 */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 w-52">
                  <FileText className="w-4 h-4 text-slate-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 block">2. 보건증 등 제증명</span>
                    <span className="text-[10px] text-slate-400">흉부 X-선, 장티푸스 배양</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <select
                    value={form.certificates.status}
                    onChange={(e) => setForm({
                      ...form,
                      certificates: { ...form.certificates, status: e.target.value as OperatingStatusLevel }
                    })}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium text-xs"
                  >
                    <option value="NORMAL">정상 접수 및 촬영</option>
                    <option value="TIME_BOUND">09:00 ~ 14:00 부재 (오후 가능)</option>
                    <option value="ABSENT">전일 부재 (신규 검사 불가)</option>
                    <option value="PAUSED">일시 중단</option>
                  </select>
                  <input
                    type="text"
                    placeholder="세부 메모 (예: 14시 이후 흉부촬영 가능)"
                    value={form.certificates.note || ''}
                    onChange={(e) => setForm({
                      ...form,
                      certificates: { ...form.certificates, note: e.target.value }
                    })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* 3. 인지선별검사 */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 w-52">
                  <Brain className="w-4 h-4 text-slate-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 block">3. 인지선별검사</span>
                    <span className="text-[10px] text-slate-400">만 60세 이상 CIST 치매선별</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <select
                    value={form.cognitiveScreening.status}
                    onChange={(e) => setForm({
                      ...form,
                      cognitiveScreening: { ...form.cognitiveScreening, status: e.target.value as OperatingStatusLevel }
                    })}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium text-xs"
                  >
                    <option value="NORMAL">정상 운영</option>
                    <option value="RESERVATION_ONLY">사전 예약자만</option>
                    <option value="TIME_BOUND">시간대별 운영</option>
                    <option value="PAUSED">일시 중단 (출장)</option>
                  </select>
                  <input
                    type="text"
                    placeholder="세부 메모 (예: CIST 인지선별검사 정상 실시)"
                    value={form.cognitiveScreening.note || ''}
                    onChange={(e) => setForm({
                      ...form,
                      cognitiveScreening: { ...form.cognitiveScreening, note: e.target.value }
                    })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* 4. 기초건강측정 */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 w-52">
                  <HeartPulse className="w-4 h-4 text-slate-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 block">4. 기초건강측정</span>
                    <span className="text-[10px] text-slate-400">혈압, 혈당, 인바디 측정</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <select
                    value={form.basicHealth.status}
                    onChange={(e) => setForm({
                      ...form,
                      basicHealth: { ...form.basicHealth, status: e.target.value as OperatingStatusLevel }
                    })}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium text-xs"
                  >
                    <option value="NORMAL">정상 개방</option>
                    <option value="TIME_BOUND">시간대별 운영</option>
                    <option value="PAUSED">일시 중단</option>
                  </select>
                  <input
                    type="text"
                    placeholder="세부 메모 (예: 혈압·혈당·인바디 측정실 개방)"
                    value={form.basicHealth.note || ''}
                    onChange={(e) => setForm({
                      ...form,
                      basicHealth: { ...form.basicHealth, note: e.target.value }
                    })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* 5. 운전면허적성검사 */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 w-52">
                  <Car className="w-4 h-4 text-slate-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 block">5. 운전면허적성검사</span>
                    <span className="text-[10px] text-slate-400">1종 보통 신체검사·문진</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <select
                    value={form.driversAptitude.status}
                    onChange={(e) => setForm({
                      ...form,
                      driversAptitude: { ...form.driversAptitude, status: e.target.value as OperatingStatusLevel }
                    })}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium text-xs"
                  >
                    <option value="NORMAL">정상 운영</option>
                    <option value="ABSENT">중단 (의사 부재)</option>
                    <option value="TIME_BOUND">오전만 가능</option>
                  </select>
                  <input
                    type="text"
                    placeholder="세부 메모 (예: 사진 2매, 신분증 지참, 17:30 마감)"
                    value={form.driversAptitude.note || ''}
                    onChange={(e) => setForm({
                      ...form,
                      driversAptitude: { ...form.driversAptitude, note: e.target.value }
                    })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* 6. 모자보건업무 */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 w-52">
                  <Baby className="w-4 h-4 text-slate-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 block">6. 모자보건업무</span>
                    <span className="text-[10px] text-slate-400">임산부등록, 엽산·철분제, 산전검사</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <select
                    value={form.maternalChildHealth.status}
                    onChange={(e) => setForm({
                      ...form,
                      maternalChildHealth: { ...form.maternalChildHealth, status: e.target.value as OperatingStatusLevel }
                    })}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium text-xs"
                  >
                    <option value="NORMAL">정상 운영</option>
                    <option value="PAUSED">일시 중단 (담당자 출장)</option>
                    <option value="TIME_BOUND">시간대별 운영</option>
                  </select>
                  <input
                    type="text"
                    placeholder="세부 메모 (예: 임산부 등록 및 영양제 정상 지급)"
                    value={form.maternalChildHealth.note || ''}
                    onChange={(e) => setForm({
                      ...form,
                      maternalChildHealth: { ...form.maternalChildHealth, note: e.target.value }
                    })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs text-slate-800"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* General Notice */}
          <div className="border-t border-slate-200 pt-3">
            <label className="font-bold text-slate-800 block mb-1.5">
              당일 민원 특이사항 공지 (AI 답변에 자동 포함):
            </label>
            <textarea
              rows={2}
              value={form.generalNotice}
              onChange={(e) => setForm({ ...form, generalNotice: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-teal-600 bg-slate-50/50"
              placeholder="예: 금일 보건증 등 제증명 흉부 X-선 검사는 방사선사 출장으로 14시 이후 가능합니다."
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-xs"
            >
              오늘 상황 저장 및 AI 즉시 반영
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
