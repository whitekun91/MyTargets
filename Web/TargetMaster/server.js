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

// training 테이블 생성
const createTrainingTable = async () => {
  try {
    const client = await pool.connect();
    
    // 기존 테이블 존재 여부 확인
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'training'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    
    if (tableExists) {
      console.log('✓ training 테이블이 이미 존재합니다.');
    } else {
      console.log('⚠ training 테이블이 없습니다. 테이블을 생성합니다...');
    }
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS training (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        organization VARCHAR(100) NOT NULL,
        session_name VARCHAR(100) NOT NULL,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        distance INTEGER,
        target_type VARCHAR(100),
        arrow_count INTEGER DEFAULT 6,
        current_round INTEGER DEFAULT 1,
        total_score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await client.query(createTableQuery);
    
    if (!tableExists) {
      console.log('✓ training 테이블이 성공적으로 생성되었습니다.');
    } else {
      // 기존 테이블에서 사용하지 않는 컬럼들 삭제
      try {
        // weather 컬럼 삭제
        await client.query(`
          ALTER TABLE training DROP COLUMN IF EXISTS weather;
        `);
        console.log('✓ weather 컬럼 삭제 완료');
      } catch (error) {
        console.log('weather 컬럼 삭제 시도 (이미 삭제되었을 수 있음):', error.message);
      }
      
      try {
        // wind 컬럼 삭제
        await client.query(`
          ALTER TABLE training DROP COLUMN IF EXISTS wind;
        `);
        console.log('✓ wind 컬럼 삭제 완료');
      } catch (error) {
        console.log('wind 컬럼 삭제 시도 (이미 삭제되었을 수 있음):', error.message);
      }
      
      try {
        // total_rounds 컬럼 삭제
        await client.query(`
          ALTER TABLE training DROP COLUMN IF EXISTS total_rounds;
        `);
        console.log('✓ total_rounds 컬럼 삭제 완료');
      } catch (error) {
        console.log('total_rounds 컬럼 삭제 시도 (이미 삭제되었을 수 있음):', error.message);
      }
      
      try {
        // arrow_count 컬럼 추가
        await client.query(`
          ALTER TABLE training ADD COLUMN IF NOT EXISTS arrow_count INTEGER DEFAULT 6;
        `);
        console.log('✓ arrow_count 컬럼 추가 완료');
      } catch (error) {
        console.log('arrow_count 컬럼 추가 시도 (이미 존재할 수 있음):', error.message);
      }
    }
    
    client.release();
  } catch (error) {
    console.error('training 테이블 생성 실패:', error);
    throw error;
  }
};

// training_scores 테이블 생성 (개별 점수 기록용)
const createTrainingScoresTable = async () => {
  try {
    const client = await pool.connect();
    
    // 기존 테이블 존재 여부 확인
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'training_scores'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    
    if (tableExists) {
      console.log('✓ training_scores 테이블이 이미 존재합니다.');
    } else {
      console.log('⚠ training_scores 테이블이 없습니다. 테이블을 생성합니다...');
    }
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS training_scores (
        id SERIAL PRIMARY KEY,
        training_id INTEGER NOT NULL REFERENCES training(id) ON DELETE CASCADE,
        round_number INTEGER NOT NULL,
        score INTEGER NOT NULL,
        arrow_number INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await client.query(createTableQuery);
    
    if (!tableExists) {
      console.log('✓ training_scores 테이블이 성공적으로 생성되었습니다.');
    }
    
    client.release();
  } catch (error) {
    console.error('training_scores 테이블 생성 실패:', error);
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

// 훈련 세션 생성 API
app.post('/api/training/session', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '토큰이 제공되지 않았습니다.'
      });
    }

    const decoded = jwt.verify(token, 'your_jwt_secret_key_here');
    const userResult = await pool.query('SELECT * FROM users WHERE user_id = $1', [decoded.userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    const user = userResult.rows[0];
    const { session_name, distance, target_type, arrow_count } = req.body;

    // 필수 필드 검증
    if (!session_name) {
      return res.status(400).json({
        success: false,
        message: '세션 이름을 입력해주세요.'
      });
    }

    // 훈련 세션 생성
    const result = await pool.query(
      `INSERT INTO training (user_id, name, organization, session_name, distance, target_type, arrow_count) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [user.id, user.name, user.organization, session_name, distance, target_type, arrow_count || 6]
    );

    const newSession = result.rows[0];

    res.status(201).json({
      success: true,
      message: '훈련 세션이 생성되었습니다.',
      data: {
        session: {
          id: newSession.id,
          session_name: newSession.session_name,
          name: newSession.name,
          organization: newSession.organization,
          date: newSession.date,
          distance: newSession.distance,
          target_type: newSession.target_type,
          arrow_count: newSession.arrow_count,
          current_round: newSession.current_round,
          total_score: newSession.total_score
        }
      }
    });
  } catch (error) {
    console.error('훈련 세션 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 훈련 세션 조회 API
app.get('/api/training/session/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '토큰이 제공되지 않았습니다.'
      });
    }

    const decoded = jwt.verify(token, 'your_jwt_secret_key_here');
    const sessionId = req.params.id;

    const result = await pool.query(
      'SELECT * FROM training WHERE id = $1 AND user_id = (SELECT id FROM users WHERE user_id = $2)',
      [sessionId, decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '훈련 세션을 찾을 수 없습니다.'
      });
    }

    const session = result.rows[0];

    res.json({
      success: true,
      data: {
        session: {
          id: session.id,
          session_name: session.session_name,
          name: session.name,
          organization: session.organization,
          date: session.date,
          distance: session.distance,
          target_type: session.target_type,
          arrow_count: session.arrow_count,
          current_round: session.current_round,
          total_score: session.total_score
        }
      }
    });
  } catch (error) {
    console.error('훈련 세션 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 점수 기록 API
app.post('/api/training/score', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '토큰이 제공되지 않았습니다.'
      });
    }

    const decoded = jwt.verify(token, 'your_jwt_secret_key_here');
    const { training_id, round_number, score, arrow_number } = req.body;

    // 필수 필드 검증
    if (!training_id || !round_number || score === undefined) {
      return res.status(400).json({
        success: false,
        message: '필수 정보가 누락되었습니다.'
      });
    }

    // 훈련 세션 존재 확인
    const sessionResult = await pool.query(
      'SELECT * FROM training WHERE id = $1 AND user_id = (SELECT id FROM users WHERE user_id = $2)',
      [training_id, decoded.userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '훈련 세션을 찾을 수 없습니다.'
      });
    }

    // 점수 기록
    const scoreResult = await pool.query(
      'INSERT INTO training_scores (training_id, round_number, score, arrow_number) VALUES ($1, $2, $3, $4) RETURNING *',
      [training_id, round_number, score, arrow_number]
    );

    // 훈련 세션의 총 점수 업데이트
    const totalScoreResult = await pool.query(
      'SELECT SUM(score) as total FROM training_scores WHERE training_id = $1',
      [training_id]
    );

    const newTotalScore = totalScoreResult.rows[0].total || 0;

    await pool.query(
      'UPDATE training SET total_score = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newTotalScore, training_id]
    );

    res.status(201).json({
      success: true,
      message: '점수가 기록되었습니다.',
      data: {
        score: {
          id: scoreResult.rows[0].id,
          training_id: training_id,
          round_number: round_number,
          score: score,
          arrow_number: arrow_number,
          total_score: newTotalScore
        }
      }
    });
  } catch (error) {
    console.error('점수 기록 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 점수 삭제 API
app.delete('/api/training/scores/:trainingId/:roundNumber/:arrowNumber', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '토큰이 제공되지 않았습니다.'
      });
    }

    const decoded = jwt.verify(token, 'your_jwt_secret_key_here');
    const { trainingId, roundNumber, arrowNumber } = req.params;

    // 훈련 세션 소유권 확인
    const sessionResult = await pool.query(
      'SELECT id FROM training WHERE id = $1 AND user_id = (SELECT id FROM users WHERE user_id = $2)',
      [trainingId, decoded.userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '훈련 세션을 찾을 수 없습니다.'
      });
    }

    // 해당 화살의 점수 삭제
    await pool.query(
      'DELETE FROM training_scores WHERE training_id = $1 AND round_number = $2 AND arrow_number = $3',
      [trainingId, roundNumber, arrowNumber]
    );

    // 훈련 세션의 총 점수 업데이트
    const totalScoreResult = await pool.query(
      'SELECT SUM(score) as total FROM training_scores WHERE training_id = $1',
      [trainingId]
    );

    const newTotalScore = totalScoreResult.rows[0].total || 0;

    await pool.query(
      'UPDATE training SET total_score = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newTotalScore, trainingId]
    );

    res.json({
      success: true,
      message: '점수가 삭제되었습니다.',
      data: {
        total_score: newTotalScore
      }
    });
  } catch (error) {
    console.error('점수 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '점수 삭제 중 오류가 발생했습니다.'
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

    console.log('🔍 training 테이블 확인 중...');
    // training 테이블 생성
    await createTrainingTable();

    console.log('🔍 training_scores 테이블 확인 중...');
    // training_scores 테이블 생성
    await createTrainingScoresTable();

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

// 사용자의 모든 훈련 세션 조회
app.get('/api/training/sessions', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '토큰이 제공되지 않았습니다.'
      });
    }

    const decoded = jwt.verify(token, 'your_jwt_secret_key_here');

    // 사용자의 모든 훈련 세션 조회 (최신순)
    const result = await pool.query(
      'SELECT * FROM training WHERE user_id = (SELECT id FROM users WHERE user_id = $1) ORDER BY created_at DESC',
      [decoded.userId]
    );

    res.json({
      success: true,
      data: {
        sessions: result.rows.map(session => ({
          id: session.id,
          session_name: session.session_name,
          name: session.name,
          organization: session.organization,
          date: session.date,
          distance: session.distance,
          target_type: session.target_type,
          arrow_count: session.arrow_count,
          current_round: session.current_round,
          total_score: session.total_score,
          created_at: session.created_at
        }))
      }
    });
  } catch (error) {
    console.error('훈련 세션 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '훈련 세션 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

// 특정 라운드의 점수 조회
app.get('/api/training/scores/:trainingId/:roundNumber', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '토큰이 제공되지 않았습니다.'
      });
    }

    const decoded = jwt.verify(token, 'your_jwt_secret_key_here');
    const { trainingId, roundNumber } = req.params;

    // 훈련 세션 소유권 확인
    const sessionResult = await pool.query(
      'SELECT id FROM training WHERE id = $1 AND user_id = (SELECT id FROM users WHERE user_id = $2)',
      [trainingId, decoded.userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '훈련 세션을 찾을 수 없습니다.'
      });
    }

    // 해당 라운드의 점수 조회
    const scoresResult = await pool.query(
      'SELECT * FROM training_scores WHERE training_id = $1 AND round_number = $2 ORDER BY arrow_number',
      [trainingId, roundNumber]
    );

    res.json({
      success: true,
      data: {
        scores: scoresResult.rows
      }
    });
  } catch (error) {
    console.error('점수 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '점수 조회 중 오류가 발생했습니다.'
    });
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('처리되지 않은 Promise 거부:', reason);
  gracefulShutdown('unhandledRejection');
});

startServer();
