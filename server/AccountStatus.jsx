import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

export default AccountStatus; 