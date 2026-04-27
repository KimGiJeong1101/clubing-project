import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { registerUser } from "../../../store/actions/userActions";
import HomeSearch from "./address/HomeSearch";
import WorkplaceSearch from "./address/WorkplaceSearch";
import InterestSearch from "./address/InterestSearch";
import CategoryPopup from "./category/CategoryPopup";
import categories from "./category/CategoriesData";
import JobPopup from "./job/JobPopup";
import JobCategories from "./job/JobCategories";
import axios from "axios";
import TermsPopup from "./consent/Terms";
import PrivacyPopup from "./consent/Privacy";
import MarketingPopup from "./consent/Marketing";
import { FiX } from "react-icons/fi";
import CustomCheckbox from "../../../components/club/CustomCheckbox";
import CustomButton2 from "../../../components/club/CustomButton2";
import CustomSnackbarWithTimer from "../../../components/auth/Snackbar";

const SnsRegister = () => {
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
      email: "",
      age: { year: "1990", month: "9", day: "10" },
      gender: "남성",
      homeLocation: { sido: "서울특별시", sigoon: "동작구", dong: "상도동" },
      workplace: { w_sido: "", w_sigoon: "", w_dong: "" },
      interestLocation: { i_sido: "", i_sigoon: "", i_dong: "" },
      category: [],
      selectedJobs: [],
      phone: [],
    },
    mode: "onChange",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [userEmail, setUserEmail] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const emailParam = new URLSearchParams(location.search).get("email");
    if (emailParam) setUserEmail(emailParam);
  }, []);

  const [snackbar, setSnackbar] = useState({ open: false, msg: "", ok: true });

  const [homeLocation, setHomeLocation] = useState({ sido: "", sigoon: "", dong: "" });
  const [workplace, setWorkplace] = useState({ w_sido: "", w_sigoon: "", w_dong: "" });
  const [interestLocation, setInterestLocation] = useState({ i_sido: "", i_sigoon: "", i_dong: "" });

  useEffect(() => {
    setValue("homeLocation.sido", homeLocation.sido);
    setValue("homeLocation.sigoon", homeLocation.sigoon);
    setValue("homeLocation.dong", homeLocation.dong);
  }, [homeLocation, setValue]);
  useEffect(() => {
    setValue("workplace.w_sido", workplace.w_sido);
    setValue("workplace.w_sigoon", workplace.w_sigoon);
    setValue("workplace.w_dong", workplace.w_dong);
  }, [workplace, setValue]);
  useEffect(() => {
    setValue("interestLocation.i_sido", interestLocation.i_sido);
    setValue("interestLocation.i_sigoon", interestLocation.i_sigoon);
    setValue("interestLocation.i_dong", interestLocation.i_dong);
  }, [interestLocation, setValue]);

  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [groupedCategories, setGroupedCategories] = useState({});
  const [isJobPopupOpen, setIsJobPopupOpen] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState([]);

  function groupCategories(cats) {
    return cats.reduce((acc, cat) => {
      if (!acc[cat.main]) acc[cat.main] = [];
      acc[cat.main].push(cat.sub);
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
  }, [selectedCategories, setValue]);

  useEffect(() => {
    setValue("selectedJobs", selectedJobs);
  }, [selectedJobs, setValue]);

  const handleSelection = (newSelections) => {
    if (isCategoryPopupOpen) setSelectedCategories(newSelections);
    else if (isJobPopupOpen) setSelectedJobs(newSelections);
  };

  const [isNickNameChecked, setIsNickNameChecked] = useState(false);
  const [isNickNameReset, setIsNickNameReset] = useState(false);
  const nickNameValue = watch("nickName");

  const handleCheckNickName = async () => {
    if (!nickNameValue?.trim()) {
      setSnackbar({ open: true, msg: "닉네임을 입력해주세요.", ok: false });
      return;
    }
    if (errors.nickName) {
      setSnackbar({ open: true, msg: "유효한 닉네임을 입력하세요.", ok: false });
      return;
    }
    try {
      const response = await axios.post(`${apiUrl}/users/check-nickname`, { nickName: nickNameValue });
      setSnackbar({ open: true, msg: response.data.message, ok: true });
      setIsNickNameChecked(true);
      setIsNickNameReset(true);
    } catch (err) {
      setSnackbar({ open: true, msg: err.response?.data?.message || "서버 오류", ok: false });
      setIsNickNameChecked(false);
      setIsNickNameReset(false);
    }
  };

  const formatPhoneNumber = (value) => {
    const n = value.replace(/\D/g, "");
    if (n.length <= 3) return n;
    if (n.length <= 7) return `${n.slice(0, 3)}-${n.slice(3)}`;
    return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7, 11)}`;
  };

  const [isPopupOpen, setIsPopupOpen] = useState({ terms: false, privacy: false, marketing: false });
  const [checkboxState, setCheckboxState] = useState({ terms: false, privacy: false, marketing: false, all: false });

  const handleCheck = (type) => {
    setCheckboxState((prev) => {
      const newState = !prev[type];
      const allChecked = type === "all" ? newState : ["terms", "privacy", "marketing"].every((k) => (k === type ? newState : prev[k]));
      return { ...prev, [type]: newState, all: allChecked };
    });
  };

  const handleAllCheck = () => {
    const newChecked = !checkboxState.all;
    setCheckboxState({ terms: newChecked, privacy: newChecked, marketing: newChecked, all: newChecked });
  };

  const generateOptions = (start, end) => {
    const o = [];
    for (let i = start; i <= end; i++) o.push(i);
    return o;
  };
  const years = generateOptions(1950, 2040);
  const months = generateOptions(1, 12);
  const days = generateOptions(1, 31);

  const userName = (name) => {
    if (name.length > 20) return "최대 20자입니다.";
    if (/[0-9]/.test(name)) return "숫자는 들어갈 수 없습니다.";
    if (/[^a-zA-Z가-힣ㄱ-ㅎㅏ-ㅣ\s]/.test(name)) return "특수문자는 들어갈 수 없습니다.";
    if (/[ㄱ-ㅎㅏ-ㅣ]/.test(name)) return "자음과 모음은 들어갈 수 없습니다.";
    return true;
  };

  const onSubmit = (data) => {
    const { email, name, age = {}, gender, homeLocation = {}, workplace = {}, interestLocation = {}, category = [], selectedJobs = [], phone = "", nickName } = data;
    const { terms, privacy, marketing } = checkboxState;
    const { year = "", month = "", day = "" } = age;
    const { sido = "", sigoon = "", dong = "" } = homeLocation;
    const { w_sido = "", w_sigoon = "", w_dong = "" } = workplace;
    const { i_sido = "", i_sigoon = "", i_dong = "" } = interestLocation;

    if (!isNickNameChecked) {
      setSnackbar({ open: true, msg: "닉네임 중복 검사를 해야 합니다.", ok: false });
      return;
    }
    if (!sido || !sigoon || !dong) {
      setSnackbar({ open: true, msg: "집 주소를 설정해 주세요.", ok: false });
      return;
    }
    if (selectedJobs.length === 0) {
      setSnackbar({ open: true, msg: "직종을 설정해 주세요", ok: false });
      return;
    }
    if (category.filter((c) => c.main).length < 3) {
      setSnackbar({ open: true, msg: "최소 3개의 메인 카테고리를 설정해 주세요.", ok: false });
      return;
    }
    if (!terms) {
      setSnackbar({ open: true, msg: "Clubing 이용약관에 동의해야 합니다.", ok: false });
      return;
    }
    if (!privacy) {
      setSnackbar({ open: true, msg: "개인정보 수집 및 이용에 동의해야 합니다.", ok: false });
      return;
    }

    const body = {
      email,
      name,
      nickName,
      age: { year, month, day },
      gender,
      homeLocation: { city: sido, district: sigoon, neighborhood: dong },
      workplace: { city: w_sido, district: w_sigoon, neighborhood: w_dong },
      interestLocation: { city: i_sido, district: i_sigoon, neighborhood: i_dong },
      category: category.reduce((acc, cat) => {
        if (cat.main && Array.isArray(cat.sub)) acc.push({ main: cat.main, sub: cat.sub });
        return acc;
      }, []),
      job: selectedJobs,
      phone,
      termsAccepted: terms,
      privacyAccepted: privacy,
      marketingAccepted: marketing,
      profilePic: { originalImage: "https://via.placeholder.com/600x400?text=no+user+image", thumbnailImage: "https://via.placeholder.com/600x400?text=no+user+image", introduction: "" },
      registrationMethod: 1,
    };

    dispatch(registerUser(body))
      .then(() => {
        setSnackbar({ open: true, msg: "회원가입에 성공하셨습니다.", ok: true });
        setTimeout(() => navigate("/"), 1000);
      })
      .catch(() => setSnackbar({ open: true, msg: "회원가입에 실패하였습니다.", ok: false }));
    reset();
  };

  const inputCls = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500";
  const labelCls = "block text-sm font-nanum-bold text-gray-600 mb-1";
  const selectCls = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500";

  return (
    <div className="flex flex-col items-center mt-10 px-4 pb-16">
      <img src="/logo/khaki_long_h.png" className="w-[300px] mb-10" alt="logo" />

      <div className="w-full max-w-xl bg-gray-50 rounded-2xl shadow-lg p-8 space-y-5">
        <h2 className="text-2xl font-nanum-bold text-gray-800 text-center mb-2">회원가입</h2>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* 이메일 */}
          <div>
            <label className={labelCls}>이메일</label>
            <input type="email" {...register("email")} value={userEmail} readOnly className={`${inputCls} bg-gray-100 cursor-not-allowed`} />
          </div>

          {/* 이름 */}
          <div>
            <label className={labelCls}>이름</label>
            <input type="text" placeholder="이름" className={`${inputCls} ${errors.name ? "border-red-400" : ""}`} {...register("name", { required: "필수 필드입니다.", validate: userName })} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* 닉네임 */}
          <div>
            <label className={labelCls}>닉네임</label>
            <div className="flex gap-2">
              <input type="text" placeholder="닉네임" readOnly={isNickNameChecked} className={`${inputCls} flex-1 ${isNickNameChecked ? "bg-gray-100 cursor-not-allowed" : ""}`} {...register("nickName", { required: "필수 필드입니다.", maxLength: { value: 20, message: "최대 20자까지 입력할 수 있습니다." } })} />
              {!isNickNameReset ? (
                <CustomButton2 type="button" onClick={handleCheckNickName}>
                  중복검사
                </CustomButton2>
              ) : (
                <CustomButton2
                  type="button"
                  onClick={() => {
                    setIsNickNameChecked(false);
                    setIsNickNameReset(false);
                  }}
                >
                  닉네임 수정
                </CustomButton2>
              )}
            </div>
            {errors.nickName && <p className="text-xs text-red-500 mt-1">{errors.nickName.message}</p>}
          </div>

          {/* 생년월일 */}
          <div>
            <label className={labelCls}>생년월일</label>
            <div className="flex gap-2">
              <Controller
                name="age.year"
                control={control}
                defaultValue=""
                rules={{ required: "출생년도는 필수입니다." }}
                render={({ field }) => (
                  <select {...field} className={selectCls}>
                    <option value="">출생년도</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                )}
              />
              <Controller
                name="age.month"
                control={control}
                defaultValue=""
                rules={{ required: "월은 필수입니다." }}
                render={({ field }) => (
                  <select {...field} className={selectCls}>
                    <option value="">월</option>
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                )}
              />
              <Controller
                name="age.day"
                control={control}
                defaultValue=""
                rules={{ required: "일은 필수입니다." }}
                render={({ field }) => (
                  <select {...field} className={selectCls}>
                    <option value="">일</option>
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
          </div>

          {/* 성별 */}
          <div>
            <label className={labelCls}>성별</label>
            <Controller
              name="gender"
              control={control}
              defaultValue=" "
              rules={{ required: "성별을 선택해 주세요." }}
              render={({ field }) => (
                <div className="flex gap-2">
                  <button type="button" onClick={() => field.onChange("남성")} className={`flex-1 py-2.5 rounded-lg font-medium text-white transition-all ${watch("gender") === "남성" ? "bg-blue-800 ring-2 ring-blue-400" : "bg-blue-500 hover:bg-blue-600"}`}>
                    남자
                  </button>
                  <button type="button" onClick={() => field.onChange("여성")} className={`flex-1 py-2.5 rounded-lg font-medium text-white transition-all ${watch("gender") === "여성" ? "bg-pink-700 ring-2 ring-pink-400" : "bg-pink-500 hover:bg-pink-600"}`}>
                    여자
                  </button>
                </div>
              )}
            />
            {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender.message}</p>}
          </div>

          {/* 전화번호 */}
          <div>
            <label className={labelCls}>전화번호 (* 번호만 입력해 주세요)</label>
            <Controller
              name="phone"
              control={control}
              defaultValue=""
              rules={{ required: "전화번호는 필수입니다.", pattern: { value: /^\d{3}-\d{4}-\d{4}$/, message: "전화번호 형식을 확인해 주세요. 예) 010-0000-0000" } }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="010-0000-0000"
                  className={`${inputCls} ${errors.phone ? "border-red-400" : ""}`}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    setValue("phone", formatted, { shouldValidate: true });
                  }}
                  value={watch("phone")}
                />
              )}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>

          {/* 주소 */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-nanum-bold text-gray-600">
                집주소 <span className="text-gray-400 font-normal text-xs ml-1">(*읍면동 중 하나를 입력해 주세요)</span>
              </p>
              <HomeSearch setSelectedSido={(v) => setHomeLocation((p) => ({ ...p, sido: v }))} setSelectedSigoon={(v) => setHomeLocation((p) => ({ ...p, sigoon: v }))} setSelectedDong={(v) => setHomeLocation((p) => ({ ...p, dong: v }))} />
            </div>
            <div>
              <p className="text-sm font-nanum-bold text-gray-600">
                직장주소 <span className="text-gray-400 font-normal text-xs ml-1">(*읍면동 중 하나를 입력해 주세요)</span>
              </p>
              <WorkplaceSearch setWorkplaceSido={(v) => setWorkplace((p) => ({ ...p, w_sido: v }))} setWorkplaceSigoon={(v) => setWorkplace((p) => ({ ...p, w_sigoon: v }))} setWorkplaceDong={(v) => setWorkplace((p) => ({ ...p, w_dong: v }))} />
            </div>
            <div>
              <p className="text-sm font-nanum-bold text-gray-600">
                관심지역 <span className="text-gray-400 font-normal text-xs ml-1">(*읍면동 중 하나를 입력해 주세요)</span>
              </p>
              <InterestSearch setInterestSido={(v) => setInterestLocation((p) => ({ ...p, i_sido: v }))} setInterestSigoon={(v) => setInterestLocation((p) => ({ ...p, i_sigoon: v }))} setInterestDong={(v) => setInterestLocation((p) => ({ ...p, i_dong: v }))} />
            </div>
          </div>

          {/* 직종 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CustomButton2 type="button" onClick={() => setIsJobPopupOpen(true)}>
                직종 선택
              </CustomButton2>
              <span className="text-xs text-gray-500">(최대 3개 선택 가능)</span>
            </div>
            {isJobPopupOpen && <JobPopup jobCategories={JobCategories} onSelect={handleSelection} onClose={() => setIsJobPopupOpen(false)} selectedJobs={selectedJobs} />}
            <div className="p-3 border border-gray-200 rounded-xl bg-white min-h-[50px] flex flex-wrap gap-2">
              {selectedJobs.map((job, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full">
                  {job}
                  <button type="button" onClick={() => setSelectedJobs((p) => p.filter((j) => j !== job))}>
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 카테고리 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CustomButton2 type="button" onClick={() => setIsCategoryPopupOpen(true)}>
                카테고리 선택
              </CustomButton2>
              <span className="text-xs text-gray-500">3개 이상 선택해 주세요</span>
            </div>
            {isCategoryPopupOpen && <CategoryPopup categories={categories} onSelect={handleSelection} onClose={() => setIsCategoryPopupOpen(false)} selectedCategories={selectedCategories} />}
            <div className="p-3 border border-gray-200 rounded-xl bg-white min-h-[50px] space-y-2">
              {Object.entries(groupedCategories).map(([main, subs]) => (
                <div key={main}>
                  <p className="text-xs font-nanum-bold text-gray-600 mb-1">{main}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {subs.map((sub, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-full">
                        {sub}
                        <button type="button" onClick={() => setSelectedCategories((p) => p.filter((c) => !(c.main === main && c.sub === sub)))}>
                          <FiX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 약관 동의 */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <CustomCheckbox checked={checkboxState.all} onChange={handleAllCheck} />
                <span className="text-base font-nanum-bold text-gray-800">전체 동의하기</span>
              </label>
              <div className="mt-2 p-3 border border-gray-200 rounded-lg bg-white max-h-24 overflow-y-auto">
                <p className="text-xs text-gray-400">실명 인증된 아이디로 가입, 위치기반서비스 이용약관(선택), 이벤트·혜택 정보 수신(선택) 동의를 포함합니다.</p>
              </div>
            </div>
            {[
              { key: "terms", label: "[필수] clubing 이용약관", popup: "terms" },
              { key: "privacy", label: "[필수] 개인정보 수집 및 이용", popup: "privacy" },
              { key: "marketing", label: "[선택] 마케팅 동의", popup: "marketing" },
            ].map(({ key, label, popup }) => (
              <div key={key} className="flex items-center gap-2">
                <CustomCheckbox checked={checkboxState[key]} onChange={() => handleCheck(key)} label={label} />
                <button type="button" onClick={() => setIsPopupOpen((p) => ({ ...p, [popup]: true }))} className="text-xs text-primary-600 underline ml-auto">
                  전체
                </button>
              </div>
            ))}
          </div>

          {isPopupOpen.terms && <TermsPopup onClose={() => setIsPopupOpen((p) => ({ ...p, terms: false }))} handleCheck={handleCheck} checked={{ terms: checkboxState.terms }} />}
          {isPopupOpen.privacy && <PrivacyPopup onClose={() => setIsPopupOpen((p) => ({ ...p, privacy: false }))} handleCheck={handleCheck} checked={{ privacy: checkboxState.privacy }} />}
          {isPopupOpen.marketing && <MarketingPopup onClose={() => setIsPopupOpen((p) => ({ ...p, marketing: false }))} handleCheck={handleCheck} checked={{ marketing: checkboxState.marketing }} />}

          <div className="pt-4 space-y-4">
            <CustomButton2 type="submit" className="!w-full !py-3 !text-base">
              회원가입
            </CustomButton2>
            <p className="text-center text-sm text-gray-500">
              아이디가 있다면?{" "}
              <a href="/login" className="text-primary-600 hover:underline font-medium">
                로그인
              </a>
            </p>
          </div>
        </form>
      </div>

      <CustomSnackbarWithTimer open={snackbar.open} message={snackbar.msg} severity={snackbar.ok ? "success" : "error"} onClose={() => setSnackbar((p) => ({ ...p, open: false }))} duration={5000} />
    </div>
  );
};

export default SnsRegister;
