import React, { useState, useEffect } from "react";
import { TextField, List, ListItem, ListItemButton, ListItemText } from "@mui/material";

const textFieldStyles = {
  // 기본 상태에서의 색상은 따로 설정하지 않음
  "& .MuiOutlinedInput-root": {
    // 호버 시 테두리 색상 변경
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#A67153", // 호버 시 테두리 색상
    },
    // 포커스 시 테두리 색상 변경
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#A6836F", // 포커스 시 테두리 색상
    },
  },
  // 포커스 시 라벨 색상 변경
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#A6836F", // 포커스 시 라벨 색상
  },
};
const HomeSearchClub = ({ setSelectedSido, setSelectedSigoon, setSelectedDong, initialSido, initialSigoon, initialDong }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [initialized, setInitialized] = useState(false);

  const apiKey = "286E5CAE-A8D1-3D02-AB4E-2DF927614303";
  const port = process.env.REACT_APP_ADDRESS_API;

  // Initialize with default values if provided
  useEffect(() => {
    if (!initialized && initialSido && initialSigoon && initialDong) {
      const full_nm = `${initialSido} ${initialSigoon} ${initialDong}`;
      setSearchTerm(full_nm);
      setInitialized(true);
    }
  }, [initialSido, initialSigoon, initialDong, initialized]);

  // Fetch data when searchTerm changes
  useEffect(() => {
    const fetchData = async () => {
      if (searchTerm) {
        try {
          const response = await fetch(`/api/req/data?service=data&request=GetFeature&data=LT_C_ADEMD_INFO&key=${apiKey}&domain=${port}&attrFilter=emd_kor_nm:like:${searchTerm}`);
          const data = await response.json();

          if (data.response && data.response.status === "OK" && data.response.result && data.response.result.featureCollection.features) {
            setResults(data.response.result.featureCollection.features.map((item) => item.properties));
          } else {
            setResults([]);
            console.error("Invalid API response:", data);
          }
        } catch (error) {
          setResults([]);
          console.error("Error fetching data:", error);
        }
      } else {
        setResults([]);
      }
    };

    fetchData();
  }, [searchTerm, apiKey, port]); // Ensure that apiKey and port are included in the dependency array if they are dynamic

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSelect = (item) => {
    const [sido, sigoon, dong] = item.full_nm.split(" ");
    setSelectedSido(sido);
    setSelectedSigoon(sigoon);
    setSelectedDong(dong);
    setResults([]);
    setSearchTerm(item.full_nm);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0) {
        handleSelect(results[0]);
      }
    }
  };

  return (
    <div>
      <TextField fullWidth variant="outlined" value={searchTerm} onChange={handleSearch} onKeyDown={handleKeyDown} placeholder="*동을 입력해주세요" margin="normal" sx={{ ...textFieldStyles }} />
      <List>
        {results.map((item, index) => (
          <ListItem disablePadding key={index}>
            <ListItemButton onClick={() => handleSelect(item)}>
              <ListItemText primary={item.full_nm} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default HomeSearchClub;
