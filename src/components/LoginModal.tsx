import React, { useState } from 'react';
import { X, Lock, ShieldCheck, UserCheck, KeyRound, Building2 } from 'lucide-react';
import { StaffUser } from '../types';

interface LoginModalProps {
  currentUser: StaffUser | null;
  onLogin: (user: StaffUser) => void;
  onLogout: () => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onClose,
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [department, setDepartment] = useState(currentUser?.department || '민원행정팀');
  const [position, setPosition] = useState(currentUser?.position || '주무관');
  const [password, setPassword] = useState('');

  const sampleStaffs: StaffUser[] = [
    {
      id: 'staff-01',
      name: '이서연',
      position: '주무관',
      department: '민원접수·제증명창구',
      isLoggedIn: true,
    },
    {
      id: 'staff-02',
      name: '김태훈',
      position: '팀장',
      department: '배방보건지소 총괄팀',
      isLoggedIn: true,
    },
    {
      id: 'staff-03',
      name: '박민우',
      position: '공중보건의사',
      department: '의과 진료실',
      isLoggedIn: true,
    },
    {
      id: 'staff-04',
      name: '정유진',
      position: '간호주무관',
      department: '모자보건·예방접종실',
      isLoggedIn: true,
    },
  ];

  const handleQuickLogin = (staff: StaffUser) => {
    onLogin(staff);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onLogin({
      id: `staff-${Date.now()}`,
      name: name.trim(),
      department: department.trim(),
      position: position.trim(),
      isLoggedIn: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                배방보건지소 행정지원시스템 로그인
              </h3>
              <p className="text-[11px] text-slate-500">
                아산시 배방보건지소 내부 직원 전용 포털
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

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {currentUser && currentUser.isLoggedIn ? (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-teal-950">
                  {currentUser.name} {currentUser.position}님 로그인 중
                </p>
                <p className="text-xs text-teal-700 mt-0.5">
                  소속: {currentUser.department}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  내부 민원 응대 및 실시간 운영상황 변경 권한이 부여되어 있습니다.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-rose-700 bg-white border border-rose-300 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  로그아웃
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Quick Staff Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    직원 원클릭 간편 로그인:
                  </label>
                  <span className="text-[10px] text-slate-400">시뮬레이션 계정</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {sampleStaffs.map((staff) => (
                    <button
                      key={staff.id}
                      type="button"
                      onClick={() => handleQuickLogin(staff)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/60 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-teal-900">
                          {staff.name} {staff.position}
                        </span>
                        <KeyRound className="w-3 h-3 text-slate-300 group-hover:text-teal-600" />
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                        {staff.department}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-2 text-[10px] text-slate-400 uppercase font-medium">
                  또는 직접 입력
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Manual Form */}
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    성명 (Staff Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 홍길동"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-teal-600 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      부서 (Department)
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="예: 민원행정팀"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-teal-600 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      직급 (Position)
                    </label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="예: 주무관"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-teal-600 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    비밀번호 / 행정인증키
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••• (시연용으로 생략 가능)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-teal-600 text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    닫기
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-xs"
                  >
                    로그인
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
