import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { loginUser } from "../../../store/actions/userActions";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock } from "react-icons/fi";
import FindEmailPage from "./FindEmail";
import FindPasswordPage from "./FindPassword";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({ mode: "onChange" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const rememberMe = watch("rememberMe");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [popup, setPopup] = useState({ email: false, password: false });

  useEffect(() => {
    const saved = localStorage.getItem("lastLoginEmail");
    const remember = localStorage.getItem("rememberMe") === "true";
    setValue("rememberMe", remember);
    if (saved) setValue("email", saved);
  }, [setValue]);

  const onSubmit = async ({ email, password }) => {
    try {
      const res = await dispatch(loginUser({ email, password }));
      if (res.meta.requestStatus === "fulfilled") {
        navigate("/clublist");
        reset();
      } else {
        const err = res.payload?.error;
        const msg = res.payload?.message;
        if (err === "이메일이 확인되지 않습니다." || msg === "탈퇴한 회원입니다.") {
          setEmailError(msg || err);
          setPasswordError("");
        } else if (err === "비밀번호가 틀렸습니다.") {
          setPasswordError(err);
          setEmailError("");
        } else {
          setEmailError("알 수 없는 오류가 발생했습니다.");
        }
      }
      if (rememberMe) {
        localStorage.setItem("lastLoginEmail", email);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("lastLoginEmail");
        localStorage.setItem("rememberMe", "false");
      }
    } catch {
      setEmailError("로그인 중 오류가 발생했습니다.");
    }
  };

  const kakaoLogin = () => {
    const clientId = process.env.REACT_APP_KAKAO_API_URL;
    const redirectUri = "http://localhost:3000/kakao/callback";
    window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "#FAF8F5" }}>
      {/* 로고 */}
      <Link to="/">
        <img src="/logo/khaki_long_h.png" alt="Clubing" className="h-14 mb-8" />
      </Link>

      {/* 카드 */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 이메일 */}
          <div>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                placeholder="이메일"
                className={`input-base pl-9 ${emailError || errors.email ? "border-red-400 focus:ring-red-400" : ""}`}
                {...register("email", {
                  required: "이메일을 입력해주세요.",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "유효한 이메일을 입력하세요." },
                })}
              />
            </div>
            {(emailError || errors.email) && <p className="text-xs text-red-500 mt-1">{emailError || errors.email.message}</p>}
          </div>

          {/* 비밀번호 */}
          <div>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="password"
                placeholder="비밀번호"
                className={`input-base pl-9 ${passwordError || errors.password ? "border-red-400 focus:ring-red-400" : ""}`}
                {...register("password", {
                  required: "비밀번호를 입력해주세요.",
                  minLength: { value: 3, message: "최소 6자입니다." },
                })}
              />
            </div>
            {(passwordError || errors.password) && <p className="text-xs text-red-500 mt-1">{passwordError || errors.password.message}</p>}
          </div>

          {/* 아이디 기억 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-400 cursor-pointer" {...register("rememberMe")} />
            <span className="text-sm text-gray-600">아이디 기억하기</span>
          </label>

          <button type="submit" className="btn-primary w-full py-3 text-base">
            로그인
          </button>
        </form>

        {/* 카카오 */}
        <button onClick={kakaoLogin} className="mt-4 w-full" aria-label="카카오 로그인">
          <img src="/auth/kakao_login_icon_long.png" alt="카카오 로그인" className="w-full rounded-lg" />
        </button>

        <p className="text-center text-sm text-gray-500 mt-5">
          처음 방문하셨나요?{" "}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
            회원가입
          </Link>
        </p>
      </div>

      {/* 아이디/비밀번호 찾기 */}
      <div className="flex items-center gap-4 mt-5 text-sm text-gray-500">
        <button onClick={() => setPopup((p) => ({ ...p, email: true }))} className="hover:text-gray-900 transition-colors">
          아이디 찾기
        </button>
        <span className="text-gray-300">|</span>
        <button onClick={() => setPopup((p) => ({ ...p, password: true }))} className="hover:text-gray-900 transition-colors">
          비밀번호 찾기
        </button>
      </div>

      <FindEmailPage open={popup.email} onClose={() => setPopup((p) => ({ ...p, email: false }))} />
      <FindPasswordPage open={popup.password} onClose={() => setPopup((p) => ({ ...p, password: false }))} />
    </div>
  );
};

export default LoginPage;
