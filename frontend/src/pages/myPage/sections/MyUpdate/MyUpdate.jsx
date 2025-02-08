import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom'; // 추가: useNavigate 훅을 가져옵니다.
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../../../store/actions/userActions'
import CategoryPopup from '../../../auth/RegisterPage/category/CategoryPopup';
import categories from '../../../auth/RegisterPage/category/CategoriesData';
import JobPopup from '../../../auth/RegisterPage/job/JobPopup';
import JobCategories from '../../../auth/RegisterPage/job/JobCategories';
import MarketingPopup from '../../../auth/RegisterPage/consent/Marketing';
import MyCancelAccount from './MyCancelAccount.jsx'
import MyChangePw from './MyChangePw.jsx'
import MyChangeLocation from './MyChangeLocation.jsx'
import axiosInstance from '../../../../utils/axios'
import { TextField, Button, Typography, Box, Stack, FormControlLabel,
          FormControl, InputLabel, Select, MenuItem, FormHelperText, 
          Chip,
        } from '@mui/material';
import '../../../../assets/styles/LoginCss.css'
import CustomButton from '../../../../components/club/CustomButton.jsx'
import CustomButton2 from '../../../../components/club/CustomButton2.jsx'
import CustomCheckbox from '../../../../components/club/CustomCheckbox.jsx'
import CustomSnackbar from '../../../../components/auth/Snackbar';

const MyUpdate = () => {
  const user = useSelector((state) => state.user?.userData?.user || {});
  const { register, handleSubmit, formState: { errors }, watch, setValue, control, reset } = 
  useForm({  
            defaultValues: {
              name: user.name || '',
              nickName: user.nickName || '',
              age: user.age || { year: '', month: '', day: '' },
              gender: user.gender || '',
              phone: user.phone || '',
              job: user.job || [],
              category: user.category || [],
              marketingAccepted: user.marketingAccepted || false
            },
            mode: 'onChange'});

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 정보수정 폼 제출 시 실행되는 함수
  const onSubmit = async (data) => {
    console.log('폼 제출 데이터:', data);
    const { name, nickName, age = {}, gender, 
            selectedJobs = [], category = [], phone = '',  } = data;
            
    //console.log('Checked asdasd:', checked); 
    const { marketing } = checkboxState;

    const { year = '', month = '', day = '' } = age;

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
    const body = {
      name,
      nickName,
      age: {
        year,
        month,
        day
      },
      gender,
      category: categoryObject, // 카테고리 추가
      job:selectedJobs,// 직종 추가
      phone,
      marketingAccepted: marketing,
    }
  // 바디 객체를 콘솔에 출력
  console.log('전송할 데이터:', body);
  
    dispatch(updateUser(body))
      .then(() => {
        setSnackbarMessage('정보 수정 완료되었습니다.');
        setSnackbarSeverity('success'); // 성공 상태로 변경
        setSnackbarOpen(true);
        setTimeout(() => {
          navigate('/'); // 비밀번호 변경 후 페이지 이동
        }, 2000); // 2초 후 이동
      })
      .catch((error) => {
        console.error('정보수정 실패:', error);
        // 에러 처리 로직
      });
  };

  // 스낵바 상태를 추가합니다.
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

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
    maxLength: {
      value: 20,
      message: "닉네임은 최대 20자까지 입력할 수 있습니다."
    }
  };

  const nickNameValue = watch('nickName');
  const [isNickNameChecked, setIsNickNameChecked] = useState(true);
  const [isNickNameReset, setIsNickNameReset] = useState(true); // 수정 버튼 상태

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
      const response = await axiosInstance.post(`/users/check-nickname`, { nickName });
      setSnackbarMessage(response.data.message);
      setSnackbarSeverity('success'); // 성공 메시지
      setSnackbarOpen(true);
      setIsNickNameChecked(true);  // 닉네임 확인 후 버튼 상태 변경
      setIsNickNameReset(true); // 수정 버튼 상태로 변경
    } catch (err) {
      setSnackbarMessage(err.response ? err.response.data.message : '서버 오류');
      setSnackbarSeverity('error'); // 오류 메시지
      setSnackbarOpen(true);
      setIsNickNameChecked(false);  // 오류 발생 시 버튼 상태 유지
      setIsNickNameReset(false);
    }
  };

  const handleNickNameReset = () => {
    setIsNickNameChecked(false);
    setIsNickNameReset(false); // 상태 초기화
  };

  const handleNickNameCancel = () => {
    setIsNickNameChecked(true); // 닉네임 수정 상태 해제
    setIsNickNameReset(true);   // 수정 상태 초기화
    reset({ nickName: user.nickName || '' });
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

//카테고리
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]); // 선택된 카테고리 상태 관리
  const [groupedCategories, setGroupedCategories] = useState({});

  useEffect(() => {
    if (user && user.category) {
      // user.category를 변환하여 formattedCategories에 저장
      const formattedCategories = user.category.flatMap(cat => {
        // sub 배열을 평탄화
        const flattenedSub = cat.sub.flat();
  
        // sub 항목을 개별 객체로 변환하며, main 값을 유지
        return flattenedSub.map(item => ({
          main: cat.main,
          sub: item
        }));
      });
      //console.log("Formatted Categories:", formattedCategories); // 변환된 데이터 확인
      setSelectedCategories(formattedCategories); // 상태 업데이트
    }
  }, [user]);
