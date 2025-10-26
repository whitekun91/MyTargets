import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3001;

// PostgreSQL 연결 설정
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'admin',
});

// 데이터베이스 연결 테스트
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL 데이터베이스 연결 성공');
    client.release();
    return true;
  } catch (error) {
    console.error('PostgreSQL 데이터베이스 연결 실패:', error);
    return false;
  }
};

// 사용자 테이블 생성
const createUsersTable = async () => {
  try {
    const client = await pool.connect();
    
    // 기존 테이블 존재 여부 확인
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    
    if (tableExists) {
      console.log('✓ users 테이블이 이미 존재합니다.');
    } else {
      console.log('⚠ users 테이블이 없습니다. 테이블을 생성합니다...');
    }
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        gender VARCHAR(10) NOT NULL,
        organization VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        event_type VARCHAR(20),
        registration_year INTEGER,
        social_provider VARCHAR(20),
        social_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await client.query(createTableQuery);
    
    if (!tableExists) {
      console.log('✓ users 테이블이 성공적으로 생성되었습니다.');
    }
    
    // role 컬럼 추가 (이미 존재하면 에러 무시)
    try {
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
      `);
      console.log('✓ role 컬럼 확인 완료');
    } catch (error) {
      console.log('컬럼 추가 시도 (이미 존재할 수 있음):', error.message);
    }
    
    // event_type, registration_year 컬럼 추가 (이미 존재하면 에러 무시)
    try {
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS event_type VARCHAR(20),
        ADD COLUMN IF NOT EXISTS registration_year INTEGER;
      `);
      console.log('✓ event_type, registration_year 컬럼 확인 완료');
    } catch (error) {
      console.log('컬럼 추가 시도 (이미 존재할 수 있음):', error.message);
    }
    
    client.release();
  } catch (error) {
    console.error('사용자 테이블 생성 실패:', error);
    throw error;
  }
};

// 기존 사용자 데이터 업데이트
const updateExistingUsers = async () => {
  try {
    const client = await pool.connect();
    
    // 기존 관리자 계정에 role='admin' 설정
    const adminResult = await client.query(`
      UPDATE users 
      SET role = 'admin'
      WHERE user_id = 'admin';
    `);
    
    if (adminResult.rowCount > 0) {
      console.log(`✓ 관리자 계정에 admin 권한이 부여되었습니다.`);
    }
    
    // role이 NULL이거나 빈 문자열인 경우 'user'로 설정
    const userResult = await client.query(`
      UPDATE users 
      SET role = 'user'
      WHERE role IS NULL OR role = '';
    `);
    
    if (userResult.rowCount > 0) {
      console.log(`${userResult.rowCount}명의 사용자에게 user 권한이 부여되었습니다.`);
    }
    
    // name이 '백민우'이거나 organization이 '테스트'인 사용자의 event_type을 '리커브'로 설정
    const eventTypeResult = await client.query(`
      UPDATE users 
      SET event_type = '리커브'
      WHERE (name = '백민우' OR organization = '테스트') 
      AND (event_type IS NULL OR event_type = '');
    `);
    
    if (eventTypeResult.rowCount > 0) {
      console.log(`${eventTypeResult.rowCount}명의 사용자 데이터가 업데이트되었습니다.`);
    }
    
    client.release();
  } catch (error) {
    console.error('기존 사용자 데이터 업데이트 실패:', error);
  }
};

