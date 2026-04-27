import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../../../../store/actions/userActions";
import CategoryPopup from "../../../auth/RegisterPage/category/CategoryPopup";
import categories from "../../../auth/RegisterPage/category/CategoriesData";
import JobPopup from "../../../auth/RegisterPage/job/JobPopup";
import JobCategories from "../../../auth/RegisterPage/job/JobCategories";
import MarketingPopup from "../../../auth/RegisterPage/consent/Marketing";
import MyCancelAccount from "./MyCancelAccount.jsx";
import MyChangePw from "./MyChangePw.jsx";
import MyChangeLocation from "./MyChangeLocation.jsx";
import axiosInstance from "../../../../utils/axios";
import "../../../../assets/styles/LoginCss.css";
import CustomCheckbox from "../../../../components/club/CustomCheckbox.jsx";
import CustomSnackbar from "../../../../components/auth/Snackbar";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

// 아코디언 버튼 공통 컴포넌트
const AccordionButton = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center justify-between text-left px-4 py-3.5 mb-2 rounded-xl font-nanum-bold text-sm transition-all duration-200
      ${active ? "bg-primary-600 text-white shadow-sm" : "bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-700 border border-gray-200"}`}
  >
    <span>{children}</span>
    {active ? <FiChevronUp className="w-4 h-4 opacity-70" /> : <FiChevronDown className="w-4 h-4 opacity-50" />}
  </button>
);

const MyUpdate = () => {
  const user = useSelector((state) => state.user?.userData?.user || {});
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
    reset,
  } = useForm({
    defaultValues: {
      name: user.name || "",
      nickName: user.nickName || "",
      age: user.age || { year: "", month: "", day: "" },
      gender: user.gender || "",
      phone: user.phone || "",
      job: user.job || [],
      category: user.category || [],
      marketingAccepted: user.marketingAccepted || false,
    },
    mode: "onChange",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const { name, nickName, age = {}, gender, selectedJobs = [], category = [], phone = "" } = data;
    const { marketing } = checkboxState;
    const { year = "", month = "", day = "" } = age;

    const categoryObject = category.reduce((acc, cat) => {
      if (cat.main && Array.isArray(cat.sub)) {
        acc.push({ main: cat.main, sub: cat.sub });
      }
      return acc;
    }, []);

    const body = { name, nickName, age: { year, month, day }, gender, category: categoryObject, job: selectedJobs, phone, marketingAccepted: marketing };

    dispatch(updateUser(body))
      .then(() => {
        setSnackbarMessage("정보 수정 완료되었습니다.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      })
      .catch((error) => {
        console.error("정보수정 실패:", error);
      });
  };

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const userName = (name) => {
    if (name.length > 20) return "최대 20자입니다.";
    if (/[0-9]/.test(name)) return "숫자는 들어갈 수 없습니다.";
    if (/[^a-zA-Z가-힣ㄱ-ㅎㅏ-ㅣ\s]/.test(name)) return "특수문자는 들어갈 수 없습니다.";
    if (/[ㄱ-ㅎㅏ-ㅣ]/.test(name)) return "자음과 모음은 들어갈 수 없습니다.";
    return true;
  };

  const nickNameRules = {
    maxLength: { value: 20, message: "닉네임은 최대 20자까지 입력할 수 있습니다." },
  };

  const nickNameValue = watch("nickName");
  const [isNickNameChecked, setIsNickNameChecked] = useState(true);
  const [isNickNameReset, setIsNickNameReset] = useState(true);

  const handleCheckNickName = async () => {
    if (!nickNameValue || nickNameValue.trim() === "") {
      setSnackbarMessage("닉네임을 입력해주세요.");
      setSnackbarOpen(true);
      return;
    }
    if (errors.nickName) {
      setSnackbarMessage("유효한 닉네임을 입력하세요.");
      setSnackbarOpen(true);
      return;
    }
    try {
      const response = await axiosInstance.post(`/users/check-nickname`, { nickName: nickNameValue });
      setSnackbarMessage(response.data.message);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setIsNickNameChecked(true);
      setIsNickNameReset(true);
    } catch (err) {
      setSnackbarMessage(err.response ? err.response.data.message : "서버 오류");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setIsNickNameChecked(false);
      setIsNickNameReset(false);
    }
  };

  const handleNickNameReset = () => {
    setIsNickNameChecked(false);
    setIsNickNameReset(false);
  };

  const handleNickNameCancel = () => {
    setIsNickNameChecked(true);
    setIsNickNameReset(true);
    reset({ nickName: user.nickName || "" });
  };

  const generateOptions = (start, end) => {
    const options = [];
    for (let i = start; i <= end; i++) options.push(i);
    return options;
  };

  const years = generateOptions(1950, 2040);
  const months = generateOptions(1, 12);
  const days = generateOptions(1, 31);

  // 카테고리
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [groupedCategories, setGroupedCategories] = useState({});

  useEffect(() => {
    if (user && user.category) {
      const formattedCategories = user.category.flatMap((cat) => cat.sub.flat().map((item) => ({ main: cat.main, sub: item })));
      setSelectedCategories(formattedCategories);
    }
  }, [user]);

  // 직종
  const [isJobPopupOpen, setIsJobPopupOpen] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState([]);

  useEffect(() => {
    if (user && user.job) setSelectedJobs(user.job);
  }, [user]);

  function groupCategories(cats) {
    return cats.reduce((acc, cat) => {
      if (!acc[cat.main]) acc[cat.main] = [];
      acc[cat.main].push(cat.sub);
      return acc;
    }, {});
  }

  useEffect(() => {
    const grouped = groupCategories(selectedCategories);
    const categoryData = Object.keys(grouped).map((main) => ({ main, sub: grouped[main] }));
    setGroupedCategories(grouped);
    setValue("category", categoryData);
  }, [selectedCategories, setValue]);

  useEffect(() => {
    setValue("selectedJobs", selectedJobs);
  }, [selectedJobs, setValue]);

  const handleSelection = (newSelections) => {
    if (isCategoryPopupOpen) setSelectedCategories(newSelections);
    else if (isJobPopupOpen) setSelectedJobs(newSelections);
  };

  const handlePopupOpen = (type) => {
    if (type === "category") setIsCategoryPopupOpen(true);
    else if (type === "job") setIsJobPopupOpen(true);
  };

  const handlePopupClose = (type) => {
    if (type === "category") setIsCategoryPopupOpen(false);
    else if (type === "job") setIsJobPopupOpen(false);
  };

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  useEffect(() => {
    if (user && user.marketingAccepted !== undefined) {
      setCheckboxState((prev) => ({ ...prev, marketing: user.marketingAccepted }));
    }
  }, [user]);

  const [isPopupOpen, setIsPopupOpen] = useState({ marketing: false });
  const [checkboxState, setCheckboxState] = useState({ marketing: false });

  const handleCheck = (type) => {
    setCheckboxState((prevState) => {
      const newState = !prevState[type];
      const allChecked = ["marketing"].every((key) => prevState[key]);
      return { ...prevState, [type]: newState, all: allChecked };
    });
  };

  const consentPopupOpen = (type) => setIsPopupOpen((prev) => ({ ...prev, [type]: true }));
  const consentPopupClose = (type) => setIsPopupOpen((prev) => ({ ...prev, [type]: false }));

  // 뷰 관리
  const [view, setView] = useState("");

  const toggle = (section) => {
    setView((prev) => (prev === section ? "" : section));
  };

  // 공통 input 스타일
  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all";
  const labelCls = "text-sm font-nanum-bold text-gray-500 min-w-[90px]";

  return (
    <div className="flex flex-col max-w-[600px] mx-auto pb-10 gap-2">
      {/* 정보 수정 */}
      <AccordionButton active={view === "update"} onClick={() => toggle("update")}>
        정보 수정
      </AccordionButton>

      {view === "update" && (
        <form className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-2" onSubmit={handleSubmit(onSubmit)}>
          {/* 이메일 */}
          <div className="flex items-center mb-4">
            <label className={labelCls}>이메일</label>
            <span className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl text-gray-400 text-sm border border-gray-100">{user.email}</span>
          </div>

          {/* 이름 */}
          <div className="flex items-start mb-4">
            <label className={`${labelCls} pt-2.5`} htmlFor="name">
              이름
            </label>
            <div className="flex-1">
              <input id="name" type="text" placeholder="이름" className={inputCls} {...register("name", { validate: userName })} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
          </div>

          {/* 닉네임 */}
          <div className="flex items-start mb-4">
            <label className={`${labelCls} pt-2.5`} htmlFor="nickName">
              닉네임
            </label>
            <div className="flex flex-col flex-1 gap-2">
              <div className="flex gap-2 items-center">
                <input id="nickName" type="text" placeholder="닉네임" readOnly={isNickNameChecked} className={`${inputCls} flex-1 ${isNickNameChecked ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}`} {...register("nickName", nickNameRules)} />
                {!isNickNameChecked ? (
                  <div className="flex gap-1.5">
                    <button type="button" onClick={handleCheckNickName} className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-nanum-bold rounded-lg transition-colors whitespace-nowrap">
                      중복검사
                    </button>
                    <button type="button" onClick={handleNickNameCancel} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-nanum-bold rounded-lg transition-colors whitespace-nowrap">
                      취소
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={handleNickNameReset} className="px-3 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-nanum-bold rounded-lg transition-colors whitespace-nowrap border border-primary-100">
                    수정
                  </button>
                )}
              </div>
              {errors?.nickName && <p className="text-red-500 text-xs">{errors.nickName.message}</p>}
            </div>
          </div>

          {/* 생년월일 */}
          <div className="flex items-start mb-4">
            <label className={`${labelCls} pt-2.5`}>생년월일</label>
            <div className="flex flex-1 gap-2">
              {[
                { name: "age.year", placeholder: "출생년도", options: years, rule: "출생년도는 필수입니다." },
                { name: "age.month", placeholder: "월", options: months, rule: "월은 필수입니다." },
                { name: "age.day", placeholder: "일", options: days, rule: "일은 필수입니다." },
              ].map(({ name, placeholder, options, rule }) => (
                <div key={name} className="flex-1">
                  <Controller
                    name={name}
                    control={control}
                    defaultValue=""
                    rules={{ required: rule }}
                    render={({ field }) => (
                      <select {...field} className={inputCls}>
                        <option value="">{placeholder}</option>
                        {options.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 성별 */}
          <div className="flex items-start mb-4">
            <label className={`${labelCls} pt-2`}>성별</label>
            <div className="flex flex-1 gap-2">
              <Controller
                name="gender"
                control={control}
                defaultValue=""
                rules={{ required: "성별을 선택해 주세요." }}
                render={({ field }) => (
                  <>
                    <button
                      type="button"
                      onClick={() => field.onChange("남성")}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-nanum-bold transition-all duration-200
                        ${watch("gender") === "남성" ? "bg-primary-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-700"}`}
                    >
                      남자
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange("여성")}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-nanum-bold transition-all duration-200
                        ${watch("gender") === "여성" ? "bg-primary-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-700"}`}
                    >
                      여자
                    </button>
                  </>
                )}
              />
            </div>
          </div>

          {/* 전화번호 */}
          <div className="flex items-start mb-4">
            <label className={`${labelCls} pt-2.5`}>전화번호</label>
            <div className="flex-1">
              <Controller
                name="phone"
                control={control}
                defaultValue=""
                rules={{
                  required: "전화번호는 필수입니다.",
                  pattern: { value: /^\d{3}-\d{4}-\d{4}$/, message: "형식: 010-7430-3504" },
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="010-0000-0000"
                    className={`${inputCls} ${errors.phone ? "border-red-300 focus:ring-red-200" : ""}`}
                    onChange={(e) => {
                      const formattedValue = formatPhoneNumber(e.target.value);
                      setValue("phone", formattedValue, { shouldValidate: true });
                    }}
                    value={watch("phone")}
                  />
                )}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          {/* 직종 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <button type="button" onClick={() => handlePopupOpen("job")} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-nanum-bold rounded-xl transition-colors">
                직종 선택
              </button>
            </div>
            {isJobPopupOpen && <JobPopup jobCategories={JobCategories} onSelect={handleSelection} onClose={() => handlePopupClose("job")} selectedJobs={selectedJobs} />}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 min-h-[44px]">
              <div className="flex flex-wrap gap-2">
                {selectedJobs.length === 0 ? (
                  <span className="text-sm text-gray-400">선택된 직종이 없습니다.</span>
                ) : (
                  selectedJobs.map((job, index) => (
                    <span key={index} className="flex items-center gap-1 bg-primary-50 text-primary-700 border border-primary-100 text-sm px-3 py-1 rounded-full">
                      {job}
                      <button type="button" onClick={() => setSelectedJobs((prev) => prev.filter((j) => j !== job))} className="ml-0.5 text-primary-400 hover:text-red-500 font-bold leading-none">
                        &times;
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 카테고리 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <button type="button" onClick={() => handlePopupOpen("category")} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-nanum-bold rounded-xl transition-colors">
                카테고리 선택
              </button>
              <span className="text-xs text-gray-400">3개 이상 선택해 주세요</span>
            </div>
            {isCategoryPopupOpen && <CategoryPopup categories={categories} onSelect={handleSelection} onClose={() => handlePopupClose("category")} selectedCategories={selectedCategories} />}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 min-h-[44px]">
              <div className="flex flex-wrap gap-2">
                {Object.entries(groupedCategories).length === 0 ? (
                  <span className="text-sm text-gray-400">선택된 카테고리가 없습니다.</span>
                ) : (
                  Object.entries(groupedCategories).map(([main, subs]) => (
                    <div key={main} className="w-full">
                      <p className="text-xs font-nanum-bold text-gray-500 mb-1.5">{main}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {subs.map((sub, index) => (
                          <span key={index} className="flex items-center gap-1 bg-primary-50 text-primary-700 border border-primary-100 text-sm px-3 py-1 rounded-full">
                            {sub}
                            <button type="button" onClick={() => setSelectedCategories((prev) => prev.filter((cat) => !(cat.main === main && cat.sub === sub)))} className="ml-0.5 text-primary-400 hover:text-red-500 font-bold leading-none">
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 마케팅 동의 */}
          <div className="mb-5 flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <CustomCheckbox id="marketing-checkbox" checked={checkboxState.marketing} onChange={() => handleCheck("marketing")} color="primary" />
              <span className="text-sm text-gray-600">[선택] 마케팅 동의</span>
            </label>
            <button type="button" onClick={() => consentPopupOpen("marketing")} className="text-primary-600 text-xs underline">
              전체보기
            </button>
          </div>

          {isPopupOpen.marketing && <MarketingPopup onClose={() => consentPopupClose("marketing")} handleCheck={handleCheck} checked={{ marketing: checkboxState.marketing }} />}

          {/* 수정 버튼 */}
          <button type="submit" className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-nanum-bold rounded-xl transition-colors">
            수정하기
          </button>
        </form>
      )}

      {/* 비밀번호 변경 */}
      <AccordionButton active={view === "changePw"} onClick={() => toggle("changePw")}>
        비밀번호 변경
      </AccordionButton>
      {view === "changePw" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-2">
          <MyChangePw view={view} />
        </div>
      )}

      {/* 주소 변경 */}
      <AccordionButton active={view === "changeLocation"} onClick={() => toggle("changeLocation")}>
        주소 변경
      </AccordionButton>
      {view === "changeLocation" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-2">
          <MyChangeLocation view={view} />
        </div>
      )}

      {/* 회원 탈퇴 */}
      <AccordionButton active={view === "delete"} onClick={() => toggle("delete")}>
        회원 탈퇴
      </AccordionButton>
      {view === "delete" && (
        <div className="mb-2">
          <MyCancelAccount view={view} />
        </div>
      )}

      <CustomSnackbar open={snackbarOpen} message={snackbarMessage} severity="success" onClose={handleSnackbarClose} />
    </div>
  );
};

export default MyUpdate;
