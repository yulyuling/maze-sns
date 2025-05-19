import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './login.css';  // CSS 파일 import
import { Snackbar, Alert } from '@mui/material';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [loginSnackbar, setLoginSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setLoginSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setLoginSnackbar({
        open: true,
        message: '이메일과 비밀번호를 모두 입력해주세요.',
        severity: 'warning'
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3005/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (response.ok) {
        // 로그인 성공 시 email만 localStorage에 저장
        localStorage.setItem('userEmail', data.user.email);
        setLoginSnackbar({
          open: true,
          message: '로그인 성공!',
          severity: 'success'
        });
        navigate('/main');
      } else {
        setLoginSnackbar({
          open: true,
          message: data.message || '로그인에 실패했습니다.',
          severity: 'error'
        });
      }
    } catch (error) {
      setLoginSnackbar({
        open: true,
        message: '서버 오류가 발생했습니다.',
        severity: 'error'
      });
      console.error('로그인 오류:', error);
    }
  };

  return (
    <div className="login-container"
      style={{ backgroundImage: "url('/uploads/login.png')",
      backgroundSize: '45%', 
      backgroundPosition: '650px 350px',
    }}>

      <div className="logo-container">
        <img src="/uploads/logo2.png" alt="Logo" className="login-logo" />
      </div>
      <div>
        <h4 className="login-title">로그인</h4>
      </div>
      <div className="login-box">
        <form onSubmit={handleLogin}>
          <input
            type="text"
            name="email"
            placeholder="이메일"
            className="login-input"
            value={form.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            className="login-input"
            value={form.password}
            onChange={handleChange}
          />
          
          <button type="submit" className="login-button">로그인</button>
        </form>
        
        <p className="signup-link">
          아이디가 없으신가요? <Link to="/join">회원가입</Link>
        </p>

        {/* <div className="button-group">
          <button className="social-button kakao">카카오</button>
          <button className="social-button google">구글</button>
          <button className="social-button naver">네이버</button>
        </div> */}
        <div>
          <p className='login-Idpwd'>
            <Link to="/id">아이디 찾기</Link>
          </p>
          <p className='login-Idpwd'>
            <Link to="/id">비밀번호 찾기</Link>
          </p>      
        </div>
      </div>

      <Snackbar 
        open={loginSnackbar.open} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={loginSnackbar.severity} 
          sx={{ 
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: loginSnackbar.severity === 'error' ? '#d32f2f' : 
                   loginSnackbar.severity === 'success' ? '#2e7d32' : 
                   loginSnackbar.severity === 'warning' ? '#ed6c02' : '#0288d1',
            '& .MuiAlert-icon': {
              color: loginSnackbar.severity === 'error' ? '#d32f2f' : 
                     loginSnackbar.severity === 'success' ? '#2e7d32' : 
                     loginSnackbar.severity === 'warning' ? '#ed6c02' : '#0288d1'
            },
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px'
          }}
        >
          {loginSnackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Login;
