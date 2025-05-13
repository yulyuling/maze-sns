import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './header.css';
import './main.css';

function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    // 페이지 로드 시 로그인 상태 확인
    const email = localStorage.getItem('userEmail');
    setIsLoggedIn(!!email);
  }, []);

  const handleCommentChange = (e) => setNewComment(e.target.value);
  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, newComment]);
      setNewComment('');
    }
  };

  const handleAuthClick = () => {
    if (isLoggedIn) {
      // 로그아웃 처리
      localStorage.removeItem('userEmail');
      setIsLoggedIn(false);
      navigate('/main');
    } else {
      // 로그인 페이지로 이동
      navigate('/login');
    }
  };

  return (
    <div className="fb-header">
      <div className="fb-header-search">
        <input type="text" placeholder="검색어를 입력해주세요" />
      </div>

      <div className="fb-header-actions">
        <button 
          className="fb-header-login-btn"
          onClick={handleAuthClick}
        >
          <img 
            src={isLoggedIn ? "/uploads/icons/logout.svg" : "/uploads/icons/login.svg"} 
            alt={isLoggedIn ? "로그아웃 아이콘" : "로그인 아이콘"} 
            className="fb-login-icon" 
          />
          {isLoggedIn ? '로그아웃' : '로그인'}
        </button>
      </div>
    </div>
  );
}

export default Header;
