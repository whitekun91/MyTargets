import { useState } from 'react'

const navigation = [
  { name: '훈련', href: '/trainings', icon: '🏹' },
  { name: '경기', href: '/competitions', icon: '🎯' },
  { name: '기록', href: '/records', icon: '📝' },
  { name: '분석', href: '/analytics', icon: '📊' },
  { name: '랭킹', href: '/ranking', icon: '🏆' },
  { name: '설정', href: '/settings', icon: '⚙️' },
]

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userName')
    localStorage.removeItem('userOrganization')
    window.location.reload()
  }

  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row justify-between items-center h-16">
          {/* 왼쪽: 로고 + 메뉴들 */}
          <div className="flex items-center space-x-8">
            {/* 로고 */}
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all">
                <svg className="h-6 w-6 text-white" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <span className="text-xl font-bold text-gradient">TargetMaster</span>
            </div>

            {/* 네비게이션 메뉴들 */}
            <div className="flex flex-row space-x-4 items-center">
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

          {/* 오른쪽: 로그아웃 버튼 */}
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="nav-link flex items-center space-x-1 px-3 py-2 text-sm font-medium whitespace-nowrap hover:bg-red-50 hover:text-red-600"
            >
              <span className="text-base">🚪</span>
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
