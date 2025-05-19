const express = require('express');
const db = require('../db');
const authMiddleware = require('../auth');
// 1. 패키지 추가
const multer = require('multer'); //파일업로드
const router = express.Router();

// 2. 저장 경로 및 파일명
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/upload', upload.single('file'), async (req, res) => {
    let {productId} = req.body;
    const filename = req.file.filename; 
    const destination = req.file.destination; 
    try{
        let query = "INSERT INTO tbl_feed_img VALUES(NULL, ?, ?, ?)";
        let result = await db.query(query, [productId, filename, destination]);
        res.json({
            message : "result",
            result : result
        });
    } catch(err){
        console.log("에러 발생!");
        res.status(500).send("Server Error");
    }
});


// router.get("/", async (req, res) => {
//     let {pageSize, offset} = req.query;
//     try{
//         let sql = "SELECT * FROM TBL_PRODUCT LIMIT ? OFFSET ?";
//         let [list] = await db.query(sql, [parseInt(pageSize), parseInt(offset)]);
//         let [count] = await db.query("SELECT COUNT(*) AS cnt FROM TBL_PRODUCT");
//         res.json({
//             message : "result",
//             list : list,
//             count : count[0].cnt
//         });
//     }catch(err){
//         console.log("에러 발생!");
//         res.status(500).send("Server Error");
//     }
// })

router.get("/", async (req, res) => {

    try{
        let sql = "SELECT * FROM TBL_PRODUCT";
        let [list] = await db.query(sql);
        let [count] = await db.query("SELECT COUNT(*) AS cnt FROM TBL_PRODUCT");
        res.json({
            message : "result",
            list : list,
            count : count[0].cnt
        });
    }catch(err){
        console.log("에러 발생!");
        res.status(500).send("Server Error");
    }
})

router.get("/:productId", async (req, res) => {
    let { productId } = req.params;
    try{
        let [list] = await db.query("SELECT * FROM TBL_PRODUCT WHERE PRODUCTID = " + productId);
        console.log(list);
        res.json({
            message : "result",
            info : list[0]
        });
    }catch(err){
        console.log("에러 발생!");
        res.status(500).send("Server Error");
    }
})

router.post("/", async (req, res) => {
    let {productName, description, price, stock, category} = req.body;
    console.log(productName, description, price, stock, category);
    try{
        let query = "INSERT INTO TBL_PRODUCT VALUES(NULL, ?, ?, ?, ?, ?, 'Y', NOW(), NOW())";
        let result = await db.query(query, [productName, description, price, stock, category]);
        console.log("result==>", result);
        res.json({
            message : "success",
            result : result[0]
        });
    }catch(err){
        console.log("에러 발생!");
        res.status(500).send("Server Error");
    }
})

router.delete("/:productId", authMiddleware, async (req, res) => {
    let { productId } = req.params;
    try{
        let result = await db.query("DELETE FROM TBL_PRODUCT WHERE PRODUCTID = " + productId);
        console.log("authMiddleware ==> ", result);
        res.json({
            message : "success",
            result : result
        });
    }catch(err){
        console.log("에러 발생!");
        res.status(500).send("Server Error");
    }
})

router.put("/:productId", async (req, res) => {
    let { productId } = req.params;
    let {productName, description, price, stock, category} = req.body;
    try{
        let query = "UPDATE TBL_PRODUCT SET "
                    + "productName=?, description=?, price=?, stock=?, category=? "
                    + "WHERE productId = ?";
        let result = await db.query(query, [productName, description, price, stock, category, productId]);
        res.json({
            message : "수정되었습니다.",
            result : result
        });
    }catch(err){
        console.log("에러 발생!");
        res.status(500).send("Server Error");
    }
})

module.exports = router;