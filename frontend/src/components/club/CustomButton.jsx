import React from "react";
import { Button, styled } from "@mui/material";

// 스타일 정의
const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#DBC7B5',
  color: 'white',
  '&:hover': {
    backgroundColor: '#A67153',
  },
}));

// CustomButton 컴포넌트
const CustomButton = ({ children, ...props }) => {
  return <StyledButton {...props}>{children}</StyledButton>;
};

export default CustomButton;
