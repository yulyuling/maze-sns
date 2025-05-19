const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;


router.post("/", async(req, res)=> {
    const { email, password, userName, userNickname } = req.body;
    try{
        const [existing] = await db.query(`SELECT * FROM users WHERE email = ?`, [email]);
        let sql = "INSERT INTO USERS(USERID, USERNAME, USERNICKNAME, EMAIL, PASSWORD,CREATEDAT, UPDATEDAT) VALUES(NULL, ?, ?, ?, ?, NOW(), NOW())";
        // let imgsql = "INSERT INTO USERS U INNER JOIN TBL_FEED_IMG I ON F.ID = I.FEEDID ";
        // if(userId) {
        //     sql += " WHERE USERID = '" + userId + "'";
        //     // imgsql += " WHERE USERID = '" + userId + "'";
        // }
        //비밀번호 해시
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // let [list] = await db.query(sql);
        // let [imglist] = await db.query(imgsql);
        const [result] = await db.query(sql, [userName, userNickname, email, hashedPassword]);
        // console.log(list, sql)
        res.json({
            message : "회원가입 성공",
            // list : list,
            // imglist : imglist || []
            insertedId: result.insertId,
            redirect: '/login'
        });
    }catch(err){
        console.log("에러 발생! feed");
        res.status(500).send("Server Error");
    }

});
    router.get('/check-email', async (req, res) => {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({
                message: "이메일을 입력해주세요.",
                exists: false
            });
        }

        try {
            const [rows] = await db.query('SELECT COUNT(*) AS count FROM users WHERE email = ?', [email]);
            const count = rows[0].count;
            
            console.log("이메일 중복체크", rows);
            
            return res.status(200).json({
                message: count > 0 ? "이미 사용 중인 이메일입니다." : "사용 가능한 이메일입니다.",
                exists: count > 0
            });
        } catch(err) {
            console.error("이메일 중복 체크 에러:", err);
            return res.status(500).json({
                message: "서버 오류가 발생했습니다.",
                exists: false
            });
        }
    });
module.exports = router;