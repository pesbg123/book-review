const express = require("express");
const app = express();
const port = 3000;
const cookieParser = require("cookie-parser");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json()); // 요청의 데이터를 JSON 형식으로 파싱하기 위한 미들웨어 설정
app.use(cookieParser()); // 쿠키 파싱을 위한 미들웨어 설정
app.use("/", [usersRouter, profileRouter]);

app.listen(PORT, () => {
  console.log(PORT, "포트 번호로 서버가 실행되었습니다.");
});
