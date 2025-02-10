//코드 리토링전
import React, { useState, useEffect } from 'react';
import { TextField, MenuItem, FormControl, InputLabel, Select, Checkbox, FormControlLabel, Button, FormGroup, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // X 아이콘을 위한 import

const VoteCreationForm = ({ options, setOptions, allowMultiple, setAllowMultiple, anonymous, setAnonymous, endTime, setEndTime, title, setTitle, category, setCategory }) => {
  const categories = ['자유글', '관심사공유', '모임후기', '가입인사', '공지사항(전체알림)', '투표']; // 카테고리 옵션

  // 초기 옵션을 2개로 설정
  useEffect(() => {
    if (options.length < 2) {
      setOptions(['', '']);
    }
  }, [options, setOptions]);

  // 항목 추가 버튼 클릭 시 옵션 배열에 빈 문자열 추가
  const addOption = () => {
    setOptions([...options, '']);
  };

  // 특정 인덱스의 옵션 값 변경
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // 특정 인덱스의 옵션 항목 삭제
  const removeOption = (index) => {
    // 항목이 3개 이상일 때만 삭제 가능
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  // 오늘 날짜와 시간을 'yyyy-MM-ddTHH:mm' 형식으로 변환
  const getTodayDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // 오늘 날짜와 시간으로부터 하루 뒤를 'yyyy-MM-ddTHH:mm' 형식으로 변환
  const getTomorrowDateTime = () => {
    const now = new Date();
    now.setDate(now.getDate() + 1); // 하루 추가
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // 기본값을 설정하는 useEffect
  useEffect(() => {
    if (!endTime) {
      setEndTime(getTomorrowDateTime());
    }
  }, [endTime, setEndTime]);

  return (
    <Box sx={{ padding: 2 }}>
      <TextField
        label="투표 제목"
        variant="outlined"
        fullWidth
        margin="normal"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          label="Category"
        >
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {/* 옵션 항목을 위한 TextField 컴포넌트와 삭제 버튼 */}
      {options.map((option, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
          <TextField
            label={`투표 항목 ${index + 1}`}
            variant="outlined"
            fullWidth
            margin="normal"
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
          />
          {options.length > 2 && (
            <IconButton onClick={() => removeOption(index)} sx={{ marginLeft: 1 }}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      ))}
      
      <Button 
      variant="contained" 
      onClick={addOption}
      sx={{
        backgroundColor: '#DBC7B5', 
        color: '#000', 
        '&:hover': {
          backgroundColor: '#A67153'
        }
      }} 
      >
        항목 추가
      </Button>
      <FormGroup>
        {/* <FormControlLabel
          control={
            <Checkbox
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
            />
          }
          label="복수 선택 허용"
        /> */}
        <FormControlLabel
          control={
            <Checkbox
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
            />
          }
          label="익명 투표"
        />
      </FormGroup>
      
      <TextField
        label="투표 종료 시간"
        type="datetime-local"
        InputLabelProps={{ shrink: true }}
        fullWidth
        margin="normal"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        inputProps={{ min: getTodayDateTime() }} // 오늘 날짜와 시간 이후로만 선택 가능
      />
    </Box>
  );
};

export default VoteCreationForm;
