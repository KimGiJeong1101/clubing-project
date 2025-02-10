import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Checkbox, FormControlLabel, Box, Typography } from '@mui/material';
import CustomCheckbox from '../../../../components/club/CustomCheckbox'

const TermsPopup = ({ onClose, handleCheck, checked }) => {
  return (
    <Dialog
      open
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          width: 600, // 원하는 가로 크기 설정 (픽셀 단위)
          maxWidth: '100%', // 최대 너비를 100%로 설정하여 화면 크기에 맞게 조정
        },
      }}
    >
      <DialogTitle>
        clubing 이용약관
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '60vh',
          overflowY: 'auto',
          padding: 2,
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            mb: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              boxSizing: 'border-box',
              borderRadius: 1,
              border: '1px solid #d6d6d6',
              padding: 2,
              height: '230px', // 원하는 높이 설정 (픽셀 단위)
              overflowY: 'auto',
              backgroundColor: '#f9f9f9',
            }}
          >
            여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다. 여기에 마케팅 동의 내용을 작성합니다.
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <CustomCheckbox
              checked={checked.terms}
              onChange={() => handleCheck('terms')}
              color="primary"
            />
          }
          label="약관에 동의합니다."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsPopup;
