import React from 'react';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Building, 
  FileText, 
  Shield, 
  AlertCircle, 
  ExternalLink,
  HeartHandshake
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
      {/* Top Banner: Quick Contact & Emergency */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-teal-400 font-semibold">
            <Phone className="w-4 h-4 text-teal-400 shrink-0" />
            <span>배방보건지소 민원 대표전화: <strong className="text-white text-sm">041-537-3400</strong></span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">FAX: 041-537-3409</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>평일 09:00~18:00 (점심 12:00~13:00 / 토·일·공휴일 휴무)</span>
            </span>
            <span className="hidden md:flex items-center gap-1 text-rose-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              야간 응급: 119 / 아산충무병원 041-538-0119
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Organization Information */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                배방
              </div>
              <div>
                <h4 className="font-bold text-white text-sm leading-tight">
                  충청남도 아산시 배방보건지소
                </h4>
                <p className="text-[10px] text-slate-400">
                  Baebang Public Health Subcenter
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              배방읍 주민의 건강증진과 신속하고 표준화된 공공 보건의료 서비스를 제공하기 위해 최선을 다하고 있습니다.
            </p>

            <div className="space-y-1.5 pt-1 text-[11px] text-slate-400">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>(31489) 충청남도 아산시 배방읍 배방로 14번길 8 (배방읍 행정복지센터 인근)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>상급기관: 충청남도 아산시보건소 (온천동 041-537-3300)</span>
              </div>
            </div>
          </div>

          {/* Column 2: 6 Major Department Phone Numbers */}
          <div className="space-y-2.5 md:col-span-2">
            <h5 className="font-bold text-white text-xs border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-400" />
              배방보건지소 주요 업무별 직통 안내 전화
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">1. 내과진료 및 처방전</span>
                  <span className="text-[10px] text-slate-400">만성질환, 고혈압·당뇨 진료</span>
                </div>
                <span className="font-bold text-teal-300 ml-2">041-537-3402</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">2. 보건증 등 제증명 발급</span>
                  <span className="text-[10px] text-slate-400">흉부 X-선, 장티푸스 검사</span>
                </div>
                <span className="font-bold text-teal-300 ml-2">041-537-3403</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">3. 인지선별검사 (치매상담)</span>
                  <span className="text-[10px] text-slate-400">만 60세 이상 CIST 선별검사</span>
                </div>
                <span className="font-bold text-teal-300 ml-2">041-537-3405</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">4. 기초건강측정실</span>
                  <span className="text-[10px] text-slate-400">혈압, 혈당, 인바디 체성분 측정</span>
                </div>
                <span className="font-bold text-teal-300 ml-2">041-537-3406</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">5. 운전면허 적성검사</span>
                  <span className="text-[10px] text-slate-400">1종 보통 신체검사·문진</span>
                </div>
                <span className="font-bold text-teal-300 ml-2">041-537-3402</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">6. 모자보건업무</span>
                  <span className="text-[10px] text-slate-400">임산부등록, 엽산·철분제, 산전검사</span>
                </div>
                <span className="font-bold text-teal-300 ml-2">041-537-3404</span>
              </div>
            </div>
          </div>

          {/* Column 3: Operation Guidance & Notice */}
          <div className="space-y-2.5 md:col-span-1 text-[11px]">
            <h5 className="font-bold text-white text-xs border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              업무별 접수 마감 시간
            </h5>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-start gap-1.5">
                <span className="text-teal-400 font-bold">•</span>
                <span><strong>내과진료:</strong> 17:30 접수 마감</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-teal-400 font-bold">•</span>
                <span><strong>흉부 X-선 및 채혈:</strong> 17:00 마감</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-teal-400 font-bold">•</span>
                <span><strong>임산부 산전혈액검사:</strong> 오전 11:30 / 오후 17:00 마감 (공복 권장)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-teal-400 font-bold">•</span>
                <span><strong>신분증 필수:</strong> 주민등록증, 운전면허증, 모바일신분증 등 지참</span>
              </li>
            </ul>

            <div className="pt-2">
              <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 text-[10px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-teal-400" />
                  내부 업무지원 시스템 안내
                </p>
                <p>본 포털은 배방보건지소 직원의 정확하고 신속한 민원 답변 작성을 지원하는 행정 도구입니다.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright and Links */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>
            © 2025 아산시 배방보건지소 (Baebang Public Health Subcenter). All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 cursor-pointer">개인정보처리방침</span>
            <span>|</span>
            <span className="hover:text-slate-300 cursor-pointer">저작권정책</span>
            <span>|</span>
            <a 
              href="https://www.asan.go.kr/health/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-teal-400 transition-colors"
            >
              아산시보건소 공식홈페이지 <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
