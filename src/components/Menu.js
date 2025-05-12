import React from 'react';
import { Link } from 'react-router-dom';
import './menu.css';  // 스타일 파일

function Menu() {
  const sidebarItems = [
    { id: 1, label: '홈', icon: '/uploads/icons/home.svg', link: '/' },
    { id: 2, label: '마이페이지', icon: '/uploads/icons/mypage.svg', link: '/mypage' },
    { id: 3, label: '친구', icon: '/uploads/icons/Friend.svg', link: '/friends' },
    { id: 4, label: '인기 급상승', icon: '/uploads/icons/fire.svg', link: '/trending' },
    { id: 5, label: '피드 게시', icon: '/uploads/icons/add.svg', link: '/feed' },
    { id: 6, label: '내 피드', icon: '/uploads/icons/feed.svg', link: '/myfeed' },
    { id: 7, label: 'DM', icon: '/uploads/icons/msg.svg', link: '/dm' },
  ];

  return (
    <div className="app-container">
      {/* 사이드바 영역 */}
      <div className="sidebar">
        <div className="logo">
          <img src="/uploads/icons/menulogo.svg" alt="Logo" className="sidebar-logo" />
        </div>
        <ul className="sidebar-menu">
          {sidebarItems.map(item => (
            <li key={item.id} className="sidebar-item">
              <Link to={item.link} className="sidebar-link">
                <img src={item.icon} alt={item.label} className="sidebar-icon" />
                <span className="sidebar-text">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="main-content">
        {/* 여기 콘텐츠가 들어갑니다 */}
      </div>
    </div>
  );
}

export default Menu;
