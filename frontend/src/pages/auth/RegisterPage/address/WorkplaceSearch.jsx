import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";

const WorkplaceSearch = ({ setWorkplaceSido, setWorkplaceSigoon, setWorkplaceDong }) => {
  const [workplaceResults, setWorkplaceResults] = useState([]);
  const { formState: { errors }, register, setValue, watch } = useForm();

  const { user } = useSelector((state) => state.user?.userData || {});
  const apiKey = process.env.REACT_APP_KEY_API;
  const port = process.env.REACT_APP_ADDRESS_API;
  const workplaceSearchTerm = watch("workplaceSearchTerm");

  useEffect(() => {
    if (workplaceSearchTerm) {
      fetch(`/api/req/data?service=data&request=GetFeature&data=LT_C_ADEMD_INFO&key=${apiKey}&domain=${port}&attrFilter=emd_kor_nm:like:${workplaceSearchTerm}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.response?.status === "OK" && data.response?.result?.featureCollection?.features) {
            setWorkplaceResults(data.response.result.featureCollection.features.map((i) => i.properties));
          } else setWorkplaceResults([]);
        })
        .catch(() => setWorkplaceResults([]));
    } else setWorkplaceResults([]);
  }, [workplaceSearchTerm]);

  const handleWorkplaceSelect = (item) => {
    const [w_sido, w_sigoon, w_dong] = item.full_nm.split(" ");
    setWorkplaceSido(w_sido);
    setWorkplaceSigoon(w_sigoon);
    setWorkplaceDong(w_dong);
    setWorkplaceResults([]);
    setValue("workplaceSearchTerm", item.full_nm);
  };

  const handleWorkplaceKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); if (workplaceResults.length > 0) handleWorkplaceSelect(workplaceResults[0]); }
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;
    const parts = inputValue.split(" ").filter(Boolean).slice(0, 3);
    setWorkplaceSido(parts[0] || "");
    setWorkplaceSigoon(parts[1] || "");
    setWorkplaceDong(parts[2] || "");
    setValue("workplaceSearchTerm", inputValue, { shouldValidate: true });
  };

  return (
    <div className="w-full">
      <input
        id="workplaceSearchTerm"
        type="text"
        className={`w-full border rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 mt-2 ${errors.workplaceSearchTerm ? "border-red-400" : "border-gray-300"}`}
        placeholder="*읍면동 중 하나 입력해주세요 예) 옥천면"
        {...register("workplaceSearchTerm", { pattern: { value: /^[가-힣\s]*$/, message: "한글만 입력 가능합니다." } })}
        onKeyDown={handleWorkplaceKeyDown}
        onChange={handleChange}
      />
      {errors.workplaceSearchTerm && <p className="text-xs text-red-500 mt-1">{errors.workplaceSearchTerm.message}</p>}
      {workplaceResults.length > 0 && (
        <ul className="border border-gray-200 rounded-lg mt-1 bg-white shadow-md max-h-40 overflow-y-auto">
          {workplaceResults.map((item, index) => (
            <li
              key={index}
              className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleWorkplaceSelect(item)}
            >
              {item.full_nm}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WorkplaceSearch;
