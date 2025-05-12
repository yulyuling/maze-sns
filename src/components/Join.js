import './join.css';  // join.css 파일 import
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


function Join() {
  const [emailCheckMessage, setEmailCheckMessage] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userName: '',
    userNickname: ''
  });


  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const res = await fetch('http://localhost:3005/api/join', {
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

      <form  className="join-box" onSubmit={handleSubmit}>
        <h4 className="join-title">회원가입</h4>
        
        <div className="input-group">
          <input
            type="text"
            name="email"
            placeholder="이메일"
            className="join-input"
            onChange={handleChange}
            value={form.email}
          />
          <button type="button" className="pwdid-button" onClick={handleEmailCheck}>중복체크</button>
        </div>
        {/* 중복체크 결과 표시 */}
          {emailCheckMessage && <p style={{ fontSize: '14px', color: '#555' }}>{emailCheckMessage}</p>}
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

        <div>
          <input
            type="password"
            name="confirmPassword"
            placeholder="비밀번호 확인"
            className="join-input"
            onChange={handleChange}
            required
          />
          <button className="pwdid-button">중복체크</button>
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
