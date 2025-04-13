# 한올 backend 
## 서버 실행법
```C
node app.js
```
## 서버 주소
>http://localhost:3000
## 디렉토리 구조
```bash
backend
│  app.js // 서버 열기
│  package-lock.json //dependencies
│  package.json //dependencies
│  
├─controllers 
│      auth.js // 로그인, 회원가입, 인증 controllers
│      
├─models
│      database.js //데이터베이스 연동
│      
├─node_modules
│     
└─routes
        authRoutes.js // auth 라우팅
```
## 데이터베이스
현재 db가 연동이 되지 않은 상태여서 이 코드를 실행하면 오류가 발생합니다. 