// 미들웨어 설정
app.use(cors({
  origin: true, // 모든 origin 허용
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT 토큰 생성
const generateToken = (userId) => {
  return jwt.sign({ userId }, 'your_jwt_secret_key_here', {
    expiresIn: '24h'
  });
};

// 회원가입 API
app.post('/api/auth/register', async (req, res) => {
  try {
    const { user_id, password, name, gender, organization, event_type } = req.body;

    // 필수 필드 검증
    if (!user_id || !password || !name || !gender || !organization || !event_type) {
      return res.status(400).json({
        success: false,
        message: '모든 필드를 입력해주세요.'
      });
    }

    // 사용자 ID 중복 확인
    const existingUser = await pool.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: '이미 존재하는 사용자 ID입니다.'
      });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 등록연도 자동 설정 (현재 년도)
    const registration_year = new Date().getFullYear();

    // 사용자 생성 (role은 기본값 'user'로 설정)
    const result = await pool.query(
      'INSERT INTO users (user_id, password, name, gender, organization, role, event_type, registration_year) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [user_id, hashedPassword, name, gender, organization, 'user', event_type, registration_year]
    );

    const newUser = result.rows[0];

    // JWT 토큰 생성
    const token = generateToken(newUser.user_id);

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: {
        user: {
          id: newUser.id,
          user_id: newUser.user_id,
          name: newUser.name,
          gender: newUser.gender,
          organization: newUser.organization,
          role: newUser.role,
          event_type: newUser.event_type,
          registration_year: newUser.registration_year
        },
        token
      }
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 로그인 API
app.post('/api/auth/login', async (req, res) => {
  try {
    const { user_id, password } = req.body;

    // 필수 필드 검증
    if (!user_id || !password) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID와 비밀번호를 입력해주세요.'
      });
    }

    // 사용자 조회
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: '존재하지 않는 사용자 ID입니다.'
      });
    }

    const user = result.rows[0];

    // 비밀번호 검증
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '비밀번호가 일치하지 않습니다.'
      });
    }

    // JWT 토큰 생성
    const token = generateToken(user.user_id);

    res.json({
      success: true,
      message: '로그인 성공',
      data: {
        user: {
          id: user.id,
          user_id: user.user_id,
          name: user.name,
          gender: user.gender,
          organization: user.organization,
          role: user.role,
          event_type: user.event_type,
          registration_year: user.registration_year
        },
        token
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 소셜 로그인 API
app.post('/api/auth/social-login', async (req, res) => {
  try {
    const { provider, social_id, name, email } = req.body;

    // 필수 필드 검증
    if (!provider || !social_id || !name) {
      return res.status(400).json({
        success: false,
        message: '필수 정보가 누락되었습니다.'
      });
    }

    // 기존 소셜 사용자 조회
    let result = await pool.query(
      'SELECT * FROM users WHERE social_provider = $1 AND social_id = $2',
      [provider, social_id]
    );

    let user = result.rows[0];

    if (!user) {
      // 새로운 소셜 사용자 생성
      const insertResult = await pool.query(
        'INSERT INTO users (user_id, password, name, gender, organization, social_provider, social_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [`${provider}_${social_id}`, '', name, '기타', '개인', provider, social_id]
      );
      user = insertResult.rows[0];
    }

    // JWT 토큰 생성
    const token = generateToken(user.user_id);

    res.json({
      success: true,
      message: '소셜 로그인 성공',
      data: {
        user: {
          id: user.id,
          user_id: user.user_id,
          name: user.name,
          gender: user.gender,
          organization: user.organization,
          social_provider: user.social_provider
        },
        token
      }
    });
  } catch (error) {
    console.error('소셜 로그인 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 토큰 검증 API
app.get('/api/auth/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '토큰이 제공되지 않았습니다.'
      });
    }

    const decoded = jwt.verify(token, 'your_jwt_secret_key_here');
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [decoded.userId]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          user_id: user.user_id,
          name: user.name,
          gender: user.gender,
          organization: user.organization,
          event_type: user.event_type,
          registration_year: user.registration_year
        }
      }
    });
  } catch (error) {
    console.error('토큰 검증 오류:', error);
    res.status(401).json({
      success: false,
      message: '유효하지 않은 토큰입니다.'
    });
  }
});

// 사용자 프로필 조회 API
app.get('/api/user/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '토큰이 제공되지 않았습니다.'
      });
    }

    const decoded = jwt.verify(token, 'your_jwt_secret_key_here');
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [decoded.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        user_id: user.user_id,
        name: user.name,
        gender: user.gender,
        organization: user.organization,
        role: user.role,
        event_type: user.event_type,
        registration_year: user.registration_year
      }
    });
  } catch (error) {
    console.error('사용자 프로필 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'TargetMaster API 서버가 실행 중입니다.',
    version: '1.0.0'
  });
});

// 데이터베이스 초기화 및 서버 시작
let server;

const startServer = async () => {
  try {
    console.log('🔍 데이터베이스 연결 확인 중...');
    // 데이터베이스 연결 테스트
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ 데이터베이스 연결에 실패했습니다. 서버를 시작할 수 없습니다.');
      process.exit(1);
    }
    console.log('✓ PostgreSQL 데이터베이스 연결 성공');

    console.log('🔍 users 테이블 확인 중...');
    // 사용자 테이블 생성
    await createUsersTable();

    console.log('🔍 기존 사용자 데이터 업데이트 중...');
    // 기존 사용자 데이터 업데이트
    await updateExistingUsers();

    // 서버 시작 (0.0.0.0으로 설정하여 모든 네트워크 인터페이스에서 접속 가능)
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
      console.log(`📊 API 문서: http://localhost:${PORT}`);
      console.log(`🔗 프론트엔드: http://localhost:5173`);
      console.log(`📱 모바일 접속: http://[PC IP]:${PORT}`);
      console.log('═══════════════════════════════════════');
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
};

// 그레이스풀 종료 처리
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} 신호 수신: 서버 종료 중...`);
  
  // 서버 종료
  if (server) {
    server.close(() => {
      console.log('HTTP 서버가 종료되었습니다.');
    });
  }

  // 데이터베이스 연결 종료
  try {
    await pool.end();
    console.log('데이터베이스 연결이 종료되었습니다.');
    process.exit(0);
  } catch (error) {
    console.error('데이터베이스 연결 종료 오류:', error);
    process.exit(1);
  }
};

// 종료 시그널 처리
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// 예기치 않은 에러 처리
process.on('uncaughtException', (error) => {
  console.error('처리되지 않은 에러:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('처리되지 않은 Promise 거부:', reason);
  gracefulShutdown('unhandledRejection');
});

startServer();
