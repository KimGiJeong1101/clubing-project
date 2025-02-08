import React, { useRef, useState, useEffect, useCallback } from 'react';
import ImageEditor from '@toast-ui/react-image-editor';
import 'tui-image-editor/dist/tui-image-editor.css';
import { Button, Box, Grid, Snackbar, Alert, TextField } from '@mui/material';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useSelector } from 'react-redux';
import './CustomImageEditor.css';

// 커스텀 테마 설정: TOAST UI Image Editor의 스타일을 정의
const myTheme = {
  'common.bi.image': '', // BI 이미지 비활성화
  'common.bisize.width': '0px', // BI 이미지 크기 설정
  'common.bisize.height': '0px',
  'common.backgroundImage': 'none', // 배경 이미지 제거
  'common.backgroundColor': '#fff', // 배경 색상을 흰색으로 설정
  'common.border': '1px solid #c1c1c1', // 경계선 설정
};

const GalleryCreate = ({ onRegisterComplete, initialData = {} }) => {
  const editorRef = useRef(null); // TOAST UI Image Editor 인스턴스에 접근하기 위한 ref 설정
  const [title, setTitle] = useState(initialData.title || ''); // 제목 상태 관리, 초기값이 있으면 사용
  const [content, setContent] = useState(initialData.content || ''); // 내용 상태 관리
  const [selectedImages, setSelectedImages] = useState(initialData.images ? initialData.images.map(url => ({ url, name: null })) : []); // 선택된 이미지 관리, 초기 데이터가 있으면 사용
  const [currentImageIndex, setCurrentImageIndex] = useState(null); // 현재 편집 중인 이미지 인덱스 관리
  const fileInputRef = useRef(null); // 파일 입력 요소에 접근하기 위한 ref 설정

  // Snackbar 관련 상태 관리
  const [snackbarOpen, setSnackbarOpen] = useState(false); // 스낵바 열기/닫기 상태 관리
  const [snackbarMessage, setSnackbarMessage] = useState(''); // 스낵바에 표시할 메시지 관리
  const [snackbarSeverity, setSnackbarSeverity] = useState('error'); // 스낵바 메시지의 심각도 관리 (성공/실패)

  const userEmail = useSelector(state => state.user?.userData?.user?.email || null); // Redux에서 현재 사용자 이메일을 가져옴

  // Snackbar 닫기 함수
  const handleSnackbarClose = () => {
    setSnackbarOpen(false); // 스낵바 닫기
  };

  // 이미지를 로드하는 함수: 선택된 이미지의 URL을 기반으로 이미지 에디터에 로드
  const loadImage = useCallback(async (index) => {
    const editorInstance = editorRef.current.getInstance(); // TOAST UI Image Editor 인스턴스 가져오기
    const selectedImage = selectedImages[index]; // 현재 선택된 이미지 가져오기
    if (selectedImage && selectedImage.url) { // 이미지가 존재하는 경우
      try {
        await editorInstance.loadImageFromURL(selectedImage.url, 'selectedImage'); // URL을 통해 이미지 로드
        editorInstance.clearUndoStack(); // Undo 스택 초기화
        editorInstance.ui.activeMenuEvent(); // UI 메뉴 활성화
      } catch (error) {
        // 에러 발생 시 스낵바로 에러 메시지 표시
      }
    }
  }, [selectedImages]);

  // currentImageIndex가 변경될 때마다 해당 이미지를 로드
  useEffect(() => {
    if (currentImageIndex !== null) {
      loadImage(currentImageIndex); // 선택된 이미지를 에디터에 로드
    }
  }, [currentImageIndex, loadImage]);

  // 파일이 업로드되면 이미지 목록에 추가하는 함수
  const handleImageUpload = (event) => {
    const files = event.target.files; // 업로드된 파일들을 가져옴
    const imagesArray = Array.from(files).slice(0, 8).map((file) => ({
      url: URL.createObjectURL(file), // 각 파일에 대해 객체 URL 생성
      name: file.name, // 파일 이름 저장
    }));
    setSelectedImages((prev) => {
      const updatedImages = prev.slice(); // 기존 이미지를 복사
      imagesArray.forEach((img, idx) => {
        if (updatedImages[idx]) {
          updatedImages[idx] = img; // 기존 이미지를 덮어씌움
        } else {
          updatedImages.push(img); // 새 이미지를 추가
        }
      });
      return updatedImages;
    });
    setCurrentImageIndex(0); // 첫 번째 이미지를 선택하여 로드
  };

  // 이미지 슬롯을 클릭했을 때 해당 이미지를 에디터에 로드하는 함수
  const handleBoxClick = async (index) => {
    const editorInstance = editorRef.current.getInstance();
    if (currentImageIndex !== null && selectedImages[currentImageIndex]?.url) { // 현재 편집 중인 이미지가 존재하는 경우
      try {
        const dataURL = editorInstance.toDataURL(); // 현재 이미지를 Data URL로 변환
        console.log('selectedImages : ', selectedImages);
        console.log('currentImageIndex : ' + currentImageIndex);
        setSelectedImages((prev) =>
          prev.map((img, idx) => (idx === currentImageIndex ? { ...img, url: dataURL } : img)) // 이미지 업데이트
        );
      } catch (error) {
        // 에러 발생 시 스낵바로 에러 메시지 표시
        setSnackbarMessage('이미지 슬롯 변경에러');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
    setCurrentImageIndex(index); // 선택한 이미지를 현재 이미지로 설정
    const selectedImage = selectedImages[index]; // 선택된 이미지 가져오기
    if (selectedImage && selectedImage.url) { // 이미지가 존재하는 경우
      try {
        await editorInstance.loadImageFromURL(selectedImage.url, 'selectedImage'); // URL을 통해 이미지 로드
        editorInstance.clearUndoStack(); // Undo 스택 초기화
        editorInstance.ui.activeMenuEvent(); // UI 메뉴 활성화
      } catch (error) {
        // 에러 발생 시 스낵바로 에러 메시지 표시
        setSnackbarMessage('Error loading image. Please try again with a valid image.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const handleSaveAll = async () => {
    console.log('selectedImages', selectedImages)
    const editorInstance = editorRef.current.getInstance();

    // 모든 이미지를 한 번씩 "클릭"한 것처럼 처리
    for (let i = 0; i < selectedImages.length; i++) {
      const image = selectedImages[i];
      if (image?.url) {
        try {
          // 각 이미지를 에디터에 로드
          await editorInstance.loadImageFromURL(image.url, 'selectedImage');
          editorInstance.clearUndoStack(); // Undo 스택 초기화
          editorInstance.ui.activeMenuEvent(); // UI 메뉴 활성화

          // Data URL로 변환하여 해당 이미지를 업데이트
          const dataURL = editorInstance.toDataURL();
          setSelectedImages((prev) =>
            prev.map((img, idx) => (idx === i ? { ...img, url: dataURL } : img))
          );
        } catch (error) {
          console.error('Error processing image:', error);
        }
      }
    }

    // 위의 로직으로 모든 이미지가 "클릭"된 것처럼 처리되었으므로
    // 이제 저장 로직 실행
    const formData = new FormData();
    let hasNewFiles = false;

    // 모든 이미지를 FormData에 추가
    for (const image of selectedImages) {
      if (image.url && !image.url.startsWith("http")) {
        hasNewFiles = true;
        try {
          const blob = await fetch(image.url).then((res) => res.blob());
          formData.append("files", blob, image.name || "image.jpg");
        } catch (error) {
          console.error("Error converting image to blob.", error);
          return;
        }
      }
    }

    // 기타 데이터 추가
    formData.append("writer", userEmail);
    formData.append("title", title);
    formData.append("content", content);

    // 만약 새 파일이 없다면 순서만 바뀐 이미지를 전송
    if (!hasNewFiles) {
      const sortedImagesData = JSON.stringify(selectedImages);
      formData.append("sortedImages", sortedImagesData);
    }

    // 서버로 요청 전송
    onRegisterComplete(formData);
  };


  // 드래그 앤 드롭을 통해 이미지 순서를 변경하는 함수
  const onDragEnd = (result) => {
    if (!result.destination) return; // 목적지가 없으면 아무 작업도 하지 않음

    const reorderedImages = Array.from(selectedImages); // 배열 복사
    const [movedImage] = reorderedImages.splice(result.source.index, 1); // 드래그한 항목을 기존 위치에서 제거
    reorderedImages.splice(result.destination.index, 0, movedImage); // 새로운 위치에 삽입

    setSelectedImages(reorderedImages); // 재배열된 배열로 상태 업데이트
    setCurrentImageIndex(result.destination.index); // 새로운 위치의 이미지를 현재 이미지로 설정
  };


  // 이미지 슬롯 배열: 선택된 이미지의 수가 8개보다 적을 경우 빈 슬롯을 추가
  const imageBoxes = [...selectedImages];
  while (imageBoxes.length < 8) { // 8개의 슬롯이 채워질 때까지 빈 슬롯 추가
    imageBoxes.push({ url: null, name: null });
  }

  return (
    <div style={{ textAlign: 'center', position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0 }}>
        {/* 이미지 에디터 */}
        <Box sx={{ flex: '1 1 auto', width: '60%', height: '600px', marginRight: '10px' }}>
          <ImageEditor
            ref={editorRef} // ImageEditor 인스턴스 참조 설정
            includeUI={{
              theme: myTheme, // 커스텀 테마 적용
              menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'mask', 'filter'], // 사용 가능한 메뉴 설정
              initMenu: '', // 초기 메뉴 비활성화
              uiSize: {
                width: '100%', // UI의 너비 설정
                height: '600px', // UI의 높이 설정
              },
              menuBarPosition: 'left', // 메뉴 바 위치 설정
            }}
            cssMaxHeight={500} // 에디터의 최대 높이 설정
            cssMaxWidth={700} // 에디터의 최대 너비 설정
            selectionStyle={{
              cornerSize: 20, // 선택 박스의 모서리 크기 설정
              rotatingPointOffset: 70, // 회전 포인트 오프셋 설정
            }}
            usageStatistics={false} // 통계 사용 비활성화
            onError={(error) => { // 에러 발생 시 처리
              setSnackbarMessage('Error loading image. Please try again.');
              setSnackbarSeverity('error');
              setSnackbarOpen(true);
            }}
          />
        </Box>

        {/* 이미지와 입력 필드를 포함하는 사이드 바 */}
        <Box sx={{ flex: '0 1 auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', height: '600px', gap: 2, marginTop: 5 }}>
          {/* 이미지 선택 버튼 */}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload} // 이미지 업로드 처리
            ref={fileInputRef}
            style={{ display: 'none' }} // 파일 입력 필드를 숨김
          />
          <Button
            variant="contained"
            onClick={() => fileInputRef.current.click()} // 버튼 클릭 시 파일 입력 창 열기
            sx={{
              top: -20,
              right: 0,
              margin: '0px',
              backgroundColor: '#DBC7B5', // 버튼 기본 색상
              '&:hover': {
                backgroundColor: '#A67153', // 버튼 호버 색상
              },
            }}
          >
            눌러서 이미지를 선택해주세요
          </Button>

          {/* 드래그 앤 드롭 컨텍스트 */}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="images" direction="horizontal">
              {(provided) => (
                <Grid
                  container
                  spacing={0.5}
                  sx={{ width: '500px' }}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {imageBoxes.map((image, index) => (
                    <Draggable key={index} draggableId={`image-${index}`} index={index}>
                      {(provided, snapshot) => (
                        <Grid
                          item
                          xs={3}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <Box
                            component="div"
                            onClick={() => image.url && handleBoxClick(index)} // 클릭 시 이미지 로드
                            sx={{
                              position: 'relative',
                              width: '100%',
                              height: 100,
                              border: currentImageIndex === index ? '2px solid blue' : '1px solid gray', // 선택된 이미지는 파란색 경계선
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: snapshot.isDragging ? '#e0e0e0' : '#f0f0f0', // 드래깅 중일 때 배경색 변경
                              marginBottom: 1,
                              visibility: snapshot.isDragging ? 'hidden' : 'visible', // 드래깅 중일 때 보이지 않게 설정
                            }}
                          >
                            {image.url && ( // 이미지가 존재하는 경우 이미지를 표시
                              <Box
                                component="img"
                                src={image.url}
                                alt={`Selected ${index}`}
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover', // 이미지 크기 맞춤
                                }}
                              />
                            )}
                          </Box>
                        </Grid>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Grid>
              )}
            </Droppable>
          </DragDropContext>

          {/* 제목과 내용 입력 필드 */}
          <TextField
            label="제목"
            variant="outlined"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ marginTop: '16px' }}
          />

          <TextField
            label="내용"
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ marginTop: '16px' }}
          />

          {/* 저장 버튼 */}
          <Button
            variant="contained"
            onClick={handleSaveAll}
            sx={{
              marginTop: '0px',
              backgroundColor: '#DBC7B5', // 버튼 기본 색상
              '&:hover': {
                backgroundColor: '#A67153', // 버튼 호버 색상
              },
            }}
          >
            저 장
          </Button>
        </Box>
      </Box>

      {/* Snackbar Component */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default GalleryCreate;