// 직종
const [isJobPopupOpen, setIsJobPopupOpen] = useState(false); // 직종 팝업
const [selectedJobs, setSelectedJobs] = useState([]); 
//console.log("직업 데이터", selectedJobs)

useEffect(() => {
  // user 데이터가 있을 때 selectedCategories에 category 설정
  if (user && user.job) {
    // 변환된 데이터를 상태로 설정
    setSelectedJobs(user.job);
  }
}, [user]);

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
  //console.log("Selected Categories updated:", selectedCategories);
  const grouped = groupCategories(selectedCategories);
 // console.log("Grouped Categories:", grouped);
  //console.log("카테고리 확인", grouped);

  // grouped 데이터를 categoryData 형식으로 변환
  const categoryData = Object.keys(grouped).map(main => ({
    main: main,
    sub: grouped[main]
  }));

  setGroupedCategories(grouped); // 상태 업데이트
  setValue('category', categoryData); // 폼 데이터와 상태 동기화
  //console.log("카테고리 그룹 확인", categoryData);
}, [selectedCategories, setValue]);

// 직종
useEffect(() => {
  setValue('selectedJobs', selectedJobs);
  //console.log("선택된 직종:", selectedJobs);
}, [selectedJobs, setValue]);

// 카테고리 선택 핸들러
 const handleSelection = (newSelections) => {
  //console.log("New Selections:", newSelections);
  if (isCategoryPopupOpen) {
    setSelectedCategories(newSelections); // 카테고리 선택 시 업데이트
  } else if (isJobPopupOpen) {
    setSelectedJobs(newSelections); // 직종 선택 시 업데이트
  }
};

