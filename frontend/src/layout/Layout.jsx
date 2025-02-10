import React from 'react';
import Header from './Header';
import NavBar from './NavBar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import { Box } from "@mui/material";

function Layout({ onSectionChange }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onSectionChange={onSectionChange} />
      <Box sx={{ flex: 1 }}>
        <main>
          <Outlet /> {/* 이곳에 페이지 컴포넌트가 렌더링됩니다 */}
        </main>
      </Box>
      <Footer />
    </Box>
  );
}

export default Layout;
