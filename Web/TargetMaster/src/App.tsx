import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LogIn, UserPlus } from 'lucide-react'
import Navigation from './components/Navigation'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import ScoreInput from './components/ScoreInput'
import Competition from './components/Competition'
import Footer from './components/Footer'
import { authAPI } from './utils/api'
import './index.css'
import './App.css'

interface User {
  id: number;
  user_id: string;
  name: string;
  gender: string;
  organization: string;
  event_type?: string;
  registration_year?: number;
  social_provider?: string;
}

function App() {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showRegister, setShowRegister] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  const verifyToken = async () => {
    try {
      const response = await authAPI.verifyToken()
      if (response.success && response.data) {
        setUser(response.data.user)
        setIsLoggedIn(true)
      } else {
        localStorage.removeItem('token')
        setIsLoggedIn(false)
      }
    } catch (error) {
      localStorage.removeItem('token')
      setIsLoggedIn(false)
    } finally {
      setIsCheckingAuth(false)
    }
  }

  useEffect(() => {
    // 토큰 검증으로 로그인 상태 확인
    const token = localStorage.getItem('token')
    if (token) {
      verifyToken()
    } else {
      setIsCheckingAuth(false)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId.trim() || !password.trim()) {
      alert('아이디와 비밀번호를 모두 입력해주세요.')
      return
    }

    setLoading(true)
    
    try {
      const response = await authAPI.login(userId.trim(), password)
      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token)
        setUser(response.data.user)
        setIsLoggedIn(true)
      }
    } catch (error: any) {
      alert(error.message || '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    try {
      setLoading(true)
      
      // 데모용 소셜 로그인
      const socialUser = {
        provider,
        social_id: `${provider}_demo_${Date.now()}`,
        name: `${provider} 사용자`,
        email: `${provider}@demo.com`
      }
      
      const response = await authAPI.socialLogin(socialUser)
      
      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token)
        setUser(response.data.user)
        setIsLoggedIn(true)
      }
    } catch (error: any) {
      alert(error.message || `${provider} 로그인에 실패했습니다.`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setUser(null)
    setUserId('')
    setPassword('')
  }

  // 인증 확인 중이거나 로그인 상태면 대시보드 표시
  if (isCheckingAuth || isLoggedIn) {
    if (isCheckingAuth) {
      // 로딩 중이면 기본 레이아웃만 표시 (로딩 화면 제거)
      return (
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
            <Navigation />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<AnalyticsDashboard />} />
                <Route path="/trainings" element={<ScoreInput />} />
                <Route path="/competitions" element={<Competition />} />
                <Route path="/records" element={<AnalyticsDashboard />} />
                <Route path="/analytics" element={<AnalyticsDashboard />} />
                <Route path="/ranking" element={<Competition />} />
                <Route path="/settings" element={<AnalyticsDashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      )
    }
    
    // 로그인 상태
    return (
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
          <Navigation />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<AnalyticsDashboard />} />
              <Route path="/trainings" element={<ScoreInput />} />
              <Route path="/competitions" element={<Competition />} />
              <Route path="/records" element={<AnalyticsDashboard />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/ranking" element={<Competition />} />
              <Route path="/settings" element={<AnalyticsDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 상단 네비게이션 */}
      <nav className="flex justify-between items-center p-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* 활 */}
                <path d="M8 20C8 20 12 8 20 8C28 8 32 20 32 20" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M8 20C8 20 12 32 20 32C28 32 32 20 32 20" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                
                {/* 화살 */}
                <path d="M20 6L20 34" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M18 8L20 6L22 8" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <path d="M18 32L20 34L22 32" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" fill="none"/>
                
                {/* 화살 끝 */}
                <path d="M16 18L20 22L24 18" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-purple-600">TargetMaster</span>
          </div>
      </nav>

      {/* 메인 콘텐츠 - PC에서는 2열 레이아웃 */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 왼쪽: 로고 섹션 */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 bg-purple-600 rounded-2xl lg:rounded-3xl mb-8">
              <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* 활 */}
                <path d="M8 20C8 20 12 8 20 8C28 8 32 20 32 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M8 20C8 20 12 32 20 32C28 32 32 20 32 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                
                {/* 화살 */}
                <path d="M20 6L20 34" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M18 8L20 6L22 8" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <path d="M18 32L20 34L22 32" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                
                {/* 화살 끝 */}
                <path d="M16 18L20 22L24 18" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-purple-600 mb-4">TargetMaster</h1>
            <p className="text-xl lg:text-2xl text-gray-700">양궁 훈련 관리 시스템</p>
          </div>

          {/* 오른쪽: 로그인 폼 */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">로그인</h2>
              
              {/* 이메일 로그인 폼 */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                    아이디
                  </label>
                  <input
                    id="userId"
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    placeholder="아이디를 입력하세요"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    placeholder="비밀번호를 입력하세요"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>로그인 중...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      <span>로그인</span>
                    </>
                  )}
                </button>
              </form>

              {/* 회원가입 링크 - 로그인 버튼 바로 아래 */}
              <div className="mt-8 pb-8 border-b border-gray-200 text-center text-sm">
                <span className="text-gray-600">계정이 없으신가요? </span>
                <button
                  onClick={() => setShowRegister(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                >
                  계정생성
                </button>
              </div>

              {/* 소셜 로그인 - 하단에 배치 */}
              <div className="mt-12 space-y-6">
                <button
                  onClick={() => handleSocialLogin('naver')}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-green-600 text-white font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-200"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <span className="font-bold text-lg mr-2">N</span>
                      <span>네이버로 로그인</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleSocialLogin('kakao')}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-yellow-400 text-gray-700 font-medium hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 transition-all duration-200"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-800"></div>
                  ) : (
                    <>
                      <span className="font-bold mr-2">카</span>
                      <span>카카오로 로그인</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 회원가입 모달 */}
      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">회원가입</h2>
            
            <RegisterForm 
              onClose={() => setShowRegister(false)}
              onSuccess={(userData, token) => {
                setShowRegister(false)
                // 토큰 저장 및 자동 로그인
                localStorage.setItem('token', token)
                setUser(userData)
                setIsLoggedIn(true)
                alert('회원가입이 완료되었습니다.')
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// 회원가입 폼 컴포넌트
interface RegisterFormProps {
  onClose: () => void
  onSuccess: (userData: User, token: string) => void
}

function RegisterForm({ onClose, onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    user_id: '',
    password: '',
    confirmPassword: '',
    name: '',
    gender: '',
    organization: '',
    event_type: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.user_id || !formData.password || !formData.name || !formData.gender || !formData.organization || !formData.event_type) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }

    if (formData.password.length < 6) {
      alert('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    setLoading(true)

    try {
      const response = await authAPI.register({
        user_id: formData.user_id,
        password: formData.password,
        name: formData.name,
        gender: formData.gender,
        organization: formData.organization,
        event_type: formData.event_type
      })

      if (response.success && response.data) {
        // userData와 token 전달
        onSuccess(response.data.user, response.data.token)
      }
    } catch (error: any) {
      alert(error.message || '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-1">
          아이디 *
        </label>
        <input
          id="user_id"
          name="user_id"
          type="text"
          value={formData.user_id}
          onChange={handleChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="아이디를 입력하세요"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          비밀번호 *
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="비밀번호를 입력하세요 (6자 이상)"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          비밀번호 확인 *
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="비밀번호를 다시 입력하세요"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          이름 *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="이름을 입력하세요"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
          성별 *
        </label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={loading}
        >
          <option value="">성별을 선택하세요</option>
          <option value="남성">남성</option>
          <option value="여성">여성</option>
          <option value="기타">기타</option>
        </select>
      </div>

      <div>
        <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
          소속 *
        </label>
        <input
          id="organization"
          name="organization"
          type="text"
          value={formData.organization}
          onChange={handleChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="소속을 입력하세요"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 mb-1">
          종목 *
        </label>
        <select
          id="event_type"
          name="event_type"
          value={formData.event_type}
          onChange={handleChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={loading}
        >
          <option value="">종목을 선택하세요</option>
          <option value="베어보우">베어보우</option>
          <option value="리커브">리커브</option>
          <option value="컴파운드">컴파운드</option>
        </select>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          disabled={loading}
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          {loading ? '가입 중...' : '회원가입'}
        </button>
      </div>
    </form>
  )
}

export default App