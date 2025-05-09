import React from 'react';
import { Link } from 'react-router-dom';
import './join.css';  // join.css 파일 import

function Join() {
  return (
    <div className="join-container"
      style={{ backgroundImage: "url('/uploads/join.png')",
      backgroundSize: '40%', 
      backgroundPosition: '600px 200px',
    }}>
      
      <div className="logo-container">
        <img src="/uploads/logo2.png" alt="Logo" className="login-logo" />
      </div>

      <div className="join-box">
        <h4 className="join-title">회원가입</h4>
        
        <div className="input-group">
          <input
            type="text"
            placeholder="아이디"
            className="join-input"
          />
          <button className="pwdid-button">중복체크</button>
        </div>

        <div>
          <input
            type="password"
            placeholder="비밀번호"
            className="join-input"
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="비밀번호 확인"
            className="join-input"
          />
          <button className="pwdid-button">중복체크</button>
        </div>

        <div>
          <input
            type="text"
            placeholder="이름"
            className="join-input"
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="닉네임"
            className="join-input"
          />
        </div>

        <div>
          <button className="join-button">회원가입</button>
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
      </div>
    </div>
  );
}

export default Join;
