const express = require('express');
const db = require('../db');
const authMiddleware = require('../auth');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

//api

router.get("/list", async(req, res) => {
    try {
        console.log("피드 목록 조회 시작");
        // 1. 먼저 게시글 목록을 가져옵니다
        const [posts] = await db.query(`
            SELECT 
                p.*, u.*,
                (SELECT COUNT(*) FROM likes WHERE postNo = p.postNo) as likes
            FROM posts p
            JOIN users u ON p.userId = u.userId
            ORDER BY p.createdAt DESC
        `);
        console.log("게시글 조회 결과:", posts.length);

        // 2. 각 게시글의 댓글을 가져옵니다
        const feeds = await Promise.all(posts.map(async (post) => {
            try {
                // 댓글 조회
                const [comments] = await db.query(`
                    SELECT 
                        c.commentNo,
                        c.postNo,
                        c.userId,
                        c.comment as content,
                        c.createdAt,
                        u.userName,
                        u.userNickname,
                        u.email,
                        u.profileImage
                    FROM comments c
                    JOIN users u ON c.userId = u.userId
                    WHERE c.postNo = ?
                    ORDER BY c.createdAt ASC
                `, [post.postNo]);
                console.log(`게시글 ${post.postNo}의 댓글 수:`, comments.length);
                if (comments.length > 0) {
                    console.log("첫 번째 댓글 샘플:", JSON.stringify(comments[0]));
                }

                // 대댓글 기능 활성화 여부 확인
                let hasRepliesTable = true;
                try {
                    // 테이블 존재 여부 확인
                    await db.query("SELECT 1 FROM replies LIMIT 1");
                } catch (err) {
                    console.log("replies 테이블이 존재하지 않습니다:", err.message);
                    hasRepliesTable = false;
                }

                let commentsWithReplies = comments;
                
                // 대댓글 테이블이 있는 경우에만 대댓글 조회
                if (hasRepliesTable) {
                    commentsWithReplies = await Promise.all(comments.map(async (comment) => {
                        try {
                            const [replies] = await db.query(`
                                SELECT
                                    r.*, u.*
                                FROM replies r
                                JOIN users u ON r.userId = u.userId
                                WHERE r.commentNo = ?
                                ORDER BY r.createdAt ASC
                            `, [comment.commentNo]);
                            
                            return {
                                ...comment,
                                replies: replies || []
                            };
                        } catch (err) {
                            console.error(`댓글 ${comment.commentNo}의 대댓글 조회 오류:`, err);
                            return {
                                ...comment,
                                replies: []
                            };
                        }
                    }));
                } else {
                    // 대댓글 테이블이 없으면 빈 배열로 초기화
                    commentsWithReplies = comments.map(comment => ({
                        ...comment,
                        replies: []
                    }));
                }

                return {
                    ...post,
                    comments: commentsWithReplies
                };
            } catch (err) {
                console.error(`게시글 ${post.postNo}의 댓글 조회 오류:`, err);
                return {
                    ...post,
                    comments: []
                };
            }
        }));

        res.json({
            feeds: feeds
        });
    } catch(err) {
        console.error("피드 조회 에러:", err);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

// 피드 상세 조회
router.get("/detail/:postNo", async(req, res) => {
    const { postNo } = req.params;
    try {
        // 게시글 조회
        const [posts] = await db.query(`
            SELECT 
                p.*, u.*,
                (SELECT COUNT(*) FROM likes WHERE postNo = p.postNo) as likes
            FROM posts p
            JOIN users u ON p.userId = u.userId
            WHERE p.postNo = ?
        `, [postNo]);
        
        if (posts.length === 0) {
            return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
        }
        
        // 댓글 조회
        const [comments] = await db.query(`
            SELECT 
                c.commentNo,
                c.postNo,
                c.userId,
                c.comment as content,
                c.createdAt,
                u.userName,
                u.userNickname,
                u.email,
                u.profileImage
            FROM comments c
            JOIN users u ON c.userId = u.userId
            WHERE c.postNo = ?
            ORDER BY c.createdAt ASC
        `, [postNo]);
        
        const post = posts[0];
        post.comments = comments || [];
        
        res.json({
            feed: post
        });
    } catch(err) {
        console.error("게시글 상세 조회 에러:", err);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

// 좋아요 처리
router.post("/like/:postNo", async (req, res) => {
    const { postNo } = req.params;
    const { email } = req.body;

    try {
        // 사용자 ID 조회
        const [users] = await db.query("SELECT userId FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        }
        const userId = users[0].userId;

        // 이미 좋아요를 눌렀는지 확인
        const [existingLikes] = await db.query(
            "SELECT * FROM likes WHERE userId = ? AND postNo = ?",
            [userId, postNo]
        );

        if (existingLikes.length > 0) {
            // 좋아요 취소
            await db.query(
                "DELETE FROM likes WHERE userId = ? AND postNo = ?",
                [userId, postNo]
            );
            res.json({ message: "좋아요가 취소되었습니다." });
        } else {
            // 좋아요 추가
            await db.query(
                "INSERT INTO likes (userId, postNo, createdAt) VALUES (?, ?, NOW())",
                [userId, postNo]
            );
            res.json({ message: "좋아요가 추가되었습니다." });
        }
    } catch(err) {
        console.error("좋아요 처리 에러:", err);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

// 댓글 작성
router.post("/comment/:postNo", async (req, res) => {
    const { postNo } = req.params;
    const { email, comment } = req.body;

    if (!comment) {
        return res.status(400).json({ message: "댓글 내용이 필요합니다." });
    }

    try {
        console.log("댓글 작성 시도 - 게시글:", postNo, "내용:", comment);
        
        // 사용자 ID 조회
        const [users] = await db.query("SELECT userId FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        }
        const userId = users[0].userId;
        console.log("댓글 작성자:", userId);

        // 댓글 테이블 구조 확인
        try {
            const [columns] = await db.query("SHOW COLUMNS FROM comments");
            console.log("댓글 테이블 구조:", columns.map(col => col.Field));
        } catch (err) {
            console.error("댓글 테이블 구조 확인 실패:", err.message);
        }

        // 댓글 추가
        const [result] = await db.query(
            "INSERT INTO comments (postNo, userId, comment, createdAt) VALUES (?, ?, ?, NOW())",
            [postNo, userId, comment]
        );
        console.log("댓글 작성 성공:", result.insertId);

        // 작성된 댓글 조회
        const [insertedComment] = await db.query(
            "SELECT * FROM comments WHERE commentNo = ?",
            [result.insertId]
        );
        console.log("작성된 댓글:", insertedComment[0]);

        res.json({ 
            message: "댓글이 작성되었습니다.",
            comment: insertedComment[0]
        });
    } catch(err) {
        console.error("댓글 작성 에러:", err);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

// 대댓글 작성
router.post("/reply/:postNo/:commentNo", async (req, res) => {
    const { postNo, commentNo } = req.params;
    const { email, reply } = req.body;

    if (!reply) {
        return res.status(400).json({ message: "대댓글 내용이 필요합니다." });
    }

    try {
        // replies 테이블 존재 여부 확인
        try {
            await db.query("SELECT 1 FROM replies LIMIT 1");
        } catch (err) {
             console.log("replies 테이블이 존재하지 않습니다:", err.message);
        }

        // 사용자 ID 조회
        const [users] = await db.query("SELECT userId FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        }
        const userId = users[0].userId;

        // 댓글이 존재하는지 확인
        const [comments] = await db.query("SELECT * FROM comments WHERE commentNo = ? AND postNo = ?", [commentNo, postNo]);
        if (comments.length === 0) {
            return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
        }

        // 대댓글 추가
        await db.query(
            "INSERT INTO replies (commentNo, userId, content, createdAt) VALUES (?, ?, ?, NOW())",
            [commentNo, userId, reply]
        );

        res.json({ message: "대댓글이 작성되었습니다." });
    } catch(err) {
        console.error("대댓글 작성 에러:", err);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

// 1. 패키지 추가
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("파일 저장 위치:", 'uploads/');
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const newFilename = Date.now() + '-' + file.originalname;
        console.log("생성된 파일명:", newFilename);
        cb(null, newFilename);
    }
});
const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        console.log("업로드 시도하는 파일:", file);
        cb(null, true);
    }
});

// api 호출
router.post('/upload', upload.array('file'), async (req, res) => {
    const { email, content, tags } = req.body;
    const files = req.files;

    console.log("업로드 요청:", { email, content, tags });
    console.log("업로드된 파일:", files);

    // uploads 디렉토리 확인
    if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads');
        console.log("uploads 디렉토리가 생성되었습니다.");
    }

    try {
        // 사용자 ID 조회
        const [users] = await db.query("SELECT userId FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        }
        const userId = users[0].userId;

        // isPublic 컬럼 존재 여부 확인
        let hasIsPublicColumn = true;
        try {
            await db.query("SELECT isPublic FROM posts LIMIT 1");
        } catch (err) {
            console.log("isPublic 컬럼이 없습니다. 기본값으로 설정합니다.");
            hasIsPublicColumn = false;
        }

        // tag 컬럼 존재 여부 확인
        let hasTagColumn = true;
        try {
            await db.query("SELECT tag FROM posts LIMIT 1");
        } catch (err) {
            console.log("tag 컬럼이 없습니다.");
            hasTagColumn = false;
        }

        // 피드 추가 쿼리 구성
        let query = "";
        let queryParams = [];

        // 이미지 URL 설정
        let imageUrl = '';
        if (files && files.length > 0) {
            imageUrl = `/uploads/${files[0].filename}`;
            console.log("저장할 이미지 경로 (full):", imageUrl);
        } else {
            console.log("이미지가 없습니다. 기본값 사용");
        }
        
        console.log("최종 이미지 URL:", imageUrl);

        if (hasIsPublicColumn && hasTagColumn) {
            query = `
                INSERT INTO posts 
                (userId, content, imageUrl, createdAt, updatedAt, isPublic, tag) 
                VALUES (?, ?, ?, NOW(), NOW(), 1, ?)
            `;
            queryParams = [userId, content, imageUrl, tags || ''];
        } else if (hasIsPublicColumn) {
            query = `
                INSERT INTO posts 
                (userId, content, imageUrl, createdAt, updatedAt, isPublic) 
                VALUES (?, ?, ?, NOW(), NOW(), 1)
            `;
            queryParams = [userId, content, imageUrl];
        } else if (hasTagColumn) {
            query = `
                INSERT INTO posts 
                (userId, content, imageUrl, createdAt, updatedAt, tag) 
                VALUES (?, ?, ?, NOW(), NOW(), ?)
            `;
            queryParams = [userId, content, imageUrl, tags || ''];
        } else {
            query = `
                INSERT INTO posts 
                (userId, content, imageUrl, createdAt, updatedAt) 
                VALUES (?, ?, ?, NOW(), NOW())
            `;
            queryParams = [userId, content, imageUrl];
        }

        const [result] = await db.query(query, queryParams);

        res.json({
            message: "피드가 작성되었습니다.",
            postNo: result.insertId
        });

        console.log("실행된 쿼리:", query);
        console.log("쿼리 파라미터:", queryParams);
        console.log("피드 태그:", tags || '');
    } catch(err) {
        console.error("피드 작성 에러:", err);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    let { id } = req.params;
    console.log("dd",id)
    try{
        let query= "DELETE FROM TBL_FEED WHERE id = "+ id;
        let result = await db.query( query);
        console.log("authMiddleware ==> ", result);
        res.json({
            message : "success",
            result : result
        });
    }catch(err){
        console.log("에러 발생! remove");
        res.status(500).send("Server Error");
    }
})

router.post("/", upload.array('file'), async (req, res) => {
    const { content, email, tags } = req.body;
    const files = req.files;

    if (!content && !req.body.userId) {
        return res.status(400).json({ message: "내용이 필요합니다." });
    }

    console.log("피드 작성 요청:", req.body);
    console.log("업로드된 파일:", files);

    // uploads 디렉토리 확인
    if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads');
        console.log("uploads 디렉토리가 생성되었습니다.");
    }

    try {
        // 클라이언트에서 userId를 직접 받는 경우 (이전 코드 호환성)
        if (req.body.userId) {
            let query = "INSERT INTO TBL_FEED VALUES(NULL, ?, ?, NOW())";
            let result = await db.query(query, [req.body.userId, req.body.content]);
            console.log("result==>", result);
            return res.json({
                message: "success",
                result: result[0]
            });
        }

        // React 클라이언트에서 email을 통해 요청하는 경우
        // 사용자 ID 조회
        const [users] = await db.query("SELECT userId FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        }
        const userId = users[0].userId;

        // isPublic, tag 컬럼 존재 여부 확인
        let hasIsPublicColumn = true;
        let hasTagColumn = true;
        
        try {
            await db.query("SELECT isPublic FROM posts LIMIT 1");
        } catch (err) {
            console.log("isPublic 컬럼이 없습니다. 기본값으로 설정합니다.");
            hasIsPublicColumn = false;
        }
        
        try {
            await db.query("SELECT tag FROM posts LIMIT 1");
        } catch (err) {
            console.log("tag 컬럼이 없습니다.");
            hasTagColumn = false;
        }

        // 피드 추가 쿼리 구성
        let query = "";
        let queryParams = [];

        // 이미지 URL 설정
        let imageUrl = '';
        if (files && files.length > 0) {
            imageUrl = `/uploads/${files[0].filename}`;
            console.log("저장할 이미지 경로:", imageUrl);
        } else {
            console.log("이미지가 없습니다. 기본값 사용");
        }

        if (hasIsPublicColumn && hasTagColumn) {
            query = `
                INSERT INTO posts 
                (userId, content, imageUrl, createdAt, updatedAt, isPublic, tag) 
                VALUES (?, ?, ?, NOW(), NOW(), 1, ?)
            `;
            queryParams = [userId, content, imageUrl, tags || ''];
        } else if (hasIsPublicColumn) {
            query = `
                INSERT INTO posts 
                (userId, content, imageUrl, createdAt, updatedAt, isPublic) 
                VALUES (?, ?, ?, NOW(), NOW(), 1)
            `;
            queryParams = [userId, content, imageUrl];
        } else if (hasTagColumn) {
            query = `
                INSERT INTO posts 
                (userId, content, imageUrl, createdAt, updatedAt, tag) 
                VALUES (?, ?, ?, NOW(), NOW(), ?)
            `;
            queryParams = [userId, content, imageUrl, tags || ''];
        } else {
            query = `
                INSERT INTO posts 
                (userId, content, imageUrl, createdAt, updatedAt) 
                VALUES (?, ?, ?, NOW(), NOW())
            `;
            queryParams = [userId, content, imageUrl];
        }

        const [result] = await db.query(query, queryParams);

        res.json({
            message: "피드가 작성되었습니다.",
            postNo: result.insertId
        });

        console.log("피드 태그:", tags || '');
    } catch(err) {
        console.error("피드 작성 에러:", err);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

router.get("/:id", async(req, res)=> {
    let { id } = req.params
    try{
        let [list] = await db.query("SELECT * FROM TBL_FEED WHERE ID = " + id);
        res.json({
            message : "result",
            feed : list[0]
        });
    }catch(err){
        console.log("에러 발생! feed");
        res.status(500).send("Server Error");
    }

})

router.put("/:id", async (req, res) => {
    let { id } = req.params;
    let {userId, content} = req.body;
    try{
        let query = "UPDATE TBL_FEED SET "
                    + "userId=?, content=? "
                    + "WHERE id = ?";
        let result = await db.query(query, [userId, content, id]);
        res.json({
            message : "수정되었습니다.",
            result : result
        });
    }catch(err){
        console.log("에러 발생! update");
        console.log(query)
        res.status(500).send("Server Error");
    }
})

// feed.js (라우터에 추가)
router.put('/visibility/:postNo', async (req, res) => {
    const { postNo } = req.params;
    const { isPublic } = req.body;
    try {
        await db.query(
            'UPDATE posts SET isPublic = ? WHERE postNo = ?',
            [isPublic, postNo]
        );
        res.json({ message: '공개설정이 변경되었습니다.' });
    } catch (err) {
        console.error('공개설정 변경 에러:', err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 태그로 피드 검색
router.get("/search/tag", async(req, res) => {
    const { tag } = req.query;
    
    if (!tag) {
        return res.status(400).json({ message: "검색할 태그가 필요합니다." });
    }
    
    try {
        console.log("태그 검색 시작:", tag);
        
        const [posts] = await db.query(`
            SELECT 
                p.*, u.*,
                (SELECT COUNT(*) FROM likes WHERE postNo = p.postNo) as likes
            FROM posts p
            JOIN users u ON p.userId = u.userId
            WHERE p.tag LIKE ?
            ORDER BY p.createdAt DESC
        `, [`%${tag}%`]);
        
        console.log("태그 검색 결과:", posts.length);

        // 각 게시글의 댓글을 가져옵니다
        const feeds = await Promise.all(posts.map(async (post) => {
            try {
                // 댓글 조회
                const [comments] = await db.query(`
                    SELECT 
                        c.commentNo,
                        c.postNo,
                        c.userId,
                        c.comment as content,
                        c.createdAt,
                        u.userName,
                        u.userNickname,
                        u.email,
                        u.profileImage
                    FROM comments c
                    JOIN users u ON c.userId = u.userId
                    WHERE c.postNo = ?
                    ORDER BY c.createdAt ASC
                `, [post.postNo]);

                // 대댓글 기능 활성화 여부 확인
                let hasRepliesTable = true;
                try {
                    await db.query("SELECT 1 FROM replies LIMIT 1");
                } catch (err) {
                    console.log("replies 테이블이 존재하지 않습니다:", err.message);
                    hasRepliesTable = false;
                }

                let commentsWithReplies = comments;
                
                // 대댓글 테이블이 있는 경우에만 대댓글 조회
                if (hasRepliesTable) {
                    commentsWithReplies = await Promise.all(comments.map(async (comment) => {
                        try {
                            const [replies] = await db.query(`
                                SELECT
                                    r.*, u.*
                                FROM replies r
                                JOIN users u ON r.userId = u.userId
                                WHERE r.commentNo = ?
                                ORDER BY r.createdAt ASC
                            `, [comment.commentNo]);
                            
                            return {
                                ...comment,
                                replies: replies || []
                            };
                        } catch (err) {
                            console.error(`댓글 ${comment.commentNo}의 대댓글 조회 오류:`, err);
                            return {
                                ...comment,
                                replies: []
                            };
                        }
                    }));
                } else {
                    commentsWithReplies = comments.map(comment => ({
                        ...comment,
                        replies: []
                    }));
                }

                return {
                    ...post,
                    comments: commentsWithReplies
                };
            } catch (err) {
                console.error(`게시글 ${post.postNo}의 댓글 조회 오류:`, err);
                return {
                    ...post,
                    comments: []
                };
            }
        }));

        res.json({
            feeds: feeds
        });
    } catch(err) {
        console.error("태그 검색 에러:", err);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

// 태그 업데이트
router.put("/tag/:postNo", async (req, res) => {
    const { postNo } = req.params;
    const { email, tags } = req.body;

    try {
        // 사용자 ID 조회
        const [users] = await db.query("SELECT userId FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        }
        const userId = users[0].userId;

        // 게시글 소유자 확인
        const [posts] = await db.query("SELECT userId FROM posts WHERE postNo = ?", [postNo]);
        if (posts.length === 0) {
            return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
        }

        if (posts[0].userId !== userId) {
            return res.status(403).json({ message: "게시글 소유자만 태그를 수정할 수 있습니다." });
        }

        // 태그 업데이트
        await db.query("UPDATE posts SET tag = ? WHERE postNo = ?", [tags || '', postNo]);

        res.json({ message: "태그가 업데이트되었습니다." });
    } catch(err) {
        console.error("태그 업데이트 에러:", err);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

// 새로운 피드 등록 엔드포인트
router.post("/feed", upload.array('file'), async (req, res) => {
    const { content, tags } = req.body;
    const email = req.body.email || req.query.email;
    const files = req.files;

    if (!content) {
        return res.status(400).json({ message: "내용이 필요합니다." });
    }
    
    console.log("피드 작성 요청 - 전체 body:", req.body);
    console.log("이메일:", email);
    console.log("내용:", content);
    console.log("태그:", tags);
    console.log("업로드된 파일:", files ? files.length : 0);
    if (files && files.length > 0) {
        console.log("파일 정보:", JSON.stringify(files[0]));
    }
    
    // uploads 디렉토리 확인
    if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads');
        console.log("uploads 디렉토리가 생성되었습니다.");
    }

    try {
        // 사용자 ID 조회
        const [users] = await db.query("SELECT userId FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        }
        const userId = users[0].userId;

        // isPublic, tag 컬럼 존재 여부 확인
        let hasIsPublicColumn = true;
        let hasTagColumn = true;
        
        try {
            await db.query("SELECT isPublic FROM posts LIMIT 1");
        } catch (err) {
            console.log("isPublic 컬럼이 없습니다. 기본값으로 설정합니다.");
            hasIsPublicColumn = false;
        }
        
        try {
            await db.query("SELECT tag FROM posts LIMIT 1");
        } catch (err) {
            console.log("tag 컬럼이 없습니다.");
            hasTagColumn = false;
        }

        // 피드 추가 쿼리 구성
        let query = "";
        let queryParams = [];

        // 이미지 URL 설정
        let imageUrl = '';
        if (files && files.length > 0) {
            imageUrl = `/uploads/${files[0].filename}`;
            console.log("저장할 이미지 경로:", imageUrl);
        } else {
            console.log("이미지가 없습니다. 기본값 사용");
        }

        if (hasIsPublicColumn && hasTagColumn) {
            query = `
                INSERT INTO posts 
                (userId, content, imageUrl, createdAt, updatedAt, isPublic, tag) 
                VALUES (?, ?, ?, NOW(), NOW(), 1, ?)
            `;
            queryParams = [userId, content, imageUrl, tags || ''];
        } else if (hasIsPublicColumn) {
            query = `
                INSERT INTO posts 
                (userId, content, imageUrl, createdAt, updatedAt, isPublic) 
                VALUES (?, ?, ?, NOW(), NOW(), 1)
            `;
            queryParams = [userId, content, imageUrl];
        } else if (hasTagColumn) {
            query = `
                INSERT INTO posts 
                (userId, content, imageUrl, createdAt, updatedAt, tag) 
                VALUES (?, ?, ?, NOW(), NOW(), ?)
            `;
            queryParams = [userId, content, imageUrl, tags || ''];
        } else {
            query = `
                INSERT INTO posts 
                (userId, content, imageUrl, createdAt, updatedAt) 
                VALUES (?, ?, ?, NOW(), NOW())
            `;
            queryParams = [userId, content, imageUrl];
        }

        const [result] = await db.query(query, queryParams);

        res.json({
            message: "피드가 작성되었습니다.",
            postNo: result.insertId
        });

        console.log("피드 태그:", tags || '');
        console.log("피드 작성 성공 - ID:", result.insertId);
        console.log("저장된 이미지 경로:", imageUrl);
    } catch(err) {
        console.error("피드 작성 에러:", err);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

module.exports = router;