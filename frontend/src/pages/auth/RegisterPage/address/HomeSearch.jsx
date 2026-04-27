import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";

const HomeSearch = ({ setSelectedSido, setSelectedSigoon, setSelectedDong }) => {
  const [results, setResults] = useState([]);
  const { formState: { errors }, register, setValue, watch } = useForm();

  const { user } = useSelector((state) => state.user?.userData || {});
  const apiKey = process.env.REACT_APP_KEY_API;
  const port = process.env.REACT_APP_ADDRESS_API;
  const searchTerm = watch("searchTerm");

  useEffect(() => {
    if (searchTerm) {
      fetch(`/api/req/data?service=data&request=GetFeature&data=LT_C_ADEMD_INFO&key=${apiKey}&domain=${port}&attrFilter=emd_kor_nm:like:${searchTerm}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.response?.status === "OK" && data.response?.result?.featureCollection?.features) {
            setResults(data.response.result.featureCollection.features.map((i) => i.properties));
          } else setResults([]);
        })
        .catch(() => setResults([]));
    } else setResults([]);
  }, [searchTerm]);

  const handleSelect = (item) => {
    const [sido, sigoon, dong] = item.full_nm.split(" ");
    setSelectedSido(sido);
    setSelectedSigoon(sigoon);
    setSelectedDong(dong);
    setResults([]);
    setValue("searchTerm", item.full_nm);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); if (results.length > 0) handleSelect(results[0]); }
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;
    const parts = inputValue.split(" ").filter(Boolean).slice(0, 3);
    setSelectedSido(parts[0] || "");
    setSelectedSigoon(parts[1] || "");
    setSelectedDong(parts[2] || "");
    setValue("searchTerm", inputValue, { shouldValidate: true });
  };

  return (
    <div className="w-full">
      <input
        id="searchTerm"
        type="text"
        className={`w-full border rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 mt-2 ${errors.searchTerm ? "border-red-400" : "border-gray-300"}`}
        placeholder="*읍면동 중 하나 입력해주세요 예) 상도동"
        {...register("searchTerm", { pattern: { value: /^[가-힣\s]*$/, message: "한글만 입력 가능합니다." } })}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
      />
      {errors.searchTerm && <p className="text-xs text-red-500 mt-1">{errors.searchTerm.message}</p>}
      {results.length > 0 && (
        <ul className="border border-gray-200 rounded-lg mt-1 bg-white shadow-md max-h-40 overflow-y-auto">
          {results.map((item, index) => (
            <li
              key={index}
              className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSelect(item)}
            >
              {item.full_nm}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HomeSearch;
