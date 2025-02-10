import React, { useState, useEffect, useRef} from 'react';
import { useForm, Controller,  } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom'; // 추가: useNavigate 훅을 가져옵니다.
import { useDispatch } from 'react-redux';
import { registerUser } from '../../../store/actions/userActions'
import HomeSearch from './address/HomeSearch';
import WorkplaceSearch from './address/WorkplaceSearch';
import InterestSearch from './address/InterestSearch';
import CategoryPopup from './category/CategoryPopup';
import categories from './category/CategoriesData';
import JobPopup from './job/JobPopup';
import JobCategories from './job/JobCategories';
import axios from 'axios';
import TermsPopup from './consent/Terms' ;
import PrivacyPopup from './consent/Privacy';
import MarketingPopup from './consent/Marketing';
import { TextField, Button, Typography, Box, Stack, IconButton, InputAdornment, FormControlLabel,
          FormControl, InputLabel, Select, MenuItem, FormHelperText, DialogActions,
          Chip, Checkbox, Paper, Link,
        } from '@mui/material';
import {Visibility, VisibilityOff} from '@mui/icons-material';
import color from '../../../color'; // 색상를 정의한 파일
import '../../../assets/styles/LoginCss.css'
import CustomCheckbox from '../../../components/club/CustomCheckbox'
import CustomButton from '../../../components/club/CustomButton'
import CustomButton2 from '../../../components/club/CustomButton2'
import CustomSnackbar from '../../../components/auth/Snackbar';

const SnsRegister = () => { 
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue, control  } = 
  useForm({  
            defaultValues: {
              email: '',
              age: { year: '1990', month: '9', day: '10' },
              gender: '남성',
              homeLocation: { sido: '서울특별시', sigoon: '동작구', dong: '상도동' },
              workplace: { w_sido: '', w_sigoon: '', w_dong: '' },
              interestLocation: { i_sido: '', i_sigoon: '', i_dong: '' },
              category: [],
              selectedJobs: [],
              phone: [],
              
              // 필드가 처음 정의될 때 설정값
            },
    mode: 'onChange' });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [userEmail, setUserEmail] = useState(''); // 변수 이름 변경

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailParam = queryParams.get('email'); // URL에서 이메일 값을 가져옴

    if (emailParam) {
        setUserEmail(emailParam); // 이메일을 상태에 설정
        console.log('가져온 이메일:', emailParam); // 이메일 값 확인
    }
}, []); // 빈 배열로 설정하여 한 번만 실행되도록 함

