import React, { useState, useEffect } from 'react';
import './feed.css';
import { getTimeAgo } from './time'; // / 경로는 프로젝트 구조에 맞게 수정
import { Select, MenuItem, FormControl } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function Feed() {
  const [feeds, setFeeds] = useState([]);
  const [displayCount, setDisplayCount] = useState(5);
  const [commentInputs, setCommentInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userEmail = localStorage.getItem('userEmail');
  const [replyInputs, setReplyInputs] = useState({});
  const [openReply, setOpenReply] = useState({});
  const [commentConfirmOpen, setCommentConfirmOpen] = useState(false);
  const [pendingComment, setPendingComment] = useState({ postNo: null, comment: '' });
  const [replyConfirmOpen, setReplyConfirmOpen] = useState(false);
  const [pendingReply, setPendingReply] = useState({ postNo: null, commentNo: null, reply: '' });


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
  const handleReplyToggle = (commentNo) => {
    setOpenReply(prev => ({
      ...prev,
      [commentNo]: !prev[commentNo]
    }));
  };
  const handleReplyInput = (commentNo, value) => {
    setReplyInputs(prev => ({
      ...prev,
      [commentNo]: value
    }));
  };
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
  const handleCommentSubmit = (e, postNo) => {
    e.preventDefault();
    const comment = commentInputs[postNo];
    if (!comment || !comment.trim()) return;
    setPendingComment({ postNo, comment });
    setCommentConfirmOpen(true);
  };

  const handleReplySubmit = (e, postNo, commentNo) => {
    e.preventDefault();
    const reply = replyInputs[commentNo];
    if (!reply || !reply.trim()) return;
    setPendingReply({ postNo, commentNo, reply });
    setReplyConfirmOpen(true);
  };

  const doSubmitComment = async () => {
    const { postNo, comment } = pendingComment;
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
    } finally {
      setCommentConfirmOpen(false);
      setPendingComment({ postNo: null, comment: '' });
    }
  };

  const doSubmitReply = async () => {
    const { postNo, commentNo, reply } = pendingReply;
    try {
      const response = await fetch(`http://localhost:3005/feed/reply/${postNo}/${commentNo}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, reply })
      });
      if (response.ok) {
        setReplyInputs(prev => ({ ...prev, [commentNo]: '' }));
        setOpenReply(prev => ({ ...prev, [commentNo]: false }));
        fetchFeeds();
      }
    } catch (err) {
      alert('대댓글 작성 실패');
    } finally {
      setReplyConfirmOpen(false);
      setPendingReply({ postNo: null, commentNo: null, reply: '' });
    }
  };

  if (loading) return <div className="feed-loading">로딩 중...</div>;
  if (error) return <div className="feed-error">{error}</div>;
  if (visibleFeeds.length === 0) return <div className="feed-empty">표시할 피드가 없습니다.</div>;

  return (
    <div className="feed-main-list">
      {visibleFeeds.map((feed) => {
        const isOwner = feed.email === userEmail;
        const totalComments =
          (feed.comments?.length || 0) +
          (feed.comments?.reduce((acc, comment) => acc + (comment.replies?.length || 0), 0) || 0);
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ margin: 0 }}>{feed.userNickname}</h3>
                  <span style={{ fontSize: 12, color: '#888' }}>{getTimeAgo(feed.createdAt)}</span>
                </div>
                <p>{feed.bio || ''}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, color: '#888' }}>공개설정</span>
                  <div className={`myfeed-visibility${!isOwner ? ' not-owner' : ''}`}>
                    {isOwner ? (
                      <FormControl
                        size="small"
                        sx={{
                          minWidth: 90,
                          background: '#fff',
                          borderRadius: '6px',
                          boxShadow: '0 2px 8px rgba(126, 187, 232, 0.12)',
                          '.MuiOutlinedInput-notchedOutline': { borderColor: '#7EBBE8', borderRadius: '6px' },
                          '.MuiSelect-select': { padding: '8px 28px 8px 10px' }
                        }}
                      >
                        <Select
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
                          displayEmpty
                          inputProps={{ 'aria-label': '공개설정' }}
                        >
                          <MenuItem value={1}>전체공개</MenuItem>
                          <MenuItem value={0}>비공개</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <span className={`visibility-label ${feed.isPublic ? 'public' : 'private'}`}>
                        {feed.isPublic ? '전체공개' : '비공개'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* 하단: 사진 | 댓글 */}
            <div className="feed-main-content-row">
              {/* 왼쪽: 사진/본문 */}
              <div
                className="feed-main-photo"
                style={{
                  backgroundImage: `url(${
                    feed.imageUrl
                      ? feed.imageUrl.startsWith('http')
                        ? feed.imageUrl
                        : `http://localhost:3005${feed.imageUrl}`
                      : '/uploads/default-image.png'
                  })`
                }}
              >
              </div>
                
              {/* 오른쪽: 좋아요/댓글 */}
              <div className="feed-main-interact">
                <div className="feed-main-icons">
                  <button
                    onClick={() => {
                      if (!userEmail) {
                        alert('로그인 후 이용 가능합니다.');
                        return;
                      }
                      handleLike(feed.postNo);
                    }}
                    className="like-button"
                    disabled={!userEmail}
                  >
                    <img src={"uploads/icons/like.png"} alt="좋아요" /> {feed.likes}
                  </button>
                  <span> <img src={"uploads/icons/comment.png"} alt="댓글" /> {totalComments}</span>
                </div>
                <div className="feed-main-comments">
                  {feed.comments?.map((comment) => (
                    <div key={comment.commentNo} className="feed-main-comment">
                      {/* 댓글 본문 (클릭 시 대댓글 입력창 토글) */}
                      <div
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleReplyToggle(comment.commentNo)}
                        title="대댓글 달기"
                      >
                        <strong>{comment.userNickname}</strong> {comment.content}
                        <span className="comment-date">
                          {getTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      {/* 대댓글 리스트 */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="feed-main-replies">
                          {comment.replies.map(reply => (
                            <div key={reply.replyNo} className="feed-main-reply">
                              <strong>{reply.userNickname}</strong> {reply.content}
                              <span className="comment-date">
                                {getTimeAgo(reply.createdAt)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* 대댓글 입력창 */}
                      {openReply[comment.commentNo] && userEmail && (
                        <form
                          onSubmit={e => handleReplySubmit(e, feed.postNo, comment.commentNo)}
                          className="reply-form"
                        >
                          <input
                            type="text"
                            value={replyInputs[comment.commentNo] || ''}
                            onChange={e => handleReplyInput(comment.commentNo, e.target.value)}
                            placeholder="대댓글을 입력하세요"
                            className="reply-input"
                          />
                          <button type="submit" className="reply-submit">작성</button>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
                {userEmail && (
                  <form onSubmit={e => handleCommentSubmit(e, feed.postNo)} className="comment-form">
                    <input
                      type="text"
                      value={commentInputs[feed.postNo] || ''}
                      onChange={e => handleCommentInput(feed.postNo, e.target.value)}
                      placeholder="댓글을 입력하세요"
                      className="comment-input"
                    />
                    <button type="submit" className="comment-submit">작성</button>
                  </form>
                )}
              </div>
            </div>
            {/* 아래: 본문 */}
            <div className="feed-main-desc-wrapper">
              <div className="feed-main-desc">{feed.content}</div>
            </div>
            
          </div>
        );
      })}
      {displayCount < sortedFeeds.length ? (
        <div className="feed-loading-more">스크롤하면 더 불러옵니다...</div>
      ) : (
        <div className="feed-end">마지막 피드입니다.</div>
      )}
      <Dialog
        open={commentConfirmOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => setCommentConfirmOpen(false)}
        aria-describedby="alert-dialog-slide-description"
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '16px',
            margin: '30px',
            padding: '30px',
            textAlign: 'center'
          },
          '& .custom-warning': { color: '#7EBBE8 !important' }
        }}
      >
        <DialogTitle>댓글 등록 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            댓글을 등록하시겠습니까? <br />
            <b>등록 후에는 수정/삭제가 불가합니다.</b>
          </DialogContentText>
          <div
            style={{ color: '#7EBBE8', fontWeight: 600, fontSize: 15, marginTop: 2 }}
            className="custom-warning"
          >
            신중하게 결정하시고 등록해 주세요.
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentConfirmOpen(false)} color="inherit">
            취소
          </Button>
          <Button onClick={doSubmitComment} color="primary" variant="contained">
            등록
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={replyConfirmOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => setReplyConfirmOpen(false)}
        aria-describedby="alert-dialog-slide-description"
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '16px',
            margin: '30px',
            padding: '30px',
            textAlign: 'center'
          },
          '& .custom-warning': { color: '#7EBBE8', fontWeight: 600, fontSize: 15, marginTop: 2 }
        }}
      >
        <DialogTitle>대댓글 등록 확인</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            대댓글을 등록하시겠습니까? <br />
            <b>등록 후에는 수정/삭제가 불가합니다.</b>
          </DialogContentText>
          <div className="custom-warning">
            신중하게 결정하시고 등록해 주세요.
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyConfirmOpen(false)} color="inherit">
            취소
          </Button>
          <Button onClick={doSubmitReply} color="primary" variant="contained">
            등록
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Feed;
