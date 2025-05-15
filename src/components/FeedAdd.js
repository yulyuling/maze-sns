import React, { useState, useEffect, useRef } from 'react';
import './feedadd.css';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router-dom';

function FeedAdd() {
  const [selectedColor, setSelectedColor] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewImages, setPreviewImages] = useState([]);
  const userEmail = localStorage.getItem('userEmail');
  const [userInfo, setUserInfo] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [content, setContent] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) return;
    fetch(`http://localhost:3005/user/info?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.user) setUserInfo(data.user);
      });
  }, []);

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
    setImageFiles(files);
  };

  const handleSubmit = async () => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!content) {
      alert('내용을 입력하세요.');
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('content', content);
    formData.append('tags', JSON.stringify(tags));

    // 이미지 여러 장 업로드
    for (let i = 0; i < imageFiles.length; i++) {
      formData.append('file', imageFiles[i]); // name="file"로!
    }

    const res = await fetch('http://localhost:3005/feed', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (res.ok) {
      alert('피드가 등록되었습니다!');
      navigate('/main'); // 홈으로 이동
    } else {
      alert(data.message || '피드 등록 실패');
    }
  };

  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      let newTag = tagInput.trim();
      // #이 없으면 자동으로 붙이기
      if (!newTag.startsWith('#')) {
        newTag = '#' + newTag;
      }
      if (newTag.length > 1 && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (removeIdx) => {
    setTags(tags.filter((_, idx) => idx !== removeIdx));
  };

  return (
    <div className="feed-add-container">
      <div className="profile-section">
        <div className="profile-picture">
          <img
            src={
              userInfo && userInfo.profileImage
                ? `http://localhost:3005${userInfo.profileImage}`
                : '/uploads/default-profile.png'
            }
            alt="Profile"
          />
        </div>
        <div className="profile-name">
          {userInfo ? userInfo.userNickname : '사용자 이름'}
        </div>
      </div>
      <div className="comment-section">
        <div
          className="comment-input"
          contentEditable
          suppressContentEditableWarning
          onInput={e => setContent(e.currentTarget.textContent)}
          
          placeholder="게시글을 작성해 주세요"
        ></div>
      </div>
      <div className="color-selection">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <input
            type="file"
            id="image-upload"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <label htmlFor="image-upload">
            <button
              type="button"
              className="color-title"
              onClick={() => fileInputRef.current.click()}
            >
              이미지 업로드
            </button>
          </label>
          <span style={{ color: '#555', fontSize: '15px' }}>
            {fileInputRef.current && fileInputRef.current.files.length > 0
              ? fileInputRef.current.files[0].name
              : '선택된 파일 없음'}
          </span>
        </div>
        <div className="image-preview-row">
          {previewImages.map((img, idx) => (
            <div className="image-preview-box" key={idx}>
              <img src={img} alt={`미리보기 ${idx + 1}`} />
            </div>
          ))}
        </div>
      </div>
      <div className="feedadd-tag-section">
        <input
          className="feedadd-tag-input"
          placeholder="태그를 입력하세요 (예: #여행 #맛집)"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
        />
        <div className="feedadd-tag-list">
          {tags.map((tag, idx) => (
            <span className="feedadd-tag-pill" key={idx}>
              {tag}
              <span className="feedadd-tag-remove" onClick={() => removeTag(idx)}>×</span>
            </span>
          ))}
        </div>
      </div>
      <div className="action-buttons">
        <button className="save-btn" onClick={handleSubmit}>등록</button>
      </div>
    </div>
  );
}

export default FeedAdd;