//팝업 오픈
  const handlePopupOpen = (type) => {
    //console.log("Popup type:", type);//
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

// 전화번호 하이픈  자동생성
const formatPhoneNumber = (value) => {
  // 숫자만 추출
  const numbers = value.replace(/\D/g, '');

  // 하이픈 추가
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};

useEffect(() => {
  if (user && user.marketingAccepted !== undefined) {
    setCheckboxState(prevState => ({
      ...prevState,
      marketing: user.marketingAccepted
    }));
  }
}, [user]);

/// 약관 동의 상태
const [isPopupOpen, setIsPopupOpen] = useState({
  marketing: false,
});

// 체크박스 상태
const [checkboxState, setCheckboxState] = useState({
  marketing: false,
});

// 체크박스 상태를 업데이트하는 함수
const handleCheck = (type) => {
  setCheckboxState(prevState => {
    // 개별 체크박스의 상태를 반전시킵니다
    const newState = !prevState[type];
    // 모든 체크박스가 체크된 상태인지 확인합니다
    const allChecked = ['marketing'].every(key => prevState[key]);
    return {
      ...prevState,
      [type]: newState,
      all: allChecked
    };
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

// 정보 수정
const [view, setView] = useState(''); // 클릭된 버튼의 상태를 저장하는 변수
const [isChangePwVisible, setIsChangePwVisible] = useState(false);
const [isChangeLocationVisible, setIsChangeLocationVisible] = useState(false);
const [isAccountDeleteVisible, setIsAccountDeleteVisible] = useState(false);

const handleUpdateView = () => {
  if (view === 'update') {
    // 이미 'update' 뷰가 열려 있을 때, 닫기
    setView('');
    setIsChangePwVisible(false);
    setIsChangeLocationVisible(false);
    setIsAccountDeleteVisible(false);
  } else {
    // 다른 뷰가 열려 있을 때, 'update' 뷰로 변경
    setView('update');
    setIsChangePwVisible(false);
    setIsChangeLocationVisible(false);
    setIsAccountDeleteVisible(false);
  }
};

const handlePwChange = () => {
  if (view === 'changePw') {
    // 이미 'changePw' 뷰가 열려 있을 때, 닫기
    setView('');
    setIsChangePwVisible(false);
    setIsChangeLocationVisible(false);
    setIsAccountDeleteVisible(false);
  } else {
    // 다른 뷰가 열려 있을 때, 'changePw' 뷰로 변경
    setView('changePw');
    setIsChangePwVisible(true);
    setIsChangeLocationVisible(false);
    setIsAccountDeleteVisible(false);
  }
};

const handleLocationChange = () => {
  if (view === 'changeLocation') {
    // 이미 'changeLocation' 뷰가 열려 있을 때, 닫기
    setView('');
    setIsChangePwVisible(false);
    setIsChangeLocationVisible(false);
    setIsAccountDeleteVisible(false);
  } else {
    // 다른 뷰가 열려 있을 때, 'changeLocation' 뷰로 변경
    setView('changeLocation');
    setIsChangeLocationVisible(true);
    setIsChangePwVisible(false);
    setIsAccountDeleteVisible(false);
  }
};

const handleDeleteAccount = () => {
  if (view === 'delete') {
    // 이미 'delete' 뷰가 열려 있을 때, 닫기
    setView('');
    setIsChangePwVisible(false);
    setIsChangeLocationVisible(false);
    setIsAccountDeleteVisible(false);
  } else {
    // 다른 뷰가 열려 있을 때, 'delete' 뷰로 변경
    setView('delete');
    setIsAccountDeleteVisible(true);
    setIsChangePwVisible(false);
    setIsChangeLocationVisible(false);
  }
};

  return (
    <Box 
      sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          maxWidth: 600, 
          mx: 'auto', 
          pb: 5  // 풋터의 높이를 고려해 여유 공간 추가
          }}>
    {/* 상태 버튼  */}
    <Box sx={{ display: 'flex', flexDirection: 'column', }}>
      <CustomButton
        variant={view === 'update' ? 'contained' : 'outlined'}
        onClick={handleUpdateView}
        sx={{ 
          borderColor: 'transparent', // 무색 테두리
          color: '#30231C',
          backgroundColor: view === 'update' ? '#A67153' : '#DBC7B5', // 눌렸을 때와 눌리지 않았을 때의 배경색 설정
          '&:hover': {
            borderColor: 'transparent', // 무색 테두리
            backgroundColor: view === 'update' ? '#DBC7B5' : '#A67153' // 호버 상태의 배경색 설정
          },
          textAlign: 'left', // 글씨 왼쪽 정렬
          paddingLeft: '16px', // 글씨와 버튼 왼쪽의 간격 조정 (옵션)
          width: '100%', // 버튼 전체 너비 사용 (옵션)
          display: 'flex',
          justifyContent: 'flex-start', // 버튼 내 텍스트 왼쪽 정렬
          alignItems: 'center', // 버튼 내 텍스트 세로 중앙 정렬
          marginBottom: '15px', // 버튼 아래에 간격 추가
          overflow: 'hidden',
          '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '50%',
          width: view === 'update' ? '100%' : '0%', // 현재 뷰가 'update'일 때 선이 보이도록 설정
          height: '2px',
          backgroundColor: '#595959',
          transform: 'translateX(-50%)',
          transition: 'width 0.3s ease', // 선의 너비 변화에 애니메이션 적용
          },
        }}
      >
        정보 수정
      </CustomButton>

 {/* 정보 수정 */}
 {view === 'update' && (
        <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <Box mb={2} sx={{ display: 'flex', flexDirection: 'column' }}>    
          {/* 이메일 레이블과 값이 나란히 위치하도록 하는 부모 Box */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" component="label" htmlFor="email" 
            sx={{ 
              mt: 2,
              fontWeight: 'bold', 
              color: 'text.secondary', 
              minWidth: 100 
              }}>
              이메일
            </Typography>
            <Typography
              sx={{
                mt: 2,
                flex: 1,
                padding: 1,
                bgcolor: 'grey.200',
                borderRadius: 1,
                color: 'text.primary',
                textAlign: 'left',
              }} >
              {user.email}
            </Typography>
          </Box>
        </Box>
{/*이름 */}          
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" component="label" htmlFor="name" sx={{ fontWeight: 'bold', color: 'text.secondary', minWidth: 100 }}>
          이름
        </Typography>
          <TextField
            id="name"
            label="이름"
            type="text"
            fullWidth
            variant="outlined"
            {...register('name', userName)}
            error={!!errors.name}
            helperText={errors.name ? errors.name.message : ''}
            sx={{ flex: 1 }} // 남은 공간을 채우도록 설정
          />
      </Box>
{/*닉네임 */}          
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
  <Typography 
      variant="body2" 
      component="label" 
      htmlFor="nickName"
      sx={{ fontWeight: 'bold', color: 'text.secondary', minWidth: 100  }}
      >
      닉네임
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, width: 500 }}>
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
          flex: 1, mr: 1,
        }}
        />
       <Stack direction="row" spacing={2}>
      {!isNickNameChecked ? (
        <>
          <CustomButton2 
            variant="contained" 
            color="primary" 
            className="buttonMain"
            sx={{ height: '50px',
              borderColor: 'transparent', // 무색 테두리
              '&:hover': {
               borderColor: 'transparent', // 무색 테두리
              },
             }}
            onClick={handleCheckNickName}
          >
            중복검사
          </CustomButton2>
          <CustomButton  
            variant="outlined"  
            className="buttonSub2"
            sx={{ height: '50px',
              borderColor: 'transparent', // 무색 테두리
              '&:hover': {
               borderColor: 'transparent', // 무색 테두리
              },
             }}
            onClick={handleNickNameCancel}
          >
            취소하기
          </CustomButton>
        </>
      ) : (
        <CustomButton2  
          variant="outlined"  
          className="buttonSub1"
          sx={{ 
            height: '50px',
            borderColor: 'transparent', // 무색 테두리
            '&:hover': {
             borderColor: 'transparent', // 무색 테두리
            },
           }}
          onClick={handleNickNameReset}
        >
          닉네임 수정
        </CustomButton2>
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
<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
    <Typography variant="body2" component="label" htmlFor="nickName" sx={{ fontWeight: 'bold', color: 'text.secondary', minWidth: 100 }}>
      생년월일
    </Typography>
    <Box sx={{ display: 'flex', flex: 1, gap: 2, mt: 2 }}>
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
<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
    <Typography variant="body2" component="label" htmlFor="nickName" sx={{ fontWeight: 'bold', color: 'text.secondary', minWidth: 100 }}>
        성별
      </Typography>
      <Box sx={{ display: 'flex', flex: 1, gap: 2, mt: 2 }}>
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
<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
    <Typography variant="body2" component="label" htmlFor="nickName" sx={{ fontWeight: 'bold', color: 'text.secondary', minWidth: 100 }}>
        전화번호 
      </Typography>

        <Controller
          name="phone"
          control={control}
          defaultValue=""
          rules={{
            required: '전화번호는 필수입니다.',
            pattern: {
              value: /^\d{3}-\d{4}-\d{4}$/, // 예: 010-7430-3504
              message: '전화번호 형식을 확인해 주세요.\n 예) 010-7430-3504',
            }
          }}
          render={({ field }) => (
            <>
              <TextField
                {...field}
                id="phone"
                fullWidth
                variant="outlined"
                placeholder="010-7430-3504"
                error={!!errors.phone}
                helperText={errors.phone ? errors.phone.message : ''}
                onChange={(e) => {
                  const formattedValue = formatPhoneNumber(e.target.value);
                  setValue('phone', formattedValue, { shouldValidate: true }); // 포맷된 값을 폼 상태에 설정
                }}
                value={watch('phone')}
              />
            </>
          )}
        />
    </Box> 
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
<Box mt={4}>
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
          sx={{ marginLeft: '4px', marginRight: '0' }} // 간격을 줄이기 위해 marginLeft를 조정
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
      {isPopupOpen.marketing && (
        <MarketingPopup onClose={() => consentPopupClose('marketing')} 
        handleCheck={handleCheck}
        checked={{ marketing: checkboxState.marketing }}
        />
      )}
{/*정보수정 버튼 */}
          <Box mt={2}>
            <CustomButton2
              type="submit"
              variant="contained"
              color="primary"
              sx={{ 
                width: '100%', 
                px: 4, 
                py: 2, 
                borderRadius: '8px',
                marginBottom: '5px'
              }}
            >
              수정 하기
            </CustomButton2>
          </Box>
        </form>        
    )}
  </Box>
     {/* 비밀번호 변경 버튼 */}
     <Button
     variant={view === 'changePw' ? 'contained' : 'outlined'}
     onClick={handlePwChange} // 상태 변경 함수 사용
     sx={{ 
       borderColor: 'transparent', // 무색 테두리
       backgroundColor: view === 'changePw' ? '#A67153' : '#DBC7B5', // 눌렸을 때와 눌리지 않았을 때의 배경색 설정
       color: '#30231C',
       '&:hover': {
         borderColor: 'transparent', // 무색 테두리
         backgroundColor: view === 'changePw' ? '#DBC7B5' : '#A67153' , // 호버 상태의 배경색 설정
       },
       textAlign: 'left', // 글씨 왼쪽 정렬
       paddingLeft: '16px', // 글씨와 버튼 왼쪽의 간격 조정 (옵션)
       width: '100%', // 버튼 전체 너비 사용 (옵션)
       display: 'flex',
       justifyContent: 'flex-start', // 버튼 내 텍스트 왼쪽 정렬
       alignItems: 'center', // 버튼 내 텍스트 세로 중앙 정렬
       marginBottom: '15px',
       overflow: 'hidden',
          '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '50%',
          width: view === 'changePw' ? '100%' : '0%', // 현재 뷰가 'update'일 때 선이 보이도록 설정
          height: '2px',
          backgroundColor: '#595959',
          transform: 'translateX(-50%)',
          transition: 'width 0.3s ease', // 선의 너비 변화에 애니메이션 적용
          },
     }}
   >
     비밀번호 변경
   </Button>
   {/* 비밀번호 변경 폼 (추가할 부분) */}
   {isChangePwVisible && <MyChangePw view={view} />}

    {/* 지역변경 버튼 */}
    <Button
        variant={view === 'changeLocation' ? 'contained' : 'outlined'}
        onClick={handleLocationChange} // 상태 변경 함수 사용
        sx={{ 
          borderColor: 'transparent', // 무색 테두리
          backgroundColor: view === 'changeLocation' ? '#A67153' : '#DBC7B5', // 눌렸을 때와 눌리지 않았을 때의 배경색 설정
          color: '#30231C',
          '&:hover': {
            borderColor: 'transparent', // 무색 테두리
            backgroundColor: view === 'changeLocation' ? '#DBC7B5' : '#A67153' , // 호버 상태의 배경색 설정
          },
          textAlign: 'left', // 글씨 왼쪽 정렬
          paddingLeft: '16px', // 글씨와 버튼 왼쪽의 간격 조정 (옵션)
          width: '100%', // 버튼 전체 너비 사용 (옵션)
          display: 'flex',
          justifyContent: 'flex-start', // 버튼 내 텍스트 왼쪽 정렬
          alignItems: 'center', // 버튼 내 텍스트 세로 중앙 정렬
          marginBottom: '15px',
          overflow: 'hidden',
             '&::after': {
             content: '""',
             position: 'absolute',
             bottom: 0,
             left: '50%',
             width: view === 'changeLocation' ? '100%' : '0%', // 현재 뷰가 'update'일 때 선이 보이도록 설정
             height: '2px',
             backgroundColor: '#595959',
             transform: 'translateX(-50%)',
             transition: 'width 0.3s ease', // 선의 너비 변화에 애니메이션 적용
             },
        }}
      >
        주소 변경
      </Button>

      {/* 지역변경 폼 (추가할 부분) */}
      {isChangeLocationVisible && <MyChangeLocation view={view} />}

   {/* 회원 탈퇴 버튼 */}
      <Button
        variant={view === 'delete' ? 'contained' : 'outlined'}
        onClick={handleDeleteAccount} // 상태 변경 함수 사용
        sx={{ 
          borderColor: 'transparent', // 무색 테두리
          backgroundColor: view === 'delete' ? '#A67153' : '#DBC7B5', // 눌렸을 때와 눌리지 않았을 때의 배경색 설정
          color: '#30231C',
          '&:hover': {
            borderColor: 'transparent', // 무색 테두리
            backgroundColor: view === 'delete' ? '#DBC7B5' : '#A67153' , // 호버 상태의 배경색 설정
          },
          textAlign: 'left', // 글씨 왼쪽 정렬
          paddingLeft: '16px', // 글씨와 버튼 왼쪽의 간격 조정 (옵션)
          width: '100%', // 버튼 전체 너비 사용 (옵션)
          display: 'flex',
          justifyContent: 'flex-start', // 버튼 내 텍스트 왼쪽 정렬
          alignItems: 'center', // 버튼 내 텍스트 세로 중앙 정렬
          marginBottom: '15px',
          overflow: 'hidden',
             '&::after': {
             content: '""',
             position: 'absolute',
             bottom: 0,
             left: '50%',
             width: view === 'delete' ? '100%' : '0%', // 현재 뷰가 'update'일 때 선이 보이도록 설정
             height: '2px',
             backgroundColor: '#595959',
             transform: 'translateX(-50%)',
             transition: 'width 0.3s ease', // 선의 너비 변화에 애니메이션 적용
             },
        }}
      >
        회원 탈퇴
      </Button>
      {/* 회원 탈퇴 폼 (추가할 부분) */}
      {isAccountDeleteVisible && <MyCancelAccount view={view} />}

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

export default MyUpdate