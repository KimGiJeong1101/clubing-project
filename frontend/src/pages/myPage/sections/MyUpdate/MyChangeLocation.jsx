import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HomeSearch from "../../../auth/RegisterPage/address/HomeSearch";
import WorkplaceSearch from "../../../auth/RegisterPage/address/WorkplaceSearch";
import InterestSearch from "../../../auth/RegisterPage/address/InterestSearch";
import axiosInstance from "../../../../utils/axios";
import CustomSnackbar from "../../../../components/auth/Snackbar";
import { FiMapPin } from "react-icons/fi";

const LocationInfo = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl border border-primary-100 mb-2">
    <span className="text-primary-400 flex-shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-xs text-primary-500 font-nanum-bold">{label}</p>
      <p className="text-sm text-gray-700 truncate">{value || "정보 없음"}</p>
    </div>
  </div>
);

const MyChangeLocation = ({ view }) => {
  const user = useSelector((state) => state.user?.userData?.user || {});
  const { handleSubmit, setValue } = useForm({
    defaultValues: {
      homeLocation: user.homeLocation || { city: "", district: "", neighborhood: "" },
      workplace: user.workplace || { city: "", district: "", neighborhood: "" },
      interestLocation: user.interestLocation || { city: "", district: "", neighborhood: "" },
    },
  });

  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const handleSnackbarClose = () => setSnackbarOpen(false);

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

  const onSubmit = async () => {
    const { sido = "", sigoon = "", dong = "" } = homeLocation;
    const { w_sido = "", w_sigoon = "", w_dong = "" } = workplace;
    const { i_sido = "", i_sigoon = "", i_dong = "" } = interestLocation;

    const body = {
      email: user.email,
      homeLocation: { city: sido, district: sigoon, neighborhood: dong },
      workplace: { city: w_sido, district: w_sigoon, neighborhood: w_dong },
      interestLocation: { city: i_sido, district: i_sigoon, neighborhood: i_dong },
    };

    try {
      const response = await axiosInstance.post("/users/update-location", body);
      if (response.data.ok) {
        setSnackbarMessage("위치 정보가 업데이트되었습니다.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setTimeout(() => navigate("/"), 2000);
      } else {
        setSnackbarMessage("업데이트 중 오류가 발생했습니다.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("위치 정보 업데이트 중 오류가 발생했습니다.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  if (view !== "changeLocation") return null;

  const formatLocation = (loc) =>
    loc ? `${loc.city || ""} ${loc.district || ""} ${loc.neighborhood || ""}`.trim() || "정보 없음" : "정보 없음";

  return (
    <div className="space-y-4">
      {/* 집 주소 */}
      <div>
        <LocationInfo icon={<FiMapPin size={16} />} label="현재 집 주소" value={formatLocation(user.homeLocation)} />
        <div className="flex items-center gap-3">
          <label className="text-sm font-nanum-bold text-gray-500 min-w-[80px]">변경 주소</label>
          <div className="flex-1">
            <HomeSearch
              setSelectedSido={(sido) => setHomeLocation((prev) => ({ ...prev, sido }))}
              setSelectedSigoon={(sigoon) => setHomeLocation((prev) => ({ ...prev, sigoon }))}
              setSelectedDong={(dong) => setHomeLocation((prev) => ({ ...prev, dong }))}
            />
          </div>
        </div>
      </div>

      {/* 직장 주소 */}
      <div>
        <LocationInfo icon={<FiMapPin size={16} />} label="현재 직장 주소" value={formatLocation(user.workplace)} />
        <div className="flex items-center gap-3">
          <label className="text-sm font-nanum-bold text-gray-500 min-w-[80px]">변경 주소</label>
          <div className="flex-1">
            <WorkplaceSearch
              setWorkplaceSido={(sido) => setWorkplace((prev) => ({ ...prev, w_sido: sido }))}
              setWorkplaceSigoon={(sigoon) => setWorkplace((prev) => ({ ...prev, w_sigoon: sigoon }))}
              setWorkplaceDong={(dong) => setWorkplace((prev) => ({ ...prev, w_dong: dong }))}
            />
          </div>
        </div>
      </div>

      {/* 관심 지역 */}
      <div>
        <LocationInfo icon={<FiMapPin size={16} />} label="현재 관심 지역" value={formatLocation(user.interestLocation)} />
        <div className="flex items-center gap-3">
          <label className="text-sm font-nanum-bold text-gray-500 min-w-[80px]">변경 지역</label>
          <div className="flex-1">
            <InterestSearch
              setInterestSido={(sido) => setInterestLocation((prev) => ({ ...prev, i_sido: sido }))}
              setInterestSigoon={(sigoon) => setInterestLocation((prev) => ({ ...prev, i_sigoon: sigoon }))}
              setInterestDong={(dong) => setInterestLocation((prev) => ({ ...prev, i_dong: dong }))}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit(onSubmit)}
        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-nanum-bold rounded-xl transition-colors"
      >
        지역 변경
      </button>

      <CustomSnackbar open={snackbarOpen} message={snackbarMessage} severity={snackbarSeverity} onClose={handleSnackbarClose} />
    </div>
  );
};

export default MyChangeLocation;
