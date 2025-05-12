import React, { useState } from 'react';
import Header from './Header';
import Feed from './Feed';
import { BrowserRouter as Route } from 'react-router-dom';



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
      <div>
          <Feed /> {/* 메인에 미리보기로 포함 */}
        </div>
    </div>
  );
}

export default MainPage;
