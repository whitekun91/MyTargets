# TargetMaster - 양궁 훈련 관리 시스템

## 프로젝트 개요
TargetMaster는 양궁 선수들을 위한 훈련 기록 및 분석 시스템입니다. PostgreSQL 데이터베이스를 사용하여 회원 정보를 관리하고, JWT 토큰 기반 인증을 제공합니다.

## 주요 기능
- 🔐 사용자 인증 (아이디/비밀번호 로그인)
- 👥 회원가입 (아이디, 비밀번호, 이름, 성별, 소속)
- 🔗 소셜 로그인 (카카오톡, 네이버) - 데모 버전
- 📊 훈련 기록 관리
- 📈 성과 분석
- 🏆 경기 관리

## 기술 스택

### 프론트엔드
- React 19.1.1
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Lucide React (아이콘)

### 백엔드
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT (jsonwebtoken)
- bcryptjs (비밀번호 해싱)
- CORS

## 설치 및 실행

### 1. PostgreSQL 데이터베이스 설정
```sql
-- PostgreSQL에 접속하여 데이터베이스 생성
CREATE DATABASE postgres;
```

### 2. 백엔드 서버 설정
```bash
# 백엔드 디렉토리로 이동
cd backend

# 의존성 설치
npm install

# 환경 변수 설정 (config.env 파일 확인)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=postgres
# DB_USER=postgres
# DB_PASSWORD=admin
# JWT_SECRET=your_jwt_secret_key_here
# PORT=3001

# 개발 서버 실행
npm run dev
```

### 3. 프론트엔드 서버 설정
```bash
# 프론트엔드 디렉토리로 이동 (프로젝트 루트)
cd ..

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## API 엔드포인트

### 인증 관련
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/social-login` - 소셜 로그인
- `GET /api/auth/verify` - 토큰 검증

### 요청/응답 예시

#### 회원가입
```json
POST /api/auth/register
{
  "user_id": "testuser",
  "password": "password123",
  "name": "홍길동",
  "gender": "남성",
  "organization": "서울시 양궁협회"
}
```

#### 로그인
```json
POST /api/auth/login
{
  "user_id": "testuser",
  "password": "password123"
}
```

## 데이터베이스 스키마

### users 테이블
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  organization VARCHAR(100) NOT NULL,
  social_provider VARCHAR(20),
  social_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 개발 환경 설정

### 환경 변수
백엔드 서버의 `config.env` 파일에서 다음 변수들을 설정하세요:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=admin
JWT_SECRET=your_jwt_secret_key_here
PORT=3001
```

### 포트 설정
- 프론트엔드: http://localhost:5173
- 백엔드: http://localhost:3001

## 소셜 로그인 설정

현재 소셜 로그인은 데모 버전으로 구현되어 있습니다. 실제 서비스에서는 다음 단계가 필요합니다:

1. 카카오 개발자 콘솔에서 앱 등록
2. 네이버 개발자 센터에서 앱 등록
3. 각 플랫폼의 SDK 설치 및 설정
4. `src/utils/socialLogin.ts` 파일의 실제 구현으로 교체

## 프로젝트 구조
```
Web/TargetMaster/
├── src/
│   ├── components/          # React 컴포넌트
│   ├── utils/              # 유틸리티 함수
│   │   ├── api.ts          # API 통신 함수
│   │   └── socialLogin.ts  # 소셜 로그인 유틸리티
│   ├── App.tsx             # 메인 앱 컴포넌트
│   └── main.tsx            # 앱 진입점
├── backend/
│   ├── src/
│   │   ├── models/         # 데이터 모델
│   │   ├── routes/         # API 라우트
│   │   ├── database.ts     # 데이터베이스 연결
│   │   └── index.ts        # 서버 진입점
│   ├── config.env          # 환경 변수
│   └── package.json
└── package.json
```

## 문제 해결

### PostgreSQL 연결 오류
1. PostgreSQL 서비스가 실행 중인지 확인
2. 데이터베이스 사용자 권한 확인
3. 방화벽 설정 확인

### CORS 오류
백엔드 서버의 CORS 설정에서 프론트엔드 URL이 허용되어 있는지 확인하세요.

### 토큰 오류
JWT_SECRET이 설정되어 있는지 확인하고, 토큰이 만료되지 않았는지 확인하세요.

## 라이선스
이 프로젝트는 MIT 라이선스 하에 배포됩니다.