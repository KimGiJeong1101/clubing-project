import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../../utils/axios";
import { useSelector } from "react-redux";
import { FiEye, FiEyeOff } from "react-icons/fi";
import CustomSnackbar from "../../../../components/auth/Snackbar";

const MyChangePw = ({ view }) => {
  const email = useSelector((state) => state.user?.userData?.user.email || {});
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({ mode: "onChange" });
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordCheck, setShowPasswordCheck] = useState(false);

  const userPassword = {
    required: "필수 필드입니다.",
    minLength: { value: 8, message: "최소 8자입니다." },
    validate: (value) => {
      const regex = /^(?=.*[a-zA-Zㄱ-힝])(?=.*[\W_]).{6,}$/;
      if (!regex.test(value)) return "영문 대/소문자, 특수문자를 포함해 주세요.";
      return true;
    },
  };

  const userPasswordCheck = {
    required: "필수 필드입니다.",
    minLength: { value: 8, message: "최소 8자입니다." },
    validate: (value) => value === watch("password") || "비밀번호가 일치하지 않습니다.",
  };

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const onSubmit = async (data) => {
    try {
      const response = await axiosInstance.post(`/users/change-password`, {
        email,
        newPassword: data.password,
      });
      if (response.data.ok) {
        setSnackbarMessage("비밀번호가 변경되었습니다.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setTimeout(() => navigate("/"), 2000);
      } else {
        setSnackbarMessage("비밀번호 변경 중 오류가 발생했습니다.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("비밀번호 변경 중 오류가 발생했습니다.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 pr-10 transition-all";
  const labelCls = "text-sm font-nanum-bold text-gray-500 min-w-[90px]";

  if (view !== "changePw") return null;

  return (
    <div>
      {/* 비밀번호 */}
      <div className="flex items-start mb-3">
        <label htmlFor="password" className={`${labelCls} pt-2.5`}>
          비밀번호
        </label>
        <div className="flex-1">
          <div className="relative">
            <input id="password" type={showPassword ? "text" : "password"} placeholder="새 비밀번호" {...register("password", userPassword)} className={inputCls} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
      </div>

      {/* 비밀번호 확인 */}
      <div className="flex items-start mb-4">
        <label htmlFor="passwordCheck" className={`${labelCls} pt-2.5`}>
          비밀번호 확인
        </label>
        <div className="flex-1">
          <div className="relative">
            <input id="passwordCheck" type={showPasswordCheck ? "text" : "password"} placeholder="비밀번호 확인" {...register("passwordCheck", userPasswordCheck)} className={inputCls} />
            <button type="button" onClick={() => setShowPasswordCheck(!showPasswordCheck)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPasswordCheck ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.passwordCheck && <p className="text-red-500 text-xs mt-1">{errors.passwordCheck.message}</p>}
        </div>
      </div>

      <button type="button" onClick={handleSubmit(onSubmit)} className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-nanum-bold rounded-xl transition-colors">
        비밀번호 변경
      </button>

      <CustomSnackbar open={snackbarOpen} message={snackbarMessage} severity={snackbarSeverity} onClose={handleSnackbarClose} />
    </div>
  );
};

export default MyChangePw;
