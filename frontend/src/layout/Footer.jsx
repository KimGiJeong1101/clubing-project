import React from "react";
import { Link } from "react-router-dom";
import { FiFacebook, FiInstagram, FiTwitter, FiMail, FiPhone } from "react-icons/fi";

const Footer = () => (
  <footer className="bg-primary-100 text-primary-900">
    {/* 상단 구분 라인 */}
    <div className="h-px bg-primary-200" />

    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* 메인 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.4fr] gap-10">

        {/* ── 브랜드 ── */}
        <div>
          <img src="/logo/black_long_h.png" alt="Clubing" className="h-9 mb-4" />
          <p className="text-sm text-primary-600 leading-relaxed">
            나와 맞는 사람들과<br className="hidden sm:block" />
            함께하는 취미 모임 플랫폼
          </p>
          {/* 소셜 아이콘 */}
          <div className="flex gap-2.5 mt-6">
            {[FiFacebook, FiTwitter, FiInstagram].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 rounded-full bg-primary-200 hover:bg-primary-500 hover:text-white flex items-center justify-center transition-all duration-200 text-primary-500"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* ── 회사 ── */}
        <div>
          <h3 className="text-xs font-nanum-bold text-primary-400 uppercase tracking-widest mb-4">
            회사
          </h3>
          <ul className="space-y-2.5 text-sm text-primary-700">
            {[
              { label: "회사소개",         to: "#" },
              { label: "개인정보처리방침",  to: "#" },
              { label: "이용약관",          to: "#" },
            ].map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="hover:text-primary-500 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── 서비스 ── */}
        <div>
          <h3 className="text-xs font-nanum-bold text-primary-400 uppercase tracking-widest mb-4">
            서비스
          </h3>
          <ul className="space-y-2.5 text-sm text-primary-700">
            {[
              { label: "이벤트",          to: "/event" },
              { label: "모임 찾기",       to: "/clubs" },
              { label: "공지사항",         to: "#" },
              { label: "자주 묻는 질문",   to: "#" },
            ].map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="hover:text-primary-500 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── 고객센터 ── */}
        <div>
          <h3 className="text-xs font-nanum-bold text-primary-400 uppercase tracking-widest mb-4">
            고객센터
          </h3>
          <div className="rounded-xl bg-white/60 border border-primary-200 px-4 py-4 space-y-3 text-sm text-primary-700">
            <div className="flex items-center gap-2.5">
              <FiPhone className="w-4 h-4 flex-shrink-0 text-primary-500" />
              <span>000-0000-0000</span>
            </div>
            <div className="flex items-center gap-2.5">
              <FiMail className="w-4 h-4 flex-shrink-0 text-primary-500" />
              <span>clubing@clubing.com</span>
            </div>
            <p className="text-xs text-primary-400 pt-1 border-t border-primary-200">
              평일 09:00 – 18:00 (주말·공휴일 휴무)
            </p>
          </div>
        </div>
      </div>

      {/* 구분선 + 카피라이트 */}
      <div className="border-t border-primary-200 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-primary-400">
        <span>© 2024 Clubing. All rights reserved.</span>
        <div className="flex gap-5">
          <Link to="#" className="hover:text-primary-600 transition-colors">개인정보처리방침</Link>
          <Link to="#" className="hover:text-primary-600 transition-colors">이용약관</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
