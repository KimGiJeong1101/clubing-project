import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { registerUser } from "../../../store/actions/userActions";
import { FiEye, FiEyeOff, FiX } from "react-icons/fi";
import axios from "axios";
import HomeSearch from "./address/HomeSearch";
import WorkplaceSearch from "./address/WorkplaceSearch";
import InterestSearch from "./address/InterestSearch";
import CategoryPopup from "./category/CategoryPopup";
import categories from "./category/CategoriesData";
import JobPopup from "./job/JobPopup";
import JobCategories from "./job/JobCategories";
import TermsPopup from "./consent/Terms";
import PrivacyPopup from "./consent/Privacy";
import MarketingPopup from "./consent/Marketing";

const apiUrl = process.env.REACT_APP_API_URL;

const genOpts = (s, e) => Array.from({ length: e - s + 1 }, (_, i) => s + i);
const years = genOpts(1950, 2024);
const months = genOpts(1, 12);
const days = genOpts(1, 31);

const formatPhone = (v) => {
  const n = v.replace(/\D/g, "");
  if (n.length <= 3) return n;
  if (n.length <= 7) return `${n.slice(0, 3)}-${n.slice(3)}`;
  return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7, 11)}`;
};

/* ─ 공통 필드 레이블 ─ */
const Label = ({ children, required }) => (
  <label className="block text-xs font-nanum-bold text-gray-500 uppercase tracking-wide mb-1">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);
const ErrMsg = ({ msg }) => (msg ? <p className="text-xs text-red-500 mt-1">{msg}</p> : null);

/* ─ 칩 태그 ─ */
const Chip = ({ label, onDelete }) => (
  <span className="inline-flex items-center gap-1 bg-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-full">
    {label}
    <button type="button" onClick={onDelete} className="hover:text-red-500 transition-colors">
      <FiX className="w-3 h-3" />
    </button>
  </span>
);

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control,
  } = useForm({
    defaultValues: {
      age: { year: "", month: "", day: "" },
      gender: "",
      homeLocation: { sido: "", sigoon: "", dong: "" },
      workplace: { w_sido: "", w_sigoon: "", w_dong: "" },
      interestLocation: { i_sido: "", i_sigoon: "", i_dong: "" },
      category: [],
      selectedJobs: [],
      phone: "",
    },
    mode: "onChange",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [toast, setToast] = useState({ open: false, msg: "", ok: true });
  const showToast = (msg, ok = true) => {
    setToast({ open: true, msg, ok });
    setTimeout(() => setToast((p) => ({ ...p, open: false })), 3000);
  };

  /* 주소 상태 */
  const [homeLocation, setHomeLocation] = useState({ sido: "", sigoon: "", dong: "" });
  const [workplace, setWorkplace] = useState({ w_sido: "", w_sigoon: "", w_dong: "" });
  const [interestLocation, setInterestLocation] = useState({ i_sido: "", i_sigoon: "", i_dong: "" });

  useEffect(() => {
    setValue("homeLocation.sido", homeLocation.sido);
    setValue("homeLocation.sigoon", homeLocation.sigoon);
    setValue("homeLocation.dong", homeLocation.dong);
  }, [homeLocation]);
  useEffect(() => {
    setValue("workplace.w_sido", workplace.w_sido);
    setValue("workplace.w_sigoon", workplace.w_sigoon);
    setValue("workplace.w_dong", workplace.w_dong);
  }, [workplace]);
  useEffect(() => {
    setValue("interestLocation.i_sido", interestLocation.i_sido);
    setValue("interestLocation.i_sigoon", interestLocation.i_sigoon);
    setValue("interestLocation.i_dong", interestLocation.i_dong);
  }, [interestLocation]);

  /* 이메일 인증 */
  const emailValue = watch("email");
  const [emailMsg, setEmailMsg] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [codeId, setCodeId] = useState("");
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [hasExpired, setHasExpired] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifyErr, setVerifyErr] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    if (timer > 0) {
      const m = Math.floor(timer / 60),
        s = timer % 60;
      setEmailMsg(`인증번호 전송됨 [${m}:${s < 10 ? "0" : ""}${s}]`);
    } else if (hasExpired) {
      setEmailMsg("인증번호가 만료되었습니다.");
    }
  }, [timer, hasExpired]);

  const handleCheckEmail = async () => {
    if (!emailValue?.trim()) {
      showToast("이메일을 입력해주세요.", false);
      return;
    }
    try {
      await axios.post(`${apiUrl}/users/check-email`, { email: emailValue });
      setEmailErr("");
      setIsEmailChecked(true);
    } catch (e) {
      setEmailErr(e.response?.data?.message || "이미 사용 중인 이메일입니다.");
    }
  };

  const handleSendAuth = async () => {
    try {
      const res = await axios.post(`${apiUrl}/users/email-auth`, { email: emailValue }, { timeout: 30000 });
      if (res.data.ok) {
        setCodeId(res.data.codeId);
        setTimer(180);
        setHasExpired(false);
        if (intervalId) clearInterval(intervalId);
        const id = setInterval(
          () =>
            setTimer((p) => {
              if (p <= 1) {
                clearInterval(id);
                setHasExpired(true);
                return 0;
              }
              return p - 1;
            }),
          1000,
        );
        setIntervalId(id);
      }
    } catch {
      showToast("인증 메일 발송에 실패했습니다.", false);
    }
  };

  const handleVerify = async () => {
    try {
      const res = await axios.post(`${apiUrl}/users/verifyAuth`, { codeId, inputCode: verificationCode, email: emailValue });
      if (res.data.ok) {
        setIsVerified(true);
        setVerifyErr("");
        setTimer(0);
        setHasExpired(false);
        if (intervalId) {
          clearInterval(intervalId);
          setIntervalId(null);
        }
        showToast("인증에 성공하였습니다.");
      } else {
        setVerifyErr(res.data.msg);
      }
    } catch {
      setVerifyErr("인증번호가 틀렸습니다.");
    }
  };

  /* 닉네임 중복검사 */
  const nickNameValue = watch("nickName");
  const [isNickChecked, setIsNickChecked] = useState(false);

  const handleCheckNick = async () => {
    if (!nickNameValue?.trim()) {
      showToast("닉네임을 입력해주세요.", false);
      return;
    }
    try {
      const res = await axios.post(`${apiUrl}/users/check-nickname`, { nickName: nickNameValue });
      showToast(res.data.message);
      setIsNickChecked(true);
    } catch (e) {
      showToast(e.response?.data?.message || "서버 오류", false);
    }
  };

  /* 직종 / 카테고리 */
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [groupedCategories, setGroupedCategories] = useState({});
  const [popup, setPopup] = useState({ category: false, job: false, terms: false, privacy: false, marketing: false });

  function groupCategories(cats) {
    return cats.reduce((acc, c) => {
      if (!acc[c.main]) acc[c.main] = [];
      acc[c.main].push(c.sub);
      return acc;
    }, {});
  }

  useEffect(() => {
    const grouped = groupCategories(selectedCategories);
    setGroupedCategories(grouped);
    setValue(
      "category",
      Object.keys(grouped).map((main) => ({ main, sub: grouped[main] })),
    );
  }, [selectedCategories]);

  useEffect(() => {
    setValue("selectedJobs", selectedJobs);
  }, [selectedJobs]);

  const handleSelection = (sels) => {
    if (popup.category) setSelectedCategories(sels);
    else if (popup.job) setSelectedJobs(sels);
  };

  /* 약관 */
  const [checks, setChecks] = useState({ terms: false, privacy: false, marketing: false, all: false });
  const handleCheck = (type) =>
    setChecks((p) => {
      const next = { ...p, [type]: !p[type] };
      next.all = next.terms && next.privacy && next.marketing;
      return next;
    });
  const handleAllCheck = () => {
    const next = !checks.all;
    setChecks({ terms: next, privacy: next, marketing: next, all: next });
  };

  /* 비밀번호 표시 */
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  /* 폼 제출 */
  const onSubmit = (data) => {
    if (!isVerified) {
      showToast("이메일 인증이 완료되지 않았습니다.", false);
      return;
    }
    if (!isNickChecked) {
      showToast("닉네임 중복 검사를 해야 합니다.", false);
      return;
    }
    if (!data.homeLocation?.sido) {
      showToast("집 주소를 설정해 주세요.", false);
      return;
    }
    if (selectedJobs.length === 0) {
      showToast("직종을 설정해 주세요.", false);
      return;
    }
    if (selectedCategories.filter((c) => c.main).length < 3) {
      showToast("최소 3개의 메인 카테고리를 설정해 주세요.", false);
      return;
    }
    if (!checks.terms) {
      showToast("이용약관에 동의해야 합니다.", false);
      return;
    }
    if (!checks.privacy) {
      showToast("개인정보 수집 및 이용에 동의해야 합니다.", false);
      return;
    }

    const body = {
      email: data.email,
      password: data.password,
      name: data.name,
      nickName: data.nickName,
      age: data.age,
      gender: data.gender,
      phone: data.phone,
      homeLocation: { city: data.homeLocation.sido, district: data.homeLocation.sigoon, neighborhood: data.homeLocation.dong },
      workplace: { city: data.workplace.w_sido, district: data.workplace.w_sigoon, neighborhood: data.workplace.w_dong },
      interestLocation: { city: data.interestLocation.i_sido, district: data.interestLocation.i_sigoon, neighborhood: data.interestLocation.i_dong },
      category: Object.keys(groupedCategories).map((main) => ({ main, sub: groupedCategories[main] })),
      job: selectedJobs,
      termsAccepted: checks.terms,
      privacyAccepted: checks.privacy,
      marketingAccepted: checks.marketing,
      profilePic: { originalImage: "https://via.placeholder.com/600x400?text=no+user+image", thumbnailImage: "https://via.placeholder.com/600x400?text=no+user+image", introduction: "" },
      registrationMethod: 0,
    };

    dispatch(registerUser(body))
      .then(() => {
        showToast("회원가입에 성공하셨습니다.");
        setTimeout(() => navigate("/"), 1000);
        reset();
      })
      .catch(() => showToast("회원가입에 실패하였습니다.", false));
  };

  const Field = ({ label, required, children, error }) => (
    <div className="mb-5">
      <Label required={required}>{label}</Label>
      {children}
      <ErrMsg msg={error} />
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: "#FAF8F5" }}>
      {/* 토스트 */}
      {toast.open && <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[500] px-5 py-3 rounded-xl shadow-lg text-sm font-nanum ${toast.ok ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>{toast.msg}</div>}

      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Link to="/">
            <img src="/logo/khaki_long_h.png" alt="Clubing" className="h-14 mx-auto" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-nanum-extrabold text-gray-900 text-center mb-8">회원가입</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
            {/* 이메일 */}
            <Field label="이메일" required error={emailErr || errors.email?.message}>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="이메일"
                  readOnly={isEmailChecked}
                  className={`input-base flex-1 ${isEmailChecked ? "bg-gray-100 text-gray-400" : ""}`}
                  {...register("email", {
                    required: "필수 필드입니다.",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "유효한 이메일을 입력하세요." },
                  })}
                />
                {!isEmailChecked ? (
                  <button type="button" onClick={handleCheckEmail} className="btn-primary whitespace-nowrap px-4">
                    중복검사
                  </button>
                ) : (
                  <div className="flex flex-col gap-1">
                    <button type="button" onClick={() => setIsEmailChecked(false)} className="btn-outline text-xs px-3 py-1">
                      수정
                    </button>
                    <button type="button" onClick={handleSendAuth} className="btn-primary text-xs px-3 py-1">
                      인증하기
                    </button>
                  </div>
                )}
              </div>
              {emailMsg && <p className="text-xs text-blue-600 mt-1">{emailMsg}</p>}
            </Field>

            {/* 인증번호 */}
            <Field label="인증번호" error={verifyErr}>
              <div className="flex gap-2">
                <input type="text" placeholder="인증번호 입력" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} readOnly={isVerified} className={`input-base flex-1 ${isVerified ? "bg-gray-100 text-gray-400" : ""}`} />
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isVerified}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-nanum-bold transition-colors
                    ${isVerified ? "bg-green-100 text-green-700 cursor-not-allowed" : "btn-primary"}`}
                >
                  {isVerified ? "인증완료" : "인증확인"}
                </button>
              </div>
            </Field>

            {/* 비밀번호 */}
            <Field label="비밀번호" required error={errors.password?.message}>
              <div className="relative">
                <input type={showPw ? "text" : "password"} placeholder="8자 이상, 특수문자 포함" className="input-base pr-10" {...register("password", { required: "필수 필드입니다.", minLength: { value: 8, message: "최소 8자입니다." }, validate: (v) => /^(?=.*[a-zA-Zㄱ-힝])(?=.*[\W_]).{6,}$/.test(v) || "영문 + 특수문자를 사용해 주세요." })} />
                <button type="button" onClick={() => setShowPw((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            <Field label="비밀번호 확인" required error={errors.passwordCheck?.message}>
              <div className="relative">
                <input type={showPw2 ? "text" : "password"} placeholder="비밀번호 재입력" className="input-base pr-10" {...register("passwordCheck", { required: "필수 필드입니다.", validate: (v) => v === watch("password") || "비밀번호가 일치하지 않습니다." })} />
                <button type="button" onClick={() => setShowPw2((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw2 ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            {/* 이름 */}
            <Field label="이름" required error={errors.name?.message}>
              <input
                className="input-base"
                placeholder="이름"
                {...register("name", {
                  required: "필수 필드입니다.",
                  validate: (v) => {
                    if (v.length > 20) return "최대 20자입니다.";
                    if (/[0-9]/.test(v)) return "숫자는 불가합니다.";
                    if (/[^a-zA-Z가-힣\s]/.test(v)) return "특수문자는 불가합니다.";
                    return true;
                  },
                })}
              />
            </Field>

            {/* 닉네임 */}
            <Field label="닉네임" required error={errors.nickName?.message}>
              <div className="flex gap-2">
                <input className={`input-base flex-1 ${isNickChecked ? "bg-gray-100 text-gray-400" : ""}`} placeholder="닉네임" readOnly={isNickChecked} {...register("nickName", { required: "필수 필드입니다.", maxLength: { value: 20, message: "최대 20자입니다." } })} />
                {isNickChecked ? (
                  <button type="button" onClick={() => setIsNickChecked(false)} className="btn-outline px-4">
                    수정
                  </button>
                ) : (
                  <button type="button" onClick={handleCheckNick} className="btn-primary px-4 whitespace-nowrap">
                    중복검사
                  </button>
                )}
              </div>
            </Field>

            {/* 생년월일 */}
            <Field label="생년월일" required>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "age.year", label: "출생년도", opts: years, rules: { required: "출생년도는 필수입니다." } },
                  { name: "age.month", label: "월", opts: months, rules: { required: "월은 필수입니다." } },
                  { name: "age.day", label: "일", opts: days, rules: { required: "일은 필수입니다." } },
                ].map(({ name, label, opts, rules }) => (
                  <Controller
                    key={name}
                    name={name}
                    control={control}
                    rules={rules}
                    render={({ field }) => (
                      <select {...field} className="input-base bg-white">
                        <option value="">{label}</option>
                        {opts.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                ))}
              </div>
            </Field>

            {/* 성별 */}
            <Field label="성별" required error={errors.gender?.message}>
              <Controller
                name="gender"
                control={control}
                rules={{ required: "성별을 선택해 주세요." }}
                render={({ field }) => (
                  <div className="flex gap-3">
                    {[
                      { v: "남성", label: "남자", active: "bg-blue-600 border-blue-600 text-white", inactive: "border-blue-300 text-blue-600 hover:bg-blue-50" },
                      { v: "여성", label: "여자", active: "bg-pink-500 border-pink-500 text-white", inactive: "border-pink-300 text-pink-500 hover:bg-pink-50" },
                    ].map(({ v, label, active, inactive }) => (
                      <button key={v} type="button" onClick={() => field.onChange(v)} className={`flex-1 py-2.5 rounded-lg border-2 font-nanum-bold text-sm transition-colors ${field.value === v ? active : inactive}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </Field>

            {/* 전화번호 */}
            <Field label="전화번호" required error={errors.phone?.message}>
              <input className="input-base" placeholder="010-0000-0000" {...register("phone", { required: "필수 필드입니다.", pattern: { value: /^\d{3}-\d{4}-\d{4}$/, message: "010-0000-0000 형식으로 입력해 주세요." } })} onChange={(e) => setValue("phone", formatPhone(e.target.value), { shouldValidate: true })} value={watch("phone")} maxLength={13} />
            </Field>

            {/* 주소 */}
            <div className="mb-5 space-y-4">
              <div>
                <Label required>
                  집주소 <span className="font-normal text-gray-400 normal-case">(읍면동 단위)</span>
                </Label>
                <HomeSearch setSelectedSido={(v) => setHomeLocation((p) => ({ ...p, sido: v }))} setSelectedSigoon={(v) => setHomeLocation((p) => ({ ...p, sigoon: v }))} setSelectedDong={(v) => setHomeLocation((p) => ({ ...p, dong: v }))} />
              </div>
              <div>
                <Label>
                  직장주소 <span className="font-normal text-gray-400 normal-case">(읍면동 단위)</span>
                </Label>
                <WorkplaceSearch setWorkplaceSido={(v) => setWorkplace((p) => ({ ...p, w_sido: v }))} setWorkplaceSigoon={(v) => setWorkplace((p) => ({ ...p, w_sigoon: v }))} setWorkplaceDong={(v) => setWorkplace((p) => ({ ...p, w_dong: v }))} />
              </div>
              <div>
                <Label>
                  관심지역 <span className="font-normal text-gray-400 normal-case">(읍면동 단위)</span>
                </Label>
                <InterestSearch setInterestSido={(v) => setInterestLocation((p) => ({ ...p, i_sido: v }))} setInterestSigoon={(v) => setInterestLocation((p) => ({ ...p, i_sigoon: v }))} setInterestDong={(v) => setInterestLocation((p) => ({ ...p, i_dong: v }))} />
              </div>
            </div>

            {/* 직종 */}
            <Field label="직종 (최대 3개)">
              <button type="button" onClick={() => setPopup((p) => ({ ...p, job: true }))} className="btn-outline mb-2">
                직종 선택
              </button>
              <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-200 min-h-[44px]">
                {selectedJobs.map((job, i) => (
                  <Chip key={i} label={job} onDelete={() => setSelectedJobs((p) => p.filter((j) => j !== job))} />
                ))}
              </div>
            </Field>

            {/* 카테고리 */}
            <Field label="관심사 카테고리 (3개 이상)">
              <button type="button" onClick={() => setPopup((p) => ({ ...p, category: true }))} className="btn-outline mb-2">
                카테고리 선택
              </button>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 min-h-[44px]">
                {Object.entries(groupedCategories).map(([main, subs]) => (
                  <div key={main} className="mb-2">
                    <p className="text-xs font-nanum-bold text-gray-600 mb-1">{main}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {subs.map((sub, i) => (
                        <Chip key={i} label={sub} onDelete={() => setSelectedCategories((p) => p.filter((c) => !(c.main === main && c.sub === sub)))} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Field>

            {/* 약관 동의 */}
            <div className="mb-6 mt-6">
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input type="checkbox" checked={checks.all} onChange={handleAllCheck} className="w-4 h-4 rounded text-primary-600 focus:ring-primary-400" />
                <span className="font-nanum-bold text-gray-900">전체 동의하기</span>
              </label>
              <div className="bg-gray-50 rounded-xl p-3 mb-4 text-xs text-gray-500">실명 인증된 아이디로 가입, 위치기반서비스 이용약관(선택), 이벤트·혜택 정보 수신(선택) 동의를 포함합니다.</div>
              {[
                { key: "terms", label: "[필수] clubing 이용약관" },
                { key: "privacy", label: "[필수] 개인정보 수집 및 이용" },
                { key: "marketing", label: "[선택] 마케팅 동의" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={checks[key]} onChange={() => handleCheck(key)} className="w-4 h-4 rounded text-primary-600 focus:ring-primary-400" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                  <button type="button" onClick={() => setPopup((p) => ({ ...p, [key]: true }))} className="text-xs text-primary-600 hover:underline">
                    전체보기
                  </button>
                </div>
              ))}
            </div>

            <button type="submit" className="btn-primary w-full py-3 text-base mt-4">
              회원가입
            </button>

            <p className="text-center text-sm text-gray-500 mt-5">
              이미 계정이 있으신가요?{" "}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                로그인
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* 팝업들 */}
      {popup.job && <JobPopup jobCategories={JobCategories} onSelect={handleSelection} onClose={() => setPopup((p) => ({ ...p, job: false }))} selectedJobs={selectedJobs} />}
      {popup.category && <CategoryPopup categories={categories} onSelect={handleSelection} onClose={() => setPopup((p) => ({ ...p, category: false }))} selectedCategories={selectedCategories} />}
      {popup.terms && <TermsPopup onClose={() => setPopup((p) => ({ ...p, terms: false }))} handleCheck={handleCheck} checked={{ terms: checks.terms }} />}
      {popup.privacy && <PrivacyPopup onClose={() => setPopup((p) => ({ ...p, privacy: false }))} handleCheck={handleCheck} checked={{ privacy: checks.privacy }} />}
      {popup.marketing && <MarketingPopup onClose={() => setPopup((p) => ({ ...p, marketing: false }))} handleCheck={handleCheck} checked={{ marketing: checks.marketing }} />}
    </div>
  );
};

export default RegisterPage;
