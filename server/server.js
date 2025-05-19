const express = require('express');
const db = require('./db');
const productRouter = require('./routes/product');
const userRouter = require('./routes/user');
const feedRouter = require('./routes/feed');
const joinRouter = require('./routes/join');
const path = require('path');
const cors = require('cors');

const app = express();

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS 설정
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 라우터 설정
app.use("/product", productRouter);
app.use("/user", userRouter);
app.use("/feed", feedRouter);
app.use('/join', joinRouter);

// 서버 시작
app.listen(3005, () => {
    console.log("서버 실행 중!");
});