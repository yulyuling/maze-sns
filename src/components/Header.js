import React from 'react';
import './header.css';
import './main.css';
import { useState } from 'react';

function Header() {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const handleCommentChange = (e) => setNewComment(e.target.value);
  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, newComment]);
      setNewComment('');
    }
  };
  return (
    <div className="fb-header">


      <div className="fb-header-search">
        <input type="text" placeholder="검색어를 입력해주세요" />
      </div>

      <div className="fb-header-actions">
        <button className="fb-header-login-btn">
            <img src="/uploads/icons/login.svg" alt="로그인 아이콘" className="fb-login-icon" />
            로그인
        </button>
    </div>
    </div>
  );
}

export default Header;
