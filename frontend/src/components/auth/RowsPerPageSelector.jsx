import React from 'react';
import { Box } from '@mui/material';
import CustomButton2 from '../../components/club/CustomButton2.jsx';

const RowsPerPageSelector = ({ rowsPerPage, setRowsPerPage }) => {
  const options = [3, 5, 10, 25]; // 선택할 수 있는 항목 수

  // 선택된 버튼의 색상과 선택되지 않은 버튼의 색상 정의
  const getButtonStyle = (option) => ({
    backgroundColor: rowsPerPage === option ?  '#40190B':'#A67153', // 선택된 색상과 비선택 색상
    color: 'white' , // 선택된 버튼의 글자색과 비선택 버튼의 글자색
  });

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {options.map(option => (
        <CustomButton2
          key={option}
          style={getButtonStyle(option)} // 인라인 스타일 적용
          onClick={() => setRowsPerPage(option)}
        >
          {option}개
        </CustomButton2>
      ))}
    </Box>
  );
};

export default RowsPerPageSelector;
