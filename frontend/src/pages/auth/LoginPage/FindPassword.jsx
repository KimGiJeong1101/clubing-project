import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";
import Modal from "../../../components/common/Modal";

const apiUrl = process.env.REACT_APP_API_URL;

const FindPasswordPage = ({ open, onClose }) => {
  const { register, handleSubmit, watch, reset, getValues, formState: { errors } } = useForm({ mode: "onChange" });

  const emailValue = watch("email");
  const [isVerified,    setIsVerified]    = useState(false);
  const [emailError,    setEmailError]    = useState("");
  const [verifyError,   setVerifyError]   = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [codeId,        setCodeId]        = useState("");
  const [timer,         setTimer]         = useState(0);
  const [intervalId,    setIntervalId]    = useState(null);
  const [hasExpired,    setHasExpired]    = useState(false);
  const [emailReadOnly, setEmailReadOnly] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showPw,  setShowPw]  = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [toast,   setToast]   = useState({ open: false, msg: "", ok: true });

  const showToast = (msg, ok = true) => {
    setToast({ open: true, msg, ok });
    setTimeout(() => setToast((p) => ({ ...p, open: false })), 3000);
  };

  useEffect(() => {
    if (timer > 0) {
      const m = Math.floor(timer / 60), s = timer % 60;
      setEmailError(`인증번호가 전송되었습니다. [인증 기한 : ${m}:${s < 10 ? "0" : ""}${s}]`);
    } else if (hasExpired) {
      setEmailError("인증번호가 만료되었습니다.");
    }
  }, [timer, hasExpired]);

  const handleCheckEmail = async () => {
    if (!emailValue?.trim()) { setEmailError("이메일을 입력해주세요."); return; }
    try {
      const res = await axios.post(`${apiUrl}/users/validate-email`, { email: emailValue });
      if (res.status === 200) {
        await handleSendAuth();
        setEmailReadOnly(true);
      }
    } catch (e) {
      setEmailError(e.response?.data?.message || "회원 확인이 되지 않습니다.");
    }
  };

  const handleSendAuth = async () => {
    try {
      const res = await axios.post(`${apiUrl}/users/email-auth`, { email: emailValue }, { timeout: 10000 });
      if (res.data.ok) {
        setCodeId(res.data.codeId);
        setTimer(180);
        setHasExpired(false);
        if (intervalId) clearInterval(intervalId);
        const id = setInterval(() => {
          setTimer((p) => {
            if (p <= 1) { clearInterval(id); setHasExpired(true); return 0; }
            return p - 1;
          });
        }, 1000);
        setIntervalId(id);
      }
    } catch { setEmailError("인증 메일 발송에 실패했습니다."); }
  };

  const handleVerify = async () => {
    try {
      const res = await axios.post(`${apiUrl}/users/verifyAuth`, { codeId, inputCode: verificationCode, email: emailValue });
      if (res.data.ok) {
        setIsVerified(true);
        showToast("인증에 성공하였습니다.");
        setVerifyError("");
        setTimer(0); setHasExpired(false);
        if (intervalId) { clearInterval(intervalId); setIntervalId(null); }
      } else {
        setVerifyError(res.data.msg);
        showToast("인증에 실패하였습니다.", false);
      }
    } catch { setVerifyError("인증번호가 틀렸습니다."); showToast("인증번호가 틀렸습니다.", false); }
  };

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(`${apiUrl}/users/change-password`, { email: data.email, newPassword: data.newPassword });
      if (res.data.ok) {
        showToast("비밀번호가 성공적으로 변경되었습니다.");
        setTimeout(() => { onClose(); handleReset(); }, 1000);
      } else { setPasswordError("비밀번호 변경 중 오류가 발생했습니다."); }
    } catch { setPasswordError("비밀번호 변경 중 오류가 발생했습니다."); }
  };

  const handleReset = () => {
    reset();
    setIsVerified(false); setEmailError(""); setVerifyError(""); setPasswordError("");
    setCodeId(""); setTimer(0); setHasExpired(false); setEmailReadOnly(false);
    setVerificationCode(""); setShowPw(false); setShowPw2(false);
    if (intervalId) { clearInterval(intervalId); setIntervalId(null); }
  };

  const userPassword = {
    required: "필수 필드입니다.",
    minLength: { value: 8, message: "최소 8자입니다." },
    validate: (v) => {
      if (!isVerified) return "이메일 인증을 완료해 주세요.";
      if (!/^(?=.*[a-zA-Zㄱ-힝])(?=.*[\W_]).{6,}$/.test(v))
        return "영문 대/소문자, 특수문자를 사용해 주세요.";
      return true;
    },
  };

  const Field = ({ label, children }) => (
    <div className="space-y-1">
      <label className="text-xs font-nanum-bold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );

  return (
    <Modal open={open} onClose={() => { handleReset(); onClose(); }} title="비밀번호 변경" maxWidth="max-w-lg">
      {toast.open && (
        <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-nanum ${toast.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {toast.msg}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* 이메일 */}
        <Field label="이메일">
          <div className="flex gap-2">
            <input
              className={`input-base flex-1 ${emailReadOnly ? "bg-gray-100 text-gray-400" : ""}`}
              placeholder="이메일"
              readOnly={emailReadOnly}
              {...register("email", {
                required: "필수 필드입니다.",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "유효한 이메일을 입력하세요." },
              })}
            />
            <button type="button" onClick={handleCheckEmail} className="btn-primary whitespace-nowrap px-4">인증하기</button>
          </div>
          {(emailError || errors.email) && (
            <p className="text-xs text-red-500 mt-1">{emailError || errors.email?.message}</p>
          )}
        </Field>

        {/* 인증번호 */}
        <Field label="인증번호">
          <div className="flex gap-2">
            <input
              className={`input-base flex-1 ${isVerified ? "bg-gray-100 text-gray-400" : ""}`}
              placeholder="인증번호 입력"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              readOnly={isVerified}
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerified}
              className={`whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-nanum-bold transition-colors
                ${isVerified ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "btn-primary"}`}
            >
              {isVerified ? "인증완료" : "인증확인"}
            </button>
          </div>
          {verifyError && <p className="text-xs text-red-500 mt-1">{verifyError}</p>}
        </Field>

        {/* 새 비밀번호 */}
        <Field label="새 비밀번호">
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              className={`input-base pr-10 ${!isVerified ? "bg-gray-100 text-gray-400" : ""}`}
              placeholder="새 비밀번호 (8자 이상, 특수문자 포함)"
              readOnly={!isVerified}
              {...register("newPassword", userPassword)}
            />
            <button type="button" onClick={() => setShowPw((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
          {(errors.newPassword || passwordError) && (
            <p className="text-xs text-red-500 mt-1">{errors.newPassword?.message || passwordError}</p>
          )}
        </Field>

        {/* 비밀번호 확인 */}
        <Field label="새 비밀번호 확인">
          <div className="relative">
            <input
              type={showPw2 ? "text" : "password"}
              className={`input-base pr-10 ${!isVerified ? "bg-gray-100 text-gray-400" : ""}`}
              placeholder="비밀번호 재입력"
              readOnly={!isVerified}
              {...register("confirmPassword", {
                required: "필수 필드입니다.",
                validate: (v) => v === getValues("newPassword") || "비밀번호가 일치하지 않습니다.",
              })}
            />
            <button type="button" onClick={() => setShowPw2((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPw2 ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
          )}
        </Field>

        <div className="flex gap-2 pt-2">
          <button type="submit" className="btn-primary flex-1">비밀번호 변경</button>
          <button type="button" onClick={() => { handleReset(); onClose(); }} className="btn-outline flex-1">취소</button>
        </div>
      </form>
    </Modal>
  );
};

export default FindPasswordPage;
