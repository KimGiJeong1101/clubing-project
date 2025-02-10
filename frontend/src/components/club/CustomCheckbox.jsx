import React from "react";
import { Checkbox, FormControlLabel, styled } from "@mui/material";

// 스타일 정의
// MUI의 Checkbox 컴포넌트를 기반으로 하는 CustomCheckbox를 생성
const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  color: '#6E3C21', // 체크박스의 기본 색상 설정
  '&.Mui-checked': { // 체크된 상태의 스타일
    color: '#6E3C21', // 체크된 상태의 색상 변경
  },
}));

// CustomCheckboxComponent 정의
const CustomCheckbox = ({ label, checked, onChange, ...props }) => {
  return (
    <FormControlLabel
      control={
        <StyledCheckbox 
          checked={checked}
          onChange={onChange}
        {...props} /> // CustomCheckbox에 props 전달
      }
      label={label} // FormControlLabel의 label에 props.label 전달
    />
  );
};

export default CustomCheckbox;
