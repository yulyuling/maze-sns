const express = require ('express')
const db = require('./db')
const cors = require('cors')
const productRouter = require('./routes/product')
const userRouter = require('./routes/user')
const loginRouter = require('./routes/login');
var session = require('express-session')

const app = express()
app.use(express.json()); //서버에서 가지고 오는 것을 파싱해준다
app.use(cors({
    origin : "http://localhost:5502",
    credentials : true
}))

app.use(session({
    secret: 'test1234',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        httpOnly : true,
        secure: false ,
        maxAge : 1000 * 60 * 30
    }
}))

app.use("/product", productRouter);
app.use("/user", userRouter);
app.use("/login", loginRouter);

app.get("/product", async (req, res) => {
    //req.query

    //let {productId} = req.params;
    let {pageSize, offset} = req.query;

    //console.log(productId);
    try{
        let sql = "SELECT * FROM TBL_PRODUCT LIMIT ? OFFSET ?";
        console.log(pageSize, offset);
        let [list] = await db.query(sql, [parseInt(pageSize), parseInt(offset)]);
        let [count] = await db.query("SELECT COUNT(*) AS cnt FROM TBL_PRODUCT")
        res.json({
            message : "result",
            list : list,
            count : count[0].cnt
        });
    }catch(err){
        console.log("에러 발생 list");
        res.status(500).send("Server Error")
    }
});
app.get("/product/:productId", async (req, res) => { // productView >> productId
    //req.query  

    let {productId} = req.params;
    console.log(productId);
    try{
        let [info] = await db.query("SELECT * FROM TBL_PRODUCT WHERE PRODUCTID =" + productId);
        
        res.json({
            message : "result",
            info : info[0]
        });
    }catch(err){
        console.log("에러 발생 view");
        res.status(500).send("Server Error")
    }
});
app.post("/product", async (req, res) => {
    let{productName, description, price, stock, category} = req.body //아까 body=={}에 보냈으니 body쓴다
    console.log(productName, description, price, stock, category);
    try{
        let query = "INSERT INTO TBL_PRODUCT VALUES(NULL, ?, ?, ?, ?, ?, 'Y', NOW(), NOW())"
        let [list] = await db.query(query, [productName, description, price, stock, category]);
        
        res.json({
            message : "result",
            list : list
        });
    }catch(err){
        console.log("에러 발생 INSERT");
        res.status(500).send("Server Error")
    }
});
app.delete("/product/:productId", async (req, res) => { 
    //req.query  

    let {productId} = req.params;
    console.log(productId);
    try{
        let [result] = await db.query("DELETE FROM TBL_PRODUCT WHERE PRODUCTID =" + productId);
        
        res.json({
            message : "result",
            result : result
        });
    }catch(err){
        console.log("에러 발생 view");
        res.status(500).send("Server Error")
    }
});
app.put("/product/:productId", async (req, res) => { 
    //req.query  

    let {productId} = req.params;
    let{productName, description, price, stock, category} = req.body
    console.log(productId);
    try{
        let query = "UPDATE TBL_PRODUCT SET productName=?, description=?, price=?, stock=?, category=? WHERE productId = ?";
        let [info] = await db.query(query, [productName, description, price, stock, category, productId]);
        
        res.json({
            message : "수정되었습니다.",
            info : info[0]
        });
    }catch(err){
        console.log("에러 발생 view");
        res.status(500).send("Server Error")
    }
});


app.listen(3000, ()=>{
    console.log("서버 실행 중")
})