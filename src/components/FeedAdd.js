import React, { useState, useEffect } from 'react';
import './feedadd.css';

function FeedAdd() {
  const [selectedColor, setSelectedColor] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewImages, setPreviewImages] = useState([]);
  const userEmail = localStorage.getItem('userEmail');
  const [userInfo, setUserInfo] = useState(null);
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [imageFiles, setImageFiles] = useState([]);

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
    formData.append('tags', tags);

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
      // 입력값 초기화 등
    } else {
      alert(data.message || '피드 등록 실패');
    }
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
        <textarea
          className="comment-input"
          placeholder="게시글을 작성해 주세요"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
      </div>
      <div className="color-selection">
        <label className="image-upload-label">
          <input
            type="file"
            name="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />
          <span className="color-title">이미지 업로드</span>
        </label>
        <div className="image-preview-row">
          {previewImages.map((img, idx) => (
            <div className="image-preview-box" key={idx}>
              <img src={img} alt={`미리보기 ${idx + 1}`} />
            </div>
          ))}
        </div>
      </div>
      <div className="tag-section">
        <input
          className="tag-input"
          placeholder="태그를 입력하세요 (예: #여행 #맛집)"
          value={tags}
          onChange={e => setTags(e.target.value)}
        />
      </div>
      <div className="action-buttons">
        <button className="save-btn" onClick={handleSubmit}>등록</button>
      </div>
    </div>
  );
}

export default FeedAdd;
