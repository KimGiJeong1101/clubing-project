import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ImageCarousel from '../../../components/common/ImageCarousel';
import Reply from './Reply';

const GalleryModal = ({ open, handleClose, images, writer, title, content, createdAt, updatedAt, handlePrev, handleNext, postId }) => {
  const postType = 'Gallery'; // GalleryModal이기 때문에 postType은 'Gallery'로 설정

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      slotProps={{
        backdrop: {
          style: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)', // 어두운 배경 설정
          },
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '48%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%', // 모달 창의 전체 너비
          height: '500px', // 고정된 높이 설정
          maxWidth: '100%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 2,
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderRadius: '8px',
        }}
      >
        <IconButton
          onClick={handlePrev}
          sx={{
            position: 'absolute',
            left: '-130px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1300,
            color: 'white',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
        >
          <ArrowBackIosIcon />
        </IconButton>

        <Box
          sx={{
            width: '65%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          <ImageCarousel images={images} />
        </Box>

        <Box
          sx={{
            width: '35%',
            height: '100%',
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center', // 수직 중앙 정렬
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid rgba(0, 0, 0, 0.23)',
              borderRadius: '4px',
              padding: '5px',
              position: 'relative',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: '-10px',
                left: '10px',
                backgroundColor: 'white',
                padding: '0 3px',
                color: 'rgba(0, 0, 0, 0.6)',
                fontSize: '0.6rem'
              }}
            >
              Writer
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>{writer}</Typography> {/* 글씨 크기 조정 */}
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid rgba(0, 0, 0, 0.23)',
              borderRadius: '4px',
              padding: '5px',
              position: 'relative',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: '-10px',
                left: '10px',
                backgroundColor: 'white',
                padding: '0 3px',
                color: 'rgba(0, 0, 0, 0.6)',
                fontSize: '0.6rem'
              }}
            >
              Title
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>{title}</Typography> {/* 글씨 크기 조정 */}
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid rgba(0, 0, 0, 0.23)',
              borderRadius: '4px',
              padding: '5px',
              position: 'relative',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: '-10px',
                left: '10px',
                backgroundColor: 'white',
                padding: '0 3px',
                color: 'rgba(0, 0, 0, 0.6)',
                fontSize: '0.6rem'
              }}
            >
              Content
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>{content}</Typography> {/* 글씨 크기 조정 */}
          </Box>

          {/* 댓글 컴포넌트: postType과 postId를 넘겨줌 */}
          <Reply postType={postType} postId={postId}/>
        </Box>

        <IconButton
          onClick={handleNext}
          sx={{
            position: 'absolute',
            right: '-130px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1300,
            color: 'white',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>
    </Modal>
  );
};

export default GalleryModal;
