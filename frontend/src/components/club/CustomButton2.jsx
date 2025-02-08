import React from "react";
import { Button, styled } from "@mui/material";

// 스타일 정의
// MUI의 Button 컴포넌트를 기반으로 하는 StyledButton을 생성
const StyledButton = styled(Button)(({}) => ({
  backgroundColor: "#6E3C21", // 버튼의 기본 배경 색상 설정
  color: "white", // 버튼의 글자 색상 설정
  "&:hover": {
    // 버튼에 마우스를 올렸을 때의 스타일
    backgroundColor: "#40190B", // 마우스를 올렸을 때 배경 색상 변경
  },
}));

// CustomButton 컴포넌트 정의
const CustomButton2 = ({ children, ...props }) => {
  return (
    // StyledButton 컴포넌트에 전달된 props를 모두 넘겨주고, children을 버튼 안에 렌더링
    <StyledButton {...props}>{children}</StyledButton>
  );
};

// CustomButton 컴포넌트를 기본으로 내보내기
export default CustomButton2;