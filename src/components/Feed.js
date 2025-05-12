import React, { useState } from 'react';
import './feed.css';

const mockFeeds = [
  {
    id: 1,
    title: '과제',
    description: '오늘은 쉰 하루용?',
    image: '/uploads/sample1.png',
    likes: 10,
    comments: [
      { id: 'user1', text: '귀여워요' },
      { id: 'user2', text: '세이 정답...' },
      { id: 'user3', text: '오늘날짜고 오늘도 그거 아닌가?' },
      { id: 'user4', text: 'ㅋㅋㅋㅋ' },
    ],
  },
  {
    id: 2,
    title: '머더',
    description: '',
    image: '/uploads/sample2.png',
    likes: 3,
    comments: [],
  },
  {
    id: 3,
    title: '노력글',
    description: '',
    image: '/uploads/sample3.png',
    likes: 5,
    comments: [],
  },
];

function Feed() {
  const [selectedFeed, setSelectedFeed] = useState(mockFeeds[0]);

  return (
    <div className="feed-layout">
    <div className="myfeed-main">
        {/* 왼쪽 영역 (프로필 + 피드 내용) */}
        <div className="myfeed-left">
          <div className="myfeed-profile">
            <img src="/uploads/profile.png" alt="프로필" className="myfeed-avatar" />
            <div className="myfeed-info">
              <h3>양파 쿵야</h3>
              <p>오늘의 일은 내일의 내가 하는 법</p>
              <span>2025.05.07 15:36</span>
            </div>
          </div>

          <div className="myfeed-detail">
            <div className="myfeed-photo">
              <img src={selectedFeed.image} alt={selectedFeed.title} />
              <div className="myfeed-desc">{selectedFeed.description}</div>
            </div>

            <div className="myfeed-interact">
              <div className="myfeed-icons">
                ❤️ {selectedFeed.likes} &nbsp;&nbsp; 💬 {selectedFeed.comments.length}
              </div>
              <div className="myfeed-comments">
                {selectedFeed.comments.map((c, i) => (
                  <div key={i} className="myfeed-comment">
                    <strong>{c.id}</strong>: {c.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    <div className="myfeed-thumbnails-wrapper"> {/* 오른쪽 썸네일 */}
        <div className="myfeed-thumbnails">
          {mockFeeds.map((feed) => (
            <img
              key={feed.id}
              src={feed.image}
              alt={feed.title}
              className="myfeed-thumb"
              onClick={() => setSelectedFeed(feed)}
            />
          ))}
        </div>
      </div>
  </div>
  );
}

export default Feed;
