import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Login from './components/Login';
import Join from './components/Join'; // Join으로 변경
import Feed from './components/Feed';
import Register from './components/Register';
import MyPage from './components/MyPage';
import Menu from './components/Menu'; // Menu로 변경
import MainPage from './components/Main';
import Header from './components/Header';


function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/join';

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* 로그인/회원가입 페이지가 아닐 때만 Menu를 보여줌 */}
      {!isAuthPage && <Menu />} 

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      {!isAuthPage && <Header />}
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/join" element={<Join />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/feed" element={<Feed />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
