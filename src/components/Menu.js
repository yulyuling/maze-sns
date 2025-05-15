import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './menu.css';  // 스타일 파일
import { ReactComponent as HomeIcon } from '../uploads/icons/home.svg';
import { ReactComponent as MypageIcon } from '../uploads/icons/mypage.svg';
import { ReactComponent as FriendIcon } from '../uploads/icons/Friend.svg';
import { ReactComponent as FireIcon } from '../uploads/icons/fire.svg';
import { ReactComponent as AddIcon } from '../uploads/icons/add.svg';
import { ReactComponent as FeedIcon } from '../uploads/icons/feed.svg';
import { ReactComponent as MsgIcon } from '../uploads/icons/msg.svg';

function Menu() {
  const location = useLocation();
  const sidebarItems = [
    { id: 1, label: '홈', icon: HomeIcon, link: '/main', color: '#7EBBE8' },
    { id: 2, label: '마이페이지', icon: MypageIcon, link: '/mypage', color: '#7EBBE8' },
    { id: 3, label: '친구', icon: FriendIcon, link: '/friends', color: '#7EBBE8' },
    { id: 4, label: '인기 급상승', icon: FireIcon, link: '/trending', color: '#7EBBE8' },
    { id: 5, label: '피드 게시', icon: AddIcon, link: '/feedadd', color: '#7EBBE8' },
    { id: 6, label: '내 피드', icon: FeedIcon, link: '/myfeed', color: '#7EBBE8' },
    { id: 7, label: 'DM', icon: MsgIcon, link: '/dm', color: '#7EBBE8' },
  ];



  return (
    <div className="app-container">
      {/* 사이드바 영역 */}
      <div className="sidebar">
        <div className="logo">
          <img src="/uploads/logo2.png" alt="Logo" className="sidebar-logo" />
        </div>
        <ul className="sidebar-menu">
          {sidebarItems.map(item => {
            const isActive = location.pathname === item.link;
            return (
              <li key={item.id} className={`sidebar-item${isActive ? ' active' : ''}`}>
                <Link to={item.link} className="sidebar-link">
                  <item.icon
                    className="sidebar-icon"
                    style={{ color: isActive ? '#1E699E' : item.color }}
                  />
                  <span className="sidebar-text">{item.label}</span>
                </Link>
              </li>
            );
          })}
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