// userEmail 상태가 업데이트될 때마다 로그 출력
useEffect(() => {
    console.log('이메일 값:', userEmail); // URL에서 가져온 이메일 값
}, [userEmail]);

  // 회원가입 폼 제출 시 실행되는 함수
  const onSubmit = (data) => {
    console.log('폼 제출 데이터:', data);
    console.log('최종 이메일 값:', data.email);
    const { email, name, age = {}, 
            gender, homeLocation = {}, workplace = {}, interestLocation = {}, 
            category = [], selectedJobs = [], phone = '', nickName } = data;
            
    //console.log('Checked asdasd:', checked); 

    // 체크박스 상태를 직접 가져옵니다
  const { terms, privacy, marketing } = checkboxState;
  const { year = '', month = '', day = '' } = age;
  const { sido = '', sigoon = '', dong = '' } = homeLocation;
  const { w_sido = '', w_sigoon = '', w_dong = '' } = workplace;
  const { i_sido = '', i_sigoon = '', i_dong = '' } = interestLocation;
  // 온서밋에 안 넣어도 되네 얘 때문에 몇시간을 버린거야 ㅠㅠ

    if (!isNickNameChecked) {
      // 닉네임 중복 검사를 하지 않았을 때
      setSnackbarMessage('닉네임 중복 검사를 해야 합니다.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!sido || !sigoon || !dong) {
      // 필수 입력이 비어 있을 때
      setSnackbarMessage('집 주소를 설정해 주세요.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (selectedJobs.length === 0) {
      // 카테고리 배열이 비어 있을 때
      setSnackbarMessage('직종을 설정해 주세요');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

     // main 카테고리 개수 확인
     const mainCategories = category.filter(cat => cat.main);
     if (mainCategories.length < 3) {
       setSnackbarMessage('최소 3개의 메인 카테고리를 설정해 주세요.');
       setSnackbarSeverity('error');
       setSnackbarOpen(true);
       return;
     }

    if (!terms) {
      // 이용약관 동의가 없을 때
      setSnackbarMessage('Clubing 이용약관에 동의해야 합니다.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!privacy) {
      // 개인정보 수집 및 이용에 동의하지 않았을 때
      setSnackbarMessage('개인정보 수집 및 이용에 동의해야 합니다.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

     const categoryObject = category.reduce((acc, cat) => {
      if (cat.main && Array.isArray(cat.sub)) {
        acc.push({
          main: cat.main,
          sub: cat.sub
        });
      }
      return acc;
    }, []);
    //이 코드는 category 배열을 객체 형태로 변환합니다. 배열의 각 요소가 main과 sub을 포함한 객체로 변환됩니다.
    // 언디파인드 대비해서 초기값 넣기
    const body = {
      email,
      name,
      nickName,
      age: {
        year,
        month,
        day
      },
      gender,
      homeLocation: {
        city: sido,
        district: sigoon,
        neighborhood: dong,
      },
      workplace: {
        city: w_sido,
        district: w_sigoon,
        neighborhood: w_dong,
      },
      interestLocation: {
        city: i_sido,
        district: i_sigoon,
        neighborhood: i_dong,
      },
      category: categoryObject, // 카테고리 추가
      job:selectedJobs,// 직종 추가
      phone,
      termsAccepted: terms,
      privacyAccepted: privacy,
      marketingAccepted: marketing,
      profilePic: {
        originalImage: 'https://via.placeholder.com/600x400?text=no+user+image',
        thumbnailImage: 'https://via.placeholder.com/600x400?text=no+user+image',
        introduction: ''
      },
      registrationMethod: 1 // 회원가입 경로 추가, 카카오
    }
   
    console.log('들어간 값 확인', body);

    dispatch(registerUser(body))
      .then(() => {
       setSnackbarMessage('회원가입에 성공하셨습니다.');
        setSnackbarSeverity('success'); // 성공 상태로 변경
        setSnackbarOpen(true);

        // 스낵바가 표시된 후 페이지를 이동하도록 타이머를 설정합니다.
        setTimeout(() => {
          navigate('/'); // 성공 페이지로 리다이렉트
        }, 1000); // 스낵바 표시 시간과 일치하도록 설정
      })
      .catch((error) => {
        console.error('회원가입 실패:', error);
        setSnackbarMessage('회원가입에 실패하였습니다.');
        setSnackbarSeverity('error'); // 에러 상태로 변경
        setSnackbarOpen(true);
      });

    // registerUser(body) thunk함수
    //dispatch 함수를 받아와서 액션을 전달할 수 있게 해줍니다. 
    //Redux를 사용하면 이 상태를 **하나의 전역 저장소(store)**에서 관리할 수 있게 됩니다.

    reset(); // 폼 초기화
  };
  

  //api
  const apiUrl = process.env.REACT_APP_API_URL;

  // 스낵바 상태를 추가합니다.
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  // 상태 정의
   const [homeLocation, setHomeLocation] = useState({ sido: '', sigoon: '', dong: '' });
   const [workplace, setWorkplace] = useState({ w_sido: '', w_sigoon: '', w_dong: '' });
   const [interestLocation, setInterestLocation] = useState({ i_sido: '', i_sigoon: '', i_dong: '' });

   // 성별 값 설정 함수 // 무이로 바꿔서 잠시 보류
  const setGender = (value) => {
    setValue('gender', value);
  };
// register가 사용되지 않았지만 성별 값이 폼에 포함되는 이유는 setValue 함수와 watch 함수 덕분입니다.

  // 이름 유효성 검사 규칙
  const userName = (name) => {
    // 최대 길이 검증
    if (name.length > 20) {
      return "최대 20자입니다.";
    }
    // 숫자 검증
    if (/[0-9]/.test(name)) {
      return "숫자는 들어갈 수 없습니다.";
    }
    // 특수문자 검증
    if (/[^a-zA-Z가-힣ㄱ-ㅎㅏ-ㅣ\s]/.test(name)) {
      return "특수문자는 들어갈 수 없습니다.";
    }
    // 자음/모음 검증
    if (/[ㄱ-ㅎㅏ-ㅣ]/.test(name)) {
      return "자음과 모음은 들어갈 수 없습니다.";
    }
    return true; // 모든 검증을 통과한 경우
  };

  // 닉네임
  const nickName = {
    required: "필수 필드입니다.",
    maxLength: {
      value: 20,
      message: "닉네임은 최대 20자까지 입력할 수 있습니다."
    }
  };

  // 연도, 월, 일을 위한 옵션 생성
  const generateOptions = (start, end) => {
    const options = [];
    for (let i = start; i <= end; i++) {
      options.push(i);
    }
    return options;
  };


// 생년월일 범주
  const years = generateOptions(1950, 2040);
  const months = generateOptions(1, 12);
  const days = generateOptions(1, 31);

// 값설정
  useEffect(() => {
    setValue('homeLocation.sido', homeLocation.sido);
    setValue('homeLocation.sigoon', homeLocation.sigoon);
    setValue('homeLocation.dong', homeLocation.dong);
  }, [homeLocation, setValue]);

  useEffect(() => {
    setValue('workplace.w_sido', workplace.w_sido);
    setValue('workplace.w_sigoon', workplace.w_sigoon);
    setValue('workplace.w_dong', workplace.w_dong);
  }, [workplace, setValue]);

  useEffect(() => {
    setValue('interestLocation.i_sido', interestLocation.i_sido);
    setValue('interestLocation.i_sigoon', interestLocation.i_sigoon);
    setValue('interestLocation.i_dong', interestLocation.i_dong);
  }, [interestLocation, setValue]);


//카테고리
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]); // 선택된 카테고리 상태 관리
  const [groupedCategories, setGroupedCategories] = useState({});
// 직종
const [isJobPopupOpen, setIsJobPopupOpen] = useState(false); // 직종 팝업
const [selectedJobs, setSelectedJobs] = useState([]); 
//console.log("직업 데이터", selectedJobs)

// 카테고리를 그룹화하는 함수
function groupCategories(categories) {
  return categories.reduce((acc, cat) => {
    if (!acc[cat.main]) {
      acc[cat.main] = [];
    }
    acc[cat.main].push(cat.sub);
    return acc;
  }, {});
}

 // 카테고리 상태가 변경될 때 폼 데이터와 동기화
 useEffect(() => {
  const grouped = groupCategories(selectedCategories);

  // grouped 데이터를 categoryData 형식으로 변환
  const categoryData = Object.keys(grouped).map(main => ({
    main: main,
    sub: grouped[main]
  }));

  setGroupedCategories(grouped); // 상태 업데이트
  setValue('category', categoryData); // 폼 데이터와 상태 동기화
}, [selectedCategories, setValue]);

// 직종
useEffect(() => {
  setValue('selectedJobs', selectedJobs);
  //console.log("선택된 직종:", selectedJobs);
}, [selectedJobs, setValue]);

  // 카테고리 선택 핸들러
 // 통합된 핸들러
 const handleSelection = (newSelections) => {
  if (isCategoryPopupOpen) {
    setSelectedCategories(newSelections); // 카테고리 선택 시 업데이트
  } else if (isJobPopupOpen) {
    setSelectedJobs(newSelections); // 직종 선택 시 업데이트
  }
};

//팝업 오픈
  const handlePopupOpen = (type) => {
    console.log("Popup type:", type);//
    if (type === 'category') {
      setIsCategoryPopupOpen(true);
    } else if (type === 'job') {
      setIsJobPopupOpen(true);
    }
  };
//팝업 크로즈
  const handlePopupClose = (type) => {
    if (type === 'category') {
      setIsCategoryPopupOpen(false);
    } else if (type === 'job') {
      setIsJobPopupOpen(false);
    }
  };

    const nickNameValue = watch('nickName');
    const [isNickNameChecked, setIsNickNameChecked] = useState(false);
    const [isNickNameReset, setIsNickNameReset] = useState(false); // 수정 버튼 상태

    const handleCheckNickName = async () => {
      if (!nickNameValue || nickNameValue.trim() === '') {
        setSnackbarMessage('닉네임을 입력해주세요.');
        setSnackbarOpen(true); // 닫지 말고 열어야 함
        return;
      }
    
      if (errors.nickName) {
        setSnackbarMessage('유효한 닉네임을 입력하세요.');
        setSnackbarOpen(true); // 닫지 말고 열어야 함
        return;
      }
    
      const nickName = nickNameValue;
      try {
        const response = await axios.post(`${apiUrl}/users/check-nickname`, { nickName });
        setSnackbarMessage(response.data.message);
        setSnackbarSeverity('success'); // 성공 메시지
        setSnackbarOpen(true);

        // 닉네임이 유효한 경우 상태 업데이트
        setIsNickNameChecked(true);  // 닉네임 확인 후 버튼 상태 변경
        setIsNickNameReset(true); // 수정 버튼 상태로 변경
      } catch (err) {
        setSnackbarMessage(err.response ? err.response.data.message : '서버 오류');
        setSnackbarSeverity('error'); // 오류 메시지
        setSnackbarOpen(true);

         // 중복 검사가 실패한 경우 상태 유지
        setIsNickNameChecked(false);  // 오류 발생 시 버튼 상태 유지
        setIsNickNameReset(false);
      }
    };

    const handleNickNameReset = () => {
      setIsNickNameChecked(false);
      setIsNickNameReset(false); // 상태 초기화
    };

// 전화번호 하이픈  자동생성
const formatPhoneNumber = (value) => {
  // 숫자만 추출
  const numbers = value.replace(/\D/g, '');

  // 하이픈 추가
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};

/// 약관 동의 상태
const [isPopupOpen, setIsPopupOpen] = useState({
  all: false,
  terms: false,
  privacy: false,
  marketing: false,
});

// 체크박스 상태
const [checkboxState, setCheckboxState] = useState({
  terms: false,
  privacy: false,
  marketing: false,
  all: false
});

// 체크박스 상태를 업데이트하는 함수
const handleCheck = (type) => {
  setCheckboxState(prevState => {
    // 개별 체크박스의 상태를 반전시킵니다
    const newState = !prevState[type];
    // 모든 체크박스가 체크된 상태인지 확인합니다
    const allChecked = ['terms', 'privacy', 'marketing'].every(key => prevState[key]);
    return {
      ...prevState,
      [type]: newState,
      all: allChecked
    };
  });
};

// 전체 동의 상태를 업데이트
const handleAllCheck = () => {
  const newCheckedState = !checkboxState.all;
  setCheckboxState({
    terms: newCheckedState,
    privacy: newCheckedState,
    marketing: newCheckedState,
    all: newCheckedState
  });
};

useEffect(() => {
  console.log('업데이트된 체크박스 상태:', checkboxState);
}, [checkboxState]);

// 팝업 열기
const consentPopupOpen = (type) => {
  setIsPopupOpen(prev => ({ ...prev, [type]: true }));
};

// 팝업 닫기
const consentPopupClose = (type) => {
  setIsPopupOpen(prev => ({ ...prev, [type]: false }));
};

 // 이메일 유효성 검사 규칙
 const userEmails = {
  required: "필수 필드입니다.",
};

  return (
    <Box 
      sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          mt: 5, 
          maxWidth: 600, 
          mx: 'auto' }}>
    <Box 
          sx={{ 
            p: 3,
            mb: 2 ,
            mt: 2,
            }}>          
     <Typography
        variant="h3"
        component="h1"
        sx={{
          mt: 2,
          mb: 2,
          textAlign: "center",
        }}
      >
        <img
          src="/logo/khaki_long_h.png"
          style={{
            display: "block",
            margin: "auto auto 40px auto",
            width: "300px", // 원하는 크기로 설정
            height: "auto",
          }}
        />
      </Typography>
    </Box>  
    <Box 
      sx={{ 
        p: 3, 
        bgcolor: 'white', 
        borderRadius: 2, 
        boxShadow: 3 ,
        backgroundColor: color.whiteSmoke, 
        }}>
      <Typography variant="h4" component="h1" align="center">
        회원가입
      </Typography>
        <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ mb: 2 }}>
        <Typography variant="body2" component="label" htmlFor="email" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
        이메일
        </Typography>
       <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <TextField
            label=""
            type="email"
            id="email"
            variant="outlined"
            fullWidth
             // 리드 전용으로 설정
             InputProps={{
              readOnly: true, // 여기서 readOnly 속성 설정
          }}
            {...register('email', userEmails )}
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)} // 상태 업데이트
            sx={{ flex: 1, mr: 1 }}
            /> 
        </Box>
    </Box>
{/*이름 */}          
      <Box mb={2}>
        <Typography 
          variant="body2" 
          component="label" 
          htmlFor="name"
          sx={{ fontWeight: 'bold', color: 'text.secondary' }}
        >
          이름
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <TextField
            id="name"
            label="이름"
            type="text"
            fullWidth
            variant="outlined"
            {...register('name', {
              required: "필수 필드입니다.",
              validate: userName
            })}
            sx={{
              bgcolor: 'white',
            }}
            error={!!errors.name}
            helperText={errors.name ? errors.name.message : ''}
          />
        </Box>
      </Box>
{/*닉네임 */}          
    <Box mb={2}>
      <Typography 
      variant="body2" 
      component="label" 
      htmlFor="nickName"
      sx={{ fontWeight: 'bold', color: 'text.secondary' }}
      >
      닉네임
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, }}>
      <TextField
        id='nickName'
        label="닉네임"
        type='text'
        fullWidth
        variant="outlined"
        {...register('nickName', nickName)}
        InputProps={{
          readOnly: isNickNameChecked,
          sx: {
            bgcolor: isNickNameChecked ? 'grey.200' : 'white',
            '& .MuiInputBase-input': {
              color: isNickNameChecked ? 'text.disabled' : 'text.primary',
            },
          },
        }}
        sx={{
          flex: 1,
          mr: 1,
        }}
        />
       <Stack direction="row" spacing={2}>
        {!isNickNameReset ? (
          !isNickNameChecked && (
            <CustomButton2 
              variant="contained" 
              color="primary" 
              className="buttonMain"
              sx={{ height: '50px' }}
              onClick={handleCheckNickName}
            >
              중복검사
            </CustomButton2>
          )
        ) : (
          <>
            <CustomButton2  
              variant="outlined"  
              className="buttonSub1"
              sx={{ height: '50px' }}
              onClick={handleNickNameReset}
            >
              닉네임 수정
            </CustomButton2>
            </>
        )}
      </Stack>
      </Box>
        {errors?.nickName && (
      <Typography color="error" sx={{ mt: 1 }}>
        {errors.nickName.message}
      </Typography>
      )}
    </Box>         
{/*생년월일 */}
<Box mb={2}>
  <Typography 
    variant="body2" 
    component="label" 
    htmlFor="age"
    sx={{ fontWeight: 'bold', color: 'text.secondary' }}
  >
    생년월일
  </Typography>
<Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
    {/* 생년 */}
    <FormControl fullWidth variant="outlined" error={!!errors.age?.year}>
    <InputLabel id="year-label">출생년도</InputLabel>
    <Controller
      name="age.year"
      control={control}
      defaultValue=""
      rules={{ required: '출생년도는 필수입니다.' }}
      render={({ field }) => (
        <Select
          {...field}
          labelId="year-label"
          label="연도"
          sx={{
            bgcolor: 'white',
          }}
        >
          <MenuItem value="">선택</MenuItem>
          {years.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      )}
    />
    <FormHelperText>{errors.age?.year?.message}</FormHelperText>
  </FormControl>
{/* 월 */}
  <FormControl fullWidth variant="outlined" error={!!errors.age?.month}>
    <InputLabel id="month-label">월</InputLabel>
    <Controller
      name="age.month"
      control={control}
      defaultValue=""
      rules={{ required: '월은 필수입니다.' }}
      render={({ field }) => (
        <Select
          {...field}
          labelId="month-label"
          label="월"
          sx={{
            bgcolor: 'white',
          }}
        >
          <MenuItem value="">선택</MenuItem>
          {months.map((month) => (
            <MenuItem key={month} value={month}>
              {month}
            </MenuItem>
          ))}
        </Select>
      )}
    />
    <FormHelperText>{errors.age?.month?.message}</FormHelperText>
  </FormControl>

  {/* 일 */}
  <FormControl fullWidth variant="outlined" error={!!errors.age?.day}>
    <InputLabel id="day-label">일</InputLabel>
    <Controller
      name="age.day"
      control={control}
      defaultValue=""
      rules={{ required: '일은 필수입니다.' }}
      render={({ field }) => (
        <Select
          {...field}
          labelId="day-label"
          label="일"
          sx={{
            bgcolor: 'white',
          }}
        >
          <MenuItem value="">선택</MenuItem>
          {days.map((day) => (
            <MenuItem key={day} value={day}>
              {day}
            </MenuItem>
          ))}
        </Select>
      )}
    />
    <FormHelperText>{errors.age?.day?.message}</FormHelperText>
  </FormControl>
  </Box>
</Box>
{/* 성별 선택 버튼 */}
<Box mb={2}>
      <Typography variant="body2" component="label" htmlFor="gender" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
        성별
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Controller
          name="gender"
          control={control}
          defaultValue=" "
          rules={{ required: '성별을 선택해 주세요.' }} // 필수 입력 설정
          render={({ field }) => (
            <>
              <Button
                variant="contained"
                onClick={() => field.onChange('남성')}
                className='buttonSub3'
                sx={{
                  flexGrow: 1,
                  // '남성' ? '선택' : '비선택'
                  backgroundColor: watch('gender') === '남성' ? '#004ba0' : '#2196f7', // 선택된 경우와 비선택된 경우 색상 설정
                  color: 'white',
                  border: watch('gender') === '남성' ? '3px solid #4a90e2' : '3px solid transparent', // 선택된 경우 테두리 색상
                  boxShadow: watch('gender') === '남성' ? '0 0 0 3px #4a90e2' : 'none', // 선택된 경우 외부 그림자
                  '&:hover': {
                    backgroundColor: watch('gender') === '남성' ? '#00274d' : '#1976d2', // 호버 시 배경색
                  boxShadow: watch('gender') === '남성' ? '0 0 0 3px #4a90e2' : 'none', // 선택된 경우 외부 그림자
                    
                  }
                }}
              >
                남자
              </Button>
              <Button
                variant="contained"
                onClick={() => field.onChange('여성')}
                className='buttonSub4'
                sx={{
                  flexGrow: 1,
                  backgroundColor: watch('gender') === '여성' ? '#ff4081' : '#ff4081', // 선택된 경우와 비선택된 경우 색상 설정
                  color: 'white',
                  border: watch('gender') === '여성' ? '3px solid #f48fb1' : '3px solid transparent', // 선택된 경우 테두리 색상
                  boxShadow: watch('gender') === '여성' ? '0 0 0 3px #f48fb1' : 'none', // 선택된 경우 외부 그림자
                  '&:hover': {
                    backgroundColor: watch('gender') === '여성' ? '#8e0000' : '#c2185b', // 호버 시 배경색
                    boxShadow: watch('gender') === '여성' ? '0 0 0 3px #f48fb1' : 'none', // 선택된 경우 외부 그림자
                  }
                }}
              >
                여자
              </Button>
            </>
          )}
        />
      </Box>
      {errors.gender && <FormHelperText error>{errors.gender.message}</FormHelperText>}
    </Box>
{/* 전화번호 */}
  <Box mb={2}>
      <Typography variant="body2" component="label" htmlFor="phone" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
        전화번호 (* 번호만 입력해 주세요)
      </Typography>
      <Box mt={1}>
        <Controller
          name="phone"
          control={control}
          defaultValue=""
          rules={{
            required: '전화번호는 필수입니다.',
            pattern: {
              value: /^\d{3}-\d{4}-\d{4}$/, // 예: 010-0000-0000
              message: '전화번호 형식을 확인해 주세요.\n 예) 010-0000-0000',
            }
          }}
          render={({ field }) => (
            <>
              <TextField
                {...field}
                id="phone"
                fullWidth
                variant="outlined"
                placeholder="010-0000-0000"
                error={!!errors.phone}
                helperText={errors.phone ? errors.phone.message : ''}
                onChange={(e) => {
                  const formattedValue = formatPhoneNumber(e.target.value);
                  setValue('phone', formattedValue, { shouldValidate: true }); // 포맷된 값을 폼 상태에 설정
                }}
                value={watch('phone')}
                sx={{
                  bgcolor: 'white',
                }}
              />
            </>
          )}
        />
      </Box>
    </Box>
{/*집주소 */}
<Box mb={2}>
  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
   <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
      집주소
    </Typography>
    <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
      (*읍면동 중 하나를 입력해 주세요)
    </Typography>
  </Box>
      <HomeSearch 
        setSelectedSido={(sido) => setHomeLocation(prev => ({ ...prev, sido }))} 
        setSelectedSigoon={(sigoon) => setHomeLocation(prev => ({ ...prev, sigoon }))} 
        setSelectedDong={(dong) => setHomeLocation(prev => ({ ...prev, dong }))} 
        />
 
{/*직장 */}
<Box sx={{ display: 'flex', alignItems: 'center', mt: 2  }}>
   <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
      직장주소
    </Typography>
    <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
    (*읍면동 중 하나를 입력해 주세요)
    </Typography>
  </Box>
      <WorkplaceSearch 
        setWorkplaceSido={(sido) => setWorkplace(prev => ({ ...prev, w_sido: sido }))} 
        setWorkplaceSigoon={(sigoon) => setWorkplace(prev => ({ ...prev, w_sigoon: sigoon }))} 
        setWorkplaceDong={(dong) => setWorkplace(prev => ({ ...prev, w_dong: dong }))} />             

{/*관심지역 */}
<Box sx={{ display: 'flex', alignItems: 'center', mt: 2  }}>
   <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
   관심지역
    </Typography>
    <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
    (*읍면동 중 하나를 입력해 주세요)
    </Typography>
  </Box>
      <InterestSearch 
        setInterestSido={(sido) => setInterestLocation(prev => ({ ...prev, i_sido: sido }))} 
        setInterestSigoon={(sigoon) => setInterestLocation(prev => ({ ...prev, i_sigoon: sigoon }))} 
        setInterestDong={(dong) => setInterestLocation(prev => ({ ...prev, i_dong: dong }))} />
</Box> 


{/*테스트 
<Box sx={{ display: 'flex', alignItems: 'center', mt: 2  }}>
    <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
    도: {workplaceSido}
    </Typography>
    <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
    시군구: {workplaceSigoon}
    </Typography>
    <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
    읍면동: {workplaceDong}
    </Typography>
    <LocationSelector
        setWorkplaceSido={setWorkplaceSido}
        setWorkplaceSigoon={setWorkplaceSigoon}
        setWorkplaceDong={setWorkplaceDong}
    />
</Box> */}

{/*직종 */}
<Box>
      {/* 직종 선택 버튼 */}
      <Box mb={2} display="flex" alignItems="center" gap={2}>
        <CustomButton2
          variant="contained"
          color="primary"
          onClick={() => handlePopupOpen('job')}
        >
          직종 선택
        </CustomButton2>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
          (최대 3개 선택 가능)
        </Typography>
      </Box>

      {isJobPopupOpen && (
       <JobPopup
          jobCategories={JobCategories} // 여기를 확인해봐야 합니다
          onSelect={handleSelection}
          onClose={() => handlePopupClose('job')}
          selectedJobs={selectedJobs}// 선택된 카테고리 전달
        />
      )}

      {/* 선택된 직종 리스트 */}
      <Box 
      sx={{ 
        mb: 2, 
        p: 2, 
        bgcolor: 'background.paper', // 배경색 설정
        borderRadius: 2, // 모서리 둥글게
        boxShadow: 1, // 그림자 추가
        border: '1px solid', // 테두리 추가
        borderColor: 'divider' // 테두리 색상 설정
      }}
    >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {selectedJobs.map((job, index) => (
            <Chip
              key={index}
              label={job}
              onDelete={() => setSelectedJobs(prev => prev.filter(j => j !== job))}
              sx={{ bgcolor: 'lightgrey', color: 'black' }} // 배경색과 글자색을 직접 설정
            />
          ))}
        </Box>
      </Box>
</Box>
{/* 카테고리 */}
<Box>
      {/* 카테고리 선택 버튼 */}
      <Box mb={2} display="flex" alignItems="center" gap={2}>
        <CustomButton2
          variant="contained"
          color="primary"
          onClick={() => handlePopupOpen('category')}
        >
          카테고리 선택
        </CustomButton2>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
          3개 이상 선택해 주세요
        </Typography>
      </Box>

      {/* 카테고리 팝업 */}
      {isCategoryPopupOpen && (
        <CategoryPopup 
          categories={categories} 
          onSelect={handleSelection}
          onClose={() => handlePopupClose('category')}
          selectedCategories={selectedCategories}
        />
      )}

      {/* 선택된 카테고리 리스트 표시 */}
      <Box 
        sx={{ 
          mb: 2, 
          p: 2, 
          bgcolor: 'background.paper', // 배경색 설정
          borderRadius: 2, // 모서리 둥글게
          boxShadow: 1, // 그림자 추가
          border: '1px solid', // 테두리 추가
          borderColor: 'divider' // 테두리 색상 설정
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Object.entries(groupedCategories).map(([main, subs]) => (
            <Box key={main} sx={{ width: '100%' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {main}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {subs.map((sub, index) => (
                  <Chip
                    key={index}
                    label={sub}
                    onDelete={() => setSelectedCategories(prev => prev.filter(cat => !(cat.main === main && cat.sub === sub)))}
                    sx={{ bgcolor: 'lightgrey', color: 'black' }} // 배경색과 글자색을 직접 설정
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
{/*약관 동의 */}
{/* 동의 항목 */}
<Box mt={4}>
      <Box mb={2}>
        <FormControlLabel
          control={
            <CustomCheckbox
              checked={checkboxState.all}
              onChange={handleAllCheck}
              color="primary"
            />
          }
          label={
            <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
              전체 동의하기
            </Typography>
          }
        />
        <Paper
          sx={{
            boxSizing: 'border-box',
            maxHeight: 100,
            padding: 2,
            borderRadius: 1,
            border: '1px solid #d6d6d6',
            marginTop: 2,
            overflow: 'auto', // Ensure content is scrollable if it overflows
          }}
        >
          <Typography variant="body2" color="textSecondary">
            실명 인증된 아이디로 가입, 위치기반서비스 이용약관(선택), 이벤트・혜택 정보 수신(선택) 동의를 포함합니다.
          </Typography>
        </Paper>
      </Box>
{/* clubing 이용약관 */}
    <Box >
      <Box display="flex" alignItems="center">
        <FormControlLabel
          control={
            <CustomCheckbox
              id="terms-checkbox"
              checked={checkboxState.terms}
              onChange={() => handleCheck('terms')}
              color="primary"
            />
          }
          label={
            <Typography variant="body1" component="span">
              [필수] clubing 이용약관
            </Typography>
          }
          sx={{ marginRight: 1 }} // 라벨과 체크박스 사이에 공간 추가
        />
        <Button
          variant="text"
          color="primary"
          onClick={() => consentPopupOpen('terms')}
          sx={{ textDecoration: 'underline' }}
        >
          전체
        </Button>
      </Box>
    </Box>
{/* 개인정보 */}
<Box>
      <Box display="flex" alignItems="center">
        <FormControlLabel
          control={
            <CustomCheckbox
              id="privacy-checkbox"
              checked={checkboxState.privacy}
              onChange={() => handleCheck('privacy')}
              color="primary"
            />
          }
          label={
            <Typography variant="body1" component="span">
              [필수] 개인정보 수집 및 이용
            </Typography>
          }
          sx={{ marginRight: 1 }} // 체크박스와 라벨 사이에 간격 추가
        />
        <Button
          variant="text"
          color="primary"
          onClick={() => consentPopupOpen('privacy')}
          sx={{ textDecoration: 'underline' }}
        >
          전체
        </Button>
      </Box>
    </Box>
{/* 마케팅 동의 */}
<Box mb={2}>
      <Box display="flex" alignItems="center">
        <FormControlLabel
          control={
            <CustomCheckbox
              id="marketing-checkbox"
              checked={checkboxState.marketing}
              onChange={() => handleCheck('marketing')}
              color="primary"
            />
          }
          label={
            <Typography variant="body1" component="span">
              [선택] 마케팅 동의
            </Typography>
          }
          sx={{ marginRight: 1 }} // 체크박스와 라벨 사이에 간격 추가
        />
        <Button
          variant="text"
          color="primary"
          onClick={() => consentPopupOpen('marketing')}
          sx={{ textDecoration: 'underline' }}
        >
          전체
        </Button>
      </Box>
    </Box>
</Box>

      {/* 팝업 모달 */}
      {isPopupOpen.terms && (
        <TermsPopup onClose={() => consentPopupClose('terms')} 
        handleCheck={handleCheck}
        checked={{ terms: checkboxState.terms }}
        />
      )}
      {isPopupOpen.privacy && (
        <PrivacyPopup onClose={() => consentPopupClose('privacy')} 
        handleCheck={handleCheck}
        checked={{ privacy: checkboxState.privacy }}
        />
      )}
      {isPopupOpen.marketing && (
        <MarketingPopup onClose={() => consentPopupClose('marketing')} 
        handleCheck={handleCheck}
        checked={{ marketing: checkboxState.marketing }}
        />
      )}
{/*회원가입 버튼 */}
          <Box mt={6}>
            <CustomButton2
              type="submit"
              variant="contained"
              sx={{ width: '100%', px: 4, py: 2, borderRadius: '8px' }}
            >
              회원가입
            </CustomButton2>

            <Typography
              mt={8}
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ fontWeight: 'light' }}
            >
              아이디가 있다면?{" "}
              <Link href="/login" underline="hover" color="primary">
                로그인
              </Link>
            </Typography>
          </Box>
        </form>
      </Box>
       {/* 스낵바 컴포넌트 호출 */}
       <CustomSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity="success"
        onClose={handleSnackbarClose}
      />
      </Box>
  );
};

export default SnsRegister;