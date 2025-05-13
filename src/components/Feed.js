import React, { useState, useEffect } from 'react';
import './feed.css';
import { getTimeAgo } from './time'; // / 경로는 프로젝트 구조에 맞게 수정

function Feed() {
  const [feeds, setFeeds] = useState([]);
  const [displayCount, setDisplayCount] = useState(5);
  const [commentInputs, setCommentInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    fetchFeeds();
  }, []);

  useEffect(() => {
    setDisplayCount(5);
  }, [feeds]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
        if (displayCount < sortedFeeds.length) {
          setDisplayCount((prev) => Math.min(prev + 5, sortedFeeds.length));
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayCount, feeds]);

  const fetchFeeds = async () => {
    try {
      const response = await fetch('http://localhost:3005/feed/list');
      const data = await response.json();
      if (response.ok) {
        console.log(data.feeds);
        setFeeds(data.feeds);
      } else {
        setError(data.message || '피드를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 공개/비공개, 본인만 볼 수 있게
  const visibleFeeds = feeds.filter(
    feed => feed.isPublic === 1 || feed.email === userEmail
  );
  const sortedFeeds = [...visibleFeeds].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const pagedFeeds = sortedFeeds.slice(0, displayCount);

  // 좋아요
  const handleLike = async (postNo) => {
    try {
      const response = await fetch(`http://localhost:3005/feed/like/${postNo}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      if (response.ok) fetchFeeds();
    } catch (err) {
      alert('좋아요 처리 실패');
    }
  };

  // 댓글 입력 핸들러 (feed별로)
  const handleCommentInput = (postNo, value) => {
    setCommentInputs((prev) => ({ ...prev, [postNo]: value }));
  };

  // 댓글 작성
  const handleCommentSubmit = async (e, postNo) => {
    e.preventDefault();
    const comment = commentInputs[postNo];
    if (!comment || !comment.trim()) return;
    try {
      const response = await fetch(`http://localhost:3005/feed/comment/${postNo}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, comment })
      });
      if (response.ok) {
        setCommentInputs((prev) => ({ ...prev, [postNo]: '' }));
        fetchFeeds();
      }
    } catch (err) {
      alert('댓글 작성 실패');
    }
  };

  if (loading) return <div className="feed-loading">로딩 중...</div>;
  if (error) return <div className="feed-error">{error}</div>;
  if (visibleFeeds.length === 0) return <div className="feed-empty">표시할 피드가 없습니다.</div>;

  return (
    <div className="feed-main-list">
      {feeds.map((feed) => {
        const isOwner = feed.email === userEmail;
        return (
          <div key={feed.postNo} className="feed-main-card">
            {/* 상단: 프로필/공개설정/작성일 */}
            <div className="feed-main-profile-row">
              <img
                src={feed.profileImage ? `http://localhost:3005${feed.profileImage}` : "/uploads/default-profile.png"}
                alt="프로필"
                className="feed-main-avatar"
              />
              <div className="feed-main-info">
                <h3>{feed.userNickname} <span>{getTimeAgo(feed.createdAt)}</span></h3>
                <p>{feed.bio || ''}</p>
                <div className={`myfeed-visibility${!isOwner ? ' not-owner' : ''}`}>
                  {isOwner ? (
                    <select
                      value={feed.isPublic}
                      onChange={async (e) => {
                        const newValue = Number(e.target.value);
                        try {
                          const response = await fetch(`http://localhost:3005/feed/visibility/${feed.postNo}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ isPublic: newValue })
                          });
                          if (response.ok) fetchFeeds();
                        } catch {
                          alert('공개설정 변경 실패');
                        }
                      }}
                      className="myfeed-visibility-select"
                    >
                      <option value={1}>전체공개</option>
                      <option value={0}>비공개</option>
                    </select>
                  ) : (
                    <span className={`visibility-label ${feed.isPublic ? 'public' : 'private'}`}>
                      {feed.isPublic ? '전체공개' : '비공개'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* 하단: 사진 | 댓글 */}
            <div className="feed-main-content-row">
              {/* 왼쪽: 사진/본문 */}
              <div
                className="feed-main-photo"
                style={{
                  backgroundImage: `url(${feed.imageUrl})`,
                  backgroundColor: '#eaf6fd'
                }}
              >
                <div className='feed-main-desc-wrapper'>
                  <div className="feed-main-desc">{feed.content}</div>
                </div>
              </div>
              {/* 오른쪽: 좋아요/댓글 */}
              <div className="feed-main-interact">
                <div className="feed-main-icons">
                  <button onClick={() => handleLike(feed.postNo)} className="like-button">
                    ❤️ {feed.likes}
                  </button>
                  <span>💬 {feed.comments?.length || 0}</span>
                </div>
                <div className="feed-main-comments">
                  {feed.comments?.map((comment) => (
                    <div key={comment.commentNo} className="feed-main-comment">
                      <strong>{comment.userNickname}</strong>: {comment.content}
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <form onSubmit={(e) => handleCommentSubmit(e, feed.postNo)} className="comment-form">
                  <input
                    type="text"
                    value={commentInputs[feed.postNo] || ''}
                    onChange={(e) => handleCommentInput(feed.postNo, e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    className="comment-input"
                  />
                  <button type="submit" className="comment-submit">작성</button>
                </form>
              </div>
            </div>
          </div>
        );
      })}
      {displayCount < sortedFeeds.length ? (
        <div className="feed-loading-more">스크롤하면 더 불러옵니다...</div>
      ) : (
        <div className="feed-end">마지막 피드입니다.</div>
      )}
    </div>
  );
}

export default Feed;
