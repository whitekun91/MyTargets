import { useState, useEffect } from 'react'
import { authAPI } from '../utils/api'

// 원형 그래프 컴포넌트
interface CircularGaugeProps {
  value: number
  max: number
  label: string
  color: 'orange' | 'green' | 'blue'
  className?: string
}

function CircularGauge({ value, max, label, color }: CircularGaugeProps) {
  const percentage = (value / max) * 100
  const circumference = 2 * Math.PI * 52 // radius = 52

  const gradientId = `${color}Gradient`
  const colorClass = color === 'orange' ? 'text-orange-600' : color === 'green' ? 'text-green-600' : 'text-blue-600'

  const getGradient = () => {
    switch (color) {
      case 'orange':
        return (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        )
      case 'green':
        return (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        )
      case 'blue':
        return (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        )
    }
  }

  return (
    <div className="flex-shrink-0 flex justify-center items-center" style={{ minWidth: '80px' }}>
      <div className="relative mx-auto mb-2 sm:mb-4" style={{ width: 'clamp(100px, 15vw, 150px)', height: 'clamp(100px, 15vw, 150px)' }}>
        <svg className="transform rotate-90" viewBox="0 0 128 128" style={{ width: '100%', height: '100%' }}>
          <circle
            cx="64"
            cy="64"
            r="52"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
            className="sm:stroke-[11] md:stroke-[12]"
          />
          <circle
            cx="64"
            cy="64"
            r="52"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="10"
            className="sm:stroke-[11] md:stroke-[12]"
            strokeDasharray={`${(percentage / 100) * circumference} ${circumference}`}
            strokeLinecap="round"
            style={{ strokeDashoffset: 0, transition: 'stroke-dasharray 0.3s ease' }}
          />
          <defs>
            {getGradient()}
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${colorClass}`}>
              {color === 'blue' ? value : percentage.toFixed(color === 'green' ? 0 : 2)}{color === 'green' ? '%' : ''}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{label}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface AnalyticsData {
  basicStatistics: {
    totalShots: number
    averageScore: number
    accuracy: number
  }
}

interface RankingPlayer {
  rank: number
  name: string
  organization: string
  averageScore: number
  highestScore: number
  winRate: number
}

interface CareerStatistics {
  year: number
  eventType: string
  averageScore: number
  winLossFrequency: string
  winRate: number
  highestScore: number
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState({ name: '', organization: '', gender: '', event_type: '', registration_year: new Date().getFullYear() })
  const [rankingData, setRankingData] = useState<RankingPlayer[]>([])
  const [careerStats, setCareerStats] = useState<CareerStatistics[]>([])

  useEffect(() => {
    // 사용자 정보 가져오기
    const fetchUserInfo = async () => {
      try {
        const response = await authAPI.getUserProfile()
        if (response.success && response.data?.user) {
          setUserInfo({ 
            name: response.data.user.name, 
            organization: response.data.user.organization, 
            gender: response.data.user.gender,
            event_type: response.data.user.event_type || '',
            registration_year: response.data.user.registration_year || new Date().getFullYear()
          })
        } else if (response.success && (response as any).user) {
          // 서버가 data 없이 user를 직접 반환하는 경우 대비
          const userData = (response as any).user
          setUserInfo({ 
            name: userData.name, 
            organization: userData.organization, 
            gender: userData.gender,
            event_type: userData.event_type || '',
            registration_year: userData.registration_year || new Date().getFullYear()
          })
        }
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error)
      }
    }
    
    fetchUserInfo()
  }, [])

  useEffect(() => {
    // 랭킹 데이터 가져오기
    const mockRanking: RankingPlayer[] = [
      { rank: 1, name: '김철수', organization: '서울양궁클럽', averageScore: 9.5, highestScore: 720, winRate: 85.3 },
      { rank: 2, name: '이영희', organization: '부산양궁클럽', averageScore: 9.3, highestScore: 710, winRate: 82.1 },
      { rank: 3, name: '박민수', organization: '대구양궁클럽', averageScore: 9.1, highestScore: 705, winRate: 78.9 },
      { rank: 4, name: userInfo.name, organization: userInfo.organization, averageScore: 8.2, highestScore: 680, winRate: 75.0 },
      { rank: 5, name: '정수진', organization: '인천양궁클럽', averageScore: 8.0, highestScore: 675, winRate: 72.5 },
    ]
    setRankingData(mockRanking)
  }, [userInfo.name])

  useEffect(() => {
    // 커리어 통계 데이터 가져오기
    const mockCareerStats: CareerStatistics[] = [
      { year: 2025, eventType: '리커브', averageScore: 9.51, winLossFrequency: '7-2', winRate: 77.78, highestScore: 360 },
      { year: 2024, eventType: '리커브', averageScore: 9.35, winLossFrequency: '12-6', winRate: 66.67, highestScore: 360 },
      { year: 2023, eventType: '리커브', averageScore: 9.39, winLossFrequency: '5-3', winRate: 62.50, highestScore: 360 },
      { year: 2022, eventType: '리커브', averageScore: 9.33, winLossFrequency: '6-4', winRate: 60.00, highestScore: 360 },
      { year: 2021, eventType: '리커브', averageScore: 9.76, winLossFrequency: '6-1', winRate: 85.71, highestScore: 360 },
    ]
    setCareerStats(mockCareerStats)
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // 임시 데이터 (실제로는 API 호출)
      const mockData: AnalyticsData = {
        basicStatistics: {
          totalShots: 450,
          averageScore: 8.2,
          accuracy: 78.5
        }
      }
      
      setTimeout(() => {
        setAnalyticsData(mockData)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('분석 데이터 조회 오류:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">분석 데이터가 없습니다</h3>
        <p className="text-gray-500 mb-4">훈련 기록을 추가한 후 분석을 확인해보세요.</p>
        <button onClick={fetchAnalytics} className="btn-modern">분석 새로고침</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        {/* 플레이어 정보 및 통계 카드 */}
        <div className="bg-white rounded-2xl shadow-lg px-4 sm:px-8 py-8 sm:py-12 mb-8">
          
            <div className="flex flex-col custom-breakpoint:flex-row items-start gap-6 custom-breakpoint:gap-8">
              {/* 플레이어 프로필 */}
              <div className="flex items-center gap-6 sm:gap-8 lg:gap-10 flex-1 w-full custom-breakpoint:w-auto">
               <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-3xl sm:text-4xl lg:text-5xl font-bold flex-shrink-0">
                 {userInfo.name.charAt(0)}
               </div>
               <div className="flex-1">
                 <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{userInfo.name} 선수</h2>
                 <div className="space-y-2.5">
                                       <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-gray-700">
                      <span className="font-semibold min-w-[50px] sm:min-w-[70px]">종목:</span>
                      <span className="px-3 sm:px-4 py-1.5 bg-gray-100 rounded-md text-sm sm:text-base">{userInfo.event_type || '선택안함'}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-gray-700">
                      <span className="font-semibold min-w-[50px] sm:min-w-[70px]">등록연도:</span>
                      <span className="text-sm sm:text-base">{userInfo.registration_year}</span>
                    </div>
                   <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-gray-700">
                     <span className="font-semibold min-w-[50px] sm:min-w-[70px]">소속:</span>
                     <span className="text-sm sm:text-base">{userInfo.organization}</span>
                   </div>
                 </div>
               </div>
             </div>

                                                                    {/* 2025년도 통계 */}
                            <div className="flex-1 w-full">
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6">{new Date().getFullYear()}년도 기록</h3>
                               <div className="flex flex-row gap-4 sm:gap-8 md:gap-12 justify-center items-center">
                  <CircularGauge
                    value={analyticsData.basicStatistics.averageScore}
                    max={720}
                    label="평균점수"
                    color="orange"
                  />
                  <CircularGauge
                    value={analyticsData.basicStatistics.accuracy}
                    max={100}
                    label="평균승률"
                    color="green"
                  />
                  <CircularGauge
                    value={analyticsData.basicStatistics.totalShots}
                    max={360}
                    label="예선 최고점"
                    color="blue"
                  />
                </div>
              </div>
            </div>
          </div>

                 {/* 커리어 점수 통계 */}
         <div className="bg-white rounded-2xl shadow-lg px-4 sm:px-8 pt-2 sm:pt-4 pb-5 mb-8">
           <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 flex items-center gap-2 pl-4 sm:pl-8 pt-6 sm:pt-8 mt-8 sm:mt-10">
             <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
             </svg>
             커리어 점수 통계
           </h2>
           <div className="overflow-x-auto px-4 pb-8 sm:pb-10">
             <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">연도</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">종목별</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">평균 점수</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">승패 빈도</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">승률</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">최고 점수</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {careerStats.map((stat, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 text-center">{stat.year}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 text-center">{stat.eventType}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900 text-center">{stat.averageScore.toFixed(2)}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 text-center">{stat.winLossFrequency}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-green-600 text-center">{stat.winRate.toFixed(2)}%</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 text-center">{stat.highestScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

                 {/* 랭킹 섹션 */}
         <div className="bg-white rounded-2xl shadow-lg px-4 sm:px-8 pt-2 sm:pt-4 pb-5">
           <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 pl-4 sm:pl-8 pt-6 sm:pt-8 mt-8 sm:mt-10">🏆 랭킹</h2>
           <div className="overflow-x-auto px-4 pb-8 sm:pb-10">
                           <table className="w-full min-w-[600px]">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">순위</th>
                   <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">이름</th>
                   <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">소속</th>
                   <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">평균 점수</th>
                   <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">최고 점수</th>
                   <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">승률</th>
                 </tr>
               </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rankingData.map((player) => (
                  <tr 
                    key={player.rank} 
                    className={player.name === userInfo.name ? 'bg-purple-50' : 'hover:bg-gray-50'}
                  >
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-center">
                      <span className={`text-base sm:text-xl md:text-2xl lg:text-3xl font-bold ${
                        player.rank === 1 ? 'text-yellow-500' :
                        player.rank === 2 ? 'text-gray-400' :
                        player.rank === 3 ? 'text-orange-600' : 'text-gray-700'
                      }`}>
                        {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <div className="text-xs sm:text-sm md:text-base font-medium text-gray-900">
                          {player.name}
                          {player.name === userInfo.name && (
                            <span className="ml-1 sm:ml-1.5 md:ml-2 px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 bg-purple-600 text-white text-[9px] sm:text-[11px] md:text-xs rounded-full">나</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm md:text-base text-gray-600 text-center">{player.organization}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm md:text-base font-semibold text-gray-900 text-center">{player.averageScore.toFixed(2)}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm md:text-base text-gray-600 text-center">{player.highestScore}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm md:text-base font-semibold text-green-600 text-center">{player.winRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
