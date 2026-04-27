import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";

const InterestSearch = ({ setInterestSido, setInterestSigoon, setInterestDong }) => {
  const [interestResults, setInterestResults] = useState([]);
  const { formState: { errors }, register, setValue, watch } = useForm();

  const { user } = useSelector((state) => state.user?.userData || {});
  const apiKey = process.env.REACT_APP_KEY_API;
  const port = process.env.REACT_APP_ADDRESS_API;
  const interestSearchTerm = watch("interestSearchTerm");

  useEffect(() => {
    if (interestSearchTerm) {
      fetch(`/api/req/data?service=data&request=GetFeature&data=LT_C_ADEMD_INFO&key=${apiKey}&domain=${port}&attrFilter=emd_kor_nm:like:${interestSearchTerm}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.response?.status === "OK" && data.response?.result?.featureCollection?.features) {
            setInterestResults(data.response.result.featureCollection.features.map((i) => i.properties));
          } else setInterestResults([]);
        })
        .catch(() => setInterestResults([]));
    } else setInterestResults([]);
  }, [interestSearchTerm]);

  const handleInterestSelect = (item) => {
    const [i_sido, i_sigoon, i_dong] = item.full_nm.split(" ");
    setInterestSido(i_sido);
    setInterestSigoon(i_sigoon);
    setInterestDong(i_dong);
    setInterestResults([]);
    setValue("interestSearchTerm", item.full_nm);
  };

  const handleInterestKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); if (interestResults.length > 0) handleInterestSelect(interestResults[0]); }
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;
    const parts = inputValue.split(" ").filter(Boolean).slice(0, 3);
    setInterestSido(parts[0] || "");
    setInterestSigoon(parts[1] || "");
    setInterestDong(parts[2] || "");
    setValue("interestSearchTerm", inputValue, { shouldValidate: true });
  };

  return (
    <div className="w-full">
      <input
        id="interestSearchTerm"
        type="text"
        className={`w-full border rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 mt-2 ${errors.interestSearchTerm ? "border-red-400" : "border-gray-300"}`}
        placeholder="*읍면동 중 하나 입력해주세요 예) 강화읍"
        {...register("interestSearchTerm", { pattern: { value: /^[가-힣\s]*$/, message: "한글만 입력 가능합니다." } })}
        onKeyDown={handleInterestKeyDown}
        onChange={handleChange}
      />
      {errors.interestSearchTerm && <p className="text-xs text-red-500 mt-1">{errors.interestSearchTerm.message}</p>}
      {interestResults.length > 0 && (
        <ul className="border border-gray-200 rounded-lg mt-1 bg-white shadow-md max-h-40 overflow-y-auto">
          {interestResults.map((item, index) => (
            <li
              key={index}
              className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleInterestSelect(item)}
            >
              {item.full_nm}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InterestSearch;
