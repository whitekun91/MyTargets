import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import Navigation from './components/Navigation'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import ScoreInput from './components/ScoreInput'
import Competition from './components/Competition'
import Footer from './components/Footer'
import './index.css'

function App() {
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // 로그인 상태 확인
    const savedLogin = localStorage.getItem('isLoggedIn')
    if (savedLogin === 'true') {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !organization.trim()) {
      alert('이름과 소속을 모두 입력해주세요.')
      return
    }

    setLoading(true)
    
    // 로컬 스토리지에 사용자 정보 저장
    localStorage.setItem('userName', name.trim())
    localStorage.setItem('userOrganization', organization.trim())
    localStorage.setItem('isLoggedIn', 'true')
    
    // 잠시 후 로그인 상태 변경
    setTimeout(() => {
      setLoading(false)
      setIsLoggedIn(true)
    }, 1000)
  }

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userName')
    localStorage.removeItem('userOrganization')
    setIsLoggedIn(false)
    setName('')
    setOrganization('')
  }

  if (isLoggedIn) {
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
              <p className="text-gray-600 mb-8 text-center">이름과 소속을 입력하여 시작하세요</p>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    placeholder="이름을 입력하세요"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                    소속
                  </label>
                  <input
                    id="organization"
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    placeholder="소속을 입력하세요"
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
                      <span>시작하기</span>
                    </>
                  )}
        </button>
              </form>

              {/* 추가 정보 */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  로그인하면 훈련 기록과 분석 기능을 사용할 수 있습니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App