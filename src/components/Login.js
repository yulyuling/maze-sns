import React from 'react';
import { Link } from 'react-router-dom';
import './login.css';  // CSS 파일 import

function Login() {
  return (
    <div className="login-container"
      style={{ backgroundImage: "url('/uploads/login.png')",
      backgroundSize: '35%', 
      backgroundPosition: '550px 300px',
    }}>

      <div className="logo-container">
        <img src="/uploads/logo2.png" alt="Logo" className="login-logo" />
      </div>
      <div>
        <h4 className="login-title">로그인</h4>
      </div>
      <div className="login-box">
        
        <input
          type="text"
          placeholder="아이디"
          className="login-input"
        />
        <input
          type="password"
          placeholder="비밀번호"
          className="login-input"
        />
        
        <button className="login-button">로그인</button>
        
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
            <Link to="/id">비밀번호</Link>
          </p>      
        </div>
      </div>
    </div>
  );
}

export default Login;
