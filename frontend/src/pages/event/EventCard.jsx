import React, { useEffect, useState, useRef } from 'react';
import { Typography, Snackbar, Alert, Button, TextField } from '@mui/material';
import { Box } from '@mui/system';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EventImageCropper from './EventImageCropper';
import { useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../utils/axios';
import { LocalizationProvider, MobileDateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ko'; // 한국어 로케일

// 로케일 설정
dayjs.locale('ko');

const EventCard = ({ eventData, onClose }) => {
  const [title, setTitle] = useState('');
  const [contentText, setContentText] = useState('');
  const [displayImage, setDisplayImage] = useState('');
  const [mainImageFile, setMainImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [cardTitle, setCardTitle] = useState('');
  const [editTitle, setEditTitle] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef(null);

  const [endTime, setEndTime] = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [snackbarDuration, setSnackbarDuration] = useState(6000);

  const writer = useSelector(state => state.user?.userData?.user?.email);

  // 첫 번째 <img> 태그에서 src 속성을 추출하는 함수
  const extractFirstImageSrc = (htmlContent) => {
    const imgTag = htmlContent.match(/<img[^>]+src="([^">]+)"/);
    return imgTag ? imgTag[1] : "";
  };

  // HTML에서 텍스트만 추출하는 함수
  const extractTextContent = (htmlContent) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  useEffect(() => {
    if (eventData) {
      setTitle(eventData.title || '');
      setCardTitle(eventData.cardTitle || '');

      const initialImage = extractFirstImageSrc(eventData.content || '') || eventData.cardImage || '';
      setDisplayImage(initialImage);

      setContentText(extractTextContent(eventData.content || ''));
      setEndTime(eventData.endTime ? dayjs(eventData.endTime) : null);
    }
  }, [eventData]);

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

  const imageToBlob = async (imageSrc) => {
    const response = await fetch(imageSrc);
    const blob = await response.blob();
    return blob;
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const base64Image = await toBase64(file);
      setDisplayImage(base64Image);
      setShowCropper(true);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleTitleClick = () => {
    setEditTitle(true);
  };

  const handleTitleSave = () => {
    setEditTitle(false);
  };

  const handleCropComplete = async (croppedImageUrl) => {
    setDisplayImage(croppedImageUrl);
    try {
      const blob = await imageToBlob(croppedImageUrl);
      setMainImageFile(blob);
    } catch (error) {
      setSnackbarMessage('이미지를 처리하는 중 오류가 발생했습니다.');
      setSnackbarSeverity('error');
      setSnackbarDuration(6000);
      setSnackbarOpen(true);
    }
    setShowCropper(false);
  };

  const uploadImageToServer = async (imageBlob) => {
    if (imageBlob) {
      const formData = new FormData();
      formData.append('file', imageBlob, 'uploaded_image.png');
      try {
        const response = await axiosInstance.post('http://localhost:4000/events/upload', formData);
        const uploadedFileName = response.data.filename;
        const dateFolder = dayjs().format('YYYY-MM-DD');
        const imgLink = "http://localhost:4000/upload";
        const uploadedImageUrl = `${imgLink}/${dateFolder}/${uploadedFileName}`;
        setUploadedImageUrl(uploadedImageUrl);
        return uploadedImageUrl;
      } catch (error) {
        setSnackbarMessage('이미지 업로드에 실패했습니다.');
        setSnackbarSeverity('error');
        setSnackbarDuration(6000);
        setSnackbarOpen(true);
        throw error;
      }
    } else {
      setSnackbarMessage('업로드할 이미지가 없습니다.');
      setSnackbarSeverity('error');
      setSnackbarDuration(6000);
      setSnackbarOpen(true);
      throw new Error('No image to upload');
    }
  };

  // 등록 mutation
  const mutationRegister = useMutation({
    mutationFn: async (dataToSend) => {
      const response = await axiosInstance.post('http://localhost:4000/events/newEvent', dataToSend);
      return response.data;
    },
    onSuccess: (data) => {
      setSnackbarMessage('이벤트가 성공적으로 등록되었습니다.');
      setSnackbarSeverity('success');
      setSnackbarDuration(1000);
      setSnackbarOpen(true);
    },
    onError: (error) => {
      setSnackbarMessage('이벤트 등록에 실패했습니다.');
      setSnackbarSeverity('error');
      setSnackbarDuration(6000);
      setSnackbarOpen(true);
    },
  });

  // 수정 mutation
  const mutationUpdate = useMutation({
    mutationFn: async (dataToSend) => {
      const response = await axiosInstance.put(`http://localhost:4000/events/${dataToSend.eventId}`, dataToSend);
      return response.data;
    },
    onSuccess: (data) => {
      setSnackbarMessage('이벤트가 성공적으로 수정되었습니다.');
      setSnackbarSeverity('success');
      setSnackbarDuration(1000);
      setSnackbarOpen(true);
    },
    onError: (error) => {
      setSnackbarMessage('이벤트 수정에 실패했습니다.');
      setSnackbarSeverity('error');
      setSnackbarDuration(6000);
      setSnackbarOpen(true);
    },
  });

  const handleSubmit = async () => {
    try {
      let finalCardImage = '';

      if (mainImageFile) {
        finalCardImage = await uploadImageToServer(mainImageFile);
      } else if (displayImage) {
        const blob = await imageToBlob(displayImage);
        finalCardImage = await uploadImageToServer(blob);
      } else if (eventData && eventData.cardImage) {
        finalCardImage = eventData.cardImage;
      }

      // 로그로 eventId 확인 (eventData.eventId로 접근)
      console.log("eventData:", eventData);
      console.log("eventId:", eventData?.eventId);

      const dataToSend = {
        eventId: eventData?.eventId || null,  // eventData.eventId로 수정
        title: title,
        content: eventData.content,
        cardImage: finalCardImage,
        cardTitle: cardTitle,
        writer: writer,
        endTime: endTime ? endTime.toISOString() : null,
        isEdit: eventData?.isEdit || false,  // isEdit 플래그로 등록/수정 구분
      };

      if (dataToSend.isEdit) {
        mutationUpdate.mutate(dataToSend); // 수정 요청
      } else {
        mutationRegister.mutate(dataToSend); // 등록 요청
      }
    } catch (error) {
      setSnackbarMessage('제출 중 오류가 발생했습니다.');
      setSnackbarSeverity('error');
      setSnackbarDuration(6000);
      setSnackbarOpen(true);
    }
  };



  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    if (snackbarSeverity === 'success') {
      onClose();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '100%', m: '10px' }}>
        <Typography variant="h6" gutterBottom>
          리스트 카드 모델링
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Card sx={{ width: '350px', height: 'auto', margin: 0 }}>
            <CardMedia
              component="img"
              alt={title || '이미지 없음'}
              height="200"
              image={displayImage || 'https://via.placeholder.com/345x140?text=No+Image'}
              onClick={() => fileInputRef.current.click()}
              sx={{ cursor: 'pointer', objectFit: 'cover', width: '100%', height: '200px' }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px', m: '10px' }}>
              <CardContent sx={{ padding: 0, flex: 1 }}>
                {editTitle ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      value={cardTitle}
                      onChange={(e) => setCardTitle(e.target.value)}
                      label="새로운 제목"
                      variant="outlined"
                      size="small"
                      sx={{ marginRight: 1 }}
                    />
                    <Button onClick={() => setEditTitle(false)} variant="contained" size="small">
                      저장
                    </Button>
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    color="black"
                    sx={{
                      display: '-webkit-box',
                      overflow: 'hidden',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      whiteSpace: 'normal',
                      cursor: 'pointer',
                    }}
                    onClick={() => setEditTitle(true)}
                  >
                    {cardTitle || title || '기본 타이틀'}
                  </Typography>
                )}
              </CardContent>
              <MoreVertIcon sx={{ fontSize: 28, cursor: 'pointer', ml: 1 }} />
            </Box>
            <Box sx={{ padding: '0 20px' }}>
              <Typography fontSize={10}>조회수 : 100</Typography>
              <Typography fontSize={10}>
                등록날짜 : {dayjs().format('YYYY-MM-DD HH:mm:ss')}
              </Typography>
              <Typography fontSize={10}>
                종료날짜 : {endTime ? endTime.format('YYYY-MM-DD HH:mm:ss') : '선택되지 않음'}
              </Typography>
            </Box>
            <CardActions>
              <Button size="small" sx={{ color: '#30231C' }}>공유</Button>
              <Button size="small" sx={{ color: '#30231C' }}>더 보기</Button>
            </CardActions>
          </Card>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2, width: '350px' }}>
          {isDatePickerOpen && (
            <Box sx={{ marginRight: 1 }}>
              <MobileDateTimePicker
                value={endTime}
                onChange={(newValue) => setEndTime(newValue)}
                onAccept={() => setIsDatePickerOpen(false)}
                onClose={() => setIsDatePickerOpen(false)}
                showToolbar
                ampm={false}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    sx={{
                      width: '150px', // 너비 조정
                      fontSize: '12px', // 글자 크기 조정
                    }}
                  />
                )}
              />

            </Box>
          )}
          <Button
            variant="contained"
            onClick={() => setIsDatePickerOpen(true)}
            sx={{
              backgroundColor: '#DBC7B5',
              '&:hover': {
                backgroundColor: '#A67153',
              },
              mr: 1,
            }}
          >
            종료시일 설정
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              backgroundColor: '#6E3C21',
              '&:hover': {
                backgroundColor: '#A67153',
              },
            }}
          >
            제출
          </Button>
        </Box>

        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleImageUpload}
        />

        {showCropper && (
          <EventImageCropper
            src={displayImage}
            onCropComplete={setDisplayImage}
            onClose={() => setShowCropper(false)}
          />
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={snackbarDuration}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>

    </LocalizationProvider>
  );
};

export default EventCard;