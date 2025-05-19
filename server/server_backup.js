const express = require ('express')
const db = require('./db')
const cors = require('cors')

const app = express()
app.use(express.json()); //서버에서 가지고 오는 것을 파싱해준다
app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello World')
})
app.get("/board/list", async (req, res) => {
    try{
        let [list] = await db.query("SELECT * FROM BOARD");
        res.json({
            message : "result",
            list : list
        });
    }catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error")
    }
});
//"/board/list" 에 접속하면 (req, res) => {라는 파라미터가 실행된다-라고 알아둬
app.get("/board/view", async (req, res) => {
    let {BOARDNO} = req.query
    try{
        let [list] = await db.query("SELECT * FROM BOARD WHERE BOARDNO ="+BOARDNO);
        res.json({
            message : "result",
            info : list[0],
        });
    }catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error2")
    }
});
app.get("/board/delete", async (req, res) => {
    let {BOARDNO} = req.query
    try{
        let result  = await db.query("DELETE FROM BOARD WHERE BOARDNO ="+BOARDNO);
        res.json({
            message : "삭제되었습니다.",
        });
    }catch(err){
        console.log("에러 발생");
        res.status(500).send("Server Error3")
    }
})
app.listen(3000, ()=>{
    console.log("서버 실행 중")
})