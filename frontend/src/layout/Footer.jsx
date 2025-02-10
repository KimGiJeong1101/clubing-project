import React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import XIcon from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
  return (
    <Box 
      sx={{ 
        backgroundColor: "#565903", 
        padding: '20px 0', 
        borderTop: '1px solid #ddd' 
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* 첫 번째 구획: 로고 */}
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <img src="/logo/black_long_h.png" alt="Logo" style={{ height: '45px' }} />
            </Box>
          </Grid>

          {/* 두 번째 구획: 회사 소개 */}
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="h6" sx={{ marginBottom: '16px' }}>회사</Typography>
              <Typography variant="body2">
                회사소개
              </Typography>
            </Box>
          </Grid>

          {/* 세 번째 구획: 이벤트 */}
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="h6" sx={{ marginBottom: '16px' }}>서비스</Typography>
              <Typography variant="body2">
                이벤트
              </Typography>
              <Typography variant="body2">
                공지사항
              </Typography>
              <Typography variant="body2">
                자주 묻는 질문
              </Typography>
            </Box>
          </Grid>

          {/* 네 번째 구획: 연락처 */}
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="h6" sx={{ marginBottom: '16px' }}>고객센터</Typography>
              <Typography variant="body2">
                전화: 000-0000-0000
              </Typography>
              <Typography variant="body2">
                이메일: clubing@clubing.com
              </Typography>
              <Typography variant="body2">
                <FacebookIcon />
                <XIcon />
                <InstagramIcon />
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
