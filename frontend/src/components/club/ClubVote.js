import React, { useState, useEffect } from 'react';
import { TextField, MenuItem, FormControl, InputLabel, Select, Checkbox, FormControlLabel, Button, FormGroup, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const VoteCreationForm = ({ options, setOptions, allowMultiple, setAllowMultiple, anonymous, setAnonymous, endTime, setEndTime, title, setTitle, category, setCategory }) => {
  const categories = ['자유글', '관심사공유', '모임후기', '가입인사', '공지사항(전체알림)', '투표'];

  // 옵션의 최소 개수를 2로 설정
  useEffect(() => {
    if (options.length < 2) {
      setOptions(['', '']);
    }
  }, [options, setOptions]);

  // 옵션 항목 추가
  const addOption = () => {
    setOptions([...options, '']);
  };

  // 옵션 값 변경
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // 옵션 항목 삭제
  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  // 현재 날짜와 시간을 'yyyy-MM-ddTHH:mm' 형식으로 반환
  const getTodayDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // 로컬 시간으로 변환
    return now.toISOString().slice(0, 16); // ISO 문자열에서 'yyyy-MM-ddTHH:mm' 형식 추출
  };

  // 하루 뒤의 날짜와 시간을 'yyyy-MM-ddTHH:mm' 형식으로 반환
  const getTomorrowDateTime = () => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // 로컬 시간으로 변환
    return now.toISOString().slice(0, 16); // ISO 문자열에서 'yyyy-MM-ddTHH:mm' 형식 추출
  };

  // 기본값 설정
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

      {options.map((option, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TextField
            label={`투표 항목 ${index + 1}`}
            variant="outlined"
            fullWidth
            margin="normal"
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
          />
          {options.length > 2 && (
            <IconButton onClick={() => removeOption(index)} sx={{ ml: 1 }}>
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
        inputProps={{ min: getTodayDateTime() }}
      />
    </Box>
  );
};

export default VoteCreationForm;
