import React, { useState, useEffect } from "react";

const HomeSearchClub = ({ setSelectedSido, setSelectedSigoon, setSelectedDong, initialSido, initialSigoon, initialDong }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [initialized, setInitialized] = useState(false);

  const apiKey = "286E5CAE-A8D1-3D02-AB4E-2DF927614303";
  const port = process.env.REACT_APP_ADDRESS_API;

  useEffect(() => {
    if (!initialized && initialSido && initialSigoon && initialDong) {
      setSearchTerm(`${initialSido} ${initialSigoon} ${initialDong}`);
      setInitialized(true);
    }
  }, [initialSido, initialSigoon, initialDong, initialized]);

  useEffect(() => {
    const fetchData = async () => {
      if (searchTerm) {
        try {
          const response = await fetch(`/api/req/data?service=data&request=GetFeature&data=LT_C_ADEMD_INFO&key=${apiKey}&domain=${port}&attrFilter=emd_kor_nm:like:${searchTerm}`);
          const data = await response.json();
          if (data.response?.status === "OK" && data.response?.result?.featureCollection?.features) {
            setResults(data.response.result.featureCollection.features.map((item) => item.properties));
          } else setResults([]);
        } catch {
          setResults([]);
        }
      } else setResults([]);
    };
    fetchData();
  }, [searchTerm, apiKey, port]);

  const handleSelect = (item) => {
    const [sido, sigoon, dong] = item.full_nm.split(" ");
    setSelectedSido(sido);
    setSelectedSigoon(sigoon);
    setSelectedDong(dong);
    setResults([]);
    setSearchTerm(item.full_nm);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); if (results.length > 0) handleSelect(results[0]); }
  };

  return (
    <div className="w-full">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="*동을 입력해주세요"
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 hover:border-[#A67153] transition-colors mt-2"
      />
      {results.length > 0 && (
        <ul className="border border-gray-200 rounded-lg mt-1 bg-white shadow-md max-h-44 overflow-y-auto z-10">
          {results.map((item, index) => (
            <li
              key={index}
              className="px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 transition-colors"
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

export default HomeSearchClub;
