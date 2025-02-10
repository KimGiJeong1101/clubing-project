import React, { useState } from "react";
import { Box, Button, InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const SearchInput = ({ onSearch, inputRef }) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false); // 포커스 상태 관리

  const handleSearch = () => {
    console.log("검색핸들러 잘 되는지 확인");

    if (query.trim()) {
      onSearch(query); // 검색어를 부모 컴포넌트로 전달
      // setQuery(""); // 검색 후 입력란 초기화
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // 기본 동작 방지 (예: 줄바꿈)
      handleSearch(); // 검색 함수 호출
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", backgroundColor: "#D5D3CB", padding: "7px" }}>
      <TextField
        inputRef={inputRef} // 부모에서 전달된 ref를 사용
        variant="outlined"
        fullWidth
        margin="normal"
        placeholder="검색어를 입력하세요"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)} // 포커스 상태 설정
        onBlur={() => setIsFocused(false)} // 포커스 해제 시 상태 변경
        onKeyPress={handleKeyPress}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon
                sx={{
                  color: isFocused ? "white" : "black", // 포커스 시 아이콘 색상 변경
                }}
              />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Button
                onClick={handleSearch}
                variant="contained"
                sx={{
                  background: "#DBC7B5",
                  height: "40px",
                  padding: "0 16px",
                  minWidth: "80px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  border: "solid 1px white",
                  color: "black",
                  "&:hover": {
                    borderColor: "black", // 호버 시 테두리 검정색
                    backgroundColor: "#a6836f", // 호버 시 배경 흰색
                  },
                }}
              >
                검색
              </Button>
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 6,
            "& fieldset": {
              borderColor: "black", // 기본 테두리 색상
            },
            "&.Mui-focused fieldset": {
              borderColor: "white", // 포커스 시 테두리 색상
            },
          },
        }}
      />
    </Box>
  );
};

export default SearchInput;
