const express = require('express');
const db = require('../db');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

router.post("/", async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            message: "이메일과 비밀번호를 모두 입력해주세요."
        });
    }

    try {
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(401).json({
                message: "이메일을 확인해주세요."
            });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "비밀번호를 확인해주세요."
            });
        }

        // 비밀번호를 제외한 사용자 정보 반환
        const { password: _, ...userInfo } = user;
        res.json({
            message: "로그인 성공!",
            user: userInfo
        });

    } catch(err) {
        console.error("로그인 에러:", err);
        res.status(500).json({
            message: "서버 오류가 발생했습니다."
        });
    }
});

// 사용자 정보 조회
router.get("/info", async (req, res) => {
    const { email } = req.query;
    
    if (!email) {
        return res.status(400).json({
            message: "이메일이 필요합니다."
        });
    }

    try {
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        
        if (users.length === 0) {
            return res.status(404).json({
                message: "사용자를 찾을 수 없습니다."
            });
        }

        const { password, ...userInfo } = users[0];
        res.json({
            isLogin: true,
            user: userInfo
        });
    } catch(err) {
        console.error("사용자 정보 조회 에러:", err);
        res.status(500).json({
            message: "서버 오류가 발생했습니다."
        });
    }
});

router.put("/update", async (req, res) => {
    const { email, userNickname, bio, newEmail } = req.body;
    if (!email) {
        return res.status(400).json({ message: "이메일이 필요합니다." });
    }
    try {
        let updateFields = [];
        let updateValues = [];
        if (userNickname) {
            updateFields.push("userNickname = ?");
            updateValues.push(userNickname);
        }
        if (bio) {
            updateFields.push("bio = ?");
            updateValues.push(bio);
        }
        if (newEmail) {
            updateFields.push("email = ?");
            updateValues.push(newEmail);
        }
        if (updateFields.length === 0) {
            return res.status(400).json({ message: "수정할 값이 없습니다." });
        }
        updateValues.push(email);
        const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE email = ?`;
        await db.query(sql, updateValues);
        res.json({ message: "정보가 수정되었습니다." });
    } catch (err) {
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../uploads/profileImg'));
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const email = req.body.email || 'profile';
      cb(null, email + '_' + Date.now() + ext);
    }
  });
  const upload = multer({ storage: storage });
  
  // 프로필 이미지 업로드
  router.post('/upload/profileImage', upload.single('profileImage'), async (req, res) => {
    const { email } = req.body;
    if (!req.file || !email) {
      return res.status(400).json({ message: '이미지와 이메일이 필요합니다.' });
    }
    const imgPath = `/uploads/profileImg/${req.file.filename}`;
    try {
      await db.query('UPDATE users SET profileImage = ? WHERE email = ?', [imgPath, email]);
      res.json({ message: '이미지 업로드 성공', profileImage: imgPath });
    } catch (err) {
      res.status(500).json({ message: 'DB 업데이트 실패' });
    }
  });
// 로그아웃
router.post("/logout", (req, res) => {
    res.json({ message: "로그아웃 되셨습니다." });
});

// 계정 공개/비공개 설정 업데이트
router.put("/update/privacy", async (req, res) => {
    const { email, isPrivate } = req.body;
    
    if (email === undefined || isPrivate === undefined) {
        return res.status(400).json({ message: "필수 정보가 누락되었습니다." });
    }

    try {
        await db.query(
            "UPDATE users SET isPrivate = ? WHERE email = ?",
            [isPrivate ? 1 : 0, email]
        );
        
        res.json({ 
            message: `계정이 ${isPrivate ? '비공개' : '공개'}로 변경되었습니다.`
        });
    } catch (err) {
        console.error("계정 공개 설정 변경 에러:", err);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

// 계정 활성화 상태 업데이트
router.put("/update/status", async (req, res) => {
    const { email, isActive } = req.body;
    
    if (email === undefined || isActive === undefined) {
        return res.status(400).json({ message: "필수 정보가 누락되었습니다." });
    }

    try {
        await db.query(
            "UPDATE users SET isActive = ? WHERE email = ?",
            [isActive ? 1 : 0, email]
        );
        
        res.json({ 
            message: `계정이 ${isActive ? '활성화' : '비활성화'} 되었습니다.`
        });
    } catch (err) {
        console.error("계정 상태 변경 에러:", err);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

module.exports = router;