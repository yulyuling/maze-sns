import React, { useState, useEffect } from 'react';
import './mypage.css';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';

// 계정 정보 수정 컴포넌트
function AccountInfo() {
  const [userInfo, setUserInfo] = useState(null);
  const [edit, setEdit] = useState({
    userNickname: '',
    email: '',
    bio: ''
  });
  const [previewImg, setPreviewImg] = useState(null);
  const [selectedImg, setSelectedImg] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      navigate('/login');
      return;
    }
    fetch(`http://localhost:3005/user/info?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.isLogin) {
          setUserInfo(data.user);
          setEdit({
            userNickname: data.user.userNickname || '',
            email: data.user.email || '',
            bio: data.user.bio || ''
          });
        } else {
          navigate('/login');
        }
      });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEdit(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (field) => {
    const email = localStorage.getItem('userEmail');
    let updateData = { email };
    if (field === 'userNickname') updateData.userNickname = edit.userNickname;
    if (field === 'bio') updateData.bio = edit.bio;
    if (field === 'email') updateData.newEmail = edit.email;

    try {
      const response = await fetch('http://localhost:3005/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const data = await response.json();
      if (response.ok) {
        alert('정보가 수정되었습니다.');
        setUserInfo(prev => ({
          ...prev,
          ...updateData.userNickname && { userNickname: edit.userNickname },
          ...updateData.bio && { bio: edit.bio },
          ...updateData.newEmail && { email: edit.email }
        }));
        if (field === 'email') localStorage.setItem('userEmail', edit.email);
      } else {
        alert(data.message || '수정 실패');
      }
    } catch (err) {
      alert('서버 오류');
    }
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImg(URL.createObjectURL(file));
      setSelectedImg(file);
    }
  };

  const handleImgSave = () => {
    if (!selectedImg) {
      alert('이미지를 선택하세요.');
      return;
    }
    const formData = new FormData();
    formData.append('profileImage', selectedImg);
    formData.append('email', edit.email);

    fetch('http://localhost:3005/user/upload/profileImage', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.profileImage) {
          setUserInfo(prev => ({
            ...prev,
            profileImage: data.profileImage
          }));
          setSelectedImg(null);
          alert('프로필 이미지가 변경되었습니다.');
        } else {
          alert(data.message || '업로드 실패');
        }
      });
  };

  if (!userInfo) return null;

  return (
    <div className="mypage-main">
      <div className="mypage-profile-card">
        <div className="mypage-profile-row">
          <div className="mypage-profile-img-container">
            <img
              className="mypage-profile-img"
              src={
                previewImg
                  ? previewImg
                  : userInfo && userInfo.profileImage
                    ? `http://localhost:3005${userInfo.profileImage}`
                    : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
              }
              alt="프로필"
              onClick={() => document.getElementById('profileImgInput').click()}
            />
            {selectedImg ? (
              <button 
                className="mypage-edit-img-btn"
                onClick={handleImgSave}
              >
                저장
              </button>
            ) : (
              <label htmlFor="profileImgInput" className="mypage-edit-img-btn">
                변경
              </label>
            )}
          </div>
          <input
            id="profileImgInput"
            type="file"
            style={{ display: "none" }}
            onChange={handleImgChange}
          />

          <div className="mypage-profile-info">
            <div className="mypage-profile-name">
              {userInfo.userName}
            </div>
            <div className="mypage-profile-nickname">
              {edit.userNickname}
            </div>
            <div className="mypage-profile-label">
              팔로우 <b>3</b> &nbsp;&nbsp;|&nbsp;&nbsp; 팔로워 <b>5</b>
            </div>
            <div className="mypage-profile-desc" style={{marginTop: 10}}>
              {edit.bio || '자기소개'}
            </div>
          </div>
        </div>
      </div>
      <div className="mypage-edit-box">
        <div className="mypage-edit-title">계정 정보 수정</div>
        <div className="mypage-edit-row">
          <label>닉네임</label>
          <input
            type="text"
            name="userNickname"
            value={edit.userNickname}
            onChange={handleChange}
          />
          <button onClick={() => handleSave('userNickname')}>확인</button>
        </div>
        <div className="mypage-edit-row">
          <label>이메일</label>
          <input
            type="text"
            name="email"
            value={edit.email}
            onChange={handleChange}
          />
          <button onClick={() => handleSave('email')}>변경</button>
        </div>
        <div className="mypage-edit-row">
          <label>자기소개</label>
          <input
            type="text"
            name="bio"
            value={edit.bio}
            onChange={handleChange}
          />
          <button onClick={() => handleSave('bio')}>변경</button>
        </div>
      </div>


    </div>
  );
}

