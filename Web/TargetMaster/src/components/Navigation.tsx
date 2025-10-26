import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const navigation = [
  { name: '훈련', href: '/trainings', icon: '🏹' },
  { name: '경기', href: '/competitions', icon: '🎯' },
  { name: '분석', href: '/analytics', icon: '📊' },
  { name: '랭킹', href: '/ranking', icon: '🏆' },
  { name: '설정', href: '/settings', icon: '⚙️' },
]

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.reload()
  }

  const handleLogoClick = () => {
    navigate('/')
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  return (
    <>
      <nav className="nav-glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-row justify-between items-center h-16">
            {/* 왼쪽: 로고 */}
            <div className="flex items-center space-x-4">
              <div 
                className="flex items-center space-x-3 cursor-pointer transition-all hover:scale-105 active:scale-100" 
                onClick={handleLogoClick}
                style={{ cursor: 'pointer' }}
              >
                <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="12" fill="url(#logoGradient)"/>
                  <path d="M8 20C8 20 12 8 20 8C28 8 32 20 32 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  <path d="M8 20C8 20 12 32 20 32C28 32 32 20 32 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  <path d="M20 6L20 34" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M18 8L20 6L22 8" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <path d="M18 32L20 34L22 32" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <path d="M16 18L20 22L24 18" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <defs>
                    <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#2563eb"/>
                      <stop offset="100%" stopColor="#9333ea"/>
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-base sm:text-xl font-bold text-gradient">TargetMaster</span>
              </div>

              {/* 네비게이션 메뉴들 (데스크톱) */}
              <div className="hidden custom-breakpoint:flex flex-row space-x-4 items-center">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="nav-link flex items-center space-x-1 px-3 py-2 text-sm font-medium whitespace-nowrap"
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* 오른쪽: 로그아웃 버튼 + 햄버거 버튼 */}
            <div className="flex items-center space-x-4">
              {/* 로그아웃 버튼 (데스크톱) */}
              <button
                onClick={handleLogout}
                className="hidden custom-breakpoint:flex nav-link items-center space-x-1 px-3 py-2 text-sm font-medium whitespace-nowrap hover:bg-red-50 hover:text-red-600"
              >
                <span className="text-base">🚪</span>
                <span>로그아웃</span>
              </button>

              {/* 햄버거 버튼 (모바일) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="custom-breakpoint:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

            {/* 모바일 사이드바 (전체 화면 모달) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50">
          <div className="flex flex-col h-full">
            {/* 상단 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">메뉴</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 메뉴 항목들 */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </a>
              ))}
            </div>

            {/* 하단 로그아웃 버튼 */}
            <div className="border-t border-gray-200 px-6 py-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-3 px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <span className="text-xl">🚪</span>
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
