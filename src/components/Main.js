import React, { useState } from 'react';
import './main.css';

function MainPage() {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleAddComment = () => {
    if (newComment.trim() !== '') {
      setComments([...comments, newComment]);
      setNewComment('');
    }
  };

  return (
    <div className="main-container">
      {/* 왼쪽 포스트 영역 */}
      <div className="post-section">
        <div className="post-header">
          <img className="avatar" src="https://via.placeholder.com/40" alt="avatar" />
          <div className="name-date">
            <div className="name">영지</div>
            <div className="date">2025년 5월 9일</div>
          </div>
        </div>
        <img className="post-image" src="https://via.placeholder.com/600x400" alt="post" />
        <div className="icons">
          <div className="icon">
            <span className="heart">❤️</span>
            <span>좋아요</span>
          </div>
          <div className="icon">
            <span>💬</span>
            <span>댓글</span>
          </div>
        </div>
        <div className="comment-section">
          <div className="comment">
            <input
              type="text"
              value={newComment}
              onChange={handleCommentChange}
              placeholder="댓글을 남겨주세요"
            />
            <button onClick={handleAddComment}>등록</button>
          </div>
          <div>
            {comments.map((comment, index) => (
              <div key={index}>{comment}</div>
            ))}
          </div>
        </div>
      </div>

      {/* 오른쪽 사이드바 영역 */}
      <div className="sidebar">
        <img src="https://via.placeholder.com/300x200" alt="sidebar" />
        <img src="https://via.placeholder.com/300x200" alt="sidebar" />
        <div className="profile-image">
          <img src="https://via.placeholder.com/300x200" alt="profile" />
        </div>
      </div>
    </div>
  );
}

export default MainPage;
