import React, { useState, useEffect } from 'react';
import {ListItemText, ListItem, List, TextField, Box} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';

const InterestSearch = ({ setInterestSido, setInterestSigoon, setInterestDong }) => {
  const [interestResults, setInterestResults] = useState([]);
  const { formState: { errors }, register, setValue, watch } = useForm();

 // Redux에서 user 데이터를 가져옵니다
 const { user } = useSelector((state) => state.user?.userData || {});

 // workplace 데이터를 가져옵니다
 const  interestLocation = user?. interestLocation || { city: '', district: '', neighborhood: '' };

  // 초기 렌더링 시, workplace 데이터를 검색 필드에 반영합니다
//   useEffect(() => {
//    if ( interestLocation.neighborhood) {
//      setValue('interestSearchTerm',  interestLocation.neighborhood);
//    }
//  }, [ interestLocation.neighborhood, setValue]);

  const apiKey= process.env.REACT_APP_KEY_API
  const port = process.env.REACT_APP_ADDRESS_API;
  const interestSearchTerm = watch('interestSearchTerm');

  useEffect(() => {
    if (interestSearchTerm) {
      fetch(`/api/req/data?service=data&request=GetFeature&data=LT_C_ADEMD_INFO&key=${apiKey}&domain=${port}&attrFilter=emd_kor_nm:like:${interestSearchTerm}`)
        .then(response => response.json())
        .then(data => {
          if (data.response && data.response.status === 'OK' && data.response.result && data.response.result.featureCollection.features) {
            setInterestResults(data.response.result.featureCollection.features.map(item => item.properties));
          } else {
            setInterestResults([]);
            //console.error('Invalid API response:', data);
          }
        })
        .catch(error => {
          setInterestResults([]);
          //console.error('Error fetching data:', error);
        });
    } else {
      setInterestResults([]);
    }
  }, [interestSearchTerm]);

  const handleInterestSelect = (item) => {
    const [i_sido, i_sigoon, i_dong] = item.full_nm.split(' ');
    setInterestSido(i_sido);
    setInterestSigoon(i_sigoon);
    setInterestDong(i_dong);
    setInterestResults([]);
    setValue('interestSearchTerm', item.full_nm);
  };

  const handleInterestKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (interestResults.length > 0) {
        handleInterestSelect(interestResults[0]);
      }
    }
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;
    const parts = inputValue.split(' ').filter(Boolean); // 공백만 있는 경우 제거

    if (parts.length > 3) {
      parts.length = 3; // 첫 3개로 제한
    }

    const i_sido = parts[0] || ''; // 첫 번째 값은 시도 (없으면 빈 문자열)
    const i_sigoon = parts[1] || ''; // 두 번째 값은 시군 (없으면 빈 문자열)
    const i_dong = parts[2] || ''; // 세 번째 값은 읍면동 (없으면 빈 문자열)

    console.log('관심','시도:', i_sido, '시군:', i_sigoon, '읍면동:', i_dong); // 각 값 출력

    // 선택된 값 반영
    setInterestSido(i_sido);
    setInterestSigoon(i_sigoon);
    setInterestDong(i_dong);

    setValue('interestSearchTerm', inputValue, { shouldValidate: true }); // 입력된 값을 검색 필드에 반영
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
        id="interestSearchTerm"
        type="text"
        fullWidth
        variant="outlined"
        margin="normal"
        {...register('interestSearchTerm', {
          pattern: {
            value: /^[가-힣\s]*$/,
            message: "한글만 입력 가능합니다."
          }
        })}
        onKeyDown={handleInterestKeyDown} 
        onChange={handleChange}
        placeholder='*읍면동 중 하나 입력해주세요 예) 강화읍'
        sx={{
          bgcolor: 'white',
        }}
        error={!!errors.interestSearchTerm} // 수정: errors.searchTerm을 직접 사용하여 에러 상태를 표시합니다.
        helperText={errors.interestSearchTerm ? errors.interestSearchTerm.message : ''} // 수정: errors.searchTerm 메시지를 helperText로 표시합니다.
      />
     <List sx={{ mt: -1, pt: 0, pb: 0 }}>
        {interestResults.map((item, index) => (
        <StyledListItem 
          key={index} 
          onClick={() => handleInterestSelect(item)}>
            <ListItemText primary={item.full_nm} />
          </StyledListItem>
        ))}
      </List>
    </Box>
  );
};
export default InterestSearch;