// 계정 상태 수정 컴포넌트
function AccountStatus() {
  const [isPrivate, setIsPrivate] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      navigate('/login');
      return;
    }
    // 사용자 상태 정보 가져오기
    fetch(`http://localhost:3005/user/info?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.isLogin && data.user) {
          setIsPrivate(data.user.isPrivate === 1);
          setIsActive(data.user.isActive === 1);
        } else {
          navigate('/login');
        }
      });
  }, [navigate]);

  const handlePrivacyChange = async () => {
    const email = localStorage.getItem('userEmail');
    try {
      const response = await fetch('http://localhost:3005/user/update/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          isPrivate: !isPrivate
        })
      });
      const data = await response.json();
      if (response.ok) {
        setIsPrivate(!isPrivate);
        alert(isPrivate ? '계정이 공개로 변경되었습니다.' : '계정이 비공개로 변경되었습니다.');
      } else {
        alert(data.message || '설정 변경 실패');
      }
    } catch (err) {
      alert('서버 오류가 발생했습니다.');
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('계정을 비활성화하시겠습니까?\n비활성화된 계정은 관리자에게 문의하여 재활성화할 수 있습니다.')) {
      return;
    }
    const email = localStorage.getItem('userEmail');
    try {
      const response = await fetch('http://localhost:3005/user/update/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          isActive: false
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert('계정이 비활성화되었습니다.');
        localStorage.removeItem('userEmail');
        navigate('/login');
      } else {
        alert(data.message || '계정 비활성화 실패');
      }
    } catch (err) {
      alert('서버 오류가 발생했습니다.');
    }
  };

  return (
    <div className="mypage-main">
      <div className="mypage-status-box">
        <div className="mypage-status-row">
          <span className="mypage-status-label">계정 공개 설정</span>
          <label className="mypage-switch">
            <input
              type="checkbox"
              checked={!isPrivate}
              onChange={handlePrivacyChange}
            />
            <span className="mypage-slider"></span>
          </label>
        </div>
        <span className={`mypage-status-desc${isPrivate ? ' private' : ''}`}>
          {isPrivate ? "비공개 상태" : "공개 상태"}
        </span>
        <div className="mypage-status-row">
          <span className="mypage-status-label">계정 비활성화</span>
          <button 
            className="mypage-status-btn"
            onClick={handleDeactivate}
          >
            비활성화
          </button>
        </div>
        <span className="mypage-status-desc" style={{fontSize: '0.9em', color: '#666'}}>
          * 계정 비활성화 시 모든 활동이 중단되며, 재활성화는 관리자에게 문의해야 합니다.
        </span>
      </div>
    </div>
  );
}

// 차단 기능 수정 컴포넌트
function BlockSettings() {
  return (
    <div className="mypage-main">
      <div className="mypage-edit-box">
        <div className="mypage-edit-title">차단 기능 수정</div>
        {/* 차단 기능 수정 내용 */}
      </div>
    </div>
  );
}

function MyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('userEmail');
    fetch('http://localhost:3005/user/logout', { method: 'POST' })
      .then(() => {
        navigate('/login');
      });
  };

  return (
    <div className="mypage-container">
      <div className="mypage-content">
        <div className="mypage-side">
          <div className="mypage-side-title">계정 정보 수정</div>
          <ul>
            <li 
              className={location.pathname === '/mypage' ? 'active' : ''}
              onClick={() => navigate('/mypage')}
            >
              계정 정보 수정
            </li>
            <li 
              className={location.pathname === '/mypage/status' ? 'active' : ''}
              onClick={() => navigate('/mypage/status')}
            >
              계정 상태 수정
            </li>
            {/* <li 
              className={location.pathname === '/mypage/block' ? 'active' : ''}
              onClick={() => navigate('/mypage/block')}
            >
              차단 기능 수정
            </li> */}
          </ul>
          <div className="mypage-side-title" style={{marginTop: 40}}>회원 탈퇴</div>
          <div className="mypage-side-link" onClick={handleLogout}>로그아웃</div>
        </div>
        <Routes>
          <Route path="/" element={<AccountInfo />} />
          <Route path="/status" element={<AccountStatus />} />
          <Route path="/block" element={<BlockSettings />} />
        </Routes>
      </div>
    </div>
  );
}

export default MyPage;
