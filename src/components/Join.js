import './join.css';  // join.css 파일 import
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';

function Join() {
  const [emailCheckMessage, setEmailCheckMessage] = useState('');
  const [emailSnackbar, setEmailSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [passwordSnackbar, setPasswordSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userName: '',
    userNickname: ''
  });

  const handleCloseEmailSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setEmailSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleClosePasswordSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setPasswordSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value
    }));
  };

  const handleEmailCheck = async () => {
    const { email } = form;
    if (!email) {
      setEmailSnackbar({
        open: true,
        message: '이메일을 입력해주세요.',
        severity: 'warning'
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:3005/join/check-email?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error('서버 응답이 올바르지 않습니다.');
      }
      const data = await response.json();
      
      setEmailSnackbar({
        open: true,
        message: data.message,
        severity: data.exists ? 'error' : 'success'
      });
      
    } catch (error) {
      setEmailSnackbar({
        open: true,
        message: '서버 오류가 발생했습니다.',
        severity: 'error'
      });
      console.error('이메일 중복 체크 오류:', error);
    }
  };

  const handlePasswordCheck = () => {
    if (!form.password) {
      setPasswordSnackbar({
        open: true,
        message: '비밀번호를 입력해주세요.',
        severity: 'warning'
      });
      return;
    }
    if (!form.confirmPassword) {
      setPasswordSnackbar({
        open: true,
        message: '비밀번호 확인을 입력해주세요.',
        severity: 'warning'
      });
      return;
    }

    if (form.password === form.confirmPassword) {
      setPasswordSnackbar({
        open: true,
        message: '비밀번호가 일치합니다.',
        severity: 'success'
      });
    } else {
      setPasswordSnackbar({
        open: true,
        message: '비밀번호가 일치하지 않습니다.',
        severity: 'error'
      });
    }
  };

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
        setForm((prevForm) => ({
      ...prevForm,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const res = await fetch('http://localhost:3005/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    if (res.status === 200) {
      alert(data.message);
      navigate('/login'); // 리디렉션
    } else {
      alert(data.message);
    }
  };
  return (
    <div className="join-container"
      style={{ backgroundImage: "url('/uploads/join.png')",
      backgroundSize: '40%', 
      backgroundPosition: '600px 200px',
    }}>
      <div className="logo-container">
        <img src="/uploads/logo2.png" alt="Logo" className="login-logo" />
      </div>

      <form className="join-box" onSubmit={handleSubmit}>
        <h4 className="join-title">회원가입</h4>
        
        <div className="input-group" style={{ position: 'relative' }}>
          <input
            type="text"
            name="email"
            placeholder="이메일"
            className="join-input"
            onChange={handleChange}
            value={form.email}
          />
          <button type="button" className="pwdid-button" onClick={handleEmailCheck}>중복체크</button>
          <Snackbar 
            open={emailSnackbar.open} 
            autoHideDuration={3000} 
            onClose={handleCloseEmailSnackbar}
            sx={{ 
              position: 'absolute',
              top: '100%',
              width: '100%',
              zIndex: 1000
            }}
          >
            <Alert 
              onClose={handleCloseEmailSnackbar} 
              severity={emailSnackbar.severity} 
              sx={{ 
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: emailSnackbar.severity === 'error' ? '#d32f2f' : 
                       emailSnackbar.severity === 'success' ? '#2e7d32' : 
                       emailSnackbar.severity === 'warning' ? '#ed6c02' : '#0288d1',
                '& .MuiAlert-icon': {
                  color: emailSnackbar.severity === 'error' ? '#d32f2f' : 
                         emailSnackbar.severity === 'success' ? '#2e7d32' : 
                         emailSnackbar.severity === 'warning' ? '#ed6c02' : '#0288d1'
                },
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                borderRadius: '8px'
              }}
            >
              {emailSnackbar.message}
            </Alert>
          </Snackbar>
        </div>
        <div>
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            className="join-input"
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ position: 'relative' }}>
          <input
            type="password"
            name="confirmPassword"
            placeholder="비밀번호 확인"
            className="join-input"
            onChange={handleChange}
            required
          />
          <button type="button" className="pwdid-button" onClick={handlePasswordCheck}>중복체크</button>
          <Snackbar 
            open={passwordSnackbar.open} 
            autoHideDuration={3000} 
            onClose={handleClosePasswordSnackbar}
            sx={{ 
              position: 'absolute',
              top: '100%',
              width: '100%',
              zIndex: 1000
            }}
          >
            <Alert 
              onClose={handleClosePasswordSnackbar} 
              severity={passwordSnackbar.severity} 
              sx={{ 
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: passwordSnackbar.severity === 'error' ? '#d32f2f' : 
                       passwordSnackbar.severity === 'success' ? '#2e7d32' : 
                       passwordSnackbar.severity === 'warning' ? '#ed6c02' : '#0288d1',
                '& .MuiAlert-icon': {
                  color: passwordSnackbar.severity === 'error' ? '#d32f2f' : 
                         passwordSnackbar.severity === 'success' ? '#2e7d32' : 
                         passwordSnackbar.severity === 'warning' ? '#ed6c02' : '#0288d1'
                },
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                borderRadius: '8px'
              }}
            >
              {passwordSnackbar.message}
            </Alert>
          </Snackbar>
        </div>

        <div>
          <input
            type="text"
            name="userName"
            placeholder="이름"
            className="join-input"
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <input
            type="text"
            name="userNickname"
            placeholder="닉네임"
            className="join-input"
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <button type="submit" className="join-button">회원가입</button>
        </div>

        <div>
          <p className="signup-link">
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </p>
        </div>
{/* 
        <div className="button-group">
          <button className="social-button kakao">카카오</button>
          <button className="social-button google">구글</button>
          <button className="social-button naver">네이버</button>
        </div> */}

        {/* <div>
          <p className="login-Idpwd">
            <Link to="/id">아이디 찾기</Link>
          </p>
          <p className="login-Idpwd">
            <Link to="/id">비밀번호 찾기</Link>
          </p>      
        </div> */}
      </form>
    </div>
  );
}

export default Join;
