import React, { useState, useEffect } from 'react';
import {ListItemText, ListItem, List, TextField, Box} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';

const WorkplaceSearch = ({ setWorkplaceSido, setWorkplaceSigoon, setWorkplaceDong }) => {
  const [workplaceResults, setWorkplaceResults] = useState([]);
  const { formState: { errors }, register, setValue, watch } = useForm();

   // Redux에서 user 데이터를 가져옵니다
   const { user } = useSelector((state) => state.user?.userData || {});
  
   // workplace 데이터를 가져옵니다
   const workplace = user?.workplace || { city: '', district: '', neighborhood: '' };

     // 초기 렌더링 시, workplace 데이터를 검색 필드에 반영합니다
  // useEffect(() => {
  //   if (workplace.neighborhood) {
  //     setValue('workplaceSearchTerm', workplace.neighborhood);
  //   }
  // }, [workplace.neighborhood, setValue]);

  const apiKey= process.env.REACT_APP_KEY_API
  const port = process.env.REACT_APP_ADDRESS_API;
  const workplaceSearchTerm = watch('workplaceSearchTerm'); 

  useEffect(() => {
    if (workplaceSearchTerm) {
      fetch(`/api/req/data?service=data&request=GetFeature&data=LT_C_ADEMD_INFO&key=${apiKey}&domain=${port}&attrFilter=emd_kor_nm:like:${workplaceSearchTerm}`)
        .then(response => response.json())
        .then(data => {
          if (data.response && data.response.status === 'OK' && data.response.result && data.response.result.featureCollection.features) {
            setWorkplaceResults(data.response.result.featureCollection.features.map(item => item.properties));
          } else {
            setWorkplaceResults([]);
            //console.error('Invalid API response:', data);
          }
        })
        .catch(error => {
          setWorkplaceResults([]);
          //console.error('Error fetching data:', error);
        });
    } else {
      setWorkplaceResults([]);
    }
  }, [workplaceSearchTerm]);

  const handleWorkplaceSelect = (item) => {
    const [w_sido, w_sigoon, w_dong] = item.full_nm.split(' ');
    setWorkplaceSido(w_sido);
    setWorkplaceSigoon(w_sigoon);
    setWorkplaceDong(w_dong);
    setWorkplaceResults([]);
    setValue('workplaceSearchTerm', item.full_nm);
  };

  const handleWorkplaceKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (workplaceResults.length > 0) {
        handleWorkplaceSelect(workplaceResults[0]);
      }
    }
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;
    const parts = inputValue.split(' ').filter(Boolean); // 공백만 있는 경우 제거

    if (parts.length > 3) {
      parts.length = 3; // 첫 3개로 제한
    }

    const w_sido = parts[0] || ''; // 첫 번째 값은 시도 (없으면 빈 문자열)
    const w_sigoon = parts[1] || ''; // 두 번째 값은 시군 (없으면 빈 문자열)
    const w_dong = parts[2] || ''; // 세 번째 값은 읍면동 (없으면 빈 문자열)

    console.log('직장','시도:', w_sido, '시군:', w_sigoon, '읍면동:', w_dong); // 각 값 출력

    // 선택된 값 반영
    setWorkplaceSido(w_sido);
    setWorkplaceSigoon(w_sigoon);
    setWorkplaceDong(w_dong);

    setValue('workplaceSearchTerm', inputValue, { shouldValidate: true }); // 입력된 값을 검색 필드에 반영
};

  const StyledListItem = styled(ListItem)(({ theme }) => ({
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    cursor: 'pointer',
  }));

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        id="workplaceSearchTerm"
        type="text"
        fullWidth
        variant="outlined"
        margin="normal"
        {...register('workplaceSearchTerm', {
          pattern: {
            value: /^[가-힣\s]*$/,
            message: "한글만 입력 가능합니다."
          }
        })}
        onKeyDown={handleWorkplaceKeyDown} 
        onChange={handleChange}
        placeholder='*읍면동 중 하나 입력해주세요 예) 옥천면'
        sx={{
          bgcolor: 'white',
        }}
        error={!!errors.workplaceSearchTerm} // 수정: errors.searchTerm을 직접 사용하여 에러 상태를 표시합니다.
        helperText={errors.workplaceSearchTerm ? errors.workplaceSearchTerm.message : ''} // 수정: errors.searchTerm 메시지를 helperText로 표시합니다.
        />
      <List sx={{ mt: -1, pt: 0, pb: 0 }}>
        {workplaceResults.map((item, index) => (
         <StyledListItem
            key={index} 
            onClick={() => handleWorkplaceSelect(item)}>
            <ListItemText primary={item.full_nm} />
          </StyledListItem>
        ))}
      </List>
    </Box>
  );
};
export default WorkplaceSearch;
